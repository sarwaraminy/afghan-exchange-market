# Getting Started - Developer Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 9.x or higher (comes with Node.js)
- **Git** for version control
- **VS Code** (recommended) or your preferred IDE

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd afghan-exchange-market
```

### 2. Project Structure

```
afghan-exchange-market/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Configuration (database, JWT)
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript interfaces
│   │   ├── index.ts        # Entry point
│   │   └── seed.ts         # Database seeding
│   ├── data/               # SQLite database files
│   ├── dist/               # Compiled JavaScript
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript interfaces
│   │   ├── i18n/           # Translations
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Entry point
│   ├── dist/               # Production build
│   └── package.json
├── docs/                   # Documentation
└── package.json            # Root package.json
```

### 3. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 4. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with development values:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 5. Initialize Database

```bash
cd backend
npm run seed
```

This creates:
- Admin user: `admin@afghanexchange.com` / `admin123`
- Sample markets, currencies, and rates
- Sample news articles

---

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Backend runs at: http://localhost:5000

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend runs at: http://localhost:5173

### Access Application

- **Application**: http://localhost:5173
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## Development Workflow

### Making Changes

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test locally

4. Commit changes
   ```bash
   git add .
   git commit -m "feat: description of changes"
   ```

5. Push and create PR
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Organization

#### Backend

- **Controllers**: Business logic for each resource
- **Routes**: Define endpoints and validation
- **Middleware**: Authentication, validation, etc.
- **Types**: TypeScript interfaces

#### Frontend

- **Pages**: Top-level route components
- **Components**: Reusable UI components
- **Services**: API communication
- **Context**: Global state management
- **i18n**: Translations

---

## Common Tasks

### Add a New API Endpoint

1. Define route in `backend/src/routes/`
2. Create controller function in `backend/src/controllers/`
3. Add validation rules
4. Add authentication if needed

Example:
```typescript
// routes/example.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, validateRequest } from '../middleware/auth';
import { getExample, createExample } from '../controllers/exampleController';

const router = Router();

router.get('/', getExample);
router.post('/',
  authenticate,
  [body('name').notEmpty()],
  validateRequest,
  createExample
);

export default router;
```

### Add a New Page

1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add translations in `frontend/src/i18n/translations.ts`
4. Add navigation link if needed

### Add Translation

Edit `frontend/src/i18n/translations.ts`:

```typescript
export const translations = {
  en: {
    newSection: {
      title: 'English Title',
      description: 'English description'
    }
  },
  fa: {
    newSection: {
      title: 'عنوان دری',
      description: 'توضیحات دری'
    }
  },
  ps: {
    newSection: {
      title: 'پښتو عنوان',
      description: 'پښتو توضیحات'
    }
  }
};
```

### Add Database Table

1. Update schema in `backend/src/config/database.ts`
2. Add types in `backend/src/types/index.ts`
3. Create controller and routes
4. Update seed file if needed

---

## Testing

### Manual Testing

1. Test API endpoints with curl or Postman
2. Test UI in multiple browsers
3. Test RTL layout (change language to Dari/Pashto)
4. Test responsive design

### API Testing with curl

```bash
# Health check
curl http://localhost:5000/api/health

# Get rates
curl http://localhost:5000/api/rates/exchange

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@afghanexchange.com","password":"admin123"}'
```

---

## Debugging

### Backend Debugging

1. Check console logs
2. Use VS Code debugger
3. Add `console.log` statements
4. Check network requests in browser

### Frontend Debugging

1. Use React DevTools
2. Check browser console
3. Use Network tab for API calls
4. Add `console.log` in components

### VS Code Launch Config

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["ts-node", "src/index.ts"],
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

---

## IDE Setup

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Material Icon Theme
- GitLens

### Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Troubleshooting Development

### Port Already in Use

```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### TypeScript Errors

```bash
# Check errors without building
npx tsc --noEmit
```

### Database Reset

```bash
# Delete and reseed
rm backend/data/exchange.db*
cd backend && npm run seed
```

---

## Resources

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Express Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [sql.js Documentation](https://sql.js.org/)
