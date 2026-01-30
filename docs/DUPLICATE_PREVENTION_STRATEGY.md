# Comprehensive Duplicate Prevention Strategy

**Date:** January 30, 2026
**Goal:** Prevent duplicate data at every layer of the application

---

## Overview

This document outlines a **defense-in-depth** strategy to prevent duplicate records across the entire stack:

1. **Database Layer** - Schema constraints
2. **Backend API Layer** - Validation and error handling
3. **Frontend Layer** - UI prevention and data normalization
4. **Development Workflow** - Best practices and tools

---

## Layer 1: Database Schema Constraints (CRITICAL)

### Principle: "Make Invalid States Impossible"

The database should be the **ultimate source of truth** and enforce data integrity at the schema level.

### Implementation

#### 1.1 Add UNIQUE Constraints

**File:** [backend/src/config/database.ts](../backend/src/config/database.ts)

```sql
-- Markets: Unique by name
CREATE TABLE IF NOT EXISTS markets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,           -- ✅ Prevents duplicate names
  name_fa TEXT,
  name_ps TEXT,
  location TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Currencies: Unique by code
CREATE TABLE IF NOT EXISTS currencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,           -- ✅ Prevents duplicate codes (USD, EUR, etc.)
  name TEXT NOT NULL,
  symbol TEXT,
  is_active INTEGER DEFAULT 1
);

-- Exchange Rates: One rate per market-currency pair
CREATE TABLE IF NOT EXISTS exchange_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  market_id INTEGER NOT NULL,
  currency_id INTEGER NOT NULL,
  buy_rate REAL NOT NULL,
  sell_rate REAL NOT NULL,
  UNIQUE(market_id, currency_id),      -- ✅ Composite unique constraint
  FOREIGN KEY (market_id) REFERENCES markets(id),
  FOREIGN KEY (currency_id) REFERENCES currencies(id)
);

-- Hawala Transactions: Unique reference codes
CREATE TABLE IF NOT EXISTS hawala_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_code TEXT NOT NULL UNIQUE, -- ✅ Prevents duplicate codes
  sender_customer_id INTEGER,
  -- ... other fields
);

-- Customers: Unique Tazkira numbers
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tazkira_number TEXT UNIQUE,          -- ✅ One customer per Tazkira
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL
);

-- Users: Unique usernames
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,       -- ✅ One username per user
  email TEXT UNIQUE,                   -- ✅ One email per user
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL
);
```

#### 1.2 Check Constraints for Data Integrity

```sql
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tazkira_number TEXT UNIQUE,
  phone TEXT,
  -- ✅ Ensure valid phone format at DB level
  CHECK (phone IS NULL OR phone GLOB '+[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]*')
);
```

### Benefits
- ✅ Database enforces uniqueness automatically
- ✅ No duplicate data can ever be inserted
- ✅ `INSERT OR IGNORE` now works correctly
- ✅ Protects against bugs in application code

---

## Layer 2: Backend API Validation (IMPORTANT)

### Principle: "Fail Fast with Clear Error Messages"

Even with database constraints, provide clear validation at the API level for better user experience.

### Implementation

#### 2.1 Pre-Insert Validation

**File:** Create `backend/src/middleware/uniquenessValidation.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import db from '../config/database';

/**
 * Middleware to check if a market name already exists
 */
export const validateUniqueMarketName = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name } = req.body;

  const existing = db.prepare(
    'SELECT id FROM markets WHERE name = ?'
  ).get(name);

  if (existing) {
    res.status(409).json({
      success: false,
      error: 'Market with this name already exists',
      field: 'name'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if a currency code already exists
 */
export const validateUniqueCurrencyCode = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { code } = req.body;

  const existing = db.prepare(
    'SELECT id FROM currencies WHERE code = ?'
  ).get(code);

  if (existing) {
    res.status(409).json({
      success: false,
      error: `Currency code '${code}' already exists`,
      field: 'code'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if exchange rate already exists for market-currency pair
 */
export const validateUniqueExchangeRate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { market_id, currency_id } = req.body;

  const existing = db.prepare(
    'SELECT id FROM exchange_rates WHERE market_id = ? AND currency_id = ?'
  ).get(market_id, currency_id);

  if (existing) {
    res.status(409).json({
      success: false,
      error: 'Exchange rate already exists for this market and currency',
      fields: { market_id, currency_id }
    });
    return;
  }

  next();
};

/**
 * Middleware to check if Tazkira number already exists
 */
export const validateUniqueTazkira = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { tazkira_number } = req.body;

  if (!tazkira_number) {
    next();
    return;
  }

  const existing = db.prepare(
    'SELECT id FROM customers WHERE tazkira_number = ?'
  ).get(tazkira_number);

  if (existing) {
    res.status(409).json({
      success: false,
      error: 'Customer with this Tazkira number already exists',
      field: 'tazkira_number'
    });
    return;
  }

  next();
};
```

#### 2.2 Apply Validation to Routes

**File:** `backend/src/routes/rates.ts`

```typescript
import { validateUniqueMarketName, validateUniqueExchangeRate } from '../middleware/uniquenessValidation';

// Create market with validation
router.post('/markets',
  authenticate,
  requireAdmin,
  validateUniqueMarketName,  // ✅ Check before insert
  createMarket
);

// Create exchange rate with validation
router.post('/rates',
  authenticate,
  requireAdmin,
  validateUniqueExchangeRate,  // ✅ Check before insert
  createExchangeRate
);
```

#### 2.3 Handle Database Constraint Errors

**File:** `backend/src/controllers/ratesController.ts`

```typescript
export const createMarket = (req: Request, res: Response): void => {
  try {
    const { name, name_fa, name_ps, location } = req.body;

    const result = db.prepare(`
      INSERT INTO markets (name, name_fa, name_ps, location)
      VALUES (?, ?, ?, ?)
    `).run(name, name_fa || null, name_ps || null, location || null);

    res.status(201).json({
      success: true,
      data: { id: result.lastInsertRowid }
    });
  } catch (error: any) {
    console.error('Create market error:', error);

    // ✅ Handle UNIQUE constraint violation
    if (error.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({
        success: false,
        error: 'Market with this name already exists'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create market'
    });
  }
};
```

### Benefits
- ✅ Clear error messages for users
- ✅ Prevents unnecessary database operations
- ✅ HTTP 409 Conflict status code indicates duplicate
- ✅ Frontend can show user-friendly errors

---

## Layer 3: Frontend Prevention (USER EXPERIENCE)

### Principle: "Prevent User Mistakes, Handle Backend Errors Gracefully"

### Implementation

#### 3.1 Data Normalization on Fetch

**File:** `frontend/src/pages/Rates.tsx`

```typescript
const fetchData = async () => {
  try {
    const [marketsData, currenciesData] = await Promise.all([
      getMarkets(),
      getCurrencies()
    ]);

    // ✅ Defensive: Remove duplicates by ID
    const seenIds = new Set<number>();
    const uniqueMarkets = marketsData.filter(market => {
      if (seenIds.has(market.id)) {
        return false;
      }
      seenIds.add(market.id);
      return true;
    });

    // ✅ Also remove duplicates by name (extra safety)
    const seenNames = new Set<string>();
    const fullyUniqueMarkets = uniqueMarkets.filter(market => {
      if (seenNames.has(market.name.toLowerCase())) {
        console.warn(`Duplicate market name found: ${market.name}`);
        return false;
      }
      seenNames.add(market.name.toLowerCase());
      return true;
    });

    setMarkets(fullyUniqueMarkets);
    setCurrencies(currenciesData);

    if (fullyUniqueMarkets.length > 0 && selectedMarket === null) {
      setSelectedMarket(fullyUniqueMarkets[0].id);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
```

#### 3.2 Handle Duplicate Errors in Create/Update Forms

**File:** `frontend/src/pages/Rates.tsx`

```typescript
const handleCreateRate = async () => {
  try {
    await createExchangeRate(
      parseInt(newRateForm.market_id),
      parseInt(newRateForm.currency_id),
      parseFloat(newRateForm.buy_rate),
      parseFloat(newRateForm.sell_rate)
    );
    setCreateRateDialog(false);
    const data = await getExchangeRates(selectedMarket!);
    setRates(data);
  } catch (err: any) {
    // ✅ Handle 409 Conflict (duplicate) specifically
    if (err.response?.status === 409) {
      setError('This exchange rate already exists. Please update the existing rate instead.');
    } else {
      setError(err.response?.data?.error || t('admin.failedCreateRate'));
    }
  }
};
```

#### 3.3 Real-Time Validation in Forms

**File:** Create `frontend/src/components/forms/MarketForm.tsx`

```typescript
import { useState, useEffect } from 'react';
import { TextField, Alert } from '@mui/material';
import { getMarkets } from '../../services/api';

export const MarketForm = () => {
  const [name, setName] = useState('');
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [duplicateError, setDuplicateError] = useState('');

  useEffect(() => {
    // Load existing market names
    getMarkets().then(markets => {
      setExistingNames(markets.map(m => m.name.toLowerCase()));
    });
  }, []);

  const handleNameChange = (value: string) => {
    setName(value);

    // ✅ Real-time duplicate check
    if (existingNames.includes(value.toLowerCase())) {
      setDuplicateError('A market with this name already exists');
    } else {
      setDuplicateError('');
    }
  };

  return (
    <>
      <TextField
        label="Market Name"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        error={!!duplicateError}
        helperText={duplicateError}
      />
      {duplicateError && (
        <Alert severity="error">{duplicateError}</Alert>
      )}
    </>
  );
};
```

#### 3.4 Disable Submit When Duplicate Detected

```typescript
const isSubmitDisabled =
  !name.trim() ||
  !location.trim() ||
  duplicateError !== '' ||  // ✅ Disable if duplicate detected
  loading;

<Button
  variant="contained"
  onClick={handleSubmit}
  disabled={isSubmitDisabled}
>
  Create Market
</Button>
```

### Benefits
- ✅ Users see errors before submitting
- ✅ Clear feedback prevents confusion
- ✅ Defensive coding handles unexpected duplicates
- ✅ Better user experience

---

## Layer 4: Seed Script Best Practices

### Principle: "Idempotent Seeds - Safe to Run Multiple Times"

### Implementation

**File:** `backend/src/seed.ts`

```typescript
async function seed() {
  console.log('Initializing database...');
  await initializeDatabase();

  console.log('Seeding data...');

  // ✅ Strategy 1: Check before insert
  const markets = [
    { name: 'Sarai Shahzada', name_fa: 'سرای شهزاده', name_ps: 'سرای شهزاده', location: 'Kabul' },
    { name: 'Khorasan Market', name_fa: 'بازار خراسان', name_ps: 'د خراسان بازار', location: 'Herat' },
    { name: 'Da Afghanistan Bank', name_fa: 'د افغانستان بانک', name_ps: 'د افغانستان بانک', location: 'Kabul' }
  ];

  for (const market of markets) {
    // ✅ Check if exists
    const existing = db.prepare('SELECT id FROM markets WHERE name = ?').get(market.name);

    if (!existing) {
      // ✅ Only insert if doesn't exist
      db.prepare(`
        INSERT INTO markets (name, name_fa, name_ps, location)
        VALUES (?, ?, ?, ?)
      `).run(market.name, market.name_fa, market.name_ps, market.location);
      console.log(`✓ Created market: ${market.name}`);
    } else {
      console.log(`- Market already exists: ${market.name} (ID: ${existing.id})`);
    }
  }

  // ✅ Strategy 2: Use INSERT OR IGNORE with UNIQUE constraint
  // This now works because we added UNIQUE constraint!
  const insertMarket = db.prepare(`
    INSERT OR IGNORE INTO markets (name, name_fa, name_ps, location)
    VALUES (?, ?, ?, ?)
  `);

  for (const market of markets) {
    const result = insertMarket.run(market.name, market.name_fa, market.name_ps, market.location);
    if (result.changes > 0) {
      console.log(`✓ Created market: ${market.name}`);
    } else {
      console.log(`- Market already exists: ${market.name}`);
    }
  }

  // ✅ Strategy 3: Track seed execution
  const seedTracking = db.prepare(`
    CREATE TABLE IF NOT EXISTS seed_history (
      script_name TEXT PRIMARY KEY,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  seedTracking.run();

  const seedName = 'initial_markets_v1';
  const alreadyRun = db.prepare('SELECT 1 FROM seed_history WHERE script_name = ?').get(seedName);

  if (!alreadyRun) {
    // Run seed operations...

    // Mark as completed
    db.prepare('INSERT INTO seed_history (script_name) VALUES (?)').run(seedName);
    console.log(`✓ Seed '${seedName}' completed`);
  } else {
    console.log(`- Seed '${seedName}' already run, skipping`);
  }

  saveDatabaseNow();
}
```

### Benefits
- ✅ Safe to run seed script multiple times
- ✅ No duplicate data created
- ✅ Clear logging of what was created vs skipped
- ✅ Seed tracking prevents unnecessary operations

---

## Layer 5: Development Workflow

### 5.1 Pre-Commit Hooks

**File:** Create `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for common duplicate-prone patterns
echo "Checking for duplicate prevention..."

# Check if UNIQUE constraints exist on critical fields
if grep -r "CREATE TABLE.*markets" backend/src --include="*.ts" | grep -v "UNIQUE"; then
  echo "⚠️  Warning: markets table missing UNIQUE constraint"
fi

# Run tests
npm run test
```

### 5.2 Database Migration System

**File:** Create `backend/src/migrations/001_add_unique_constraints.ts`

```typescript
export const up = (db: Database) => {
  // Add UNIQUE constraint to existing table
  db.exec(`
    -- Create new table with constraint
    CREATE TABLE markets_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      name_fa TEXT,
      name_ps TEXT,
      location TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Copy data (automatically removes duplicates)
    INSERT INTO markets_new (id, name, name_fa, name_ps, location, is_active, created_at)
    SELECT MIN(id), name, name_fa, name_ps, location, is_active, created_at
    FROM markets
    GROUP BY name;

    -- Replace old table
    DROP TABLE markets;
    ALTER TABLE markets_new RENAME TO markets;
  `);
};

export const down = (db: Database) => {
  // Revert: remove UNIQUE constraint
  // (implementation depends on needs)
};
```

### 5.3 Automated Tests

**File:** Create `backend/tests/duplicates.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import db from '../src/config/database';

describe('Duplicate Prevention', () => {
  it('should not allow duplicate market names', () => {
    const marketData = {
      name: 'Test Market',
      location: 'Kabul'
    };

    // First insert should succeed
    const result1 = db.prepare(`
      INSERT INTO markets (name, location) VALUES (?, ?)
    `).run(marketData.name, marketData.location);
    expect(result1.changes).toBe(1);

    // Second insert should fail
    expect(() => {
      db.prepare(`
        INSERT INTO markets (name, location) VALUES (?, ?)
      `).run(marketData.name, marketData.location);
    }).toThrow(/UNIQUE constraint failed/);
  });

  it('should not allow duplicate exchange rates for same market-currency', () => {
    const rateData = {
      market_id: 1,
      currency_id: 1,
      buy_rate: 85,
      sell_rate: 86
    };

    // First insert should succeed
    const result1 = db.prepare(`
      INSERT INTO exchange_rates (market_id, currency_id, buy_rate, sell_rate)
      VALUES (?, ?, ?, ?)
    `).run(rateData.market_id, rateData.currency_id, rateData.buy_rate, rateData.sell_rate);
    expect(result1.changes).toBe(1);

    // Second insert should fail
    expect(() => {
      db.prepare(`
        INSERT INTO exchange_rates (market_id, currency_id, buy_rate, sell_rate)
        VALUES (?, ?, ?, ?)
      `).run(rateData.market_id, rateData.currency_id, 87, 88);
    }).toThrow(/UNIQUE constraint failed/);
  });
});
```

### 5.4 Monitoring & Alerts

**File:** Create `backend/src/utils/duplicateMonitor.ts`

```typescript
import db from '../config/database';

/**
 * Check for duplicate data across all tables
 * Run this periodically or in tests
 */
export const checkForDuplicates = (): {
  table: string;
  duplicates: number;
}[] => {
  const results = [];

  // Check markets
  const marketDupes = db.prepare(`
    SELECT COUNT(*) as count
    FROM (
      SELECT name, COUNT(*) as cnt
      FROM markets
      GROUP BY name
      HAVING cnt > 1
    )
  `).get() as { count: number };

  if (marketDupes.count > 0) {
    results.push({ table: 'markets', duplicates: marketDupes.count });
  }

  // Check currencies
  const currencyDupes = db.prepare(`
    SELECT COUNT(*) as count
    FROM (
      SELECT code, COUNT(*) as cnt
      FROM currencies
      GROUP BY code
      HAVING cnt > 1
    )
  `).get() as { count: number };

  if (currencyDupes.count > 0) {
    results.push({ table: 'currencies', duplicates: currencyDupes.count });
  }

  return results;
};

// Run on server start
export const runDuplicateCheck = () => {
  const duplicates = checkForDuplicates();

  if (duplicates.length > 0) {
    console.warn('⚠️  DUPLICATE DATA DETECTED:');
    duplicates.forEach(d => {
      console.warn(`   - ${d.table}: ${d.duplicates} duplicate entries`);
    });
  } else {
    console.log('✓ No duplicate data detected');
  }
};
```

**File:** `backend/src/index.ts`

```typescript
import { runDuplicateCheck } from './utils/duplicateMonitor';

// After database initialization
await initializeDatabase();
runDuplicateCheck();  // ✅ Check on startup

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Summary: Defense in Depth

| Layer | Prevention Method | Effectiveness |
|-------|------------------|---------------|
| **Database** | UNIQUE constraints | ✅ 100% - Impossible to insert duplicates |
| **Backend API** | Pre-insert validation | ✅ 95% - Catches before DB, better UX |
| **Frontend** | Real-time validation | ✅ 90% - Prevents user mistakes |
| **Frontend** | Data normalization | ✅ 85% - Handles unexpected duplicates |
| **Seeds** | Idempotent operations | ✅ 100% - Safe to run multiple times |
| **Tests** | Automated duplicate checks | ✅ 100% - Catches regressions |
| **Monitoring** | Startup duplicate scan | ✅ 100% - Early detection |

---

## Implementation Checklist

### Immediate (Critical)
- [x] Add UNIQUE constraints to database schema
- [ ] Update seed script to check before insert
- [ ] Add backend validation middleware
- [ ] Test that duplicates are rejected

### Short Term (Important)
- [ ] Create uniqueness validation middleware
- [ ] Apply validation to all create endpoints
- [ ] Add real-time validation to frontend forms
- [ ] Write automated tests for duplicate prevention

### Medium Term (Good to Have)
- [ ] Implement seed tracking system
- [ ] Add duplicate monitoring on server start
- [ ] Create database migration system
- [ ] Add pre-commit hooks

### Long Term (Optional)
- [ ] Comprehensive test suite for all tables
- [ ] Alerting system for duplicate detection
- [ ] Admin UI for data cleanup
- [ ] Audit logging for duplicate attempts

---

## Quick Reference Commands

```bash
# Check for duplicates
cd backend
npx tsx -e "
import db from './src/config/database';
const dupes = db.prepare('SELECT name, COUNT(*) as cnt FROM markets GROUP BY name HAVING cnt > 1').all();
console.log('Duplicates:', dupes);
"

# Clean up duplicates
cd backend
npx tsx cleanup-duplicate-markets.ts

# Run tests
npm test

# Check database schema
cd backend
npx tsx -e "
import db from './src/config/database';
const schema = db.prepare('SELECT sql FROM sqlite_master WHERE type=\"table\" AND name=\"markets\"').get();
console.log(schema.sql);
"
```

---

**Recommendation:** Implement all "Immediate" and "Short Term" items to ensure robust duplicate prevention.

**Status:** Strategy documented and ready for implementation ✅

---

**End of Document**
