import { Request, Response } from 'express';
import db from '../config/database';
import { Province, District } from '../types';

// ==================== PROVINCES ====================

export const getProvinces = (req: Request, res: Response): void => {
  try {
    const provinces = db.prepare('SELECT * FROM provinces ORDER BY name').all() as Province[];
    res.json({ success: true, data: provinces });
  } catch (error) {
    console.error('Get provinces error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch provinces' });
  }
};

export const getProvinceById = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const province = db.prepare('SELECT * FROM provinces WHERE id = ?').get(id) as Province | undefined;

    if (!province) {
      res.status(404).json({ success: false, error: 'Province not found' });
      return;
    }

    res.json({ success: true, data: province });
  } catch (error) {
    console.error('Get province error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch province' });
  }
};

export const createProvince = (req: Request, res: Response): void => {
  try {
    const { name, name_fa, name_ps, code } = req.body;

    const result = db.prepare(`
      INSERT INTO provinces (name, name_fa, name_ps, code)
      VALUES (?, ?, ?, ?)
    `).run(name, name_fa || null, name_ps || null, code || null);

    const newProvince = db.prepare('SELECT * FROM provinces WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newProvince });
  } catch (error) {
    console.error('Create province error:', error);
    res.status(500).json({ success: false, error: 'Failed to create province' });
  }
};

export const updateProvince = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { name, name_fa, name_ps, code } = req.body;

    const existing = db.prepare('SELECT id FROM provinces WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Province not found' });
      return;
    }

    db.prepare(`
      UPDATE provinces
      SET name = ?, name_fa = ?, name_ps = ?, code = ?
      WHERE id = ?
    `).run(name, name_fa || null, name_ps || null, code || null, id);

    const updatedProvince = db.prepare('SELECT * FROM provinces WHERE id = ?').get(id);
    res.json({ success: true, data: updatedProvince });
  } catch (error) {
    console.error('Update province error:', error);
    res.status(500).json({ success: false, error: 'Failed to update province' });
  }
};

export const deleteProvince = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT id FROM provinces WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Province not found' });
      return;
    }

    // Check if province has districts
    const hasDistricts = db.prepare('SELECT id FROM districts WHERE province_id = ? LIMIT 1').get(id);
    if (hasDistricts) {
      res.status(400).json({ success: false, error: 'Cannot delete province with districts' });
      return;
    }

    db.prepare('DELETE FROM provinces WHERE id = ?').run(id);
    res.json({ success: true, message: 'Province deleted successfully' });
  } catch (error) {
    console.error('Delete province error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete province' });
  }
};

// ==================== DISTRICTS ====================

export const getDistricts = (req: Request, res: Response): void => {
  try {
    const { province_id } = req.query;

    let query = `
      SELECT
        d.*,
        p.name as province_name
      FROM districts d
      JOIN provinces p ON d.province_id = p.id
    `;

    const params: any[] = [];

    if (province_id) {
      query += ' WHERE d.province_id = ?';
      params.push(province_id);
    }

    query += ' ORDER BY p.name, d.name';

    const districts = db.prepare(query).all(...params);
    res.json({ success: true, data: districts });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch districts' });
  }
};

export const getDistrictById = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const district = db.prepare(`
      SELECT
        d.*,
        p.name as province_name
      FROM districts d
      JOIN provinces p ON d.province_id = p.id
      WHERE d.id = ?
    `).get(id);

    if (!district) {
      res.status(404).json({ success: false, error: 'District not found' });
      return;
    }

    res.json({ success: true, data: district });
  } catch (error) {
    console.error('Get district error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch district' });
  }
};

export const createDistrict = (req: Request, res: Response): void => {
  try {
    const { province_id, name, name_fa, name_ps, code } = req.body;

    // Check if province exists
    const province = db.prepare('SELECT id FROM provinces WHERE id = ?').get(province_id);
    if (!province) {
      res.status(404).json({ success: false, error: 'Province not found' });
      return;
    }

    const result = db.prepare(`
      INSERT INTO districts (province_id, name, name_fa, name_ps, code)
      VALUES (?, ?, ?, ?, ?)
    `).run(province_id, name, name_fa || null, name_ps || null, code || null);

    const newDistrict = db.prepare(`
      SELECT
        d.*,
        p.name as province_name
      FROM districts d
      JOIN provinces p ON d.province_id = p.id
      WHERE d.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: newDistrict });
  } catch (error) {
    console.error('Create district error:', error);
    res.status(500).json({ success: false, error: 'Failed to create district' });
  }
};

export const updateDistrict = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { province_id, name, name_fa, name_ps, code } = req.body;

    const existing = db.prepare('SELECT id FROM districts WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'District not found' });
      return;
    }

    // Check if province exists
    const province = db.prepare('SELECT id FROM provinces WHERE id = ?').get(province_id);
    if (!province) {
      res.status(404).json({ success: false, error: 'Province not found' });
      return;
    }

    db.prepare(`
      UPDATE districts
      SET province_id = ?, name = ?, name_fa = ?, name_ps = ?, code = ?
      WHERE id = ?
    `).run(province_id, name, name_fa || null, name_ps || null, code || null, id);

    const updatedDistrict = db.prepare(`
      SELECT
        d.*,
        p.name as province_name
      FROM districts d
      JOIN provinces p ON d.province_id = p.id
      WHERE d.id = ?
    `).get(id);

    res.json({ success: true, data: updatedDistrict });
  } catch (error) {
    console.error('Update district error:', error);
    res.status(500).json({ success: false, error: 'Failed to update district' });
  }
};

export const deleteDistrict = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT id FROM districts WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'District not found' });
      return;
    }

    // Check if district has hawaladars
    const hasHawaladars = db.prepare('SELECT id FROM hawaladars WHERE district_id = ? LIMIT 1').get(id);
    if (hasHawaladars) {
      res.status(400).json({ success: false, error: 'Cannot delete district with hawaladars' });
      return;
    }

    db.prepare('DELETE FROM districts WHERE id = ?').run(id);
    res.json({ success: true, message: 'District deleted successfully' });
  } catch (error) {
    console.error('Delete district error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete district' });
  }
};
