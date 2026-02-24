require('dotenv').config({ override: true });
const pool = require('./db');
const bcrypt = require('bcrypt');

const createTestTeacher = async () => {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Create User
            const hash = await bcrypt.hash('password123', 10);
            const userRes = await client.query(`
                INSERT INTO users (register_number, password_hash, role, dob)
                VALUES ('TESTTEACHER', $1, 'teacher', '1990-01-01')
                ON CONFLICT (register_number) DO UPDATE SET password_hash = $1
                RETURNING id
            `, [hash]);
            const userId = userRes.rows[0].id;
            console.log(`User created/updated: TESTTEACHER (ID: ${userId})`);

            // 2. Create Teacher Profile (linked to CS Dept ID 1)
            const teacherRes = await client.query(`
                INSERT INTO teachers (user_id, department_id, name, email)
                VALUES ($1, 1, 'Test Teacher', 'test@teacher.com')
                ON CONFLICT (email) DO UPDATE SET department_id = 1
                RETURNING id
            `, [userId]);
            const teacherId = teacherRes.rows[0].id; // Might differ if conflict and no returning
            // If conflict, we need to fetch it
            const finalTeacherRes = await client.query("SELECT id FROM teachers WHERE user_id = $1", [userId]);
            const finalTeacherId = finalTeacherRes.rows[0].id;
            console.log(`Teacher profile ensured (ID: ${finalTeacherId})`);

            // 3. Ensure Subject (Python ID 1)
            // Assuming subject ID 1 exists from previous steps.

            await client.query('COMMIT');
            console.log("Test teacher ready.");
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createTestTeacher();
