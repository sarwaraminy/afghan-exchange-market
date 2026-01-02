# Security Audit Report - Afghan Exchange Market

**Date:** January 2, 2026
**Auditor:** Claude Code Security Review
**Application:** Afghan Exchange Market (Sarafi)

---

## Executive Summary

A comprehensive security audit was performed on the Afghan Exchange Market application. The audit identified **2 critical**, **4 high**, **4 medium**, and **2 low** severity issues. This document details each finding and the remediation steps taken.

---

## Findings Summary

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | CRITICAL | Hardcoded/Weak JWT Secret | FIXED |
| 2 | CRITICAL | Hardcoded Admin Credentials | DOCUMENTED |
| 3 | HIGH | Unrestricted CORS Configuration | FIXED |
| 4 | HIGH | Validation Results Not Enforced | FIXED |
| 5 | HIGH | Weak Password Policy | FIXED |
| 6 | HIGH | No Rate Limiting | FIXED |
| 7 | MEDIUM | JWT Stored in localStorage | DOCUMENTED |
| 8 | MEDIUM | Missing Security Headers | FIXED |
| 9 | MEDIUM | Unvalidated image_url Field | FIXED |
| 10 | MEDIUM | .env File Security | DOCUMENTED |
| 11 | LOW | Verbose Error Logging | DOCUMENTED |
| 12 | LOW | Client-Side Role Trust | DOCUMENTED |

---

## Detailed Findings & Remediation

### 1. CRITICAL - Hardcoded/Weak JWT Secret

**Location:**
- `backend/.env`
- `backend/src/middleware/auth.ts`
- `backend/src/controllers/authController.ts`

**Issue:** The JWT secret used a placeholder value and code fell back to `'secret'` if environment variable was not set.

**Risk:** Attackers could forge valid JWT tokens and impersonate any user.

**Remediation:**
- Removed fallback to weak `'secret'` value
- Application now throws error if JWT_SECRET is not configured
- Added `.env.example` file with instructions

---

### 2. CRITICAL - Hardcoded Admin Credentials

**Location:** `backend/src/seed.ts`

**Issue:** Admin credentials (`admin@afghanexchange.com` / `admin123`) are hardcoded in seed file.

**Risk:** Default credentials are a common attack vector.

**Recommendation:**
- Change admin password immediately after deployment
- Consider implementing forced password change on first login
- Use environment variables for initial admin setup in production

---

### 3. HIGH - Unrestricted CORS Configuration

**Location:** `backend/src/index.ts`

**Issue:** CORS was configured to allow all origins (`cors()`).

**Risk:** Any website could make authenticated requests to the API.

**Remediation:**
- Added configurable CORS origins via environment variable
- Defaults to localhost for development
- Production should set `CORS_ORIGIN` to specific domain

---

### 4. HIGH - Validation Results Not Enforced

**Location:** All route files and controllers

**Issue:** express-validator rules were defined but `validationResult()` was never checked.

**Risk:** Invalid/malicious data could bypass validation entirely.

**Remediation:**
- Created `validateRequest` middleware that checks validation results
- Applied middleware to all routes with validation rules
- Returns 400 with specific error messages on validation failure

---

### 5. HIGH - Weak Password Policy

**Location:** `backend/src/routes/auth.ts`

**Issue:** Password only required 6 characters minimum with no complexity requirements.

**Risk:** Weak passwords are easily brute-forced.

**Remediation:**
- Increased minimum length to 8 characters
- Added requirement for uppercase letter
- Added requirement for lowercase letter
- Added requirement for number
- Added requirement for special character

---

### 6. HIGH - No Rate Limiting

**Location:** `backend/src/index.ts`

**Issue:** No rate limiting on any endpoints, especially authentication.

**Risk:** Brute force attacks, credential stuffing, denial of service.

**Remediation:**
- Added general rate limit (100 requests per 15 minutes)
- Added strict rate limit on auth endpoints (5 requests per 15 minutes)
- Returns 429 Too Many Requests when limit exceeded

---

### 7. MEDIUM - JWT Stored in localStorage

**Location:** `frontend/src/context/AuthContext.tsx`

**Issue:** JWT tokens stored in localStorage are vulnerable to XSS attacks.

**Risk:** If XSS vulnerability exists, tokens can be stolen.

**Recommendation:**
- Consider migrating to HttpOnly cookies for token storage
- Current implementation is acceptable given no XSS vulnerabilities found
- Continue monitoring for XSS vulnerabilities

---

### 8. MEDIUM - Missing Security Headers

**Location:** `backend/src/index.ts`

**Issue:** No security headers were set (X-Content-Type-Options, X-Frame-Options, etc.)

**Remediation:**
- Added helmet.js middleware
- Configures multiple security headers automatically
- Includes CSP, X-Frame-Options, HSTS, etc.

---

### 9. MEDIUM - Unvalidated image_url Field

**Location:** `backend/src/routes/news.ts`

**Issue:** image_url field accepted any string without URL validation.

**Risk:** Could be used for SSRF or displaying malicious content.

**Remediation:**
- Added URL validation for image_url field
- Only accepts valid URLs or empty values

---

### 10. MEDIUM - .env File Security

**Location:** `backend/.env`

**Issue:** .env file may have been committed to version control.

**Recommendation:**
- Verify .env is in .gitignore (it is)
- Check git history for accidentally committed secrets
- Rotate any secrets that may have been exposed
- Created `.env.example` as template

---

### 11. LOW - Verbose Error Logging

**Location:** All controllers

**Issue:** Full error objects logged to console in production.

**Recommendation:**
- Consider using a logging library (winston, pino)
- Set different log levels for development/production
- Sanitize sensitive data from logs

---

### 12. LOW - Client-Side Role Trust

**Location:** `frontend/src/context/AuthContext.tsx`

**Issue:** UI role checks based on localStorage which users can modify.

**Risk:** UI can be manipulated (backend still enforces authorization).

**Status:** Acceptable - backend properly validates all admin operations.

---

## Positive Security Findings

| Area | Status | Details |
|------|--------|---------|
| SQL Injection | Protected | Parameterized queries used throughout |
| XSS | Protected | No dangerouslySetInnerHTML, React escapes output |
| Password Hashing | Good | bcrypt with 12 rounds |
| Dependencies | Clean | npm audit shows 0 vulnerabilities |
| Admin Routes | Protected | isAdmin middleware properly enforced |
| HTTPS | Note | Ensure HTTPS in production |

---

## Post-Remediation Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET in production
- [ ] Configure CORS_ORIGIN for production domain
- [ ] Enable HTTPS in production
- [ ] Review and rotate any potentially exposed secrets
- [ ] Set up monitoring for failed login attempts
- [ ] Consider implementing account lockout after failed attempts
- [ ] Set up security logging and alerting

---

## Dependencies Added

```json
{
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5"
}
```

Install with: `cd backend && npm install helmet express-rate-limit`

---

## Environment Variables

New/updated environment variables:

```env
# Required - Must be set in production
JWT_SECRET=<generate-strong-random-secret-min-32-chars>

# Optional - Defaults shown
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
```

---

*Report generated as part of security hardening initiative.*
