# Render Deployment Checklist

Use this checklist to deploy your BusinessCase application to Render.

## Pre-Deployment Checklist

- [ ] All code committed to GitHub/GitLab
- [ ] Current branch is pushed to remote
- [ ] Backend builds successfully (`cd backend && npm run build`)
- [ ] Main frontend builds successfully (`npm run build`)
- [ ] GM dashboard builds successfully (`cd gm-dashboard && npm run build`)
- [ ] Render account connected to your repository

## Step 1: Connect Repository to Render

- [ ] Log in to [Render Dashboard](https://dashboard.render.com/)
- [ ] Click "New +" → "Blueprint"
- [ ] Select your repository: `antoineant/Businesscaise`
- [ ] Render detects `render.yaml` configuration
- [ ] Review the 4 services that will be created

## Step 2: Deploy Services

- [ ] Click "Apply" to start deployment
- [ ] Wait for database to provision (~2-3 minutes)
- [ ] Wait for backend API to deploy (~5-7 minutes)
- [ ] Note down the backend URL: `https://businesscase-api.onrender.com`

## Step 3: Configure Environment Variables

### Backend API (`businesscase-api`)

- [ ] Verify auto-generated `JWT_SECRET` is set
- [ ] **Set `CORS_ORIGIN`** (CRITICAL - see Step 4)
- [ ] (Optional) Set `PERPLEXITY_API_KEY` if using AI features

### Main Frontend (`businesscase-frontend`)

- [ ] Set `VITE_API_URL` = `https://businesscase-api.onrender.com/api`
- [ ] Set `VITE_SOCKET_URL` = `https://businesscase-api.onrender.com`
- [ ] Trigger redeploy after setting variables

### GM Dashboard (`businesscase-gm-dashboard`)

- [ ] Set `VITE_API_URL` = `https://businesscase-api.onrender.com/api`
- [ ] Set `VITE_SOCKET_URL` = `https://businesscase-api.onrender.com`
- [ ] Trigger redeploy after setting variables

## Step 4: Update CORS

After both frontends are deployed:

- [ ] Note frontend URLs:
  - Main: `https://businesscase-frontend.onrender.com`
  - GM: `https://businesscase-gm-dashboard.onrender.com`
- [ ] Go to backend API service settings
- [ ] Set `CORS_ORIGIN` to:
  ```
  https://businesscase-frontend.onrender.com,https://businesscase-gm-dashboard.onrender.com
  ```
  (No spaces, comma-separated)
- [ ] Save and trigger backend redeploy

## Step 5: Verify Deployment

- [ ] Check backend health: `https://businesscase-api.onrender.com/health`
  - Should return: `{"status":"ok",...}`
- [ ] Visit main frontend: `https://businesscase-frontend.onrender.com`
  - Should load without errors
- [ ] Visit GM dashboard: `https://businesscase-gm-dashboard.onrender.com`
  - Should load without errors
- [ ] Check browser console for errors
- [ ] Try creating an account / logging in
- [ ] Verify database connection works

## Step 6: Configure Backups (Recommended)

- [ ] Go to database service settings
- [ ] Enable automatic daily backups
- [ ] Set retention period (7-30 days)
- [ ] Test restore procedure

## Step 7: Configure Monitoring (Optional)

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
