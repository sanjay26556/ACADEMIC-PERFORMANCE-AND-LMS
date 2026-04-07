const pool = require('./db');

async function updateSchema() {
    try {
        console.log('Adding section column to students table...');
        await pool.query(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS section VARCHAR(1) DEFAULT 'A';
    `);
        console.log('✅ Section column added successfully.');

        // Ensure marks table constraint allows for multiple exam types per subject/student if needed, 
        // but the unique constraint (student_id, subject_id, exam_type) handles that.

        // Let's also check if we need to add a 'semester' column to marks for historical records?
        // The current schema links marks to subject, and subject has semester. So it's implicit.
        // However, if a student fails and retakes... strictly speaking, the subject mapping holds.
        // For this simple system, it's fine.

        // Let's seed some subjects if they don't exist for testing
        console.log('Seeding initial subjects...');
        // We have 4 departments: CS, IT, ECE, MECH (ids 1-4 likely)
        // Let's insert some Sem 1 subjects for CS (assuming ID 1)

        // First get CS department ID
        const deptRes = await pool.query("SELECT id FROM departments WHERE code = 'CS'");
        if (deptRes.rows.length > 0) {
            const csId = deptRes.rows[0].id;

            const subjects = [
                { name: 'Mathematics I', code: 'MA8151', semester: 1 },
                { name: 'Engineering Physics', code: 'PH8151', semester: 1 },
                { name: 'Engineering Chemistry', code: 'CY8151', semester: 1 },
                { name: 'Problem Solving and Python Programming', code: 'GE8151', semester: 1 },
                { name: 'Engineering Graphics', code: 'GE8152', semester: 1 },
                { name: 'Technical English', code: 'HS8151', semester: 1 },

                { name: 'Mathematics II', code: 'MA8251', semester: 2 },
                { name: 'Physics for Information Science', code: 'PH8252', semester: 2 },
                { name: 'Environmental Science', code: 'GE8291', semester: 2 },
                { name: 'Basic Electrical, Electronics and Measurement Engineering', code: 'BE8255', semester: 2 },
                { name: 'Information Technology Essentials', code: 'IT8201', semester: 2 },
                { name: 'Programming in C', code: 'CS8251', semester: 2 }
            ];

            for (const sub of subjects) {
                await pool.query(`
                INSERT INTO subjects (department_id, name, code, semester)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (code) DO NOTHING
            `, [csId, sub.name, sub.code, sub.semester]);
            }
            console.log('✅ Default CS subjects seeded.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
