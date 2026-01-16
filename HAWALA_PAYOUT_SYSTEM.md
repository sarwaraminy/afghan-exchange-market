# Hawala Payout System - Complete Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [How Hawala Works in Afghanistan](#how-hawala-works-in-afghanistan)
4. [Complete Workflow](#complete-workflow)
5. [Technical Implementation](#technical-implementation)
6. [Testing Guide](#testing-guide)
7. [Security Features](#security-features)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This system implements an **offline hawala transfer system** designed specifically for Afghan money changers (hawaladars/sarafs). Each hawaladar operates their own independent copy of the application - there is **no shared database** between locations.

### Key Characteristics:
- ✅ **Offline-first**: Works without internet connectivity
- ✅ **Decentralized**: Each hawaladar has their own database
- ✅ **Manual coordination**: Hawaladars communicate via phone/WhatsApp
- ✅ **Dual verification**: Requires both Tazkira (ID) and phone verification
- ✅ **Multi-language**: Supports English, Dari, and Pashto

---

## System Architecture

### Database Structure

**Transaction Direction Types:**
- `outgoing`: Money being sent out from this location
- `incoming`: Money being received for payout at this location

**Key Fields:**
```sql
hawala_transactions (
  id INTEGER PRIMARY KEY,
  reference_code TEXT UNIQUE,          -- e.g., HWL-2026-000001
  transaction_direction TEXT,          -- 'outgoing' or 'incoming'
  sender_name TEXT,
  sender_phone TEXT,
  sender_hawaladar_id INTEGER,
  receiver_name TEXT,
  receiver_phone TEXT,                 -- Expected phone (from sender)
  receiver_hawaladar_id INTEGER,
  amount REAL,
  currency_id INTEGER,
  status TEXT,                         -- 'pending', 'in_transit', 'completed', 'cancelled'
  receiver_tazkira_number TEXT,        -- Actual ID (verified at payout)
  payout_completed_by INTEGER,
  payout_completed_at DATETIME,
  ...
)
```

---

## How Hawala Works in Afghanistan

### Traditional Process (2026 Context)

1. **No Physical Money Movement**: Money doesn't physically move between cities
2. **Trust-Based Network**: Built on centuries-old trust relationships
3. **Debt Settlement**: Hawaladars settle debts periodically through:
   - Trade goods
   - Services
   - Netting opposite transactions
4. **Faster than Banks**: Typically 24-48 hours vs weeks for bank transfers
5. **Wide Reach**: Services remote areas without bank infrastructure

### Real-World Example:

**Scenario**: Sending $500 from Kabul to Herat

```
┌─────────────────────────────────────────────────────────────┐
│                        KABUL                                 │
│  Customer → Pays $500 → Sender Hawaladar                    │
│             Receives Reference Code: HWL-2026-000001        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    (Phone Call/WhatsApp)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        HERAT                                 │
│  Receiver Hawaladar → Records Incoming Transfer             │
│  Waits for receiver to arrive with ID                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    (Receiver Arrives)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Receiver shows Tazkira + Phone                             │
│  Hawaladar verifies → Pays $500 cash                        │
│  Transaction marked complete                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Complete Workflow

### Step 1: Create OUTGOING Transaction (Sender Location)

**Who**: Sender Hawaladar in Kabul
**When**: Customer brings cash to send

**Process:**
1. Customer arrives: "I want to send $500 to Ahmad Khan in Herat"
2. Click **"New Transaction"** button
3. Select **"Outgoing (Sending Out)"** direction
4. Fill in form:
   ```
   Transaction Type: Outgoing

   Sender Information:
   - Name: Mohammad Ali
   - Phone: 0700987654
   - Agent: (Optional - if taking from account)

   Receiver Information:
   - Name: Ahmad Khan
   - Phone: 0700123456 (as told by customer)
   - Agent: Select Herat Hawaladar (if known)

   Amount Details:
   - Amount: 500
   - Currency: USD
   - Commission: 2% (add to amount or deduct)
   ```
5. Click **"Save"**
6. System generates reference code: `HWL-2026-000001`
7. Give customer the reference code
8. **Manually call/message Herat Hawaladar:**
   - "Transfer HWL-2026-000001"
   - "Receiver: Ahmad Khan, 0700123456"
   - "Amount: $500"

### Step 2: Record INCOMING Transaction (Receiver Location)

**Who**: Receiver Hawaladar in Herat
**When**: After receiving call from Kabul

**Process:**
1. Receive call from Kabul Hawaladar
2. Click **"New Transaction"** button
3. Select **"Incoming (Receiving for Payout)"** direction
4. Fill in form with information from call:
   ```
   Transaction Type: Incoming

   Reference Code: HWL-2026-000001 (from Kabul)

   Sender Information:
   - Name: Mohammad Ali (from Kabul)
   - Agent: Select Kabul Hawaladar

   Receiver Information:
   - Name: Ahmad Khan
   - Phone: 0700123456 (expected)
   - Agent: (Your location)

   Amount Details:
   - Amount: 500
   - Currency: USD
   ```
5. Click **"Save"**
6. Transaction status: **"Pending"** (awaiting payout)
7. Wait for Ahmad Khan to arrive

### Step 3: Complete PAYOUT (Receiver Location)

**Who**: Receiver Hawaladar in Herat
**When**: Ahmad Khan arrives with ID

**Process:**
1. Ahmad Khan arrives: "I'm here for transfer HWL-2026-000001"
2. In transactions table, click **Search icon** (magnifying glass)
3. Enter reference code: `HWL-2026-000001`
4. Click **Search** → Transaction appears
5. Click **"Complete Payout"** button (green checkmark icon)
6. **Payout Dialog Opens** - showing:
   ```
   Transaction Details:
   - Reference Code: HWL-2026-000001
   - Sender: Mohammad Ali
   - Receiver: Ahmad Khan
   - Amount: $500 USD
   - Commission: $10 USD
   - Payout Amount: $490 USD (if commission deducted)
   ```
7. **Verify Receiver's Identity:**
   - Ask for **Tazkira (National ID)**
   - Ask for **Phone Number**

8. **Fill Verification Fields:**
   ```
   ⚠️ Warning: Please verify the receiver's identity before completing
   the payout. This action cannot be undone.

   Receiver Name Verification: Ahmad Khan (optional)
   └─ Type receiver's name to verify (recommended)

   Receiver Tazkira Number: [Enter 6-20 characters] *Required
   └─ e.g., 123456789

   Receiver Phone Number: [Enter 8-20 characters] *Required
   └─ e.g., 0700123456
   ```

9. Click **"Confirm Payout"** button
10. **Pay cash** to Ahmad Khan
11. Transaction status changes to **"Completed"**

---

## Technical Implementation

### Backend API Endpoints

#### 1. Create Transaction
```http
POST /api/hawala/transactions
Authorization: Bearer {token}

Request Body:
{
  "transaction_direction": "outgoing" | "incoming",
  "sender_name": "Mohammad Ali",
  "sender_phone": "0700987654",
  "receiver_name": "Ahmad Khan",
  "receiver_phone": "0700123456",
  "amount": 500,
  "currency_id": 1,
  "commission_rate": 2.0,
  "commission_type": "add" | "deduct",
  "notes": "Optional notes"
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "reference_code": "HWL-2026-000001",
    "transaction_direction": "outgoing",
    "status": "pending",
    ...
  }
}
```

#### 2. Search Transaction by Code
```http
GET /api/hawala/transactions/code/{referenceCode}
Authorization: Bearer {token}

Example: GET /api/hawala/transactions/code/HWL-2026-000001

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "reference_code": "HWL-2026-000001",
    "receiver_name": "Ahmad Khan",
    "amount": 500,
    "status": "pending",
    ...
  }
}
```

#### 3. Complete Payout
```http
POST /api/hawala/transactions/{id}/payout
Authorization: Bearer {token}

Request Body:
{
  "receiver_tazkira_number": "123456789",
  "receiver_phone": "0700123456"
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "reference_code": "HWL-2026-000001",
    "status": "completed",
    "receiver_tazkira_number": "123456789",
    "payout_completed_at": "2026-01-16T10:30:00Z",
    ...
  }
}
```

### Frontend Components

#### Transaction Form
- Location: `frontend/src/pages/Hawala.tsx` (lines 1827-2064)
- Features:
  - Transaction direction selector (blue info box)
  - Sender/receiver information fields
  - Amount and commission calculator
  - Payment method selection

#### Payout Dialog
- Location: `frontend/src/pages/Hawala.tsx` (lines 2083-2191)
- Features:
  - Transaction details display
  - Receiver name verification (optional)
  - Tazkira number input (required)
  - Phone number input (required)
  - Security warning
  - Validation before submission

### Database Migrations

All migrations are handled automatically in `backend/src/config/database.ts`:

```javascript
// Migration: Add transaction_direction field
if (!hasTransactionDirection) {
  db.exec("ALTER TABLE hawala_transactions ADD COLUMN transaction_direction TEXT DEFAULT 'outgoing' CHECK(transaction_direction IN ('outgoing', 'incoming'))");
}

// Migration: Add payout tracking fields
if (!hasReceiverTazkira) {
  db.exec('ALTER TABLE hawala_transactions ADD COLUMN receiver_tazkira_number TEXT');
  db.exec('ALTER TABLE hawala_transactions ADD COLUMN payout_completed_by INTEGER REFERENCES users(id)');
  db.exec('ALTER TABLE hawala_transactions ADD COLUMN payout_completed_at DATETIME');
}
```

---

## Testing Guide

### Test Scenario 1: Complete Outgoing → Incoming → Payout Flow

#### Setup:
- Two hawaladars registered: "Kabul Exchange" and "Herat Exchange"
- USD currency active
- Test users for both locations

#### Test Steps:

**1. Create Outgoing Transaction (Kabul)**
```
Login as: kabul_hawaladar
Navigate to: Hawala → Transactions tab
Click: "New Transaction" button

Fill form:
- Transaction Type: Outgoing ✅
- Sender Name: Test Sender
- Sender Phone: 0700111111
- Receiver Name: Test Receiver
- Receiver Phone: 0700222222
- Amount: 100
- Currency: USD
- Commission: 2%

Click: Save
Expected: Reference code generated (e.g., HWL-2026-000001)
Expected: Transaction appears in table with "Pending" status
```

**2. Record Incoming Transaction (Herat)**
```
Login as: herat_hawaladar
Navigate to: Hawala → Transactions tab
Click: "New Transaction" button

Fill form:
- Transaction Type: Incoming ✅
- Sender Name: Test Sender
- Sender Agent: Select "Kabul Exchange"
- Receiver Name: Test Receiver
- Receiver Phone: 0700222222
- Amount: 100
- Currency: USD

Click: Save
Expected: Transaction appears with "Pending" status
```

**3. Search and Complete Payout (Herat)**
```
Still logged in as: herat_hawaladar
Click: Search icon (magnifying glass)
Enter: HWL-2026-000001
Click: Search

Expected: Transaction found and displayed
Click: Complete Payout button (green checkmark)

Payout Dialog:
- Transaction details displayed ✅
- Enter Receiver Name: Test Receiver (optional)
- Enter Tazkira Number: 123456789
- Enter Phone Number: 0700222222

Click: Confirm Payout

Expected:
- Success message
- Transaction status changes to "Completed"
- Payout timestamp recorded
- Receiver verification details saved
```

### Test Scenario 2: Search by Code

```
Navigate to: Hawala → Transactions tab
Click: Search icon
Enter: HWL-2026-000001
Click: Search

Expected:
- Transaction details displayed in popup
- Shows all transaction information
- Reference code, sender, receiver, amount, status
```

### Test Scenario 3: Validation Tests

**Test Invalid Tazkira:**
```
Complete Payout Dialog:
- Enter Tazkira: 123 (too short)
- Enter Phone: 0700222222
Click: Confirm Payout

Expected: Error message "Tazkira number must be between 6 and 20 characters"
```

**Test Invalid Phone:**
```
Complete Payout Dialog:
- Enter Tazkira: 123456789
- Enter Phone: 070 (too short)
Click: Confirm Payout

Expected: Error message "Phone number must be between 8 and 20 characters"
```

**Test Empty Required Fields:**
```
Complete Payout Dialog:
- Leave Tazkira empty
- Leave Phone empty
Click: Confirm Payout

Expected: Confirm button disabled OR error message
```

### Test Scenario 4: Multi-Language Support

```
Test in English:
- Create transaction → All labels in English ✅
- Complete payout → All labels in English ✅

Switch to Dari (دری):
- Transaction Type: نوع معامله ✅
- Outgoing: خروجی (ارسال به خارج) ✅
- Incoming: ورودی (دریافت برای پرداخت) ✅
- Receiver Tazkira: شماره تذکره گیرنده ✅
- Receiver Phone: شماره تلفن گیرنده ✅

Switch to Pashto (پښتو):
- Transaction Type: د معاملې ډول ✅
- Outgoing: بهرته (بهر ته لېږل) ✅
- Incoming: راتلونکې (د تادیې لپاره ترلاسه کول) ✅
```

---

## Security Features

### 1. Dual Verification System
- **Tazkira Number**: Government-issued ID (6-20 characters)
- **Phone Number**: Contact verification (8-20 characters)
- Both are **required** before payout completion

### 2. Name Verification (Optional but Recommended)
- System pre-fills expected receiver name
- Hawaladar can type name to verify
- Warning shown if name doesn't match
- Requires confirmation to proceed

### 3. Irreversible Actions
- Payout completion cannot be undone
- Warning displayed: "This action cannot be undone"
- Requires explicit confirmation

### 4. Audit Trail
- Records who completed the payout (`payout_completed_by`)
- Records when payout was completed (`payout_completed_at`)
- Stores verified Tazkira and phone numbers
- Full transaction history maintained

### 5. Role-Based Access
- Admin: Full access (create, edit, delete, complete payout)
- Saraf (Hawaladar): Can complete payout for their transactions
- Authentication required for all operations

### 6. Reference Code Security
- Unique incremental codes: `HWL-{YEAR}-{NUMBER}`
- 6-digit zero-padded numbers (e.g., 000001)
- Resets annually
- Prevents duplicate transactions

---

## Troubleshooting

### Issue: Cannot Find Transaction by Code

**Problem**: Searching for reference code returns "Transaction not found"

**Possible Causes:**
1. Wrong reference code entered
2. Transaction created in different database (different hawaladar's system)
3. Typo in code

**Solutions:**
- Verify code with sender
- Check code format: HWL-YYYY-NNNNNN
- Use uppercase letters
- Check transactions table directly

### Issue: Payout Button Disabled

**Problem**: Cannot click "Complete Payout" button

**Possible Causes:**
1. Transaction already completed
2. Transaction cancelled
3. Not enough permissions

**Solutions:**
- Check transaction status column
- Verify user has appropriate role
- Refresh page and try again

### Issue: Validation Error on Payout

**Problem**: "Receiver Tazkira/Phone number is required"

**Solutions:**
- Ensure Tazkira is 6-20 characters
- Ensure Phone is 8-20 characters
- Remove spaces from entries
- Use only numbers and allowed characters

### Issue: Name Mismatch Warning

**Problem**: Warning appears when completing payout

**Explanation:**
- System detected that verified name doesn't match expected name
- This is a **warning**, not an error
- You can still proceed after confirmation

**Actions:**
- Double-check receiver's identity
- Verify with sender if needed
- Click "OK" to proceed if confident
- Click "Cancel" to re-verify

### Issue: Reference Code Not Generated

**Problem**: Transaction saved but no reference code shown

**Possible Causes:**
1. Database counter initialization failed
2. System error

**Solutions:**
- Check database: `SELECT * FROM hawala_reference_counter`
- Initialize counter manually:
  ```sql
  INSERT INTO hawala_reference_counter (id, counter, year)
  VALUES (1, 0, 2026);
  ```
- Contact system administrator

### Issue: Translations Missing

**Problem**: Text appears as translation keys (e.g., "hawala.outgoing")

**Solutions:**
- Verify language files loaded: `frontend/src/i18n/translations.ts`
- Check browser console for errors
- Clear browser cache
- Restart application

---

## Best Practices

### For Sender Hawaladars:

1. ✅ **Always verify customer identity** before accepting cash
2. ✅ **Double-check receiver information** - typos cause problems
3. ✅ **Record receiver's phone number** accurately - used for verification
4. ✅ **Call receiving hawaladar immediately** after creating transaction
5. ✅ **Keep reference code** for follow-up
6. ✅ **Mark transaction as "in_transit"** after confirming with receiver hawaladar

### For Receiver Hawaladars:

1. ✅ **Record incoming transactions immediately** when notified
2. ✅ **Verify receiver's Tazkira** before paying out
3. ✅ **Verify receiver's phone** matches expected number
4. ✅ **Check reference code** matches exactly
5. ✅ **Count cash carefully** before handing over
6. ✅ **Complete payout in system** immediately after paying

### For System Administrators:

1. ✅ **Backup database daily** - no recovery without backups
2. ✅ **Train staff** on proper procedures
3. ✅ **Monitor failed payouts** - investigate discrepancies
4. ✅ **Audit completed transactions** regularly
5. ✅ **Update reference counter** at year change

---

## Reference Code Format

### Structure:
```
HWL-YYYY-NNNNNN

HWL    = Hawala prefix
YYYY   = Current year (e.g., 2026)
NNNNNN = 6-digit incremental number (000001, 000002, ...)
```

### Examples:
- `HWL-2026-000001` - First transaction of 2026
- `HWL-2026-000123` - 123rd transaction of 2026
- `HWL-2026-999999` - 999,999th transaction of 2026
- `HWL-2027-000001` - First transaction of 2027 (counter resets)

### Counter Management:
- Stored in: `hawala_reference_counter` table
- Resets: Automatically at year change
- Thread-safe: Uses atomic increments
- Initialized: Automatically on first use

---

## Frequently Asked Questions (FAQ)

### Q1: Can I edit a transaction after payout is completed?
**A:** No, completed transactions cannot be edited. The payout action is irreversible to maintain audit integrity. If corrections are needed, create a new transaction.

### Q2: What happens if I enter wrong Tazkira/Phone during payout?
**A:** The system records whatever you enter. Always verify carefully before confirming. If you discover an error after completion, note it in transaction notes or create a correction record.

### Q3: Can two hawaladars use the same reference code?
**A:** No, each hawaladar's system generates unique codes. When recording an incoming transaction, you must use the exact code provided by the sending hawaladar.

### Q4: How do I handle partial payouts?
**A:** The current system does not support partial payouts. The full amount must be paid at once. For split payments, create multiple transactions.

### Q5: What if the receiver doesn't have a Tazkira?
**A:** A valid Tazkira is required for system compliance and security. Without proper ID, the payout cannot be completed in the system. Use alternative manual processes if necessary.

### Q6: How do I search for old transactions?
**A:** Use the search function by reference code, or filter by date/status in the transactions table. The system stores all transactions indefinitely.

### Q7: Can I cancel a completed payout?
**A:** No, payout completion is permanent. Status can only change from pending/in_transit to completed, never backwards.

### Q8: What's the difference between "Pending" and "In Transit" status?
**A:**
- **Pending**: Transaction created but receiver hawaladar not yet notified
- **In Transit**: Receiver hawaladar has been notified and recorded the incoming transaction
- **Completed**: Payout completed with verification

### Q9: Do both hawaladars see the same transaction?
**A:** No, this is an offline system. Each hawaladar has their own database. The sender creates an "outgoing" transaction, and the receiver creates a separate "incoming" transaction with the same reference code.

### Q10: How do I backup my transactions?
**A:** The database is stored in `backend/data/exchange.db`. Copy this file regularly to a safe location. Consider automated daily backups.

---

## Support and Maintenance

### Database Location:
```
backend/data/exchange.db
```

### Log Files:
```
Check console output when running:
npm run dev (development)
npm start (production)
```

### Important Tables:
- `hawala_transactions` - All hawala transactions
- `hawala_reference_counter` - Reference code counter
- `hawaladars` - Hawaladar (agent) information
- `users` - System users and permissions

### Common Maintenance Tasks:

**1. View All Transactions:**
```sql
SELECT
  reference_code,
  transaction_direction,
  sender_name,
  receiver_name,
  amount,
  status,
  created_at
FROM hawala_transactions
ORDER BY created_at DESC;
```

**2. View Pending Payouts:**
```sql
SELECT
  reference_code,
  receiver_name,
  receiver_phone,
  amount,
  currency_code
FROM hawala_transactions ht
JOIN currencies c ON ht.currency_id = c.id
WHERE status = 'pending'
  AND transaction_direction = 'incoming'
ORDER BY created_at;
```

**3. Check Reference Counter:**
```sql
SELECT * FROM hawala_reference_counter;
```

**4. Reset Counter for New Year:**
```sql
UPDATE hawala_reference_counter
SET counter = 0, year = 2027
WHERE id = 1;
```

---

## Version History

### Version 1.3.0 (Current)
- ✅ Added transaction direction (outgoing/incoming)
- ✅ Implemented dual verification (Tazkira + Phone)
- ✅ Added payout dialog with verification
- ✅ Complete translations (English, Dari, Pashto)
- ✅ Enhanced security features
- ✅ Improved audit trail

### Version 1.2.0
- Added hawala transaction management
- Reference code generation
- Basic payout tracking

### Version 1.1.0
- Initial hawala module
- Hawaladar (agent) management

---

## Credits

**System Design**: Based on authentic Afghan hawala practices
**Languages**: English, دری (Dari), پښتو (Pashto)
**Technology**: Node.js, TypeScript, React, SQLite, Material-UI

---

## License

Copyright © 2026 Afghan Exchange Market System
All rights reserved.

---

**Last Updated**: January 16, 2026
**Document Version**: 1.0
**System Version**: 1.3.0
