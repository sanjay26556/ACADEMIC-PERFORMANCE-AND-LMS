require('dotenv').config({ override: true });
const pool = require('./db');

const fixData = async () => {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Get Department 1 (CSE)
            const deptRes = await client.query("SELECT id FROM departments WHERE code = 'CS' OR id = 1 LIMIT 1");
            const deptId = deptRes.rows[0]?.id || 1;

            // 2. Find "User Teacher" and update Department
            console.log(`Setting Department ID ${deptId} for User Teacher...`);
            const updateTeacher = await client.query(`
                UPDATE teachers 
                SET department_id = $1 
                WHERE name = 'User Teacher' OR user_id IN (SELECT id FROM users WHERE role = 'teacher')
                RETURNING id, name
            `, [deptId]);

            if (updateTeacher.rows.length === 0) {
                console.log("No teacher found to update.");
            } else {
                console.log(`Updated teacher(s): ${updateTeacher.rows.map(t => t.name).join(', ')}`);
            }
            const teacherId = updateTeacher.rows[0]?.id;

            // 3. Ensure Subjects for Sem 1, Dept 1
            console.log("Ensuring subjects for Sem 1...");
            const subjectsToSeed = [
                { name: 'Problem Solving and Python Programming', code: 'GE3151', semester: 1 },
                { name: 'Engineering Physics', code: 'PH3151', semester: 1 },
                { name: 'Engineering Mathematics I', code: 'MA3151', semester: 1 }
            ];

            for (const sub of subjectsToSeed) {
                await client.query(`
                    INSERT INTO subjects (department_id, name, code, semester, credits)
                    VALUES ($1, $2, $3, $4, 3)
                    ON CONFLICT (code) DO UPDATE SET department_id = EXCLUDED.department_id
                `, [deptId, sub.name, sub.code, sub.semester]);
            }

            // 4. Ensure Students for Sem 1, Dept 1
            console.log("Ensuring students for Sem 1...");
            // Create dummy user first if needed, simpler to just assume some exist or create them
            // Check if we have users for students

            // Let's create a few student users and profiles if they don't exist
            const studentsToSeed = [
                { reg: '910023104001', name: 'Student One' },
                { reg: '910023104002', name: 'Student Two' },
                { reg: '910023104003', name: 'Student Three' }
            ];

            const sem = 1;

            for (const s of studentsToSeed) {
                // Upsert User
                const userRes = await client.query(`
                    INSERT INTO users (register_number, password_hash, role, dob)
                    VALUES ($1, $2, 'student', '2000-01-01')
                    ON CONFLICT (register_number) DO UPDATE SET role = 'student'
                    RETURNING id
                `, [s.reg, '$2b$10$abcdefg']); // dummy hash

                const userId = userRes.rows[0].id;

                // Upsert Student Profile
                const studRes = await client.query(`
                    INSERT INTO students (user_id, department_id, name, current_semester, batch_year)
                    VALUES ($1, $2, $3, $4, 2026)
                    ON CONFLICT (email) DO NOTHING
                    RETURNING id
                `, [userId, deptId, s.name, sem]);

                // If ON CONFLICT DO NOTHING returned no rows, fetch existing
                let studId = studRes.rows[0]?.id;
                if (!studId) {
                    const existing = await client.query('SELECT id FROM students WHERE user_id = $1', [userId]);
                    studId = existing.rows[0]?.id;
                }

                // 5. Assign to Teacher
                if (teacherId && studId) {
                    await client.query(`
                        INSERT INTO teacher_students (teacher_id, student_id)
                        VALUES ($1, $2)
                        ON CONFLICT (teacher_id, student_id) DO NOTHING
                    `, [teacherId, studId]);
                }
            }

            await client.query('COMMIT');
            console.log("Data fixed successfully!");
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixData();
