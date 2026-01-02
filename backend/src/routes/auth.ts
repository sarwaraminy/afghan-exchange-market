import { Router } from 'express';
import { body } from 'express-validator';
import { login, getProfile, updateProfile, uploadProfilePictureHandler, deleteProfilePictureHandler } from '../controllers/authController';
import { authenticate, validateRequest } from '../middleware/auth';
import { uploadProfilePicture } from '../middleware/upload';

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

// Profile picture endpoints
router.post('/profile/picture', authenticate, uploadProfilePicture.single('picture'), uploadProfilePictureHandler);
router.delete('/profile/picture', authenticate, deleteProfilePictureHandler);

export default router;
