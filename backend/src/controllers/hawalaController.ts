import { Request, Response } from 'express';
import db from '../config/database';
import { Hawaladar, HawalaTransaction, HawalaTransactionWithDetails } from '../types';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Generate unique reference code using incremental integer
// Note: This is now atomic - uses a single UPDATE that returns the new value
const generateReferenceCode = (): string => {
  const currentYear = new Date().getFullYear();

  // Get the current counter
  const counterRow = db.prepare('SELECT counter, year FROM hawala_reference_counter WHERE id = 1').get() as { counter: number; year: number } | undefined;

  let newCounter = 1;

  if (counterRow) {
    // If year has changed, reset counter to 1
    if (counterRow.year !== currentYear) {
      db.prepare('UPDATE hawala_reference_counter SET counter = ?, year = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(newCounter, currentYear);
    } else {
      // Increment counter atomically
      newCounter = counterRow.counter + 1;
      // Use a transaction to ensure atomicity
      const updateResult = db.prepare('UPDATE hawala_reference_counter SET counter = counter + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run();

      // Verify the update was successful
      if (updateResult.changes === 0) {
        throw new Error('Failed to update reference counter');
      }

      // Get the updated counter value
      const updated = db.prepare('SELECT counter FROM hawala_reference_counter WHERE id = 1').get() as { counter: number };
      newCounter = updated.counter;
    }
  } else {
    // Initialize counter if doesn't exist
    db.prepare('INSERT OR REPLACE INTO hawala_reference_counter (id, counter, year) VALUES (1, ?, ?)').run(newCounter, currentYear);
  }

  // Format: HWL-YYYY-NNNNNN (e.g., HWL-2026-000001)
  return `HWL-${currentYear}-${String(newCounter).padStart(6, '0')}`;
};

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
    const { name, name_fa, name_ps, phone, province_id, district_id, location, location_fa, location_ps, commission_rate } = req.body;

    const result = db.prepare(`
      INSERT INTO hawaladars (name, name_fa, name_ps, phone, province_id, district_id, location, location_fa, location_ps, commission_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    const { name, name_fa, name_ps, phone, province_id, district_id, location, location_fa, location_ps, commission_rate, is_active } = req.body;

    const existing = db.prepare('SELECT id FROM hawaladars WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Hawaladar not found' });
      return;
    }

    db.prepare(`
      UPDATE hawaladars
      SET name = ?, name_fa = ?, name_ps = ?, phone = ?, province_id = ?, district_id = ?,
          location = ?, location_fa = ?, location_ps = ?, commission_rate = ?, is_active = ?,
          updated_at = CURRENT_TIMESTAMP
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
        sh.logo as sender_hawaladar_logo,
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
        rh.logo as receiver_hawaladar_logo,
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
        sh.logo as sender_hawaladar_logo,
        sh.phone as sender_hawaladar_phone,
        rh.name as receiver_hawaladar_name,
        rh.name_fa as receiver_hawaladar_name_fa,
        rh.name_ps as receiver_hawaladar_name_ps,
        rh.location as receiver_hawaladar_location,
        rh.location_fa as receiver_hawaladar_location_fa,
        rh.location_ps as receiver_hawaladar_location_ps,
        rh.logo as receiver_hawaladar_logo,
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
        sh.logo as sender_hawaladar_logo,
        sh.phone as sender_hawaladar_phone,
        rh.name as receiver_hawaladar_name,
        rh.name_fa as receiver_hawaladar_name_fa,
        rh.name_ps as receiver_hawaladar_name_ps,
        rh.location as receiver_hawaladar_location,
        rh.location_fa as receiver_hawaladar_location_fa,
        rh.location_ps as receiver_hawaladar_location_ps,
        rh.logo as receiver_hawaladar_logo,
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
      customer_savings_account_id
    } = req.body;
    const userId = req.user?.userId;

    // Generate unique reference code (incremental)
    const referenceCode = generateReferenceCode();

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
        reference_code, sender_name, sender_phone, sender_hawaladar_id,
        receiver_name, receiver_phone, receiver_hawaladar_id,
        amount, currency_id, commission_rate, commission_type, commission_amount, total_amount,
        notes, sender_account_transaction_id, customer_savings_account_id, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      referenceCode,
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
      userId
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
    `).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: newTransaction });
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

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'pending': ['in_transit', 'cancelled'],
      'in_transit': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[existing.status].includes(status)) {
      res.status(400).json({
        success: false,
        error: `Cannot change status from ${existing.status} to ${status}`
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

// ==================== LOGO UPLOAD ====================

// Configure multer for logo uploads
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

export const uploadHawaladarLogo = (req: Request, res: Response): void => {
  const { id } = req.params;

  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file uploaded' });
    return;
  }

  try {
    const existing = db.prepare('SELECT logo FROM hawaladars WHERE id = ?').get(id) as Hawaladar | undefined;
    if (!existing) {
      res.status(404).json({ success: false, error: 'Hawaladar not found' });
      return;
    }

    // Delete old logo if exists
    if (existing.logo) {
      const oldLogoPath = path.join(__dirname, '../../uploads/logos', existing.logo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Update hawaladar with new logo filename
    db.prepare(`
      UPDATE hawaladars
      SET logo = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(req.file.filename, id);

    const updatedHawaladar = db.prepare('SELECT * FROM hawaladars WHERE id = ?').get(id);
    res.json({ success: true, data: updatedHawaladar });
  } catch (error) {
    console.error('Upload hawaladar logo error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload logo' });
  }
};
