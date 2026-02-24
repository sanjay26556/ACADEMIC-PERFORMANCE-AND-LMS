const pool = require('./db');
const bcrypt = require('bcrypt');

const resetPass = async () => {
    try {
        const hash = await bcrypt.hash('123456', 10);
        await pool.query("UPDATE users SET password_hash = $1 WHERE register_number = 'TCH676178'", [hash]);
        console.log("Password reset for TCH676178 to 123456");
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

resetPass();
