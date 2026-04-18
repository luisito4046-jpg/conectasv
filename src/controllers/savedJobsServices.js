import { pool } from '../db.js';

export const getSavedJobsByUser = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT sj.*, j.title, j.location, j.type, j.level, j.company_id,
                    c.name AS company_name, c.logo AS company_logo,
                    j.description
             FROM saved_jobs sj
             JOIN jobs j ON sj.job_id = j.id
             JOIN companies c ON j.company_id = c.id
             WHERE sj.user_id = $1
             ORDER BY sj.saved_at DESC`,
            [req.params.userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createSavedJob = async (req, res) => {
    try {
        const { user_id, job_id } = req.body;
        if (!user_id || !job_id) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        const existing = await pool.query(
            'SELECT job_id FROM saved_jobs WHERE user_id=$1 AND job_id=$2',
            [user_id, job_id]
        );
        if (existing.rowCount > 0) {
            return res.status(409).json({ error: 'Ya tienes este empleo guardado' });
        }

        const result = await pool.query(
            `INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) RETURNING *`,
            [user_id, job_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteSavedJob = async (req, res) => {
    try {
        const { userId, jobId } = req.params;
        const result = await pool.query(
            'DELETE FROM saved_jobs WHERE user_id=$1 AND job_id=$2 RETURNING *',
            [userId, jobId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Empleo guardado no encontrado' });
        }
        res.json({ message: 'Empleo eliminado de guardados', savedJob: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
