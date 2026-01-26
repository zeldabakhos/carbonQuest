# Testing Backend Connection

## Quick Test

Run this command to test if a scan would work:

```bash
curl -X POST http://localhost:3000/scans \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "barcode": "123456789",
    "name": "Test Product",
    "brand": "Test Brand",
    "co2e": 1.5,
    "carbonRating": "B",
    "source": "test"
  }'
```

If this works, you should see a response with `pointsEarned: 10` and garden data.

## Check Backend Logs

```bash
tail -f backend/backend.log
```

This will show real-time logs. When you scan a product in the app, you should see:
- `📥 Received scan request:`
- `✅ Scan created:`
- `🌱 Growth points for rating`
- `✅ User updated`
- `🌳 Garden updated`

## Common Issues

### 1. Network Error
**Problem**: App can't reach backend

**Check**:
1. Backend running? `lsof -i :3000 | grep LISTEN`
2. Correct API URL for your device?
   - **iOS Simulator**: `http://localhost:3000` ✅
   - **Android Emulator**: `http://10.0.2.2:3000`
   - **Physical Device**: `http://YOUR_IP:3000`

### 2. User ID Not Found
**Problem**: `⚠️ No user ID - scan not saved` in console

**Solution**:
1. Sign out and sign back in
2. Check console for user ID after signin

### 3. No Console Logs
**Problem**: Not seeing any logs when scanning

**Solution**:
1. Restart the app
2. Clear Metro cache: `rm -rf node_modules/.cache .expo`
3. Restart with: `npm start -- --clear`

## What to Look For

### In App Console (Expo)
When you scan a product, you should see:
```
💾 Saving scan for user: [userId]
📊 Scan data: { barcode, name, carbonRating }
✅ Scan saved successfully!
🎯 Points earned: 10
🌳 Garden updated - Total plants: X
```

### In Backend Logs (backend/backend.log)
```
📥 Received scan request: { userId, barcode, ... }
🌱 Growth points for rating B : 15
✅ Scan created: [scanId]
✅ User updated - Points: X Scans: Y
🌳 Garden updated - Plants: X Level: Y
```

## Manual Test Steps

1. **Start backend with logs**:
   ```bash
   cd backend && node index.js
   ```
   (Keep this terminal open to see logs)

2. **In another terminal, start app**:
   ```bash
   npm start
   ```

3. **Sign in to the app**

4. **Scan a product** (or enter barcode manually)

5. **Watch both terminals** for logs

6. **Go to Garden tab** - should see new plant

7. **Go to Account tab** - points should increase

## Still Not Working?

Check which device you're using:
```bash
# If iOS Simulator
grep "localhost:3000" app/lib/api.ts

# If Android Emulator
grep "10.0.2.2:3000" app/lib/api.ts

# If Physical Device
# Find your IP: ifconfig | grep "inet "
# Update api.ts line 6: PHYSICAL_DEVICE_IP = 'YOUR_IP'
```
