require('dotenv').config();

async function testLogin() {
  const email = process.env.ADMIN_EMAIL || 'myportfolio@gmail.com';
  const password = process.env.ADMIN_PASSWORD || '@Ab7340diand';

  console.log('\n🔐 Testing Login...\n');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('');

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Login successful!');
      console.log('Access Token:', data.data?.accessToken ? '(present)' : '(missing)');
      console.log('User:', data.data?.user);
    } else {
      console.log('\n❌ Login failed!');
      console.log('Error:', data.message);
    }
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error:', error.message);
  }
}

testLogin();
