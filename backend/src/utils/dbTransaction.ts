import { DatabaseWrapper, saveDatabaseNow } from '../config/database';

/**
 * Execute a function within a database transaction with automatic rollback on error
 * Supports nested transactions by detecting if already in a transaction
 * @param db Database instance
 * @param fn Function to execute within transaction
 * @returns Result of the function
 * @throws Error if transaction fails
 */
export function withTransaction<T>(db: DatabaseWrapper, fn: () => T): T {
  // Check if we're already in a transaction
  let inTransaction = false;
  try {
    const result = db.prepare('PRAGMA in_transaction').get() as { in_transaction: number } | undefined;
    inTransaction = result?.in_transaction === 1;
  } catch (error) {
    // If PRAGMA fails, assume not in transaction
    inTransaction = false;
  }

  // If already in transaction, just execute without BEGIN/COMMIT
  if (inTransaction) {
    return fn();
  }

  // Start new transaction
  db.exec('BEGIN TRANSACTION');
  try {
    const result = fn();
    db.exec('COMMIT');
    // Force immediate save to prevent race condition with debounced saves
    saveDatabaseNow();
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

/**
 * Execute an async function within a database transaction with automatic rollback on error
 * Supports nested transactions by detecting if already in a transaction
 * @param db Database instance
 * @param fn Async function to execute within transaction
 * @returns Promise with result of the function
 * @throws Error if transaction fails
 */
export async function withTransactionAsync<T>(db: DatabaseWrapper, fn: () => Promise<T>): Promise<T> {
  // Check if we're already in a transaction
  let inTransaction = false;
  try {
    const result = db.prepare('PRAGMA in_transaction').get() as { in_transaction: number } | undefined;
    inTransaction = result?.in_transaction === 1;
  } catch (error) {
    // If PRAGMA fails, assume not in transaction
    inTransaction = false;
  }

  // If already in transaction, just execute without BEGIN/COMMIT
  if (inTransaction) {
    return await fn();
  }

  // Start new transaction
  db.exec('BEGIN TRANSACTION');
  try {
    const result = await fn();
    db.exec('COMMIT');
    // Force immediate save to prevent race condition with debounced saves
    saveDatabaseNow();
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
