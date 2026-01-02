import { Router } from 'express';
import { body } from 'express-validator';
import {
  getNews,
  getNewsById,
  getAllNews,
  createNews,
  updateNews,
  deleteNews
} from '../controllers/newsController';
import { authenticate, isAdmin, validateRequest } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getNews);
router.get('/:id', getNewsById);

// Admin routes
router.get('/admin/all', authenticate, isAdmin, getAllNews);

router.post(
  '/',
  authenticate,
  isAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('content').trim().notEmpty().withMessage('Content required'),
    body('image_url').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('Invalid image URL')
  ],
  validateRequest,
  createNews
);

router.put(
  '/:id',
  authenticate,
  isAdmin,
  [
    body('image_url').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('Invalid image URL')
  ],
  validateRequest,
  updateNews
);

router.delete('/:id', authenticate, isAdmin, deleteNews);

export default router;
