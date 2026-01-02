# Technology Stack

## Overview

Afghan Exchange Market is built using modern web technologies with TypeScript across the full stack.

---

## Frontend Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | 5.x | Type-safe JavaScript |
| Vite | 7.x | Build tool & dev server |

### UI Components

| Technology | Version | Purpose |
|------------|---------|---------|
| Material-UI (MUI) | 7.x | Component library |
| MUI Icons | 7.x | Icon set |
| Material React Table | 3.x | Data tables |
| Lucide React | 0.5x | Additional icons |

### State & Data

| Technology | Version | Purpose |
|------------|---------|---------|
| React Context | - | Global state (Auth) |
| React Query | 5.x | Server state management |
| Axios | 1.x | HTTP client |

### Internationalization

| Technology | Version | Purpose |
|------------|---------|---------|
| i18next | 25.x | i18n framework |
| react-i18next | 16.x | React bindings |
| stylis-plugin-rtl | 2.x | RTL support |

### Routing

| Technology | Version | Purpose |
|------------|---------|---------|
| React Router | 7.x | Client-side routing |

---

## Backend Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.x | Web framework |
| TypeScript | 5.x | Type-safe JavaScript |

### Security

| Technology | Version | Purpose |
|------------|---------|---------|
| Helmet | 7.x | Security headers |
| cors | 2.x | CORS handling |
| express-rate-limit | 7.x | Rate limiting |
| bcryptjs | 2.x | Password hashing |
| jsonwebtoken | 9.x | JWT authentication |

### Validation

| Technology | Version | Purpose |
|------------|---------|---------|
| express-validator | 7.x | Input validation |

### Database

| Technology | Version | Purpose |
|------------|---------|---------|
| sql.js | 1.x | SQLite in JavaScript |

### Environment

| Technology | Version | Purpose |
|------------|---------|---------|
| dotenv | 16.x | Environment variables |

---

## Development Tools

### TypeScript Tooling

| Tool | Purpose |
|------|---------|
| tsc | TypeScript compiler |
| ts-node | TypeScript execution |
| ts-node-dev | Development server with hot reload |

### Code Quality

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting (recommended) |

### Package Management

| Tool | Purpose |
|------|---------|
| npm | Package manager |
| package-lock.json | Dependency locking |

---

## Version Details

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.11.0",
    "@mui/material": "^7.3.6",
    "@mui/icons-material": "^7.3.6",
    "@emotion/react": "^11.x",
    "@emotion/styled": "^11.x",
    "@tanstack/react-query": "^5.90.16",
    "axios": "^1.13.2",
    "i18next": "^25.7.3",
    "react-i18next": "^16.5.0",
    "stylis-plugin-rtl": "^2.1.1",
    "material-react-table": "^3.2.1",
    "lucide-react": "^0.562.0"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "vite": "^7.2.4",
    "@types/react": "^19.x",
    "@types/react-dom": "^19.x",
    "eslint": "^9.x"
  }
}
```

### Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "sql.js": "^1.13.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.5",
    "@types/sql.js": "^1.4.9",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0"
  }
}
```

---

## Browser Support

### Supported Browsers

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Opera | 76+ |

### Features Required

- ES2020+ JavaScript
- CSS Grid & Flexbox
- LocalStorage API
- Fetch API

---

## Runtime Requirements

### Node.js

- Minimum: Node.js 18.x
- Recommended: Node.js 20.x LTS

### Operating Systems

| OS | Support |
|----|---------|
| Windows | Full |
| macOS | Full |
| Linux | Full |

---

## Why These Technologies?

### React

- **Component-based**: Reusable UI components
- **Virtual DOM**: Efficient updates
- **Large ecosystem**: Many libraries available
- **TypeScript**: Excellent TS support
- **Community**: Large active community

### Material-UI

- **Comprehensive**: Full component library
- **Customizable**: Theme support
- **RTL Ready**: Built-in RTL support
- **Accessibility**: ARIA compliance
- **TypeScript**: Full type definitions

### Express

- **Minimal**: Lightweight framework
- **Flexible**: Unopinionated
- **Middleware**: Extensive ecosystem
- **Performance**: Fast and efficient
- **Mature**: Well-tested and stable

### SQLite (sql.js)

- **Zero Config**: No database server needed
- **Portable**: Single file database
- **JavaScript**: Pure JS implementation
- **Simple**: Easy to develop with
- **Migratable**: Easy to upgrade to PostgreSQL

### TypeScript

- **Type Safety**: Catch errors early
- **IDE Support**: Better autocompletion
- **Documentation**: Types as documentation
- **Refactoring**: Safer code changes
- **Modern**: Latest JavaScript features

---

## Performance Considerations

### Frontend

- **Code Splitting**: React Router lazy loading
- **Caching**: React Query caching
- **Optimization**: Vite production build

### Backend

- **Rate Limiting**: Prevents abuse
- **Body Limit**: 10kb max request size
- **Helmet**: Security with minimal overhead

### Database

- **Indexes**: On frequently queried columns
- **Debounced Saves**: Reduces disk I/O
- **Prepared Statements**: Query optimization
