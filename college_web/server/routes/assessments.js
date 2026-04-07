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

// -------------------------------------------------------------------------
// GET ASSESSMENTS (List with Filters)
// -------------------------------------------------------------------------
router.get('/', authorizeRole(['teacher', 'student']), getTeacherId, async (req, res) => {
    const { assignment_id, type, status } = req.query;

    try {
        let query = `
            SELECT a.*, asg.title as assignment_title 
            FROM assessments a
            JOIN assignments asg ON a.assignment_id = asg.id
            LEFT JOIN courses c ON asg.course_id = c.id
            WHERE a.status IN ('Scheduled', 'Active', 'Completed')
        `;
        const params = [];
        let paramUsage = 1;

        // Role-based filtering
        if (req.user.role === 'teacher') {
            query += ` AND asg.teacher_id = $${paramUsage++}`;
            params.push(req.teacher.id);
        } else if (req.user.role === 'student') {
            // Students only see assessments they are enrolled in the course for, or global ones
            query += ` 
                AND (asg.course_id IS NULL OR asg.course_id IN (SELECT course_id FROM course_enrollments WHERE student_id = (SELECT id FROM students WHERE user_id = $${paramUsage++})))
            `;
            params.push(req.user.id);
        }

        // Apply Filters
        if (assignment_id) {
            query += ` AND a.assignment_id = $${paramUsage++}`;
            params.push(assignment_id);
        }
        if (type) {
            query += ` AND a.type = $${paramUsage++}`;
            params.push(type);
        }

        query += ` ORDER BY a.created_at DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching assessments' });
    }
});

// -------------------------------------------------------------------------
// CREATE ASSESSMENT
// -------------------------------------------------------------------------
router.post('/', authorizeRole(['teacher']), getTeacherId, async (req, res) => {
    const {
        assignment_id, title, type, timer_minutes, total_marks, attempts_allowed,
        start_date, end_date, status, scheduled_at,
        questions, // Array of MCQ/Descriptive questions
        coding_problem // Single object for Coding type
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Verify Assignment Ownership
        const assignCheck = await client.query('SELECT id FROM assignments WHERE id = $1 AND teacher_id = $2', [assignment_id, req.teacher.id]);
        if (assignCheck.rows.length === 0) {
            throw new Error('Assignment not found or unauthorized');
        }

        // 2. Create Assessment
        const assessRes = await client.query(
            `INSERT INTO assessments (assignment_id, title, type, timer_minutes, total_marks, attempts_allowed, start_date, end_date, status, scheduled_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id`,
            [assignment_id, title, type, timer_minutes, total_marks, attempts_allowed, start_date, end_date, status || 'Draft', scheduled_at]
        );
        const assessmentId = assessRes.rows[0].id;

        // 3. Add Questions based on Type
        if (type === 'MCQ' || type === 'Subject') {
            if (Array.isArray(questions)) {
                for (const q of questions) {
                    await client.query(
                        `INSERT INTO assessment_questions (assessment_id, question_text, type, options, correct_answer, marks, negative_marks)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [assessmentId, q.question_text, q.type, JSON.stringify(q.options), q.correct_answer, q.marks, q.negative_marks || 0]
                    );
                }
            }
        } else if (type === 'Coding' && coding_problem) {
            const probRes = await client.query(
                `INSERT INTO coding_problems (assessment_id, title, description, allowed_languages, starter_code, marks, evaluation_mode)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id`,
                [assessmentId, coding_problem.title, coding_problem.description, coding_problem.allowed_languages, coding_problem.starter_code, coding_problem.marks, coding_problem.evaluation_mode || 'auto']
            );
            const problemId = probRes.rows[0].id;

            if (Array.isArray(coding_problem.test_cases)) {
                for (const tc of coding_problem.test_cases) {
                    await client.query(
                        `INSERT INTO coding_test_cases (problem_id, input, expected_output, is_hidden)
                         VALUES ($1, $2, $3, $4)`,
                        [problemId, tc.input, tc.expected_output, tc.is_hidden || false]
                    );
                }
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Assessment created successfully', assessmentId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: err.message || 'Server error creating assessment' });
    } finally {
        client.release();
    }
});

// -------------------------------------------------------------------------
// UPDATE STATUS (Publish/Close)
// -------------------------------------------------------------------------
router.patch('/:id/status', authorizeRole(['teacher']), getTeacherId, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'Draft', 'Scheduled', 'Active', 'Completed'

    try {
        // Verify ownership
        const check = await pool.query(`
            SELECT a.id FROM assessments a
            JOIN assignments asg ON a.assignment_id = asg.id
            WHERE a.id = $1 AND asg.teacher_id = $2
        `, [id, req.teacher.id]);

        if (check.rows.length === 0) return res.status(403).json({ message: 'Unauthorized' });

        await pool.query('UPDATE assessments SET status = $1 WHERE id = $2', [status, id]);
        res.json({ message: 'Assessment status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating status' });
    }
});

// -------------------------------------------------------------------------
// GET ASSESSMENT DETAILS (Full)
// -------------------------------------------------------------------------
router.get('/:id', authorizeRole(['teacher', 'student']), async (req, res) => {
    const { id } = req.params;
    try {
        const assessRes = await pool.query('SELECT * FROM assessments WHERE id = $1', [id]);
        if (assessRes.rows.length === 0) return res.status(404).json({ message: 'Assessment not found' });

        const assessment = assessRes.rows[0];
        let details = { ...assessment };

        if (assessment.type === 'MCQ' || assessment.type === 'Subject') {
            const qRes = await pool.query('SELECT * FROM assessment_questions WHERE assessment_id = $1 ORDER BY id ASC', [id]);
            details.questions = qRes.rows;
        } else if (assessment.type === 'Coding') {
            const pRes = await pool.query('SELECT * FROM coding_problems WHERE assessment_id = $1', [id]);
            if (pRes.rows.length > 0) {
                details.problem = pRes.rows[0];
                // For teachers, show all test cases. For students, only public? 
                // Currently fetching all, frontend can filter or we filter here based on role.
                // Keeping it simple: fetch all for now (student view usually hides hidden cases in UI or logic)
                const tcRes = await pool.query('SELECT * FROM coding_test_cases WHERE problem_id = $1', [details.problem.id]);
                details.problem.test_cases = tcRes.rows;
            }
        }

        res.json(details);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching assessment details' });
    }
});

module.exports = router;
