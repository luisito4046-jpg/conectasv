import { pool } from '../config/db.js';

export const findApplicationsByJob = async (jobId) => {
    const result = await pool.query(
        `SELECT a.*,
                u.first_name, u.last_name, u.email, u.phone,
                u.location, u.bio, u.role, u.skills, u.cv_url
         FROM applications a
         JOIN users u ON a.candidate_id = u.id
         WHERE a.job_id = $1
         ORDER BY a.applied_at DESC`,
        [jobId]
    );
    return result.rows;
};

export const findApplicationsByCandidate = async (candidateId) => {
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
        [candidateId]
    );
    return result.rows;
};

export const findExistingApplication = async (job_id, candidate_id) => {
    const result = await pool.query(
        'SELECT id FROM applications WHERE job_id=$1 AND candidate_id=$2',
        [job_id, candidate_id]
    );
    return result.rows[0] ?? null;
};

export const insertApplication = async ({ job_id, candidate_id, cover_letter }) => {
    const result = await pool.query(
        `INSERT INTO applications (job_id, candidate_id, cover_letter)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [job_id, candidate_id, cover_letter ?? null]
    );
    return result.rows[0];
};

export const patchApplicationStatus = async (id, status) => {
    const result = await pool.query(
        `UPDATE applications
         SET status=$1, updated_at=CURRENT_TIMESTAMP
         WHERE id=$2
         RETURNING *`,
        [status, id]
    );
    return result.rows[0] ?? null;
};

export const findApplicationById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM applications WHERE id=$1',
        [id]
    );
    return result.rows[0] ?? null;
};

export const removeApplication = async (id) => {
    await pool.query('DELETE FROM applications WHERE id=$1', [id]);
};
