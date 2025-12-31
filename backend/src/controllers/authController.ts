import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { User, ApiResponse } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, full_name, language } = req.body;

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existingUser) {
      res.status(400).json({ success: false, error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = db.prepare(`
      INSERT INTO users (username, email, password, full_name, language)
      VALUES (?, ?, ?, ?, ?)
    `).run(username, email, hashedPassword, full_name || null, language || 'en');

    const token = jwt.sign(
      { userId: result.lastInsertRowid, role: 'user' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: result.lastInsertRowid,
          username,
          email,
          full_name,
          role: 'user',
          language: language || 'en'
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          language: user.language
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

export const getProfile = (req: Request, res: Response): void => {
  try {
    const user = db.prepare(`
      SELECT id, username, email, full_name, role, language, created_at
      FROM users WHERE id = ?
    `).get(req.user?.userId) as Omit<User, 'password'> | undefined;

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { full_name, language, current_password, new_password } = req.body;
    const userId = req.user?.userId;

    if (new_password) {
      const user = db.prepare('SELECT password FROM users WHERE id = ?').get(userId) as { password: string };
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        res.status(400).json({ success: false, error: 'Current password is incorrect' });
        return;
      }
      const hashedPassword = await bcrypt.hash(new_password, 12);
      db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hashedPassword, userId);
    }

    db.prepare(`
      UPDATE users SET full_name = COALESCE(?, full_name), language = COALESCE(?, language), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(full_name || null, language || null, userId);

    const updatedUser = db.prepare(`
      SELECT id, username, email, full_name, role, language FROM users WHERE id = ?
    `).get(userId);

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};
