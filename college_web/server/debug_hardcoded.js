const { Pool } = require('pg');

const host = 'db.rwzqfzbsyyrrswpiusrs.supabase.co';
console.log(`Testing connection to: ${host}`);

const pool = new Pool({
    user: 'postgres',
    host: host,
    database: 'postgres',
    password: '-ybWL$%_9mQfxYt',
    port: 5432,
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
