async function runTests() {
  const fetch = (await import('node-fetch')).default;
  const BASE_URL = 'http://localhost:3000'; // Updated to use the current server port

  const email = `testuser_${Date.now()}@gmail.com`;
  const password = 'password123';

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

    const registerData = await registerRes.json();
    console.log('Registration Response Status:', registerRes.status);
    console.log('Registration Response Body:', registerData);

    if (registerRes.status !== 201) {
      throw new Error('Registration failed!');
    }
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
    console.log('Login Response Status:', loginRes.status);
    console.log('Login Response Body:', loginData);

    if (loginRes.status !== 200) {
      throw new Error('Login failed!');
    }
    console.log('✅ Login successful!');
  } catch (error) {
    console.error('❌ Login test failed:', error);
  }
}

runTests();

