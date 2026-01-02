# Environment Configuration

## Overview

This document describes all environment variables used by the Afghan Exchange Market application.

---

## Backend Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT signing | `a1b2c3d4e5f6...` (32+ chars) |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `JWT_EXPIRES_IN` | `7d` | Token expiration |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `AUTH_RATE_LIMIT_MAX` | `5` | Max auth requests per window |

---

## Environment Files

### Development (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
```

### Production (.env)

```env
# Server
PORT=5000
NODE_ENV=production

# JWT Configuration (MUST BE SECURE)
JWT_SECRET=<generate-secure-64-char-random-string>
JWT_EXPIRES_IN=7d

# CORS (Your actual domain)
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
```

---

## Frontend Environment Variables

### Vite Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API URL |

### Development (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

### Production (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## Generating Secure Secrets

### Using OpenSSL

```bash
# Generate 64-character random string
openssl rand -base64 48
```

### Using Node.js

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### Using Python

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

---

## Environment-Specific Configuration

### Development

```
NODE_ENV=development
- Verbose logging enabled
- Default JWT secret allowed (with warning)
- CORS allows localhost
- Rate limits are relaxed
```

### Production

```
NODE_ENV=production
- Minimal logging
- Secure JWT secret required
- CORS restricted to domain
- Rate limits enforced
- HTTPS required
```

### Testing

```
NODE_ENV=test
- Test database used
- Mocked external services
- No rate limiting
```

---

## Security Considerations

### Never Commit

- `.env` files with real secrets
- Database files with production data
- SSL certificates and keys

### Always Use

- `.env.example` for templates
- Environment variables for secrets
- Different values per environment

### Rotation Schedule

| Secret | Rotation Frequency |
|--------|-------------------|
| JWT_SECRET | Every 6 months |
| Admin Password | Every 3 months |
| API Keys | As needed |

---

## Validation

### Startup Validation

The application validates critical environment variables on startup:

```typescript
// JWT secret validation
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET ||
      process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
    throw new Error('JWT_SECRET must be set to a secure value in production');
  }
}
```

### Required in Production

- `JWT_SECRET` must be set and secure
- `NODE_ENV` should be `production`
- `CORS_ORIGIN` should be actual domain

---

## Platform-Specific Configuration

### Heroku

```bash
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://your-app.herokuapp.com
```

### Docker

```yaml
# docker-compose.yml
environment:
  - JWT_SECRET=${JWT_SECRET}
  - NODE_ENV=production
  - CORS_ORIGIN=${CORS_ORIGIN}
```

### AWS

```bash
# Parameter Store
aws ssm put-parameter --name "/afghan-exchange/JWT_SECRET" --value "secret" --type SecureString
```

### Vercel

```bash
vercel env add JWT_SECRET production
```

---

## Troubleshooting

### Common Issues

**JWT_SECRET not set**
```
Error: JWT_SECRET must be set to a secure value in production
Solution: Set JWT_SECRET environment variable
```

**CORS errors**
```
Error: Access blocked by CORS policy
Solution: Set CORS_ORIGIN to your frontend URL
```

**Rate limit exceeded**
```
Error: Too many requests
Solution: Wait for rate limit window to reset
```
