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
- **News Section** - Stay updated with market news and announcements
- **User Accounts** - Save favorite currencies and set price alerts (admin-managed accounts)
- **Profile Pictures** - Upload custom profile pictures with server-side image validation
- **Admin Panel** - Full CRUD operations for exchange rates, gold prices, and news content
- **Multi-language Support** - English, Dari (دری), and Pashto (پښتو) with full RTL support
- **Responsive Design** - Works on desktop, tablet, and mobile devices

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
| GET | `/api/news` | Get published news |
| GET | `/api/news/:id` | Get news by ID |

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
| POST | `/api/news` | Create news |
| PUT | `/api/news/:id` | Update news |
| DELETE | `/api/news/:id` | Delete news |

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
| `npm run install:all` | Install all dependencies |

## Screenshots

### Home Page
Exchange rates overview with quick access to converter and market rates.

### Exchange Rates
Detailed rates table with search, filtering, and market selection.

### Currency Converter
Real-time currency conversion with swap functionality.

### Admin Panel
Full CRUD operations for managing exchange rates, gold prices, and news content.

## Multi-language Support

The application supports three languages with full RTL (Right-to-Left) support:
- **English** - Default language
- **Dari (دری)** - Afghan Persian
- **Pashto (پښتو)** - Afghan Pashto

Users can switch languages using the dropdown in the header. The selected language is persisted in localStorage.

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
