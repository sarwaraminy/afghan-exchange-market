import { Router } from 'express';
import { body } from 'express-validator';
import {
  // Hawaladar accounts
  getHawaladarAccount,
  createHawaladarAccount,
  hawaladarDeposit,
  hawaladarWithdraw,
  getHawaladarTransactions,
  // Customer accounts
  getCustomerAccount,
  createCustomerAccount,
  customerDeposit,
  customerWithdraw,
  getCustomerTransactions,
  // Transfers
  transferBetweenAccounts
} from '../controllers/accountController';
import { authenticate, isAdmin, validateRequest } from '../middleware/auth';

const router = Router();

// ==================== HAWALADAR ACCOUNTS ====================

// Get hawaladar account (admin only)
router.get('/hawaladar/:hawaladar_id', authenticate, isAdmin, getHawaladarAccount);

// Create hawaladar account (admin only)
router.post(
  '/hawaladar',
  authenticate,
  isAdmin,
  [
    body('hawaladar_id').isInt().withMessage('Hawaladar ID is required'),
    body('currency_id').isInt().withMessage('Currency ID is required'),
    body('initial_balance').optional().isFloat({ min: 0 }).withMessage('Initial balance must be non-negative')
  ],
  validateRequest,
  createHawaladarAccount
);

// Deposit to hawaladar account (admin only)
router.post(
  '/hawaladar/:hawaladar_id/deposit',
  authenticate,
  isAdmin,
  [
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('notes').optional().trim()
  ],
  validateRequest,
  hawaladarDeposit
);

// Withdraw from hawaladar account (admin only)
router.post(
  '/hawaladar/:hawaladar_id/withdraw',
  authenticate,
  isAdmin,
  [
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('notes').optional().trim()
  ],
  validateRequest,
  hawaladarWithdraw
);

// Get hawaladar transactions (admin only)
router.get('/hawaladar/:hawaladar_id/transactions', authenticate, isAdmin, getHawaladarTransactions);

// ==================== CUSTOMER ACCOUNTS ====================

// Get customer account (authenticated user)
router.get('/customer', authenticate, getCustomerAccount);

// Create customer account (authenticated user)
router.post(
  '/customer',
  authenticate,
  [
    body('currency_id').isInt().withMessage('Currency ID is required')
  ],
  validateRequest,
  createCustomerAccount
);

// Deposit to customer account (authenticated user)
router.post(
  '/customer/deposit',
  authenticate,
  [
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('notes').optional().trim()
  ],
  validateRequest,
  customerDeposit
);

// Withdraw from customer account (authenticated user)
router.post(
  '/customer/withdraw',
  authenticate,
  [
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('notes').optional().trim()
  ],
  validateRequest,
  customerWithdraw
);

// Get customer transactions (authenticated user)
router.get('/customer/transactions', authenticate, getCustomerTransactions);

// ==================== TRANSFERS ====================

// Transfer between accounts (admin only)
router.post(
  '/transfer',
  authenticate,
  isAdmin,
  [
    body('from_account_type').isIn(['hawaladar', 'customer']).withMessage('Invalid source account type'),
    body('from_account_id').isInt().withMessage('Source account ID is required'),
    body('to_account_type').isIn(['hawaladar', 'customer']).withMessage('Invalid destination account type'),
    body('to_account_id').isInt().withMessage('Destination account ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('notes').optional().trim()
  ],
  validateRequest,
  transferBetweenAccounts
);

export default router;
