// JWT Configuration - separate file to avoid circular dependencies
import type { SignOptions } from 'jsonwebtoken';

// Ensure JWT_SECRET is configured
export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'your-super-secret-jwt-key-change-in-production') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set to a secure value in production');
    }
    console.warn('WARNING: Using default JWT_SECRET. Set a secure value for production!');
    return 'dev-secret-change-in-production';
  }
  return secret;
};

export const getJwtSignOptions = (): SignOptions => {
  return {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  } as SignOptions;
};
