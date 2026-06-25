require('dotenv').config();
const { Client } = require('pg');

async function createDatabase() {
  const dbName = process.env.DB_NAME || 'my_portfolio';
  
  // Connect to the default 'postgres' database
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if database already exists
    const checkDb = await client.query(
      `SELECT datname FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDb.rows.length > 0) {
      console.log(`✅ Database "${dbName}" already exists`);
    } else {
      // Create the database
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully`);
    }

    await client.end();
    console.log('\n📝 Next steps:');
    console.log('   1. Run: node database/setup.js (to create tables)');
    console.log('   2. Run: node database/seed.js (to add initial data)');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDatabase();
