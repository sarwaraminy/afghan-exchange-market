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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  `);

  // Create indexes
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_exchange_rates_market ON exchange_rates(market_id);
      CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency ON exchange_rates(currency_id);
      CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
      CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
    `);
  } catch (e) {
    // Indexes might already exist
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
