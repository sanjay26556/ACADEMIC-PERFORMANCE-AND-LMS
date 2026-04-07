const pool = require('./db.js');
async function r() {
    const s = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1', ['students']);
    console.log(s.rows);
    const t = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1', ['teachers']);
    console.log(t.rows);
    process.exit(0);
}
r();
