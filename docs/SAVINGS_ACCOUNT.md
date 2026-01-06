# Customer Savings Account System

## Overview

The Customer Savings Account system allows hawaladars (money keepers/sarfs) to manage physical cash deposits for their customers. This is a traditional Afghan banking practice where customers physically visit the hawaladar to deposit or withdraw money.

**Important:** This system is managed entirely by the hawaladar. Customers do NOT have login access to the system. All operations (deposits, withdrawals, account creation) are performed by the hawaladar when the customer visits in person.

## Business Flow

```
Customer visits Hawaladar → Hawaladar creates customer profile →
Hawaladar creates savings account → Customer deposits cash →
Hawaladar records deposit in system → Balance updated
```

### Real-World Scenario
1. A customer walks into the hawaladar's shop with cash
2. Hawaladar looks up the customer's profile (or creates a new one)
3. Hawaladar finds the customer's savings account
4. Customer hands over cash (e.g., 10,000 AFN)
5. Hawaladar enters the deposit amount in the system
6. System updates the customer's balance
7. Customer receives a receipt (optional)

## Database Schema Changes

### New Table: `customers`

```sql
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  tazkira_number TEXT UNIQUE NOT NULL,  -- Afghan National ID
  phone TEXT NOT NULL,
  created_by INTEGER NOT NULL,          -- User ID of hawaladar who created this
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Key Points:**
- `tazkira_number` is unique to prevent duplicate customer records
- Customers are NOT users - they don't have login credentials
- `created_by` tracks which hawaladar created the customer profile

### Updated Table: `customer_savings`

**Before:**
```sql
customer_savings (
  id, user_id, balance, currency_id, ...
)
```

**After:**
```sql
customer_savings (
  id, customer_id, saraf_id, balance, currency_id, ...
)
```

**Changes:**
- Replaced `user_id` with `customer_id` (references `customers` table)
- Added `saraf_id` to track which hawaladar holds the money
- Added `UNIQUE(customer_id, saraf_id, currency_id)` constraint
  - A customer can have only ONE account per saraf per currency
  - But can have multiple accounts with different sarfs or currencies

### Migration Handled Automatically

The database automatically migrates existing data on server startup:
```sql
-- Creates customers table if it doesn't exist
-- Migrates any existing user-based savings to customer-based
-- No manual intervention needed
```

## API Endpoints

### Customer Management

#### Get All Customers
```http
GET /api/customers
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "first_name": "Ahmad",
    "last_name": "Ahmadi",
    "tazkira_number": "1234567890",
    "phone": "+93701234567",
    "created_by": 2,
    "created_at": "2026-01-06T10:00:00Z",
    "updated_at": "2026-01-06T10:00:00Z"
  }
]
```

#### Search Customers
```http
GET /api/customers/search?q=ahmad
Authorization: Bearer <token>
```

Searches across: first_name, last_name, tazkira_number, phone

#### Get Customer by ID
```http
GET /api/customers/:id
Authorization: Bearer <token>
```

#### Create Customer
```http
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Ahmad",
  "last_name": "Ahmadi",
  "tazkira_number": "1234567890",
  "phone": "+93701234567"
}
```

**Validation:**
- All fields required
- `tazkira_number` must be unique
- Returns 400 if customer with same Tazkira already exists

#### Update Customer
```http
PUT /api/customers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Ahmad",
  "last_name": "Ahmadi",
  "tazkira_number": "1234567890",
  "phone": "+93701234567"
}
```

#### Delete Customer
```http
DELETE /api/customers/:id
Authorization: Bearer <token>
```

**Note:** Cannot delete customer if they have existing savings accounts. Must close all accounts first.

### Savings Account Management

#### Get All Savings Accounts
```http
GET /api/customers/savings/all
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "customer_id": 1,
    "saraf_id": 2,
    "balance": 50000.00,
    "currency_id": 1,
    "first_name": "Ahmad",
    "last_name": "Ahmadi",
    "tazkira_number": "1234567890",
    "phone": "+93701234567",
    "currency_code": "AFN",
    "currency_name": "Afghan Afghani",
    "saraf_name": "Kabul Money Exchange",
    "created_at": "2026-01-06T10:00:00Z",
    "updated_at": "2026-01-06T12:30:00Z"
  }
]
```

#### Get Customer's Savings Accounts
```http
GET /api/customers/:customerId/savings
Authorization: Bearer <token>
```

#### Create Savings Account
```http
POST /api/customers/savings
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": 1,
  "saraf_id": 2,
  "currency_id": 1
}
```

**Validation:**
- Customer must exist
- Cannot create duplicate account (same customer + saraf + currency)
- Initial balance is always 0.0

#### Deposit to Savings Account
```http
POST /api/customers/savings/:accountId/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000.00,
  "notes": "Monthly salary deposit"
}
```

**Validation:**
- Amount must be positive
- Records transaction in `account_transactions` table
- Updates account balance automatically

**Response:**
```json
{
  "id": 1,
  "customer_id": 1,
  "saraf_id": 2,
  "balance": 60000.00,  // Updated balance
  "currency_id": 1,
  "first_name": "Ahmad",
  "last_name": "Ahmadi",
  // ... other fields
}
```

#### Withdraw from Savings Account
```http
POST /api/customers/savings/:accountId/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000.00,
  "notes": "Partial withdrawal"
}
```

**Validation:**
- Amount must be positive
- Amount must not exceed current balance
- Records transaction in `account_transactions` table
- Updates account balance automatically

**Error Response (Insufficient Balance):**
```json
{
  "error": "Insufficient balance"
}
```

#### Get Account Transactions
```http
GET /api/customers/savings/:accountId/transactions?limit=50&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 123,
    "account_type": "customer_savings",
    "account_id": 1,
    "transaction_type": "deposit",
    "amount": 10000.00,
    "balance_before": 50000.00,
    "balance_after": 60000.00,
    "currency_id": 1,
    "currency_code": "AFN",
    "notes": "Monthly salary deposit",
    "created_by": 2,
    "created_by_name": "admin",
    "created_at": "2026-01-06T12:30:00Z"
  }
]
```

## Frontend Implementation

### Location in UI

Navigate to: **Hawala → Savings Account** (4th tab in sidebar)

### Interface Components

#### 1. Customers Table
- Displays all registered customers
- Columns: Full Name, Tazkira Number, Phone, Actions
- Actions:
  - Edit (pencil icon) - Update customer details
  - Delete (trash icon) - Admin only, cannot delete if accounts exist

**Add Customer Button:**
- Opens dialog to create new customer
- Required fields: First Name, Last Name, Tazkira Number, Phone

#### 2. Savings Accounts Table
- Displays all customer savings accounts
- Columns: Customer Name, Saraf, Balance, Created Date, Actions
- Actions:
  - Deposit (green down arrow) - Add money to account
  - Withdraw (orange up arrow) - Remove money from account (disabled if balance = 0)
  - View Transactions (receipt icon) - View transaction history

**Create Account Button:**
- Opens dialog to create new savings account
- Required selections:
  - Customer (dropdown of registered customers)
  - Saraf/Hawaladar (dropdown of active hawaladars)
  - Currency (dropdown of available currencies)

#### 3. Dialog Forms

**Deposit Dialog:**
```
Title: Deposit
Customer: Ahmad Ahmadi (displayed for reference)
Amount: [Input field] AFN
Notes: [Optional text area]
[Cancel] [Deposit]
```

**Withdraw Dialog:**
```
Title: Withdraw
Customer: Ahmad Ahmadi
Available Balance: 50,000.00 AFN
Amount: [Input field] AFN
Notes: [Optional text area]
[Cancel] [Withdraw]
```

### Frontend File Structure

```
frontend/src/
├── pages/
│   └── Hawala.tsx                    # Main hawala page
├── services/
│   └── api.ts                        # API functions
├── types/
│   └── index.ts                      # TypeScript types
└── i18n/
    └── translations.ts               # Translation keys (TO BE ADDED)
```

### Key Frontend Functions (Hawala.tsx)

```typescript
// Fetch data
const fetchSavingsData = async () => {
  const [customersData, accountsData] = await Promise.all([
    getCustomers(),
    getAllSavingsAccounts()
  ]);
  setCustomers(customersData);
  setSavingsAccounts(accountsData);
};

// Customer handlers
const handleNewCustomer = () => { /* ... */ };
const handleEditCustomer = (customer: Customer) => { /* ... */ };
const handleSaveCustomer = async () => { /* ... */ };
const handleDeleteCustomer = async (id: number) => { /* ... */ };

// Account handlers
const handleNewAccount = () => { /* ... */ };
const handleSaveAccount = async () => { /* ... */ };

// Transaction handlers
const handleDeposit = async () => { /* ... */ };
const handleWithdraw = async () => { /* ... */ };
const handleViewTransactions = async (account: CustomerAccount) => { /* ... */ };
```

### TypeScript Types

```typescript
// Customer type
export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  tazkira_number: string;
  phone: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

// Customer Account (with joined data)
export interface CustomerAccount {
  id: number;
  customer_id: number;
  saraf_id: number;
  balance: number;
  currency_id: number;
  currency_code?: string;
  currency_name?: string;
  first_name?: string;
  last_name?: string;
  tazkira_number?: string;
  phone?: string;
  saraf_name?: string;
  created_at: string;
  updated_at: string;
}

// Account Transaction
export interface AccountTransaction {
  id: number;
  account_type: string;
  account_id: number;
  transaction_type: 'deposit' | 'withdraw';
  amount: number;
  balance_before: number;
  balance_after: number;
  currency_id: number;
  currency_code?: string;
  notes?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
}
```

## Translation Keys (Pending)

The following translation keys need to be added to `frontend/src/i18n/translations.ts`:

```typescript
// English
customers: 'Customers',
addCustomer: 'Add Customer',
editCustomer: 'Edit Customer',
firstName: 'First Name',
lastName: 'Last Name',
tazkiraNumber: 'Tazkira Number',
phone: 'Phone',
savingsAccounts: 'Savings Accounts',
createAccount: 'Create Account',
customer: 'Customer',
saraf: 'Saraf',
availableBalance: 'Available Balance',
accountCreated: 'Account Created',

// Also add in Dari (دری) and Pashto (پښتو)
```

## Security Considerations

### Authentication & Authorization
- All endpoints require authentication (`authenticate` middleware)
- Customer deletion requires admin role (`isAdmin` middleware)
- User ID is automatically captured from JWT token (`req.user?.userId`)

### Data Validation
- Tazkira number uniqueness prevents duplicate customers
- Account uniqueness constraint prevents duplicate accounts
- Balance validation prevents negative withdrawals
- All monetary amounts validated as positive numbers

### SQL Injection Prevention
- Using parameterized queries throughout
- No string concatenation in SQL statements
- Example: `db.prepare('SELECT * FROM customers WHERE id = ?').get(id)`

### Transaction Integrity
- Deposit/withdraw operations are atomic
- Balance updates and transaction records happen together
- If transaction record fails, balance update is rolled back

## Testing Checklist

### Backend Tests
- [ ] Create customer with valid data
- [ ] Create customer with duplicate Tazkira (should fail)
- [ ] Update customer details
- [ ] Delete customer with no accounts
- [ ] Delete customer with existing accounts (should fail)
- [ ] Create savings account
- [ ] Create duplicate account (should fail)
- [ ] Deposit to account
- [ ] Withdraw valid amount
- [ ] Withdraw amount exceeding balance (should fail)
- [ ] View transaction history

### Frontend Tests
- [ ] Navigate to Hawala → Savings Account tab
- [ ] View customers table
- [ ] Add new customer
- [ ] Edit existing customer
- [ ] View savings accounts table
- [ ] Create new savings account
- [ ] Deposit money to account
- [ ] Withdraw money from account
- [ ] View transaction history
- [ ] Verify balance updates in real-time

### Integration Tests
- [ ] Create customer → Create account → Deposit → Withdraw → View transactions (full flow)
- [ ] Multiple deposits/withdrawals on same account
- [ ] Multiple accounts for same customer (different sarfs or currencies)
- [ ] Search functionality for customers
- [ ] Error handling for invalid inputs

## Common Errors and Solutions

### Error: "Customer with this Tazkira number already exists"
**Cause:** Attempting to create customer with duplicate Tazkira number
**Solution:** Search for existing customer first, or update existing record

### Error: "Savings account already exists for this customer, saraf, and currency combination"
**Cause:** Attempting to create duplicate account
**Solution:** Use existing account or choose different saraf/currency

### Error: "Insufficient balance"
**Cause:** Attempting to withdraw more than current balance
**Solution:** Verify balance before withdrawal, or withdraw smaller amount

### Error: "Cannot delete customer with existing savings accounts"
**Cause:** Attempting to delete customer who has active accounts
**Solution:** Close/transfer all savings accounts first, then delete customer

### Error: "Route.delete() requires a callback function but got a [object Undefined]"
**Cause:** Using `requireAdmin` instead of `isAdmin` in routes
**Solution:** Fixed in `backend/src/routes/customer.ts:33` - changed to `isAdmin`

### Error: "customerAccount is not defined"
**Cause:** Frontend code referencing removed variable
**Solution:** Fixed in `Hawala.tsx` - updated to use `row.original.currency_code`

## Files Modified

### Backend
- `backend/src/config/database.ts` - Added customers table, updated customer_savings schema
- `backend/src/types/index.ts` - Added Customer, CustomerSavings, CustomerSavingsWithDetails types
- `backend/src/controllers/customerController.ts` - Full CRUD for customers and savings (NEW FILE)
- `backend/src/routes/customer.ts` - All customer and savings routes (NEW FILE)
- `backend/src/index.ts` - Added customer routes

### Frontend
- `frontend/src/types/index.ts` - Added Customer, CustomerAccount types
- `frontend/src/services/api.ts` - Added all customer/savings API functions
- `frontend/src/pages/Hawala.tsx` - Complete UI redesign for savings management

## Future Enhancements

### Phase 1 (Recommended)
- [ ] Add customer photo/ID card upload
- [ ] Generate printed receipts for deposits/withdrawals
- [ ] SMS notifications to customers on transactions
- [ ] Export customer statements to PDF

### Phase 2
- [ ] Interest calculation on savings balances
- [ ] Automated monthly statement generation
- [ ] Multi-signature withdrawals for large amounts
- [ ] Account closure workflow
- [ ] Transfer between accounts (same customer)

### Phase 3
- [ ] Mobile app for hawaladars
- [ ] Biometric authentication for customers
- [ ] QR code for quick customer lookup
- [ ] Integration with national ID verification system

## Migration Guide

If you have existing `customer_savings` records linked to `users`:

1. Database automatically handles migration on startup
2. Creates new `customers` table
3. Preserves all existing balances
4. No data loss or manual intervention needed

**Rollback (if needed):**
```sql
-- Backup first
.backup backup.db

-- Manual rollback (not recommended)
ALTER TABLE customer_savings RENAME COLUMN customer_id TO user_id;
DROP TABLE IF EXISTS customers;
```

## Support and Maintenance

### Logs Location
- Backend logs: Console output (use `npm run dev:backend`)
- Error logs: Check browser console for frontend errors

### Database Location
- File: `backend/data/database.db`
- Backup: Run `.backup backup.db` in SQLite CLI

### Contact
For issues or questions, create an issue on GitHub repository.

---

**Last Updated:** January 6, 2026
**Version:** 1.0.0
**Author:** Afghan Exchange Market Development Team
