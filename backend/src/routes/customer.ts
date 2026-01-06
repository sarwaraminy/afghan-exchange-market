import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  getCustomers,
  getCustomerById,
  searchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAllSavingsAccounts,
  getCustomerSavingsAccounts,
  createSavingsAccount,
  depositToSavings,
  withdrawFromSavings,
  getSavingsTransactions
} from '../controllers/customerController';

const router = express.Router();

// Savings account routes (must come before /:id routes)
router.get('/savings/all', authenticate, getAllSavingsAccounts);
router.post('/savings', authenticate, createSavingsAccount);
router.get('/savings/:accountId/transactions', authenticate, getSavingsTransactions);
router.post('/savings/:accountId/deposit', authenticate, depositToSavings);
router.post('/savings/:accountId/withdraw', authenticate, withdrawFromSavings);

// Customer management routes (admin/hawaladar only)
router.get('/search', authenticate, searchCustomers);
router.get('/', authenticate, getCustomers);
router.post('/', authenticate, createCustomer);
router.get('/:id', authenticate, getCustomerById);
router.put('/:id', authenticate, updateCustomer);
router.delete('/:id', authenticate, isAdmin, deleteCustomer);

// Customer savings accounts (specific customer)
router.get('/:customerId/savings', authenticate, getCustomerSavingsAccounts);

export default router;
