# Coding Standards

## Overview

This document defines the coding standards and best practices for the Afghan Exchange Market project.

---

## TypeScript Standards

### Type Definitions

```typescript
// Always define interfaces for objects
interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

// Use type aliases for unions
type AlertType = 'above' | 'below';

// Avoid 'any' - use 'unknown' if type is truly unknown
// Bad
function process(data: any) {}

// Good
function process(data: unknown) {
  if (typeof data === 'string') {
    // data is string here
  }
}
```

### Function Signatures

```typescript
// Always type parameters and return values
function calculateRate(
  amount: number,
  rate: number
): number {
  return amount * rate;
}

// Use arrow functions for callbacks
const rates = currencies.map((c) => c.rate);

// Async functions should return Promise<T>
async function fetchUser(id: number): Promise<User | null> {
  // ...
}
```

### Null Handling

```typescript
// Use optional chaining
const name = user?.profile?.name;

// Use nullish coalescing
const value = input ?? defaultValue;

// Explicit null checks when needed
if (user !== null && user !== undefined) {
  // user is defined
}
```

---

## React Standards

### Component Structure

```typescript
// Functional components with TypeScript
interface Props {
  title: string;
  items: Item[];
  onSelect: (item: Item) => void;
}

export const ItemList = ({ title, items, onSelect }: Props) => {
  // Hooks at the top
  const [selected, setSelected] = useState<Item | null>(null);
  const { t } = useTranslation();

  // Event handlers
  const handleSelect = (item: Item) => {
    setSelected(item);
    onSelect(item);
  };

  // Render
  return (
    <div>
      <h2>{title}</h2>
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onClick={() => handleSelect(item)}
        />
      ))}
    </div>
  );
};
```

### Hooks Usage

```typescript
// useState with proper typing
const [user, setUser] = useState<User | null>(null);

// useEffect with dependencies
useEffect(() => {
  fetchData();
}, [userId]); // List all dependencies

// useMemo for expensive computations
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// useCallback for callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Component Organization

```
components/
├── common/           # Shared components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Loading.tsx
├── rates/            # Feature-specific components
│   ├── RatesTable.tsx
│   └── GoldTable.tsx
└── index.ts          # Exports
```

---

## Express Standards

### Controller Structure

```typescript
import { Request, Response } from 'express';

export const getItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get query parameters
    const { limit = 10, offset = 0 } = req.query;

    // Business logic
    const items = await fetchItems(
      parseInt(limit as string),
      parseInt(offset as string)
    );

    // Success response
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    // Error logging
    console.error('Get items error:', error);

    // Error response
    res.status(500).json({
      success: false,
      error: 'Failed to fetch items'
    });
  }
};
```

### Route Structure

```typescript
import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, validateRequest } from '../middleware/auth';
import { getItems, createItem, updateItem } from '../controllers/itemController';

const router = Router();

// Public routes
router.get('/', getItems);

// Protected routes
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('value').isFloat({ gt: 0 }).withMessage('Value must be positive')
  ],
  validateRequest,
  createItem
);

router.put(
  '/:id',
  authenticate,
  [param('id').isInt().withMessage('Invalid ID')],
  validateRequest,
  updateItem
);

export default router;
```

---

## Naming Conventions

### Files and Folders

```
# Components: PascalCase
Header.tsx
RatesTable.tsx

# Utilities: camelCase
formatDate.ts
calculateRate.ts

# Types: camelCase with descriptive names
types/index.ts

# Routes: lowercase
routes/auth.ts
routes/rates.ts
```

### Variables and Functions

```typescript
// Variables: camelCase
const userName = 'John';
const exchangeRates = [];

// Functions: camelCase, verb prefix
function getUserById(id: number) {}
function calculateTotalRate() {}
function isValidEmail(email: string) {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;

// Interfaces/Types: PascalCase
interface UserProfile {}
type AlertType = 'above' | 'below';
```

### Database

```sql
-- Tables: snake_case, plural
CREATE TABLE exchange_rates (...);
CREATE TABLE user_favorites (...);

-- Columns: snake_case
buy_rate, sell_rate, created_at

-- Indexes: idx_tablename_column
CREATE INDEX idx_rates_currency ON exchange_rates(currency_id);
```

---

## Code Organization

### Import Order

```typescript
// 1. Node/external modules
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

// 2. Internal modules (absolute paths)
import db from '../config/database';
import { User } from '../types';

// 3. Relative imports
import { validateInput } from './utils';
```

### Export Style

```typescript
// Named exports preferred
export const getUser = () => {};
export const createUser = () => {};

// Default export for main module export
export default router;

// Barrel exports for directories
// components/index.ts
export { Header } from './Header';
export { Footer } from './Footer';
```

---

## Error Handling

### Backend Errors

```typescript
// Consistent error response format
{
  success: false,
  error: 'Human readable message',
  details?: [] // Optional validation details
}

// Use try-catch for async operations
try {
  const result = await operation();
} catch (error) {
  console.error('Operation failed:', error);
  res.status(500).json({ success: false, error: 'Operation failed' });
}

// Don't expose internal errors to clients
// Bad: res.json({ error: error.message })
// Good: res.json({ error: 'An error occurred' })
```

### Frontend Errors

```typescript
// Use try-catch for API calls
try {
  const data = await api.get('/endpoint');
  setData(data);
} catch (error) {
  console.error('Fetch failed:', error);
  setError('Failed to load data');
}

// Display user-friendly errors
<Alert severity="error">{error}</Alert>
```

---

## Comments

### When to Comment

```typescript
// Good: Explain WHY, not WHAT
// Using rate from previous day to calculate change percentage
const changePercent = ((current - previous) / previous) * 100;

// Good: Document complex logic
/**
 * Converts currency using cross-rate calculation
 * 1. Convert source to AFN using buy rate
 * 2. Convert AFN to target using sell rate
 */
function crossConvert(from: string, to: string, amount: number) {}

// Avoid: Obvious comments
// Bad: Increment counter by 1
// counter++;
```

### JSDoc for Functions

```typescript
/**
 * Calculates the exchange rate change percentage
 * @param current - Current exchange rate
 * @param previous - Previous exchange rate
 * @returns Percentage change (positive or negative)
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
```

---

## Security Practices

### Input Validation

```typescript
// Always validate user input
body('email').isEmail().normalizeEmail()
body('password').isLength({ min: 8 })
body('rate').isFloat({ gt: 0 })

// Sanitize output
const safeText = escapeHtml(userInput);
```

### SQL Safety

```typescript
// Always use parameterized queries
// Good
db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

// Bad - SQL injection risk
db.prepare(`SELECT * FROM users WHERE id = ${userId}`);
```

### Authentication

```typescript
// Always verify tokens
const decoded = jwt.verify(token, secret);

// Check authorization
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Access denied' });
}
```

---

## Performance

### Database

```typescript
// Use indexes for frequently queried columns
CREATE INDEX idx_rates_market ON exchange_rates(market_id);

// Limit results
db.prepare('SELECT * FROM news LIMIT ? OFFSET ?').all(limit, offset);
```

### React

```typescript
// Memoize expensive computations
const sorted = useMemo(() => items.sort(...), [items]);

// Use callback for handlers passed as props
const handleClick = useCallback(() => {...}, [deps]);

// Lazy load routes
const Admin = React.lazy(() => import('./pages/Admin'));
```

---

## Git Practices

### Commits

- Make small, focused commits
- Write clear commit messages
- Don't commit commented code
- Don't commit console.log statements

### Branches

- Keep branches up to date with main
- Delete branches after merging
- Use meaningful branch names
