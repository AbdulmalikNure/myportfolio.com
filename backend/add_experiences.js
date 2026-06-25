require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { pool } = require('./config/database');

async function addExperiences() {
  try {
    console.log('Adding experience entries...\n');

    // Add Jimma University Internship
    await pool.query(`
      INSERT INTO experience (company, position, start_date, end_date, is_current, description, display_order, is_visible)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING
    `, [
      'Jimma University',
      'Network and System Administration',
      '2017-10-25',
      '2017-12-30',
      false,
      'I finished my internship at Jimma University in 2017 E.C, where I gained hands-on experience in network configuration, system administration, and IT infrastructure management.',
      1,
      true
    ]);
    console.log('✓ Added: Jimma University Internship (2017 E.C)');

    // Add Cursor Hackathon East Ethiopia 2026
    await pool.query(`
      INSERT INTO experience (company, position, start_date, end_date, is_current, description, display_order, is_visible)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING
    `, [
      'Cursor Hackathon',
      'Participant - East Ethiopia 2026',
      '2026-03-27',
      '2026-03-28',
      false,
      'Actively participated in the Cursor Hackathon East Ethiopia 2026, held on March 27 & 28, 2026. Demonstrated enthusiasm, creativity, and collaborative spirit in developing innovative solutions during this exciting coding competition.',
      2,
      true
    ]);
    console.log('✓ Added: Cursor Hackathon East Ethiopia 2026\n');

    console.log('✅ All experiences added successfully!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

addExperiences();
