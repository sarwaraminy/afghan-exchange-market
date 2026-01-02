# Deployment Guide

## Overview

This guide covers deploying the Afghan Exchange Market application to production environments.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Domain name (for production)
- SSL certificate (for HTTPS)
- Server with 1GB+ RAM

---

## Quick Start (Development)

### 1. Clone Repository

```bash
git clone <repository-url>
cd afghan-exchange-market
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment

```bash
# Backend configuration
cd backend
cp .env.example .env
# Edit .env with your settings
```

### 4. Seed Database

```bash
cd backend
npm run seed
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Default admin: admin@afghanexchange.com / admin123

---

## Production Deployment

### Option 1: Traditional Server (VPS/Dedicated)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### 2. Deploy Application

```bash
# Clone repository
git clone <repository-url> /var/www/afghan-exchange
cd /var/www/afghan-exchange

# Install dependencies
cd backend && npm ci --production
cd ../frontend && npm ci && npm run build
```

#### 3. Configure Backend

```bash
cd /var/www/afghan-exchange/backend
cp .env.example .env
nano .env
```

**Production .env:**

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=<generate-secure-random-string-32+chars>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
```

#### 4. Build Backend

```bash
cd /var/www/afghan-exchange/backend
npm run build
```

#### 5. Setup PM2

```bash
# Start application
pm2 start dist/index.js --name "afghan-exchange-api"

# Save process list
pm2 save

# Setup startup script
pm2 startup
```

#### 6. Configure Nginx

```nginx
# /etc/nginx/sites-available/afghan-exchange

# API Server
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend Server
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/afghan-exchange/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

#### 7. Enable Site & SSL

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/afghan-exchange /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Restart Nginx
sudo systemctl restart nginx
```

---

### Option 2: Docker Deployment

#### Dockerfile (Backend)

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

#### Dockerfile (Frontend)

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}
    volumes:
      - ./backend/data:/app/data
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  db-data:
```

#### Deploy with Docker

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### Option 3: Platform as a Service (PaaS)

#### Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create afghan-exchange-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-here
heroku config:set CORS_ORIGIN=https://your-frontend.com

# Deploy
git push heroku main
```

#### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

#### Railway

```bash
# Connect GitHub repository
# Set environment variables in dashboard
# Deploy automatically on push
```

---

## Post-Deployment Checklist

### Security

- [ ] Change default admin password
- [ ] Set secure JWT_SECRET
- [ ] Configure CORS_ORIGIN
- [ ] Enable HTTPS
- [ ] Verify rate limiting works
- [ ] Test authentication flow

### Performance

- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set proper cache headers
- [ ] Monitor memory usage

### Monitoring

- [ ] Setup application logging
- [ ] Configure error tracking
- [ ] Setup uptime monitoring
- [ ] Configure backup schedule

### Backup

```bash
# Database backup cron job
0 2 * * * cp /var/www/afghan-exchange/backend/data/exchange.db /backups/exchange-$(date +\%Y\%m\%d).db
```

---

## Updating Application

### Manual Update

```bash
cd /var/www/afghan-exchange

# Pull latest changes
git pull origin main

# Update backend
cd backend
npm ci --production
npm run build
pm2 restart afghan-exchange-api

# Update frontend
cd ../frontend
npm ci
npm run build
```

### Zero-Downtime Update

```bash
# Use PM2 reload instead of restart
pm2 reload afghan-exchange-api

# Or use blue-green deployment with Nginx
```

---

## Scaling Considerations

### Vertical Scaling

- Increase server RAM/CPU
- Optimize database queries
- Add caching layer

### Horizontal Scaling

- Multiple API servers behind load balancer
- Migrate from SQLite to PostgreSQL
- Use Redis for session/cache

### Database Migration

When scaling, consider migrating to PostgreSQL:

1. Export SQLite data
2. Setup PostgreSQL server
3. Import data
4. Update connection code
5. Test thoroughly
6. Switch over

---

## Rollback Procedure

### Quick Rollback

```bash
# Revert to previous commit
git revert HEAD
npm run build
pm2 restart afghan-exchange-api
```

### Full Rollback

```bash
# Checkout specific version
git checkout v1.0.0
npm ci --production
npm run build
pm2 restart afghan-exchange-api

# Restore database backup if needed
cp /backups/exchange-YYYYMMDD.db /var/www/afghan-exchange/backend/data/exchange.db
```
