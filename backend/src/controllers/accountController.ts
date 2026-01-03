import { Request, Response } from 'express';
import db from '../config/database';
import { SarafAccount, CustomerSavings, AccountTransaction } from '../types';

// ==================== HAWALADAR ACCOUNTS ====================

export const getHawaladarAccount = (req: Request, res: Response): void => {
  try {
    const { hawaladar_id } = req.params;

    const account = db.prepare(`
      SELECT
        ha.*,
        h.name as hawaladar_name,
        c.code as currency_code,
        c.name as currency_name
      FROM saraf_accounts ha
      JOIN hawaladars h ON ha.saraf_id = h.id
      JOIN currencies c ON ha.currency_id = c.id
      WHERE ha.saraf_id = ?
    `).get(hawaladar_id);

    if (!account) {
      res.status(404).json({ success: false, error: 'Account not found' });
      return;
    }

    res.json({ success: true, data: account });
  } catch (error) {
    console.error('Get hawaladar account error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch account' });
  }
};

export const createHawaladarAccount = (req: Request, res: Response): void => {
  try {
    const { hawaladar_id, currency_id, initial_balance } = req.body;

    // Check if hawaladar exists
    const hawaladar = db.prepare('SELECT id FROM hawaladars WHERE id = ?').get(hawaladar_id);
    if (!hawaladar) {
      res.status(404).json({ success: false, error: 'Hawaladar not found' });
      return;
    }

    // Check if account already exists
    const existing = db.prepare('SELECT id FROM saraf_accounts WHERE saraf_id = ?').get(hawaladar_id);
    if (existing) {
      res.status(400).json({ success: false, error: 'Account already exists for this hawaladar' });
      return;
    }

    const balance = initial_balance || 0;

    const result = db.prepare(`
      INSERT INTO saraf_accounts (saraf_id, cash_balance, currency_id)
      VALUES (?, ?, ?)
    `).run(hawaladar_id, balance, currency_id);

    // If there's an initial balance, record it as a deposit
    if (balance > 0) {
      const userId = req.user?.userId;
      db.prepare(`
        INSERT INTO account_transactions (
          account_type, account_id, transaction_type, amount, balance_before, balance_after,
          currency_id, notes, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'saraf_cash',
        result.lastInsertRowid,
        'deposit',
        balance,
        0,
        balance,
        currency_id,
        'Initial balance',
        userId
      );
    }

    const newAccount = db.prepare(`
      SELECT
        ha.*,
        h.name as hawaladar_name,
        c.code as currency_code,
        c.name as currency_name
      FROM saraf_accounts ha
      JOIN hawaladars h ON ha.saraf_id = h.id
      JOIN currencies c ON ha.currency_id = c.id
      WHERE ha.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: newAccount });
  } catch (error) {
    console.error('Create hawaladar account error:', error);
    res.status(500).json({ success: false, error: 'Failed to create account' });
  }
};

export const hawaladarDeposit = (req: Request, res: Response): void => {
  try {
    const { hawaladar_id } = req.params;
    const { amount, notes } = req.body;
    const userId = req.user?.userId;

    const account = db.prepare('SELECT * FROM saraf_accounts WHERE saraf_id = ?').get(hawaladar_id) as SarafAccount | undefined;

    if (!account) {
      res.status(404).json({ success: false, error: 'Account not found' });
      return;
    }

    const balanceBefore = account.cash_balance;
    const balanceAfter = balanceBefore + amount;

    // Update account balance
    db.prepare(`
      UPDATE saraf_accounts
      SET cash_balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(balanceAfter, account.id);

    // Record transaction
    const result = db.prepare(`
      INSERT INTO account_transactions (
        account_type, account_id, transaction_type, amount, balance_before, balance_after,
        currency_id, notes, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'saraf_cash',
      account.id,
      'deposit',
      amount,
      balanceBefore,
      balanceAfter,
      account.currency_id,
      notes || null,
      userId
    );

    const transaction = db.prepare(`
      SELECT
        at.*,
        c.code as currency_code,
        u.username as created_by_name
      FROM account_transactions at
      JOIN currencies c ON at.currency_id = c.id
      JOIN users u ON at.created_by = u.id
      WHERE at.id = ?
    `).get(result.lastInsertRowid);

    res.json({ success: true, data: { transaction, new_balance: balanceAfter } });
  } catch (error) {
    console.error('Hawaladar deposit error:', error);
    res.status(500).json({ success: false, error: 'Failed to process deposit' });
  }
};

export const hawaladarWithdraw = (req: Request, res: Response): void => {
  try {
    const { hawaladar_id } = req.params;
    const { amount, notes } = req.body;
    const userId = req.user?.userId;

    const account = db.prepare('SELECT * FROM saraf_accounts WHERE saraf_id = ?').get(hawaladar_id) as SarafAccount | undefined;

    if (!account) {
      res.status(404).json({ success: false, error: 'Account not found' });
      return;
    }

    if (account.cash_balance < amount) {
      res.status(400).json({ success: false, error: 'Insufficient balance' });
      return;
    }

    const balanceBefore = account.cash_balance;
    const balanceAfter = balanceBefore - amount;

    // Update account balance
    db.prepare(`
      UPDATE saraf_accounts
      SET cash_balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(balanceAfter, account.id);

    // Record transaction
    const result = db.prepare(`
      INSERT INTO account_transactions (
        account_type, account_id, transaction_type, amount, balance_before, balance_after,
        currency_id, notes, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'saraf_cash',
      account.id,
      'withdraw',
      amount,
      balanceBefore,
      balanceAfter,
      account.currency_id,
      notes || null,
      userId
    );

    const transaction = db.prepare(`
      SELECT
        at.*,
        c.code as currency_code,
        u.username as created_by_name
      FROM account_transactions at
      JOIN currencies c ON at.currency_id = c.id
      JOIN users u ON at.created_by = u.id
      WHERE at.id = ?
    `).get(result.lastInsertRowid);

    res.json({ success: true, data: { transaction, new_balance: balanceAfter } });
  } catch (error) {
    console.error('Hawaladar withdraw error:', error);
    res.status(500).json({ success: false, error: 'Failed to process withdrawal' });
  }
};

export const getHawaladarTransactions = (req: Request, res: Response): void => {
  try {
    const { hawaladar_id } = req.params;
    const { limit, offset } = req.query;

    const account = db.prepare('SELECT id FROM saraf_accounts WHERE saraf_id = ?').get(hawaladar_id);

    if (!account) {
      res.status(404).json({ success: false, error: 'Account not found' });
      return;
    }

    let query = `
      SELECT
        at.*,
        c.code as currency_code,
        u.username as created_by_name
      FROM account_transactions at
      JOIN currencies c ON at.currency_id = c.id
      JOIN users u ON at.created_by = u.id
      WHERE at.account_type = 'saraf_cash' AND at.account_id = ?
      ORDER BY at.created_at DESC
    `;

    const params: any[] = [(account as any).id];

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit as string));
      if (offset) {
        query += ' OFFSET ?';
        params.push(parseInt(offset as string));
      }
    }

    const transactions = db.prepare(query).all(...params);

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Get hawaladar transactions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
};

// ==================== CUSTOMER ACCOUNTS ====================

export const getCustomerAccount = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;

    const account = db.prepare(`
      SELECT
        ca.*,
        u.username,
        c.code as currency_code,
        c.name as currency_name
      FROM customer_savings ca
      JOIN users u ON ca.user_id = u.id
      JOIN currencies c ON ca.currency_id = c.id
      WHERE ca.user_id = ?
    `).get(userId);

    if (!account) {
      res.status(404).json({ success: false, error: 'Account not found' });
      return;
    }

    res.json({ success: true, data: account });
  } catch (error) {
    console.error('Get customer account error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch account' });
  }
};

export const createCustomerAccount = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    const { currency_id } = req.body;

    // Check if account already exists
    const existing = db.prepare('SELECT id FROM customer_savings WHERE user_id = ?').get(userId);
    if (existing) {
      res.status(400).json({ success: false, error: 'Account already exists for this user' });
      return;
    }

    const result = db.prepare(`
      INSERT INTO customer_savings (user_id, balance, currency_id, saraf_id)
      VALUES (?, 0, ?, 1)
    `).run(userId, currency_id);

    const newAccount = db.prepare(`
      SELECT
        ca.*,
        u.username,
        c.code as currency_code,
        c.name as currency_name
      FROM customer_savings ca
      JOIN users u ON ca.user_id = u.id
      JOIN currencies c ON ca.currency_id = c.id
      WHERE ca.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: newAccount });
  } catch (error) {
    console.error('Create customer account error:', error);
    res.status(500).json({ success: false, error: 'Failed to create account' });
  }
};

export const customerDeposit = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    const { amount, notes } = req.body;

    const account = db.prepare('SELECT * FROM customer_savings WHERE user_id = ?').get(userId) as CustomerSavings | undefined;

    if (!account) {
      res.status(404).json({ success: false, error: 'Account not found' });
      return;
    }

    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore + amount;

    // Update account balance
    db.prepare(`
      UPDATE customer_savings
      SET balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(balanceAfter, account.id);

    // Record transaction
    const result = db.prepare(`
      INSERT INTO account_transactions (
        account_type, account_id, transaction_type, amount, balance_before, balance_after,
        currency_id, notes, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'customer_savings',
      account.id,
      'deposit',
      amount,
      balanceBefore,
      balanceAfter,
      account.currency_id,
      notes || null,
      userId
    );

    const transaction = db.prepare(`
      SELECT
        at.*,
        c.code as currency_code,
        u.username as created_by_name
      FROM account_transactions at
      JOIN currencies c ON at.currency_id = c.id
      JOIN users u ON at.created_by = u.id
      WHERE at.id = ?
    `).get(result.lastInsertRowid);

    res.json({ success: true, data: { transaction, new_balance: balanceAfter } });
  } catch (error) {
    console.error('Customer deposit error:', error);
    res.status(500).json({ success: false, error: 'Failed to process deposit' });
  }
};

export const customerWithdraw = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    const { amount, notes } = req.body;

    const account = db.prepare('SELECT * FROM customer_savings WHERE user_id = ?').get(userId) as CustomerSavings | undefined;

    if (!account) {
      res.status(404).json({ success: false, error: 'Account not found' });
      return;
    }

    if (account.balance < amount) {
      res.status(400).json({ success: false, error: 'Insufficient balance' });
      return;
    }

    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore - amount;

    // Update account balance
    db.prepare(`
      UPDATE customer_savings
      SET balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(balanceAfter, account.id);

    // Record transaction
    const result = db.prepare(`
      INSERT INTO account_transactions (
        account_type, account_id, transaction_type, amount, balance_before, balance_after,
        currency_id, notes, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'customer_savings',
      account.id,
      'withdraw',
      amount,
      balanceBefore,
      balanceAfter,
      account.currency_id,
      notes || null,
      userId
    );

    const transaction = db.prepare(`
      SELECT
        at.*,
        c.code as currency_code,
        u.username as created_by_name
      FROM account_transactions at
      JOIN currencies c ON at.currency_id = c.id
      JOIN users u ON at.created_by = u.id
      WHERE at.id = ?
    `).get(result.lastInsertRowid);

    res.json({ success: true, data: { transaction, new_balance: balanceAfter } });
  } catch (error) {
    console.error('Customer withdraw error:', error);
    res.status(500).json({ success: false, error: 'Failed to process withdrawal' });
  }
};

export const getCustomerTransactions = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    const { limit, offset } = req.query;

    const account = db.prepare('SELECT id FROM customer_savings WHERE user_id = ?').get(userId);

    if (!account) {
      res.status(404).json({ success: false, error: 'Account not found' });
      return;
    }

    let query = `
      SELECT
        at.*,
        c.code as currency_code,
        u.username as created_by_name
      FROM account_transactions at
      JOIN currencies c ON at.currency_id = c.id
      JOIN users u ON at.created_by = u.id
      WHERE at.account_type = 'customer_savings' AND at.account_id = ?
      ORDER BY at.created_at DESC
    `;

    const params: any[] = [(account as any).id];

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit as string));
      if (offset) {
        query += ' OFFSET ?';
        params.push(parseInt(offset as string));
      }
    }

    const transactions = db.prepare(query).all(...params);

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Get customer transactions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
};

// ==================== TRANSFERS ====================

export const transferBetweenAccounts = (req: Request, res: Response): void => {
  try {
    const { from_account_type, from_account_id, to_account_type, to_account_id, amount, notes } = req.body;
    const userId = req.user?.userId;

    // Validate and get table/column names
    const getAccountInfo = (accountType: string) => {
      if (accountType === 'saraf_cash') {
        return { table: 'saraf_accounts', balanceColumn: 'cash_balance' };
      } else if (accountType === 'customer_savings') {
        return { table: 'customer_savings', balanceColumn: 'balance' };
      }
      throw new Error('Invalid account type');
    };

    const fromAccountInfo = getAccountInfo(from_account_type);
    const toAccountInfo = getAccountInfo(to_account_type);

    // Get source account
    const fromAccount = db.prepare(
      `SELECT * FROM ${fromAccountInfo.table} WHERE id = ?`
    ).get(from_account_id);

    if (!fromAccount) {
      res.status(404).json({ success: false, error: 'Source account not found' });
      return;
    }

    // Get destination account
    const toAccount = db.prepare(
      `SELECT * FROM ${toAccountInfo.table} WHERE id = ?`
    ).get(to_account_id);

    if (!toAccount) {
      res.status(404).json({ success: false, error: 'Destination account not found' });
      return;
    }

    // Check if currencies match
    if ((fromAccount as any).currency_id !== (toAccount as any).currency_id) {
      res.status(400).json({ success: false, error: 'Currency mismatch between accounts' });
      return;
    }

    // Check balance
    const fromBalance = (fromAccount as any)[fromAccountInfo.balanceColumn];
    if (fromBalance < amount) {
      res.status(400).json({ success: false, error: 'Insufficient balance' });
      return;
    }

    const currency_id = (fromAccount as any).currency_id;
    const fromBalanceBefore = fromBalance;
    const fromBalanceAfter = fromBalanceBefore - amount;
    const toBalanceBefore = (toAccount as any)[toAccountInfo.balanceColumn];
    const toBalanceAfter = toBalanceBefore + amount;

    // Update source account
    db.prepare(
      `UPDATE ${fromAccountInfo.table}
       SET ${fromAccountInfo.balanceColumn} = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(fromBalanceAfter, from_account_id);

    // Update destination account
    db.prepare(
      `UPDATE ${toAccountInfo.table}
       SET ${toAccountInfo.balanceColumn} = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(toBalanceAfter, to_account_id);

    // Record transfer_out transaction
    const transferOutResult = db.prepare(`
      INSERT INTO account_transactions (
        account_type, account_id, transaction_type, amount, balance_before, balance_after,
        currency_id, notes, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      from_account_type,
      from_account_id,
      'transfer_out',
      amount,
      fromBalanceBefore,
      fromBalanceAfter,
      currency_id,
      notes || `Transfer to ${to_account_type} account #${to_account_id}`,
      userId
    );

    // Record transfer_in transaction
    const transferInResult = db.prepare(`
      INSERT INTO account_transactions (
        account_type, account_id, transaction_type, amount, balance_before, balance_after,
        currency_id, reference_id, notes, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      to_account_type,
      to_account_id,
      'transfer_in',
      amount,
      toBalanceBefore,
      toBalanceAfter,
      currency_id,
      transferOutResult.lastInsertRowid,
      notes || `Transfer from ${from_account_type} account #${from_account_id}`,
      userId
    );

    res.json({
      success: true,
      data: {
        from_account: { id: from_account_id, new_balance: fromBalanceAfter },
        to_account: { id: to_account_id, new_balance: toBalanceAfter },
        transfer_out_transaction_id: transferOutResult.lastInsertRowid,
        transfer_in_transaction_id: transferInResult.lastInsertRowid
      }
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ success: false, error: 'Failed to process transfer' });
  }
};
