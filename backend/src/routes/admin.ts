import { Router } from 'express';
import { body } from 'express-validator';
import { getAllUsers, updateUser, deleteUser } from '../controllers/adminController';
import { authenticate, isAdmin, validateRequest } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

// Get all users
router.get('/users', getAllUsers);

// Update user
router.put(
  '/users/:id',
  [
    body('username').optional().trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
    body('language').optional().isIn(['en', 'fa', 'ps']).withMessage('Invalid language'),
    body('preferred_market_id').optional().isInt({ min: 1 }).withMessage('Invalid market ID'),
    body('preferred_currency_id').optional().isInt({ min: 1 }).withMessage('Invalid currency ID'),
    body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  validateRequest,
  updateUser
);

// Delete user
router.delete('/users/:id', deleteUser);

export default router;
