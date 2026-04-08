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

// -------------------------------------------------------------------------
// COURSE MANAGEMENT
// -------------------------------------------------------------------------

// Create a New Course
router.post('/courses', async (req, res) => {
    const { name, code, year, semester, section, department_id } = req.body;

    if (!name || !code || !year || !semester || !section || !department_id) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert course
        const result = await client.query(
            `INSERT INTO courses (teacher_id, name, code, year, semester, section, department_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [req.teacher.id, name, code, year, semester, section, department_id]
        );
        
        const newCourse = result.rows[0];

        // 2. Auto-enroll matching students
        const studentsRes = await client.query(`
            SELECT id FROM students 
            WHERE department_id = $1 
              AND current_semester = $2 
              AND section = $3
        `, [department_id, parseInt(semester), section]);

        const studentsToEnroll = studentsRes.rows;
        
        // Let's also verify year matching if batch_year logic is used, but student has current_semester and section.
        // The DB schema for students has: department_id, current_semester, section, batch_year.
        // It does not have 'year' directly, but current_semester implies the year.
        // Course has year, semester, section. We'll match against current_semester and section, as those define the student's current class.
        
        for (const student of studentsToEnroll) {
            await client.query(
                `INSERT INTO course_enrollments (course_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [newCourse.id, student.id]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ 
            message: 'Course created and students auto-enrolled successfully', 
            course: newCourse,
            enrolledCount: studentsToEnroll.length
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error creating course:", err);
        res.status(500).json({ message: 'Server error creating course' });
    } finally {
        client.release();
    }
});

// Get My Courses (Teacher's Courses)
router.get('/courses', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM courses WHERE teacher_id = $1 ORDER BY created_at DESC',
            [req.teacher.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching courses' });
    }
});

// Delete Course
router.delete('/courses/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [courseId, req.teacher.id]);
        if (courseCheck.rows.length === 0) return res.status(403).json({ message: 'Course not found or unauthorized' });

        await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting course' });
    }
});

// Alias for old frontend compatibility
router.get('/classes', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM courses WHERE teacher_id = $1 ORDER BY created_at DESC',
            [req.teacher.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching classes' });
    }
});

// -------------------------------------------------------------------------
// STUDENT ENROLLMENT
// -------------------------------------------------------------------------

// Enroll Student to Course (by Register Number)
router.post('/courses/:courseId/enroll', async (req, res) => {
    console.log(`[DEBUG] POST /courses/${req.params.courseId}/enroll called`);
    console.log(`[DEBUG] Body:`, req.body);
    const { courseId } = req.params;
    const { register_number } = req.body;

    try {
        // 1. Validate Course Ownership
        const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [courseId, req.teacher.id]);
        if (courseCheck.rows.length === 0) return res.status(403).json({ message: 'Course not found or unauthorized' });

        // 2. Find Student
        const userRes = await pool.query('SELECT id FROM users WHERE register_number = $1', [register_number]);
        if (userRes.rows.length === 0) return res.status(404).json({ message: 'Student not found with this Register Number' });

        const studentRes = await pool.query('SELECT id FROM students WHERE user_id = $1', [userRes.rows[0].id]);
        if (studentRes.rows.length === 0) return res.status(404).json({ message: 'Student profile not found' });

        const studentId = studentRes.rows[0].id;

        // 3. Enroll
        await pool.query(
            `INSERT INTO course_enrollments (course_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [courseId, studentId]
        );

        res.json({ message: 'Student enrolled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error enrolling student' });
    }
});

// Get Students Enrolled in a Course
router.get('/courses/:courseId/students', async (req, res) => {
    const { courseId } = req.params;
    try {
        const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [courseId, req.teacher.id]);
        if (courseCheck.rows.length === 0) return res.status(403).json({ message: 'Course not found or unauthorized' });

        const result = await pool.query(`
            SELECT s.*, u.register_number 
            FROM students s
            JOIN course_enrollments ce ON s.id = ce.student_id
            JOIN users u ON s.user_id = u.id
            WHERE ce.course_id = $1
            ORDER BY u.register_number ASC
        `, [courseId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching students' });
    }
});

// Remove Student from Course
router.delete('/courses/:courseId/students/:studentId', async (req, res) => {
    const { courseId, studentId } = req.params;
    try {
        const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [courseId, req.teacher.id]);
        if (courseCheck.rows.length === 0) return res.status(403).json({ message: 'Course not found or unauthorized' });

        await pool.query('DELETE FROM course_enrollments WHERE course_id = $1 AND student_id = $2', [courseId, studentId]);
        res.json({ message: 'Student removed from course successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error removing student' });
    }
});

// -------------------------------------------------------------------------
// MARKS MANAGEMENT
// -------------------------------------------------------------------------

// Get Marks for a Course (Pivot-like Data)
router.get('/marks/:courseId', async (req, res) => {
    const { courseId } = req.params;

    try {
        const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [courseId, req.teacher.id]);
        if (courseCheck.rows.length === 0) return res.status(403).json({ message: 'Course not found or unauthorized' });

        // Get Enrolled Students
        const studentsRes = await pool.query(`
            SELECT s.id, s.name, u.register_number 
            FROM students s
            JOIN course_enrollments ce ON s.id = ce.student_id
            JOIN users u ON s.user_id = u.id
            WHERE ce.course_id = $1
            ORDER BY u.register_number ASC
        `, [courseId]);

        const students = studentsRes.rows;

        // Get Marks
        const marksRes = await pool.query(`
            SELECT student_id, exam_type, marks_obtained, is_absent
            FROM marks 
            WHERE course_id = $1
        `, [courseId]);

        const marks = marksRes.rows;

        // Combine
        const result = students.map(student => {
            const studentMarks = marks.filter(m => m.student_id === student.id);
            const marksObj = {};
            studentMarks.forEach(m => {
                marksObj[m.exam_type] = m.is_absent ? 'AB' : m.marks_obtained;
            });
            return {
                ...student,
                marks: marksObj
            };
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching marks' });
    }
});

// Save/Update Marks
router.post('/marks', async (req, res) => {
    const { subject_id, marks_data } = req.body;
    const course_id = subject_id || req.body.course_id;

    try {
        const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [course_id, req.teacher.id]);
        if (courseCheck.rows.length === 0) return res.status(403).json({ message: 'Course not found or unauthorized' });

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const record of marks_data) {
                const isAbsent = record.is_absent || false;
                const marksObtained = isAbsent ? null : record.marks_obtained;

                await client.query(`
                    INSERT INTO marks (student_id, course_id, exam_type, marks_obtained, is_absent, max_marks)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (student_id, course_id, exam_type)
                    DO UPDATE SET 
                        marks_obtained = EXCLUDED.marks_obtained,
                        is_absent = EXCLUDED.is_absent
                `, [
                    record.student_id,
                    course_id,
                    record.exam_type,
                    marksObtained,
                    isAbsent,
                    record.max_marks || 100
                ]);
            }
            await client.query('COMMIT');
            res.json({ message: 'Marks updated successfully' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saving marks' });
    }
});

// Validate Import from Excel
router.post('/marks/validate-import', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { subject_id } = req.body;
    const course_id = subject_id || req.body.course_id;

    if (!course_id) return res.status(400).json({ message: 'Course/Subject ID required' });

    try {
        const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [course_id, req.teacher.id]);
        if (courseCheck.rows.length === 0) return res.status(403).json({ message: 'Unauthorized course' });

        const studentRes = await pool.query(`
            SELECT s.id, u.register_number, s.name 
            FROM students s
            JOIN course_enrollments ce ON s.id = ce.student_id
            JOIN users u ON s.user_id = u.id
            WHERE ce.course_id = $1
        `, [course_id]);

        const validStudents = studentRes.rows;
        const validRegNos = new Set(validStudents.map(s => s.register_number));
        const studentMap = {};
        validStudents.forEach(s => studentMap[s.register_number] = s);

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const examTypes = ['UT1', 'UT2', 'UT3', 'Model Exam 1', 'Assignment'];
        const validatedRows = [];
        let hasErrors = false;

        for (const row of data) {
            const regNum = row['Register Number'];
            const studentName = row['Student Name'] || row['Name'] || '';
            const rowErrors = [];

            if (!regNum) continue;

            if (!validRegNos.has(regNum)) {
                rowErrors.push('Student not enrolled in this course');
            }

            const marks = {};
            examTypes.forEach(type => {
                if (row[type] !== undefined) {
                    const val = String(row[type]).trim().toUpperCase();
                    if (val === 'AB') {
                        marks[type] = 'AB';
                    } else if (!isNaN(val)) {
                        const num = parseFloat(val);
                        if (num < 0 || num > 100) {
                            rowErrors.push(`${type}: Marks must be 0-100`);
                            marks[type] = val;
                        } else {
                            marks[type] = num;
                        }
                    } else {
                        rowErrors.push(`${type}: Invalid value`);
                        marks[type] = val;
                    }
                }
            });

            if (rowErrors.length > 0) hasErrors = true;

            validatedRows.push({
                register_number: regNum,
                name: studentMap[regNum] ? studentMap[regNum].name : studentName,
                student_id: studentMap[regNum] ? studentMap[regNum].id : null,
                marks: marks,
                errors: rowErrors,
                isValid: rowErrors.length === 0 && validRegNos.has(regNum)
            });
        }

        res.json({ validatedRows, hasErrors });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error processing Excel' });
    }
});

// Export Marks Excel
router.get('/marks/export', async (req, res) => {
    console.log(`[DEBUG] GET /marks/export called with query:`, req.query);
    const { subject_id } = req.query;
    const course_id = subject_id || req.query.course_id;

    try {
        const courseCheck = await pool.query('SELECT id, code FROM courses WHERE id = $1 AND teacher_id = $2', [course_id, req.teacher.id]);
        if (courseCheck.rows.length === 0) return res.status(403).json({ message: 'Unauthorized' });
        const courseCode = courseCheck.rows[0].code;

        const studentsRes = await pool.query(`
            SELECT s.id, s.name, u.register_number 
            FROM students s
            JOIN course_enrollments ce ON s.id = ce.student_id
            JOIN users u ON s.user_id = u.id
            WHERE ce.course_id = $1
            ORDER BY u.register_number ASC
        `, [course_id]);

        const marksRes = await pool.query(`
            SELECT student_id, exam_type, marks_obtained 
            FROM marks WHERE course_id = $1
        `, [course_id]);

        const students = studentsRes.rows;
        const marks = marksRes.rows;

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
            const ut1 = parseFloat(row['UT1']) || 0;
            const ut2 = parseFloat(row['UT2']) || 0;
            const ut3 = parseFloat(row['UT3']) || 0;
            const model = parseFloat(row['Model Exam 1']) || 0;
            const assignment = parseFloat(row['Assignment']) || 0;
            const overall = (ut1 / 10) + (ut2 / 10) + (ut3 / 10) + (model / 20) + (assignment / 2);
            row['Overall Internal (40)'] = isNaN(overall) ? 0 : Math.round(overall * 10) / 10;
            return row;
        });

        console.log(`[DEBUG] Generating Excel for ${excelData.length} students`);

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(excelData);
        xlsx.utils.book_append_sheet(wb, ws, 'Marks');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        console.log(`[DEBUG] Excel buffer generated, size: ${buffer.length}`);

        res.setHeader('Content-Disposition', `attachment; filename="Marks_${courseCode}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// -------------------------------------------------------------------------
// ATTENDANCE
// -------------------------------------------------------------------------

router.post('/attendance', async (req, res) => {
    const { subject_id, date, attendance_data } = req.body;
    const course_id = subject_id || req.body.course_id;

    try {
        const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [course_id, req.teacher.id]);
        if (courseCheck.rows.length === 0) return res.status(403).json({ message: 'Unauthorized' });

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const record of attendance_data) {
                await client.query(`
                    INSERT INTO attendance (student_id, course_id, date, status)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (student_id, course_id, date)
                    DO UPDATE SET status = EXCLUDED.status
                `, [record.student_id, course_id, date, record.status]);
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

router.get('/dashboard-stats', async (req, res) => {
    try {
        const coursesRes = await pool.query('SELECT COUNT(*) FROM courses WHERE teacher_id = $1', [req.teacher.id]);
        const studentsRes = await pool.query(`
            SELECT COUNT(DISTINCT student_id) 
            FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            WHERE c.teacher_id = $1
        `, [req.teacher.id]);

        res.json({
            courses: parseInt(coursesRes.rows[0].count),
            students: parseInt(studentsRes.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// -------------------------------------------------------------------------
// REPORTS & ANALYTICS
// -------------------------------------------------------------------------

// Get Student Performance Analytics (Overall)
router.get('/analytics', async (req, res) => {
    try {
        // 1. Get all students enrolled in Teacher's courses (Distinct)
        const studentsRes = await pool.query(`
            SELECT DISTINCT s.id, s.name, u.register_number, s.email, u.id as user_id 
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN course_enrollments ce ON s.id = ce.student_id
            JOIN courses c ON ce.course_id = c.id
            WHERE c.teacher_id = $1
            ORDER BY u.register_number ASC
        `, [req.teacher.id]);

        const students = studentsRes.rows;
        const analyticsData = [];

        for (const student of students) {
            // 2. Attendance % (Across all teacher's courses this student is in)
            const attendRes = await pool.query(`
                SELECT 
                    COUNT(*) as total_classes,
                    SUM(CASE WHEN status = 'Present' OR status = 'On Duty' THEN 1 ELSE 0 END) as present_count
                FROM attendance a
                JOIN courses c ON a.course_id = c.id
                WHERE a.student_id = $1 AND c.teacher_id = $2
            `, [student.id, req.teacher.id]);

            const { total_classes, present_count } = attendRes.rows[0] || { total_classes: 0, present_count: 0 };
            const attendancePct = total_classes > 0 ? ((present_count / total_classes) * 100).toFixed(1) : 0;

            // 3. Marks % (Average across exams/courses)
            const marksRes = await pool.query(`
                SELECT marks_obtained, max_marks
                FROM marks m
                JOIN courses c ON m.course_id = c.id
                WHERE m.student_id = $1 AND c.teacher_id = $2 AND m.is_absent = FALSE
            `, [student.id, req.teacher.id]);

            let totalObtained = 0;
            let totalMax = 0;
            marksRes.rows.forEach(m => {
                totalObtained += parseFloat(m.marks_obtained);
                totalMax += parseFloat(m.max_marks || 100);
            });

            const marksPct = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

            analyticsData.push({
                student_id: student.id,
                user_id: student.user_id,
                name: student.name,
                register_number: student.register_number,
                attendance_pct: attendancePct,
                marks_pct: marksPct
            });
        }

        res.json(analyticsData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching analytics' });
    }
});

// Send System Alerts
router.post('/notifications/send-alerts', async (req, res) => {
    const { student_ids, type } = req.body; // type: 'attendance' | 'marks'
    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
        return res.status(400).json({ message: 'No students selected' });
    }

    try {
        const title = type === 'attendance' ? 'Low Attendance Alert' : 'Low Academic Performance Alert';
        const message = type === 'attendance'
            ? 'Your attendance has fallen below 75%. Please contact your teacher immediately.'
            : 'Your academic performance needs improvement. Please review your recent marks.';

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const userId of student_ids) {
                await client.query(`
                    INSERT INTO notifications (user_id, title, message)
                    VALUES ($1, $2, $3)
                `, [userId, title, message]);
            }
            await client.query('COMMIT');
            res.json({ message: `Alerts sent to ${student_ids.length} students` });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error sending alerts' });
    }
});


// -------------------------------------------------------------------------
// DASHBOARD LEADERBOARD & ANALYTICS
// -------------------------------------------------------------------------
router.get('/dashboard/analytics', async (req, res) => {
    const { type, id, course_id } = req.query; // type: 'assignment' | 'assessment'

    if (!type || !id) {
        return res.status(400).json({ message: 'Type and ID are required' });
    }

    try {
        // 1. Verify Ownership & Get Layout Info
        let ownershipCheck;
        let linkedCourseId = null;
        let assessmentType = null;
        let assessmentId = null;

        if (type === 'assignment') {
            ownershipCheck = await pool.query('SELECT id, total_marks, course_id FROM assignments WHERE id = $1 AND teacher_id = $2', [id, req.teacher.id]);
            if (ownershipCheck.rows.length > 0) {
                linkedCourseId = ownershipCheck.rows[0].course_id;
            }
        } else {
            ownershipCheck = await pool.query(`
                SELECT a.id, a.total_marks, a.type, asg.course_id 
                FROM assessments a 
                JOIN assignments asg ON a.assignment_id = asg.id 
                WHERE a.id = $1 AND asg.teacher_id = $2
            `, [id, req.teacher.id]);
            if (ownershipCheck.rows.length > 0) {
                linkedCourseId = ownershipCheck.rows[0].course_id;
                assessmentType = ownershipCheck.rows[0].type;
                assessmentId = ownershipCheck.rows[0].id;
            }
        }

        if (ownershipCheck.rows.length === 0) return res.status(403).json({ message: 'Unauthorized' });
        const totalMarks = parseFloat(ownershipCheck.rows[0].total_marks || 100);

        // 2. Fetch Submissions
        let query = `
            SELECT 
                s.id as submission_id,
                u.register_number,
                stu.name,
                s.obtained_marks
            FROM submissions s
            JOIN students stu ON s.student_id = stu.id
            JOIN users u ON stu.user_id = u.id
            WHERE 1=1
        `;
        const params = [id];

        if (type === 'assignment') query += ` AND s.assignment_id = $1`;
        else query += ` AND s.assessment_id = $1`;

        // Filter by course if explicitly requested (though ID should imply course)
        if (course_id && course_id !== 'All') {
            query += ` AND stu.id IN (SELECT student_id FROM course_enrollments WHERE course_id = $2)`;
            params.push(course_id);
        }

        query += ` ORDER BY s.obtained_marks DESC`;

        const subRes = await pool.query(query, params);
        const submissions = subRes.rows;

        // 3. Stats Calculation
        const scores = submissions.map(s => parseFloat(s.obtained_marks));
        const maxScore = scores.length ? Math.max(...scores) : 0;
        const minScore = scores.length ? Math.min(...scores) : 0;
        const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;

        // 4. Insights: Submission Percentage
        // If we have a linked course, get total students.
        // If course_id filter is applied, use that.
        let targetCourseId = (course_id && course_id !== 'All') ? course_id : linkedCourseId;
        let totalEnrolled = 0;

        if (targetCourseId) {
            const enrollRes = await pool.query('SELECT COUNT(*) FROM course_enrollments WHERE course_id = $1', [targetCourseId]);
            totalEnrolled = parseInt(enrollRes.rows[0].count);
        }

        const submissionPct = totalEnrolled > 0 ? ((submissions.length / totalEnrolled) * 100).toFixed(1) : 0;

        // 5. Insights: Coding Specific
        let codingInsights = null;
        if (type === 'assessment' && assessmentType === 'Coding' && assessmentId) {
            // Get total test cases
            const tcRes = await pool.query(`
                SELECT COUNT(*) as count 
                FROM coding_test_cases tc
                JOIN coding_problems cp ON tc.problem_id = cp.id
                WHERE cp.assessment_id = $1
            `, [assessmentId]);

            const totalTestCases = parseInt(tcRes.rows[0].count);

            if (totalTestCases > 0) {
                // Approximate test cases passed based on score
                // Score = (Passed / Total) * TotalMarks
                // Passed = (Score * TotalTestCases) / TotalMarks
                const passedCounts = scores.map(s => (s * totalTestCases) / totalMarks);
                const avgPassed = passedCounts.length ? (passedCounts.reduce((a, b) => a + b, 0) / passedCounts.length).toFixed(1) : 0;

                // Success Rates
                const successRates = scores.map(s => (s / totalMarks) * 100);
                const maxSuccess = successRates.length ? Math.max(...successRates).toFixed(1) : 0;
                const minSuccess = successRates.length ? Math.min(...successRates).toFixed(1) : 0;

                codingInsights = {
                    avg_test_cases_passed: avgPassed,
                    total_test_cases: totalTestCases,
                    max_success_rate: maxSuccess,
                    min_success_rate: minSuccess
                };
            }
        }

        // 6. Leaderboard & Distribution
        const leaderboard = submissions.slice(0, 10).map((s, index) => ({
            rank: index + 1,
            register_number: s.register_number,
            name: s.name,
            score: parseFloat(s.obtained_marks),
            percentage: ((parseFloat(s.obtained_marks) / totalMarks) * 100).toFixed(1)
        }));

        const distribution = { Excellent: 0, Good: 0, Average: 0, Poor: 0 };
        submissions.forEach(s => {
            const pct = (parseFloat(s.obtained_marks) / totalMarks) * 100;
            if (pct >= 80) distribution.Excellent++;
            else if (pct >= 60) distribution.Good++;
            else if (pct >= 40) distribution.Average++;
            else distribution.Poor++;
        });

        // 7. Trend (Last 5)
        let trendQuery = '';
        if (type === 'assignment') {
            trendQuery = `
                SELECT a.title, AVG(s.obtained_marks) as avg_score
                FROM assignments a
                LEFT JOIN submissions s ON a.id = s.assignment_id
                WHERE a.teacher_id = $1
                GROUP BY a.id, a.title, a.created_at
                ORDER BY a.created_at DESC
                LIMIT 5
            `;
        } else {
            trendQuery = `
                SELECT a.title, AVG(s.obtained_marks) as avg_score
                FROM assessments a
                JOIN assignments asg ON a.assignment_id = asg.id
                LEFT JOIN submissions s ON a.id = s.assessment_id
                WHERE asg.teacher_id = $1
                GROUP BY a.id, a.title, a.created_at
                ORDER BY a.created_at DESC
                LIMIT 5
            `;
        }

        const trendRes = await pool.query(trendQuery, [req.teacher.id]);
        const trend = trendRes.rows.reverse().map(t => ({
            name: t.title,
            avg: t.avg_score ? parseFloat(t.avg_score).toFixed(1) : 0
        }));

        res.json({
            leaderboard,
            distribution: [
                { name: 'Excellent', value: distribution.Excellent, fill: '#10b981' },
                { name: 'Good', value: distribution.Good, fill: '#3b82f6' },
                { name: 'Average', value: distribution.Average, fill: '#f59e0b' },
                { name: 'Poor', value: distribution.Poor, fill: '#ef4444' }
            ],
            stats: {
                max: maxScore,
                min: minScore,
                avg: avgScore,
                total_submissions: submissions.length,
                total_enrolled: totalEnrolled,
                submission_pct: submissionPct,
                type: assessmentType || 'General'
            },
            coding_insights: codingInsights,
            trend,
            chart_data: submissions.map(s => ({
                student: s.register_number,
                score: parseFloat(s.obtained_marks)
            })),
            meta: { total_marks: totalMarks }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching dashboard analytics' });
    }
});

module.exports = router;

