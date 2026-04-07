const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Middleware to get Teacher ID
const getTeacherId = async (req, res, next) => {
    try {
        if (req.user.role !== 'teacher') return next();
        const result = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(403).json({ message: 'Teacher profile not found' });
        req.teacher = result.rows[0];
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

router.use(authenticateToken);

// Create Assignment (Teacher Only)
router.post('/', authorizeRole(['teacher']), getTeacherId, async (req, res) => {
    const { title, description, category, difficulty_level, material_url, video_url, due_date, total_marks, course_id } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO assignments 
            (teacher_id, course_id, title, description, category, difficulty_level, material_url, video_url, due_date, total_marks) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [req.teacher.id, course_id || null, title, description, category, difficulty_level, material_url, video_url, due_date, total_marks]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating assignment' });
    }
});

// Get Assignments
router.get('/', async (req, res) => {
    try {
        let query = `
            SELECT a.*, c.name as course_name, c.code as course_code 
            FROM assignments a
            LEFT JOIN courses c ON a.course_id = c.id
        `;
        const params = [];

        if (req.user.role === 'teacher') {
            // Get assignments created by this teacher
            const teacherRes = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [req.user.id]);
            if (teacherRes.rows.length > 0) {
                query += ` WHERE a.teacher_id = $1`;
                params.push(teacherRes.rows[0].id);
            }
        } else if (req.user.role === 'student') {
            // Get assignments for courses the student is enrolled in
            const studentRes = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
            if (studentRes.rows.length > 0) {
                const studentId = studentRes.rows[0].id;
                query = `
                    SELECT a.*, c.name as course_name, c.code as course_code,
                    COALESCE(sub.status, CASE WHEN a.due_date < CURRENT_TIMESTAMP THEN 'Overdue' ELSE 'Pending' END) as status
                    FROM assignments a
                    LEFT JOIN courses c ON a.course_id = c.id
                    LEFT JOIN submissions sub ON a.id = sub.assignment_id AND sub.student_id = $1
                    WHERE a.course_id IN (
                        SELECT course_id FROM course_enrollments WHERE student_id = $1
                    ) OR a.course_id IS NULL
                 `;
                params.push(studentId);
            }
        }

        query += ` ORDER BY a.created_at DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching assignments' });
    }
});

// Delete Assignment
router.delete('/:id', authorizeRole(['teacher']), getTeacherId, async (req, res) => {
    const { id } = req.params;
    try {
        const check = await pool.query('SELECT id FROM assignments WHERE id = $1 AND teacher_id = $2', [id, req.teacher.id]);
        if (check.rows.length === 0) return res.status(403).json({ message: 'Unauthorized or not found' });

        await pool.query('DELETE FROM assignments WHERE id = $1', [id]);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting assignment' });
    }
});

// Submit Assignment (Student Only)
router.post('/:id/submit', authorizeRole(['student']), async (req, res) => {
    const { id } = req.params;
    try {
        const studentRes = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
        if (studentRes.rows.length === 0) return res.status(403).json({ message: 'Student profile not found' });
        const studentId = studentRes.rows[0].id;

        // Check if already submitted
        const check = await pool.query('SELECT id FROM submissions WHERE assignment_id = $1 AND student_id = $2', [id, studentId]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: 'Assignment already submitted' });
        }

        // Insert submission
        await pool.query(
            'INSERT INTO submissions (assignment_id, student_id, status) VALUES ($1, $2, $3)',
            [id, studentId, 'Submitted']
        );

        res.json({ message: 'Assignment submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error submitting assignment' });
    }
});

module.exports = router;
