import { Request, Response } from 'express';
import db from '../config/database';
import { ExchangeRateWithDetails, GoldRate, Market, Currency } from '../types';

export const getMarkets = (req: Request, res: Response): void => {
  try {
    const markets = db.prepare('SELECT * FROM markets WHERE is_active = 1').all() as Market[];
    res.json({ success: true, data: markets });
  } catch (error) {
    console.error('Get markets error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch markets' });
  }
};

export const getCurrencies = (req: Request, res: Response): void => {
  try {
    const currencies = db.prepare('SELECT * FROM currencies WHERE is_active = 1').all() as Currency[];
    res.json({ success: true, data: currencies });
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch currencies' });
  }
};

export const getExchangeRates = (req: Request, res: Response): void => {
  try {
    const { market_id } = req.query;

    let query = `
      SELECT
        er.*,
        m.name as market_name,
        c.code as currency_code,
        c.name as currency_name,
        c.flag_code,
        CASE
          WHEN er.previous_buy_rate > 0
          THEN ROUND(((er.buy_rate - er.previous_buy_rate) / er.previous_buy_rate) * 100, 2)
          ELSE 0
        END as change_percent
      FROM exchange_rates er
      JOIN markets m ON er.market_id = m.id
      JOIN currencies c ON er.currency_id = c.id
      WHERE m.is_active = 1 AND c.is_active = 1
    `;

    const params: any[] = [];
    if (market_id) {
      query += ' AND er.market_id = ?';
      params.push(market_id);
    }

    query += ' ORDER BY m.id, c.code';

    const rates = db.prepare(query).all(...params) as ExchangeRateWithDetails[];
    res.json({ success: true, data: rates });
  } catch (error) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch exchange rates' });
  }
};

export const getGoldRates = (req: Request, res: Response): void => {
  try {
    const rates = db.prepare('SELECT * FROM gold_rates ORDER BY type').all() as GoldRate[];
    res.json({ success: true, data: rates });
  } catch (error) {
    console.error('Get gold rates error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch gold rates' });
  }
};

export const updateExchangeRate = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { buy_rate, sell_rate } = req.body;
    const userId = req.user?.userId;

    const currentRate = db.prepare('SELECT buy_rate, sell_rate FROM exchange_rates WHERE id = ?').get(id) as { buy_rate: number; sell_rate: number } | undefined;

    if (!currentRate) {
      res.status(404).json({ success: false, error: 'Rate not found' });
      return;
    }

    db.prepare(`
      UPDATE exchange_rates
      SET buy_rate = ?, sell_rate = ?, previous_buy_rate = ?, previous_sell_rate = ?,
          updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(buy_rate, sell_rate, currentRate.buy_rate, currentRate.sell_rate, userId, id);

    res.json({ success: true, message: 'Rate updated successfully' });
  } catch (error) {
    console.error('Update exchange rate error:', error);
    res.status(500).json({ success: false, error: 'Failed to update rate' });
  }
};

export const createExchangeRate = (req: Request, res: Response): void => {
  try {
    const { market_id, currency_id, buy_rate, sell_rate } = req.body;
    const userId = req.user?.userId;

    const existing = db.prepare(
      'SELECT id FROM exchange_rates WHERE market_id = ? AND currency_id = ?'
    ).get(market_id, currency_id);

    if (existing) {
      res.status(400).json({ success: false, error: 'Rate already exists for this market and currency' });
      return;
    }

    const result = db.prepare(`
      INSERT INTO exchange_rates (market_id, currency_id, buy_rate, sell_rate, updated_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(market_id, currency_id, buy_rate, sell_rate, userId);

    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    console.error('Create exchange rate error:', error);
    res.status(500).json({ success: false, error: 'Failed to create rate' });
  }
};

export const updateGoldRate = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { price_afn, price_usd } = req.body;
    const userId = req.user?.userId;

    const currentRate = db.prepare('SELECT price_afn, price_usd FROM gold_rates WHERE id = ?').get(id) as GoldRate | undefined;

    if (!currentRate) {
      res.status(404).json({ success: false, error: 'Gold rate not found' });
      return;
    }

    db.prepare(`
      UPDATE gold_rates
      SET price_afn = ?, price_usd = ?, previous_price_afn = ?, previous_price_usd = ?,
          updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(price_afn, price_usd, currentRate.price_afn, currentRate.price_usd, userId, id);

    res.json({ success: true, message: 'Gold rate updated successfully' });
  } catch (error) {
    console.error('Update gold rate error:', error);
    res.status(500).json({ success: false, error: 'Failed to update gold rate' });
  }
};

export const createMarket = (req: Request, res: Response): void => {
  try {
    const { name, name_fa, name_ps, location } = req.body;

    const result = db.prepare(`
      INSERT INTO markets (name, name_fa, name_ps, location)
      VALUES (?, ?, ?, ?)
    `).run(name, name_fa || null, name_ps || null, location || null);

    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    console.error('Create market error:', error);
    res.status(500).json({ success: false, error: 'Failed to create market' });
  }
};

export const createCurrency = (req: Request, res: Response): void => {
  try {
    const { code, name, name_fa, name_ps, symbol, flag_code } = req.body;

    const result = db.prepare(`
      INSERT INTO currencies (code, name, name_fa, name_ps, symbol, flag_code)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(code, name, name_fa || null, name_ps || null, symbol || null, flag_code || null);

    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    console.error('Create currency error:', error);
    res.status(500).json({ success: false, error: 'Failed to create currency' });
  }
};

export const convert = (req: Request, res: Response): void => {
  try {
    const { from, to, amount, market_id } = req.query;

    if (!from || !amount) {
      res.status(400).json({ success: false, error: 'Missing required parameters' });
      return;
    }

    const fromCurrency = from as string;
    const toCurrency = (to as string) || 'AFN';
    const amountNum = parseFloat(amount as string);
    const marketId = market_id ? parseInt(market_id as string) : 1;

    if (fromCurrency === 'AFN' && toCurrency === 'AFN') {
      res.json({ success: true, data: { result: amountNum, rate: 1 } });
      return;
    }

    let result: number;
    let rate: number;

    if (fromCurrency === 'AFN') {
      const toRate = db.prepare(`
        SELECT er.sell_rate FROM exchange_rates er
        JOIN currencies c ON er.currency_id = c.id
        WHERE c.code = ? AND er.market_id = ?
      `).get(toCurrency, marketId) as { sell_rate: number } | undefined;

      if (!toRate) {
        res.status(404).json({ success: false, error: 'Currency not found' });
        return;
      }

      rate = 1 / toRate.sell_rate;
      result = amountNum * rate;
    } else if (toCurrency === 'AFN') {
      const fromRate = db.prepare(`
        SELECT er.buy_rate FROM exchange_rates er
        JOIN currencies c ON er.currency_id = c.id
        WHERE c.code = ? AND er.market_id = ?
      `).get(fromCurrency, marketId) as { buy_rate: number } | undefined;

      if (!fromRate) {
        res.status(404).json({ success: false, error: 'Currency not found' });
        return;
      }

      rate = fromRate.buy_rate;
      result = amountNum * rate;
    } else {
      const fromRate = db.prepare(`
        SELECT er.buy_rate FROM exchange_rates er
        JOIN currencies c ON er.currency_id = c.id
        WHERE c.code = ? AND er.market_id = ?
      `).get(fromCurrency, marketId) as { buy_rate: number } | undefined;

      const toRate = db.prepare(`
        SELECT er.sell_rate FROM exchange_rates er
        JOIN currencies c ON er.currency_id = c.id
        WHERE c.code = ? AND er.market_id = ?
      `).get(toCurrency, marketId) as { sell_rate: number } | undefined;

      if (!fromRate || !toRate) {
        res.status(404).json({ success: false, error: 'Currency not found' });
        return;
      }

      const afnAmount = amountNum * fromRate.buy_rate;
      rate = fromRate.buy_rate / toRate.sell_rate;
      result = afnAmount / toRate.sell_rate;
    }

    res.json({
      success: true,
      data: {
        from: fromCurrency,
        to: toCurrency,
        amount: amountNum,
        result: Math.round(result * 100) / 100,
        rate: Math.round(rate * 10000) / 10000
      }
    });
  } catch (error) {
    console.error('Convert error:', error);
    res.status(500).json({ success: false, error: 'Conversion failed' });
  }
};
