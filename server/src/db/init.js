// server/src/db/init.js
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection to MySQL (without database)
const createConnection = async () => {
  try {
    return await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
    throw error;
  }
};

// Create database if it doesn't exist
const createDatabase = async () => {
  let connection;
  try {
    connection = await createConnection();
    const dbName = process.env.DB_NAME || 'evoting_db';
    
    console.log(`Creating database ${dbName} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Using database ${dbName}`);
    await connection.query(`USE ${dbName}`);
    
    return connection;
  } catch (error) {
    if (connection) connection.end();
    console.error('Error creating database:', error);
    throw error;
  }
};

const runMigrations = async () => {
  let connection;
  try {
    console.log('Starting database migrations...');
    
    connection = await createDatabase();
    
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).sort();
    
    for (const file of migrationFiles) {
      if (file.endsWith('.sql')) {
        console.log(`Running migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        await connection.query(sql);
        console.log(`Migration ${file} completed successfully`);
      }
    }
    
    console.log('All migrations completed successfully');
    connection.end();
  } catch (error) {
    if (connection) connection.end();
    console.error('Error running migrations:', error);
    process.exit(1);
  }
};

module.exports = { runMigrations };

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}