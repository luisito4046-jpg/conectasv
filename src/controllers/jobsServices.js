import { pool } from '../db.js';

// ── OBTENER TODOS LOS EMPLEOS (activos, con datos de empresa) ─
export const getAllJobs = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT j.*,
                    c.name AS company_name, c.logo AS company_logo,
                    c.industry AS company_industry, c.verified AS company_verified,
                    c.location AS company_location,
                    u.first_name AS poster_first, u.last_name AS poster_last, u.email AS poster_email,
                    (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count
             FROM jobs j
             JOIN companies c ON c.id = j.company_id
             LEFT JOIN users u ON u.id = j.posted_by
             ORDER BY j.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── OBTENER EMPLEO POR ID ────────────────────────────────────
export const getJobById = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT j.*,
                    c.name AS company_name, c.logo AS company_logo,
                    c.industry AS company_industry, c.verified AS company_verified,
                    c.location AS company_location,
                    u.first_name AS poster_first, u.last_name AS poster_last, u.email AS poster_email
             FROM jobs j
             JOIN companies c ON c.id = j.company_id
             LEFT JOIN users u ON u.id = j.posted_by
             WHERE j.id = $1`,
            [req.params.id]
        );
        const job = result.rows[0] || null;
        if (!job) return res.status(404).json({ error: 'Empleo no encontrado' });
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── OBTENER EMPLEOS POR EMPLOYER (via companies que posee) ───
export const getJobsByEmployer = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT j.*,
                    c.name AS company_name, c.logo AS company_logo,
                    (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count
             FROM jobs j
             JOIN companies c ON c.id = j.company_id
             WHERE c.owner_id = $1
             ORDER BY j.created_at DESC`,
            [req.params.employerId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── CREAR EMPLEO ─────────────────────────────────────────────
export const createJob = async (req, res) => {
    try {
        const {
            company_id, posted_by, title, area, type, level,
            salary_min, salary_max, currency, location, remote,
            requirements, description, benefits, contact, featured
        } = req.body;

        const query = `
            INSERT INTO jobs
                (company_id, posted_by, title, area, type, level,
                 salary_min, salary_max, currency, location, remote,
                 requirements, description, benefits, contact, featured)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            RETURNING *;`;

        const result = await pool.query(query, [
            company_id, posted_by, title, area || null, type || 'full', level || 'mid',
            salary_min || null, salary_max || null, currency || 'USD',
            location || null, remote || false,
            requirements || null, description, benefits || null,
            contact || null, featured || false
        ]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── ACTUALIZAR EMPLEO ────────────────────────────────────────
export const updateJob = async (req, res) => {
    try {
        // Si solo se manda status, hacer update parcial
        if (Object.keys(req.body).length === 1 && req.body.status) {
            const result = await pool.query(
                'UPDATE jobs SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *',
                [req.body.status, req.params.id]
            );
            if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrado' });
            return res.json(result.rows[0]);
        }

        const {
            title, area, type, level, salary_min, salary_max,
            location, remote, requirements, description,
            benefits, contact, status, featured
        } = req.body;

        const query = `
            UPDATE jobs
            SET title=$1, area=$2, type=$3, level=$4, salary_min=$5, salary_max=$6,
                location=$7, remote=$8, requirements=$9, description=$10,
                benefits=$11, contact=$12, status=$13, featured=$14,
                updated_at=CURRENT_TIMESTAMP
            WHERE id=$15
            RETURNING *;`;

        const result = await pool.query(query, [
            title, area, type, level, salary_min, salary_max,
            location, remote, requirements, description,
            benefits, contact, status, featured, req.params.id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Empleo no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── ELIMINAR EMPLEO ──────────────────────────────────────────
export const deleteJob = async (req, res) => {
    try {
        const existing = await pool.query('SELECT * FROM jobs WHERE id=$1', [req.params.id]);
        if (existing.rowCount === 0) {
            return res.status(404).json({ error: 'Empleo no encontrado' });
        }
        await pool.query('DELETE FROM jobs WHERE id=$1', [req.params.id]);
        res.json({ message: 'Empleo eliminado correctamente', job: existing.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
