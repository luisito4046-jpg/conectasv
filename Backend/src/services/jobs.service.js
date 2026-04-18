import { pool } from '../db.js';

const JOB_SELECT_FULL = `
    SELECT j.*,
           c.name AS company_name, c.logo AS company_logo,
           c.industry AS company_industry, c.verified AS company_verified,
           c.location AS company_location,
           u.first_name AS poster_first, u.last_name AS poster_last, u.email AS poster_email
    FROM jobs j
    JOIN companies c ON c.id = j.company_id
    LEFT JOIN users u ON u.id = j.posted_by`;

export const findAllJobs = async () => {
    const result = await pool.query(
        `${JOB_SELECT_FULL},
         (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count
         ORDER BY j.created_at DESC`
    );
    return result.rows;
};

export const findJobById = async (id) => {
    const result = await pool.query(
        `${JOB_SELECT_FULL} WHERE j.id = $1`,
        [id]
    );
    return result.rows[0] ?? null;
};

export const findJobsByEmployer = async (employerId) => {
    const result = await pool.query(
        `SELECT j.*,
                c.name AS company_name, c.logo AS company_logo,
                (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count
         FROM jobs j
         JOIN companies c ON c.id = j.company_id
         WHERE c.owner_id = $1
         ORDER BY j.created_at DESC`,
        [employerId]
    );
    return result.rows;
};

export const insertJob = async (data) => {
    const {
        company_id, posted_by, title, area, type, level,
        salary_min, salary_max, currency, location, remote,
        requirements, description, benefits, contact, featured,
    } = data;

    const result = await pool.query(
        `INSERT INTO jobs
             (company_id, posted_by, title, area, type, level,
              salary_min, salary_max, currency, location, remote,
              requirements, description, benefits, contact, featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         RETURNING *`,
        [
            company_id, posted_by, title,
            area ?? null, type ?? 'full', level ?? 'mid',
            salary_min ?? null, salary_max ?? null, currency ?? 'USD',
            location ?? null, remote ?? false,
            requirements ?? null, description,
            benefits ?? null, contact ?? null, featured ?? false,
        ]
    );
    return result.rows[0];
};

export const patchJobStatus = async (id, status) => {
    const result = await pool.query(
        'UPDATE jobs SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *',
        [status, id]
    );
    return result.rows[0] ?? null;
};

export const updateJob = async (id, data) => {
    const {
        title, area, type, level, salary_min, salary_max,
        location, remote, requirements, description,
        benefits, contact, status, featured,
    } = data;

    const result = await pool.query(
        `UPDATE jobs
         SET title=$1, area=$2, type=$3, level=$4, salary_min=$5, salary_max=$6,
             location=$7, remote=$8, requirements=$9, description=$10,
             benefits=$11, contact=$12, status=$13, featured=$14,
             updated_at=CURRENT_TIMESTAMP
         WHERE id=$15
         RETURNING *`,
        [title, area, type, level, salary_min, salary_max,
         location, remote, requirements, description,
         benefits, contact, status, featured, id]
    );
    return result.rows[0] ?? null;
};

export const deleteJob = async (id) => {
    const existing = await pool.query('SELECT * FROM jobs WHERE id=$1', [id]);
    if (existing.rowCount === 0) return null;
    await pool.query('DELETE FROM jobs WHERE id=$1', [id]);
    return existing.rows[0];
};
