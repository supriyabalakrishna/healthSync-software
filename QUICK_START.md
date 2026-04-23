# Quick Start Guide - Run These Commands

## Fresh Start (First Time)

### Terminal 1: Install & Start Backend
```bash
cd backend
npm install
npm start
```

Wait for:
```
✅ MongoDB connected successfully
🚀 HealthSync server running on port 5000
```

---

### Terminal 2: Install & Start Frontend  
```bash
cd frontend
npm install
npm run dev
```

Wait for:
```
Local: http://localhost:5173
```

---

### Terminal 3: Start MongoDB (If Needed - Windows)
```powershell
net start MongoDB
```

Or if using `mongod`:
```bash
mongod
```

---

## Every Time After

### Terminal 1: Backend
```bash
cd backend
npm start
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

Then open: **http://localhost:5173**

---

## Test Sign Up Flow

1. Click "Sign Up"
2. Fill form with:
   ```
   Name: John Doe
   Email: john@example.com
   Password: password123
   Confirm: password123
   Type: Patient
   ```
3. Click "Create Account"
4. Should redirect to Dashboard

---

## Test Login Flow

1. Click "Sign In"  
2. Enter:
   ```
   Email: john@example.com
   Password: password123
   ```
3. Click "Sign In"
4. Should redirect to Dashboard

---

## If Sign Up Fails

**Check 1**: Is backend running?
```bash
# Open browser: http://localhost:5000
# Should see: {"message":"HealthSync API is running"}
```

**Check 2**: Is MongoDB running?
```bash
# Backend console should show: ✅ MongoDB connected successfully
# If not, run: mongod (or net start MongoDB)
```

**Check 3**: Is bcryptjs installed?
```bash
cd backend
npm list bcryptjs
# Should show: bcryptjs@2.4.3
# If not: npm install bcryptjs
```

**Check 4**: Check browser console (F12)
- Look for network errors
- Look for specific error messages

---

## Ports

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000  
- **MongoDB**: localhost:27017

---

## Stop Everything

```bash
# Ctrl+C in each terminal to stop servers
```

---

## Reset Database

```bash
# Delete all users (start fresh)
# MongoDB shell:
mongosh
use healthsync
db.users.deleteMany({})
exit
```

---

## That's It!

If something goes wrong, check TROUBLESHOOTING.md for detailed solutions.
