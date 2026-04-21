const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Middleware to get Teacher ID
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

// AI Assignment Generation (Teacher Only)
router.post('/generate-ai', authorizeRole(['teacher']), async (req, res) => {
    const { prompt, category } = req.body;
    
    // Quick keyword-based validation layer (as requested)
    const NON_ACADEMIC_KEYWORDS = ['joke', 'movie', 'song', 'weather', 'sports', 'politics', 'entertainment', 'recipe', 'dance', 'casual', 'hello', 'hi'];
    const hasNonAcademic = NON_ACADEMIC_KEYWORDS.some(word => prompt.toLowerCase().includes(word));
    
    if (hasNonAcademic) {
        return res.json({ 
            error: "This assistant is designed only for educational and assignment-related content. Please enter a valid academic query." 
        });
    }

    try {
        if (!process.env.GEMINI_API_KEY) {
             // Mock response for demo purposes if no API key is provided
             return res.json({
                 title: `Generated ${category || 'Academic'} Assignment`,
                 description: `This is an auto-generated assignment based on your prompt: "${prompt}".\n\n**Instructions:**\n1. Analyze the problem statement.\n2. Write your solution.\n3. Verify against constraints.\n\n*Note: Add GEMINI_API_KEY to your .env to get real AI-generated content.*`,
             });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // We use gemini-1.5-flash for faster generation, or 1.5-pro
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const formatInstructions = category === 'Coding' 
            ? 'Format must include: Title, Problem Statement, Input Format, Output Format, Constraints, Sample Input/Output, Difficulty Level.'
            : category === 'Aptitude' 
            ? 'Format must include: Title, Questions (multiple), Answers, Explanation.'
            : 'Format must include: Title, Description, Tasks / Questions, Reference material (optional).';

        const systemPrompt = `You are an academic assistant designed to generate assignment content only. You can create coding assignments, aptitude questions, and subject-oriented academic tasks.

If the user asks anything unrelated to education, respond ONLY with the exact phrase:
"This assistant is designed only for educational and assignment-related content. Please enter a valid academic query."

Generate structured, clean, and ready-to-use assignment content.
Output strictly as a JSON object with two keys: "title" (string) and "description" (string containing the formatted markdown content).
${formatInstructions}

Category: ${category}
User Prompt: ${prompt}`;

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();
        
        // try to parse JSON
        try {
             let cleanStr = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
             const data = JSON.parse(cleanStr);
             return res.json(data);
        } catch(e) {
            if(responseText.includes("This assistant is designed only")) {
                return res.json({ error: "This assistant is designed only for educational and assignment-related content. Please enter a valid academic query." });
            }
            return res.json({ title: `${category || 'Generated'} Assignment`, description: responseText });
        }
        
    } catch (error) {
        console.error("AI Generation Error", error);
        let errorMsg = "Failed to generate assignment.";
        if (error.message && error.message.includes("503")) {
            errorMsg = "Google API is experiencing high demand. Please try again in a few seconds.";
        }
        res.json({ error: errorMsg });
    }
});

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
