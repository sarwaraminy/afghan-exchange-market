# Developer Guide: Using the New Utilities

This guide shows how to use the new utility functions and improvements added to the codebase.

---

## 1. Database Transactions with Automatic Rollback

**Import:**
```typescript
import { withTransaction, withTransactionAsync } from '../utils/dbTransaction';
import { getDb } from '../config/database';
```

**Synchronous Operations:**
```typescript
export const createCustomerWithAccount = (req: Request, res: Response): void => {
  try {
    const db = getDb();

    const result = withTransaction(db, () => {
      // Step 1: Create customer
      const customerResult = db.prepare(`
        INSERT INTO customers (first_name, last_name, tazkira_number, phone, created_by)
        VALUES (?, ?, ?, ?, ?)
      `).run(first_name, last_name, tazkira_number, phone, userId);

      // Step 2: Create savings account
      db.prepare(`
        INSERT INTO customer_savings (customer_id, saraf_id, balance, currency_id)
        VALUES (?, ?, ?, ?)
      `).run(customerResult.lastInsertRowid, saraf_id, 0, currency_id);

      // If any step fails, automatic ROLLBACK
      // If all succeed, automatic COMMIT
      return customerResult.lastInsertRowid;
    });

    sendSuccess(res, { customer_id: result }, 'Customer and account created', 201);
  } catch (error) {
    ErrorResponses.DATABASE_ERROR(res, 'create customer');
  }
};
```

**Async Operations:**
```typescript
export const processComplexOperation = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();

    const result = await withTransactionAsync(db, async () => {
      // Async operations here
      const step1 = await someAsyncOperation();
      db.prepare('INSERT INTO ...').run(...);

      const step2 = await anotherAsyncOperation();
      db.prepare('UPDATE ...').run(...);

      return step2;
    });

    sendSuccess(res, result);
  } catch (error) {
    ErrorResponses.INTERNAL_ERROR(res, error);
  }
};
```

---

## 2. Standardized Error Responses

**Import:**
```typescript
import { sendSuccess, sendError, ErrorResponses } from '../utils/errorHandler';
```

**Success Responses:**
```typescript
// Basic success
sendSuccess(res, data);

// With custom message
sendSuccess(res, data, 'Operation completed successfully');

// With custom status code
sendSuccess(res, data, 'Created', 201);
```

**Error Responses:**
```typescript
// Not found
if (!user) {
  return ErrorResponses.NOT_FOUND(res, 'User');
}

// Bad request
if (!amount || amount <= 0) {
  return ErrorResponses.INVALID_INPUT(res, 'amount', 'must be greater than 0');
}

// Unauthorized
if (!req.user) {
  return ErrorResponses.UNAUTHORIZED(res);
}

// Forbidden
if (req.user.role !== 'admin') {
  return ErrorResponses.ADMIN_REQUIRED(res);
}

// Conflict
if (existingCustomer) {
  return ErrorResponses.ALREADY_EXISTS(res, 'Customer with this Tazkira number');
}

// Insufficient balance
if (account.balance < amount) {
  return ErrorResponses.INSUFFICIENT_BALANCE(res, amount, account.balance);
}

// Database error
catch (error) {
  ErrorResponses.DATABASE_ERROR(res, 'fetch transactions');
}

// Generic internal error
catch (error) {
  ErrorResponses.INTERNAL_ERROR(res, error);
}
```

**Custom Error:**
```typescript
import { sendError } from '../utils/errorHandler';

// Custom status code and message
sendError(res, 422, 'Unprocessable entity', { field: 'email', issue: 'invalid format' });
```

---

## 3. Transaction Status Validation

**Import:**
```typescript
import {
  isValidStatusTransition,
  getInvalidTransitionMessage,
  getAllowedNextStatuses,
  TransactionStatus
} from '../utils/statusValidation';
```

**Check Valid Transition:**
```typescript
export const updateTransactionStatus = (req: Request, res: Response): void => {
  const { status } = req.body;
  const existing = db.prepare('SELECT * FROM hawala_transactions WHERE id = ?').get(id);

  // Validate transition
  if (!isValidStatusTransition(existing.status as TransactionStatus, status as TransactionStatus)) {
    return sendError(
      res,
      400,
      getInvalidTransitionMessage(existing.status as TransactionStatus, status as TransactionStatus)
    );
  }

  // Proceed with status update
  db.prepare('UPDATE hawala_transactions SET status = ? WHERE id = ?').run(status, id);
};
```

**Get Allowed Next Statuses:**
```typescript
// Get what statuses a transaction can transition to
const allowedStatuses = getAllowedNextStatuses('pending');
// Returns: ['in_transit', 'cancelled']

// Use for UI dropdown or validation
res.json({
  current_status: transaction.status,
  allowed_next_statuses: getAllowedNextStatuses(transaction.status as TransactionStatus)
});
```

---

## 4. Input Validation in Routes

**Import:**
```typescript
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/auth';
```

**Add Validation to Routes:**
```typescript
const transactionValidation = [
  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
    .toFloat(),
  body('currency_id')
    .isInt({ min: 1 }).withMessage('Valid currency is required')
    .toInt(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

router.post(
  '/transactions',
  authenticate,
  transactionValidation,
  validateRequest,  // This validates and returns errors automatically
  createTransaction
);
```

**Common Validation Patterns:**
```typescript
// Required string field
body('name')
  .trim()
  .notEmpty().withMessage('Name is required')
  .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters')

// Phone number
body('phone')
  .trim()
  .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format')

// Tazkira number
body('tazkira_number')
  .trim()
  .matches(/^[A-Z0-9\-]{5,20}$/i).withMessage('Invalid Tazkira number format')

// Positive number
body('amount')
  .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
  .toFloat()

// Optional field with max length
body('notes')
  .optional()
  .trim()
  .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')

// Enum validation
body('status')
  .isIn(['pending', 'in_transit', 'completed', 'cancelled']).withMessage('Invalid status')

// URL parameter validation
param('id')
  .isInt({ min: 1 }).withMessage('Valid ID required')
  .toInt()

// Query parameter validation
query('limit')
  .optional()
  .isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000')
  .toInt()
```

---

## 5. Rate Limiting

**Import:**
```typescript
import rateLimit from 'express-rate-limit';
```

**Create Rate Limiter:**
```typescript
// Strict limiter for sensitive endpoints
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,                // 5 requests per minute
  message: { success: false, error: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Moderate limiter
const moderateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per 15 minutes
  message: { success: false, error: 'Rate limit exceeded' }
});
```

**Apply to Routes:**
```typescript
// Apply to single route
router.get('/transactions/code/:code', authenticate, sensitiveLimiter, getTransactionByCode);

// Apply to all routes in router
router.use(moderateLimiter);
router.get('/list', getList);
router.post('/create', create);
```

---

## 6. CORS Configuration

**Multiple Origins Setup:**

In `.env`:
```bash
# Single origin
CORS_ORIGIN=http://localhost:5173

# Multiple origins (comma-separated)
CORS_ORIGIN=http://localhost:5173,https://myapp.com,https://admin.myapp.com
```

The backend automatically handles:
- Parsing comma-separated origins
- Validating incoming requests
- Allowing requests with no origin in development

---

## 7. Environment-Specific Error Handling

**Global Error Handler:**

The global error handler automatically provides:
- Detailed errors in development (with stack traces)
- Generic errors in production (security)

**No action needed** - it works automatically based on `NODE_ENV`

**Development:**
```json
{
  "success": false,
  "error": "Cannot read property 'id' of undefined",
  "stack": "Error: Cannot read property...\n  at controller.js:42..."
}
```

**Production:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 8. Profile Picture Upload (Safe Pattern)

**Safe File Upload Pattern:**
```typescript
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate file
    const validation = validateFile(req.file.buffer);
    if (!validation.valid) {
      return sendError(res, 400, validation.error);
    }

    // 2. Get old file reference
    const oldFile = getCurrentFile();

    // 3. Save new file FIRST
    const newFilename = saveFile(req.file.buffer);

    try {
      // 4. Update database
      db.prepare('UPDATE table SET file = ? WHERE id = ?').run(newFilename, id);

      // 5. Delete old file AFTER success
      if (oldFile) {
        deleteFile(oldFile);
      }

      sendSuccess(res, { filename: newFilename });
    } catch (dbError) {
      // If DB fails, cleanup new file
      deleteFile(newFilename);
      throw dbError;
    }
  } catch (error) {
    ErrorResponses.INTERNAL_ERROR(res, error);
  }
};
```

---

## Best Practices

### 1. Always Use Transactions for Multi-Step Operations
```typescript
// ❌ Bad - no transaction
db.prepare('UPDATE accounts SET balance = ?').run(newBalance);
db.prepare('INSERT INTO transactions ...').run(...);
// If second fails, first is committed!

// ✅ Good - with transaction
withTransaction(db, () => {
  db.prepare('UPDATE accounts SET balance = ?').run(newBalance);
  db.prepare('INSERT INTO transactions ...').run(...);
});
```

### 2. Always Use Standardized Error Responses
```typescript
// ❌ Bad - inconsistent
res.status(404).json({ error: 'Not found' });
res.status(404).json({ message: 'Customer not found' });
res.status(404).json({ success: false, error: 'Not found' });

// ✅ Good - consistent
ErrorResponses.NOT_FOUND(res, 'Customer');
```

### 3. Always Validate Status Transitions
```typescript
// ❌ Bad - no validation
db.prepare('UPDATE transactions SET status = ?').run(newStatus);

// ✅ Good - validated
if (!isValidStatusTransition(currentStatus, newStatus)) {
  return sendError(res, 400, getInvalidTransitionMessage(currentStatus, newStatus));
}
db.prepare('UPDATE transactions SET status = ?').run(newStatus);
```

### 4. Always Validate Input
```typescript
// ❌ Bad - no validation
router.post('/create', authenticate, createCustomer);

// ✅ Good - validated
router.post('/create', authenticate, customerValidation, validateRequest, createCustomer);
```

### 5. Always Add Rate Limiting to Sensitive Endpoints
```typescript
// ❌ Bad - no rate limiting
router.get('/lookup/:code', authenticate, lookupByCode);

// ✅ Good - rate limited
router.get('/lookup/:code', authenticate, sensitiveLimiter, lookupByCode);
```

---

## Common Patterns

### Pattern 1: CRUD with Validation
```typescript
// Create
router.post(
  '/resource',
  authenticate,
  validationRules,
  validateRequest,
  createResource
);

// Read
router.get('/resource/:id', authenticate, getResource);

// Update
router.put(
  '/resource/:id',
  authenticate,
  validationRules,
  validateRequest,
  updateResource
);

// Delete
router.delete('/resource/:id', authenticate, isAdmin, deleteResource);
```

### Pattern 2: Transaction with Validation
```typescript
export const transferFunds = (req: Request, res: Response): void => {
  try {
    const { from_account, to_account, amount } = req.body;
    const db = getDb();

    // Validate business rules
    const fromAccount = db.prepare('SELECT * FROM accounts WHERE id = ?').get(from_account);
    if (!fromAccount) {
      return ErrorResponses.NOT_FOUND(res, 'Source account');
    }

    if (fromAccount.balance < amount) {
      return ErrorResponses.INSUFFICIENT_BALANCE(res, amount, fromAccount.balance);
    }

    // Execute in transaction
    withTransaction(db, () => {
      // Deduct from source
      db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?')
        .run(amount, from_account);

      // Add to destination
      db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?')
        .run(amount, to_account);

      // Log transaction
      db.prepare('INSERT INTO transactions ...').run(...);
    });

    sendSuccess(res, { message: 'Transfer completed' });
  } catch (error) {
    ErrorResponses.DATABASE_ERROR(res, 'transfer funds');
  }
};
```

---

## Migration Checklist

To fully adopt these utilities across the codebase:

- [ ] Replace all transaction operations with `withTransaction`
- [ ] Replace all `res.json()` error responses with `ErrorResponses.*`
- [ ] Replace all `res.json({ success: true, data })` with `sendSuccess(res, data)`
- [ ] Add validation middleware to all POST/PUT routes
- [ ] Apply rate limiting to sensitive endpoints
- [ ] Replace inline status validation with `isValidStatusTransition`
- [ ] Use `DatabaseWrapper` type for db parameters

---

**End of Guide**
