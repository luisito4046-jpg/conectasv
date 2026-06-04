import { pool } from '../config/db.js';

export const findAllCompanies = async () => {
    const result = await pool.query('SELECT * FROM companies');
    return result.rows;
};

export const findCompanyById = async (id) => {
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    return result.rows[0] ?? null;
};

export const findCompaniesByOwner = async (owner_id) => {
    const result = await pool.query('SELECT * FROM companies WHERE owner_id = $1', [owner_id]);
    return result.rows;
};

export const findCompaniesByName = async (nombre) => {
    const result = await pool.query(
        'SELECT * FROM companies WHERE name ILIKE $1',
        [`%${nombre}%`]
    );
    return result.rows;
};

export const insertCompany = async ({ owner_id, name, logo_url, industry, size, website, description, location }) => {
    // Un employer solo puede tener una empresa
    const existing = await pool.query(
        'SELECT id FROM companies WHERE owner_id = $1 LIMIT 1',
        [owner_id]
    );
    if (existing.rowCount > 0) {
        const err = new Error('Este usuario ya tiene una empresa registrada');
        err.code = 'COMPANY_ALREADY_EXISTS';
        throw err;
    }

    const result = await pool.query(
        `INSERT INTO companies
             (owner_id, name, logo_url, industry, size, website, description, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [owner_id, name, logo_url ?? null, industry ?? null, size ?? null,
         website ?? null, description ?? null, location ?? null]
    );
    return result.rows[0];
};

// UPDATE dinámico — solo actualiza los campos que lleguen (igual que users.service.js)
// Incluye logo_url para soportar subida de logo a Cloudinary
export const updateCompany = async (id, data) => {
    const fields = [
        'name', 'logo_url', 'industry', 'size',
        'website', 'description', 'location', 'verified'
    ];

    const updates = [];
    const values  = [];
    let   index   = 1;

    for (const field of fields) {
        if (data[field] !== undefined && data[field] !== '') {
            updates.push(`${field} = $${index}`);
            values.push(data[field]);
            index++;
        }
    }

    if (updates.length === 0) return null;

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
        `UPDATE companies SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`,
        values
    );
    return result.rows[0] ?? null;
};

export const deleteCompany = async (id) => {
    const existing = await pool.query('SELECT * FROM companies WHERE id=$1', [id]);
    if (existing.rowCount === 0) return null;
    await pool.query('DELETE FROM companies WHERE id=$1', [id]);
    return existing.rows[0];
};
