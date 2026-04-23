#!/bin/bash
# HealthSync - Complete Setup Script
# Run this to set up everything automatically

echo "🚀 HealthSync Setup Starting..."

# Backend Setup
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Check if bcryptjs is installed
if ! npm list bcryptjs > /dev/null 2>&1; then
  echo "📦 Installing bcryptjs..."
  npm install bcryptjs@2.4.3
fi

# Frontend Setup
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open Terminal 1 and run: cd backend && npm start"
echo "2. Open Terminal 2 and run: cd frontend && npm run dev"
echo "3. Open Terminal 3 (Windows) and run: net start MongoDB"
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "💡 For sign up test, use:"
echo "   Email: test@example.com"
echo "   Password: password123"
