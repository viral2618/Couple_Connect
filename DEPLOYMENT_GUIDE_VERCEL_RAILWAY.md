# 🚀 COMPLETE DEPLOYMENT GUIDE - Vercel (Frontend) + Railway (Backend)

## ✅ YES! This is the BEST approach for your app!

**Why this combination is perfect:**
- ✅ Vercel = Best for Next.js (Frontend)
- ✅ Railway = Best for Node.js + WebSocket + Video calling (Backend)
- ✅ Both have FREE tiers
- ✅ Automatic deployments from GitHub
- ✅ Easy to manage
- ✅ Scalable

---

## 📋 STEP-BY-STEP DEPLOYMENT (Follow Exactly)

### PART 1: Deploy Backend to Railway (Do This FIRST!)

#### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

#### Step 2: Deploy Backend
1. Click "Deploy from GitHub repo"
2. Select your repository
3. Railway will detect your app automatically

#### Step 3: Configure Backend Environment Variables
In Railway Dashboard, go to Variables tab and add:

```env
NODE_ENV=production
PORT=3000

# Database (Your MongoDB)
DATABASE_URL=mongodb+srv://viral:viral12@coupleconnect.crvqwnd.mongodb.net/couple-connect

# Security
JWT_SECRET=your-super-secure-random-string-here-make-it-long
SESSION_SECRET=another-super-secure-random-string-here

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=viralmak32@gmail.com
EMAIL_PASS=lavp aedm agwl gabw

# MeiliSearch (Use Railway's MeiliSearch or external)
MEILISEARCH_HOST=https://ms-78fa9f130e4f-37562.fra.meilisearch.io
MEILISEARCH_MASTER_KEY=d90780b550140f5dce2ac74b8a49e67b67f77a9aca4860479246847fe6151222
NEXT_PUBLIC_MEILISEARCH_HOST=https://ms-78fa9f130e4f-37562.fra.meilisearch.io
NEXT_PUBLIC_MEILISEARCH_API_KEY=d90780b550140f5dce2ac74b8a49e67b67f77a9aca4860479246847fe6151222

# Video Calling - IMPORTANT!
# After deployment, Railway will give you a domain like: yourapp.railway.app
# Come back and set this to that domain (without https://)
MEDIASOUP_ANNOUNCED_IP=yourapp.railway.app
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100
```

#### Step 4: Get Railway Backend URL
After deployment, Railway will give you a URL like:
`https://coupleconnect-production.up.railway.app`

**SAVE THIS URL!** You'll need it for Vercel.

---

### PART 2: Deploy Frontend to Vercel

#### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"

#### Step 2: Import Your Repository
1. Select your GitHub repository
2. Vercel will detect Next.js automatically

#### Step 3: Configure Build Settings
**Root Directory:** `apps/web`
**Build Command:** `npm run build`
**Output Directory:** `.next`
**Install Command:** `npm install`

#### Step 4: Add Environment Variables in Vercel
In Vercel project settings → Environment Variables:

```env
NODE_ENV=production

# Backend URL (Your Railway URL from Part 1)
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-railway-backend.railway.app

# App URL (Vercel will give you this after first deploy)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# MeiliSearch
NEXT_PUBLIC_MEILISEARCH_HOST=https://ms-78fa9f130e4f-37562.fra.meilisearch.io
NEXT_PUBLIC_MEILISEARCH_API_KEY=d90780b550140f5dce2ac74b8a49e67b67f77a9aca4860479246847fe6151222

# Database (for API routes if needed)
DATABASE_URL=mongodb+srv://viral:viral12@coupleconnect.crvqwnd.mongodb.net/couple-connect
```

#### Step 5: Deploy!
Click "Deploy" and wait 2-3 minutes.

---

## 🔧 CONFIGURATION FILES NEEDED

You need to update a few files for this setup to work properly.

### File 1: Railway Configuration (Backend)
Create `railway.json` in root with backend-specific settings.

### File 2: Vercel Configuration (Frontend)
Create `vercel.json` in `apps/web` folder.

### File 3: Update API URLs
Update your frontend code to use Railway backend URL.

---

## ⚠️ IMPORTANT THINGS TO DO AFTER DEPLOYMENT

### 1. Update CORS in Backend
Your backend needs to allow requests from Vercel domain.

### 2. Update Socket.io Connection
Frontend needs to connect to Railway backend for WebSocket.

### 3. Update MEDIASOUP_ANNOUNCED_IP
Set this to your Railway domain in Railway dashboard.

### 4. Test Everything
- ✅ Login/Signup works
- ✅ Chat works (WebSocket)
- ✅ Video calling works
- ✅ Games work

---

## 🎯 QUICK DEPLOYMENT CHECKLIST

- [ ] Deploy backend to Railway
- [ ] Get Railway backend URL
- [ ] Add all environment variables in Railway
- [ ] Deploy frontend to Vercel
- [ ] Add environment variables in Vercel (with Railway URL)
- [ ] Update CORS in backend code
- [ ] Update Socket.io connection in frontend
- [ ] Test the app
- [ ] Update MEDIASOUP_ANNOUNCED_IP in Railway

---

## 🆘 IF SOMETHING DOESN'T WORK

### Backend Issues (Railway)
- Check Railway logs: Dashboard → Deployments → View Logs
- Make sure all environment variables are set
- Check if MongoDB connection works

### Frontend Issues (Vercel)
- Check Vercel logs: Dashboard → Deployments → View Function Logs
- Make sure NEXT_PUBLIC_SOCKET_URL points to Railway
- Check browser console for errors

### Video Calling Not Working
- Make sure MEDIASOUP_ANNOUNCED_IP is set to Railway domain
- Check if ports 10000-10100 are open (Railway handles this automatically)

---

## 💰 COST

**Railway Free Tier:**
- $5 free credit per month
- Enough for small apps
- Upgrade to $5/month for more resources

**Vercel Free Tier:**
- 100GB bandwidth per month
- Unlimited deployments
- Perfect for personal projects

**Total Cost: $0 to start!**

---

## 🚀 READY TO DEPLOY?

Run the automated scripts I created for you!
