import { Router } from 'express';
import { body } from 'express-validator';
import {
  getMarkets,
  getCurrencies,
  getExchangeRates,
  getGoldRates,
  updateExchangeRate,
  createExchangeRate,
  deleteExchangeRate,
  updateGoldRate,
  createGoldRate,
  deleteGoldRate,
  createMarket,
  createCurrency,
  convert
} from '../controllers/ratesController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/markets', getMarkets);
router.get('/currencies', getCurrencies);
router.get('/exchange', getExchangeRates);
router.get('/gold', getGoldRates);
router.get('/convert', convert);

// Admin routes
router.post(
  '/exchange',
  authenticate,
  isAdmin,
  [
    body('market_id').isInt().withMessage('Market ID required'),
    body('currency_id').isInt().withMessage('Currency ID required'),
    body('buy_rate').isFloat({ gt: 0 }).withMessage('Buy rate must be positive'),
    body('sell_rate').isFloat({ gt: 0 }).withMessage('Sell rate must be positive')
  ],
  createExchangeRate
);

router.put(
  '/exchange/:id',
  authenticate,
  isAdmin,
  [
    body('buy_rate').isFloat({ gt: 0 }).withMessage('Buy rate must be positive'),
    body('sell_rate').isFloat({ gt: 0 }).withMessage('Sell rate must be positive')
  ],
  updateExchangeRate
);

router.delete('/exchange/:id', authenticate, isAdmin, deleteExchangeRate);

router.post(
  '/gold',
  authenticate,
  isAdmin,
  [
    body('type').trim().notEmpty().withMessage('Gold type required'),
    body('price_afn').isFloat({ gt: 0 }).withMessage('AFN price must be positive'),
    body('price_usd').isFloat({ gt: 0 }).withMessage('USD price must be positive')
  ],
  createGoldRate
);

router.put(
  '/gold/:id',
  authenticate,
  isAdmin,
  [
    body('price_afn').isFloat({ gt: 0 }).withMessage('AFN price must be positive'),
    body('price_usd').isFloat({ gt: 0 }).withMessage('USD price must be positive')
  ],
  updateGoldRate
);

router.delete('/gold/:id', authenticate, isAdmin, deleteGoldRate);

router.post(
  '/markets',
  authenticate,
  isAdmin,
  [body('name').trim().notEmpty().withMessage('Market name required')],
  createMarket
);

router.post(
  '/currencies',
  authenticate,
  isAdmin,
  [
    body('code').trim().isLength({ min: 3, max: 3 }).withMessage('Currency code must be 3 characters'),
    body('name').trim().notEmpty().withMessage('Currency name required')
  ],
  createCurrency
);

export default router;
