require('dotenv').config({ override: true });
const pool = require('./db');
const bcrypt = require('bcrypt');

const resetPass = async () => {
    try {
        const hash = await bcrypt.hash('password123', 10);
        await pool.query("UPDATE users SET password_hash = $1 WHERE register_number = 'TEACHER001'", [hash]);
        console.log("Password for TEACHER001 reset to 'password123'");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPass();
