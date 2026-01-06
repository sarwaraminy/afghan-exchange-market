# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-01-06

### Added

#### Customer Savings Account System
- **Customer Management** - Complete CRUD operations for customer profiles
  - New `customers` table with Tazkira (National ID), name, and phone
  - Search functionality across all customer fields
  - Unique constraint on Tazkira numbers to prevent duplicates
  - Protection against deleting customers with existing accounts

- **Savings Account Management** - Hawaladar-managed savings accounts
  - Redesigned `customer_savings` table to use customer profiles instead of user accounts
  - Support for multiple accounts per customer (different hawaladars or currencies)
  - Unique constraint on (customer_id, saraf_id, currency_id) combinations
  - Complete transaction history tracking for all deposits and withdrawals

- **API Endpoints** - New REST APIs for customer and savings management
  - `/api/customers` - Full CRUD for customer profiles
  - `/api/customers/search` - Search customers by name, Tazkira, or phone
  - `/api/customers/savings` - Create and manage savings accounts
  - `/api/customers/savings/:id/deposit` - Record cash deposits
  - `/api/customers/savings/:id/withdraw` - Process withdrawals with balance validation
  - `/api/customers/savings/:id/transactions` - View transaction history

- **Frontend UI** - Complete savings account interface in Hawala page
  - New "Savings Account" tab in Hawala sidebar (4th option)
  - Customers table with add/edit/delete functionality
  - Savings accounts table with real-time balance display
  - Inline deposit/withdraw actions with icon buttons
  - Transaction history viewer per account
  - Material-UI dialogs for all forms
  - Responsive design for mobile and desktop

### Fixed
- **Route Definition Error** - Fixed `requireAdmin` to `isAdmin` in customer routes
- **Frontend Type Error** - Fixed undefined `customerAccount` reference in transaction columns
- **Authentication** - Changed `req.user?.id` to `req.user?.userId` for consistency

### Changed
- **Database Schema** - Major restructure of customer savings system
  - `customer_savings` now uses `customer_id` instead of `user_id`
  - Customers are no longer linked to user accounts
  - Added `saraf_id` to track which hawaladar holds the money
  - Automatic migration of existing data on startup

- **Business Logic** - Separated customer profiles from user authentication
  - Customers are managed by hawaladars, not self-service users
  - Reflects real-world Afghan banking practice
  - Physical cash deposits only, no online transfers

### Documentation
- Added comprehensive `docs/SAVINGS_ACCOUNT.md` with:
  - Complete API reference
  - Database schema documentation
  - Frontend implementation guide
  - Testing checklist
  - Common errors and solutions
  - Future enhancement roadmap
- Updated main README.md with savings account overview
- Added API endpoint tables for customer management

## [Unreleased] - 2026-01-03

### Fixed

#### Critical Bug Fixes
- **Database Schema Issues** - Fixed table and column name mismatches after migration
  - Updated `accountController.ts` to use correct table names (`saraf_accounts`, `customer_savings`)
  - Fixed `account_type` values throughout codebase (`saraf_cash`, `customer_savings`)
  - Resolved foreign key reference issues

- **Hawala Controller Fixes** - Fixed multiple critical issues in transaction handling
  - Fixed table references from `hawaladar_accounts` to `saraf_accounts`
  - Updated column references from `balance` to `cash_balance` for saraf accounts
  - Fixed account_type values in transaction logging

- **Transaction Update Security** - Prevented account balance inconsistencies
  - Added validation to prevent transaction updates after funds have been deducted
  - Returns clear error message instructing users to cancel and create new transaction

- **Cancellation Refund Logic** - Complete transaction reversal
  - Now properly reverses BOTH sender debit AND receiver credit when cancelling
  - Prevents money duplication bug where receiver kept funds while sender got refund
  - Added transaction reversal for completed transactions that are cancelled

- **Reference Code Generation Race Condition** - Made atomic
  - Fixed race condition where concurrent transactions could get duplicate reference codes
  - Implemented atomic counter increment using single UPDATE statement
  - Added verification of successful counter update

- **SQL Injection Prevention** - Security hardening in account transfers
  - Replaced string interpolation with validation function in `transferBetweenAccounts`
  - Maps account types to safe table names before SQL execution
  - Throws error for invalid account types before any database access

- **Duplicate Hawaladars** - Database cleanup and prevention
  - Removed 36 duplicate hawaladar records (each agent was inserted 3 times)
  - Added UNIQUE constraint on `hawaladars(name, location)` to prevent future duplicates
  - Created migration to apply constraint to existing databases
  - Updated seed script to properly handle duplicates with `INSERT OR IGNORE`

- **Admin Password Reset** - Fixed database persistence
  - Added missing `saveDatabaseNow()` call after password update
  - Password changes now properly persist to disk
  - Backend server auto-loads updated database on restart

### Added

- **Error Display in Status Dialog** - Better user feedback
  - Status change dialog now displays error messages
  - Errors are cleared when reopening dialog
  - Added console logging for debugging status updates

- **Database Migration System** - Automatic schema updates
  - Added migration for hawaladar → saraf renaming
  - Migration for customer_accounts → customer_savings with saraf_id
  - Automatic account_type value updates
  - UNIQUE constraint migration for hawaladars table

- **Cleanup Script** - Database maintenance tool
  - Created `clean-duplicates.ts` for removing duplicate records
  - Automatically updates transaction references when merging duplicates
  - Preserves data integrity while cleaning

### Changed

- **Database Schema Improvements**
  - Renamed `hawaladar_accounts` to `saraf_accounts` for consistency
  - Renamed `customer_accounts` to `customer_savings` to reflect purpose
  - Changed `balance` to `cash_balance` in saraf_accounts for clarity
  - Updated all foreign key references and account_type enums

- **Account Transaction Types**
  - Changed from `'hawaladar'` to `'saraf_cash'`
  - Changed from `'customer'` to `'customer_savings'`
  - Updated all queries and controllers to use new values

### Security

- Fixed SQL injection risk in account transfer operations
- Improved input validation and sanitization
- Added atomic operations to prevent race conditions

### Documentation

- Updated README with complete API documentation
- Added CHANGELOG for tracking all changes
- Documented all database schema changes
- Added migration documentation

## Database Schema Changes

### Tables Renamed
- `hawaladar_accounts` → `saraf_accounts`
- `customer_accounts` → `customer_savings`

### Columns Renamed
- `saraf_accounts.hawaladar_id` → `saraf_id`
- `saraf_accounts.balance` → `cash_balance`

### New Columns
- `customer_savings.saraf_id` (foreign key to hawaladars)

### Constraints Added
- UNIQUE constraint on `hawaladars(name, location)`

### Account Transaction Types
- Old: `'hawaladar'` → New: `'saraf_cash'`
- Old: `'customer'` → New: `'customer_savings'`

## Migration Notes

All migrations run automatically on backend startup. The database will be updated transparently without data loss.

If you encounter issues:
1. Stop the backend server
2. Delete `backend/data/exchange.db`
3. Run `npm run seed` to regenerate with fixed schema
4. Restart backend server

## Breaking Changes

None for end users. All changes are backward compatible with automatic migrations.

For developers:
- Update any custom code referencing `hawaladar_accounts` to use `saraf_accounts`
- Update account_type values from `'hawaladar'`/`'customer'` to `'saraf_cash'`/`'customer_savings'`
