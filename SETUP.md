# CarbonQuest - Setup Guide

## Authentication with MongoDB Atlas

Your app now uses real authentication with MongoDB Atlas! Users can sign up and sign in, and their data is stored in your MongoDB database.

## Running the App

### 1. Start the Backend Server

```bash
cd backend
node index.js
```

You should see:
```
✅ MongoDB connected
🚀 API running on http://localhost:3000
```

### 2. Configure API URL (Important!)

The frontend needs to know where to find your backend. Update the API URL based on how you're running the app:

**Edit `app/lib/api.ts` line 9:**

- **iOS Simulator**: `http://localhost:3000`
- **Android Emulator**: `http://10.0.2.2:3000`
- **Physical Device**: `http://YOUR_COMPUTER_IP:3000`

To find your computer's IP address:
- **Mac**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: `ipconfig` (look for IPv4 Address)
- **Linux**: `hostname -I`

### 3. Start the Expo App

```bash
# In the root directory
npm start
```

Then:
- Scan QR code with Expo Go app
- Or press `i` for iOS simulator
- Or press `a` for Android emulator

## Testing Authentication

### Sign Up Flow

1. Open the app
2. Tap "Sign Up"
3. Enter:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
4. Tap "Sign Up"

The user will be created in MongoDB and you'll be automatically signed in!

### Sign In Flow

1. Open the app
2. Enter the same credentials you used to sign up
3. Tap "Sign In"

The app will verify your credentials against MongoDB and sign you in if they match.

## Backend API Endpoints

### Auth Routes

**POST** `/auth/signup`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**POST** `/auth/signin`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Scan Routes (existing)

**GET** `/scans` - Get all scans
**POST** `/scans` - Create a scan
**GET** `/scans/:id` - Get scan by ID
**DELETE** `/scans/:id` - Delete scan

## How It Works

1. **Sign Up**:
   - Frontend sends name, email, password to `/auth/signup`
   - Backend hashes the password with bcrypt
   - User is saved to MongoDB
   - User data (without password) is returned and saved locally

2. **Sign In**:
   - Frontend sends email, password to `/auth/signin`
   - Backend finds user by email
   - Backend compares password with stored hash
   - User data (without password) is returned and saved locally

3. **Persistence**:
   - User data is saved in AsyncStorage on the device
   - On app restart, user stays signed in
   - Call `signOut()` to clear user data

## Troubleshooting

### "Network Error" or "Cannot connect to backend"

1. Make sure the backend is running (`node index.js` in backend folder)
2. Check the API URL in `app/lib/api.ts` matches your setup
3. If using a physical device, make sure your phone and computer are on the same WiFi network
4. Try accessing `http://localhost:3000` in your browser - you should see `{"ok":true,"service":"carbonquest-backend"}`

### "Email already registered"

This user already exists in your database. Either:
- Use the sign in screen instead
- Use a different email address
- Delete the user from MongoDB Atlas

### "Invalid email or password"

- Check that you're using the correct email and password
- Passwords are case-sensitive
- Make sure you signed up first before trying to sign in

### Backend won't start

Check that your MongoDB Atlas connection string is correct in `backend/.env`

## Database Structure

### Users Collection

```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$hashed...", // bcrypt hash
  createdAt: ISODate,
  updatedAt: ISODate
}
```

Passwords are securely hashed using bcrypt - they're never stored in plain text!

## Next Steps

- Add JWT tokens for secure API authentication
- Add password reset functionality
- Add email verification
- Add user profile updates
- Link scans to specific users
