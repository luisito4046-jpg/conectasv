import { pool } from '../db.js';

// ── OBTENER POSTULACIONES POR EMPLEO ─────────────────────────
export const getApplicationsByJob = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*,
                    u.first_name, u.last_name, u.email, u.phone,
                    u.location, u.bio, u.role, u.skills, u.cv_url
             FROM applications a
             JOIN users u ON a.candidate_id = u.id
             WHERE a.job_id = $1
             ORDER BY a.applied_at DESC`,
            [req.params.jobId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── OBTENER POSTULACIONES POR CANDIDATO ──────────────────────
export const getApplicationsByCandidate = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*,
                    j.title AS job_title, j.location AS job_location,
                    j.type AS job_type, j.status AS job_status,
                    c.name AS company_name, c.logo AS company_logo
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN companies c ON c.id = j.company_id
             WHERE a.candidate_id = $1
             ORDER BY a.applied_at DESC`,
            [req.params.candidateId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── CREAR POSTULACIÓN ────────────────────────────────────────
export const createApplication = async (req, res) => {
    try {
        const { job_id, candidate_id, cover_letter } = req.body;

        // Verificar que no exista ya una postulación
        const existing = await pool.query(
            'SELECT id FROM applications WHERE job_id=$1 AND candidate_id=$2',
            [job_id, candidate_id]
        );
        if (existing.rowCount > 0) {
            return res.status(409).json({ error: 'Ya te postulaste a este empleo' });
        }

        const query = `
            INSERT INTO applications (job_id, candidate_id, cover_letter)
            VALUES ($1, $2, $3)
            RETURNING *;`;

        const result = await pool.query(query, [job_id, candidate_id, cover_letter || null]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── ACTUALIZAR ESTADO DE POSTULACIÓN ─────────────────────────
export const updateApplicationStatus = async (req, res) => {
    try {
        const query = `
            UPDATE applications
            SET status=$1, updated_at=CURRENT_TIMESTAMP
            WHERE id=$2
            RETURNING *;`;

        const result = await pool.query(query, [req.body.status, req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Postulación no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── ELIMINAR POSTULACIÓN ─────────────────────────────────────
export const deleteApplication = async (req, res) => {
    try {
        const existing = await pool.query('SELECT * FROM applications WHERE id=$1', [req.params.id]);
        if (existing.rowCount === 0) {
            return res.status(404).json({ error: 'Postulación no encontrada' });
        }
        await pool.query('DELETE FROM applications WHERE id=$1', [req.params.id]);
        res.json({ message: 'Postulación eliminada', application: existing.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
