# Afghan Exchange - Afghanistan Exchange Market

A full-stack web application for real-time currency exchange rates from Afghanistan's markets, including Sarai Shahzada, Khorasan Market, and Da Afghanistan Bank.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-007FFF?style=flat&logo=mui&logoColor=white)

## Features

- **Real-time Exchange Rates** - View buy/sell rates for USD, EUR, GBP, PKR, INR, and more
- **Multiple Markets** - Compare rates across Sarai Shahzada, Khorasan Market, and DAB
- **Currency Converter** - Convert between AFN and major world currencies
- **Gold & Silver Rates** - Track precious metal prices (24K, 22K, 21K, 18K gold and silver)
- **Hawala System** - Complete money transfer management with agents, transactions, and reports
  - **Flexible Commission** - Choose between two commission types: add (sender pays extra) or deduct (cut from amount)
  - **Location Details** - Track floor number and shop number for each hawaladar location
  - **Thermal Printer Support** - Optimized receipts for 80mm thermal/ATM printers
  - **Customer Payments** - Pay from cash or savings accounts
  - **Enhanced Transaction Table** - Separate columns for sender/receiver agents, commission details, and locations
  - **Multi-Currency Reports** - Accurate commission reporting per currency
- **Customer Savings Accounts** - Hawaladar-managed savings accounts for customers with deposit/withdraw tracking
- **User Accounts** - Save favorite currencies and set price alerts
- **Profile Pictures** - Upload custom profile pictures with server-side validation
- **Admin Management** - Distributed CRUD operations across dedicated pages (Rates, Gold, Users)
- **Multi-language Support** - English, Dari (دری), and Pashto (پښتو) with full RTL support
- **Responsive Design** - Full-width layouts optimized for data tables, works on all devices

## Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **TypeScript** - Type-safe development
- **SQLite** (sql.js) - Pure JavaScript SQLite database (cross-platform compatible)
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Material-UI (MUI)** - Component library
- **Material React Table** - Advanced data tables with RTL support
- **React Router** - Client-side routing
- **i18next** - Internationalization (English, Dari, Pashto)
- **Axios** - HTTP client
- **React Query** - Data fetching

## Project Structure

```
afghan-exchange-market/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & JWT configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth & upload middleware
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   ├── index.ts         # Entry point
│   │   └── seed.ts          # Database seeder
│   ├── data/                # SQLite database
│   ├── uploads/             # User uploaded files
│   │   └── profiles/        # Profile pictures
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── i18n/            # Translations
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main app component
│   └── package.json
├── docs/                    # Documentation
└── package.json             # Root package with scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/afghan-exchange-market.git
   cd afghan-exchange-market
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   # Or manually:
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Seed the database**
   ```bash
   npm run seed
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts both:
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:5173

### Default Admin Credentials

- **Email:** admin@afghanexchange.com
- **Password:** Auto-generated on first seed (check console output)

> **Security Note:** Set `ADMIN_PASSWORD` environment variable before seeding in production.

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rates/markets` | Get all markets |
| GET | `/api/rates/currencies` | Get all currencies |
| GET | `/api/rates/exchange` | Get exchange rates |
| GET | `/api/rates/exchange?market_id=1` | Get rates for specific market |
| GET | `/api/rates/gold` | Get gold/silver rates |
| GET | `/api/rates/convert?from=USD&to=AFN&amount=100` | Convert currency |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/profile/picture` | Upload profile picture |
| DELETE | `/api/auth/profile/picture` | Delete profile picture |

### User (Requires Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/dashboard` | Get dashboard stats |
| GET | `/api/user/favorites` | Get favorite currencies |
| POST | `/api/user/favorites` | Add favorite |
| DELETE | `/api/user/favorites/:id` | Remove favorite |
| GET | `/api/user/alerts` | Get price alerts |
| POST | `/api/user/alerts` | Create alert |
| DELETE | `/api/user/alerts/:id` | Delete alert |

### Admin (Requires Admin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| POST | `/api/rates/exchange` | Create exchange rate |
| PUT | `/api/rates/exchange/:id` | Update exchange rate |
| DELETE | `/api/rates/exchange/:id` | Delete exchange rate |
| POST | `/api/rates/gold` | Create gold rate |
| PUT | `/api/rates/gold/:id` | Update gold rate |
| DELETE | `/api/rates/gold/:id` | Delete gold rate |

### Hawala System (Requires Auth)

#### Agents (Hawaladars)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hawala/agents` | Get all hawala agents |
| GET | `/api/hawala/agents/:id` | Get agent by ID |
| POST | `/api/hawala/agents` | Create new agent |
| PUT | `/api/hawala/agents/:id` | Update agent |
| DELETE | `/api/hawala/agents/:id` | Delete agent |

#### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hawala/transactions` | Get all transactions (with filters) |
| GET | `/api/hawala/transactions/:id` | Get transaction by ID |
| GET | `/api/hawala/transactions/code/:code` | Lookup by reference code |
| POST | `/api/hawala/transactions` | Create new transaction |
| PUT | `/api/hawala/transactions/:id` | Update transaction |
| PUT | `/api/hawala/transactions/:id/status` | Update transaction status |
| DELETE | `/api/hawala/transactions/:id` | Delete transaction |

#### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hawala/reports/summary` | Get summary statistics |
| GET | `/api/hawala/reports/by-agent` | Transactions grouped by agent |
| GET | `/api/hawala/reports/by-currency` | Transactions grouped by currency |

### Customer Savings Accounts (Requires Auth)

#### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/search?q=query` | Search customers |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create new customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer (admin only) |

#### Savings Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers/savings/all` | Get all savings accounts |
| GET | `/api/customers/savings/eligible` | Get eligible accounts for hawala payment |
| GET | `/api/customers/:customerId/savings` | Get customer's accounts |
| POST | `/api/customers/savings` | Create savings account |
| POST | `/api/customers/savings/:accountId/deposit` | Deposit to account |
| POST | `/api/customers/savings/:accountId/withdraw` | Withdraw from account |
| GET | `/api/customers/savings/:accountId/transactions` | Get transaction history |

## Environment Variables

### Backend (.env)
```env
PORT=5000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both backend and frontend |
| `npm run dev:backend` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run build` | Build both for production |
| `npm run seed` | Seed database with initial data |
| `npm run reset-admin` | Reset admin password |
| `npm run install:all` | Install all dependencies |

### Admin Management

Reset admin password with a custom password:
```bash
cd backend
node set-password.js  # Uses default password: aaAA11!!
# Or use environment variable:
# set ADMIN_PASSWORD=yourpassword
# npm run reset-admin
```

## Hawala System

The Hawala system provides a complete money transfer management solution, traditionally used in Afghanistan and South Asia.

### Features
- **Agent Management** - Register and manage hawaladar (agent) profiles with locations, floor/shop numbers, and commission rates
- **Location Details** - Track detailed address information including floor number and shop number for each hawaladar
- **Transaction Tracking** - Create, track, and manage money transfers with unique reference codes (HWL-XXXXXX)
- **Flexible Commission Types** - Choose between two commission modes:
  - **Add**: Sender pays amount + commission (total = amount + commission)
  - **Deduct**: Commission deducted from amount, receiver gets net (total = amount, receiver gets amount - commission)
- **Payment Methods** - Pay with cash or directly from customer savings accounts
- **Status Workflow** - Track transactions through: Pending → In Transit → Completed (or Cancelled)
- **Commission Calculation** - Automatic commission calculation based on agent rates and selected type
- **Thermal Printer Receipts** - Professional receipts optimized for 80mm thermal/ATM printers
  - Single-column layout for narrow paper
  - Minimal spacing and compact fonts
  - Includes sender/receiver agent details with locations
  - Print-ready with automatic page sizing
- **Enhanced Transaction Table** - Clear data visibility with dedicated columns:
  - Sender name and phone
  - Sender agent with location
  - Receiver name and phone
  - Receiver agent with location
  - Amount and currency
  - Commission amount and rate
- **Multi-Currency Reports** - Accurate reporting with commission totals per currency
- **Reports & Analytics** - Summary statistics, reports by agent, and reports by currency
- **Reference Code Lookup** - Quick search transactions by reference code for sender/receiver

### Database Tables
- `hawaladars` - Agent profiles with multi-language support (EN/FA/PS), location details (floor/shop numbers)
- `hawala_transactions` - Transaction records with sender/receiver details, amounts, commission type, and status

### Transaction Flow
```
1. Create transaction (status: pending)
2. Sender deposits money with sending agent
3. Update status to "in_transit"
4. Receiving agent pays recipient
5. Update status to "completed"
```

## Customer Savings Account System

The Customer Savings Account system allows hawaladars to manage physical cash deposits for their customers. This is a traditional Afghan banking practice where customers physically visit the hawaladar to deposit or withdraw money.

**Important:** This system is managed entirely by the hawaladar. Customers do NOT have login access. All operations are performed by the hawaladar when the customer visits in person.

### Features
- **Customer Management** - Register customers with Tazkira (National ID) and phone
- **Account Creation** - Create savings accounts linked to specific hawaladars and currencies
- **Deposit Tracking** - Record cash deposits with notes and automatic balance updates
- **Withdrawal Management** - Process withdrawals with balance validation
- **Hawala Payment Integration** - Pay for hawala transfers directly from savings accounts
- **Transaction History** - Complete audit trail of all deposits, withdrawals, and hawala payments
- **Multi-Currency Support** - Customers can have accounts in different currencies
- **Multi-Hawaladar Support** - Customers can have accounts with different hawaladars

### Database Tables
- `customers` - Customer profiles (NOT users, no login credentials)
- `customer_savings` - Savings account balances per customer/hawaladar/currency
- `account_transactions` - Complete transaction history

### Customer Flow
```
1. Customer visits hawaladar with cash
2. Hawaladar creates/looks up customer profile (by Tazkira number)
3. Hawaladar finds customer's savings account
4. Customer deposits/withdraws cash
5. Hawaladar records transaction in system
6. Balance automatically updated
```

### Key Constraints
- One customer profile per Tazkira number (UNIQUE constraint)
- One savings account per customer/hawaladar/currency combination
- Cannot delete customers with existing savings accounts
- Cannot withdraw more than current balance

**📖 Detailed Documentation:** See [docs/SAVINGS_ACCOUNT.md](docs/SAVINGS_ACCOUNT.md) for complete API reference, implementation details, and testing guide.

## Screenshots

### Home Page
Exchange rates overview with quick access to converter and market rates.

### Exchange Rates
Detailed rates table with search, filtering, and market selection.

### Currency Converter
Real-time currency conversion with swap functionality.

### Rates & Gold Pages
Dedicated pages with full CRUD operations for managing exchange rates and gold prices.

### Hawala Page
Multi-section layout with Transactions, Hawaladars, Reports, and Savings Account management.

### Users Management
Dedicated user management page accessible from the user menu.

## Multi-language Support

The application supports three languages with full RTL (Right-to-Left) support:
- **English** - Default language
- **Dari (دری)** - Afghan Persian
- **Pashto (پښتو)** - Afghan Pashto

Users can switch languages using the dropdown in the header. The selected language is persisted in localStorage.

## Recent Updates (January 2026)

### Latest Features (2026-01-14 - v1.3.1)
- ✅ **Location Details** - Added floor number and shop number fields for hawaladar addresses
- ✅ **Simplified Branding** - Removed logo upload system, standardized on default branding
- ✅ **Receipt Cleanup** - Removed duplicate sender information for cleaner receipts
- ✅ **Enhanced Location Display** - Floor and shop details shown throughout the system

### Previous Features (2026-01-14 - v1.3.0)
- ✅ **Commission Type Feature** - Flexible commission handling (add/deduct modes)
- ✅ **Enhanced Transaction Table** - Dedicated columns for sender/receiver agents, commission, and locations
- ✅ **Multi-Currency Reports** - Accurate commission reporting per currency
- ✅ **Thermal Printer Receipts** - Optimized for 80mm thermal/ATM printers with single-column layout
- ✅ **Full-Width Layouts** - Maximized screen space for data tables
- ✅ **Removed News Feature** - Simplified application focus
- ✅ **Distributed Admin Functions** - CRUD operations moved to dedicated pages (Rates, Gold, Users)

### Additional Features (2026-01-11)
- ✅ **Customer Savings Payment** - Pay for hawala transfers using customer savings accounts
- ✅ **Receipt Printing** - Generate and print professional transaction receipts
- ✅ **Dynamic Account Selection** - Real-time eligible savings accounts lookup during hawala creation

### Critical Bug Fixes
- ✅ Fixed database schema inconsistencies (table/column name mismatches)
- ✅ Fixed duplicate hawaladar records (removed 36 duplicates)
- ✅ Fixed transaction update security (prevents account imbalances)
- ✅ Fixed cancellation refund logic (properly reverses both sides)
- ✅ Fixed reference code race condition (atomic generation)
- ✅ Fixed SQL injection vulnerability in account transfers
- ✅ Fixed admin password reset persistence

### Security Improvements
- Added UNIQUE constraints to prevent duplicate records
- Implemented atomic database operations
- Enhanced input validation and sanitization
- Improved error handling and user feedback

### Database Migrations
All migrations run automatically on startup:
- Renamed `hawaladar_accounts` → `saraf_accounts`
- Renamed `customer_accounts` → `customer_savings`
- Updated account_type enums for consistency
- Added UNIQUE constraint on hawaladars

See [CHANGELOG.md](CHANGELOG.md) for detailed information.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Sarai Shahzada - Afghanistan's largest money exchange market
- Flag icons from [FlagCDN](https://flagcdn.com)
- Material-UI for the component library
- sql.js for cross-platform SQLite support
