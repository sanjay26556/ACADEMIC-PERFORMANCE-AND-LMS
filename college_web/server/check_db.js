const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkTables() {
    try {
        const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log("Tables in database:");
        res.rows.forEach(row => console.log(` - ${row.table_name}`));

        // Check teacher_students specific columns to be sure
        const tsRes = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'teacher_students'
    `);
        console.log("\nColumns in teacher_students:");
        tsRes.rows.forEach(row => console.log(` - ${row.column_name} (${row.data_type})`));

    } catch (err) {
        console.error("Error checking tables:", err);
    } finally {
        pool.end();
    }
}

checkTables();
