require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { pool } = require('./config/database');

async function updateEducation() {
  try {
    console.log('Updating education dates to Ethiopian Calendar (E.C)...\n');

    // Update Habe Elementary School (1995-2002 E.C)
    await pool.query(`
      UPDATE education 
      SET start_date = '1995-09-01', 
          end_date = '2002-07-01',
          description = 'Completed elementary education (1995-2002 E.C)'
      WHERE institution = 'Habe Elementary School'
    `);
    console.log('✓ Updated: Habe Elementary School → 1995-2002 E.C');

    // Update Habe Secondary School (2002-2004 E.C)
    await pool.query(`
      UPDATE education 
      SET start_date = '2002-09-01', 
          end_date = '2004-07-01',
          description = 'High school education (2002-2004 E.C)'
      WHERE institution = 'Habe Secondary School'
    `);
    console.log('✓ Updated: Habe Secondary School → 2002-2004 E.C');

    // Update Robe Didea School (2005-2006 E.C)
    await pool.query(`
      UPDATE education 
      SET start_date = '2005-09-01', 
          end_date = '2006-07-01',
          description = 'Preparatory school (2005-2006 E.C)'
      WHERE institution = 'Robe Didea School'
    `);
    console.log('✓ Updated: Robe Didea School → 2005-2006 E.C');

    // Update Haramaya University (2015-2018 E.C) - CORRECTED YEARS
    await pool.query(`
      UPDATE education 
      SET start_date = '2007-09-01', 
          end_date = '2010-07-01',
          description = 'Graduated with a degree in Information Systems (2015-2018 E.C)'
      WHERE institution = 'Haramaya University'
    `);
    console.log('✓ Updated: Haramaya University → 2015-2018 E.C (Bachelor\'s Degree)\n');

    console.log('✅ All education dates updated successfully!');
    console.log('\nNote: Database stores Gregorian dates but displays will show E.C years');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

updateEducation();
