require('dotenv').config({ override: true });
const pool = require('./db');

const migrate = async () => {
    try {
        await pool.query("ALTER TABLE students ADD COLUMN IF NOT EXISTS section VARCHAR(10) DEFAULT 'A'");
        console.log("Added section column to students table.");

        // Update existing students to 'A' if null
        await pool.query("UPDATE students SET section = 'A' WHERE section IS NULL");
        console.log("Updated existing students to Section A.");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrate();
