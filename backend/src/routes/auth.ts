import { Router } from 'express';
import { body } from 'express-validator';
import { login, getProfile, updateProfile } from '../controllers/authController';
import { authenticate, validateRequest } from '../middleware/auth';

const router = Router();

// Public registration is disabled - users are created via Admin panel (/api/admin/users)

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
