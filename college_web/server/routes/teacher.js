const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const multer = require('multer');
const xlsx = require('xlsx');

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to get Teacher ID from User ID
const getTeacherId = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, department_id FROM teachers WHERE user_id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(403).json({ message: 'Teacher profile not found' });
        }
        req.teacher = result.rows[0];
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

router.use(authenticateToken, authorizeRole(['teacher']), getTeacherId);

// Get Subjects for a Semester
router.get('/subjects', async (req, res) => {
    const { semester } = req.query;
    try {
        let query = 'SELECT * FROM subjects WHERE department_id = $1';
        const params = [req.teacher.department_id];

        if (semester) {
            query += ' AND semester = $2';
            params.push(semester);
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Class Strength (Dynamic based on year/section)
router.get('/class-strength', async (req, res) => {
    const { year, section } = req.query;
    // year: 1, 2, 3, 4 (derived from batch_year if needed, but for simplicity assuming simplistic mapping or direct input)
    // Actually, year usually maps to current_semester (1,2 -> 1st year, etc).
    // Let's assume the frontend sends the *numeric year* (1, 2, 3, 4) and we map to semesters, OR
    // we filter by current_semester if the frontend sends that.
    // The prompt says "Year: 1st Year... Semester: Sem 1..8".
    // Let's filter by section and semester if provided, or calculate year from batch_year.
    // For now, let's trust the "Semester" filter as the primary grouper for subjects, 
    // and "Year" + "Section" for the student list.

    // NOTE: `year` param is tricky without consistent batch_year logic. 
    // Let's rely on `semester` for academic year logic if needed, but UI has Year AND Semester.
    // If Year is selected, we filtering students. 
    // Let's assume input `semester` is the filter for students currently in that semester.

    try {
        let query = `
            SELECT COUNT(*) as count 
            FROM students 
            WHERE department_id = $1
        `;
        const params = [req.teacher.department_id];
        let paramIdx = 2;

        if (section) {
            query += ` AND section = $${paramIdx}`;
            params.push(section);
            paramIdx++;
        }

        // Ideally we filter by semester to get the "class"
        if (req.query.semester) {
            query += ` AND current_semester = $${paramIdx}`;
            params.push(req.query.semester);
            // paramIdx++;
        }

        const result = await pool.query(query, params);
        res.json({ strength: parseInt(result.rows[0].count) });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Marks for a specific Subject (Pivot-like data for UI)
router.get('/marks/:subjectId', async (req, res) => {
    const { subjectId } = req.params;
    const { section, semester } = req.query;

    try {
        // Fetch students in the department, filtered by section/semester
        let studentQuery = `
            SELECT s.id, s.name, u.register_number 
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.department_id = $1
        `;
        const studentParams = [req.teacher.department_id];
        let pIdx = 2;

        if (section) {
            studentQuery += ` AND s.section = $${pIdx}`;
            studentParams.push(section);
            pIdx++;
        }
        if (semester) {
            studentQuery += ` AND s.current_semester = $${pIdx}`;
            studentParams.push(semester);
            pIdx++;
        }

        studentQuery += ` ORDER BY u.register_number`;

        const studentsRes = await pool.query(studentQuery, studentParams);
        const students = studentsRes.rows;

        // Fetch marks for these students and subject
        // We want all marks for this subject
        const marksQuery = `
            SELECT student_id, exam_type, marks_obtained 
            FROM marks 
            WHERE subject_id = $1
        `;
        const marksRes = await pool.query(marksQuery, [subjectId]);
        const marks = marksRes.rows;

        // Combine
        const result = students.map(student => {
            const studentMarks = marks.filter(m => m.student_id === student.id);
            const marksObj = {};
            studentMarks.forEach(m => {
                marksObj[m.exam_type] = m.marks_obtained;
            });
            return {
                ...student,
                marks: marksObj
            };
        });

        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Marks
router.post('/marks', async (req, res) => {
    const { subject_id, marks_data } = req.body;
    // marks_data: [{ student_id, exam_type, marks_obtained, max_marks }]

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (const record of marks_data) {
                await client.query(`
                    INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (student_id, subject_id, exam_type)
                    DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained
                `, [record.student_id, subject_id, record.exam_type, record.marks_obtained, record.max_marks || 100]);
            }

            await client.query('COMMIT');

            // Notify Students
            // We need unique student IDs involved
            const limitStudents = [...new Set(marks_data.map(m => m.student_id))];
            for (const sid of limitStudents) {
                // Get User ID for the student
                const uRes = await pool.query('SELECT user_id FROM students WHERE id = $1', [sid]);
                if (uRes.rows.length > 0) {
                    await pool.query(
                        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
                        [uRes.rows[0].user_id, 'Marks Updated', `New marks have been uploaded for Subject ID: ${subject_id}`, 'info']
                    );
                }
            }

            res.json({ message: 'Marks updated successfully' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Import Marks from Excel
router.post('/marks/import', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { subject_id } = req.body;
    if (!subject_id) return res.status(400).json({ message: 'Subject ID required' });

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Expected headers: Register Number, UT1, UT2, UT3, Model 1, Assignment
        // Map headers to exam_types
        const examTypes = ['UT1', 'UT2', 'UT3', 'Model Exam 1', 'Assignment'];

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (const row of data) {
                const regNum = row['Register Number'];
                if (!regNum) continue;

                // Find student
                const studentRes = await client.query('SELECT id FROM users WHERE register_number = $1', [regNum]);
                if (studentRes.rows.length === 0) {
                    // Log error or skip
                    continue;
                    // Alternatively, look in `students` join `users`.
                    // Actually `students` ID is needed. `users` table has Reg Num.
                    // The `students` table has `user_id`. 
                }

                // Get student ID from `students` table using user_id
                const userId = studentRes.rows[0].id;
                const studentProfileRes = await client.query('SELECT id FROM students WHERE user_id = $1', [userId]);
                if (studentProfileRes.rows.length === 0) continue;

                const studentId = studentProfileRes.rows[0].id;

                for (const type of examTypes) {
                    if (row[type] !== undefined) {
                        await client.query(`
                            INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained)
                            VALUES ($1, $2, $3, $4)
                            ON CONFLICT (student_id, subject_id, exam_type)
                            DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained
                        `, [studentId, subject_id, type, row[type]]);
                    }
                }
            }

            await client.query('COMMIT');
            res.json({ message: 'Marks imported successfully' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error processing Excel file' });
    }
});

// Export Marks Template / Data
router.get('/marks/export', async (req, res) => {
    const { subject_id, section, semester } = req.query;

    try {
        // Fetch filtered students
        let studentQuery = `
            SELECT s.id, s.name, u.register_number 
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.department_id = $1
        `;
        const studentParams = [req.teacher.department_id];
        let pIdx = 2;

        if (section) {
            studentQuery += ` AND s.section = $${pIdx}`;
            studentParams.push(section);
            pIdx++;
        }
        if (semester) {
            studentQuery += ` AND s.current_semester = $${pIdx}`;
            studentParams.push(semester);
            pIdx++;
        }
        studentQuery += ` ORDER BY u.register_number`;

        const studentsRes = await pool.query(studentQuery, studentParams);
        const students = studentsRes.rows;

        // Fetch existing marks if any
        const marksQuery = `
            SELECT student_id, exam_type, marks_obtained 
            FROM marks 
            WHERE subject_id = $1
        `;
        const marksRes = await pool.query(marksQuery, [subject_id]);
        const marks = marksRes.rows;

        // Build Excel Data
        const examTypes = ['UT1', 'UT2', 'UT3', 'Model Exam 1', 'Assignment'];
        const excelData = students.map(s => {
            const row = {
                'Register Number': s.register_number,
                'Name': s.name
            };
            examTypes.forEach(type => {
                const mark = marks.find(m => m.student_id === s.id && m.exam_type === type);
                row[type] = mark ? mark.marks_obtained : '';
            });
            return row;
        });

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(excelData);
        xlsx.utils.book_append_sheet(wb, ws, 'Marks');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="marks.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get Classes (Subjects) - Aliasing subjects as classes for the dashboard
router.get('/classes', async (req, res) => {
    try {
        // Assuming teachers teach all subjects in their department for now
        // Or we could join with timetables if we had that mapping strictly
        const result = await pool.query(
            'SELECT * FROM subjects WHERE department_id = $1 ORDER BY semester, name',
            [req.teacher.department_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get My Students
router.get('/my-students', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, u.register_number 
            FROM students s
            JOIN teacher_students ts ON s.id = ts.student_id
            JOIN users u ON s.user_id = u.id
            WHERE ts.teacher_id = $1
            ORDER BY u.register_number
        `, [req.teacher.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Student to My Class (by Register Number)
router.post('/add-student', async (req, res) => {
    const { register_number } = req.body;
    try {
        // 1. Find user by reg number
        const userRes = await pool.query('SELECT id FROM users WHERE register_number = $1', [register_number]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found with this Register Number' });
        }
        const userId = userRes.rows[0].id;

        // 2. Find student profile
        const studentRes = await pool.query('SELECT id FROM students WHERE user_id = $1', [userId]);
        if (studentRes.rows.length === 0) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        const studentId = studentRes.rows[0].id;

        // 3. Add to teacher_students
        await pool.query(`
            INSERT INTO teacher_students (teacher_id, student_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
        `, [req.teacher.id, studentId]);

        res.json({ message: 'Student added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Timetable
router.get('/timetable', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.*, s.name as subject_name, s.code as subject_code
            FROM timetables t
            JOIN subjects s ON t.subject_id = s.id
            WHERE t.teacher_id = $1
            ORDER BY 
                CASE 
                    WHEN day_of_week = 'Monday' THEN 1
                    WHEN day_of_week = 'Tuesday' THEN 2
                    WHEN day_of_week = 'Wednesday' THEN 3
                    WHEN day_of_week = 'Thursday' THEN 4
                    WHEN day_of_week = 'Friday' THEN 5
                    ELSE 6
                END,
                t.start_time
        `, [req.teacher.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark Attendance
router.post('/attendance', async (req, res) => {
    const { subject_id, date, attendance_data } = req.body;
    // attendance_data: [{ student_id, status }]

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (const record of attendance_data) {
                await client.query(`
                    INSERT INTO attendance (student_id, subject_id, date, status)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (student_id, subject_id, date)
                    DO UPDATE SET status = EXCLUDED.status
                `, [record.student_id, subject_id, date, record.status]);
            }

            await client.query('COMMIT');
            res.json({ message: 'Attendance marked successfully' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
