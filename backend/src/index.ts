import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import db, { initializeDatabase } from './config/database';
import authRoutes from './routes/auth';
import ratesRoutes from './routes/rates';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';
import hawalaRoutes from './routes/hawala';
import accountRoutes from './routes/account';
import locationRoutes from './routes/location';
import customerRoutes from './routes/customer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Serve uploaded files BEFORE Helmet (to avoid restrictive CSP blocking cross-origin images)
// This route has its own security headers appropriate for static file serving
app.use('/uploads', (req, res, next) => {
  // Allow cross-origin access for images
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Basic security headers for static files
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Security middleware - Helmet for security headers (applied after static files)
app.use(helmet());

// CORS configuration - restrict to specific origins
// Support comma-separated list of origins in CORS_ORIGIN env variable
const getAllowedOrigins = (): string[] => {
  const originsString = process.env.CORS_ORIGIN || 'http://localhost:5173';
  return originsString.split(',').map(origin => origin.trim());
};

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps or curl requests) in development
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// General rate limiting - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(generalLimiter);

// Rate limiting for auth endpoints - 20 requests per 15 minutes (stricter in production)
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20'),
  message: { success: false, error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parser
app.use(express.json({ limit: '10kb' })); // Limit body size

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hawala', hawalaRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/customers', customerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);

  // In development, send detailed error info; in production, send generic message
  const errorResponse: { success: boolean; error: string; details?: string; stack?: string } = {
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error'
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(500).json(errorResponse);
});

// Check if admin user exists
const checkAdminExists = (): boolean => {
  try {
    const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
    return !!admin;
  } catch {
    return false;
  }
};

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();

    // Check for admin user and warn if missing
    if (!checkAdminExists()) {
      console.log('\n' + '!'.repeat(60));
      console.log('WARNING: No admin user found in the database!');
      console.log('Run the following command to create an admin:');
      console.log('  npm run reset-admin');
      console.log('!'.repeat(60) + '\n');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
