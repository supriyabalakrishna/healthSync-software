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

# Root Setup
echo ""
echo "📦 Installing root dependencies..."
cd ..
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open Terminal and run: npm run dev"
echo "2. Optional - in another terminal: net start MongoDB"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "💡 For sign up test, use:"
echo "   Email: test@example.com"
echo "   Password: password123"
