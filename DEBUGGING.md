# Debugging Guide - Account Points & Scan History

## Issue: Account page not showing updated points/scans

### Quick Diagnosis

Run these checks in order:

#### 1. Is the backend running?

```bash
cd backend
node index.js
```

You should see:
```
✅ MongoDB connected
🚀 API running on http://localhost:3000
```

#### 2. Test the backend directly

```bash
cd backend
node test-scan.js
```

This will test the complete flow. You should see:
```
✅ User created: [id]
✅ Scan saved! Points earned: 10
✅ User profile: { points: 10, scanCount: 1 }
✅ All tests passed!
```

If this fails, the backend has an issue.

#### 3. Check API URL configuration

In `app/lib/api.ts` line 8, verify the API_URL matches your setup:

- **iOS Simulator**: `http://localhost:3000`
- **Android Emulator**: `http://10.0.2.2:3000`
- **Physical Device**: `http://YOUR_IP:3000` (e.g., `http://192.168.1.100:3000`)

To find your IP:
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

#### 4. Check console logs in the app

When you scan a product, check the console for:

**Product page:**
```
💾 Saving scan for user: [userId]
✅ Scan saved! Points earned: 10
```

**If you see an error:**
```
❌ Failed to save scan: [error details]
```

Common errors:
- `Network Error` → Backend not running or wrong API URL
- `Missing required fields` → Data format issue
- `User not found` → userId mismatch

**Account page:**
```
📊 Loading account data for user: [userId]
✅ Account data loaded - Points: X Scans: Y
```

#### 5. Check backend logs

In the backend terminal, you should see:

```
📥 Received scan request: { userId: '...', barcode: '...', ... }
💾 Creating scan for user: [userId]
✅ Scan created: [scanId]
✅ User updated - Points: 10 Scans: 1
```

### Common Issues & Solutions

#### Network Error

**Problem:** App can't reach backend

**Solution:**
1. Check backend is running (`cd backend && node index.js`)
2. Verify API_URL in `app/lib/api.ts` matches your setup
3. For physical device, ensure phone and computer are on same WiFi

#### Points not updating

**Problem:** Scan saves but points don't increase

**Solution:**
1. Check backend logs for "User updated" message
2. Run test script: `cd backend && node test-scan.js`
3. Pull down to refresh on Account tab
4. Check MongoDB Atlas to verify data is actually being saved

#### Scan history empty

**Problem:** Points update but history doesn't show scans

**Solution:**
1. Check if scans are in database (MongoDB Atlas dashboard)
2. Verify `GET /scans/user/:userId` endpoint works
3. Check console for "Account data loaded" message
4. Try manual refresh (pull down on Account tab)

#### User ID not found

**Problem:** `⚠️ No user ID - scan not saved` in console

**Solution:**
1. Sign out and sign back in
2. Check that signin returns user object with `id` field
3. Verify user data is saved in AsyncStorage

### Manual Testing Steps

1. **Start backend:**
   ```bash
   cd backend
   node index.js
   ```

2. **Start app:**
   ```bash
   npm start
   ```

3. **Sign in** (or create account)

4. **Scan a product** or manually enter barcode

5. **Check console logs** - should see:
   - `💾 Saving scan for user: [id]`
   - `✅ Scan saved! Points earned: 10`

6. **Go to Account tab** - should see:
   - `📊 Loading account data for user: [id]`
   - `✅ Account data loaded - Points: X Scans: Y`

7. **Verify data in UI:**
   - Points should increase by 10
   - Scan count should increase by 1
   - Product should appear in history

### Still not working?

Check MongoDB Atlas directly:
1. Go to https://cloud.mongodb.com
2. Navigate to your cluster → Collections
3. Check `users` collection - verify `points` and `scanCount` fields
4. Check `scans` collection - verify scans are being created

If data is in MongoDB but not showing in app:
- Issue is with frontend API calls
- Check network tab or logs for failed requests
- Verify userId matches between signin and scan requests
