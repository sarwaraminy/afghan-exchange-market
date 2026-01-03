import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/exchange.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: SqlJsDatabase | null = null;
let saveTimeout: NodeJS.Timeout | null = null;

// Debounced save function
const saveDatabase = () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (db) {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    }
  }, 100);
};

// Immediate save function for use in seed scripts
export const saveDatabaseNow = (): void => {
  if (saveTimeout) clearTimeout(saveTimeout);
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

// Statement wrapper to mimic better-sqlite3 API
class StatementWrapper {
  private db: SqlJsDatabase;
  private sql: string;

  constructor(db: SqlJsDatabase, sql: string) {
    this.db = db;
    this.sql = sql;
  }

  get(...params: any[]): any {
    const stmt = this.db.prepare(this.sql);
    try {
      if (params.length > 0) {
        stmt.bind(params);
      }
      if (stmt.step()) {
        return stmt.getAsObject();
      }
      return undefined;
    } finally {
      stmt.free();
    }
  }

  all(...params: any[]): any[] {
    const results: any[] = [];
    const stmt = this.db.prepare(this.sql);
    try {
      if (params.length > 0) {
        stmt.bind(params);
      }
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      return results;
    } finally {
      stmt.free();
    }
  }

  run(...params: any[]): { lastInsertRowid: number; changes: number } {
    if (params.length > 0) {
      this.db.run(this.sql, params);
    } else {
      this.db.run(this.sql);
    }

    // Get last insert rowid and changes
    const lastIdResult = this.db.exec('SELECT last_insert_rowid() as id');
    const changesResult = this.db.exec('SELECT changes() as changes');

    const lastInsertRowid = lastIdResult.length > 0 && lastIdResult[0].values.length > 0
      ? Number(lastIdResult[0].values[0][0])
      : 0;
    const changes = changesResult.length > 0 && changesResult[0].values.length > 0
      ? Number(changesResult[0].values[0][0])
      : 0;

    saveDatabase();

    return { lastInsertRowid, changes };
  }
}

// Database wrapper
class DatabaseWrapper {
  private db: SqlJsDatabase;

  constructor(database: SqlJsDatabase) {
    this.db = database;
  }

  prepare(sql: string): StatementWrapper {
    return new StatementWrapper(this.db, sql);
  }

  exec(sql: string): void {
    this.db.exec(sql);
    saveDatabase();
  }

  pragma(pragma: string): void {
    // sql.js doesn't support all pragmas, but we can try
    try {
      this.db.exec(`PRAGMA ${pragma}`);
    } catch (e) {
      // Ignore pragma errors
    }
  }
}

let dbWrapper: DatabaseWrapper | null = null;

export const initializeDatabase = async (): Promise<void> => {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  dbWrapper = new DatabaseWrapper(db);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      language TEXT DEFAULT 'en' CHECK(language IN ('en', 'fa', 'ps')),
      preferred_market_id INTEGER DEFAULT 1,
      preferred_currency_id INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (preferred_market_id) REFERENCES markets(id),
      FOREIGN KEY (preferred_currency_id) REFERENCES currencies(id)
    );

    CREATE TABLE IF NOT EXISTS markets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_fa TEXT,
      name_ps TEXT,
      location TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS currencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      name_fa TEXT,
      name_ps TEXT,
      symbol TEXT,
      flag_code TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS exchange_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      market_id INTEGER NOT NULL,
      currency_id INTEGER NOT NULL,
      buy_rate REAL NOT NULL,
      sell_rate REAL NOT NULL,
      previous_buy_rate REAL,
      previous_sell_rate REAL,
      updated_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (market_id) REFERENCES markets(id),
      FOREIGN KEY (currency_id) REFERENCES currencies(id),
      FOREIGN KEY (updated_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS gold_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      price_afn REAL NOT NULL,
      price_usd REAL NOT NULL,
      previous_price_afn REAL,
      previous_price_usd REAL,
      unit TEXT DEFAULT 'gram',
      updated_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (updated_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_fa TEXT,
      title_ps TEXT,
      content TEXT NOT NULL,
      content_fa TEXT,
      content_ps TEXT,
      category TEXT DEFAULT 'general',
      image_url TEXT,
      is_published INTEGER DEFAULT 0,
      author_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      currency_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (currency_id) REFERENCES currencies(id),
      UNIQUE(user_id, currency_id)
    );

    CREATE TABLE IF NOT EXISTS price_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      currency_id INTEGER NOT NULL,
      target_rate REAL NOT NULL,
      alert_type TEXT CHECK(alert_type IN ('above', 'below')),
      is_active INTEGER DEFAULT 1,
      triggered_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (currency_id) REFERENCES currencies(id)
    );

    CREATE TABLE IF NOT EXISTS provinces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_fa TEXT,
      name_ps TEXT,
      code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS districts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      province_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      name_fa TEXT,
      name_ps TEXT,
      code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (province_id) REFERENCES provinces(id)
    );

    CREATE TABLE IF NOT EXISTS hawaladars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_fa TEXT,
      name_ps TEXT,
      phone TEXT,
      province_id INTEGER,
      district_id INTEGER,
      location TEXT NOT NULL,
      location_fa TEXT,
      location_ps TEXT,
      commission_rate REAL DEFAULT 2.0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (province_id) REFERENCES provinces(id),
      FOREIGN KEY (district_id) REFERENCES districts(id),
      UNIQUE(name, location)
    );

    CREATE TABLE IF NOT EXISTS saraf_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      saraf_id INTEGER UNIQUE NOT NULL,
      cash_balance REAL DEFAULT 0.0,
      currency_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (saraf_id) REFERENCES hawaladars(id),
      FOREIGN KEY (currency_id) REFERENCES currencies(id)
    );

    CREATE TABLE IF NOT EXISTS customer_savings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      saraf_id INTEGER NOT NULL,
      balance REAL DEFAULT 0.0,
      currency_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (saraf_id) REFERENCES hawaladars(id),
      FOREIGN KEY (currency_id) REFERENCES currencies(id),
      UNIQUE(user_id, saraf_id, currency_id)
    );

    CREATE TABLE IF NOT EXISTS account_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_type TEXT NOT NULL CHECK(account_type IN ('saraf_cash', 'customer_savings')),
      account_id INTEGER NOT NULL,
      transaction_type TEXT NOT NULL CHECK(transaction_type IN ('deposit', 'withdraw', 'transfer_in', 'transfer_out', 'hawala_send', 'hawala_receive')),
      amount REAL NOT NULL,
      balance_before REAL NOT NULL,
      balance_after REAL NOT NULL,
      currency_id INTEGER NOT NULL,
      reference_id INTEGER,
      notes TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (currency_id) REFERENCES currencies(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS hawala_reference_counter (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      counter INTEGER DEFAULT 0,
      year INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hawala_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_code TEXT UNIQUE NOT NULL,
      sender_name TEXT NOT NULL,
      sender_phone TEXT,
      sender_hawaladar_id INTEGER,
      receiver_name TEXT NOT NULL,
      receiver_phone TEXT,
      receiver_hawaladar_id INTEGER,
      amount REAL NOT NULL,
      currency_id INTEGER NOT NULL,
      commission_rate REAL DEFAULT 2.0,
      commission_amount REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_transit', 'completed', 'cancelled')),
      notes TEXT,
      sender_account_transaction_id INTEGER,
      receiver_account_transaction_id INTEGER,
      created_by INTEGER NOT NULL,
      completed_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (sender_hawaladar_id) REFERENCES hawaladars(id),
      FOREIGN KEY (receiver_hawaladar_id) REFERENCES hawaladars(id),
      FOREIGN KEY (currency_id) REFERENCES currencies(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (completed_by) REFERENCES users(id),
      FOREIGN KEY (sender_account_transaction_id) REFERENCES account_transactions(id),
      FOREIGN KEY (receiver_account_transaction_id) REFERENCES account_transactions(id)
    );
  `);

  // Create indexes
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_exchange_rates_market ON exchange_rates(market_id);
      CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency ON exchange_rates(currency_id);
      CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
      CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
      CREATE INDEX IF NOT EXISTS idx_hawala_transactions_status ON hawala_transactions(status);
      CREATE INDEX IF NOT EXISTS idx_hawala_transactions_sender ON hawala_transactions(sender_hawaladar_id);
      CREATE INDEX IF NOT EXISTS idx_hawala_transactions_receiver ON hawala_transactions(receiver_hawaladar_id);
      CREATE INDEX IF NOT EXISTS idx_hawala_transactions_code ON hawala_transactions(reference_code);
      CREATE INDEX IF NOT EXISTS idx_districts_province ON districts(province_id);
      CREATE INDEX IF NOT EXISTS idx_hawaladars_province ON hawaladars(province_id);
      CREATE INDEX IF NOT EXISTS idx_hawaladars_district ON hawaladars(district_id);
      CREATE INDEX IF NOT EXISTS idx_account_transactions_account ON account_transactions(account_type, account_id);
      CREATE INDEX IF NOT EXISTS idx_account_transactions_type ON account_transactions(transaction_type);
    `);
  } catch (e) {
    // Indexes might already exist
  }

  // Migration: Add province_id and district_id columns to hawaladars if they don't exist
  try {
    const columns = db.exec("PRAGMA table_info(hawaladars)");
    const hasProvinceId = columns.length > 0 &&
      columns[0].values.some((col: any) => col[1] === 'province_id');
    if (!hasProvinceId) {
      db.exec('ALTER TABLE hawaladars ADD COLUMN province_id INTEGER');
      db.exec('ALTER TABLE hawaladars ADD COLUMN district_id INTEGER');
      console.log('Added province_id and district_id columns to hawaladars table');
    }
  } catch (e) {
    // Columns might already exist
  }

  // Initialize reference counter for the current year
  try {
    const currentYear = new Date().getFullYear();
    const counterExists = db.exec('SELECT id FROM hawala_reference_counter WHERE id = 1');
    if (!counterExists || counterExists.length === 0 || counterExists[0].values.length === 0) {
      db.exec(`INSERT OR IGNORE INTO hawala_reference_counter (id, counter, year) VALUES (1, 0, ${currentYear})`);
      console.log('Initialized hawala reference counter');
    }
  } catch (e) {
    // Counter might already exist
  }

  // Migration: Add profile_picture column if it doesn't exist
  try {
    const columns = db.exec("PRAGMA table_info(users)");
    const hasProfilePicture = columns.length > 0 &&
      columns[0].values.some((col: any) => col[1] === 'profile_picture');
    if (!hasProfilePicture) {
      db.exec('ALTER TABLE users ADD COLUMN profile_picture TEXT');
      console.log('Added profile_picture column to users table');
    }
  } catch (e) {
    // Column might already exist or table not created yet
  }

  // Migration: Add sender_account_transaction_id and receiver_account_transaction_id to hawala_transactions
  try {
    const columns = db.exec("PRAGMA table_info(hawala_transactions)");
    const hasSenderAccountTransaction = columns.length > 0 &&
      columns[0].values.some((col: any) => col[1] === 'sender_account_transaction_id');
    if (!hasSenderAccountTransaction) {
      db.exec('ALTER TABLE hawala_transactions ADD COLUMN sender_account_transaction_id INTEGER');
      db.exec('ALTER TABLE hawala_transactions ADD COLUMN receiver_account_transaction_id INTEGER');
      console.log('Added account transaction tracking columns to hawala_transactions table');
    }
  } catch (e) {
    // Columns might already exist
  }

  // Migration: Add UNIQUE constraint to hawaladars table (name, location)
  try {
    const indexCheck = db.exec("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='hawaladars' AND name='idx_hawaladars_unique'");
    if (indexCheck.length === 0 || indexCheck[0].values.length === 0) {
      console.log('Adding UNIQUE constraint to hawaladars table...');

      // Create new table with UNIQUE constraint
      db.exec(`
        CREATE TABLE hawaladars_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          name_fa TEXT,
          name_ps TEXT,
          phone TEXT,
          province_id INTEGER,
          district_id INTEGER,
          location TEXT NOT NULL,
          location_fa TEXT,
          location_ps TEXT,
          commission_rate REAL DEFAULT 2.0,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (province_id) REFERENCES provinces(id),
          FOREIGN KEY (district_id) REFERENCES districts(id),
          UNIQUE(name, location)
        );
      `);

      // Copy data from old table (INSERT OR IGNORE will skip any remaining duplicates)
      db.exec(`
        INSERT OR IGNORE INTO hawaladars_new
        SELECT * FROM hawaladars;
      `);

      // Drop old table and rename new one
      db.exec('DROP TABLE hawaladars;');
      db.exec('ALTER TABLE hawaladars_new RENAME TO hawaladars;');

      // Create index for tracking this migration
      db.exec("CREATE INDEX idx_hawaladars_unique ON hawaladars(name, location);");

      console.log('Added UNIQUE constraint to hawaladars table');
    }
  } catch (e) {
    console.error('Hawaladars UNIQUE constraint migration error:', e);
  }

  // Migration: Rename hawaladar_accounts to saraf_accounts and customer_accounts to customer_savings
  try {
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = tables.length > 0 ? tables[0].values.map((row: any) => row[0]) : [];

    // Check if old tables exist and new ones don't
    if (tableNames.includes('hawaladar_accounts') && !tableNames.includes('saraf_accounts')) {
      console.log('Migrating hawaladar_accounts to saraf_accounts...');
      db.exec(`
        ALTER TABLE hawaladar_accounts RENAME TO saraf_accounts;
        ALTER TABLE saraf_accounts RENAME COLUMN hawaladar_id TO saraf_id;
        ALTER TABLE saraf_accounts RENAME COLUMN balance TO cash_balance;
      `);
      console.log('Renamed hawaladar_accounts to saraf_accounts');
    }

    if (tableNames.includes('customer_accounts') && !tableNames.includes('customer_savings')) {
      console.log('Migrating customer_accounts to customer_savings...');
      // Create new table with saraf_id
      db.exec(`
        CREATE TABLE customer_savings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          saraf_id INTEGER NOT NULL DEFAULT 1,
          balance REAL DEFAULT 0.0,
          currency_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (saraf_id) REFERENCES hawaladars(id),
          FOREIGN KEY (currency_id) REFERENCES currencies(id),
          UNIQUE(user_id, saraf_id, currency_id)
        );
      `);
      // Copy data from old table (assign all to first saraf)
      db.exec(`
        INSERT INTO customer_savings (id, user_id, saraf_id, balance, currency_id, created_at, updated_at)
        SELECT id, user_id, 1, balance, currency_id, created_at, updated_at
        FROM customer_accounts;
      `);
      db.exec('DROP TABLE customer_accounts;');
      console.log('Migrated customer_accounts to customer_savings');
    }

    // Update account_transactions table to use new account types
    const atColumns = db.exec("PRAGMA table_info(account_transactions)");
    if (atColumns.length > 0) {
      // Update account_type values
      db.exec(`
        UPDATE account_transactions
        SET account_type = 'saraf_cash'
        WHERE account_type = 'hawaladar';
      `);
      db.exec(`
        UPDATE account_transactions
        SET account_type = 'customer_savings'
        WHERE account_type = 'customer';
      `);
      console.log('Updated account transaction types');
    }
  } catch (e) {
    console.error('Migration error:', e);
    // Continue even if migration fails
  }

  // Save initial state
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);

  console.log('Database initialized successfully');
};

// Getter for database - throws if not initialized
export const getDb = (): DatabaseWrapper => {
  if (!dbWrapper) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbWrapper;
};

// For backward compatibility - will be a proxy that throws helpful error if used before init
const dbProxy = new Proxy({} as DatabaseWrapper, {
  get(target, prop) {
    if (!dbWrapper) {
      throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return (dbWrapper as any)[prop];
  }
});

export default dbProxy;
