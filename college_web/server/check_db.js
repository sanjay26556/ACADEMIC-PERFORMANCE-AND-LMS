require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function check() {
    try {
        console.log('Testing DB connection...');
        const res = await pool.query('SELECT NOW()');
        console.log('DB Connected:', res.rows[0]);

        console.log('Checking Teachers...');
        const teachers = await pool.query('SELECT * FROM teachers LIMIT 5');
        console.log('Teachers found:', teachers.rowCount);
        teachers.rows.forEach(t => console.log(`Teacher ID: ${t.id}, User ID: ${t.user_id}`));

        console.log('Checking Courses...');
        const courses = await pool.query('SELECT * FROM courses LIMIT 5');
        console.log('Courses found:', courses.rowCount);

    } catch (err) {
        console.error('DB Error:', err);
    } finally {
        pool.end();
    }
}

check();
