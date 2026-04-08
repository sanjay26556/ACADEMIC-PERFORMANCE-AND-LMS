const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get Notifications for Current User
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark Notification as Read
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark All Notifications as Read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
            [req.user.id]
        );
        res.json({ message: 'All marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// -------------------------------------------------------------------------
// ALLOW RETEST (Teacher only) — Grant a terminated student permission to retake
// -------------------------------------------------------------------------
router.post('/retest', authenticateToken, authorizeRole(['teacher']), async (req, res) => {
    const { student_id, assessment_id, notification_id } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get teacher id
        const teacherRes = await client.query('SELECT id FROM teachers WHERE user_id = $1', [req.user.id]);
        if (teacherRes.rows.length === 0) throw new Error('Teacher not found');
        const teacherId = teacherRes.rows[0].id;

        // Verify teacher owns the assessment
        const ownerCheck = await client.query(`
            SELECT a.id FROM assessments a
            JOIN assignments asg ON a.assignment_id = asg.id
            WHERE a.id = $1 AND asg.teacher_id = $2
        `, [assessment_id, teacherId]);
        if (ownerCheck.rows.length === 0) throw new Error('Unauthorized');

        // Delete or update the terminated submission so student can retake
        await client.query(`
            DELETE FROM submissions WHERE assessment_id = $1 AND student_id = $2
        `, [assessment_id, student_id]);

        // Also delete exam session so they can start fresh
        await client.query(`
            DELETE FROM exam_sessions WHERE assessment_id = $1 AND student_id = $2
        `, [assessment_id, student_id]);

        // Mark notification as read
        if (notification_id) {
            await client.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [notification_id]);
        }

        // Notify the student
        const studentRes = await client.query(
            'SELECT u.id as user_id, s.name FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = $1',
            [student_id]
        );
        const assessRes = await client.query('SELECT title FROM assessments WHERE id = $1', [assessment_id]);

        if (studentRes.rows.length > 0 && assessRes.rows.length > 0) {
            await client.query(`
                INSERT INTO notifications (user_id, title, message, is_read, created_at)
                VALUES ($1, $2, $3, FALSE, NOW())
            `, [
                studentRes.rows[0].user_id,
                '✅ Retest Approved',
                `Your teacher has granted you permission to retake the assessment "${assessRes.rows[0].title}". You can now access it from your Assessments page.`
            ]);
        }

        await client.query('COMMIT');
        res.json({ message: 'Retest granted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: err.message || 'Server error granting retest' });
    } finally {
        client.release();
    }
});

module.exports = router;
