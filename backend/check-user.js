require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('./config/database');

async function checkUser() {
  try {
    const email = 'myportfolio@gmail.com';
    const password = '@Ab7340diand';
    
    console.log('\n🔍 Checking user in database...\n');
    console.log('Looking for email:', email);
    console.log('Testing password:', password);
    console.log('');
    
    const result = await query(
      'SELECT id, name, email, password, role, is_active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found!');
      process.exit(1);
    }
    
    const user = result.rows[0];
    console.log('✅ User found:');
    console.log('  ID:', user.id);
    console.log('  Name:', user.name);
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Active:', user.is_active);
    console.log('  Password Hash:', user.password.substring(0, 20) + '...');
    console.log('');
    
    // Test password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password Match:', isMatch ? '✅ YES' : '❌ NO');
    
    if (!isMatch) {
      console.log('\n❌ Password does not match!');
      console.log('This means the password in the database is different from what you\'re trying.');
      console.log('\nLet me test a few common variations:');
      
      const variations = [
        '@Ab7340diand',
        'Ab7340diand',
        '@ab7340diand',
        'Admin@12345'
      ];
      
      for (const testPass of variations) {
        const match = await bcrypt.compare(testPass, user.password);
        console.log(`  "${testPass}": ${match ? '✅ MATCH!' : '❌'}`);
      }
    } else {
      console.log('\n✅ Password is correct! Login should work.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUser();
