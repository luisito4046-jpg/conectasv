import { pool } from '../db.js';

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

export const insertCompany = async ({ owner_id, name, logo, industry, size, website, description, location }) => {
    const result = await pool.query(
        `INSERT INTO companies
             (owner_id, name, logo, industry, size, website, description, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [owner_id, name, logo, industry, size, website, description, location]
    );
    return result.rows[0];
};

export const updateCompany = async (id, { name, logo, industry, size, website, description, location, verified }) => {
    const result = await pool.query(
        `UPDATE companies
         SET name=$1, logo=$2, industry=$3, size=$4, website=$5,
             description=$6, location=$7, verified=$8, updated_at=CURRENT_TIMESTAMP
         WHERE id=$9
         RETURNING *`,
        [name, logo, industry, size, website, description, location, verified, id]
    );
    return result.rows[0] ?? null;
};

export const deleteCompany = async (id) => {
    const existing = await pool.query('SELECT * FROM companies WHERE id=$1', [id]);
    if (existing.rowCount === 0) return null;
    await pool.query('DELETE FROM companies WHERE id=$1', [id]);
    return existing.rows[0];
};
