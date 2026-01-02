import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db, { initializeDatabase } from './config/database';

/**
 * Admin Recovery Script
 *
 * This script creates or resets the system administrator account.
 * Run this if the admin user was accidentally deleted or you need to reset the password.
 *
 * Usage:
 *   npm run reset-admin                    # Generates a random password
 *   ADMIN_PASSWORD=mypassword npm run reset-admin  # Uses specified password
 */

async function resetAdmin() {
  console.log('='.repeat(60));
  console.log('ADMIN ACCOUNT RECOVERY');
  console.log('='.repeat(60));

  // Initialize database connection
  await initializeDatabase();

  const adminEmail = 'admin@afghanexchange.com';
  const adminUsername = 'admin';

  // Check if admin exists
  const existingAdmin = db.prepare(
    'SELECT id, username, email FROM users WHERE email = ? OR username = ?'
  ).get(adminEmail, adminUsername) as { id: number; username: string; email: string } | undefined;

  // Generate or use provided password
  const newPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  if (existingAdmin) {
    // Reset existing admin password
    console.log(`\nFound existing admin user (ID: ${existingAdmin.id})`);
    console.log('Resetting password...');

    db.prepare(`
      UPDATE users
      SET password = ?, role = 'admin', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(hashedPassword, existingAdmin.id);

    console.log('Password reset successfully!');
  } else {
    // Create new admin user
    console.log('\nNo admin user found. Creating new admin account...');

    db.prepare(`
      INSERT INTO users (username, email, password, full_name, role, language)
      VALUES (?, ?, ?, 'System Administrator', 'admin', 'en')
    `).run(adminUsername, adminEmail, hashedPassword);

    console.log('Admin user created successfully!');
  }

  // Display credentials
  console.log('\n' + '='.repeat(60));
  console.log('ADMIN CREDENTIALS');
  console.log('='.repeat(60));
  console.log(`Email:    ${adminEmail}`);
  console.log(`Username: ${adminUsername}`);
  console.log(`Password: ${newPassword}`);
  console.log('='.repeat(60));

  if (!process.env.ADMIN_PASSWORD) {
    console.log('\nWARNING: This password was randomly generated.');
    console.log('SAVE IT NOW - it will not be shown again!');
    console.log('\nTip: You can set a specific password using:');
    console.log('  ADMIN_PASSWORD=yourpassword npm run reset-admin');
  }

  console.log('\nYou can now login at: http://localhost:5173');
  console.log('');
}

resetAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error resetting admin:', error);
    process.exit(1);
  });
