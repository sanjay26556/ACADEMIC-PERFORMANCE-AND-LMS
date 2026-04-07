require('dotenv').config({ override: true });
const pool = require('./db');
const bcrypt = require('bcrypt');

const resetPass = async () => {
    try {
        const hash = await bcrypt.hash('12345', 10);
        // User found was TCH672630, let's update by that reg number to be safe, or just find the user associated with the email if login logic supports email.
        // The log showed "Login attempt: { register_number: 'rajan@gmail.com', ... }" and "User found: TCH672630".
        // This means the login logic resolved email to that user.

        await pool.query("UPDATE users SET password_hash = $1 WHERE register_number = 'TCH672630'", [hash]);
        console.log("Password for TCH672630 (rajan@gmail.com) reset to '12345'");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPass();
