require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const tables = ['hospitals', 'doctors', 'specialties', 'bookings', 'payments', 'reviews', 'notifications', 'subscription_plans', 'subscriptions'];

async function checkTables() {
  for (const table of tables) {
    try {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [table]);
      
      console.log(`\n${table.toUpperCase()}:`);
      result.rows.forEach(col => {
        console.log(`  ${col.column_name} - ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
      });
    } catch (error) {
      console.error(`Error checking ${table}:`, error.message);
    }
  }
  pool.end();
}

checkTables();


















