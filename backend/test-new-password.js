require('dotenv').config();

async function testLogin() {
  const email = 'myportfolio@gmail.com';
  const password = '@Ab7340di';

  console.log('\n🔐 Testing New Password...\n');
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
      console.log('\n✅ NEW PASSWORD WORKS!');
      console.log('✅ You can now login with: @Ab7340di');
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
