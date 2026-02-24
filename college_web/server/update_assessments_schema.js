const pool = require('./db');

const updateSchema = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Updating assessments table...');
        // Add status if not exists
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='status') THEN 
                    ALTER TABLE assessments ADD COLUMN status VARCHAR(20) DEFAULT 'Draft';
                    ALTER TABLE assessments ADD CONSTRAINT assessments_status_check CHECK (status IN ('Draft', 'Scheduled', 'Active', 'Completed'));
                END IF;
            END $$;
        `);

        // Add scheduled_at if not exists
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='scheduled_at') THEN 
                    ALTER TABLE assessments ADD COLUMN scheduled_at TIMESTAMP;
                END IF;
            END $$;
        `);

        console.log('Updating assessment_questions table...');
        // Add negative_marks if not exists
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessment_questions' AND column_name='negative_marks') THEN 
                    ALTER TABLE assessment_questions ADD COLUMN negative_marks DECIMAL(5,2) DEFAULT 0.0;
                END IF;
            END $$;
        `);

        // Update Check Constraint for Question Type
        // We have to drop the old constraint and add a new one to support 'Descriptive'
        // First, find the constraint name if we don't know it, but usually standard naming applies. 
        // Or we can just try to drop it.
        await client.query(`
            ALTER TABLE assessment_questions DROP CONSTRAINT IF EXISTS assessment_questions_type_check;
            ALTER TABLE assessment_questions ADD CONSTRAINT assessment_questions_type_check CHECK (type IN ('MCQ', 'TrueFalse', 'ShortAnswer', 'Descriptive'));
        `);

        console.log('Update coding_problems table...');
        // Add language restriction column if strictly needed? Schema already has allowed_languages.
        // checking if we need anything else. 
        // "Evaluation Mode" requested. Let's add 'evaluation_mode'.
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coding_problems' AND column_name='evaluation_mode') THEN 
                    ALTER TABLE coding_problems ADD COLUMN evaluation_mode VARCHAR(20) DEFAULT 'auto' CHECK (evaluation_mode IN ('auto', 'manual'));
                END IF;
            END $$;
        `);

        await client.query('COMMIT');
        console.log('✅ Schema updated successfully for Assessments features.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error updating schema:', err);
    } finally {
        client.release();
        pool.end();
    }
};

updateSchema();
