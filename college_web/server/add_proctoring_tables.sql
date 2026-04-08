-- Add status column to assessments if not exists
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active';

-- Add negative_marks column to assessment_questions if not exists
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS negative_marks DECIMAL(5,2) DEFAULT 0;

-- Add evaluation_mode column to coding_problems if not exists
ALTER TABLE coding_problems ADD COLUMN IF NOT EXISTS evaluation_mode VARCHAR(20) DEFAULT 'auto';

-- Proctoring Violations Table
CREATE TABLE IF NOT EXISTS proctoring_violations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
    violation_type VARCHAR(50) NOT NULL,   -- 'face_missing', 'multiple_faces', 'tab_switch', 'audio', 'fullscreen_exit', 'copy_paste', 'auto_submit'
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam Sessions Table (track start/end of each attempt)
CREATE TABLE IF NOT EXISTS exam_sessions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',  -- 'active', 'submitted', 'terminated'
    violation_count INTEGER DEFAULT 0,
    termination_reason TEXT
);
