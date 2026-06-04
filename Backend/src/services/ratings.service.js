import { pool } from '../config/db.js';

// ── Todas las empresas con promedio de rating ────────────────
export const findAllCompanyRatings = async () => {
    const result = await pool.query('SELECT * FROM view_company_ratings');
    return result.rows;
};

// ── Ratings de una empresa específica ───────────────────────
export const findRatingsByCompany = async (company_id) => {
    const result = await pool.query(
        `SELECT r.*, u.first_name, u.last_name, u.profile_photo_url
         FROM ratings r
         JOIN users u ON u.id = r.user_id
         WHERE r.company_id = $1
         ORDER BY r.created_at DESC`,
        [company_id]
    );
    return result.rows;
};

// ── Rating de un usuario en una empresa concreta ─────────────
export const findRatingByUser = async (user_id, company_id) => {
    const result = await pool.query(
        'SELECT * FROM ratings WHERE user_id = $1 AND company_id = $2',
        [user_id, company_id]
    );
    return result.rows[0] ?? null;
};

// ── Crear o actualizar el rating (UPSERT) ────────────────────
export const upsertRating = async (user_id, company_id, rating, comment) => {
    const result = await pool.query(
        `INSERT INTO ratings (user_id, company_id, rating, comment)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, company_id)
         DO UPDATE SET
             rating     = EXCLUDED.rating,
             comment    = EXCLUDED.comment,
             created_at = CURRENT_TIMESTAMP
         RETURNING id, user_id, company_id, rating::int, comment, created_at`,
        [user_id, company_id, rating, comment ?? null]
    );
    return result.rows[0];
};

// ── Eliminar el rating de un usuario en una empresa ──────────
export const deleteRating = async (user_id, company_id) => {
    const existing = await pool.query(
        'SELECT * FROM ratings WHERE user_id = $1 AND company_id = $2',
        [user_id, company_id]
    );
    if (existing.rowCount === 0) return null;
    await pool.query(
        'DELETE FROM ratings WHERE user_id = $1 AND company_id = $2',
        [user_id, company_id]
    );
    return existing.rows[0];
};
