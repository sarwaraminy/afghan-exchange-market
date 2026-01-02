# API Documentation

This directory contains the complete API reference for the Afghan Exchange Market backend.

## Contents

- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API endpoint documentation

## Base URL

```
Development: http://localhost:5000/api
Production:  https://api.yourdomain.com/api
```

## Authentication

Most endpoints require authentication via JWT Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... }
}
```

Or on error:

```json
{
  "success": false,
  "error": "Error message"
}
```
