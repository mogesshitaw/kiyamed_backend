import pool from "../config/db.js";

export const createAplication=  async (req, res) => {
   const { fullName, email, phone, program, education, experience } = req.body;

    if (!fullName || !email || !phone || !program || !education) {
        return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    try {
        const conn = await pool.getConnection();
        const [result] = await conn.query(
            `INSERT INTO applications (fullName, email, phone, program, education, experience)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [fullName, email, phone, program, education, experience]
        );
    
        res.json({ message: 'Application submitted successfully!' });
            conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
}

export const getApply= async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [rows] = await conn.query(`SELECT * FROM applications ORDER BY created_at DESC`);
        conn.release();

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
}