require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');

async function updateAdminCredentials() {
  try {
    console.log('Updating admin credentials...\n');

    const newEmail = '@Abdii9026';
    const newPassword = '@Ab7340di';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update admin credentials
    const result = await pool.query(`
      UPDATE users 
      SET email = $1, 
          password = $2,
          updated_at = NOW()
      WHERE role IN ('admin', 'super_admin')
      RETURNING name, email, role
    `, [newEmail, hashedPassword]);

    if (result.rowCount > 0) {
      console.log('✅ Admin credentials updated successfully!\n');
      console.log('📧 New Login Credentials:');
      console.log('   Email:    ' + newEmail);
      console.log('   Password: ' + newPassword);
      console.log('\n👤 Admin User:', result.rows[0].name);
      console.log('🔐 Role:', result.rows[0].role);
    } else {
      console.log('❌ No admin user found to update');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

updateAdminCredentials();
