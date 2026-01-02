import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { User, ApiResponse } from '../types';
import { getJwtSecret, getJwtSignOptions } from '../config/jwt';
import { deleteProfilePicture, validateImageContent, saveProfilePicture } from '../middleware/upload';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, full_name, language, preferred_market_id, preferred_currency_id } = req.body;

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existingUser) {
      res.status(400).json({ success: false, error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = db.prepare(`
      INSERT INTO users (username, email, password, full_name, language, preferred_market_id, preferred_currency_id, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'user')
    `).run(username, email, hashedPassword, full_name || null, language || 'en', preferred_market_id || 1, preferred_currency_id || 1);

    const token = jwt.sign(
      { userId: result.lastInsertRowid, role: 'user' },
      getJwtSecret(),
      getJwtSignOptions()
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
          language: language || 'en',
          preferred_market_id: preferred_market_id || 1,
          preferred_currency_id: preferred_currency_id || 1
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
      getJwtSecret(),
      getJwtSignOptions()
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
          language: user.language,
          preferred_market_id: user.preferred_market_id,
          preferred_currency_id: user.preferred_currency_id,
          profile_picture: user.profile_picture
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
      SELECT id, username, email, full_name, role, language, preferred_market_id, preferred_currency_id, profile_picture, created_at
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
    const { full_name, language, preferred_market_id, preferred_currency_id, current_password, new_password } = req.body;
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
      UPDATE users SET
        full_name = COALESCE(?, full_name),
        language = COALESCE(?, language),
        preferred_market_id = COALESCE(?, preferred_market_id),
        preferred_currency_id = COALESCE(?, preferred_currency_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      full_name || null,
      language || null,
      preferred_market_id || null,
      preferred_currency_id || null,
      userId
    );

    const updatedUser = db.prepare(`
      SELECT id, username, email, full_name, role, language, preferred_market_id, preferred_currency_id, profile_picture FROM users WHERE id = ?
    `).get(userId);

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

export const uploadProfilePictureHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!req.file || !req.file.buffer) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    // Validate actual file content (not just MIME type)
    const validation = validateImageContent(req.file.buffer);
    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.error });
      return;
    }

    // Get current profile picture to delete it
    const currentUser = db.prepare('SELECT profile_picture FROM users WHERE id = ?').get(userId) as { profile_picture: string | null } | undefined;
    if (currentUser?.profile_picture) {
      deleteProfilePicture(currentUser.profile_picture);
    }

    // Save validated image to disk with correct extension
    const filename = saveProfilePicture(req.file.buffer, validation.format);

    // Update user with new profile picture filename
    db.prepare('UPDATE users SET profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(filename, userId);

    const updatedUser = db.prepare(`
      SELECT id, username, email, full_name, role, language, preferred_market_id, preferred_currency_id, profile_picture FROM users WHERE id = ?
    `).get(userId);

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload profile picture' });
  }
};

export const deleteProfilePictureHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    // Get current profile picture to delete it
    const currentUser = db.prepare('SELECT profile_picture FROM users WHERE id = ?').get(userId) as { profile_picture: string | null } | undefined;
    if (currentUser?.profile_picture) {
      deleteProfilePicture(currentUser.profile_picture);
    }

    // Remove profile picture from database
    db.prepare('UPDATE users SET profile_picture = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(userId);

    const updatedUser = db.prepare(`
      SELECT id, username, email, full_name, role, language, preferred_market_id, preferred_currency_id, profile_picture FROM users WHERE id = ?
    `).get(userId);

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete profile picture' });
  }
};
