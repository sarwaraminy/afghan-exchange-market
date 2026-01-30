import { Request, Response } from 'express';
import db from '../config/database';
import { Hawaladar, HawalaTransaction, HawalaTransactionWithDetails } from '../types';
import {
  generateReferenceCode,
  logAuditEvent,
  logTransactionHistory,
  validateTransactionLimits,
  isTransactionExpired,
  calculateExpirationDate,
  validateImmutableFields
} from '../utils/hawalaHelpers';
import {
  isValidStatusTransition,
  getInvalidTransitionMessage,
  TransactionStatus
} from '../utils/statusValidation';

// ==================== HAWALADARS (AGENTS) ====================

export const getHawaladars = (req: Request, res: Response): void => {
  try {
    const { active_only, province_id, district_id } = req.query;
    let query = `
      SELECT
        h.*,
        p.name as province_name,
        p.name_fa as province_name_fa,
        p.name_ps as province_name_ps,
        d.name as district_name,
        d.name_fa as district_name_fa,
        d.name_ps as district_name_ps
      FROM hawaladars h
      LEFT JOIN provinces p ON h.province_id = p.id
      LEFT JOIN districts d ON h.district_id = d.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (active_only === 'true') {
      query += ' AND h.is_active = 1';
    }
    if (province_id) {
      query += ' AND h.province_id = ?';
      params.push(province_id);
    }
    if (district_id) {
      query += ' AND h.district_id = ?';
      params.push(district_id);
    }

    query += ' ORDER BY h.name';

    const hawaladars = db.prepare(query).all(...params);
    res.json({ success: true, data: hawaladars });
  } catch (error) {
    console.error('Get hawaladars error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch hawaladars' });
  }
};

export const getHawaladarById = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const hawaladar = db.prepare('SELECT * FROM hawaladars WHERE id = ?').get(id) as Hawaladar | undefined;

    if (!hawaladar) {
      res.status(404).json({ success: false, error: 'Hawaladar not found' });
      return;
    }

    res.json({ success: true, data: hawaladar });
  } catch (error) {
    console.error('Get hawaladar error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch hawaladar' });
  }
};

export const createHawaladar = (req: Request, res: Response): void => {
  try {
    const { name, name_fa, name_ps, phone, province_id, district_id, location, location_fa, location_ps, floor_number, shop_number, commission_rate } = req.body;

    const result = db.prepare(`
      INSERT INTO hawaladars (name, name_fa, name_ps, phone, province_id, district_id, location, location_fa, location_ps, floor_number, shop_number, commission_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      name_fa || null,
      name_ps || null,
      phone || null,
      province_id || null,
      district_id || null,
      location,
      location_fa || null,
      location_ps || null,
      floor_number || null,
      shop_number || null,
      commission_rate || 2.0
    );

    const newHawaladar = db.prepare(`
      SELECT
        h.*,
        p.name as province_name,
        d.name as district_name
      FROM hawaladars h
      LEFT JOIN provinces p ON h.province_id = p.id
      LEFT JOIN districts d ON h.district_id = d.id
      WHERE h.id = ?
    `).get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newHawaladar });
  } catch (error) {
    console.error('Create hawaladar error:', error);
    res.status(500).json({ success: false, error: 'Failed to create hawaladar' });
  }
};

export const updateHawaladar = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { name, name_fa, name_ps, phone, province_id, district_id, location, location_fa, location_ps, floor_number, shop_number, commission_rate, is_active } = req.body;

    const existing = db.prepare('SELECT id FROM hawaladars WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Hawaladar not found' });
      return;
    }

    db.prepare(`
      UPDATE hawaladars
      SET name = ?, name_fa = ?, name_ps = ?, phone = ?, province_id = ?, district_id = ?,
          location = ?, location_fa = ?, location_ps = ?, floor_number = ?, shop_number = ?,
          commission_rate = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      name_fa || null,
      name_ps || null,
      phone || null,
      province_id || null,
      district_id || null,
      location,
      location_fa || null,
      location_ps || null,
      floor_number || null,
      shop_number || null,
      commission_rate || 2.0,
      is_active !== undefined ? is_active : 1,
      id
    );

    const updatedHawaladar = db.prepare(`
      SELECT
        h.*,
        p.name as province_name,
        d.name as district_name
      FROM hawaladars h
      LEFT JOIN provinces p ON h.province_id = p.id
      LEFT JOIN districts d ON h.district_id = d.id
      WHERE h.id = ?
    `).get(id);
    res.json({ success: true, data: updatedHawaladar });
  } catch (error) {
    console.error('Update hawaladar error:', error);
    res.status(500).json({ success: false, error: 'Failed to update hawaladar' });
  }
};

export const deleteHawaladar = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT id FROM hawaladars WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Hawaladar not found' });
      return;
    }

    // Check if hawaladar has any transactions
    const hasTransactions = db.prepare(`
      SELECT id FROM hawala_transactions
      WHERE sender_hawaladar_id = ? OR receiver_hawaladar_id = ?
      LIMIT 1
    `).get(id, id);

    if (hasTransactions) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete hawaladar with existing transactions. Deactivate instead.'
      });
      return;
    }

    db.prepare('DELETE FROM hawaladars WHERE id = ?').run(id);
    res.json({ success: true, message: 'Hawaladar deleted successfully' });
  } catch (error) {
    console.error('Delete hawaladar error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete hawaladar' });
  }
};

// ==================== HAWALA TRANSACTIONS ====================

export const getTransactions = (req: Request, res: Response): void => {
  try {
    const {
      status,
      sender_hawaladar_id,
      receiver_hawaladar_id,
      province_id,
      district_id,
      limit,
      offset
    } = req.query;

    let query = `
      SELECT
        ht.*,
        sh.name as sender_hawaladar_name,
        sh.name_fa as sender_hawaladar_name_fa,
        sh.name_ps as sender_hawaladar_name_ps,
        sh.location as sender_hawaladar_location,
        sh.location_fa as sender_hawaladar_location_fa,
        sh.location_ps as sender_hawaladar_location_ps,
        sh.floor_number as sender_hawaladar_floor_number,
        sh.shop_number as sender_hawaladar_shop_number,
        sh.phone as sender_hawaladar_phone,
        sh.province_id as sender_province_id,
        sh.district_id as sender_district_id,
        sp.name as sender_province_name,
        sd.name as sender_district_name,
        rh.name as receiver_hawaladar_name,
        rh.name_fa as receiver_hawaladar_name_fa,
        rh.name_ps as receiver_hawaladar_name_ps,
        rh.location as receiver_hawaladar_location,
        rh.location_fa as receiver_hawaladar_location_fa,
        rh.location_ps as receiver_hawaladar_location_ps,
        rh.floor_number as receiver_hawaladar_floor_number,
        rh.shop_number as receiver_hawaladar_shop_number,
        rh.phone as receiver_hawaladar_phone,
        rh.province_id as receiver_province_id,
        rh.district_id as receiver_district_id,
        rp.name as receiver_province_name,
        rd.name as receiver_district_name,
        c.code as currency_code,
        c.name as currency_name,
        u.username as created_by_name,
        cu.username as completed_by_name
      FROM hawala_transactions ht
      LEFT JOIN hawaladars sh ON ht.sender_hawaladar_id = sh.id
      LEFT JOIN provinces sp ON sh.province_id = sp.id
      LEFT JOIN districts sd ON sh.district_id = sd.id
      LEFT JOIN hawaladars rh ON ht.receiver_hawaladar_id = rh.id
      LEFT JOIN provinces rp ON rh.province_id = rp.id
      LEFT JOIN districts rd ON rh.district_id = rd.id
      JOIN currencies c ON ht.currency_id = c.id
      JOIN users u ON ht.created_by = u.id
      LEFT JOIN users cu ON ht.completed_by = cu.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ' AND ht.status = ?';
      params.push(status);
    }
    if (sender_hawaladar_id) {
      query += ' AND ht.sender_hawaladar_id = ?';
      params.push(sender_hawaladar_id);
    }
    if (receiver_hawaladar_id) {
      query += ' AND ht.receiver_hawaladar_id = ?';
      params.push(receiver_hawaladar_id);
    }
    if (province_id) {
      query += ' AND (sh.province_id = ? OR rh.province_id = ?)';
      params.push(province_id, province_id);
    }
    if (district_id) {
      query += ' AND (sh.district_id = ? OR rh.district_id = ?)';
      params.push(district_id, district_id);
    }

    query += ' ORDER BY ht.created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit as string));
      if (offset) {
        query += ' OFFSET ?';
        params.push(parseInt(offset as string));
      }
    }

    const transactions = db.prepare(query).all(...params) as HawalaTransactionWithDetails[];

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM hawala_transactions ht
      LEFT JOIN hawaladars sh ON ht.sender_hawaladar_id = sh.id
      LEFT JOIN hawaladars rh ON ht.receiver_hawaladar_id = rh.id
      WHERE 1=1
    `;
    const countParams: any[] = [];

    if (status) {
      countQuery += ' AND ht.status = ?';
      countParams.push(status);
    }
    if (sender_hawaladar_id) {
      countQuery += ' AND ht.sender_hawaladar_id = ?';
      countParams.push(sender_hawaladar_id);
    }
    if (receiver_hawaladar_id) {
      countQuery += ' AND ht.receiver_hawaladar_id = ?';
      countParams.push(receiver_hawaladar_id);
    }
    if (province_id) {
      countQuery += ' AND (sh.province_id = ? OR rh.province_id = ?)';
      countParams.push(province_id, province_id);
    }
    if (district_id) {
      countQuery += ' AND (sh.district_id = ? OR rh.district_id = ?)';
      countParams.push(district_id, district_id);
    }

    const countResult = db.prepare(countQuery).get(...countParams) as { total: number };

    res.json({
      success: true,
      data: {
        transactions,
        total: countResult.total,
        limit: limit ? parseInt(limit as string) : null,
        offset: offset ? parseInt(offset as string) : 0
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
};

export const getTransactionById = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const transaction = db.prepare(`
      SELECT
        ht.*,
        sh.name as sender_hawaladar_name,
        sh.name_fa as sender_hawaladar_name_fa,
        sh.name_ps as sender_hawaladar_name_ps,
        sh.location as sender_hawaladar_location,
        sh.location_fa as sender_hawaladar_location_fa,
        sh.location_ps as sender_hawaladar_location_ps,
        sh.floor_number as sender_hawaladar_floor_number,
        sh.shop_number as sender_hawaladar_shop_number,
        sh.phone as sender_hawaladar_phone,
        rh.name as receiver_hawaladar_name,
        rh.name_fa as receiver_hawaladar_name_fa,
        rh.name_ps as receiver_hawaladar_name_ps,
        rh.location as receiver_hawaladar_location,
        rh.location_fa as receiver_hawaladar_location_fa,
        rh.location_ps as receiver_hawaladar_location_ps,
        rh.floor_number as receiver_hawaladar_floor_number,
        rh.shop_number as receiver_hawaladar_shop_number,
        rh.phone as receiver_hawaladar_phone,
        c.code as currency_code,
        c.name as currency_name,
        u.username as created_by_name,
        cu.username as completed_by_name
      FROM hawala_transactions ht
      LEFT JOIN hawaladars sh ON ht.sender_hawaladar_id = sh.id
      LEFT JOIN hawaladars rh ON ht.receiver_hawaladar_id = rh.id
      JOIN currencies c ON ht.currency_id = c.id
      JOIN users u ON ht.created_by = u.id
      LEFT JOIN users cu ON ht.completed_by = cu.id
      WHERE ht.id = ?
    `).get(id) as HawalaTransactionWithDetails | undefined;

    if (!transaction) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transaction' });
  }
};

export const getTransactionByCode = (req: Request, res: Response): void => {
  try {
    const { code } = req.params;

    const transaction = db.prepare(`
      SELECT
        ht.*,
        sh.name as sender_hawaladar_name,
        sh.name_fa as sender_hawaladar_name_fa,
        sh.name_ps as sender_hawaladar_name_ps,
        sh.location as sender_hawaladar_location,
        sh.location_fa as sender_hawaladar_location_fa,
        sh.location_ps as sender_hawaladar_location_ps,
        sh.floor_number as sender_hawaladar_floor_number,
        sh.shop_number as sender_hawaladar_shop_number,
        sh.phone as sender_hawaladar_phone,
        rh.name as receiver_hawaladar_name,
        rh.name_fa as receiver_hawaladar_name_fa,
        rh.name_ps as receiver_hawaladar_name_ps,
        rh.location as receiver_hawaladar_location,
        rh.location_fa as receiver_hawaladar_location_fa,
        rh.location_ps as receiver_hawaladar_location_ps,
        rh.floor_number as receiver_hawaladar_floor_number,
        rh.shop_number as receiver_hawaladar_shop_number,
        rh.phone as receiver_hawaladar_phone,
        c.code as currency_code,
        c.name as currency_name,
        u.username as created_by_name,
        cu.username as completed_by_name
      FROM hawala_transactions ht
      LEFT JOIN hawaladars sh ON ht.sender_hawaladar_id = sh.id
      LEFT JOIN hawaladars rh ON ht.receiver_hawaladar_id = rh.id
      JOIN currencies c ON ht.currency_id = c.id
      JOIN users u ON ht.created_by = u.id
      LEFT JOIN users cu ON ht.completed_by = cu.id
      WHERE ht.reference_code = ?
    `).get(code) as HawalaTransactionWithDetails | undefined;

    if (!transaction) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Get transaction by code error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transaction' });
  }
};

export const createTransaction = (req: Request, res: Response): void => {
  try {
    const {
      transaction_direction = 'outgoing',
      reference_code,
      sender_name,
      sender_phone,
      sender_hawaladar_id,
      receiver_name,
      receiver_phone,
      receiver_hawaladar_id,
      amount,
      currency_id,
      commission_rate,
      commission_type = 'add',
      notes,
      customer_savings_account_id,
      linked_transaction_reference_code
    } = req.body;
    const userId = req.user?.userId;
    const username = req.user?.username || 'unknown';

    // For incoming transactions, use provided reference code; for outgoing, generate one
    let referenceCode: string;

    if (transaction_direction === 'incoming') {
      // For incoming transactions, require manual reference code
      if (!reference_code || !reference_code.trim()) {
        res.status(400).json({
          success: false,
          error: 'Reference code is required for incoming transactions'
        });
        return;
      }

      // Check if reference code already exists
      const existingTransaction = db.prepare('SELECT id FROM hawala_transactions WHERE reference_code = ?')
        .get(reference_code.trim().toUpperCase()) as any;

      if (existingTransaction) {
        res.status(400).json({
          success: false,
          error: 'This reference code already exists in the system'
        });
        return;
      }

      referenceCode = reference_code.trim().toUpperCase();
    } else {
      // For outgoing transactions, generate reference code
      const hawaladarForCode = sender_hawaladar_id;

      if (!hawaladarForCode) {
        res.status(400).json({
          success: false,
          error: 'Sender hawaladar is required for reference code generation'
        });
        return;
      }

      referenceCode = generateReferenceCode(hawaladarForCode);
    }

    // Validate transaction limits if sender hawaladar is involved
    if (sender_hawaladar_id) {
      const limitsCheck = validateTransactionLimits(sender_hawaladar_id, amount, currency_id);
      if (!limitsCheck.valid) {
        res.status(400).json({
          success: false,
          error: limitsCheck.error
        });
        return;
      }
    }

    // Calculate expiration date (7 days from now)
    const expiresAt = calculateExpirationDate(7);

    // Calculate commission based on commission type
    const rate = commission_rate || 2.0;
    const commissionAmount = amount * (rate / 100);
    // If 'add': sender pays amount + commission (total = amount + commission)
    // If 'deduct': sender pays amount, receiver gets amount - commission (total = amount, but receiver gets less)
    const totalAmount = commission_type === 'add' ? amount + commissionAmount : amount;

    // Validate payment method: cannot have both sender_hawaladar_id and customer_savings_account_id
    if (sender_hawaladar_id && customer_savings_account_id) {
      res.status(400).json({
        success: false,
        error: 'Cannot use both Saraf account and customer savings account for payment'
      });
      return;
    }

    // Find linked transaction if reference code provided
    let linkedTransactionId: number | null = null;
    if (linked_transaction_reference_code) {
      const linkedTx = db.prepare('SELECT id FROM hawala_transactions WHERE reference_code = ?')
        .get(linked_transaction_reference_code) as any;

      if (linkedTx) {
        linkedTransactionId = linkedTx.id;

        // Mark the linked transaction as origin if not already marked
        db.prepare('UPDATE hawala_transactions SET is_origin_transaction = 1 WHERE id = ?')
          .run(linkedTx.id);
      }
    }

    // Check if sender hawaladar has an account and deduct funds
    let senderAccountTransactionId: number | null = null;

    if (sender_hawaladar_id) {
      const senderAccount = db.prepare(`
        SELECT * FROM saraf_accounts WHERE saraf_id = ?
      `).get(sender_hawaladar_id) as any;

      if (senderAccount) {
        // Check if account has same currency
        if (senderAccount.currency_id !== currency_id) {
          res.status(400).json({
            success: false,
            error: 'Sender hawaladar account currency does not match transaction currency'
          });
          return;
        }

        // Check if sender has sufficient balance
        if (senderAccount.cash_balance < totalAmount) {
          res.status(400).json({
            success: false,
            error: `Insufficient balance in sender hawaladar account. Required: ${totalAmount}, Available: ${senderAccount.cash_balance}`
          });
          return;
        }

        // Deduct from sender account
        const balanceBefore = senderAccount.cash_balance;
        const balanceAfter = balanceBefore - totalAmount;

        db.prepare(`
          UPDATE saraf_accounts
          SET cash_balance = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(balanceAfter, senderAccount.id);

        // Record account transaction
        const accountTxResult = db.prepare(`
          INSERT INTO account_transactions (
            account_type, account_id, transaction_type, amount, balance_before, balance_after,
            currency_id, notes, created_by
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          'saraf_cash',
          senderAccount.id,
          'hawala_send',
          totalAmount,
          balanceBefore,
          balanceAfter,
          currency_id,
          `Hawala send: ${referenceCode} - ${sender_name} to ${receiver_name}`,
          userId
        );

        senderAccountTransactionId = accountTxResult.lastInsertRowid as number;
      }
    }

    // Check if customer savings account is provided and deduct funds
    if (customer_savings_account_id) {
      const savingsAccount = db.prepare(`
        SELECT * FROM customer_savings WHERE id = ?
      `).get(customer_savings_account_id) as any;

      if (!savingsAccount) {
        res.status(404).json({
          success: false,
          error: 'Customer savings account not found'
        });
        return;
      }

      // Validate account currency matches transaction currency
      if (savingsAccount.currency_id !== currency_id) {
        res.status(400).json({
          success: false,
          error: 'Customer savings account currency does not match transaction currency'
        });
        return;
      }

      // Validate account belongs to sender's hawaladar (if sender_hawaladar_id provided)
      // This ensures customer can only pay from accounts held by the sending saraf
      // Note: This validation is skipped if no sender_hawaladar_id is specified
      // In that case, the customer can use any savings account they have

      // Check sufficient balance (including commission)
      if (savingsAccount.balance < totalAmount) {
        res.status(400).json({
          success: false,
          error: `Insufficient balance in customer savings account. Required: ${totalAmount}, Available: ${savingsAccount.balance}`
        });
        return;
      }

      // Deduct from customer savings account
      const balanceBefore = savingsAccount.balance;
      const balanceAfter = balanceBefore - totalAmount;

      db.prepare(`
        UPDATE customer_savings
        SET balance = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(balanceAfter, savingsAccount.id);

      // Record account transaction
      const accountTxResult = db.prepare(`
        INSERT INTO account_transactions (
          account_type, account_id, transaction_type, amount, balance_before, balance_after,
          currency_id, notes, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'customer_savings',
        savingsAccount.id,
        'hawala_send',
        totalAmount,
        balanceBefore,
        balanceAfter,
        currency_id,
        `Hawala send: ${referenceCode} - ${sender_name} to ${receiver_name}`,
        userId
      );

      senderAccountTransactionId = accountTxResult.lastInsertRowid as number;
    }

    // Create hawala transaction
    const result = db.prepare(`
      INSERT INTO hawala_transactions (
        reference_code, transaction_direction, sender_name, sender_phone, sender_hawaladar_id,
        receiver_name, receiver_phone, receiver_hawaladar_id,
        amount, currency_id, commission_rate, commission_type, commission_amount, total_amount,
        notes, sender_account_transaction_id, customer_savings_account_id, created_by,
        expires_at, linked_transaction_id, is_origin_transaction
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      referenceCode,
      transaction_direction,
      sender_name,
      sender_phone || null,
      sender_hawaladar_id || null,
      receiver_name,
      receiver_phone || null,
      receiver_hawaladar_id || null,
      amount,
      currency_id,
      rate,
      commission_type,
      commissionAmount,
      totalAmount,
      notes || null,
      senderAccountTransactionId,
      customer_savings_account_id || null,
      userId,
      expiresAt,
      linkedTransactionId,
      transaction_direction === 'outgoing' && !linked_transaction_reference_code ? 1 : 0
    );

    const transactionId = result.lastInsertRowid as number;

    // Log audit event
    logAuditEvent(
      transactionId,
      'created',
      userId!,
      username,
      {
        reference_code: referenceCode,
        amount,
        currency_id,
        transaction_direction,
        sender_name,
        receiver_name
      },
      req.ip,
      req.get('user-agent')
    );

    const newTransaction = db.prepare(`
      SELECT
        ht.*,
        sh.name as sender_hawaladar_name,
        sh.location as sender_hawaladar_location,
        rh.name as receiver_hawaladar_name,
        rh.location as receiver_hawaladar_location,
        c.code as currency_code,
        c.name as currency_name,
        u.username as created_by_name
      FROM hawala_transactions ht
      LEFT JOIN hawaladars sh ON ht.sender_hawaladar_id = sh.id
      LEFT JOIN hawaladars rh ON ht.receiver_hawaladar_id = rh.id
      JOIN currencies c ON ht.currency_id = c.id
      JOIN users u ON ht.created_by = u.id
      WHERE ht.id = ?
    `).get(transactionId);

    // Return transaction
    res.status(201).json({
      success: true,
      data: newTransaction,
      message: 'Transaction created successfully'
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }
};

export const updateTransaction = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const {
      sender_name,
      sender_phone,
      sender_hawaladar_id,
      receiver_name,
      receiver_phone,
      receiver_hawaladar_id,
      amount,
      currency_id,
      commission_rate,
      commission_type,
      notes
    } = req.body;

    const existing = db.prepare('SELECT * FROM hawala_transactions WHERE id = ?').get(id) as HawalaTransaction | undefined;
    if (!existing) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    if (existing.status === 'completed' || existing.status === 'cancelled') {
      res.status(400).json({ success: false, error: 'Cannot update completed or cancelled transactions' });
      return;
    }

    // Prevent updates if funds have been deducted from sender's account
    if (existing.sender_account_transaction_id) {
      res.status(400).json({
        success: false,
        error: 'Cannot update transaction after funds have been deducted. Please cancel and create a new transaction.'
      });
      return;
    }

    // Recalculate commission if amount, rate, or commission type changed
    const newAmount = amount || existing.amount;
    const rate = commission_rate || existing.commission_rate;
    const commType = commission_type || existing.commission_type || 'add';
    const commissionAmount = newAmount * (rate / 100);
    const totalAmount = commType === 'add' ? newAmount + commissionAmount : newAmount;

    db.prepare(`
      UPDATE hawala_transactions
      SET sender_name = ?, sender_phone = ?, sender_hawaladar_id = ?,
          receiver_name = ?, receiver_phone = ?, receiver_hawaladar_id = ?,
          amount = ?, currency_id = ?, commission_rate = ?, commission_type = ?,
          commission_amount = ?, total_amount = ?, notes = ?
      WHERE id = ?
    `).run(
      sender_name || existing.sender_name,
      sender_phone || existing.sender_phone,
      sender_hawaladar_id !== undefined ? sender_hawaladar_id : existing.sender_hawaladar_id,
      receiver_name || existing.receiver_name,
      receiver_phone || existing.receiver_phone,
      receiver_hawaladar_id !== undefined ? receiver_hawaladar_id : existing.receiver_hawaladar_id,
      newAmount,
      currency_id || existing.currency_id,
      rate,
      commType,
      commissionAmount,
      totalAmount,
      notes !== undefined ? notes : existing.notes,
      id
    );

    const updatedTransaction = db.prepare(`
      SELECT
        ht.*,
        sh.name as sender_hawaladar_name,
        sh.location as sender_hawaladar_location,
        rh.name as receiver_hawaladar_name,
        rh.location as receiver_hawaladar_location,
        c.code as currency_code,
        c.name as currency_name,
        u.username as created_by_name,
        cu.username as completed_by_name
      FROM hawala_transactions ht
      LEFT JOIN hawaladars sh ON ht.sender_hawaladar_id = sh.id
      LEFT JOIN hawaladars rh ON ht.receiver_hawaladar_id = rh.id
      JOIN currencies c ON ht.currency_id = c.id
      JOIN users u ON ht.created_by = u.id
      LEFT JOIN users cu ON ht.completed_by = cu.id
      WHERE ht.id = ?
    `).get(id);

    res.json({ success: true, data: updatedTransaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ success: false, error: 'Failed to update transaction' });
  }
};

export const updateTransactionStatus = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;

    const existing = db.prepare('SELECT * FROM hawala_transactions WHERE id = ?').get(id) as HawalaTransaction | undefined;
    if (!existing) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    // Validate status transition using state machine
    if (!isValidStatusTransition(existing.status as TransactionStatus, status as TransactionStatus)) {
      res.status(400).json({
        success: false,
        error: getInvalidTransitionMessage(existing.status as TransactionStatus, status as TransactionStatus)
      });
      return;
    }

    // If completing the transaction, add funds to receiver's account
    let receiverAccountTransactionId: number | null = null;

    if (status === 'completed' && existing.receiver_hawaladar_id) {
      const receiverAccount = db.prepare(`
        SELECT * FROM saraf_accounts WHERE saraf_id = ?
      `).get(existing.receiver_hawaladar_id) as any;

      if (receiverAccount) {
        // Check if account has same currency
        if (receiverAccount.currency_id !== existing.currency_id) {
          res.status(400).json({
            success: false,
            error: 'Receiver hawaladar account currency does not match transaction currency'
          });
          return;
        }

        // Calculate net amount for receiver based on commission type
        // If 'add': receiver gets full amount (sender paid extra for commission)
        // If 'deduct': receiver gets amount - commission (commission was deducted)
        const netAmount = existing.commission_type === 'deduct'
          ? existing.amount - existing.commission_amount
          : existing.amount;

        const balanceBefore = receiverAccount.cash_balance;
        const balanceAfter = balanceBefore + netAmount;

        db.prepare(`
          UPDATE saraf_accounts
          SET cash_balance = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(balanceAfter, receiverAccount.id);

        // Record account transaction
        const accountTxResult = db.prepare(`
          INSERT INTO account_transactions (
            account_type, account_id, transaction_type, amount, balance_before, balance_after,
            currency_id, reference_id, notes, created_by
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          'saraf_cash',
          receiverAccount.id,
          'hawala_receive',
          netAmount,
          balanceBefore,
          balanceAfter,
          existing.currency_id,
          existing.sender_account_transaction_id,
          `Hawala receive: ${existing.reference_code} - From ${existing.sender_name}`,
          userId
        );

        receiverAccountTransactionId = accountTxResult.lastInsertRowid as number;
      }
    }

    // Handle cancellation - refund sender's account and reverse receiver's credit
    if (status === 'cancelled') {
      // Refund sender if transaction was deducted
      if (existing.sender_account_transaction_id) {
        const senderAccount = db.prepare(`
          SELECT ha.* FROM saraf_accounts ha
          WHERE ha.saraf_id = ?
        `).get(existing.sender_hawaladar_id) as any;

        if (senderAccount) {
          // Refund the total amount to sender
          const balanceBefore = senderAccount.cash_balance;
          const balanceAfter = balanceBefore + existing.total_amount;

          db.prepare(`
            UPDATE saraf_accounts
            SET cash_balance = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(balanceAfter, senderAccount.id);

          // Record refund transaction
          db.prepare(`
            INSERT INTO account_transactions (
              account_type, account_id, transaction_type, amount, balance_before, balance_after,
              currency_id, reference_id, notes, created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            'saraf_cash',
            senderAccount.id,
            'deposit',
            existing.total_amount,
            balanceBefore,
            balanceAfter,
            existing.currency_id,
            existing.sender_account_transaction_id,
            `Hawala refund: ${existing.reference_code} - Transaction cancelled`,
            userId
          );
        }
      }

      // Reverse receiver's credit if transaction was completed
      if (existing.receiver_account_transaction_id) {
        const receiverAccount = db.prepare(`
          SELECT ha.* FROM saraf_accounts ha
          WHERE ha.saraf_id = ?
        `).get(existing.receiver_hawaladar_id) as any;

        if (receiverAccount) {
          // Deduct the amount from receiver
          const balanceBefore = receiverAccount.cash_balance;
          const balanceAfter = balanceBefore - existing.amount;

          db.prepare(`
            UPDATE saraf_accounts
            SET cash_balance = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(balanceAfter, receiverAccount.id);

          // Record reversal transaction
          db.prepare(`
            INSERT INTO account_transactions (
              account_type, account_id, transaction_type, amount, balance_before, balance_after,
              currency_id, reference_id, notes, created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            'saraf_cash',
            receiverAccount.id,
            'withdraw',
            existing.amount,
            balanceBefore,
            balanceAfter,
            existing.currency_id,
            existing.receiver_account_transaction_id,
            `Hawala reversal: ${existing.reference_code} - Transaction cancelled`,
            userId
          );
        }
      }
    }

    // Update transaction status
    if (status === 'completed') {
      db.prepare(`
        UPDATE hawala_transactions
        SET status = ?, completed_by = ?, completed_at = CURRENT_TIMESTAMP,
            receiver_account_transaction_id = ?
        WHERE id = ?
      `).run(status, userId, receiverAccountTransactionId, id);
    } else {
      db.prepare(`
        UPDATE hawala_transactions
        SET status = ?
        WHERE id = ?
      `).run(status, id);
    }

    const updatedTransaction = db.prepare(`
      SELECT
        ht.*,
        sh.name as sender_hawaladar_name,
        sh.location as sender_hawaladar_location,
        rh.name as receiver_hawaladar_name,
        rh.location as receiver_hawaladar_location,
        c.code as currency_code,
        c.name as currency_name,
        u.username as created_by_name,
        cu.username as completed_by_name
      FROM hawala_transactions ht
      LEFT JOIN hawaladars sh ON ht.sender_hawaladar_id = sh.id
      LEFT JOIN hawaladars rh ON ht.receiver_hawaladar_id = rh.id
      JOIN currencies c ON ht.currency_id = c.id
      JOIN users u ON ht.created_by = u.id
      LEFT JOIN users cu ON ht.completed_by = cu.id
      WHERE ht.id = ?
    `).get(id);

    res.json({ success: true, data: updatedTransaction });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update transaction status' });
  }
};

export const deleteTransaction = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM hawala_transactions WHERE id = ?').get(id) as HawalaTransaction | undefined;
    if (!existing) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    if (existing.status === 'completed') {
      res.status(400).json({ success: false, error: 'Cannot delete completed transactions' });
      return;
    }

    db.prepare('DELETE FROM hawala_transactions WHERE id = ?').run(id);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete transaction' });
  }
};

export const completePayout = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { receiver_tazkira_number, receiver_phone } = req.body;
    const userId = req.user?.userId;
    const username = req.user?.username || 'unknown';
    const hawaladarId = req.user?.hawaladarId;

    // Validate required fields
    if (!receiver_tazkira_number || !receiver_tazkira_number.trim()) {
      res.status(400).json({
        success: false,
        error: 'Receiver Tazkira number is required for payout completion'
      });
      return;
    }

    if (!receiver_phone || !receiver_phone.trim()) {
      res.status(400).json({
        success: false,
        error: 'Receiver phone number is required for payout completion'
      });
      return;
    }

    // Fetch transaction
    const existing = db.prepare('SELECT * FROM hawala_transactions WHERE id = ?')
      .get(id) as HawalaTransaction | undefined;

    if (!existing) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    // Check transaction expiration
    if (isTransactionExpired(existing)) {
      // Log failed payout attempt
      logAuditEvent(
        parseInt(id),
        'payout_failed',
        userId!,
        username,
        { reason: 'Transaction expired', expires_at: existing.expires_at },
        req.ip,
        req.get('user-agent')
      );

      res.status(400).json({
        success: false,
        error: `Transaction has expired. Expiry date: ${existing.expires_at}. Please contact the sender.`
      });
      return;
    }

    // Restrict payout to receiver hawaladar's jurisdiction (if hawaladarId in JWT)
    if (hawaladarId && existing.receiver_hawaladar_id && hawaladarId !== existing.receiver_hawaladar_id) {
      // Log failed payout attempt
      logAuditEvent(
        parseInt(id),
        'payout_failed',
        userId!,
        username,
        {
          reason: 'Jurisdiction mismatch',
          user_hawaladar: hawaladarId,
          transaction_hawaladar: existing.receiver_hawaladar_id
        },
        req.ip,
        req.get('user-agent')
      );

      res.status(403).json({
        success: false,
        error: 'You are not authorized to complete this payout. Only the receiving hawaladar can process this transaction.'
      });
      return;
    }

    // DATABASE-LEVEL LOCKING: Attempt to update status to completed atomically
    // This prevents double payout by ensuring only ONE update succeeds
    const lockResult = db.prepare(`
      UPDATE hawala_transactions
      SET status = 'completed',
          receiver_tazkira_number = ?,
          receiver_phone = ?,
          payout_completed_by = ?,
          payout_completed_at = CURRENT_TIMESTAMP,
          completed_by = ?,
          completed_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status != 'completed' AND status != 'cancelled'
    `).run(
      receiver_tazkira_number.trim(),
      receiver_phone.trim(),
      userId,
      userId,
      id
    );

    // If no rows were updated, transaction was already completed or cancelled
    if (lockResult.changes === 0) {
      res.status(400).json({
        success: false,
        error: 'Transaction has already been completed or cancelled by another user'
      });
      return;
    }

    // Fetch the locked transaction
    const lockedTransaction = db.prepare('SELECT * FROM hawala_transactions WHERE id = ?')
      .get(id) as HawalaTransaction;

    // Now safely proceed with account updates
    // Validate transaction can be paid out (double-check after lock)
    if (lockedTransaction.status === 'completed') {
      res.status(400).json({
        success: false,
        error: 'Transaction already completed'
      });
      return;
    }

    if (lockedTransaction.status === 'cancelled') {
      res.status(400).json({
        success: false,
        error: 'Cannot complete payout for cancelled transaction'
      });
      return;
    }

    // If receiver hawaladar exists, add funds to their account
    let receiverAccountTransactionId: number | null = null;

    if (existing.receiver_hawaladar_id) {
      const receiverAccount = db.prepare(`
        SELECT * FROM saraf_accounts WHERE saraf_id = ?
      `).get(existing.receiver_hawaladar_id) as any;

      if (receiverAccount) {
        // Validate currency match
        if (receiverAccount.currency_id !== existing.currency_id) {
          res.status(400).json({
            success: false,
            error: 'Receiver hawaladar account currency does not match transaction currency'
          });
          return;
        }

        // Calculate net amount for receiver based on commission type
        const netAmount = existing.commission_type === 'deduct'
          ? existing.amount - existing.commission_amount
          : existing.amount;

        const balanceBefore = receiverAccount.cash_balance;
        const balanceAfter = balanceBefore + netAmount;

        // Update receiver account balance
        db.prepare(`
          UPDATE saraf_accounts
          SET cash_balance = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(balanceAfter, receiverAccount.id);

        // Record account transaction
        const accountTxResult = db.prepare(`
          INSERT INTO account_transactions (
            account_type, account_id, transaction_type, amount, balance_before, balance_after,
            currency_id, reference_id, notes, created_by
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          'saraf_cash',
          receiverAccount.id,
          'hawala_receive',
          netAmount,
          balanceBefore,
          balanceAfter,
          existing.currency_id,
          existing.sender_account_transaction_id,
          `Hawala payout: ${existing.reference_code} - From ${existing.sender_name} to ${existing.receiver_name} (Tazkira: ${receiver_tazkira_number})`,
          userId
        );

        receiverAccountTransactionId = accountTxResult.lastInsertRowid as number;
      }
    }

    // Update receiver_account_transaction_id if account was updated
    if (receiverAccountTransactionId) {
      db.prepare(`
        UPDATE hawala_transactions
        SET receiver_account_transaction_id = ?
        WHERE id = ?
      `).run(receiverAccountTransactionId, id);
    }

    // Log successful payout audit event
    logAuditEvent(
      parseInt(id),
      'payout_completed',
      userId!,
      username,
      {
        reference_code: existing.reference_code,
        receiver_tazkira: receiver_tazkira_number,
        receiver_phone: receiver_phone,
        amount: existing.amount,
        net_amount: existing.commission_type === 'deduct'
          ? existing.amount - existing.commission_amount
          : existing.amount
      },
      req.ip,
      req.get('user-agent')
    );

    // Fetch and return updated transaction with all details
    const updatedTransaction = db.prepare(`
      SELECT
        ht.*,
        sh.name as sender_hawaladar_name,
        sh.name_fa as sender_hawaladar_name_fa,
        sh.name_ps as sender_hawaladar_name_ps,
        sh.location as sender_hawaladar_location,
        sh.location_fa as sender_hawaladar_location_fa,
        sh.location_ps as sender_hawaladar_location_ps,
        sh.phone as sender_hawaladar_phone,
        sh.floor_number as sender_hawaladar_floor_number,
        sh.shop_number as sender_hawaladar_shop_number,
        rh.name as receiver_hawaladar_name,
        rh.name_fa as receiver_hawaladar_name_fa,
        rh.name_ps as receiver_hawaladar_name_ps,
        rh.location as receiver_hawaladar_location,
        rh.location_fa as receiver_hawaladar_location_fa,
        rh.location_ps as receiver_hawaladar_location_ps,
        rh.floor_number as receiver_hawaladar_floor_number,
        rh.shop_number as receiver_hawaladar_shop_number,
        c.code as currency_code,
        c.name as currency_name,
        u.username as created_by_name,
        cu.username as completed_by_name,
        pu.username as payout_completed_by_name
      FROM hawala_transactions ht
      LEFT JOIN hawaladars sh ON ht.sender_hawaladar_id = sh.id
      LEFT JOIN hawaladars rh ON ht.receiver_hawaladar_id = rh.id
      JOIN currencies c ON ht.currency_id = c.id
      JOIN users u ON ht.created_by = u.id
      LEFT JOIN users cu ON ht.completed_by = cu.id
      LEFT JOIN users pu ON ht.payout_completed_by = pu.id
      WHERE ht.id = ?
    `).get(id);

    res.json({ success: true, data: updatedTransaction });
  } catch (error) {
    console.error('Complete payout error:', error);
    res.status(500).json({ success: false, error: 'Failed to complete payout' });
  }
};

// ==================== REPORTS ====================

export const getReportsSummary = (req: Request, res: Response): void => {
  try {
    const summary = db.prepare(`
      SELECT
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as in_transit_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
        SUM(CASE WHEN status != 'cancelled' THEN amount ELSE 0 END) as total_amount,
        SUM(CASE WHEN status != 'cancelled' THEN commission_amount ELSE 0 END) as total_commission,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_amount,
        SUM(CASE WHEN status = 'completed' THEN commission_amount ELSE 0 END) as completed_commission
      FROM hawala_transactions
    `).get() as any;

    const recentTransactions = db.prepare(`
      SELECT
        ht.*,
        c.code as currency_code
      FROM hawala_transactions ht
      JOIN currencies c ON ht.currency_id = c.id
      ORDER BY ht.created_at DESC
      LIMIT 5
    `).all();

    res.json({
      success: true,
      data: {
        summary: {
          ...summary,
          total_amount: summary.total_amount || 0,
          total_commission: summary.total_commission || 0,
          completed_amount: summary.completed_amount || 0,
          completed_commission: summary.completed_commission || 0
        },
        recent_transactions: recentTransactions
      }
    });
  } catch (error) {
    console.error('Get reports summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reports summary' });
  }
};

export const getReportsByAgent = (req: Request, res: Response): void => {
  try {
    const { province_id, district_id } = req.query;

    let query = `
      SELECT
        h.id,
        h.name,
        h.name_fa,
        h.name_ps,
        h.location,
        h.location_fa,
        h.location_ps,
        h.province_id,
        h.district_id,
        p.name as province_name,
        d.name as district_name,
        COUNT(DISTINCT CASE WHEN ht.sender_hawaladar_id = h.id THEN ht.id END) as sent_count,
        COUNT(DISTINCT CASE WHEN ht.receiver_hawaladar_id = h.id THEN ht.id END) as received_count,
        SUM(CASE WHEN ht.sender_hawaladar_id = h.id AND ht.status != 'cancelled' THEN ht.amount ELSE 0 END) as sent_amount,
        SUM(CASE WHEN ht.receiver_hawaladar_id = h.id AND ht.status != 'cancelled' THEN ht.amount ELSE 0 END) as received_amount,
        SUM(CASE WHEN ht.sender_hawaladar_id = h.id AND ht.status != 'cancelled' THEN ht.commission_amount ELSE 0 END) as commission_earned
      FROM hawaladars h
      LEFT JOIN provinces p ON h.province_id = p.id
      LEFT JOIN districts d ON h.district_id = d.id
      LEFT JOIN hawala_transactions ht ON ht.sender_hawaladar_id = h.id OR ht.receiver_hawaladar_id = h.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (province_id) {
      query += ' AND h.province_id = ?';
      params.push(province_id);
    }
    if (district_id) {
      query += ' AND h.district_id = ?';
      params.push(district_id);
    }

    query += ' GROUP BY h.id, h.name, h.name_fa, h.name_ps, h.location, h.location_fa, h.location_ps, h.province_id, h.district_id, p.name, d.name';
    query += ' ORDER BY h.name';

    const byAgent = db.prepare(query).all(...params);

    res.json({ success: true, data: byAgent });
  } catch (error) {
    console.error('Get reports by agent error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reports by agent' });
  }
};

export const getReportsByCurrency = (req: Request, res: Response): void => {
  try {
    const byCurrency = db.prepare(`
      SELECT
        c.id,
        c.code,
        c.name,
        COUNT(ht.id) as transaction_count,
        SUM(CASE WHEN ht.status != 'cancelled' THEN ht.amount ELSE 0 END) as total_amount,
        SUM(CASE WHEN ht.status != 'cancelled' THEN ht.commission_amount ELSE 0 END) as total_commission,
        SUM(CASE WHEN ht.status = 'completed' THEN ht.amount ELSE 0 END) as completed_amount
      FROM currencies c
      LEFT JOIN hawala_transactions ht ON ht.currency_id = c.id
      GROUP BY c.id, c.code, c.name
      HAVING transaction_count > 0
      ORDER BY total_amount DESC
    `).all();

    res.json({ success: true, data: byCurrency });
  } catch (error) {
    console.error('Get reports by currency error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reports by currency' });
  }
};

// ==================== NEW REPORTS ====================

/**
 * Get net position report between hawaladars
 * Shows who owes whom for reconciliation
 */
export const getNetPositions = (req: Request, res: Response): void => {
  try {
    const { currency_id } = req.query;

    let currencyFilter = '';
    const params: any[] = [];

    if (currency_id) {
      currencyFilter = 'AND ht.currency_id = ?';
      params.push(currency_id);
    }

    const positions = db.prepare(`
      SELECT
        h1.id as hawaladar_a_id,
        h1.name as hawaladar_a_name,
        h1.name_fa as hawaladar_a_name_fa,
        h1.name_ps as hawaladar_a_name_ps,
        h2.id as hawaladar_b_id,
        h2.name as hawaladar_b_name,
        h2.name_fa as hawaladar_b_name_fa,
        h2.name_ps as hawaladar_b_name_ps,
        c.code as currency,
        c.name as currency_name,
        COALESCE(SUM(CASE
          WHEN ht.sender_hawaladar_id = h1.id
           AND ht.receiver_hawaladar_id = h2.id
           AND ht.status = 'completed'
          THEN ht.amount
          ELSE 0
        END), 0) as sent_by_a,
        COALESCE(SUM(CASE
          WHEN ht.sender_hawaladar_id = h2.id
           AND ht.receiver_hawaladar_id = h1.id
           AND ht.status = 'completed'
          THEN ht.amount
          ELSE 0
        END), 0) as sent_by_b
      FROM hawaladars h1
      CROSS JOIN hawaladars h2
      LEFT JOIN hawala_transactions ht ON (
        (ht.sender_hawaladar_id = h1.id AND ht.receiver_hawaladar_id = h2.id)
        OR (ht.sender_hawaladar_id = h2.id AND ht.receiver_hawaladar_id = h1.id)
      )
      LEFT JOIN currencies c ON ht.currency_id = c.id
      WHERE h1.id < h2.id
        AND h1.is_active = 1
        AND h2.is_active = 1
        ${currencyFilter}
      GROUP BY h1.id, h2.id, c.id
      HAVING sent_by_a > 0 OR sent_by_b > 0
      ORDER BY currency, hawaladar_a_name
    `).all(...params);

    const results = positions.map((p: any) => ({
      hawaladar_a: p.hawaladar_a_name,
      hawaladar_a_id: p.hawaladar_a_id,
      hawaladar_b: p.hawaladar_b_name,
      hawaladar_b_id: p.hawaladar_b_id,
      currency: p.currency,
      currency_name: p.currency_name,
      net_owed_to_a: p.sent_by_a - p.sent_by_b,
      sent_by_a: p.sent_by_a,
      sent_by_b: p.sent_by_b
    }));

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Get net positions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch net positions' });
  }
};

/**
 * Get unpaid/pending hawalas report
 * Shows transactions not yet completed, with aging info
 */
export const getUnpaidHawalas = (req: Request, res: Response): void => {
  try {
    const { status = 'pending', older_than_days } = req.query;

    let ageFilter = '';
    if (older_than_days) {
      ageFilter = `AND julianday('now') - julianday(ht.created_at) > ${older_than_days}`;
    }

    const unpaidTransactions = db.prepare(`
      SELECT
        ht.id,
        ht.reference_code,
        ht.sender_name,
        ht.receiver_name,
        ht.amount,
        ht.currency_id,
        ht.status,
        ht.created_at,
        ht.expires_at,
        julianday('now') - julianday(ht.created_at) as days_pending,
        sh.name as sender_hawaladar,
        rh.name as receiver_hawaladar,
        c.code as currency_code
      FROM hawala_transactions ht
      LEFT JOIN hawaladars sh ON ht.sender_hawaladar_id = sh.id
      LEFT JOIN hawaladars rh ON ht.receiver_hawaladar_id = rh.id
      JOIN currencies c ON ht.currency_id = c.id
      WHERE ht.status = ?
        ${ageFilter}
      ORDER BY ht.created_at ASC
    `).all(status);

    const summary = db.prepare(`
      SELECT
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM hawala_transactions
      WHERE status = ?
        ${ageFilter}
    `).get(status) as any;

    res.json({
      success: true,
      data: {
        count: summary.count,
        total_amount: summary.total_amount,
        transactions: unpaidTransactions
      }
    });
  } catch (error) {
    console.error('Get unpaid hawalas error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch unpaid hawalas' });
  }
};

/**
 * Get commission report
 * Shows commission earned by each hawaladar
 */
export const getCommissionReport = (req: Request, res: Response): void => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params: any[] = [];

    if (start_date && end_date) {
      dateFilter = 'AND DATE(ht.created_at) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const commissionData = db.prepare(`
      SELECT
        h.id as hawaladar_id,
        h.name as hawaladar,
        h.name_fa as hawaladar_fa,
        h.name_ps as hawaladar_ps,
        COUNT(ht.id) as transaction_count,
        SUM(CASE WHEN ht.commission_type = 'add' THEN ht.commission_amount ELSE 0 END) as commission_added,
        SUM(CASE WHEN ht.commission_type = 'deduct' THEN ht.commission_amount ELSE 0 END) as commission_deducted,
        SUM(ht.commission_amount) as total_commission
      FROM hawaladars h
      LEFT JOIN hawala_transactions ht ON (
        ht.sender_hawaladar_id = h.id OR ht.receiver_hawaladar_id = h.id
      )
      WHERE ht.status = 'completed'
        ${dateFilter}
      GROUP BY h.id, h.name
      HAVING transaction_count > 0
      ORDER BY total_commission DESC
    `).all(...params);

    res.json({ success: true, data: commissionData });
  } catch (error) {
    console.error('Get commission report error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch commission report' });
  }
};

/**
 * Get daily cash flow report for a specific hawaladar
 */
export const getDailyCashFlow = (req: Request, res: Response): void => {
  try {
    const { date, hawaladar_id } = req.query;

    if (!date || !hawaladar_id) {
      res.status(400).json({
        success: false,
        error: 'Date and hawaladar_id are required'
      });
      return;
    }

    // Get opening balance (balance at start of day)
    const openingBalance = db.prepare(`
      SELECT cash_balance
      FROM saraf_accounts
      WHERE saraf_id = ?
    `).get(hawaladar_id) as any;

    // Get transactions for the day
    const transactions = db.prepare(`
      SELECT
        at.id,
        at.transaction_type,
        at.amount,
        at.balance_before,
        at.balance_after,
        at.created_at,
        at.notes,
        c.code as currency_code
      FROM account_transactions at
      JOIN saraf_accounts sa ON at.account_id = sa.id
      JOIN currencies c ON at.currency_id = c.id
      WHERE sa.saraf_id = ?
        AND at.account_type = 'saraf_cash'
        AND DATE(at.created_at) = ?
      ORDER BY at.created_at ASC
    `).all(hawaladar_id, date);

    // Calculate totals
    const summary = db.prepare(`
      SELECT
        SUM(CASE WHEN at.transaction_type IN ('deposit', 'hawala_receive') THEN at.amount ELSE 0 END) as cash_in,
        SUM(CASE WHEN at.transaction_type IN ('withdraw', 'hawala_send') THEN at.amount ELSE 0 END) as cash_out
      FROM account_transactions at
      JOIN saraf_accounts sa ON at.account_id = sa.id
      WHERE sa.saraf_id = ?
        AND at.account_type = 'saraf_cash'
        AND DATE(at.created_at) = ?
    `).get(hawaladar_id, date) as any;

    res.json({
      success: true,
      data: {
        date,
        hawaladar_id,
        opening_balance: openingBalance?.cash_balance || 0,
        cash_in: summary.cash_in || 0,
        cash_out: summary.cash_out || 0,
        closing_balance: (openingBalance?.cash_balance || 0) + (summary.cash_in || 0) - (summary.cash_out || 0),
        transactions_detail: transactions
      }
    });
  } catch (error) {
    console.error('Get daily cash flow error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch daily cash flow' });
  }
};

/**
 * Get transaction aging report
 * Shows transactions grouped by age
 */
export const getTransactionAging = (req: Request, res: Response): void => {
  try {
    const agingData = db.prepare(`
      SELECT
        CASE
          WHEN julianday('now') - julianday(created_at) <= 1 THEN '0-24 hours'
          WHEN julianday('now') - julianday(created_at) <= 3 THEN '1-3 days'
          WHEN julianday('now') - julianday(created_at) <= 7 THEN '3-7 days'
          ELSE 'over 7 days'
        END as age_bracket,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM hawala_transactions
      WHERE status IN ('pending', 'in_transit')
      GROUP BY age_bracket
      ORDER BY
        CASE age_bracket
          WHEN '0-24 hours' THEN 1
          WHEN '1-3 days' THEN 2
          WHEN '3-7 days' THEN 3
          WHEN 'over 7 days' THEN 4
        END
    `).all();

    // Format results
    const results: any = {};
    agingData.forEach((row: any) => {
      results[row.age_bracket] = {
        count: row.count,
        amount: row.total_amount,
        alert: row.age_bracket === 'over 7 days'
      };
    });

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Get transaction aging error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transaction aging' });
  }
};
