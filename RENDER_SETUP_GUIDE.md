# Render Manual Setup Guide

This guide walks you through deploying BusinessCase to Render with manual database setup.

## Overview

We'll deploy in this order:
1. **Create PostgreSQL Database** (manually)
2. **Deploy Services via Blueprint** (backend + 2 frontends)
3. **Configure Environment Variables**
4. **Run Database Migrations**
5. **Verify Deployment**

---

## Step 1: Create PostgreSQL Database Manually

### 1.1 Create the Database

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure the database:
   - **Name**: `businesscase-db`
   - **Database**: `businesscase` (leave default if it auto-fills)
   - **User**: `businesscase_user` (or leave default)
   - **Region**: `Oregon (US West)` (choose same region as your backend)
   - **PostgreSQL Version**: `16` (or latest)
   - **Plan**: Select your desired plan:
     - **Free**: For testing (limited resources, expires after 90 days)
     - **Standard**: $7/month (1GB RAM, 256MB storage)
     - **Pro**: $20/month (4GB RAM, 512GB storage)
     - **Pro Plus**: Higher tiers available

4. Click **"Create Database"**
5. Wait 2-3 minutes for database to provision

### 1.2 Note Database Credentials

Once the database is created, go to the database page and note these values from the **"Connections"** section:

```
Internal Database URL: postgres://businesscase_user:xxxxx@dpg-xxxxx-a/businesscase
External Database URL: postgres://businesscase_user:xxxxx@dpg-xxxxx-a.oregon-postgres.render.com/businesscase

Hostname: dpg-xxxxx-a.oregon-postgres.render.com
Port: 5432
Database: businesscase
Username: businesscase_user
Password: [auto-generated password]
```

⚠️ **Important**: Copy the **Internal Database URL** - you'll need this for the backend.

---

## Step 2: Deploy Services via Blueprint

### 2.1 Connect Repository to Render

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub/GitLab account if not already connected
3. Select repository: `antoineant/Businesscaise`
4. Select branch: `claude/deploy-app-netlify-01K9V5c8DM1QEHRD6H7Ayfhz` (or merge to main first)
5. Render will detect the `render.yaml` file

### 2.2 Review Services

Render will show you the **3 services** that will be created:

- ✅ `businesscase-api` (Web Service) - Standard plan - Node.js backend
- ✅ `businesscase-frontend` (Static Site) - Free - Student interface
- ✅ `businesscase-gm-dashboard` (Static Site) - Free - GM interface

### 2.3 Deploy

1. Click **"Apply"** to start deployment
2. **DO NOT WAIT** for services to finish - proceed immediately to Step 3
3. The backend will fail initially because database env vars are missing - this is expected

---

## Step 3: Configure Backend Environment Variables

While the services are deploying, add the database credentials to the backend:

### 3.1 Add Database Connection

1. Go to the `businesscase-api` service
2. Click **"Environment"** in the left sidebar
3. Add the following environment variables:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | Internal Database URL from Step 1.2 | `postgres://businesscase_user:xxxxx@dpg-xxxxx-a/businesscase` |
| `DB_HOST` | Hostname from Step 1.2 | `dpg-xxxxx-a.oregon-postgres.render.com` |
| `DB_PORT` | Port from Step 1.2 | `5432` |
| `DB_NAME` | Database name from Step 1.2 | `businesscase` |
| `DB_USER` | Username from Step 1.2 | `businesscase_user` |
| `DB_PASSWORD` | Password from Step 1.2 | `[your password]` |

**How to add:**
- Click **"Add Environment Variable"**
- Enter `Key` and `Value`
- Repeat for all 6 variables above

### 3.2 Trigger Redeploy

1. After adding all database variables, click **"Save Changes"**
2. This will automatically trigger a redeploy
3. The backend build will now succeed and run migrations automatically

### 3.3 Wait for Backend Deployment

- Monitor the **"Logs"** tab
- Look for successful migration messages:
  ```
  Running migrations...
  Migration 001_initial_schema.sql completed
  Migration 002_update_submissions_table.sql completed
  ...
  ```
- Once you see `BusinessCaise Backend Server` and `Status: Running`, the backend is ready
- **Copy the backend URL**: `https://businesscase-api.onrender.com`

---

## Step 4: Configure Frontend Environment Variables

Now that the backend is deployed, configure the frontends:

### 4.1 Main Frontend

1. Go to `businesscase-frontend` service
2. Click **"Environment"**
3. Add these variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://businesscase-api.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://businesscase-api.onrender.com` |

4. Click **"Save Changes"** (triggers automatic redeploy)
5. Wait for deployment to complete (~3 minutes)
6. **Copy the frontend URL**: `https://businesscase-frontend.onrender.com`

### 4.2 GM Dashboard

1. Go to `businesscase-gm-dashboard` service
2. Click **"Environment"**
3. Add these variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://businesscase-api.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://businesscase-api.onrender.com` |

4. Click **"Save Changes"** (triggers automatic redeploy)
5. Wait for deployment to complete (~3 minutes)
6. **Copy the dashboard URL**: `https://businesscase-gm-dashboard.onrender.com`

---

## Step 5: Configure Backend CORS

Now that both frontends are deployed, update the backend to allow them:

1. Go to `businesscase-api` service
2. Click **"Environment"**
3. Add this variable:

| Variable | Value |
|----------|-------|
| `CORS_ORIGIN` | `https://businesscase-frontend.onrender.com,https://businesscase-gm-dashboard.onrender.com` |

⚠️ **Critical**:
- **NO SPACES** between URLs
- Comma-separated
- Must be exact URLs from your deployments

4. Click **"Save Changes"** (triggers automatic redeploy)
5. Wait for backend to redeploy (~2 minutes)

---

## Step 6: Verify Deployment

### 6.1 Test Backend Health

Visit: `https://businesscase-api.onrender.com/health`

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T...",
  "environment": "production"
}
```

### 6.2 Test Main Frontend

1. Visit: `https://businesscase-frontend.onrender.com`
2. Should load the student login/signup page
3. Open browser Developer Tools → Console
4. Should see **no errors** (some warnings are OK)

### 6.3 Test GM Dashboard

1. Visit: `https://businesscase-gm-dashboard.onrender.com`
2. Should load the GM login page
3. Open browser Developer Tools → Console
4. Should see **no errors**

### 6.4 Test Database Connection

1. Try creating a new account on the main frontend
2. If account creation succeeds → database is working! ✅
3. Try logging in with the new account
4. If login succeeds → authentication is working! ✅

---

## Step 7: Optional - Add Perplexity AI (Optional)

If you want to use the AI features ("Ask the Market" and "Reality Lens"):

1. Get a Perplexity API key from https://www.perplexity.ai/
2. Go to `businesscase-api` service → Environment
3. Add:

| Variable | Value |
|----------|-------|
| `PERPLEXITY_API_KEY` | `pplx-xxxxxxxxxxxxx` |

4. Save and redeploy

---

## Troubleshooting

### Backend fails with "Cannot connect to database"

**Fix:**
- Verify `DATABASE_URL` is the **Internal URL** (not External)
- Check all 6 database env vars are set correctly
- Ensure database is in `Active` state in Render dashboard
- Check backend logs for specific error message

### Frontend shows "Network Error" or blank page

**Fix:**
- Open browser console (F12) to see exact error
- Verify `VITE_API_URL` and `VITE_SOCKET_URL` are set correctly
- Check they point to the correct backend URL
- Ensure `CORS_ORIGIN` in backend includes the frontend URL

### Migrations fail during deployment

**Fix:**
1. Go to backend service → Shell
2. Run manually:
   ```bash
   cd backend
   npm run migrate:up
   ```
3. Check logs for specific migration error
4. If a migration failed partway, you may need to fix the database manually

### File uploads don't work

**Fix:**
- Verify the disk is mounted at `/opt/render/project/src/backend/uploads`
- Check disk usage in Render dashboard
- Ensure `UPLOAD_DIR` env var matches mount path

### WebSocket/Real-time features not working

**Fix:**
- Verify `VITE_SOCKET_URL` matches backend URL exactly (no `/api` at the end)
- Check CORS is configured for Socket.IO (it should be, in server.ts)
- Open browser console and look for WebSocket connection errors

---

## Your Deployed URLs

After deployment, fill these in for reference:

- **Database**: `dpg-_____________.oregon-postgres.render.com`
- **Backend API**: `https://businesscase-api.onrender.com`
- **Main Frontend**: `https://businesscase-frontend.onrender.com`
- **GM Dashboard**: `https://businesscase-gm-dashboard.onrender.com`

---

## Cost Breakdown

Based on your Standard tier subscription:

| Service | Plan | Cost |
|---------|------|------|
| PostgreSQL Database | Standard ($7) or higher | ~$7-20/month |
| Backend API | Standard | $25/month |
| Main Frontend | Free (Static) | $0/month |
| GM Dashboard | Free (Static) | $0/month |
| **Total** | | **~$32-45/month** |

Note: Disk storage (1GB) is included with the backend Standard plan.

---

## Next Steps

- ✅ Test all major features (user registration, game creation, submissions, etc.)
- ✅ Set up database backups (Render dashboard → Database → Backups)
- ✅ Configure monitoring alerts (Render dashboard → Settings → Notifications)
- ✅ (Optional) Set up custom domains
- ✅ (Optional) Add Perplexity API for AI features

---

**Deployment Complete!** 🎉

Your BusinessCase application is now live on Render.
