const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_STd7lXUscKq6@ep-falling-boat-ansbz3cy.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query('ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(255);');
    console.log('ALTER TABLE SUCCESS');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    pool.end();
  }
}
run();
