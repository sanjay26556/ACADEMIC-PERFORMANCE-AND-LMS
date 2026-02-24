const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Middleware to get Student ID
const getStudentId = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, department_id, current_semester FROM students WHERE user_id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            console.log("getStudentId 403: Student profile not found for user_id", req.user.id);
            return res.status(403).json({ message: 'Student profile not found' });
        }
        req.student = result.rows[0];
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

router.use(authenticateToken, authorizeRole(['student']), getStudentId);

// Get My Overview Stats
router.get('/overview', async (req, res) => {
    try {
        // Attendance Percentage
        const attendanceRes = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'Present') as present,
                COUNT(*) as total
            FROM attendance 
            WHERE student_id = $1
        `, [req.student.id]);

        // Failed Subjects (Marks < 50% as example)
        const failedRes = await pool.query(`
            SELECT COUNT(DISTINCT course_id) as failed_count
            FROM marks
            WHERE student_id = $1 AND (marks_obtained / max_marks) < 0.5
        `, [req.student.id]);

        res.json({
            attendance: attendanceRes.rows[0],
            failed_subjects: failedRes.rows[0].failed_count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Enrolled Courses
router.get('/courses', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, t.name as teacher_name 
            FROM courses c
            JOIN course_enrollments ce ON c.id = ce.course_id
            LEFT JOIN teachers t ON c.teacher_id = t.id
            WHERE ce.student_id = $1
            ORDER BY c.created_at DESC
        `, [req.student.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get My Attendance
router.get('/attendance', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, c.name as subject_name, c.code as subject_code
            FROM attendance a
            JOIN courses c ON a.course_id = c.id
            WHERE a.student_id = $1
            ORDER BY a.date DESC
        `, [req.student.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get My Marks
router.get('/marks', async (req, res) => {
    const { semester } = req.query;
    try {
        let query = `
            SELECT m.*, c.name as subject_name, c.code as subject_code
            FROM marks m
            JOIN courses c ON m.course_id = c.id
            WHERE m.student_id = $1
        `;
        const params = [req.student.id];

        if (semester) {
            query += ` AND c.semester = $2`;
            params.push(semester);
        } else {
            // By default maybe show current semester? 
            // Or let frontend filter.
            // But requirement says "When semester selected -> Show 6 subjects for that sem".
        }

        query += ` ORDER BY c.code, m.exam_type`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get My Timetable
router.get('/timetable', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.*, c.name as subject_name
            FROM timetables t
            JOIN courses c ON t.course_id = c.id
            JOIN course_enrollments ce ON c.id = ce.course_id
            WHERE ce.student_id = $1
            ORDER BY t.day_of_week, t.start_time
        `, [req.student.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Dashboard Aggregated Data
router.get('/dashboard', async (req, res) => {
    try {
        // Attendance
        const attendanceRes = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'Present') as present,
                COUNT(*) as total
            FROM attendance 
            WHERE student_id = $1
        `, [req.student.id]);

        const present = parseInt(attendanceRes.rows[0].present);
        const total = parseInt(attendanceRes.rows[0].total);
        const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;

        // CGPA (Mock calculation based on marks)
        const marksRes = await pool.query(`
            SELECT AVG(marks_obtained / max_marks) as avg_score
            FROM marks
            WHERE student_id = $1
        `, [req.student.id]);
        const avgScore = parseFloat(marksRes.rows[0].avg_score) || 0;
        const cgpa = (avgScore * 10).toFixed(1); // Rough estimate

        res.json({
            hasData: true,
            profile: {
                name: req.student.name,
                department: req.student.department_id, // Fetch name if needed, using ID for now or join
                semester: req.student.current_semester
            },
            stats: {
                attendance: attendancePercentage,
                cgpa: cgpa
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
