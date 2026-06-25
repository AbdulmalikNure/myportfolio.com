require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');

/**
 * Update admin credentials
 * Usage: node update_admin.js
 */
async function updateAdmin() {
  const client = await pool.connect();
  try {
    // New credentials
    const newEmail = 'myportfolio@gmail.com';
    const newPassword = '@Ab7340diand';
    
    console.log('\n🔄 Updating admin credentials...');
    console.log(`   New Email: ${newEmail}`);
    console.log(`   New Password: ${newPassword}\n`);
    
    // Check if admin exists
    const checkResult = await client.query(
      "SELECT id, email, name FROM users WHERE role IN ('admin', 'super_admin') ORDER BY created_at ASC LIMIT 1"
    );
    
    if (checkResult.rows.length === 0) {
      console.log('❌ No admin user found in the database.');
      console.log('   Creating new admin user...\n');
      
      // Create new admin if none exists
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await client.query(
        `INSERT INTO users (name, email, password, role, is_active)
         VALUES ($1, $2, $3, 'super_admin', true)`,
        ['Admin User', newEmail.toLowerCase().trim(), hashedPassword]
      );
      
      console.log('✅ Admin user created successfully!');
    } else {
      const adminId = checkResult.rows[0].id;
      const oldEmail = checkResult.rows[0].email;
      
      console.log(`   Found admin: ${checkResult.rows[0].name} (${oldEmail})`);
      console.log('   Updating credentials...\n');
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update admin credentials
      await client.query(
        `UPDATE users 
         SET email = $1, 
             password = $2,
             refresh_token = NULL,
             is_active = true,
             updated_at = NOW()
         WHERE id = $3`,
        [newEmail.toLowerCase().trim(), hashedPassword, adminId]
      );
      
      console.log('✅ Admin credentials updated successfully!');
      console.log(`   Old Email: ${oldEmail}`);
      console.log(`   New Email: ${newEmail}`);
    }
    
    console.log(`\n📧 You can now login with:`);
    console.log(`   Email: ${newEmail}`);
    console.log(`   Password: ${newPassword}`);
    
    // Verify the update
    console.log('\n🔍 Verifying update...');
    const verifyResult = await client.query(
      'SELECT email, is_active, role FROM users WHERE email = $1',
      [newEmail.toLowerCase().trim()]
    );
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ Verification successful:');
      console.log(`   Email: ${verifyResult.rows[0].email}`);
      console.log(`   Active: ${verifyResult.rows[0].is_active}`);
      console.log(`   Role: ${verifyResult.rows[0].role}\n`);
    }
    
  } catch (err) {
    console.error('❌ Update failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

updateAdmin();
