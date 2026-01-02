# Database Documentation

## Overview

The Afghan Exchange Market uses SQLite as its database, accessed through sql.js (a JavaScript implementation of SQLite).

---

## Database Configuration

### Location
```
backend/data/exchange.db
```

### Connection
```typescript
// sql.js initialization
import initSqlJs from 'sql.js';

const SQL = await initSqlJs();
const db = new SQL.Database(existingData);
```

### Persistence
- Database is loaded from file on startup
- Changes are saved with debouncing (100ms)
- File is written on every modification

---

## Schema Definition

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'fa', 'ps')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | Unique identifier |
| username | TEXT | UNIQUE, NOT NULL | Display name |
| email | TEXT | UNIQUE, NOT NULL | Login email |
| password | TEXT | NOT NULL | Bcrypt hash |
| full_name | TEXT | - | Optional name |
| role | TEXT | CHECK | user or admin |
| language | TEXT | CHECK | en, fa, or ps |
| created_at | DATETIME | DEFAULT | Creation time |
| updated_at | DATETIME | DEFAULT | Last update |

---

### Markets Table

```sql
CREATE TABLE markets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_fa TEXT,
  name_ps TEXT,
  location TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | Unique identifier |
| name | TEXT | NOT NULL | English name |
| name_fa | TEXT | - | Dari name |
| name_ps | TEXT | - | Pashto name |
| location | TEXT | - | Physical location |
| is_active | INTEGER | DEFAULT 1 | Active status |
| created_at | DATETIME | DEFAULT | Creation time |

---

### Currencies Table

```sql
CREATE TABLE currencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_fa TEXT,
  name_ps TEXT,
  symbol TEXT,
  flag_code TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | Unique identifier |
| code | TEXT | UNIQUE, NOT NULL | ISO code (USD) |
| name | TEXT | NOT NULL | English name |
| name_fa | TEXT | - | Dari name |
| name_ps | TEXT | - | Pashto name |
| symbol | TEXT | - | Currency symbol |
| flag_code | TEXT | - | Country flag code |
| is_active | INTEGER | DEFAULT 1 | Active status |
| created_at | DATETIME | DEFAULT | Creation time |

---

### Exchange Rates Table

```sql
CREATE TABLE exchange_rates (
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

CREATE INDEX idx_exchange_rates_market ON exchange_rates(market_id);
CREATE INDEX idx_exchange_rates_currency ON exchange_rates(currency_id);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | Unique identifier |
| market_id | INTEGER | FK, NOT NULL | Reference to market |
| currency_id | INTEGER | FK, NOT NULL | Reference to currency |
| buy_rate | REAL | NOT NULL | Current buy rate |
| sell_rate | REAL | NOT NULL | Current sell rate |
| previous_buy_rate | REAL | - | Previous buy rate |
| previous_sell_rate | REAL | - | Previous sell rate |
| updated_by | INTEGER | FK | Admin who updated |
| created_at | DATETIME | DEFAULT | Creation time |
| updated_at | DATETIME | DEFAULT | Last update |

---

### Gold Rates Table

```sql
CREATE TABLE gold_rates (
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
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | Unique identifier |
| type | TEXT | NOT NULL | Gold type (24K, etc.) |
| price_afn | REAL | NOT NULL | Price in AFN |
| price_usd | REAL | NOT NULL | Price in USD |
| previous_price_afn | REAL | - | Previous AFN price |
| previous_price_usd | REAL | - | Previous USD price |
| unit | TEXT | DEFAULT | Price unit (gram) |
| updated_by | INTEGER | FK | Admin who updated |
| created_at | DATETIME | DEFAULT | Creation time |
| updated_at | DATETIME | DEFAULT | Last update |

---

### News Table

```sql
CREATE TABLE news (
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
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | Unique identifier |
| title | TEXT | NOT NULL | English title |
| title_fa | TEXT | - | Dari title |
| title_ps | TEXT | - | Pashto title |
| content | TEXT | NOT NULL | English content |
| content_fa | TEXT | - | Dari content |
| content_ps | TEXT | - | Pashto content |
| category | TEXT | DEFAULT | News category |
| image_url | TEXT | - | Featured image |
| is_published | INTEGER | DEFAULT 0 | Published status |
| author_id | INTEGER | FK | Author user ID |
| created_at | DATETIME | DEFAULT | Creation time |
| updated_at | DATETIME | DEFAULT | Last update |

---

### User Favorites Table

```sql
CREATE TABLE user_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  currency_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (currency_id) REFERENCES currencies(id),
  UNIQUE(user_id, currency_id)
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | Unique identifier |
| user_id | INTEGER | FK, NOT NULL | Reference to user |
| currency_id | INTEGER | FK, NOT NULL | Reference to currency |
| created_at | DATETIME | DEFAULT | When favorited |

---

### Price Alerts Table

```sql
CREATE TABLE price_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  currency_id INTEGER NOT NULL,
  target_rate REAL NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('above', 'below')),
  is_active INTEGER DEFAULT 1,
  triggered_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (currency_id) REFERENCES currencies(id)
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | Unique identifier |
| user_id | INTEGER | FK, NOT NULL | Reference to user |
| currency_id | INTEGER | FK, NOT NULL | Reference to currency |
| target_rate | REAL | NOT NULL | Target rate value |
| alert_type | TEXT | CHECK | above or below |
| is_active | INTEGER | DEFAULT 1 | Alert active status |
| triggered_at | DATETIME | - | When triggered |
| created_at | DATETIME | DEFAULT | Creation time |

---

## Common Queries

### Get Exchange Rates with Details

```sql
SELECT
  er.*,
  m.name as market_name,
  c.code as currency_code,
  c.name as currency_name,
  c.flag_code,
  CASE
    WHEN er.previous_buy_rate > 0
    THEN ROUND(((er.buy_rate - er.previous_buy_rate) / er.previous_buy_rate) * 100, 2)
    ELSE 0
  END as change_percent
FROM exchange_rates er
JOIN markets m ON er.market_id = m.id
JOIN currencies c ON er.currency_id = c.id
WHERE m.is_active = 1 AND c.is_active = 1
ORDER BY m.id, c.code;
```

### Get User Favorites with Rates

```sql
SELECT
  uf.*,
  c.code, c.name, c.name_fa, c.name_ps, c.flag_code,
  er.buy_rate, er.sell_rate
FROM user_favorites uf
JOIN currencies c ON uf.currency_id = c.id
LEFT JOIN exchange_rates er ON er.currency_id = c.id AND er.market_id = 1
WHERE uf.user_id = ?;
```

### Currency Conversion

```sql
-- Get rate for conversion
SELECT er.buy_rate, er.sell_rate
FROM exchange_rates er
JOIN currencies c ON er.currency_id = c.id
WHERE c.code = ? AND er.market_id = ?;
```

---

## Data Seeding

### Initial Admin User

```typescript
const adminPassword = await bcrypt.hash('admin123', 12);
db.prepare(`
  INSERT OR IGNORE INTO users (username, email, password, full_name, role)
  VALUES ('admin', 'admin@afghanexchange.com', ?, 'System Administrator', 'admin')
`).run(adminPassword);
```

### Sample Markets

```typescript
const markets = [
  { name: 'Sarai Shahzada', name_fa: 'سرای شهزاده', name_ps: 'سرای شهزاده', location: 'Kabul' },
  { name: 'Khorasan Market', name_fa: 'بازار خراسان', name_ps: 'د خراسان بازار', location: 'Herat' },
  { name: 'Da Afghanistan Bank', name_fa: 'د افغانستان بانک', name_ps: 'د افغانستان بانک', location: 'Kabul' }
];
```

### Sample Currencies

```typescript
const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag_code: 'us' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag_code: 'eu' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag_code: 'gb' },
  // ... more currencies
];
```

---

## Backup & Recovery

### Manual Backup

```bash
# Copy database file
cp backend/data/exchange.db backup/exchange-$(date +%Y%m%d).db
```

### Restore

```bash
# Stop application first
cp backup/exchange-YYYYMMDD.db backend/data/exchange.db
# Restart application
```

---

## Migration Considerations

### To PostgreSQL

When scaling, consider migrating to PostgreSQL:

1. Export SQLite data
2. Create PostgreSQL schema
3. Import data
4. Update database connection code
5. Test thoroughly

### Schema Changes

For schema changes:
1. Create migration script
2. Backup existing database
3. Apply migration
4. Verify data integrity
