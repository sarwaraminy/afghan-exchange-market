import { Request, Response } from 'express';
import { getDb } from '../config/database';
import type { Customer, CustomerSavings, CustomerSavingsWithDetails } from '../types';

// Get all customers
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const customers = db.prepare(`
      SELECT * FROM customers
      ORDER BY created_at DESC
    `).all() as Customer[];

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Get customer by ID
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const customer = db.prepare(`
      SELECT * FROM customers WHERE id = ?
    `).get(parseInt(id)) as Customer | undefined;

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// Search customers
export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const db = getDb();

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchTerm = `%${q}%`;
    const customers = db.prepare(`
      SELECT * FROM customers
      WHERE first_name LIKE ?
         OR last_name LIKE ?
         OR tazkira_number LIKE ?
         OR phone LIKE ?
      ORDER BY created_at DESC
    `).all(searchTerm, searchTerm, searchTerm, searchTerm) as Customer[];

    res.json(customers);
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ error: 'Failed to search customers' });
  }
};

// Create customer
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, tazkira_number, phone } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!first_name || !last_name || !tazkira_number || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = getDb();

    // Check if tazkira number already exists
    const existing = db.prepare(`
      SELECT id FROM customers WHERE tazkira_number = ?
    `).get(tazkira_number);

    if (existing) {
      return res.status(400).json({ error: 'Customer with this Tazkira number already exists' });
    }

    const result = db.prepare(`
      INSERT INTO customers (first_name, last_name, tazkira_number, phone, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(first_name, last_name, tazkira_number, phone, userId);

    const customer = db.prepare(`
      SELECT * FROM customers WHERE id = ?
    `).get(result.lastInsertRowid) as Customer;

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// Update customer
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, tazkira_number, phone } = req.body;
    const db = getDb();

    // Check if customer exists
    const existing = db.prepare(`
      SELECT id FROM customers WHERE id = ?
    `).get(parseInt(id));

    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if tazkira number is taken by another customer
    const tazkiraExists = db.prepare(`
      SELECT id FROM customers WHERE tazkira_number = ? AND id != ?
    `).get(tazkira_number, parseInt(id));

    if (tazkiraExists) {
      return res.status(400).json({ error: 'Customer with this Tazkira number already exists' });
    }

    db.prepare(`
      UPDATE customers
      SET first_name = ?, last_name = ?, tazkira_number = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(first_name, last_name, tazkira_number, phone, parseInt(id));

    const customer = db.prepare(`
      SELECT * FROM customers WHERE id = ?
    `).get(parseInt(id)) as Customer;

    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Delete customer
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();

    // Check if customer has any savings accounts
    const hasSavings = db.prepare(`
      SELECT id FROM customer_savings WHERE customer_id = ? LIMIT 1
    `).get(parseInt(id));

    if (hasSavings) {
      return res.status(400).json({ error: 'Cannot delete customer with existing savings accounts' });
    }

    const result = db.prepare(`
      DELETE FROM customers WHERE id = ?
    `).run(parseInt(id));

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// Get all savings accounts with customer details
export const getAllSavingsAccounts = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const accounts = db.prepare(`
      SELECT
        cs.*,
        c.first_name,
        c.last_name,
        c.tazkira_number,
        c.phone,
        cur.code as currency_code,
        cur.name as currency_name,
        h.name as saraf_name
      FROM customer_savings cs
      JOIN customers c ON cs.customer_id = c.id
      JOIN currencies cur ON cs.currency_id = cur.id
      JOIN hawaladars h ON cs.saraf_id = h.id
      ORDER BY cs.created_at DESC
    `).all() as CustomerSavingsWithDetails[];

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching savings accounts:', error);
    res.status(500).json({ error: 'Failed to fetch savings accounts' });
  }
};

// Get customer's savings accounts
export const getCustomerSavingsAccounts = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const db = getDb();

    const accounts = db.prepare(`
      SELECT
        cs.*,
        c.first_name,
        c.last_name,
        c.tazkira_number,
        c.phone,
        cur.code as currency_code,
        cur.name as currency_name,
        h.name as saraf_name
      FROM customer_savings cs
      JOIN customers c ON cs.customer_id = c.id
      JOIN currencies cur ON cs.currency_id = cur.id
      JOIN hawaladars h ON cs.saraf_id = h.id
      WHERE cs.customer_id = ?
      ORDER BY cs.created_at DESC
    `).all(parseInt(customerId)) as CustomerSavingsWithDetails[];

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching customer savings accounts:', error);
    res.status(500).json({ error: 'Failed to fetch savings accounts' });
  }
};

// Create savings account for customer
export const createSavingsAccount = async (req: Request, res: Response) => {
  try {
    const { customer_id, saraf_id, currency_id } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!customer_id || !saraf_id || !currency_id) {
      return res.status(400).json({ error: 'Customer ID, Saraf ID, and Currency ID are required' });
    }

    const db = getDb();

    // Check if customer exists
    const customer = db.prepare(`SELECT id FROM customers WHERE id = ?`).get(customer_id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if account already exists
    const existing = db.prepare(`
      SELECT id FROM customer_savings
      WHERE customer_id = ? AND saraf_id = ? AND currency_id = ?
    `).get(customer_id, saraf_id, currency_id);

    if (existing) {
      return res.status(400).json({ error: 'Savings account already exists for this customer, saraf, and currency combination' });
    }

    const result = db.prepare(`
      INSERT INTO customer_savings (customer_id, saraf_id, currency_id, balance)
      VALUES (?, ?, ?, 0.0)
    `).run(customer_id, saraf_id, currency_id);

    const account = db.prepare(`
      SELECT
        cs.*,
        c.first_name,
        c.last_name,
        c.tazkira_number,
        c.phone,
        cur.code as currency_code,
        cur.name as currency_name,
        h.name as saraf_name
      FROM customer_savings cs
      JOIN customers c ON cs.customer_id = c.id
      JOIN currencies cur ON cs.currency_id = cur.id
      JOIN hawaladars h ON cs.saraf_id = h.id
      WHERE cs.id = ?
    `).get(result.lastInsertRowid) as CustomerSavingsWithDetails;

    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating savings account:', error);
    res.status(500).json({ error: 'Failed to create savings account' });
  }
};

// Deposit to customer savings account
export const depositToSavings = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { amount, notes } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const db = getDb();

    // Get savings account
    const account = db.prepare(`
      SELECT * FROM customer_savings WHERE id = ?
    `).get(parseInt(accountId)) as CustomerSavings | undefined;

    if (!account) {
      return res.status(404).json({ error: 'Savings account not found' });
    }

    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore + parseFloat(amount);

    // Update balance
    db.prepare(`
      UPDATE customer_savings
      SET balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(balanceAfter, account.id);

    // Record transaction
    db.prepare(`
      INSERT INTO account_transactions
      (account_type, account_id, transaction_type, amount, balance_before, balance_after, currency_id, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('customer_savings', account.id, 'deposit', amount, balanceBefore, balanceAfter, account.currency_id, notes || null, userId);

    // Return updated account with details
    const updatedAccount = db.prepare(`
      SELECT
        cs.*,
        c.first_name,
        c.last_name,
        c.tazkira_number,
        c.phone,
        cur.code as currency_code,
        cur.name as currency_name,
        h.name as saraf_name
      FROM customer_savings cs
      JOIN customers c ON cs.customer_id = c.id
      JOIN currencies cur ON cs.currency_id = cur.id
      JOIN hawaladars h ON cs.saraf_id = h.id
      WHERE cs.id = ?
    `).get(account.id) as CustomerSavingsWithDetails;

    res.json(updatedAccount);
  } catch (error) {
    console.error('Error depositing to savings:', error);
    res.status(500).json({ error: 'Failed to deposit to savings' });
  }
};

// Withdraw from customer savings account
export const withdrawFromSavings = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { amount, notes } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const db = getDb();

    // Get savings account
    const account = db.prepare(`
      SELECT * FROM customer_savings WHERE id = ?
    `).get(parseInt(accountId)) as CustomerSavings | undefined;

    if (!account) {
      return res.status(404).json({ error: 'Savings account not found' });
    }

    if (account.balance < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore - parseFloat(amount);

    // Update balance
    db.prepare(`
      UPDATE customer_savings
      SET balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(balanceAfter, account.id);

    // Record transaction
    db.prepare(`
      INSERT INTO account_transactions
      (account_type, account_id, transaction_type, amount, balance_before, balance_after, currency_id, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('customer_savings', account.id, 'withdraw', amount, balanceBefore, balanceAfter, account.currency_id, notes || null, userId);

    // Return updated account with details
    const updatedAccount = db.prepare(`
      SELECT
        cs.*,
        c.first_name,
        c.last_name,
        c.tazkira_number,
        c.phone,
        cur.code as currency_code,
        cur.name as currency_name,
        h.name as saraf_name
      FROM customer_savings cs
      JOIN customers c ON cs.customer_id = c.id
      JOIN currencies cur ON cs.currency_id = cur.id
      JOIN hawaladars h ON cs.saraf_id = h.id
      WHERE cs.id = ?
    `).get(account.id) as CustomerSavingsWithDetails;

    res.json(updatedAccount);
  } catch (error) {
    console.error('Error withdrawing from savings:', error);
    res.status(500).json({ error: 'Failed to withdraw from savings' });
  }
};

// Get transactions for a savings account
export const getSavingsTransactions = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const db = getDb();

    const transactions = db.prepare(`
      SELECT
        at.*,
        cur.code as currency_code,
        u.username as created_by_name
      FROM account_transactions at
      JOIN currencies cur ON at.currency_id = cur.id
      JOIN users u ON at.created_by = u.id
      WHERE at.account_type = 'customer_savings' AND at.account_id = ?
      ORDER BY at.created_at DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(accountId), parseInt(limit as string), parseInt(offset as string));

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching savings transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};
