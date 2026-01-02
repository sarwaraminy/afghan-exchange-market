import { Router } from 'express';
import { body } from 'express-validator';
import {
  // Hawaladars
  getHawaladars,
  getHawaladarById,
  createHawaladar,
  updateHawaladar,
  deleteHawaladar,
  // Transactions
  getTransactions,
  getTransactionById,
  getTransactionByCode,
  createTransaction,
  updateTransaction,
  updateTransactionStatus,
  deleteTransaction,
  // Reports
  getReportsSummary,
  getReportsByAgent,
  getReportsByCurrency
} from '../controllers/hawalaController';
import { authenticate, isAdmin, validateRequest } from '../middleware/auth';

const router = Router();

// ==================== HAWALADARS (AGENTS) ====================

// Get all hawaladars (authenticated users can view)
router.get('/agents', authenticate, getHawaladars);

// Get hawaladar by ID
router.get('/agents/:id', authenticate, getHawaladarById);

// Create hawaladar (admin only)
router.post(
  '/agents',
  authenticate,
  isAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('commission_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100')
  ],
  validateRequest,
  createHawaladar
);

// Update hawaladar (admin only)
router.put(
  '/agents/:id',
  authenticate,
  isAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('commission_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100')
  ],
  validateRequest,
  updateHawaladar
);

// Delete hawaladar (admin only)
router.delete('/agents/:id', authenticate, isAdmin, deleteHawaladar);

// ==================== TRANSACTIONS ====================

// Get all transactions (authenticated users can view)
router.get('/transactions', authenticate, getTransactions);

// Get transaction by ID
router.get('/transactions/:id', authenticate, getTransactionById);

// Get transaction by reference code
router.get('/transactions/code/:code', authenticate, getTransactionByCode);

// Create transaction (admin only)
router.post(
  '/transactions',
  authenticate,
  isAdmin,
  [
    body('sender_name').trim().notEmpty().withMessage('Sender name is required'),
    body('receiver_name').trim().notEmpty().withMessage('Receiver name is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('currency_id').isInt().withMessage('Currency is required'),
    body('commission_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100')
  ],
  validateRequest,
  createTransaction
);

// Update transaction (admin only)
router.put(
  '/transactions/:id',
  authenticate,
  isAdmin,
  [
    body('sender_name').optional().trim().notEmpty().withMessage('Sender name cannot be empty'),
    body('receiver_name').optional().trim().notEmpty().withMessage('Receiver name cannot be empty'),
    body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('commission_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100')
  ],
  validateRequest,
  updateTransaction
);

// Update transaction status (admin only)
router.put(
  '/transactions/:id/status',
  authenticate,
  isAdmin,
  [
    body('status').isIn(['pending', 'in_transit', 'completed', 'cancelled']).withMessage('Invalid status')
  ],
  validateRequest,
  updateTransactionStatus
);

// Delete transaction (admin only)
router.delete('/transactions/:id', authenticate, isAdmin, deleteTransaction);

// ==================== REPORTS ====================

// Get reports summary (authenticated users can view)
router.get('/reports/summary', authenticate, getReportsSummary);

// Get reports by agent (authenticated users can view)
router.get('/reports/by-agent', authenticate, getReportsByAgent);

// Get reports by currency (authenticated users can view)
router.get('/reports/by-currency', authenticate, getReportsByCurrency);

export default router;
