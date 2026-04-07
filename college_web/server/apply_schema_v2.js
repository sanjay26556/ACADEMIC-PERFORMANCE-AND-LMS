const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function applySchema() {
    try {
        const schemaPath = path.join(__dirname, 'schema_update_v2.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log("Applying schema update v2...");
        await pool.query(schemaSql);
        console.log("Schema update v2 applied successfully.");
    } catch (err) {
        console.error("Error applying schema:", err);
    } finally {
        pool.end();
    }
}

applySchema();
