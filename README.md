# CarbonQuest - Barcode Scanner App

A React Native/Expo mobile application that scans product barcodes and displays comprehensive product information including carbon footprint estimates.

## Architecture

This project consists of two main components:
- **Mobile App**: React Native/Expo app (runs locally or on web)
- **Backend Server**: Node.js/Express API with MongoDB (runs in Docker)

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Expo CLI: `npm install -g expo-cli`
- For mobile testing: Expo Go app on your phone

## Quick Start

### 1. Start the Backend Services (Docker)

The backend server and MongoDB run in Docker containers:

```bash
# Start server and MongoDB
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f server
```

This will start:
- **Server**: http://localhost:4000
- **MongoDB**: localhost:27017

### 2. Run the Mobile App

The Expo app runs locally (not in Docker):

```bash
# Install dependencies
npm install

# Start Expo
npm start

# Or run directly on specific platform:
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web browser
```

## Environment Configuration

### Backend (.env)
Create or update `/server/.env`:

```env
NODE_ENV=development
MONGO_URI=mongodb://mongodb:27017/carbonquest
SECRET_TOKEN_KEY=your-secret-key-here
PORT=4000
```

### Mobile App
The app will connect to your backend at:
- **Local development**: http://localhost:4000
- **Expo Go on phone**: http://YOUR_LOCAL_IP:4000

Update API endpoints in your app code if needed (typically in `app/src/utils/productApi.ts`).

## Project Structure

```
carbonquest/
├── app/                    # Expo Router app directory
│   └── src/               # App screens and components
│       ├── (tabs)/        # Tab navigation screens
│       ├── utils/         # Utilities (API, carbon calculations)
│       ├── scan.tsx       # Barcode scanning screen
│       ├── product.tsx    # Product details screen
│       └── _layout.tsx    # Root layout
├── assets/                # Images and static assets
├── components/            # Reusable React components
├── constants/             # App constants and theme
├── hooks/                 # Custom React hooks
├── server/               # Backend API (runs in Docker)
│   ├── controllers/      # Request handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Database connection
│   ├── Dockerfile       # Server Docker configuration
│   └── index.js         # Server entry point
├── docker-compose.yml    # Docker orchestration
├── package.json         # Mobile app dependencies
└── app.json            # Expo configuration
```

## API Endpoints

The backend provides these endpoints:

- `GET /` - Health check
- `POST /api/users/signup` - User registration
- `POST /api/users/signin` - User login
- Additional routes defined in `/server/routes/`

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# View logs
docker-compose logs -f server

# Access server container
docker-compose exec server sh

# Access MongoDB
docker-compose exec mongodb mongosh

# Remove all data (including database)
docker-compose down -v
```

## Development Workflow

1. **Backend Development**:
   - Edit files in `/server`
   - Server auto-restarts with nodemon
   - Check logs: `docker-compose logs -f server`

2. **Mobile App Development**:
   - Edit files in `/app`, `/components`, etc.
   - Expo hot-reloads automatically
   - Scan QR code with Expo Go app to test on phone

3. **Database**:
   - Data persists in Docker volume `mongodb_data`
   - Use MongoDB Compass: `mongodb://localhost:27017`

## Features

- 📱 Barcode scanning with camera
- 🔍 Product lookup via Open Food Facts & Open Beauty Facts APIs
- 🌱 Carbon footprint estimation
- 📊 Detailed product information
- 💾 User authentication and profiles

## Troubleshooting

### Can't connect to backend from phone
- Ensure your phone and computer are on the same network
- Use your computer's local IP instead of `localhost`
- Check if firewall is blocking port 4000

### MongoDB connection errors
```bash
# Check if MongoDB container is running
docker-compose ps

# Restart MongoDB
docker-compose restart mongodb
```

### Expo app won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start -- --clear
```

### Docker build issues
```bash
# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

For production:
1. Update environment variables
2. Use production MongoDB URI (not the Docker one)
3. Build the mobile app: `expo build:android` or `expo build:ios`
4. Deploy backend to a cloud service (AWS, DigitalOcean, etc.)

## Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Container**: Docker, Docker Compose
- **APIs**: Open Food Facts, Open Beauty Facts, Agribalyse

## License

Private project
