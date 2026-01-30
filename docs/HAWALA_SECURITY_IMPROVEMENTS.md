# Hawala System Security & Operational Improvements
## Implementation Date: January 17, 2026

This document outlines all security improvements, new features, and operational enhancements implemented in the Hawala system.

---

## 🔐 CRITICAL SECURITY IMPROVEMENTS

### 1. Hawaladar-Prefixed Reference Codes
**Problem:** Global counter could generate duplicate reference codes across multiple hawaladars
**Solution:** Reference codes now include hawaladar prefix
**Format:** `HWL-{PREFIX}-{YEAR}-{COUNTER}`
**Example:** `HWL-KBL-2026-000001` (Kabul), `HWL-HRT-2026-000002` (Herat)

**Benefits:**
- Prevents duplicate codes across locations
- Enables offline operation per hawaladar
- Makes codes more identifiable to origin

**Database Changes:**
```sql
ALTER TABLE hawaladars ADD COLUMN hawaladar_prefix TEXT UNIQUE;
```

---

### 2. Database-Level Locking for Payout
**Problem:** Race condition allows double payout if two employees process same transaction simultaneously
**Solution:** Atomic UPDATE with status check prevents concurrent completion

**Implementation:**
```typescript
// Atomic lock: Only ONE update succeeds
const lockResult = db.prepare(`
  UPDATE hawala_transactions
  SET status = 'completed', ...
  WHERE id = ? AND status != 'completed' AND status != 'cancelled'
`).run(...);

if (lockResult.changes === 0) {
  // Transaction already completed - fail safely
}
```

**Benefits:**
- Prevents double payment
- No race conditions
- Database enforces single completion

---

### 3. Secret PIN System
**Problem:** Attacker with reference code could impersonate receiver
**Solution:** 4-digit PIN generated at creation, verified at payout

**Workflow:**
1. Transaction created → generates secret PIN (e.g., "8472")
2. PIN printed on sender's receipt
3. Sender shares PIN with receiver via phone
4. At payout: Receiver must provide correct PIN

**Implementation:**
```typescript
// At creation
const secretPin = generateSecretPin(); // Random 4-digit

// At payout (optional but recommended)
if (secret_pin && secret_pin !== transaction.secret_pin) {
  return Error: "Invalid secret PIN";
}
```

**Database Changes:**
```sql
ALTER TABLE hawala_transactions ADD COLUMN secret_pin TEXT;
```

---

### 4. Transaction Expiration
**Problem:** Old pending transactions never cleaned up, enabling stale claims
**Solution:** 7-day expiration enforced at payout

**Implementation:**
```typescript
// At creation
expires_at = NOW() + 7 days

// At payout
if (NOW() > transaction.expires_at && status !== 'completed') {
  return Error: "Transaction expired. Contact sender.";
}
```

**Database Changes:**
```sql
ALTER TABLE hawala_transactions ADD COLUMN expires_at DATETIME;
```

---

### 5. Transaction Limits
**Problem:** No controls on transaction sizes or daily volumes
**Solution:** Per-hawaladar limits enforced at creation

**Limits:**
- `max_transaction_amount`: Maximum single transaction (default: 100,000)
- `daily_transaction_limit`: Maximum daily total (default: 500,000)

**Database Changes:**
```sql
ALTER TABLE hawaladars ADD COLUMN max_transaction_amount REAL DEFAULT 100000;
ALTER TABLE hawaladars ADD COLUMN daily_transaction_limit REAL DEFAULT 500000;
```

---

### 6. Jurisdiction-Based Access Control
**Problem:** Any hawaladar could complete any payout
**Solution:** Users linked to specific hawaladar, only they can complete payouts

**Implementation:**
```typescript
// JWT now includes hawaladar_id
if (user.hawaladarId !== transaction.receiver_hawaladar_id) {
  return Error: "Only receiving hawaladar can complete payout";
}
```

**Database Changes:**
```sql
ALTER TABLE users ADD COLUMN hawaladar_id INTEGER REFERENCES hawaladars(id);
```

---

### 7. Linked Transaction Support
**Problem:** No database relationship between outgoing/incoming pairs
**Solution:** Transactions can be linked via `linked_transaction_id`

**Workflow:**
1. Kabul creates OUTGOING: `HWL-KBL-2026-000001`
2. Herat creates INCOMING: Links to first transaction
3. Database stores relationship for tracing

**Database Changes:**
```sql
ALTER TABLE hawala_transactions ADD COLUMN linked_transaction_id INTEGER REFERENCES hawala_transactions(id);
ALTER TABLE hawala_transactions ADD COLUMN is_origin_transaction INTEGER DEFAULT 0;
```

---

## 📊 AUDIT & COMPLIANCE IMPROVEMENTS

### 1. Audit Log Table
**Purpose:** Track all critical actions on transactions

**Database Schema:**
```sql
CREATE TABLE hawala_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL,
  action TEXT NOT NULL,  -- 'created', 'payout_completed', 'payout_failed', 'cancelled'
  actor_id INTEGER NOT NULL,
  actor_name TEXT,
  details TEXT,  -- JSON with context
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Events Logged:**
- Transaction creation
- Payout completion
- Payout failures (with reason)
- Status changes
- Cancellations

---

### 2. Transaction History Table
**Purpose:** Track all field changes for audit trail

**Database Schema:**
```sql
CREATE TABLE hawala_transaction_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL,
  changed_field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by INTEGER NOT NULL,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  change_reason TEXT
);
```

**Use Cases:**
- Track receiver_phone corrections
- Log commission rate adjustments
- Audit all modifications

---

### 3. Immutability Rules
**Immutable Fields (Never Change):**
- reference_code
- created_at
- created_by
- sender_name
- receiver_name
- amount
- currency_id
- sender_hawaladar_id
- receiver_hawaladar_id
- transaction_direction
- secret_pin

**Editable Only When Pending:**
- receiver_phone
- commission_rate
- commission_type
- notes

**Implementation:**
```typescript
const immutableFields = ['reference_code', 'amount', 'sender_name', ...];
const invalidChanges = updates.filter(f => immutableFields.includes(f));

if (invalidChanges.length > 0) {
  return Error: `Cannot edit immutable fields: ${invalidChanges.join(', ')}`;
}
```

---

## 📈 NEW REPORTS

### 1. Net Position Report
**Endpoint:** `GET /api/hawala/reports/net-positions?currency_id=1`

**Purpose:** Show reconciliation status between hawaladar pairs

**Example Response:**
```json
{
  "hawaladar_a": "Kabul Saraf",
  "hawaladar_b": "Herat Saraf",
  "currency": "USD",
  "net_owed_to_a": 5000,  // Herat owes Kabul $5000
  "sent_by_a": 10000,
  "sent_by_b": 5000
}
```

---

### 2. Unpaid Hawalas Report
**Endpoint:** `GET /api/hawala/reports/unpaid-hawalas?status=pending&older_than_days=3`

**Purpose:** Track pending transactions with aging info

**Example Response:**
```json
{
  "count": 12,
  "total_amount": 45000,
  "transactions": [
    {
      "reference_code": "HWL-KBL-2026-000045",
      "sender_name": "Ahmad",
      "receiver_name": "Mohammad",
      "amount": 5000,
      "days_pending": 5,
      "expires_at": "2026-01-22"
    }
  ]
}
```

---

### 3. Commission Report
**Endpoint:** `GET /api/hawala/reports/commission?start_date=2026-01-01&end_date=2026-01-31`

**Purpose:** Track commission earned by each hawaladar

**Example Response:**
```json
{
  "hawaladar": "Kabul Saraf",
  "transaction_count": 125,
  "commission_added": 1800,  // Type='add'
  "commission_deducted": 700, // Type='deduct'
  "total_commission": 2500
}
```

---

### 4. Daily Cash Flow Report
**Endpoint:** `GET /api/hawala/reports/daily-cash-flow?date=2026-01-15&hawaladar_id=1`

**Purpose:** Daily account activity for a hawaladar

**Example Response:**
```json
{
  "date": "2026-01-15",
  "opening_balance": 50000,
  "cash_in": 12000,
  "cash_out": 8000,
  "closing_balance": 54000,
  "transactions_detail": [...]
}
```

---

### 5. Transaction Aging Report
**Endpoint:** `GET /api/hawala/reports/transaction-aging`

**Purpose:** Group pending transactions by age

**Example Response:**
```json
{
  "0-24 hours": { "count": 45, "amount": 120000, "alert": false },
  "1-3 days": { "count": 12, "amount": 35000, "alert": false },
  "3-7 days": { "count": 3, "amount": 8000, "alert": false },
  "over 7 days": { "count": 1, "amount": 2000, "alert": true }
}
```

---

## 🗄️ SETTLEMENT TRACKING

### Settlement Table
**Purpose:** Record manual settlements between hawaladars

**Database Schema:**
```sql
CREATE TABLE hawala_settlements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creditor_hawaladar_id INTEGER NOT NULL,
  debtor_hawaladar_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  currency_id INTEGER NOT NULL,
  settlement_method TEXT CHECK(settlement_method IN ('cash', 'goods', 'services', 'offset', 'other')),
  settlement_date DATE NOT NULL,
  notes TEXT,
  recorded_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Use Case:**
After reconciliation shows Herat owes Kabul $5000:
1. Herat brings cash to Kabul
2. Admin records settlement in system
3. Net position report reflects payment

---

## 📸 DAILY SNAPSHOTS

### Snapshot Table
**Purpose:** End-of-day account snapshots for variance detection

**Database Schema:**
```sql
CREATE TABLE daily_hawaladar_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hawaladar_id INTEGER NOT NULL,
  snapshot_date DATE NOT NULL,
  opening_balance REAL,
  closing_balance REAL,
  transactions_in_count INTEGER,
  transactions_out_count INTEGER,
  total_in_amount REAL,
  total_out_amount REAL,
  currency_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hawaladar_id, snapshot_date, currency_id)
);
```

**Benefits:**
- Track daily balances
- Detect discrepancies
- Historical reporting

---

## 🔄 UPDATED WORKFLOWS

### Transaction Creation Flow (with Security)

```
1. Validate transaction limits
   ├─ Check max_transaction_amount
   └─ Check daily_transaction_limit

2. Generate reference code
   └─ Format: HWL-{HAWALADAR_PREFIX}-{YEAR}-{COUNTER}

3. Generate secret PIN
   └─ Random 4-digit code

4. Set expiration date
   └─ 7 days from creation

5. Create transaction record
   └─ Include all security fields

6. Log audit event
   ├─ Action: 'created'
   ├─ IP address
   └─ User agent

7. Return transaction with PIN
   └─ PIN only shown once!
```

---

### Payout Flow (with Security)

```
1. Verify transaction found

2. Check expiration
   └─ If expired → FAIL with error

3. Verify secret PIN (if provided)
   └─ If mismatch → FAIL and log

4. Check jurisdiction
   └─ If wrong hawaladar → FAIL

5. ATOMIC DATABASE LOCK
   └─ UPDATE ... WHERE status != 'completed'
   └─ If no rows updated → FAIL (already paid)

6. Process account updates
   └─ Add funds to receiver account

7. Log audit event
   └─ Action: 'payout_completed'

8. Return updated transaction
```

---

## 🎯 SECURITY BEST PRACTICES

### 1. Rate Limiting (Recommended Future Enhancement)
- Limit payout attempts per transaction
- Prevent brute-force PIN attacks

### 2. SMS Notifications (Recommended)
- Notify sender when transaction created
- Notify receiver when money available
- Alert on payout completion

### 3. Geolocation Logging (Optional)
- Record GPS coordinates at payout
- Verify payout location matches hawaladar shop

### 4. Receipt Generation (Recommended)
- QR code with reference code
- Barcode scanning for faster lookup
- PDF receipt with terms

---

## 📋 MIGRATION CHECKLIST

- [x] Database schema migrations
- [x] Hawaladar prefix field
- [x] Transaction security fields
- [x] Audit log table
- [x] Transaction history table
- [x] Settlement table
- [x] Daily snapshot table
- [x] Helper functions
- [x] Controller updates
- [x] Route definitions
- [x] New report endpoints
- [ ] Frontend updates
- [ ] User documentation
- [ ] Admin training
- [ ] Testing on staging

---

## 🚀 DEPLOYMENT NOTES

### Database Migration
1. Backup existing database
2. Run backend server (migrations auto-apply)
3. Verify new tables created
4. Set hawaladar prefixes manually if needed

### Configuration
```typescript
// Set hawaladar prefixes
UPDATE hawaladars SET hawaladar_prefix = 'KBL' WHERE name = 'Kabul Saraf';
UPDATE hawaladars SET hawaladar_prefix = 'HRT' WHERE name = 'Herat Saraf';
UPDATE hawaladars SET hawaladar_prefix = 'KNR' WHERE name = 'Kandahar Saraf';

// Set transaction limits
UPDATE hawaladars
SET max_transaction_amount = 100000,
    daily_transaction_limit = 500000
WHERE is_active = 1;
```

### Testing
1. Create test transaction → verify PIN generated
2. Attempt payout with wrong PIN → verify failure
3. Attempt double payout → verify second fails
4. Check audit log → verify events recorded
5. Test all new reports → verify data accuracy

---

## 📞 SUPPORT

For questions or issues:
- Review code in `backend/src/controllers/hawalaController.ts`
- Check audit logs in `hawala_audit_log` table
- Consult transaction history in `hawala_transaction_history`

---

**Document Version:** 1.0
**Last Updated:** January 17, 2026
**Author:** System Implementation Team
