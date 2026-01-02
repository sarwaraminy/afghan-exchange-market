# API Reference

## Overview

Base URL: `http://localhost:5000/api`

All requests should include:
```
Content-Type: application/json
```

Protected endpoints require:
```
Authorization: Bearer <token>
```

---

## Authentication

### Register

Create a new user account.

```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "language": "en"
}
```

**Validation:**
| Field | Rules |
|-------|-------|
| username | Required, 3-30 characters |
| email | Required, valid email |
| password | Required, min 8 chars, uppercase, lowercase, number, special char |
| full_name | Optional |
| language | Optional, one of: en, fa, ps |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "user",
      "language": "en"
    }
  }
}
```

**Errors:**
- `400` - User already exists
- `400` - Validation failed

---

### Login

Authenticate and receive JWT token.

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "user",
      "language": "en"
    }
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `429` - Too many attempts (rate limited)

---

### Get Profile

Get current user's profile.

```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user",
    "language": "en",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update Profile

Update current user's profile.

```http
PUT /auth/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "full_name": "John Smith",
  "language": "fa",
  "current_password": "OldPass123!",
  "new_password": "NewPass456!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Smith",
    "role": "user",
    "language": "fa"
  }
}
```

---

## Exchange Rates

### Get Markets

Get all active markets.

```http
GET /rates/markets
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sarai Shahzada",
      "name_fa": "سرای شهزاده",
      "name_ps": "سرای شهزاده",
      "location": "Kabul",
      "is_active": 1
    }
  ]
}
```

---

### Get Currencies

Get all active currencies.

```http
GET /rates/currencies
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "USD",
      "name": "US Dollar",
      "name_fa": "دالر امریکایی",
      "name_ps": "امریکایی ډالر",
      "symbol": "$",
      "flag_code": "us",
      "is_active": 1
    }
  ]
}
```

---

### Get Exchange Rates

Get exchange rates, optionally filtered by market.

```http
GET /rates/exchange
GET /rates/exchange?market_id=1
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| market_id | integer | Filter by market (optional) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "market_id": 1,
      "currency_id": 1,
      "buy_rate": 70.50,
      "sell_rate": 70.80,
      "previous_buy_rate": 70.30,
      "previous_sell_rate": 70.60,
      "market_name": "Sarai Shahzada",
      "currency_code": "USD",
      "currency_name": "US Dollar",
      "flag_code": "us",
      "change_percent": 0.28
    }
  ]
}
```

---

### Get Gold Rates

Get all gold and precious metal rates.

```http
GET /rates/gold
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "Gold 24K",
      "price_afn": 6200,
      "price_usd": 88,
      "previous_price_afn": 6150,
      "previous_price_usd": 87,
      "unit": "gram"
    }
  ]
}
```

---

### Convert Currency

Convert between currencies.

```http
GET /rates/convert?from=USD&to=AFN&amount=100&market_id=1
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| from | string | Yes | Source currency code |
| to | string | No | Target currency (default: AFN) |
| amount | number | Yes | Amount to convert |
| market_id | integer | No | Market for rates (default: 1) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "from": "USD",
    "to": "AFN",
    "amount": 100,
    "result": 7050,
    "rate": 70.50
  }
}
```

---

### Create Exchange Rate (Admin)

Create a new exchange rate.

```http
POST /rates/exchange
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "market_id": 1,
  "currency_id": 1,
  "buy_rate": 70.50,
  "sell_rate": 70.80
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1
  }
}
```

---

### Update Exchange Rate (Admin)

Update an existing exchange rate.

```http
PUT /rates/exchange/:id
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "buy_rate": 71.00,
  "sell_rate": 71.30
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Rate updated successfully"
}
```

---

### Delete Exchange Rate (Admin)

Delete an exchange rate.

```http
DELETE /rates/exchange/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Rate deleted successfully"
}
```

---

### Create/Update/Delete Gold Rate (Admin)

Similar to exchange rates:

```http
POST /rates/gold
PUT /rates/gold/:id
DELETE /rates/gold/:id
```

---

## News

### Get Published News

Get published news articles.

```http
GET /news
GET /news?category=market&limit=10&offset=0
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| category | string | - | Filter by category |
| limit | integer | 10 | Results per page |
| offset | integer | 0 | Skip results |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "news": [
      {
        "id": 1,
        "title": "Market Update",
        "title_fa": "به‌روزرسانی بازار",
        "title_ps": "د بازار تازه معلومات",
        "content": "Article content...",
        "category": "market",
        "image_url": "https://...",
        "is_published": 1,
        "author_name": "admin",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "limit": 10,
    "offset": 0
  }
}
```

---

### Get News by ID

Get a single news article.

```http
GET /news/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Market Update",
    ...
  }
}
```

---

### Get All News (Admin)

Get all news including unpublished.

```http
GET /news/admin/all
Authorization: Bearer <admin-token>
```

---

### Create News (Admin)

```http
POST /news
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "title": "News Title",
  "title_fa": "عنوان خبر",
  "title_ps": "د خبر عنوان",
  "content": "News content...",
  "content_fa": "محتوای خبر...",
  "content_ps": "د خبر محتوا...",
  "category": "market",
  "image_url": "https://...",
  "is_published": true
}
```

---

### Update News (Admin)

```http
PUT /news/:id
Authorization: Bearer <admin-token>
```

---

### Delete News (Admin)

```http
DELETE /news/:id
Authorization: Bearer <admin-token>
```

---

## User Features

All user endpoints require authentication.

### Get Dashboard

```http
GET /user/dashboard
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "favorites_count": 5,
    "active_alerts_count": 3,
    "recent_rates": [...]
  }
}
```

---

### Get Favorites

```http
GET /user/favorites
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "currency_id": 1,
      "code": "USD",
      "name": "US Dollar",
      "buy_rate": 70.50,
      "sell_rate": 70.80
    }
  ]
}
```

---

### Add Favorite

```http
POST /user/favorites
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currency_id": 1
}
```

---

### Remove Favorite

```http
DELETE /user/favorites/:currency_id
Authorization: Bearer <token>
```

---

### Get Alerts

```http
GET /user/alerts
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "currency_id": 1,
      "code": "USD",
      "target_rate": 72.00,
      "alert_type": "above",
      "is_active": 1,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Create Alert

```http
POST /user/alerts
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currency_id": 1,
  "target_rate": 72.00,
  "alert_type": "above"
}
```

---

### Update Alert

```http
PUT /user/alerts/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "target_rate": 73.00,
  "alert_type": "below",
  "is_active": true
}
```

---

### Delete Alert

```http
DELETE /user/alerts/:id
Authorization: Bearer <token>
```

---

## Health Check

```http
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Error Responses

### Validation Error

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### Authentication Error

```json
{
  "success": false,
  "error": "Access token required"
}
```

### Authorization Error

```json
{
  "success": false,
  "error": "Admin access required"
}
```

### Not Found

```json
{
  "success": false,
  "error": "Resource not found"
}
```

### Rate Limit

```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General | 100 requests | 15 minutes |
| Auth (login/register) | 5 requests | 15 minutes |

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Server Error |
