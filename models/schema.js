const { pool } = require('../config/db');

const initDB = async () => {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      clerk_id VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      level VARCHAR(255),
      stream VARCHAR(255),
      course VARCHAR(255),
      branch VARCHAR(255),
      semester VARCHAR(50),
      results JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const questionsTable = `
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      question_text TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      options JSONB NOT NULL,
      target_course VARCHAR(255) DEFAULT 'All',
      target_semester VARCHAR(50) DEFAULT 'All'
    );
  `;

  try {
    await pool.query(usersTable);
    await pool.query(questionsTable);
    
    // Add columns if they don't exist (in case tables were already created)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS level VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stream VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS course VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS semester VARCHAR(50)`);
    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS target_course VARCHAR(255) DEFAULT 'All'`);
    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS target_semester VARCHAR(50) DEFAULT 'All'`);
    
    console.log('Database tables and columns initialized');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

module.exports = { initDB };
