import { Request, Response } from 'express';
import db from '../config/database';
import { News } from '../types';

export const getNews = (req: Request, res: Response): void => {
  try {
    const { category, limit = 10, offset = 0 } = req.query;

    let query = `
      SELECT n.*, u.username as author_name
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.is_published = 1
    `;

    const params: any[] = [];
    if (category) {
      query += ' AND n.category = ?';
      params.push(category);
    }

    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const news = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM news WHERE is_published = 1').get() as { count: number };

    res.json({
      success: true,
      data: {
        news,
        total: total.count,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch news' });
  }
};

export const getNewsById = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const news = db.prepare(`
      SELECT n.*, u.username as author_name
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.id = ? AND n.is_published = 1
    `).get(id);

    if (!news) {
      res.status(404).json({ success: false, error: 'News not found' });
      return;
    }

    res.json({ success: true, data: news });
  } catch (error) {
    console.error('Get news by id error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch news' });
  }
};

export const getAllNews = (req: Request, res: Response): void => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const news = db.prepare(`
      SELECT n.*, u.username as author_name
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit as string), parseInt(offset as string));

    const total = db.prepare('SELECT COUNT(*) as count FROM news').get() as { count: number };

    res.json({
      success: true,
      data: {
        news,
        total: total.count
      }
    });
  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch news' });
  }
};

export const createNews = (req: Request, res: Response): void => {
  try {
    const { title, title_fa, title_ps, content, content_fa, content_ps, category, image_url, is_published } = req.body;
    const authorId = req.user?.userId;

    const result = db.prepare(`
      INSERT INTO news (title, title_fa, title_ps, content, content_fa, content_ps, category, image_url, is_published, author_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      title_fa || null,
      title_ps || null,
      content,
      content_fa || null,
      content_ps || null,
      category || 'general',
      image_url || null,
      is_published ? 1 : 0,
      authorId
    );

    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ success: false, error: 'Failed to create news' });
  }
};

export const updateNews = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { title, title_fa, title_ps, content, content_fa, content_ps, category, image_url, is_published } = req.body;

    const existing = db.prepare('SELECT id FROM news WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'News not found' });
      return;
    }

    db.prepare(`
      UPDATE news
      SET title = COALESCE(?, title),
          title_fa = COALESCE(?, title_fa),
          title_ps = COALESCE(?, title_ps),
          content = COALESCE(?, content),
          content_fa = COALESCE(?, content_fa),
          content_ps = COALESCE(?, content_ps),
          category = COALESCE(?, category),
          image_url = COALESCE(?, image_url),
          is_published = COALESCE(?, is_published),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title || null,
      title_fa || null,
      title_ps || null,
      content || null,
      content_fa || null,
      content_ps || null,
      category || null,
      image_url || null,
      is_published !== undefined ? (is_published ? 1 : 0) : null,
      id
    );

    res.json({ success: true, message: 'News updated successfully' });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ success: false, error: 'Failed to update news' });
  }
};

export const deleteNews = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM news WHERE id = ?').run(id);

    if (result.changes === 0) {
      res.status(404).json({ success: false, error: 'News not found' });
      return;
    }

    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete news' });
  }
};
