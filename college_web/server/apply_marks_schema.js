const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function updateSchema() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if columns exist before adding them
        const checkAbsent = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='marks' AND column_name='is_absent'");
        if (checkAbsent.rows.length === 0) {
            console.log("Adding is_absent column...");
            await client.query('ALTER TABLE marks ADD COLUMN is_absent BOOLEAN DEFAULT FALSE');
        }

        const checkTeacher = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='marks' AND column_name='teacher_id'");
        if (checkTeacher.rows.length === 0) {
            console.log("Adding teacher_id column...");
            await client.query('ALTER TABLE marks ADD COLUMN teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL');
        }

        // Make marks_obtained nullable
        console.log("Altering marks_obtained to be nullable...");
        await client.query('ALTER TABLE marks ALTER COLUMN marks_obtained DROP NOT NULL');

        await client.query('COMMIT');
        console.log('Schema updated successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating schema:', err);
    } finally {
        client.release();
        pool.end();
    }
}

updateSchema();
