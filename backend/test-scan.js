// Quick test script to verify scan saving works
// Run with: node test-scan.js

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';

async function testScanFlow() {
  try {
    console.log('🧪 Testing scan flow...\n');

    // 1. Sign up a test user
    console.log('1️⃣ Creating test user...');
    const signupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
      }),
    });

    if (!signupRes.ok) {
      const error = await signupRes.json();
      throw new Error(`Signup failed: ${error.error}`);
    }

    const user = await signupRes.json();
    console.log('✅ User created:', user.id);

    // 2. Save a scan
    console.log('\n2️⃣ Saving scan...');
    const scanRes = await fetch(`${API_URL}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        barcode: '123456789',
        name: 'Test Product',
        brand: 'Test Brand',
        co2e: 1.5,
        carbonRating: 'B',
        source: 'openfoodfacts',
      }),
    });

    if (!scanRes.ok) {
      const error = await scanRes.json();
      throw new Error(`Scan save failed: ${error.error}`);
    }

    const scanResult = await scanRes.json();
    console.log('✅ Scan saved! Points earned:', scanResult.pointsEarned);

    // 3. Get user profile
    console.log('\n3️⃣ Checking user profile...');
    const profileRes = await fetch(`${API_URL}/users/${user.id}`);
    const profile = await profileRes.json();
    console.log('✅ User profile:', {
      points: profile.points,
      scanCount: profile.scanCount,
    });

    // 4. Get scan history
    console.log('\n4️⃣ Checking scan history...');
    const historyRes = await fetch(`${API_URL}/scans/user/${user.id}`);
    const history = await historyRes.json();
    console.log('✅ Scan history:', history.length, 'scans');

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testScanFlow();
