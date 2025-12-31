import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/exchange.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export const initializeDatabase = () => {
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

    CREATE INDEX IF NOT EXISTS idx_exchange_rates_market ON exchange_rates(market_id);
    CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency ON exchange_rates(currency_id);
    CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
    CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
  `);

  console.log('Database initialized successfully');
};

export default db;
