# Troubleshooting Guide

## Common Issues and Solutions

---

## Startup Issues

### Application Won't Start

#### Error: JWT_SECRET must be set

**Cause:** Production mode requires a secure JWT secret.

**Solution:**
```bash
# Set environment variable
export JWT_SECRET=$(openssl rand -base64 48)

# Or in .env file
JWT_SECRET=your-secure-secret-here
```

#### Error: Port already in use

**Cause:** Another process is using port 5000.

**Solution:**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port
PORT=5001 npm start
```

#### Error: Cannot find module

**Cause:** Dependencies not installed or corrupted.

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## Database Issues

### Database file not found

**Cause:** Database hasn't been initialized.

**Solution:**
```bash
cd backend
npm run seed
```

### Database locked

**Cause:** Multiple processes accessing SQLite.

**Solution:**
```bash
# Stop all processes
pm2 stop all

# Restart single instance
pm2 start dist/index.js --name "api" -i 1
```

### Data corruption

**Cause:** Improper shutdown or disk issue.

**Solution:**
```bash
# Restore from backup
cp backup/exchange-latest.db backend/data/exchange.db

# Or reseed (loses data)
npm run seed
```

---

## Authentication Issues

### Invalid or expired token

**Cause:** JWT token has expired or is malformed.

**Solution:**
- Log out and log in again
- Clear localStorage
- Check JWT_EXPIRES_IN setting

### Access token required

**Cause:** Token not included in request.

**Solution:**
- Ensure Authorization header is set
- Check token is stored in localStorage
- Verify axios interceptor is working

### Invalid credentials

**Cause:** Wrong email or password.

**Solution:**
- Verify email is correct
- Reset password if forgotten
- Check if user exists in database

---

## CORS Issues

### Blocked by CORS policy

**Cause:** Frontend origin not allowed.

**Solution:**
```bash
# Set correct origin in .env
CORS_ORIGIN=http://localhost:5173  # Development
CORS_ORIGIN=https://yourdomain.com  # Production
```

### Preflight request failed

**Cause:** OPTIONS request blocked.

**Solution:**
- Ensure CORS middleware is before routes
- Check allowed methods include OPTIONS
- Verify headers are allowed

---

## Rate Limiting Issues

### Too many requests (429)

**Cause:** Rate limit exceeded.

**Solution:**
- Wait for rate limit window to reset (15 minutes)
- Check for infinite loops in code
- Adjust rate limit settings if legitimate

### Auth endpoints rate limited

**Cause:** Too many login attempts.

**Solution:**
- Wait 15 minutes
- Check for brute force attempt
- Increase AUTH_RATE_LIMIT_MAX if needed

---

## Build Issues

### TypeScript compilation errors

**Cause:** Type errors in code.

**Solution:**
```bash
# Check errors
npx tsc --noEmit

# Fix errors or use type assertions
```

### Vite build fails

**Cause:** Various build issues.

**Solution:**
```bash
# Clear cache
rm -rf node_modules/.vite

# Fresh install
npm ci
npm run build
```

### Out of memory

**Cause:** Not enough RAM for build.

**Solution:**
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

---

## Frontend Issues

### Blank page after deploy

**Cause:** Routing not configured for SPA.

**Solution:**
```nginx
# Nginx configuration
location / {
    try_files $uri $uri/ /index.html;
}
```

### API calls failing

**Cause:** Wrong API URL or CORS.

**Solution:**
- Check VITE_API_URL is correct
- Verify backend is running
- Check browser network tab for details

### Styles not loading

**Cause:** CSS not bundled correctly.

**Solution:**
```bash
# Rebuild
npm run build

# Check dist folder for CSS files
```

### RTL layout broken

**Cause:** stylis-plugin-rtl not working.

**Solution:**
- Verify plugin is installed
- Check i18n language is fa or ps
- Ensure CacheProvider is configured

---

## Performance Issues

### Slow API responses

**Cause:** Database or code inefficiency.

**Solution:**
- Add database indexes
- Optimize queries
- Enable caching

### High memory usage

**Cause:** Memory leak or large data.

**Solution:**
```bash
# Monitor with PM2
pm2 monit

# Restart if needed
pm2 restart all
```

### Slow page load

**Cause:** Large bundle or slow API.

**Solution:**
- Enable code splitting
- Optimize images
- Use CDN for static assets

---

## Production Issues

### SSL certificate errors

**Cause:** Certificate expired or misconfigured.

**Solution:**
```bash
# Renew Let's Encrypt
sudo certbot renew

# Check certificate
sudo certbot certificates
```

### Nginx 502 Bad Gateway

**Cause:** Backend not running.

**Solution:**
```bash
# Check backend status
pm2 status

# Restart if needed
pm2 restart all

# Check logs
pm2 logs
```

### Process keeps crashing

**Cause:** Unhandled error or resource issue.

**Solution:**
```bash
# Check logs
pm2 logs --err

# Increase memory limit
pm2 start dist/index.js --max-memory-restart 1G
```

---

## Debugging Commands

### Check Application Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit
```

### Check Nginx

```bash
# Test configuration
sudo nginx -t

# View error log
sudo tail -f /var/log/nginx/error.log

# View access log
sudo tail -f /var/log/nginx/access.log
```

### Check Database

```bash
# SQLite CLI
sqlite3 backend/data/exchange.db

# List tables
.tables

# Check users
SELECT * FROM users;
```

### Check Network

```bash
# Test API endpoint
curl -I http://localhost:5000/api/health

# Check port
netstat -tlnp | grep 5000
```

---

## Getting Help

If issues persist:

1. Check the documentation
2. Search existing issues
3. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Relevant logs
