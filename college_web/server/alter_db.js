require('dotenv').config({ override: true });
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});

(async () => {
    try {
        await pool.query('ALTER TABLE courses ADD COLUMN department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;');
        console.log('Altered courses to add department_id.');
    } catch(e) {
        console.error("Error/Already exists:", e.message);
    }
    process.exit();
})();
