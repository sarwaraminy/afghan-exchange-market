# Security Policy

## Overview

This document outlines the security policies and practices for the Afghan Exchange Market application. Security is a top priority, and we implement multiple layers of protection to safeguard user data and system integrity.

---

## Authentication Security

### Password Requirements

All user passwords must meet the following criteria:

| Requirement | Specification |
|-------------|---------------|
| Minimum Length | 8 characters |
| Uppercase | At least 1 letter (A-Z) |
| Lowercase | At least 1 letter (a-z) |
| Numbers | At least 1 digit (0-9) |
| Special Characters | At least 1 (!@#$%^&*(),.?":{}|<>) |

### Password Storage

- Passwords are hashed using **bcrypt** with 12 salt rounds
- Plain text passwords are never stored
- Password comparison uses constant-time comparison

### Session Management

| Setting | Value | Description |
|---------|-------|-------------|
| Token Type | JWT | JSON Web Tokens |
| Expiration | 7 days | Token validity period |
| Algorithm | HS256 | HMAC with SHA-256 |

### JWT Security

- Tokens are signed with a secure secret key
- Secret key must be set via environment variable
- Application refuses to start in production without proper secret
- Tokens are validated on every protected request

---

## API Security

### Rate Limiting

Protection against abuse and DoS attacks:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |

When limits are exceeded:
- HTTP 429 (Too Many Requests) is returned
- User must wait for window reset
- Headers indicate remaining quota

### CORS Policy

Cross-Origin Resource Sharing is configured to:

- Allow only specified origins (configurable)
- Default: `http://localhost:5173` (development)
- Production: Must be set to actual domain
- Credentials are allowed for authenticated requests
- Only necessary HTTP methods are permitted

### Input Validation

All user input is validated:

- **express-validator** for request validation
- Type checking on all parameters
- Length limits on strings
- Format validation (email, URL, etc.)
- Sanitization of dangerous characters

### SQL Injection Prevention

- All database queries use parameterized statements
- No string concatenation in SQL
- Input is never directly interpolated into queries

---

## HTTP Security Headers

The application uses **Helmet.js** to set security headers:

| Header | Purpose |
|--------|---------|
| X-Content-Type-Options | Prevents MIME sniffing |
| X-Frame-Options | Prevents clickjacking |
| X-XSS-Protection | XSS filter (legacy browsers) |
| Strict-Transport-Security | Enforces HTTPS |
| Content-Security-Policy | Controls resource loading |
| Referrer-Policy | Controls referrer information |

---

## Data Protection

### Sensitive Data Handling

| Data Type | Protection |
|-----------|------------|
| Passwords | Bcrypt hashed, never logged |
| JWT Tokens | Not stored server-side |
| User Email | Stored, not publicly exposed |
| Session Data | Client-side only (localStorage) |

### Data Transmission

- All production traffic should use HTTPS
- Sensitive data not transmitted in URLs
- API responses exclude sensitive fields

### Database Security

- SQLite database file permissions restricted
- Database not exposed to public network
- Regular backups recommended

---

## Authorization

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| Guest | View public rates, news |
| User | All guest + favorites, alerts, profile |
| Admin | All user + manage rates, news, users |

### Endpoint Protection

```
Public Endpoints (No Auth):
- GET /api/rates/*
- GET /api/news
- POST /api/auth/login
- POST /api/auth/register

User Endpoints (Auth Required):
- GET /api/user/*
- POST /api/user/*
- GET /api/auth/profile

Admin Endpoints (Admin Role Required):
- POST /api/rates/*
- PUT /api/rates/*
- DELETE /api/rates/*
- POST /api/news
- PUT /api/news/*
- DELETE /api/news/*
```

---

## Environment Security

### Required Environment Variables

```env
# CRITICAL - Must be secure in production
JWT_SECRET=<random-32+-character-string>

# Must be set for production
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Environment Variable Handling

- Never commit `.env` files to version control
- Use `.env.example` as template
- Different values for development/production
- Secrets rotated periodically

---

## Incident Response

### Security Incident Types

1. **Critical**: Data breach, system compromise
2. **High**: Authentication bypass, injection attack
3. **Medium**: Rate limit bypass, information disclosure
4. **Low**: Minor policy violation, suspicious activity

### Response Procedure

1. **Identify**: Detect and confirm the incident
2. **Contain**: Limit the scope and impact
3. **Eradicate**: Remove the threat
4. **Recover**: Restore normal operations
5. **Learn**: Document and improve

### Reporting

Security incidents should be reported immediately to:
- Project maintainers
- Security team (if applicable)
- Affected users (if data compromised)

---

## Security Checklist

### Pre-Deployment

- [ ] JWT_SECRET is set to secure random value
- [ ] NODE_ENV is set to 'production'
- [ ] CORS_ORIGIN is set to actual domain
- [ ] HTTPS is enabled
- [ ] Database is not publicly accessible
- [ ] Default admin password is changed
- [ ] Rate limiting is enabled
- [ ] Logging is configured

### Regular Audits

- [ ] Dependency vulnerability scan (npm audit)
- [ ] Review access logs for anomalies
- [ ] Verify rate limits are effective
- [ ] Check for unauthorized admin accounts
- [ ] Review and rotate secrets
- [ ] Test authentication flows
- [ ] Validate input sanitization

---

## Compliance Considerations

### Data Privacy

- Minimal data collection principle
- User data deletion capability
- No third-party data sharing without consent

### Financial Data

- Exchange rates are informational only
- No financial transactions processed
- No payment data stored

---

## Security Updates

### Dependency Updates

- Regular npm audit checks
- Automated vulnerability alerts
- Prompt patching of critical issues

### Security Patches

- Critical: Immediate deployment
- High: Within 24 hours
- Medium: Within 1 week
- Low: Next scheduled release

---

## Contact

For security-related inquiries:
- Do not use public issue trackers for vulnerabilities
- Contact maintainers directly
- Use responsible disclosure practices
