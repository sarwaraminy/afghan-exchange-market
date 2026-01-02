import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database';
import { User } from '../types';

export const getAllUsers = (req: Request, res: Response): void => {
  try {
    const users = db.prepare(`
      SELECT id, username, email, full_name, role, language, preferred_market_id, preferred_currency_id, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `).all() as Omit<User, 'password'>[];

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const { username, email, full_name, role, language, preferred_market_id, preferred_currency_id, password } = req.body;

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!existingUser) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Check if username or email is already taken by another user
    if (username || email) {
      const duplicate = db.prepare(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?'
      ).get(username || '', email || '', userId);

      if (duplicate) {
        res.status(400).json({ success: false, error: 'Username or email already taken' });
        return;
      }
    }

    // Update user fields
    const updates: string[] = [];
    const values: any[] = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (language !== undefined) {
      updates.push('language = ?');
      values.push(language);
    }
    if (preferred_market_id !== undefined) {
      updates.push('preferred_market_id = ?');
      values.push(preferred_market_id);
    }
    if (preferred_currency_id !== undefined) {
      updates.push('preferred_currency_id = ?');
      values.push(preferred_currency_id);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    const updatedUser = db.prepare(`
      SELECT id, username, email, full_name, role, language, preferred_market_id, preferred_currency_id, created_at, updated_at
      FROM users WHERE id = ?
    `).get(userId);

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
};

export const deleteUser = (req: Request, res: Response): void => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent deleting yourself
    if (req.user?.userId === userId) {
      res.status(400).json({ success: false, error: 'Cannot delete your own account' });
      return;
    }

    // Check if user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Delete user
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
};
