import { Router } from 'express';
import { body } from 'express-validator';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  getDashboard
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Dashboard
router.get('/dashboard', getDashboard);

// Favorites
router.get('/favorites', getFavorites);
router.post(
  '/favorites',
  [body('currency_id').isInt().withMessage('Currency ID required')],
  addFavorite
);
router.delete('/favorites/:currency_id', removeFavorite);

// Alerts
router.get('/alerts', getAlerts);
router.post(
  '/alerts',
  [
    body('currency_id').isInt().withMessage('Currency ID required'),
    body('target_rate').isFloat({ gt: 0 }).withMessage('Target rate must be positive'),
    body('alert_type').isIn(['above', 'below']).withMessage('Alert type must be above or below')
  ],
  createAlert
);
router.put('/alerts/:id', updateAlert);
router.delete('/alerts/:id', deleteAlert);

export default router;
