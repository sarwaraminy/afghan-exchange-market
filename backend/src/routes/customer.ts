import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, isAdmin, validateRequest } from '../middleware/auth';
import { validateUniqueTazkira } from '../middleware/uniquenessValidation';
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
  getSavingsTransactions,
  getEligibleSavingsAccounts
} from '../controllers/customerController';

const router = express.Router();

// Validation rules for customer creation
const customerValidation = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters'),
  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Last name must be 1-100 characters'),
  body('tazkira_number')
    .trim()
    .notEmpty().withMessage('Tazkira number is required')
    .matches(/^[A-Z0-9]+(-[A-Z0-9]+)*$/i).withMessage('Tazkira number must be alphanumeric with optional hyphens between groups'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format')
];

// Validation rules for customer update (fields are optional)
const customerUpdateValidation = [
  body('first_name')
    .optional()
    .trim()
    .notEmpty().withMessage('First name cannot be empty')
    .isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters'),
  body('last_name')
    .optional()
    .trim()
    .notEmpty().withMessage('Last name cannot be empty')
    .isLength({ min: 1, max: 100 }).withMessage('Last name must be 1-100 characters'),
  body('tazkira_number')
    .optional()
    .trim()
    .notEmpty().withMessage('Tazkira number cannot be empty')
    .matches(/^[A-Z0-9]+(-[A-Z0-9]+)*$/i).withMessage('Tazkira number must be alphanumeric with optional hyphens between groups'),
  body('phone')
    .optional()
    .trim()
    .notEmpty().withMessage('Phone number cannot be empty')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format')
];

const savingsValidation = [
  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
    .toFloat(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

// Savings account routes (must come before /:id routes)
router.get('/savings/all', authenticate, getAllSavingsAccounts);
router.get('/savings/eligible', authenticate, getEligibleSavingsAccounts);
router.post('/savings', authenticate, createSavingsAccount);
router.get('/savings/:accountId/transactions', authenticate, getSavingsTransactions);
router.post('/savings/:accountId/deposit', authenticate, savingsValidation, validateRequest, depositToSavings);
router.post('/savings/:accountId/withdraw', authenticate, savingsValidation, validateRequest, withdrawFromSavings);

// Customer management routes (admin/hawaladar only)
router.get('/search', authenticate, searchCustomers);
router.get('/', authenticate, getCustomers);
router.post('/', authenticate, customerValidation, validateRequest, validateUniqueTazkira, createCustomer);
router.get('/:id', authenticate, getCustomerById);
router.put('/:id', authenticate, customerUpdateValidation, validateRequest, validateUniqueTazkira, updateCustomer);
router.delete('/:id', authenticate, isAdmin, deleteCustomer);

// Customer savings accounts (specific customer)
router.get('/:customerId/savings', authenticate, getCustomerSavingsAccounts);

export default router;
