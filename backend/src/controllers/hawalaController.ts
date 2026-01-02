import { Request, Response } from 'express';
import db from '../config/database';
import { Hawaladar, HawalaTransaction, HawalaTransactionWithDetails } from '../types';

// Generate unique reference code
const generateReferenceCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'HWL-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ==================== HAWALADARS (AGENTS) ====================

export const getHawaladars = (req: Request, res: Response): void => {
  try {
    const { active_only } = req.query;
    let query = 'SELECT * FROM hawaladars';
    if (active_only === 'true') {
      query += ' WHERE is_active = 1';
    }
    query += ' ORDER BY name';

    const hawaladars = db.prepare(query).all() as Hawaladar[];
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
    const { name, name_fa, name_ps, phone, location, location_fa, location_ps, commission_rate } = req.body;

    const result = db.prepare(`
      INSERT INTO hawaladars (name, name_fa, name_ps, phone, location, location_fa, location_ps, commission_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      name_fa || null,
      name_ps || null,
      phone || null,
      location,
      location_fa || null,
      location_ps || null,
      commission_rate || 2.0
    );

    const newHawaladar = db.prepare('SELECT * FROM hawaladars WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newHawaladar });
  } catch (error) {
    console.error('Create hawaladar error:', error);
    res.status(500).json({ success: false, error: 'Failed to create hawaladar' });
  }
};

export const updateHawaladar = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { name, name_fa, name_ps, phone, location, location_fa, location_ps, commission_rate, is_active } = req.body;

    const existing = db.prepare('SELECT id FROM hawaladars WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Hawaladar not found' });
      return;
    }

    db.prepare(`
      UPDATE hawaladars
      SET name = ?, name_fa = ?, name_ps = ?, phone = ?, location = ?,
          location_fa = ?, location_ps = ?, commission_rate = ?, is_active = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      name_fa || null,
      name_ps || null,
      phone || null,
      location,
      location_fa || null,
      location_ps || null,
      commission_rate || 2.0,
      is_active !== undefined ? is_active : 1,
      id
    );

    const updatedHawaladar = db.prepare('SELECT * FROM hawaladars WHERE id = ?').get(id);
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
    const { status, sender_hawaladar_id, receiver_hawaladar_id, limit, offset } = req.query;

    let query = `
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
    let countQuery = 'SELECT COUNT(*) as total FROM hawala_transactions WHERE 1=1';
    const countParams: any[] = [];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
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
      notes
    } = req.body;
    const userId = req.user?.userId;

    // Generate unique reference code
    let referenceCode = generateReferenceCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = db.prepare('SELECT id FROM hawala_transactions WHERE reference_code = ?').get(referenceCode);
      if (!existing) break;
      referenceCode = generateReferenceCode();
      attempts++;
    }

    // Calculate commission
    const rate = commission_rate || 2.0;
    const commissionAmount = amount * (rate / 100);
    const totalAmount = amount + commissionAmount;

    const result = db.prepare(`
      INSERT INTO hawala_transactions (
        reference_code, sender_name, sender_phone, sender_hawaladar_id,
        receiver_name, receiver_phone, receiver_hawaladar_id,
        amount, currency_id, commission_rate, commission_amount, total_amount,
        notes, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      commissionAmount,
      totalAmount,
      notes || null,
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

    // Recalculate commission if amount or rate changed
    const newAmount = amount || existing.amount;
    const rate = commission_rate || existing.commission_rate;
    const commissionAmount = newAmount * (rate / 100);
    const totalAmount = newAmount + commissionAmount;

    db.prepare(`
      UPDATE hawala_transactions
      SET sender_name = ?, sender_phone = ?, sender_hawaladar_id = ?,
          receiver_name = ?, receiver_phone = ?, receiver_hawaladar_id = ?,
          amount = ?, currency_id = ?, commission_rate = ?,
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

    const completedAt = status === 'completed' ? 'CURRENT_TIMESTAMP' : null;
    const completedBy = status === 'completed' ? userId : null;

    if (status === 'completed') {
      db.prepare(`
        UPDATE hawala_transactions
        SET status = ?, completed_by = ?, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, completedBy, id);
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
    const byAgent = db.prepare(`
      SELECT
        h.id,
        h.name,
        h.location,
        COUNT(DISTINCT CASE WHEN ht.sender_hawaladar_id = h.id THEN ht.id END) as sent_count,
        COUNT(DISTINCT CASE WHEN ht.receiver_hawaladar_id = h.id THEN ht.id END) as received_count,
        SUM(CASE WHEN ht.sender_hawaladar_id = h.id AND ht.status != 'cancelled' THEN ht.amount ELSE 0 END) as sent_amount,
        SUM(CASE WHEN ht.receiver_hawaladar_id = h.id AND ht.status != 'cancelled' THEN ht.amount ELSE 0 END) as received_amount,
        SUM(CASE WHEN ht.sender_hawaladar_id = h.id AND ht.status != 'cancelled' THEN ht.commission_amount ELSE 0 END) as commission_earned
      FROM hawaladars h
      LEFT JOIN hawala_transactions ht ON ht.sender_hawaladar_id = h.id OR ht.receiver_hawaladar_id = h.id
      GROUP BY h.id, h.name, h.location
      ORDER BY h.name
    `).all();

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
