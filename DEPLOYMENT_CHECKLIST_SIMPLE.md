# ✅ DEPLOYMENT CHECKLIST - Vercel + Railway

## 🎯 BEFORE YOU START

- [ ] GitHub account created
- [ ] Code pushed to GitHub repository
- [ ] MongoDB Atlas database ready (you already have this!)
- [ ] Email credentials ready (you already have this!)

---

## 📦 PART 1: DEPLOY BACKEND TO RAILWAY (15 minutes)

### Step 1: Create Railway Account
- [ ] Go to https://railway.app
- [ ] Click "Login with GitHub"
- [ ] Authorize Railway

### Step 2: Create New Project
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your "Couple connect" repository
- [ ] Railway will automatically detect and start deploying

### Step 3: Configure Root Directory (IMPORTANT!)
- [ ] In Railway dashboard, go to Settings
- [ ] Set "Root Directory" to: `apps/api`
- [ ] Set "Start Command" to: `npm start`
- [ ] Click "Save"

### Step 4: Add Environment Variables
Go to Variables tab and add these ONE BY ONE:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb+srv://viral:viral12@coupleconnect.crvqwnd.mongodb.net/couple-connect
JWT_SECRET=make-this-a-long-random-string-abc123xyz789
SESSION_SECRET=another-long-random-string-def456uvw012
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=viralmak32@gmail.com
EMAIL_PASS=lavp aedm agwl gabw
MEILISEARCH_HOST=https://ms-78fa9f130e4f-37562.fra.meilisearch.io
MEILISEARCH_MASTER_KEY=d90780b550140f5dce2ac74b8a49e67b67f77a9aca4860479246847fe6151222
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100
```

### Step 5: Get Your Railway URL
- [ ] After deployment completes, click "Settings"
- [ ] Click "Generate Domain"
- [ ] Copy the URL (e.g., `https://yourapp.railway.app`)
- [ ] **WRITE IT DOWN!** You need this for Vercel

### Step 6: Update MEDIASOUP_ANNOUNCED_IP
- [ ] Go back to Variables tab
- [ ] Add: `MEDIASOUP_ANNOUNCED_IP=yourapp.railway.app` (without https://)
- [ ] Click "Add"

### Step 7: Test Backend
- [ ] Open: `https://yourapp.railway.app/health`
- [ ] You should see: `{"status":"OK","timestamp":"..."}`
- [ ] If you see this, backend is working! ✅

---

## 🎨 PART 2: DEPLOY FRONTEND TO VERCEL (10 minutes)

### Step 1: Create Vercel Account
- [ ] Go to https://vercel.com
- [ ] Click "Sign Up with GitHub"
- [ ] Authorize Vercel

### Step 2: Import Project
- [ ] Click "Add New..." → "Project"
- [ ] Select your "Couple connect" repository
- [ ] Click "Import"

### Step 3: Configure Build Settings
In the configuration screen:

- [ ] Framework Preset: **Next.js**
- [ ] Root Directory: **apps/web** (Click "Edit" to change)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`

### Step 4: Add Environment Variables
Click "Environment Variables" and add these:

**REPLACE `YOUR_RAILWAY_URL` with the URL from Part 1, Step 5!**

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://YOUR_RAILWAY_URL
NEXT_PUBLIC_SOCKET_URL=https://YOUR_RAILWAY_URL
DATABASE_URL=mongodb+srv://viral:viral12@coupleconnect.crvqwnd.mongodb.net/couple-connect
NEXT_PUBLIC_MEILISEARCH_HOST=https://ms-78fa9f130e4f-37562.fra.meilisearch.io
NEXT_PUBLIC_MEILISEARCH_API_KEY=d90780b550140f5dce2ac74b8a49e67b67f77a9aca4860479246847fe6151222
```

### Step 5: Deploy!
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes for build to complete
- [ ] You'll get a URL like: `https://couple-connect.vercel.app`

### Step 6: Get Your Vercel URL
- [ ] Copy your Vercel URL
- [ ] Go back to Railway dashboard
- [ ] Add to Variables: `ALLOWED_ORIGINS=https://your-vercel-url.vercel.app`

---

## 🔧 PART 3: FINAL CONFIGURATION (5 minutes)

### Update Backend CORS
- [ ] Go to Railway dashboard
- [ ] Go to Variables
- [ ] Add: `ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000`
- [ ] Railway will auto-redeploy

### Update Frontend URLs
- [ ] Go to Vercel dashboard
- [ ] Go to Settings → Environment Variables
- [ ] Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
- [ ] Click "Save"
- [ ] Go to Deployments → Click "..." → "Redeploy"

---

## ✅ TESTING YOUR DEPLOYMENT

### Test Backend
- [ ] Open: `https://your-railway-url.railway.app/health`
- [ ] Should show: `{"status":"OK"}`

### Test Frontend
- [ ] Open: `https://your-vercel-app.vercel.app`
- [ ] Should load the homepage

### Test Full App
- [ ] Try to sign up / login
- [ ] Try to send a message (chat)
- [ ] Try to start a video call
- [ ] Try to play a game

---

## 🆘 IF SOMETHING DOESN'T WORK

### Backend Issues (Railway)
1. Check logs: Railway Dashboard → Deployments → View Logs
2. Make sure all environment variables are set
3. Check if MongoDB connection works

### Frontend Issues (Vercel)
1. Check logs: Vercel Dashboard → Deployments → View Function Logs
2. Make sure all NEXT_PUBLIC_ variables are set
3. Check browser console (F12) for errors

### CORS Errors
1. Make sure ALLOWED_ORIGINS in Railway includes your Vercel URL
2. Make sure both URLs use HTTPS (not HTTP)

### Video Calling Not Working
1. Check MEDIASOUP_ANNOUNCED_IP is set to Railway domain (without https://)
2. Check browser console for WebRTC errors

---

## 💰 COST

**Railway:** $5 free credit/month (enough for testing)
**Vercel:** Free tier (100GB bandwidth/month)
**MongoDB Atlas:** Free tier (512MB storage)

**Total: $0 to start!**

---

## 🎉 DONE!

Your app is now live on the internet!

- Frontend: https://your-app.vercel.app
- Backend: https://your-app.railway.app

Share the Vercel URL with anyone to use your app!
