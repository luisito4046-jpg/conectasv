import { pool } from '../config/db.js';

export const findSavedJobsByUser = async (userId) => {
    const result = await pool.query(
        `SELECT sj.*, j.title, j.location, j.type, j.level, j.company_id,
                c.name AS company_name, c.logo AS company_logo,
                j.description
         FROM saved_jobs sj
         JOIN jobs j ON sj.job_id = j.id
         JOIN companies c ON j.company_id = c.id
         WHERE sj.user_id = $1
         ORDER BY sj.saved_at DESC`,
        [userId]
    );
    return result.rows;
};

export const findExistingSavedJob = async (user_id, job_id) => {
    const result = await pool.query(
        'SELECT job_id FROM saved_jobs WHERE user_id=$1 AND job_id=$2',
        [user_id, job_id]
    );
    return result.rows[0] ?? null;
};

export const insertSavedJob = async (user_id, job_id) => {
    const result = await pool.query(
        'INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) RETURNING *',
        [user_id, job_id]
    );
    return result.rows[0];
};

export const removeSavedJob = async (userId, jobId) => {
    const result = await pool.query(
        'DELETE FROM saved_jobs WHERE user_id=$1 AND job_id=$2 RETURNING *',
        [userId, jobId]
    );
    return result.rows[0] ?? null;
};
