# Troubleshooting Checklist

## If Sign Up Fails with "Sign up failed. Please try again."

Follow these steps in order:

### ✅ Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```
**Expected output**: Should install bcryptjs and all other packages without errors

If you see errors:
- Delete `package-lock.json` and `node_modules` folder
- Run `npm install` again

---

### ✅ Step 2: Verify bcryptjs is Installed
```bash
npm list bcryptjs
```
**Expected output**: `bcryptjs@2.4.3` (or similar version)

If missing:
```bash
npm install bcryptjs@2.4.3
```

---

### ✅ Step 3: Start MongoDB

**Option A: Windows with MongoDB Service**
```powershell
# In PowerShell as Administrator:
net start MongoDB
```

**Option B: Local MongoDB Installation**
```bash
mongod
```

**Expected output**: 
```
mongod | 2024-04-23T... I STORAGE  [initandlisten] waiting for connections on port 27017
```

If MongoDB won't start:
- Download from https://www.mongodb.com/try/download/community
- Install with default settings
- Try again

---

### ✅ Step 4: Start Backend Server
```bash
cd backend
npm start
```

**Expected output**:
```
📍 Attempting to connect to MongoDB at: mongodb://127.0.0.1:27017/healthsync
✅ MongoDB connected successfully
🚀 HealthSync server running on port 5000
   API endpoint: http://localhost:5000
```

If you see errors, check:
- Is MongoDB running? (check Step 3)
- Is port 5000 already in use? (check with `netstat -ano` on Windows)

---

### ✅ Step 5: Verify Backend is Working
Open in browser: `http://localhost:5000`

**Expected**: Should show `{"message":"HealthSync API is running"}`

If not working:
- Check console for errors (Step 4)
- Try a different port: `PORT=3000 npm start`

---

### ✅ Step 6: Start Frontend
In a **NEW** terminal window:
```bash
cd frontend
npm install  # First time only
npm run dev
```

**Expected output**:
```
VITE v... ⚡ ready in ... ms

> Local:     http://localhost:5173/
```

---

### ✅ Step 7: Test Sign Up

1. Go to `http://localhost:5173`
2. Click "Sign Up"
3. Fill in the form:
   - **Name**: John Doe
   - **Email**: john@example.com
   - **Password**: password123
   - **Confirm Password**: password123
   - **Account Type**: Patient
4. Click "Create Account"

---

## Common Errors & Solutions

### ❌ "Network error. Make sure backend is running on http://localhost:5000"

**Solution:**
- Backend not running - go to Step 4
- Different port - check backend console output
- Firewall blocking - allow port 5000 in Windows Firewall

### ❌ "Email already registered"

**Solution:**
- Use a different email
- Or open MongoDB and delete the user from `healthsync.users` collection
- Or restart from fresh database

### ❌ "MongoDB connection error"

**Solution:**
- MongoDB isn't running (Step 3)
- Wrong connection string in `.env`
- MongoDB port 27017 blocked by firewall

### ❌ "bcryptjs is not defined" or similar require error

**Solution:**
```bash
cd backend
npm install bcryptjs
npm start
```

### ❌ "Port 5000 already in use"

**Solution**:
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the number shown)
taskkill /PID <PID> /F

# Or use a different port
PORT=5001 npm start
```

---

## Quick Restart Command (After Everything Works)

**Terminal 1 - Backend** (keep running):
```bash
cd backend && npm start
```

**Terminal 2 - Frontend** (keep running):
```bash
cd frontend && npm run dev
```

Then open: `http://localhost:5173`

---

## Database Reset (Start Fresh)

If you want to clear all users and start over:

**Option A: Delete MongoDB data**
- Stop MongoDB
- Delete data folder: `C:\Program Files\MongoDB\Server\...\data\`
- Restart MongoDB

**Option B: Use MongoDB CLI**
```bash
# Connect to MongoDB
mongosh

# In the shell:
use healthsync
db.users.deleteMany({})
exit
```

---

## Still Having Issues?

Check the browser console (F12) and backend terminal for error messages. They usually tell you exactly what's wrong!
