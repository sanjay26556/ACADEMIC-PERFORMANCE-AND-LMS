const pool = require('./db.js');

async function seedDepartments() {
    const depts = [
        "CSE (Computer Science & Engineering)",
        "ECE (Electronics & Communication Engineering)",
        "EEE (Electrical & Electronics Engineering)",
        "Mechanical Engineering",
        "Aeronautical Engineering",
        "Biomedical Engineering",
        "Architecture"
    ];

    try {
        await pool.query('DELETE FROM departments'); // Clear if any but it's empty
        for (let i = 0; i < depts.length; i++) {
            await pool.query('INSERT INTO departments (id, name, code) VALUES ($1, $2, $3)', [i + 1, depts[i], depts[i].split(' ')[0]]);
        }
        console.log("Departments seeded successfully");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

seedDepartments();
