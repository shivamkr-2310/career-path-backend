const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL Connected Successfully');
    client.release();
  } catch (error) {
    console.error('PostgreSQL Connection Error:');
    console.error(error);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
