require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

async function setupDatabase() {
  const client = await pool.connect();
  try {
    logger.info('Running database schema setup...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    logger.info('Schema created');

    logger.info('Running CV documents migration...');
    const migration = fs.readFileSync(path.join(__dirname, 'cv_documents_migration.sql'), 'utf8');
    await client.query(migration);
    logger.info('✅ Database schema + migrations applied successfully');
  } catch (err) {
    logger.error('❌ Database setup failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
