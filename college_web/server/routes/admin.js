const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Create User (Admin Only)
router.post('/create-user', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const { register_number, role, dob, name, email, department } = req.body;

    if (!register_number || !role || !dob || !name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE register_number = $1', [register_number]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash Password (use provided password or DOB)
        const passwordToHash = req.body.password || dob;
        const passwordHash = await bcrypt.hash(passwordToHash, 10);

        // Start transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insert into users table
            const userRes = await client.query(
                'INSERT INTO users (register_number, password_hash, role, dob, first_login) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [register_number, passwordHash, role, dob, true]
            );
            const userId = userRes.rows[0].id;

            // Get Department ID if applicable (Optional now)
            let deptId = null;
            if (department) {
                const deptRes = await client.query('SELECT id FROM departments WHERE name = $1', [department]);
                if (deptRes.rows.length > 0) {
                    deptId = deptRes.rows[0].id;
                }
            }

            // Insert into specific role table
            if (role === 'student') {
                await client.query(
                    'INSERT INTO students (user_id, name, email, department_id) VALUES ($1, $2, $3, $4)',
                    [userId, name, email || null, deptId]
                );
            } else if (role === 'teacher') {
                await client.query(
                    'INSERT INTO teachers (user_id, name, email, department_id) VALUES ($1, $2, $3, $4)',
                    [userId, name, email || null, deptId]
                );
            }

            await client.query('COMMIT');
            console.log(`User created: ${register_number}, Role: ${role}, DOB: ${dob}`);
            res.status(201).json({ message: 'User created successfully', user_id: userId });
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

// Get All Users (Students & Teachers)
router.get('/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const students = await pool.query(`
            SELECT u.id, u.register_number, s.name, s.email, d.name as department, 'student' as role 
            FROM users u 
            JOIN students s ON u.id = s.user_id 
            LEFT JOIN departments d ON s.department_id = d.id
        `);
        const teachers = await pool.query(`
            SELECT u.id, u.register_number, t.name, t.email, d.name as department, 'teacher' as role 
            FROM users u 
            JOIN teachers t ON u.id = t.user_id
            LEFT JOIN departments d ON t.department_id = d.id
        `);

        res.json([...students.rows, ...teachers.rows]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete User
router.delete('/users/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Platform Analytics
router.get('/analytics', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const studentCount = await pool.query('SELECT COUNT(*) FROM students');
        const teacherCount = await pool.query('SELECT COUNT(*) FROM teachers');
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        const deptCount = await pool.query('SELECT COUNT(*) FROM departments'); // Approximating reach

        // Mock revenue for now as we don't have payments table
        // But let's return structure matching frontend
        const data = {
            totalRevenue: 12500000,
            activeUsers: parseInt(userCount.rows[0].count),
            serverLoad: 42, // Mock system metric
            globalReach: parseInt(deptCount.rows[0].count), // Using depts as proxy for now
            userGrowth: [
                { month: "Jan", students: 100, teachers: 5 },
                { month: "Feb", students: parseInt(studentCount.rows[0].count), teachers: parseInt(teacherCount.rows[0].count) }
            ],
            // ... other mock data if needed or keep frontend defaults for complex charts
        };
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Departments
router.get('/departments', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM departments');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
