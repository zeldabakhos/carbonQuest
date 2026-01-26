# CarbonQuest - Barcode Scanner App

A React Native/Expo mobile application that scans product barcodes and displays comprehensive product information including carbon footprint estimates.

## Features

- 📱 Barcode scanning with camera
- 🔍 Product lookup via Open Food Facts & Open Beauty Facts APIs
- 🌱 Carbon footprint estimation
- 📊 Detailed product information
- 👤 User authentication with MongoDB Atlas
- 💾 Secure user data storage

## Prerequisites

- Node.js (v18 or higher)
- Expo CLI: `npm install -g expo-cli`
- For mobile testing: Expo Go app on your phone

## Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB connected
🚀 API running on http://localhost:3000
```

### 2. Configure API URL

**Important:** Update the API URL in `app/lib/api.ts` based on how you're testing:

- **iOS Simulator**: `http://localhost:3000`
- **Android Emulator**: `http://10.0.2.2:3000`
- **Physical Device**: `http://YOUR_COMPUTER_IP:3000`

Find your computer's IP:
- **Mac/Linux**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: `ipconfig` (IPv4 Address)

### 3. Start the Expo App

```bash
# In the root directory
npm install
npm start
```

Then:
- Scan QR code with Expo Go app
- Or press `i` for iOS simulator
- Or press `a` for Android emulator

## Project Structure

```
carbonquest/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   ├── context/           # React contexts (Auth, etc.)
│   ├── lib/               # API client
│   ├── utils/             # Utilities (carbon calculations)
│   ├── scan.tsx           # Barcode scanning screen
│   ├── product.tsx        # Product details screen
│   ├── signin.tsx         # Sign in screen
│   ├── signup.tsx         # Sign up screen
│   └── _layout.tsx        # Root layout
├── backend/               # Node.js/Express backend
│   ├── .env              # Environment variables (MongoDB URI)
│   ├── index.js          # Server entry point
│   └── package.json      # Backend dependencies
├── assets/                # Images and static assets
├── components/            # Reusable React components
├── constants/             # App constants and theme
├── hooks/                 # Custom React hooks
├── package.json           # App dependencies
└── app.json              # Expo configuration
```

## Authentication

The app uses real authentication with MongoDB Atlas:

1. **Sign Up**: Creates a new user in MongoDB with hashed password
2. **Sign In**: Validates credentials against MongoDB
3. **Persistence**: User data saved locally in AsyncStorage

See [SETUP.md](SETUP.md) for detailed authentication setup.

## Backend API

### Auth Endpoints

- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Sign in existing user

### Scan Endpoints

- `GET /scans` - Get all scans
- `POST /scans` - Create a scan
- `GET /scans/:id` - Get scan by ID
- `DELETE /scans/:id` - Delete scan

## How It Works

### Barcode Scanning
1. Camera scans barcode
2. Looks up product in Open Food Facts / Open Beauty Facts
3. Calculates carbon footprint estimate
4. Displays results with carbon rating (A-F)

### Carbon Footprint Calculation
Estimates based on:
- Product category and type
- Ingredients and manufacturing
- Packaging materials
- Transportation estimates

## Development

### Running with Hot Reload

**Backend:**
```bash
cd backend
npm run dev  # Auto-restarts on file changes
```

**Frontend:**
```bash
npm start  # Expo hot reload enabled
```

## Troubleshooting

### Cannot connect to backend

1. Make sure backend is running (`cd backend && npm start`)
2. Check API URL in `app/lib/api.ts`
3. If using physical device, ensure same WiFi network
4. Test backend: open `http://localhost:3000` in browser

### "Email already registered"

User exists in database. Use sign in or different email.

### "Invalid email or password"

- Verify credentials are correct
- Passwords are case-sensitive
- Make sure you signed up first

### Camera not working

- Grant camera permissions when prompted
- iOS Simulator camera won't work (use physical device)

### Expo app won't start

```bash
rm -rf node_modules package-lock.json
npm install
npm start -- --clear
```

## Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Authentication**: bcrypt for password hashing
- **Navigation**: Expo Router
- **Camera**: expo-camera
- **Barcode Scanning**: @zxing/browser
- **APIs**: Open Food Facts, Open Beauty Facts, Agribalyse

## License

Private project
