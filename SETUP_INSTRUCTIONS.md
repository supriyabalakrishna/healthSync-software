# HealthSync Setup Instructions

## Prerequisites
1. **Node.js** - v14 or higher
2. **MongoDB** - Running locally or MongoDB Atlas connection string
3. **npm** - Comes with Node.js

## Backend Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

This will install all required packages including bcryptjs.

### Step 2: Verify Dependencies
Make sure you have:
- `bcryptjs` - For password hashing
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `cors` - Cross-origin resource sharing
- `mongoose` - for database management

### Step 3: Start MongoDB
**Option A: Local MongoDB**
```bash
# On Windows, if MongoDB is installed as a service:
net start MongoDB

# Or if MongoDB Community Edition:
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create account at https://www.mongodb.com/cloud/atlas
- Get connection string
- Set environment variable (create `.env` file in backend):
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthsync
```

### Step 4: Start Backend Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 HealthSync server running on port 5000
```

## Frontend Setup

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy).

## Troubleshooting

### Issue: "Sign up failed" error

**Solution 1: Check Backend is Running**
- Verify backend is running on port 5000
- Open http://localhost:5000 in browser - should return `{"message":"HealthSync API is running"}`

**Solution 2: Check MongoDB Connection**
- Check backend console for `✅ MongoDB connected` message
- If missing, MongoDB isn't running or connection string is wrong

**Solution 3: Install bcryptjs**
```bash
cd backend
npm install bcryptjs
```

**Solution 4: Check CORS**
- Frontend should be able to reach `http://localhost:5000`
- If getting CORS error in browser console, backend isn't running

### Issue: "Email already registered"
- Use a different email address or clear the database

### Issue: MongoDB Connection Error
```bash
# Start MongoDB on Windows:
net start MongoDB

# Or manually start mongod:
mongod
```

## Test Credentials (After Signup)

Try creating an account with:
- **Name**: John Doe
- **Email**: john@example.com
- **Password**: password123
- **Account Type**: Patient

## API Endpoints

All API calls go to `http://localhost:5000/api`

- **POST** `/users/signup` - Create new account
- **POST** `/users/login` - Login to account
- **GET** `/users/:id` - Get user profile
- **GET** `/vitals/:id` - Get user vitals
- **POST** `/vitals` - Record vitals

## Port Configuration

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173 (or similar)
- **MongoDB**: localhost:27017 (default)

Make sure both frontend and backend are running for the app to work!
