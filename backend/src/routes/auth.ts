import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { authenticate, validateRequest } from '../middleware/auth';

const router = Router();

// Password validation rules - require strong passwords
const passwordValidation = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/).withMessage('Password must contain at least one number')
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character');

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    passwordValidation
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password required')
  ],
  validateRequest,
  login
);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
