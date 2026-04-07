require('dotenv').config({ override: true });
const pool = require('./db');

const migrate = async () => {
    try {
        console.log('Starting migration to Course-Based System...');

        // 1. Drop dependent tables to clear old data
        await pool.query('DROP TABLE IF EXISTS marks CASCADE');
        await pool.query('DROP TABLE IF EXISTS attendance CASCADE');
        await pool.query('DROP TABLE IF EXISTS timetables CASCADE');
        await pool.query('DROP TABLE IF EXISTS teacher_students CASCADE');
        await pool.query('DROP TABLE IF EXISTS subjects CASCADE');

        console.log('Dropped old academic tables.');

        // 2. Create "courses" table
        await pool.query(`
            CREATE TABLE courses (
                id SERIAL PRIMARY KEY,
                teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(20) NOT NULL,
                year VARCHAR(10) NOT NULL, 
                semester VARCHAR(10) NOT NULL,
                section VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created courses table.');

        // 3. Create "course_enrollments" table
        await pool.query(`
            CREATE TABLE course_enrollments (
                id SERIAL PRIMARY KEY,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
                enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(course_id, student_id)
            );
        `);
        console.log('Created course_enrollments table.');

        // 4. Re-create "marks" table with course_id
        await pool.query(`
            CREATE TABLE marks (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                exam_type VARCHAR(50) NOT NULL,
                marks_obtained DECIMAL(5,2),
                max_marks DECIMAL(5,2) DEFAULT 100,
                is_absent BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, course_id, exam_type)
            );
        `);
        console.log('Created marks table.');

        // 5. Re-create "attendance" table with course_id
        await pool.query(`
            CREATE TABLE attendance (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                status VARCHAR(10) CHECK (status IN ('Present', 'Absent', 'On Duty')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, course_id, date)
            );
        `);
        console.log('Created attendance table.');

        // 6. Timetable
        await pool.query(`
            CREATE TABLE timetables (
                id SERIAL PRIMARY KEY,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                day_of_week VARCHAR(10) NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                room_number VARCHAR(20)
            );
        `);
        console.log('Created timetables table.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
