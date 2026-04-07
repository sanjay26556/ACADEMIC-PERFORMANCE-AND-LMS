require('dotenv').config();
const { Pool } = require('pg');

const host = process.env.DB_HOST;
console.log(`DEBUG: DB_HOST length: ${host.length}`);
console.log(`DEBUG: DB_HOST value: '${host}'`);
console.log(`DEBUG: DB_HOST charCodes: ${host.split('').map(c => c.charCodeAt(0)).join(',')}`);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Connection Failed:', err);
    } else {
        console.log('Connection Successful:', res.rows[0]);
    }
    pool.end();
});
