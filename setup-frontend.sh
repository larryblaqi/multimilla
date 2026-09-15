#!/bin/bash

# MultiMilla Frontend Setup Script
echo "🚀 Setting up MultiMilla Frontend..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Archive directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Create environment file for frontend
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    cat > .env << 'EOF'
# Frontend Environment Variables
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_APP_NAME=MultiMilla
VITE_APP_ENV=development
EOF
    echo "✅ Frontend .env file created"
else
    echo "ℹ️  Frontend .env file already exists"
fi

# Build the application
echo "🔨 Building the application..."
npm run build

echo "✅ Frontend setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Access the application at http://localhost:5173"
echo "3. Make sure the backend is running on http://localhost:8000"
echo ""
echo "🔧 For production build:"
echo "1. Run: npm run build"
echo "2. Deploy the dist folder to your web server"












