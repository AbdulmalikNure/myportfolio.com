require('dotenv').config();
const { Client } = require('pg');

async function verifyDatabase() {
  console.log('\n🔍 Verifying Database Configuration...\n');
  console.log('Configuration:');
  console.log('  Host:', process.env.DB_HOST || 'localhost');
  console.log('  Port:', process.env.DB_PORT || '5432');
  console.log('  Database:', process.env.DB_NAME || 'my_portfolio');
  console.log('  User:', process.env.DB_USER || 'postgres');
  console.log('  Password:', process.env.DB_PASSWORD ? '***' : '(not set)');
  console.log('  Password type:', typeof process.env.DB_PASSWORD);
  console.log('  Password value:', process.env.DB_PASSWORD);
  console.log('');

  // First, connect to postgres database to check if our database exists
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: 'postgres', // Connect to default postgres db
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'my_portfolio';
    const result = await adminClient.query(
      `SELECT datname FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Database "${dbName}" does not exist`);
      console.log(`\n📝 To create it, run in your PostgreSQL client:`);
      console.log(`   CREATE DATABASE ${dbName};`);
      console.log(`\nOr run this command in terminal:`);
      console.log(`   psql -U postgres -c "CREATE DATABASE ${dbName};"`);
    } else {
      console.log(`✅ Database "${dbName}" exists`);

      // Now connect to the actual database and check tables
      await adminClient.end();
      
      const dbClient = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: dbName,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
      });

      await dbClient.connect();
      console.log(`✅ Connected to database "${dbName}"`);

      // Check if users table exists
      const tableCheck = await dbClient.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      `);

      if (tableCheck.rows.length === 0) {
        console.log('❌ "users" table does not exist');
        console.log('\n📝 To set up the database, run:');
        console.log('   node backend/database/setup.js');
      } else {
        console.log('✅ "users" table exists');

        // Check if admin user exists
        const adminEmail = process.env.ADMIN_EMAIL || 'myportfolio@gmail.com';
        const userCheck = await dbClient.query(
          'SELECT id, name, email, role FROM users WHERE email = $1',
          [adminEmail]
        );

        if (userCheck.rows.length === 0) {
          console.log(`❌ Admin user with email "${adminEmail}" does not exist`);
          console.log('\n📝 To create admin user, run:');
          console.log('   node backend/database/seed.js');
        } else {
          console.log(`✅ Admin user exists:`);
          console.log(`   Name: ${userCheck.rows[0].name}`);
          console.log(`   Email: ${userCheck.rows[0].email}`);
          console.log(`   Role: ${userCheck.rows[0].role}`);
          console.log('\n✅ Database is properly configured!');
          console.log('\n📝 Login credentials:');
          console.log(`   Email: ${process.env.ADMIN_EMAIL || 'myportfolio@gmail.com'}`);
          console.log(`   Password: ${process.env.ADMIN_PASSWORD || '@Ab7340diand'}`);
        }
      }

      await dbClient.end();
    }

    await adminClient.end();
  } catch (error) {
    console.error('\n❌ Database verification failed:');
    console.error('   Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL server is not running or not accessible');
      console.error('   Make sure PostgreSQL is installed and running');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed');
      console.error('   Check your DB_USER and DB_PASSWORD in .env file');
    }
    
    process.exit(1);
  }
}

verifyDatabase();
