# Data Protection & Privacy

## Overview

This document outlines how the Afghan Exchange Market application handles, stores, and protects user data.

---

## Data Collection

### Data We Collect

| Data Type | Purpose | Retention |
|-----------|---------|-----------|
| Email | Account identification, login | Until account deletion |
| Username | Display name, unique identifier | Until account deletion |
| Password | Authentication (hashed only) | Until account deletion |
| Full Name | Optional profile information | Until account deletion |
| Language | UI preference | Until account deletion |
| Favorites | User preferences | Until removed by user |
| Alerts | User-configured notifications | Until removed by user |

### Data We Do NOT Collect

- Financial transaction data
- Payment information
- Location data
- Device fingerprints
- Browsing history
- Third-party tracking data

---

## Data Storage

### Database

```
Database: SQLite
Location: backend/data/exchange.db
Encryption: None (file-level)
Access: Server-only
```

### User Data Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,        -- bcrypt hashed
  full_name TEXT,
  role TEXT DEFAULT 'user',
  language TEXT DEFAULT 'en',
  created_at DATETIME,
  updated_at DATETIME
);
```

### Sensitive Data Handling

| Field | Storage | Protection |
|-------|---------|------------|
| Password | Hashed | bcrypt with 12 rounds |
| Email | Plain text | Access controlled |
| JWT Token | Not stored | Client-side only |

---

## Data Transmission

### Transport Security

- **Development**: HTTP (localhost only)
- **Production**: HTTPS required
- **API**: JSON over HTTPS

### Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

### Data Not Transmitted

- Plain text passwords (only hashed)
- Internal database IDs (when possible)
- Server configuration details
- Error stack traces (production)

---

## Data Access

### Access Control Matrix

| Data | Guest | User | Admin |
|------|-------|------|-------|
| Public rates | Read | Read | Read/Write |
| Public news | Read | Read | Read/Write |
| Own profile | - | Read/Write | Read/Write |
| Own favorites | - | Read/Write | Read/Write |
| Own alerts | - | Read/Write | Read/Write |
| Other users | - | - | Read |

### API Endpoint Access

```
Public (No Auth):
GET  /api/rates/*        - Exchange rates
GET  /api/news           - Published news
POST /api/auth/register  - New account
POST /api/auth/login     - Authentication

Private (User Auth):
GET  /api/auth/profile   - Own profile
PUT  /api/auth/profile   - Update profile
GET  /api/user/*         - User data
POST /api/user/*         - User actions

Admin (Admin Auth):
*    /api/rates/*        - Rate management
*    /api/news/*         - News management
```

---

## Data Retention

### Retention Periods

| Data | Retention | Deletion Trigger |
|------|-----------|------------------|
| User account | Indefinite | User request |
| Favorites | Indefinite | User removes |
| Alerts | Indefinite | User deletes |
| Rate history | Indefinite | Admin action |
| News | Indefinite | Admin deletes |

### Data Deletion

Users can delete:
- Individual favorites
- Individual alerts
- (Future) Full account deletion

Admins can delete:
- Exchange rates
- News articles
- (Future) User accounts

---

## Privacy Measures

### Minimal Data Collection

- Only essential data collected
- Optional fields clearly marked
- No unnecessary tracking

### Data Isolation

- Users can only access own data
- No cross-user data exposure
- Admin access is logged

### No Third-Party Sharing

- No data sold to third parties
- No advertising networks
- No analytics tracking (currently)

---

## Client-Side Storage

### localStorage Usage

```javascript
// Stored in browser
localStorage['token']  // JWT token
localStorage['user']   // User object (non-sensitive)
```

### User Object Stored

```json
{
  "id": 1,
  "username": "user",
  "email": "user@example.com",
  "full_name": "User Name",
  "role": "user",
  "language": "en"
}
```

### Security Considerations

- Passwords NEVER stored client-side
- Token cleared on logout
- Token cleared on 401 response
- No sensitive data in user object

---

## Backup & Recovery

### Backup Recommendations

```bash
# Database backup
cp backend/data/exchange.db backup/exchange-$(date +%Y%m%d).db

# Automated backups
# Implement cron job for regular backups
```

### Recovery Process

1. Stop application
2. Restore database file
3. Verify data integrity
4. Restart application
5. Test functionality

---

## Compliance Considerations

### General Principles

- **Lawfulness**: Data collected with user consent
- **Purpose Limitation**: Data used only for stated purposes
- **Minimization**: Only necessary data collected
- **Accuracy**: Users can update their data
- **Storage Limitation**: Data retained only as needed
- **Security**: Appropriate protection measures

### User Rights

| Right | Implementation |
|-------|----------------|
| Access | View profile data |
| Rectification | Update profile |
| Erasure | Delete favorites/alerts |
| Portability | (Future) Export data |

---

## Security Measures

### At Rest

- Database file permissions restricted
- Server access controlled
- Passwords hashed

### In Transit

- HTTPS encryption (production)
- No sensitive data in URLs
- Secure headers

### In Processing

- Input validation
- Output encoding
- Error message sanitization

---

## Incident Response

### Data Breach Protocol

1. **Detection**: Identify breach scope
2. **Containment**: Limit exposure
3. **Assessment**: Determine impact
4. **Notification**: Inform affected users
5. **Remediation**: Fix vulnerabilities
6. **Documentation**: Record incident

### User Notification

In case of breach affecting user data:
- Notify within 72 hours
- Explain what data was affected
- Provide remediation steps
- Offer support

---

## Future Improvements

### Planned Enhancements

- [ ] Full account deletion
- [ ] Data export functionality
- [ ] Enhanced encryption
- [ ] Audit logging
- [ ] Consent management

### Compliance Targets

- GDPR-like protections
- Right to be forgotten
- Data portability
- Consent tracking
