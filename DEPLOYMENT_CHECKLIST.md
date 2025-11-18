# Render Deployment Checklist

Use this checklist to deploy your BusinessCase application to Render.

## Pre-Deployment Checklist

- [ ] All code committed to GitHub/GitLab
- [ ] Current branch is pushed to remote
- [ ] Backend builds successfully (`cd backend && npm run build`)
- [ ] Main frontend builds successfully (`npm run build`)
- [ ] GM dashboard builds successfully (`cd gm-dashboard && npm run build`)
- [ ] Render account connected to your repository

## Step 1: Create PostgreSQL Database

- [ ] Log in to [Render Dashboard](https://dashboard.render.com/)
- [ ] Click "New +" → "PostgreSQL"
- [ ] Configure database:
  - Name: `businesscase-db`
  - Database: `businesscase`
  - Region: `Oregon (US West)`
  - Plan: Choose (Free for testing, Standard $7/mo for production)
- [ ] Click "Create Database"
- [ ] Wait for database to provision (~2-3 minutes)
- [ ] Copy **Internal Database URL** from Connections section
- [ ] Copy all connection details (hostname, port, database, username, password)

## Step 2: Deploy Services via Blueprint

- [ ] Click "New +" → "Blueprint"
- [ ] Select your repository: `antoineant/Businesscaise`
- [ ] Select branch: `claude/deploy-app-netlify-01K9V5c8DM1QEHRD6H7Ayfhz`
- [ ] Render detects `render.yaml` configuration
- [ ] Review the 3 services that will be created (no database)
- [ ] Click "Apply" to start deployment
- [ ] **Don't wait** - proceed immediately to Step 3

## Step 3: Add Backend Database Connection

- [ ] Go to `businesscase-api` service → Environment
- [ ] Add database environment variables:
  - [ ] `DATABASE_URL` = Internal Database URL from Step 1
  - [ ] `DB_HOST` = Hostname from Step 1
  - [ ] `DB_PORT` = `5432`
  - [ ] `DB_NAME` = `businesscase`
  - [ ] `DB_USER` = Username from Step 1
  - [ ] `DB_PASSWORD` = Password from Step 1
- [ ] Click "Save Changes" (triggers automatic redeploy)
- [ ] Wait for backend to deploy successfully (~5-7 minutes)
  - Migrations will run automatically
- [ ] Check logs to confirm migrations ran successfully
- [ ] Copy backend URL: `https://businesscase-api.onrender.com`

## Step 4: Add Frontend Environment Variables

### Main Frontend (`businesscase-frontend`)

- [ ] Wait for initial deployment to complete
- [ ] Go to service settings → Environment
- [ ] Add `VITE_API_URL` = `https://businesscase-api.onrender.com/api`
- [ ] Add `VITE_SOCKET_URL` = `https://businesscase-api.onrender.com`
- [ ] Save and trigger Manual Deploy
- [ ] Wait for redeploy (~3 minutes)
- [ ] Copy frontend URL: `https://businesscase-frontend.onrender.com`

### GM Dashboard (`businesscase-gm-dashboard`)

- [ ] Wait for initial deployment to complete
- [ ] Go to service settings → Environment
- [ ] Add `VITE_API_URL` = `https://businesscase-api.onrender.com/api`
- [ ] Add `VITE_SOCKET_URL` = `https://businesscase-api.onrender.com`
- [ ] Save and trigger Manual Deploy
- [ ] Wait for redeploy (~3 minutes)
- [ ] Copy dashboard URL: `https://businesscase-gm-dashboard.onrender.com`

## Step 5: Add Backend CORS Configuration

### Backend API (`businesscase-api`)

- [ ] Go to service settings → Environment
- [ ] Add `CORS_ORIGIN` = `https://businesscase-frontend.onrender.com,https://businesscase-gm-dashboard.onrender.com`
  - **Important:** No spaces between URLs!
- [ ] Save and trigger Manual Deploy
- [ ] Wait for redeploy (~2 minutes)
- [ ] (Optional) Add `PERPLEXITY_API_KEY` if using AI features

## Step 6: Verify Deployment

- [ ] Check backend health: `https://businesscase-api.onrender.com/health`
  - Should return: `{"status":"ok",...}`
- [ ] Visit main frontend: `https://businesscase-frontend.onrender.com`
  - Should load without errors
- [ ] Visit GM dashboard: `https://businesscase-gm-dashboard.onrender.com`
  - Should load without errors
- [ ] Check browser console for errors
- [ ] Try creating an account / logging in
- [ ] Verify database connection works

## Step 7: Configure Backups (Recommended)

- [ ] Go to database service settings
- [ ] Enable automatic daily backups
- [ ] Set retention period (7-30 days)
- [ ] Test restore procedure

## Step 8: Configure Monitoring (Optional)

- [ ] Set up Render alerts for service downtime
- [ ] Set up Render alerts for high resource usage
- [ ] Monitor logs for errors

## Post-Deployment

- [ ] Document actual URLs in DEPLOYMENT.md
- [ ] Test all major features:
  - [ ] User authentication
  - [ ] Team creation
  - [ ] Game creation (GM)
  - [ ] Session management
  - [ ] Decision submission
  - [ ] Leaderboards
  - [ ] Narrative features
  - [ ] File uploads
  - [ ] Real-time updates (Socket.IO)
- [ ] (Optional) Set up custom domains
- [ ] Update README with production URLs

## Troubleshooting

If you encounter issues, see [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting guide.

## Common Issues

- **Frontend can't connect to API**: Check CORS_ORIGIN is set correctly
- **Database connection errors**: Verify DB environment variables are auto-set
- **Build fails**: Check build logs in Render dashboard
- **WebSocket errors**: Ensure VITE_SOCKET_URL matches backend URL exactly

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Production URLs**:
- Backend: _____________________________________________
- Main Frontend: _____________________________________________
- GM Dashboard: _____________________________________________
