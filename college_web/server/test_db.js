const { Pool } = require('pg');

const pool = new Pool({
    user: 'edupulse_user',
    host: 'localhost',
    database: 'edupulse',
    password: 'Edupulse@123',
    port: 5432,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ DB ERROR:', err);
    } else {
        console.log('✅ DB CONNECTED SUCCESSFULLY:', res.rows);
    }
    pool.end();
});
