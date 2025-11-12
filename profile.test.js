async function runTests() {
  const fetch = (await import('node-fetch')).default;
  const BASE_URL = 'http://localhost:3000';

  const email = `testuser_${Date.now()}@gmail.com`;
  const password = 'password123';
  let authToken = '';

  console.log(`Testing with user: ${email}`);

  // Test Registration
  try {
    console.log('--- Testing Registration ---');
    const registerRes = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Test',
        last_name: 'User',
        email,
        password,
        gdpr_consent: true
      }),
    });
    if (registerRes.status !== 201) throw new Error('Registration failed!');
    console.log('✅ Registration successful!');
  } catch (error) {
    console.error('❌ Registration test failed:', error);
    return;
  }

  // Test Login
  try {
    console.log('\n--- Testing Login ---');
    const loginRes = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200) throw new Error('Login failed!');
    authToken = loginData.session.access_token;
    console.log('✅ Login successful!');
  } catch (error) {
    console.error('❌ Login test failed:', error);
    return;
  }

  // Test Profile API
  try {
    console.log('\n--- Testing Profile API ---');
    const profileRes = await fetch(`${BASE_URL}/api/customer/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const profileData = await profileRes.json();
    if (profileRes.status !== 200) throw new Error('Failed to fetch profile!');
    console.log('✅ Profile fetched successfully:', profileData);
  } catch (error) {
    console.error('❌ Profile API test failed:', error);
  }
}

runTests();
