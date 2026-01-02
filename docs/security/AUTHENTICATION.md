# Authentication & Authorization

## Overview

The Afghan Exchange Market uses JSON Web Tokens (JWT) for authentication and role-based access control (RBAC) for authorization.

---

## Authentication Flow

### Registration Flow

```
┌─────────┐         ┌─────────┐         ┌──────────┐
│ Client  │         │  API    │         │ Database │
└────┬────┘         └────┬────┘         └────┬─────┘
     │                   │                   │
     │ POST /auth/register                   │
     │ {username, email, password}           │
     │──────────────────>│                   │
     │                   │                   │
     │                   │ Validate input    │
     │                   │ Check unique      │
     │                   │──────────────────>│
     │                   │                   │
     │                   │ Hash password     │
     │                   │ (bcrypt, 12 rounds)
     │                   │                   │
     │                   │ INSERT user       │
     │                   │──────────────────>│
     │                   │                   │
     │                   │ Generate JWT      │
     │                   │                   │
     │ {token, user}     │                   │
     │<──────────────────│                   │
     │                   │                   │
     │ Store token       │                   │
     │ (localStorage)    │                   │
     │                   │                   │
```

### Login Flow

```
┌─────────┐         ┌─────────┐         ┌──────────┐
│ Client  │         │  API    │         │ Database │
└────┬────┘         └────┬────┘         └────┬─────┘
     │                   │                   │
     │ POST /auth/login  │                   │
     │ {email, password} │                   │
     │──────────────────>│                   │
     │                   │                   │
     │                   │ Find user by email│
     │                   │──────────────────>│
     │                   │                   │
     │                   │<──────────────────│
     │                   │                   │
     │                   │ Compare password  │
     │                   │ (bcrypt.compare)  │
     │                   │                   │
     │                   │ Generate JWT      │
     │                   │ {userId, role}    │
     │                   │                   │
     │ {token, user}     │                   │
     │<──────────────────│                   │
     │                   │                   │
```

### Authenticated Request Flow

```
┌─────────┐         ┌─────────┐         ┌──────────┐
│ Client  │         │  API    │         │ Database │
└────┬────┘         └────┬────┘         └────┬─────┘
     │                   │                   │
     │ GET /user/profile │                   │
     │ Authorization:    │                   │
     │ Bearer <token>    │                   │
     │──────────────────>│                   │
     │                   │                   │
     │                   │ Verify JWT        │
     │                   │ Extract payload   │
     │                   │                   │
     │                   │ Fetch user data   │
     │                   │──────────────────>│
     │                   │                   │
     │                   │<──────────────────│
     │                   │                   │
     │ {user data}       │                   │
     │<──────────────────│                   │
     │                   │                   │
```

---

## JWT Structure

### Token Payload

```json
{
  "userId": 1,
  "role": "user",
  "iat": 1704153600,
  "exp": 1704758400
}
```

| Field | Description |
|-------|-------------|
| userId | Unique user identifier |
| role | User role (user/admin) |
| iat | Issued at timestamp |
| exp | Expiration timestamp |

### Token Configuration

```typescript
// JWT Sign Options
{
  expiresIn: '7d'  // 7 days validity
}

// Algorithm: HS256 (default)
```

---

## Password Security

### Hashing Process

```typescript
// Registration
const hashedPassword = await bcrypt.hash(password, 12);
// 12 = salt rounds (2^12 iterations)

// Login verification
const isMatch = await bcrypt.compare(inputPassword, storedHash);
```

### Password Requirements

```typescript
const passwordValidation = body('password')
  .isLength({ min: 8 })
  .matches(/[A-Z]/)      // Uppercase
  .matches(/[a-z]/)      // Lowercase
  .matches(/[0-9]/)      // Number
  .matches(/[!@#$%^&*(),.?":{}|<>]/);  // Special char
```

---

## Authorization

### Role Hierarchy

```
Guest (Unauthenticated)
    │
    ▼
User (Authenticated)
    │
    ▼
Admin (Administrator)
```

### Middleware Implementation

```typescript
// Authentication middleware
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Admin authorization middleware
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

### Protected Routes

```typescript
// User routes - require authentication
router.use(authenticate);
router.get('/favorites', getFavorites);
router.post('/alerts', createAlert);

// Admin routes - require admin role
router.post('/rates', authenticate, isAdmin, createRate);
router.delete('/news/:id', authenticate, isAdmin, deleteNews);
```

---

## Frontend Authentication

### Auth Context

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
```

### Token Storage

```typescript
// Login - store credentials
localStorage.setItem('token', newToken);
localStorage.setItem('user', JSON.stringify(newUser));

// Logout - clear credentials
localStorage.removeItem('token');
localStorage.removeItem('user');
```

### API Interceptor

```typescript
// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Security Considerations

### Token Security

| Risk | Mitigation |
|------|------------|
| Token theft | Use HTTPS, short expiration |
| XSS attacks | No sensitive data in localStorage |
| CSRF | Token-based auth (not cookies) |
| Replay attacks | Token expiration |

### Session Management

- Tokens expire after 7 days
- Invalid tokens rejected immediately
- No server-side session storage
- Logout clears client-side tokens

### Best Practices

1. **Always use HTTPS** in production
2. **Rotate JWT secret** periodically
3. **Monitor** for unusual login patterns
4. **Implement** account lockout after failed attempts
5. **Log** authentication events
6. **Consider** implementing refresh tokens

---

## Error Responses

### Authentication Errors

| Code | Message | Cause |
|------|---------|-------|
| 401 | Access token required | No token provided |
| 401 | Invalid or expired token | Token verification failed |
| 401 | Invalid credentials | Wrong email/password |

### Authorization Errors

| Code | Message | Cause |
|------|---------|-------|
| 403 | Admin access required | Non-admin accessing admin route |

### Validation Errors

| Code | Message | Cause |
|------|---------|-------|
| 400 | User already exists | Duplicate email/username |
| 400 | Validation failed | Input validation errors |
