require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Database Connection check
const pool = require('./db');

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/teacher', require('./routes/teacher'));
app.use('/student', require('./routes/student'));
app.use('/notifications', require('./routes/notifications'));
app.use('/assignments', require('./routes/assignments'));
app.use('/assessments', require('./routes/assessments'));

app.get('/', (req, res) => {
    res.send('EduPulse API is running');
});

// Start Server
// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
