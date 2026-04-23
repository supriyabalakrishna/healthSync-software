# Authentication Flow Diagram

## Sign Up Flow

```
User Opens App (http://localhost:5173)
    ↓
App checks localStorage for user
    ↓
No user found
    ↓
Redirects to Login page
    ↓
User clicks "Sign Up"
    ↓
SignUp Page loads
    ↓
User enters:
  - Name: John Doe
  - Email: john@example.com
  - Password: password123
  - Confirm Password: password123
  - Account Type: Patient
    ↓
User clicks "Create Account"
    ↓
Frontend validates:
  - All fields filled? ✓
  - Password >= 6 chars? ✓
  - Passwords match? ✓
  - Valid email format? ✓
    ↓
POST to http://localhost:5000/api/users/signup
    ↓
Backend Server receives request
    ↓
Backend validates:
  - Name, email, password present? ✓
  - Email format valid? ✓
  - Password length >= 6? ✓
  - Email not already registered? ✓
    ↓
Backend hashes password with bcryptjs
  Original: "password123"
  Hashed: "$2a$10$...long hash..."
    ↓
Backend saves to MongoDB:
{
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...hashed...",
  role: "patient",
  createdAt: "2024-04-23T..."
}
    ↓
Backend returns:
{
  message: "User created successfully",
  user: {
    _id: "507f1f77bcf86cd799439011",
    name: "John Doe",
    email: "john@example.com",
    role: "patient"
  }
}
    ↓
Frontend receives response
    ↓
Frontend stores in localStorage:
  - key: "user" → value: user object
  - key: "userId" → value: user _id
    ↓
Frontend navigates to dashboard "/"
    ↓
App checks localStorage → user found
    ↓
User data passed to App component
    ↓
Dashboard loads with user info
    ↓
Sidebar shows: "John Doe (Patient)"
    ↓
✅ Sign Up Complete!
```

---

## Login Flow

```
User Opens App (http://localhost:5173)
    ↓
App checks localStorage for user
    ↓
No user found
    ↓
Redirects to Login page
    ↓
User enters:
  - Email: john@example.com
  - Password: password123
    ↓
User clicks "Sign In"
    ↓
Frontend validates:
  - Email filled? ✓
  - Password filled? ✓
    ↓
POST to http://localhost:5000/api/users/login
{
  email: "john@example.com",
  password: "password123"
}
    ↓
Backend Server receives request
    ↓
Backend queries MongoDB for user
    ↓
User found in database
{
  _id: "507f1f77bcf86cd799439011",
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...hashed...",
  role: "patient"
}
    ↓
Backend compares passwords:
  - Input password: "password123"
  - Stored hash: "$2a$10$..."
  - bcryptjs compares them → Match! ✓
    ↓
Backend returns:
{
  message: "Login successful",
  user: {
    _id: "507f1f77bcf86cd799439011",
    name: "John Doe",
    email: "john@example.com",
    role: "patient"
  }
}
    ↓
Frontend receives response
    ↓
Frontend stores in localStorage:
  - key: "user" → user object
  - key: "userId" → user _id
    ↓
Frontend navigates to dashboard "/"
    ↓
App loads with user data
    ↓
✅ Login Complete!
```

---

## Protected Route Flow

```
User tries to access dashboard "/"
    ↓
App component checks from App.jsx:
  {
    if (isAuthenticated && userId) {
      → Load Dashboard ✓
    } else {
      → Redirect to /login ✗
    }
  }
    ↓
Authenticated (localStorage has user)
    ↓
ProtectedRoute component wraps dashboard
    ↓
Dashboard loads
    ↓
Sidebar receives:
  - userName: "John Doe"
  - userRole: "patient"
  - onLogout: logout function
    ↓
User can see:
  - All navigation items
  - Profile in sidebar
  - Logout button
    ↓
✅ Protected Access Granted!
```

---

## Logout Flow

```
User clicks "🚪 Logout" button in Sidebar
    ↓
onClick handler triggers
    ↓
Backend:
  - No backend call needed (logout is client-side)
    ↓
Frontend clears localStorage:
  - Remove "user"
  - Remove "userId"
    ↓
Frontend updates state:
  - setIsAuthenticated(false)
  - setUserId(null)
    ↓
Frontend navigates to "/login"
    ↓
App re-renders:
  - Checks localStorage → no user found
  - Routes to Login page
    ↓
Login page displays empty form
    ↓
User can:
  - Sign in with existing account
  - Click "Sign Up" for new account
    ↓
✅ Logout Complete!
```

---

## Page Refresh - Session Persistence

```
User is logged in and viewing dashboard
    ↓
User presses F5 (refresh page)
    ↓
App component mounts
    ↓
useEffect hook runs:
  {
    const user = localStorage.getItem('user')
    const storedUserId = localStorage.getItem('userId')
    
    if (user && storedUserId) {
      setIsAuthenticated(true)
      setUserId(storedUserId)
      setUserName(userData.name)
      setUserRole(userData.role)
    }
  }
    ↓
localStorage data found
    ↓
User data restored to state
    ↓
App routes to dashboard "/"
    ↓
Dashboard loads with user data
    ↓
✅ Session Restored!
```

---

## Error Handling Flows

### Invalid Email Format
```
User enters: "invalidemail"
    ↓
Frontend regex validates: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    ↓
Regex test fails
    ↓
Error shown: "Invalid email format"
    ↓
Request NOT sent to backend
```

### Email Already Registered
```
Database contains:
{ email: "john@example.com", ... }
    ↓
User signs up with same email
    ↓
Backend query: User.findOne({ email })
    ↓
User found in database
    ↓
Backend returns error:
{ error: "Email already registered" }
    ↓
Frontend shows error message
    ↓
User must use different email
```

### Password Mismatch
```
User enters:
  - Password: "password123"
  - Confirm: "password124"  (typo)
    ↓
Frontend checks:
  if (form.password !== form.confirmPassword)
    ↓
Check fails
    ↓
Error shown: "Passwords do not match"
    ↓
Request NOT sent to backend
```

### Invalid Credentials on Login
```
User enters:
  - Email: john@example.com
  - Password: wrongpassword
    ↓
Backend queries: User.findOne({ email })
    ↓
User found
    ↓
Backend compares passwords:
  bcrypt.compare("wrongpassword", "$2a$10$...")
    ↓
Comparison fails
    ↓
Backend returns error:
{ error: "Invalid email or password" }
    ↓
Frontend shows error message
    ↓
User can retry with correct password
```

### Network Error (Backend Not Running)
```
User tries to sign up
    ↓
Frontend sends request to:
POST http://localhost:5000/api/users/signup
    ↓
Connection refused (backend not running)
    ↓
axios catches error:
err.code === 'ERR_NETWORK' OR
err.code === 'ECONNREFUSED'
    ↓
Frontend shows:
"Network error. Make sure backend is 
running on http://localhost:5000"
    ↓
User must start backend and retry
```

---

## Data Flow Summary

### Request Flow (Frontend → Backend)
```
SignUp Component
    ↓
Validates inputs locally
    ↓
axios.post() to /api/users/signup
    ↓
Express server receives POST
    ↓
Middleware: body parsed as JSON
    ↓
Route handler /users/signup
    ↓
Validates request data
    ↓
Queries MongoDB
    ↓
Hashes password if new user
    ↓
Saves to MongoDB
    ↓
Returns success response
```

### Response Flow (Backend → Frontend)
```
Backend Route Handler
    ↓
res.json({ message, user })
    ↓
Express serializes to JSON
    ↓
Axios receives response
    ↓
Response interceptor logs it
    ↓
Component gets response data
    ↓
localStorage.setItem(data)
    ↓
navigate() to next page
    ↓
Page renders with user data
```

---

## Security Measures

```
User Password "password123"
    ↓
bcryptjs.genSalt(10) → Creates random salt
    ↓
bcryptjs.hash(password, salt)
    ↓
Generates unique hash every time:
  Example: "$2a$10$XY1Z2a3b4c5d6e7f8g9h0ijklmnopqrst"
    ↓
Stored in MongoDB as hash
    ↓
Original password never stored ✗
    ↓
On login, password compared using:
  bcryptjs.compare(input, hash)
    ↓
Returns true/false without exposing hash
    ↓
✅ Secure Password Storage
```

---

This diagram shows the complete authentication flow of the HealthSync application!
