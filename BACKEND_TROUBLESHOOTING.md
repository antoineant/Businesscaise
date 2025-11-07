# Backend Server Troubleshooting Guide

If your backend server crashes or fails to start, follow these steps to diagnose and fix the issue.

---

## Quick Fix (Most Common Issues)

### 1. Run the Post-Pull Setup Script

```bash
./setup-after-pull.sh
```

This script will:
- ✅ Install all dependencies
- ✅ Create missing .env files
- ✅ Check database connectivity
- ✅ Verify TypeScript compilation
- ✅ Set up required directories

### 2. Restart Backend

```bash
cd backend
npm run dev
```

---

## Common Crash Causes

### Issue 1: Missing Dependencies

**Symptoms:**
```
Error: Cannot find module 'express'
Error: Cannot find module 'cors'
```

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..
```

---

### Issue 2: Missing .env File

**Symptoms:**
```
Error: CORS origin not defined
Server crashes on startup
```

**Solution:**
```bash
# Check if .env exists
ls -la backend/.env

# If missing, create it:
cat > backend/.env << 'EOF'
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=businesscaise
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=businesscaise_dev_secret_key_please_change_in_production_2024
JWT_EXPIRES_IN=7d

# CORS (IMPORTANT: Include both frontends!)
CORS_ORIGIN=http://localhost:5173,http://localhost:3002

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
EOF
```

**Key Point:** Make sure `CORS_ORIGIN` includes **both ports**:
- `5173` = Team Frontend
- `3002` = GM Dashboard

---

### Issue 3: CORS Configuration Error

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
Backend crashes when GM Dashboard tries to connect
```

**Solution:**

1. **Check your backend/.env file has both origins:**
   ```bash
   cat backend/.env | grep CORS_ORIGIN
   # Should show: CORS_ORIGIN=http://localhost:5173,http://localhost:3002
   ```

2. **If missing the GM Dashboard origin, update it:**
   ```bash
   # Edit backend/.env and change:
   CORS_ORIGIN=http://localhost:5173
   # To:
   CORS_ORIGIN=http://localhost:5173,http://localhost:3002
   ```

3. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```

---

### Issue 4: Database Connection Failed

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: password authentication failed for user "postgres"
```

**Solution:**

1. **Check PostgreSQL is running:**
   ```bash
   pg_isready
   # Should output: /tmp:5432 - accepting connections
   ```

2. **If not running, start it:**
   ```bash
   # macOS
   brew services start postgresql@14

   # Linux
   sudo systemctl start postgresql
   ```

3. **Verify database exists:**
   ```bash
   psql -U postgres -l | grep businesscaise
   ```

4. **If missing, create it:**
   ```bash
   cd backend
   ./setup-db.sh
   cd ..
   ```

---

### Issue 5: TypeScript Compilation Errors

**Symptoms:**
```
TSError: Unable to compile TypeScript
Property 'X' does not exist on type 'Y'
```

**Solution:**

1. **Check what's failing:**
   ```bash
   cd backend
   npm run build
   ```

2. **If compilation fails, check for:**
   - Missing type definitions
   - Incorrect imports
   - Schema mismatches

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### Issue 6: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**

1. **Kill process on port 3001:**
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

2. **Or find what's using it:**
   ```bash
   lsof -i:3001
   ```

3. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```

---

### Issue 7: Missing Upload Directory

**Symptoms:**
```
Error: ENOENT: no such file or directory, stat './uploads'
```

**Solution:**
```bash
mkdir -p backend/uploads
```

---

### Issue 8: Socket.IO Connection Errors

**Symptoms:**
```
WebSocket connection failed
CORS error on Socket.IO handshake
```

**Solution:**

The Socket.IO server also needs proper CORS configuration. This is automatically handled if you have:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3002
```

Make sure both origins are comma-separated in your `backend/.env` file.

---

## Diagnostic Commands

### Check Backend Status

```bash
# 1. Check if backend is running
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"...","environment":"development"}

# 2. Check if API is accessible
curl http://localhost:3001/api/auth/me

# Expected: 401 Unauthorized (which means API is working, just not authenticated)

# 3. Check backend logs
cd backend
npm run dev

# Look for:
# ✓ "BusinessCaise Backend Server"
# ✓ "Status: Running"
# ✓ "Port: 3001"
```

### Check Database Connectivity

```bash
# Test PostgreSQL connection
psql -U postgres -d businesscaise -c "SELECT current_database();"

# List all tables
psql -U postgres -d businesscaise -c "\dt"

# Check if tables have data
psql -U postgres -d businesscaise -c "SELECT COUNT(*) FROM users;"
```

### Check Environment Variables

```bash
# Display all backend env vars
cd backend
cat .env

# Should show:
# - PORT=3001
# - DB_NAME=businesscaise
# - CORS_ORIGIN=http://localhost:5173,http://localhost:3002
# - JWT_SECRET=...
```

---

## Step-by-Step Reset (Nuclear Option)

If nothing else works, do a complete reset:

```bash
# 1. Stop all processes
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# 2. Clean backend
cd backend
rm -rf node_modules package-lock.json dist
npm install
cd ..

# 3. Clean GM Dashboard
cd gm-dashboard
rm -rf node_modules package-lock.json dist
npm install
cd ..

# 4. Clean root
rm -rf node_modules package-lock.json
npm install

# 5. Reset database
cd backend
./setup-db.sh
cd ..

# 6. Verify .env files exist
ls -la backend/.env
ls -la gm-dashboard/.env

# 7. Test backend compilation
cd backend
npm run build
cd ..

# 8. Start backend
cd backend
npm run dev
```

---

## Still Having Issues?

### Enable Debug Logging

1. **Set environment variable:**
   ```bash
   export DEBUG=*
   cd backend
   npm run dev
   ```

2. **Check logs directory:**
   ```bash
   tail -f logs/backend-e2e.log
   ```

### Check Backend Code

1. **Verify server.ts has correct CORS parsing:**
   ```bash
   grep -A 5 "corsOrigins" backend/src/server.ts
   ```

   Should show:
   ```typescript
   const corsOrigins = process.env.CORS_ORIGIN
     ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
     : ['http://localhost:5173'];
   ```

2. **Verify routes are registered:**
   ```bash
   grep "app.use" backend/src/server.ts
   ```

   Should show:
   ```typescript
   app.use('/api/auth', authRoutes);
   app.use('/api/gm', gmRoutes);
   app.use('/api/teams', teamRoutes);
   ```

---

## Testing After Fix

Once backend is running, test each endpoint:

```bash
# 1. Health check
curl http://localhost:3001/health

# 2. Auth endpoint (should return 401)
curl http://localhost:3001/api/auth/me

# 3. GM endpoint (should return 401)
curl http://localhost:3001/api/gm/games

# 4. Team endpoint (should return 400 or 401)
curl http://localhost:3001/api/teams/join

# If all return proper error codes (not 500), backend is working!
```

---

## Prevention

To avoid these issues in the future:

1. **Always run after pulling:**
   ```bash
   ./setup-after-pull.sh
   ```

2. **Keep .env files synced:**
   - `backend/.env` should have both CORS origins
   - `gm-dashboard/.env` should point to correct API

3. **Restart services after code changes:**
   - Backend auto-restarts with `npm run dev` (nodemon)
   - But after dependency changes, do full restart

4. **Check logs regularly:**
   ```bash
   tail -f logs/*.log
   ```

---

## Quick Reference

| Problem | Quick Fix |
|---------|-----------|
| Missing dependencies | `cd backend && npm install` |
| Missing .env | `./setup-after-pull.sh` |
| CORS error | Add `http://localhost:3002` to `CORS_ORIGIN` |
| Port in use | `lsof -ti:3001 \| xargs kill -9` |
| DB not found | `cd backend && ./setup-db.sh` |
| TypeScript error | `cd backend && npm run build` |
| Socket.IO error | Check CORS includes both origins |

---

**Need Help?** Check the backend logs at `logs/backend-e2e.log` for detailed error messages.
