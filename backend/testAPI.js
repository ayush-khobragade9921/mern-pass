

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('Testing cookie-based authentication...\n');

    console.log('1. Registering user...');
    const registerRes = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User 2',
        email: 'test2@example.com',
        password: 'password123',
        role: 'admin'
      })
    });
    const registerData = await registerRes.json();
    console.log('Register response:', registerData);

    console.log('\n2. Logging in (checking for cookie)...');
    const loginRes = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test2@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginRes.json();
    console.log('Login response:', loginData);

   
    const setCookieHeader = loginRes.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('Cookie set successfully!');
      console.log('Cookie header:', setCookieHeader.substring(0, 50) + '...');
    } else {
      console.log('No cookie set');
    }

    console.log('\nCookie authentication setup complete!');
    console.log('For full testing, use a browser or Postman with cookie support.');

  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testAPI();