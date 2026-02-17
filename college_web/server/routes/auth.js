const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

// Login Route
// Login Route
router.post('/login', async (req, res) => {
    const { register_number, password } = req.body;
    const validator = require('validator');

    try {
        let userId;
        console.log("Login attempt:", { register_number, password }); // DEBUG LOG

        // Check if input is email
        if (validator.isEmail(register_number)) {
            // Try matching teacher email
            const teacherRes = await pool.query('SELECT user_id FROM teachers WHERE email = $1', [register_number]);
            if (teacherRes.rows.length > 0) {
                userId = teacherRes.rows[0].user_id;
            } else {
                // Try matching student email
                const studentRes = await pool.query('SELECT user_id FROM students WHERE email = $1', [register_number]);
                if (studentRes.rows.length > 0) {
                    userId = studentRes.rows[0].user_id;
                } else {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
            }
        } else {
            // Treat as register number
            const userRes = await pool.query('SELECT id FROM users WHERE register_number = $1', [register_number]);
            if (userRes.rows.length > 0) {
                userId = userRes.rows[0].id;
            } else {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        }

        // Fetch User with ID
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        console.log("User found:", user.register_number, user.role); // DEBUG LOG

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        console.log("Password valid:", validPassword); // DEBUG LOG

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role, first_login: user.first_login },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                register_number: user.register_number,
                role: user.role,
                first_login: user.first_login
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change Password Route (Required for First Login)
router.post('/change-password', authenticateToken, async (req, res) => {
    const { new_password } = req.body;
    const userId = req.user.id;

    if (!new_password || new_password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        const hashedPassword = await bcrypt.hash(new_password, 10);

        await pool.query(
            'UPDATE users SET password_hash = $1, first_login = FALSE WHERE id = $2',
            [hashedPassword, userId]
        );

        res.json({ message: 'Password updated successfully. Please login again.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
