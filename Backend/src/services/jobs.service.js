import { pool } from '../config/db.js';
import { findCompaniesByOwner, insertCompany } from './companies.service.js';

/** Normaliza tipos enviados por el frontend (full, Full-time, etc.) */
export const normalizeJobType = (type) => {
    if (!type) return 'full-time';
    const map = {
        full: 'full-time',
        'full-time': 'full-time',
        part: 'part-time',
        'part-time': 'part-time',
        remote: 'remote',
        contract: 'contract',
        freelance: 'freelance',
    };
    return map[String(type).toLowerCase()] ?? type;
};

/** Para filtros/UI: acepta full-time y full como equivalentes */
export const jobTypeMatchesFilter = (dbType, filterId) => {
    const n = normalizeJobType(dbType);
    const f = normalizeJobType(filterId);
    return n === f;
};

async function resolveCompanyForEmployer(employerId, companyName) {
    const companies = await findCompaniesByOwner(employerId);
    if (companies.length > 0) return companies[0];

    const name = (companyName || 'Mi Empresa').trim() || 'Mi Empresa';
    try {
        return await insertCompany({
            owner_id: employerId,
            name,
            description: '',
            industry: '',
            location: '',
        });
    } catch (err) {
        if (err.code === 'COMPANY_ALREADY_EXISTS') {
            const again = await findCompaniesByOwner(employerId);
            if (again.length > 0) return again[0];
        }
        throw err;
    }
}

const JOB_SELECT_FULL = `
    SELECT j.*,
           c.name     AS company_name,
           c.logo_url AS company_logo,
           c.industry AS company_industry,
           c.verified AS company_verified,
           c.location AS company_location,
           u.first_name AS poster_first,
           u.last_name  AS poster_last,
           u.email      AS poster_email
    FROM jobs j
    JOIN companies c ON c.id = j.company_id
    LEFT JOIN users u ON u.id = j.posted_by`;

export const findAllJobs = async () => {
    const result = await pool.query(`
        SELECT j.*,
               c.name     AS company_name,
               c.logo_url AS company_logo,
               c.industry AS company_industry,
               c.verified AS company_verified,
               c.location AS company_location,
               u.first_name AS poster_first,
               u.last_name  AS poster_last,
               u.email      AS poster_email,
               (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count
        FROM jobs j
        JOIN companies c ON c.id = j.company_id
        LEFT JOIN users u ON u.id = j.posted_by
        ORDER BY j.created_at DESC
    `);
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
                c.name AS company_name,
                c.logo_url AS company_logo,
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
        salary_min, salary_max, location,
        requirements, description, contact,
    } = data;

    const result = await pool.query(
        `INSERT INTO jobs
             (company_id, posted_by, title, area, type, level,
              salary_min, salary_max, location,
              requirements, description, contact)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [
            company_id, posted_by, title,
            area    ?? null, normalizeJobType(type), level ?? 'mid',
            salary_min ?? null, salary_max ?? null,
            location   ?? null,
            requirements ?? null, description,
            contact ?? null,
        ]
    );
    return result.rows[0];
};

/** Crea empleo desde el body del frontend (employer_id, company_name, contact_email, …) */
export const createJobFromPayload = async (body) => {
    const employerId = body.employer_id ?? body.posted_by;
    if (!employerId) {
        const err = new Error('employer_id es requerido');
        err.status = 400;
        throw err;
    }
    if (!body.title?.trim() || !body.description?.trim()) {
        const err = new Error('Título y descripción son requeridos');
        err.status = 400;
        throw err;
    }

    const contact = body.contact ?? body.contact_email;
    if (!contact?.trim()) {
        const err = new Error('Correo de contacto es requerido');
        err.status = 400;
        throw err;
    }

    const company = body.company_id
        ? { id: body.company_id }
        : await resolveCompanyForEmployer(employerId, body.company_name);

    const row = await insertJob({
        company_id: company.id,
        posted_by: employerId,
        title: body.title.trim(),
        area: body.area ?? null,
        type: body.type,
        level: body.level ?? 'entry',
        salary_min: body.salary_min ?? null,
        salary_max: body.salary_max ?? null,
        location: body.location?.trim() || null,
        requirements: body.requirements?.trim() || null,
        description: body.description.trim(),
        contact: contact.trim(),
    });

    return findJobById(row.id);
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
        location, requirements, description, contact, status,
    } = data;

    const result = await pool.query(
        `UPDATE jobs
         SET title=$1, area=$2, type=$3, level=$4, salary_min=$5, salary_max=$6,
             location=$7, requirements=$8, description=$9,
             contact=$10, status=$11,
             updated_at=CURRENT_TIMESTAMP
         WHERE id=$12
         RETURNING *`,
        [title, area, type, level, salary_min, salary_max,
         location, requirements, description, contact, status, id]
    );
    return result.rows[0] ?? null;
};

export const deleteJob = async (id) => {
    const existing = await pool.query('SELECT * FROM jobs WHERE id=$1', [id]);
    if (existing.rowCount === 0) return null;
    await pool.query('DELETE FROM jobs WHERE id=$1', [id]);
    return existing.rows[0];
};