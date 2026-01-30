import { Request, Response, NextFunction } from 'express';
import db from '../config/database';

/**
 * Middleware to check if a market name already exists
 */
export const validateUniqueMarketName = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name } = req.body;

  const existing = db.prepare(
    'SELECT id FROM markets WHERE name = ?'
  ).get(name);

  if (existing) {
    res.status(409).json({
      success: false,
      error: 'Market with this name already exists',
      field: 'name'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if a currency code already exists
 */
export const validateUniqueCurrencyCode = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { code } = req.body;

  const existing = db.prepare(
    'SELECT id FROM currencies WHERE code = ?'
  ).get(code);

  if (existing) {
    res.status(409).json({
      success: false,
      error: `Currency code '${code}' already exists`,
      field: 'code'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if exchange rate already exists for market-currency pair
 */
export const validateUniqueExchangeRate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { market_id, currency_id } = req.body;

  const existing = db.prepare(
    'SELECT id FROM exchange_rates WHERE market_id = ? AND currency_id = ?'
  ).get(market_id, currency_id);

  if (existing) {
    res.status(409).json({
      success: false,
      error: 'Exchange rate already exists for this market and currency',
      fields: { market_id, currency_id }
    });
    return;
  }

  next();
};

/**
 * Middleware to check if Tazkira number already exists
 */
export const validateUniqueTazkira = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { tazkira_number } = req.body;
  const customerId = req.params.id; // For updates

  if (!tazkira_number) {
    next();
    return;
  }

  let existing;
  if (customerId) {
    // For updates: check if tazkira exists for OTHER customers
    existing = db.prepare(
      'SELECT id FROM customers WHERE tazkira_number = ? AND id != ?'
    ).get(tazkira_number, customerId);
  } else {
    // For creates: check if tazkira exists at all
    existing = db.prepare(
      'SELECT id FROM customers WHERE tazkira_number = ?'
    ).get(tazkira_number);
  }

  if (existing) {
    res.status(409).json({
      success: false,
      error: 'Customer with this Tazkira number already exists',
      field: 'tazkira_number'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if username already exists
 */
export const validateUniqueUsername = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { username } = req.body;
  const userId = req.params.id; // For updates

  if (!username) {
    next();
    return;
  }

  let existing;
  if (userId) {
    // For updates: check if username exists for OTHER users
    existing = db.prepare(
      'SELECT id FROM users WHERE username = ? AND id != ?'
    ).get(username, userId);
  } else {
    // For creates: check if username exists at all
    existing = db.prepare(
      'SELECT id FROM users WHERE username = ?'
    ).get(username);
  }

  if (existing) {
    res.status(409).json({
      success: false,
      error: 'Username already exists',
      field: 'username'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if hawala reference code already exists
 */
export const validateUniqueReferenceCode = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { reference_code } = req.body;

  if (!reference_code) {
    next();
    return;
  }

  const existing = db.prepare(
    'SELECT id FROM hawala_transactions WHERE reference_code = ?'
  ).get(reference_code);

  if (existing) {
    res.status(409).json({
      success: false,
      error: 'Transaction with this reference code already exists',
      field: 'reference_code'
    });
    return;
  }

  next();
};
