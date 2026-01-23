#!/bin/bash

echo "🚀 Starting CarbonQuest Setup..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing mobile app dependencies..."
  npm install
  echo ""
fi

# Start Docker services
echo "🐳 Starting backend services (Server + MongoDB)..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
if docker-compose ps | grep -q "Up"; then
  echo "✅ Backend services are running!"
  echo ""
  echo "📍 Services Available:"
  echo "   - Backend API: http://localhost:4000"
  echo "   - MongoDB: localhost:27017"
  echo ""
else
  echo "❌ Failed to start services. Check logs with: docker-compose logs"
  exit 1
fi

# Offer to start Expo
echo "Would you like to start the Expo development server? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo ""
  echo "🎯 Starting Expo..."
  echo "   - Press 'w' for web browser"
  echo "   - Press 'a' for Android emulator"
  echo "   - Press 'i' for iOS simulator"
  echo "   - Scan QR code with Expo Go app on your phone"
  echo ""
  npm start
else
  echo ""
  echo "✅ Setup complete! Run 'npm start' when you're ready to launch the app."
  echo ""
  echo "📝 Useful commands:"
  echo "   npm start          - Start Expo development server"
  echo "   npm run web        - Run in web browser"
  echo "   docker-compose logs -f server - View backend logs"
  echo "   docker-compose down - Stop backend services"
fi
