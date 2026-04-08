const pool = require('./db');
const bcrypt = require('bcrypt');

const resetAll = async () => {
    try {
        const hash = await bcrypt.hash('12345', 10);
        await pool.query("UPDATE users SET password_hash = $1, first_login = false", [hash]);
        console.log("All user passwords reset to '12345' (first_login set to false)");
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

resetAll();
