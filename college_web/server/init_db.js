require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const pool = require('./db');
const bcrypt = require('bcrypt');

const initDb = async () => {
    try {
        // Read schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Run schema
        console.log('Running schema.sql...');
        await pool.query(schemaSql);
        console.log('Schema created successfully.');

        // Seed default admin if not exists
        const adminExists = await pool.query("SELECT * FROM users WHERE role = 'admin'");
        if (adminExists.rows.length === 0) {
            const dob = '2000-01-01'; // Default DOB for admin
            const passwordHash = await bcrypt.hash(dob, 10);

            await pool.query(
                "INSERT INTO users (register_number, password_hash, role, dob, first_login) VALUES ($1, $2, $3, $4, $5)",
                ['ADMIN001', passwordHash, 'admin', dob, true]
            );
            console.log('Default Admin created: Register No: ADMIN001, Password: (DOB) 2000-01-01');
        } else {
            console.log('Admin already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
};

initDb();
