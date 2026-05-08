# 📚 Couple Connect - Documentation Index

Welcome to Couple Connect! This guide will help you navigate all the documentation.

## 🚀 Quick Navigation

### 👋 New Here? Start Here!

1. **[GETTING_STARTED.md](GETTING_STARTED.md)** ⭐
   - Visual guide with 3 simple steps
   - Perfect for beginners
   - Screenshots and examples
   - **Start here if you're new!**

2. **[QUICKSTART.md](QUICKSTART.md)**
   - Quick commands to get running
   - Installation steps
   - Basic testing
   - **For experienced developers**

---

### 🔧 Setup & Configuration

3. **[GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md)**
   - Complete game backend configuration
   - Environment variables explained
   - CORS setup
   - Production deployment
   - **Read this for detailed setup**

4. **[MONOREPO_SETUP.md](MONOREPO_SETUP.md)**
   - Monorepo structure explained
   - Workspace configuration
   - Package organization
   - **Understand the project structure**

5. **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)**
   - What files were modified
   - What was added
   - Configuration changes
   - **See what changed in your setup**

---

### 🏗️ Architecture & Design

6. **[ARCHITECTURE.md](ARCHITECTURE.md)**
   - Visual architecture diagrams
   - Communication flow
   - Game room flow
   - Production architecture
   - **Understand how it all works**

---

### ✅ Testing & Verification

7. **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)**
   - Complete testing checklist
   - Step-by-step verification
   - All features to test
   - **Make sure everything works**

8. **[test-setup.js](test-setup.js)**
   - Automated test script
   - Run with: `npm run test:setup`
   - **Quick automated verification**

---

### 🌐 Production Deployment

9. **[README.md](README.md)**
   - Production deployment guide
   - Server setup
   - SSL configuration
   - Docker deployment
   - CI/CD setup
   - **Deploy to production**

10. **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)**
    - Summary of complete setup
    - All features working
    - Next steps
    - **Overview of what you have**

---

## 🎯 Choose Your Path

### Path 1: "I just want to run it!"
```
1. GETTING_STARTED.md (Visual guide)
2. Run: npm install
3. Run: npm run db:generate
4. Run: npm run dev
5. Open: http://localhost:3000
```

### Path 2: "I want to understand everything"
```
1. GETTING_STARTED.md (Overview)
2. ARCHITECTURE.md (How it works)
3. MONOREPO_SETUP.md (Structure)
4. GAME_BACKEND_SETUP.md (Configuration)
5. VERIFICATION_CHECKLIST.md (Testing)
```

### Path 3: "I'm deploying to production"
```
1. QUICKSTART.md (Get it running locally)
2. VERIFICATION_CHECKLIST.md (Test everything)
3. GAME_BACKEND_SETUP.md (Production config)
4. README.md (Deployment guide)
```

### Path 4: "Something's not working"
```
1. Run: npm run test:setup
2. Check: VERIFICATION_CHECKLIST.md
3. Read: GAME_BACKEND_SETUP.md (Troubleshooting)
4. Check: Browser console & backend logs
```

---

## 📖 Documentation by Topic

### Installation & Setup
- [GETTING_STARTED.md](GETTING_STARTED.md) - Visual guide
- [QUICKSTART.md](QUICKSTART.md) - Quick commands
- [MONOREPO_SETUP.md](MONOREPO_SETUP.md) - Structure

### Configuration
- [GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md) - Backend config
- [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md) - What changed
- Environment files in `apps/web/.env` and `apps/api/.env`

### Architecture
- [ARCHITECTURE.md](ARCHITECTURE.md) - Diagrams and flows
- [MONOREPO_SETUP.md](MONOREPO_SETUP.md) - Project structure

### Testing
- [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md) - Manual testing
- [test-setup.js](test-setup.js) - Automated testing
- Run: `npm run test:setup`

### Deployment
- [README.md](README.md) - Production guide
- [GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md) - Production config

### Troubleshooting
- [GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md) - Common issues
- [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md) - Error scenarios
- [GETTING_STARTED.md](GETTING_STARTED.md) - Basic troubleshooting

---

## 🔥 Most Common Tasks

### Starting Development
```bash
npm run dev
```
See: [GETTING_STARTED.md](GETTING_STARTED.md)

### Testing Setup
```bash
npm run test:setup
```
See: [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)

### Building for Production
```bash
npm run build
```
See: [README.md](README.md)

### Checking Backend Health
```bash
curl http://localhost:4000/health
```
See: [GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md)

---

## 📊 Documentation Stats

| Document | Purpose | Audience | Length |
|----------|---------|----------|--------|
| GETTING_STARTED.md | Visual quick start | Beginners | Short |
| QUICKSTART.md | Fast setup | Experienced | Short |
| GAME_BACKEND_SETUP.md | Complete config | All | Long |
| ARCHITECTURE.md | System design | Technical | Medium |
| MONOREPO_SETUP.md | Structure | All | Medium |
| VERIFICATION_CHECKLIST.md | Testing | All | Long |
| README.md | Production | DevOps | Long |
| CHANGES_SUMMARY.md | What changed | All | Medium |
| SETUP_COMPLETE.md | Overview | All | Medium |

---

## 🎯 Quick Reference

### Ports
- Frontend: **3000**
- Backend: **4000**

### Key Files
- Frontend config: `apps/web/.env`
- Backend config: `apps/api/.env`
- Socket service: `apps/web/src/games/services/socketService.ts`
- Game server: `apps/api/src/server.js`

### Key Commands
```bash
npm run dev          # Start both servers
npm run dev:web      # Start frontend only
npm run dev:api      # Start backend only
npm run test:setup   # Test configuration
npm run build        # Build for production
```

### Key URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Health check: http://localhost:4000/health

---

## 🆘 Need Help?

### Step 1: Run the test script
```bash
npm run test:setup
```

### Step 2: Check the relevant documentation
- Setup issues → [GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md)
- Testing → [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)
- Understanding → [ARCHITECTURE.md](ARCHITECTURE.md)

### Step 3: Check logs
- Browser console (F12)
- Backend terminal output
- Network tab (for WebSocket)

### Step 4: Common solutions
- Restart servers: `npm run dev`
- Clear cache: `npm run db:generate`
- Kill ports: `npx kill-port 3000 4000`

---

## 🎉 Ready to Start?

1. **New to the project?**
   → Start with [GETTING_STARTED.md](GETTING_STARTED.md)

2. **Want to dive in quickly?**
   → Check [QUICKSTART.md](QUICKSTART.md)

3. **Need detailed info?**
   → Read [GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md)

4. **Deploying to production?**
   → Follow [README.md](README.md)

---

## 📝 Document Descriptions

### GETTING_STARTED.md ⭐
**Best for:** Complete beginners
**Contains:** Visual guide, 3 simple steps, examples
**Time to read:** 5 minutes

### QUICKSTART.md
**Best for:** Experienced developers
**Contains:** Quick commands, installation, basic testing
**Time to read:** 3 minutes

### GAME_BACKEND_SETUP.md
**Best for:** Everyone
**Contains:** Complete configuration, troubleshooting, production
**Time to read:** 15 minutes

### ARCHITECTURE.md
**Best for:** Technical understanding
**Contains:** Diagrams, flows, system design
**Time to read:** 10 minutes

### MONOREPO_SETUP.md
**Best for:** Understanding structure
**Contains:** Workspace setup, package organization
**Time to read:** 10 minutes

### VERIFICATION_CHECKLIST.md
**Best for:** Testing everything
**Contains:** Complete checklist, all features
**Time to read:** 20 minutes (to complete)

### README.md
**Best for:** Production deployment
**Contains:** Server setup, SSL, Docker, CI/CD
**Time to read:** 20 minutes

### CHANGES_SUMMARY.md
**Best for:** Understanding what changed
**Contains:** Modified files, new features
**Time to read:** 5 minutes

### SETUP_COMPLETE.md
**Best for:** Overview
**Contains:** Summary, features, next steps
**Time to read:** 8 minutes

---

## 🚀 Let's Go!

Pick your starting point and dive in! All documentation is designed to help you succeed.

**Happy coding!** 🎊
