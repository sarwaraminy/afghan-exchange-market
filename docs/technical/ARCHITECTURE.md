# System Architecture

## Overview

Afghan Exchange Market is a full-stack web application built with a React frontend and Node.js/Express backend, using SQLite for data persistence.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    React Application                     │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │  Pages  │  │Components│  │ Context │  │Services │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Express Application                    │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │ Routes  │  │Controllers│ │Middleware│ │ Config  │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   SQLite Database                        │   │
│  │                   (via sql.js)                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider (Context)
│   ├── BrowserRouter
│   │   ├── Header
│   │   ├── Routes
│   │   │   ├── PublicRoute
│   │   │   │   ├── Login
│   │   │   │   └── Register
│   │   │   ├── PrivateRoute
│   │   │   │   ├── Dashboard
│   │   │   │   ├── Rates
│   │   │   │   ├── Gold
│   │   │   │   ├── Converter
│   │   │   │   ├── News
│   │   │   │   └── Admin (AdminRoute)
│   │   │   └── Home (redirect)
│   │   └── Footer
```

### State Management

```
┌─────────────────────────────────────────────┐
│              AuthContext                     │
│  ┌─────────────────────────────────────┐    │
│  │ user: User | null                    │    │
│  │ token: string | null                 │    │
│  │ isAuthenticated: boolean             │    │
│  │ isAdmin: boolean                     │    │
│  │ login(): void                        │    │
│  │ logout(): void                       │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│         Component Local State               │
│  ┌─────────────────────────────────────┐    │
│  │ useState for UI state                │    │
│  │ useEffect for data fetching          │    │
│  │ useMemo for computed values          │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Data Flow

```
User Action
    │
    ▼
Component Event Handler
    │
    ▼
API Service Function
    │
    ▼
Axios Request (with interceptors)
    │
    ▼
Backend API
    │
    ▼
Response Processing
    │
    ▼
State Update (useState/Context)
    │
    ▼
Re-render
```

---

## Backend Architecture

### Request Processing Pipeline

```
Incoming Request
    │
    ▼
┌─────────────────┐
│     Helmet      │  Security headers
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      CORS       │  Cross-origin handling
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Rate Limiter   │  Request throttling
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Body Parser   │  JSON parsing
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Router      │  Route matching
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Validation    │  Input validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Authentication  │  JWT verification
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Authorization   │  Role checking
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │  Business logic
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Database     │  Data operations
└────────┬────────┘
         │
         ▼
Response
```

### Module Structure

```
backend/src/
├── index.ts              # Application entry point
├── config/
│   ├── database.ts       # Database initialization
│   └── jwt.ts            # JWT configuration
├── controllers/
│   ├── authController.ts    # Authentication logic
│   ├── ratesController.ts   # Rate management
│   ├── newsController.ts    # News management
│   └── userController.ts    # User operations
├── middleware/
│   └── auth.ts           # Auth & validation middleware
├── routes/
│   ├── auth.ts           # Auth endpoints
│   ├── rates.ts          # Rate endpoints
│   ├── news.ts           # News endpoints
│   └── user.ts           # User endpoints
├── types/
│   └── index.ts          # TypeScript interfaces
└── seed.ts               # Database seeding
```

---

## Database Architecture

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   markets   │       │  exchange_rates │       │  currencies │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │───┐   │ id (PK)         │   ┌───│ id (PK)     │
│ name        │   │   │ market_id (FK)  │───┘   │ code        │
│ name_fa     │   └──>│ currency_id (FK)│       │ name        │
│ name_ps     │       │ buy_rate        │       │ name_fa     │
│ location    │       │ sell_rate       │       │ name_ps     │
│ is_active   │       │ updated_by (FK) │       │ symbol      │
└─────────────┘       └─────────────────┘       │ flag_code   │
                                                │ is_active   │
┌─────────────┐       ┌─────────────────┐       └─────────────┘
│   users     │       │  user_favorites │             │
├─────────────┤       ├─────────────────┤             │
│ id (PK)     │───┐   │ id (PK)         │             │
│ username    │   │   │ user_id (FK)    │─────────────┤
│ email       │   └──>│ currency_id (FK)│─────────────┘
│ password    │       └─────────────────┘
│ full_name   │
│ role        │       ┌─────────────────┐
│ language    │       │  price_alerts   │
└─────────────┘       ├─────────────────┤
      │               │ id (PK)         │
      │               │ user_id (FK)    │───────┐
      │               │ currency_id (FK)│       │
      │               │ target_rate     │       │
      │               │ alert_type      │       │
      │               │ is_active       │       │
      │               └─────────────────┘       │
      │                                         │
      │               ┌─────────────────┐       │
      │               │    gold_rates   │       │
      │               ├─────────────────┤       │
      │               │ id (PK)         │       │
      │               │ type            │       │
      │               │ price_afn       │       │
      │               │ price_usd       │       │
      │               │ updated_by (FK) │───────┤
      │               └─────────────────┘       │
      │                                         │
      │               ┌─────────────────┐       │
      └──────────────>│      news       │<──────┘
                      ├─────────────────┤
                      │ id (PK)         │
                      │ title           │
                      │ content         │
                      │ author_id (FK)  │
                      │ is_published    │
                      └─────────────────┘
```

---

## Security Architecture

### Authentication Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Client  │    │ Server  │    │  Auth   │    │   DB    │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │
     │ Login Req    │              │              │
     │─────────────>│              │              │
     │              │ Validate     │              │
     │              │─────────────>│              │
     │              │              │ Query User   │
     │              │              │─────────────>│
     │              │              │<─────────────│
     │              │ Compare Hash │              │
     │              │<─────────────│              │
     │              │ Sign JWT     │              │
     │              │─────────────>│              │
     │              │<─────────────│              │
     │ JWT Token    │              │              │
     │<─────────────│              │              │
     │              │              │              │
```

### Authorization Layers

```
┌─────────────────────────────────────────────┐
│              Rate Limiting                   │
│         (100 req/15min general)              │
│         (5 req/15min auth)                   │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│            Authentication                    │
│         (JWT Verification)                   │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│            Authorization                     │
│         (Role-based: user/admin)             │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│            Input Validation                  │
│         (express-validator)                  │
└─────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Development

```
┌──────────────────────────────────────────────────────┐
│                  Developer Machine                    │
│  ┌────────────────┐       ┌────────────────┐        │
│  │    Frontend    │       │    Backend     │        │
│  │  localhost:5173│──────>│  localhost:5000│        │
│  │   (Vite dev)   │       │  (ts-node-dev) │        │
│  └────────────────┘       └───────┬────────┘        │
│                                   │                  │
│                           ┌───────┴────────┐        │
│                           │    SQLite DB   │        │
│                           │ (exchange.db)  │        │
│                           └────────────────┘        │
└──────────────────────────────────────────────────────┘
```

### Production (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer / CDN                       │
│                    (SSL Termination)                         │
└──────────────────────────────┬──────────────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│    Static Files (CDN)   │     │      API Server(s)          │
│    - Frontend build     │     │    - Express backend        │
│    - Assets             │     │    - Node.js runtime        │
└─────────────────────────┘     └──────────────┬──────────────┘
                                               │
                                               ▼
                                ┌─────────────────────────────┐
                                │        Database             │
                                │    (SQLite / PostgreSQL)    │
                                └─────────────────────────────┘
```

---

## Technology Decisions

### Why React?

- Component-based architecture
- Large ecosystem
- TypeScript support
- Excellent Material-UI integration
- RTL support for Dari/Pashto

### Why Express?

- Lightweight and flexible
- Extensive middleware ecosystem
- TypeScript support
- Easy to learn and maintain

### Why SQLite?

- Zero configuration
- File-based (easy backup)
- Sufficient for expected load
- No separate database server needed
- Easy migration to PostgreSQL later

### Why JWT?

- Stateless authentication
- No server-side session storage
- Scalable across servers
- Mobile-friendly
