import db from '../config/database';

/**
 * Generate a random 4-digit PIN for transaction verification
 */
export const generateSecretPin = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Generate unique reference code with hawaladar prefix
 * Format: HWL-PREFIX-YYYY-NNNNNN (e.g., HWL-KBL-2026-000001)
 */
export const generateReferenceCode = (hawaladarId: number): string => {
  const currentYear = new Date().getFullYear();

  // Get hawaladar prefix
  const hawaladar = db.prepare('SELECT hawaladar_prefix, name FROM hawaladars WHERE id = ?').get(hawaladarId) as any;

  if (!hawaladar) {
    throw new Error('Hawaladar not found');
  }

  // If no prefix set, generate one from first 3 letters of name
  let prefix = hawaladar.hawaladar_prefix;
  if (!prefix) {
    prefix = hawaladar.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    if (prefix.length < 3) {
      prefix = prefix.padEnd(3, 'X');
    }
  }

  // Get the current counter for this hawaladar
  const counterRow = db.prepare(`
    SELECT counter, year
    FROM hawala_reference_counter
    WHERE id = 1
  `).get() as { counter: number; year: number } | undefined;

  let newCounter = 1;

  if (counterRow) {
    // If year has changed, reset counter to 1
    if (counterRow.year !== currentYear) {
      db.prepare('UPDATE hawala_reference_counter SET counter = ?, year = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(newCounter, currentYear);
    } else {
      // Increment counter atomically
      newCounter = counterRow.counter + 1;
      db.prepare('UPDATE hawala_reference_counter SET counter = counter + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run();

      // Get the updated counter value
      const updated = db.prepare('SELECT counter FROM hawala_reference_counter WHERE id = 1').get() as { counter: number };
      newCounter = updated.counter;
    }
  } else {
    // Initialize counter if doesn't exist
    db.prepare('INSERT OR REPLACE INTO hawala_reference_counter (id, counter, year) VALUES (1, ?, ?)').run(newCounter, currentYear);
  }

  // Format: HWL-PREFIX-YYYY-NNNNNN (e.g., HWL-KBL-2026-000001)
  return `HWL-${prefix}-${currentYear}-${String(newCounter).padStart(6, '0')}`;
};

/**
 * Log an audit event for a hawala transaction
 */
export const logAuditEvent = (
  transactionId: number,
  action: string,
  actorId: number,
  actorName: string,
  details: any,
  ipAddress?: string,
  userAgent?: string
): void => {
  db.prepare(`
    INSERT INTO hawala_audit_log (
      transaction_id, action, actor_id, actor_name, details, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    transactionId,
    action,
    actorId,
    actorName,
    JSON.stringify(details),
    ipAddress || null,
    userAgent || null
  );
};

/**
 * Log a field change in transaction history
 */
export const logTransactionHistory = (
  transactionId: number,
  changedField: string,
  oldValue: any,
  newValue: any,
  changedBy: number,
  changeReason?: string
): void => {
  db.prepare(`
    INSERT INTO hawala_transaction_history (
      transaction_id, changed_field, old_value, new_value, changed_by, change_reason
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    transactionId,
    changedField,
    oldValue ? String(oldValue) : null,
    newValue ? String(newValue) : null,
    changedBy,
    changeReason || null
  );
};

/**
 * Validate transaction limits for a hawaladar
 */
export const validateTransactionLimits = (
  hawaladarId: number,
  amount: number,
  currencyId: number
): { valid: boolean; error?: string } => {
  // Get hawaladar limits
  const hawaladar = db.prepare(`
    SELECT max_transaction_amount, daily_transaction_limit
    FROM hawaladars
    WHERE id = ?
  `).get(hawaladarId) as any;

  if (!hawaladar) {
    return { valid: false, error: 'Hawaladar not found' };
  }

  // Check single transaction limit
  if (amount > hawaladar.max_transaction_amount) {
    return {
      valid: false,
      error: `Amount exceeds maximum transaction limit of ${hawaladar.max_transaction_amount}`
    };
  }

  // Check daily limit
  const today = new Date().toISOString().split('T')[0];
  const todayTotal = db.prepare(`
    SELECT COALESCE(SUM(total_amount), 0) as total
    FROM hawala_transactions
    WHERE sender_hawaladar_id = ?
      AND currency_id = ?
      AND DATE(created_at) = ?
      AND status != 'cancelled'
  `).get(hawaladarId, currencyId, today) as any;

  if (todayTotal.total + amount > hawaladar.daily_transaction_limit) {
    return {
      valid: false,
      error: `Daily transaction limit exceeded. Limit: ${hawaladar.daily_transaction_limit}, Today's total: ${todayTotal.total}, Requested: ${amount}`
    };
  }

  return { valid: true };
};

/**
 * Check if a transaction has expired
 */
export const isTransactionExpired = (transaction: any): boolean => {
  if (!transaction.expires_at) {
    return false;
  }

  const expiryDate = new Date(transaction.expires_at);
  const now = new Date();

  return now > expiryDate && transaction.status !== 'completed';
};

/**
 * Calculate expiration date (default 7 days from now)
 */
export const calculateExpirationDate = (daysFromNow: number = 7): string => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + daysFromNow);
  return expiry.toISOString();
};

/**
 * Validate immutable fields are not being changed
 */
export const validateImmutableFields = (
  updates: any,
  existingTransaction: any
): { valid: boolean; invalidFields?: string[] } => {
  // Fields that should never change after creation
  const immutableFields = [
    'reference_code',
    'created_at',
    'created_by',
    'sender_name',
    'receiver_name',
    'amount',
    'currency_id',
    'sender_hawaladar_id',
    'receiver_hawaladar_id',
    'transaction_direction',
    'secret_pin'
  ];

  const attemptedImmutableChanges = immutableFields.filter(field =>
    updates.hasOwnProperty(field) && updates[field] !== existingTransaction[field]
  );

  if (attemptedImmutableChanges.length > 0) {
    return {
      valid: false,
      invalidFields: attemptedImmutableChanges
    };
  }

  return { valid: true };
};
