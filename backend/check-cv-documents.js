require('dotenv').config();
const { query } = require('./config/database');

async function checkDocuments() {
  try {
    console.log('\n🔍 Checking CV documents in database...\n');
    
    const result = await query('SELECT * FROM cv_documents ORDER BY created_at');
    
    console.log(`Found ${result.rows.length} document(s):\n`);
    
    if (result.rows.length === 0) {
      console.log('❌ No CV documents found in database!');
      console.log('\nThis is why you\'re getting errors - the frontend is using fallback IDs');
      console.log('but the backend expects real database UUIDs.');
      console.log('\n📝 You need to upload CV documents through the admin panel:');
      console.log('   1. Go to http://localhost:5174/cv-documents');
      console.log('   2. Upload your CV files');
      console.log('   3. The documents will work on the portfolio site');
    } else {
      result.rows.forEach((doc, i) => {
        console.log(`${i + 1}. ${doc.document_name}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Type: ${doc.document_type}`);
        console.log(`   File: ${doc.file_name}`);
        console.log(`   Status: ${doc.status}`);
        console.log(`   Path: ${doc.file_path}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDocuments();
