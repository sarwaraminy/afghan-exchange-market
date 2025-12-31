import { Request, Response } from 'express';
import db from '../config/database';
import { UserFavorite, PriceAlert, Currency } from '../types';

export const getFavorites = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;

    const favorites = db.prepare(`
      SELECT uf.*, c.code, c.name, c.name_fa, c.name_ps, c.flag_code,
             er.buy_rate, er.sell_rate
      FROM user_favorites uf
      JOIN currencies c ON uf.currency_id = c.id
      LEFT JOIN exchange_rates er ON er.currency_id = c.id AND er.market_id = 1
      WHERE uf.user_id = ?
    `).all(userId);

    res.json({ success: true, data: favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch favorites' });
  }
};

export const addFavorite = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    const { currency_id } = req.body;

    const existing = db.prepare(
      'SELECT id FROM user_favorites WHERE user_id = ? AND currency_id = ?'
    ).get(userId, currency_id);

    if (existing) {
      res.status(400).json({ success: false, error: 'Currency already in favorites' });
      return;
    }

    const result = db.prepare(
      'INSERT INTO user_favorites (user_id, currency_id) VALUES (?, ?)'
    ).run(userId, currency_id);

    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, error: 'Failed to add favorite' });
  }
};

export const removeFavorite = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    const { currency_id } = req.params;

    const result = db.prepare(
      'DELETE FROM user_favorites WHERE user_id = ? AND currency_id = ?'
    ).run(userId, currency_id);

    if (result.changes === 0) {
      res.status(404).json({ success: false, error: 'Favorite not found' });
      return;
    }

    res.json({ success: true, message: 'Favorite removed' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
};

export const getAlerts = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;

    const alerts = db.prepare(`
      SELECT pa.*, c.code, c.name, c.name_fa, c.name_ps
      FROM price_alerts pa
      JOIN currencies c ON pa.currency_id = c.id
      WHERE pa.user_id = ?
      ORDER BY pa.created_at DESC
    `).all(userId);

    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
};

export const createAlert = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    const { currency_id, target_rate, alert_type } = req.body;

    const result = db.prepare(`
      INSERT INTO price_alerts (user_id, currency_id, target_rate, alert_type)
      VALUES (?, ?, ?, ?)
    `).run(userId, currency_id, target_rate, alert_type);

    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ success: false, error: 'Failed to create alert' });
  }
};

export const updateAlert = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { target_rate, alert_type, is_active } = req.body;

    const existing = db.prepare(
      'SELECT id FROM price_alerts WHERE id = ? AND user_id = ?'
    ).get(id, userId);

    if (!existing) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }

    db.prepare(`
      UPDATE price_alerts
      SET target_rate = COALESCE(?, target_rate),
          alert_type = COALESCE(?, alert_type),
          is_active = COALESCE(?, is_active)
      WHERE id = ? AND user_id = ?
    `).run(
      target_rate || null,
      alert_type || null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id,
      userId
    );

    res.json({ success: true, message: 'Alert updated' });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ success: false, error: 'Failed to update alert' });
  }
};

export const deleteAlert = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const result = db.prepare(
      'DELETE FROM price_alerts WHERE id = ? AND user_id = ?'
    ).run(id, userId);

    if (result.changes === 0) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }

    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete alert' });
  }
};

export const getDashboard = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;

    const favoritesCount = db.prepare(
      'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?'
    ).get(userId) as { count: number };

    const alertsCount = db.prepare(
      'SELECT COUNT(*) as count FROM price_alerts WHERE user_id = ? AND is_active = 1'
    ).get(userId) as { count: number };

    const recentRates = db.prepare(`
      SELECT er.*, c.code, c.name, c.flag_code, m.name as market_name
      FROM exchange_rates er
      JOIN currencies c ON er.currency_id = c.id
      JOIN markets m ON er.market_id = m.id
      WHERE er.market_id = 1
      ORDER BY er.updated_at DESC
      LIMIT 5
    `).all();

    res.json({
      success: true,
      data: {
        favorites_count: favoritesCount.count,
        active_alerts_count: alertsCount.count,
        recent_rates: recentRates
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard' });
  }
};
