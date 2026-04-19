import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';

export const findAllUsers = async () => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
};

export const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows;
};

export const findUserById = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ?? null;
};

export const findUsersByName = async (nombre) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE first_name ILIKE $1',
        [`%${nombre}%`]
    );
    return result.rows;
};

export const insertUser = async ({ first_name, last_name, email, password_hash, role, location, phone, profile_photo_url }) => {
    let finalHash = password_hash;
    if (password_hash && !password_hash.startsWith('$2b$')) {
        finalHash = await bcrypt.hash(password_hash, 10);
    }

    const result = await pool.query(
        `INSERT INTO users
             (first_name, last_name, email, password_hash, role, location, phone, profile_photo_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [first_name, last_name, email, finalHash, role ?? 'candidate', location, phone, profile_photo_url ?? null]
    );
    return result.rows[0];
};

export const updateUser = async (id, data) => {
    const fields = [
        'first_name', 'last_name', 'email', 'role',
        'location', 'phone', 'bio', 'profile_photo_url',
        'skills', 'cv_url', 'status'
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
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`,
        values
    );
    return result.rows[0] ?? null;
};

export const deleteUser = async (id) => {
    const existing = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
    if (existing.rowCount === 0) return null;
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    return existing.rows[0];
};
