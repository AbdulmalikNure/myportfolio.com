require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('./config/database');

async function changePassword() {
  try {
    const email = 'myportfolio@gmail.com';
    const newPassword = '@Ab7340di';
    
    console.log('\n🔄 Changing admin password...\n');
    console.log('Email:', email);
    console.log('New Password:', newPassword);
    console.log('Password length:', newPassword.length, 'characters');
    console.log('');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log('✅ Password hashed');
    
    // Update the password in database
    await query(
      'UPDATE users SET password = $1, refresh_token = NULL WHERE email = $2',
      [hashedPassword, email]
    );
    
    console.log('✅ Password updated in database');
    console.log('✅ Refresh tokens cleared');
    console.log('\n📝 New Login Credentials:');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);
    console.log('\n⚠️  You will need to login again with the new password.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

changePassword();
