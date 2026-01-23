# CarbonQuest - Docker Setup Fixes Summary

## Issues Found & Fixed

### 1. ❌ Incorrect Docker Files from Old Project
**Problem**: The `app/` directory contained Dockerfile and package.json from an old Vite web project
- `app/Dockerfile` - Configured for Vite (port 5173)
- `app/package.json` - Dependencies for Vite React web app

**Fix**: ✅ Removed these files since this is a React Native/Expo project (not a web project)

### 2. ❌ Wrong docker-compose.yml Configuration
**Problem**: docker-compose.yml tried to build and run a Vite web app
- Included an `app` service for running Vite
- Used `VITE_API_URL` environment variable
- Wrong database name (`multidb` instead of `carbonquest`)

**Fix**: ✅ Updated docker-compose.yml to:
- Remove the `app` service (Expo apps run locally, not in Docker)
- Keep only `server` and `mongodb` services
- Fix environment variables
- Add proper networking
- Use correct database name

### 3. ❌ Missing Documentation
**Problem**: Only had default Expo README

**Fix**: ✅ Created comprehensive README.md with:
- Clear architecture explanation
- Setup instructions for Docker
- Environment configuration guide
- Project structure overview
- Development workflow
- Troubleshooting section

### 4. ❌ Missing Configuration Files
**Problem**: No .env.example or proper environment setup

**Fix**: ✅ Added:
- `server/.env` - Configured for Docker
- `server/.env.example` - Template for developers
- `server/.dockerignore` - Optimize Docker builds
- `start.sh` - Easy startup script

## Current Project Structure

```
✅ Correct Structure:
carbonquest/
├── app/src/              # React Native screens (Expo Router)
├── server/               # Backend API (runs in Docker)
│   ├── Dockerfile       # ✅ Correct Node.js setup
│   ├── .env             # ✅ Docker configuration
│   └── .env.example     # ✅ Template
├── docker-compose.yml    # ✅ Fixed - Only server + MongoDB
├── README.md            # ✅ Comprehensive guide
└── start.sh             # ✅ Easy startup script
```

## How to Use

### Quick Start (Automated)
```bash
./start.sh
```

### Manual Start
```bash
# 1. Start backend
docker-compose up -d

# 2. Install app dependencies
npm install

# 3. Start Expo
npm start
```

## What Runs Where

| Component | Where | Port | Command |
|-----------|-------|------|---------|
| Mobile App | Locally | Expo | `npm start` |
| Backend API | Docker | 4000 | `docker-compose up` |
| MongoDB | Docker | 27017 | (in docker-compose) |

## Key Points

1. **Mobile App ≠ Docker**: React Native/Expo apps typically run locally using Expo CLI, not in Docker containers
2. **Backend in Docker**: The Node.js API and MongoDB are properly containerized
3. **Web Support**: Expo can also run in browser with `npm run web`
4. **Network**: When testing on phone with Expo Go, use your computer's IP address instead of localhost

## Testing the Fix

### Backend Test
```bash
# Start services
docker-compose up -d

# Check if server is running
curl http://localhost:4000
# Should return: "Welcome to CarbonQuest!"

# Check MongoDB
docker-compose exec mongodb mongosh
```

### Mobile App Test
```bash
# Install dependencies
npm install

# Start Expo
npm start

# In browser: Press 'w'
# On phone: Scan QR code with Expo Go
```

## Environment Variables

### Backend (`server/.env`)
```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://mongodb:27017/carbonquest  # Docker service name
SECRET_TOKEN_KEY=superUltraMegaSecretKey123
```

### Mobile App
- No .env needed for local development
- API calls go to localhost:4000
- Product lookups use Open Food Facts APIs directly

## Next Steps

1. ✅ Backend is ready to run in Docker
2. ✅ Mobile app is ready to run with Expo
3. 🔄 Test the full flow:
   - Start Docker services
   - Run Expo app
   - Test barcode scanning
   - Verify API connectivity

## Production Considerations

For production deployment:
- [ ] Update SECRET_TOKEN_KEY to a strong random value
- [ ] Use MongoDB Atlas or another cloud database
- [ ] Update MONGO_URI in production environment
- [ ] Build and publish mobile app to app stores
- [ ] Deploy backend to cloud service (AWS, DigitalOcean, etc.)
- [ ] Set up CI/CD pipeline

## Troubleshooting

### "Can't connect to backend"
- Check if Docker is running: `docker-compose ps`
- Check server logs: `docker-compose logs -f server`
- For phone testing, use your local IP: `http://192.168.x.x:4000`

### "MongoDB connection error"
- Ensure MongoDB container is running
- Wait a few seconds for MongoDB to initialize
- Check logs: `docker-compose logs mongodb`

### "Expo won't start"
- Clear cache: `npm start -- --clear`
- Reinstall: `rm -rf node_modules && npm install`

## Summary

✅ **Removed**: Incorrect Vite project files  
✅ **Fixed**: docker-compose.yml configuration  
✅ **Added**: Comprehensive documentation  
✅ **Created**: Helper scripts and templates  
✅ **Ready**: Project is now properly configured for development!

The project is now properly set up with:
- Backend API running in Docker
- MongoDB running in Docker
- Mobile app running locally with Expo
- Clear documentation and easy startup

Everything should now be fully functional! 🎉
