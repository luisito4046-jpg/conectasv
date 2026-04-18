import { pool } from '../config/db.js';

export const findAlertsByUser = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows;
};

export const insertAlert = async ({ user_id, query, active }) => {
    const result = await pool.query(
        `INSERT INTO alerts (user_id, query, active)
         VALUES ($1, $2, $3) RETURNING *`,
        [user_id, query, active !== undefined ? active : true]
    );
    return result.rows[0];
};

export const patchAlert = async (id, { active, query }) => {
    const result = await pool.query(
        `UPDATE alerts
         SET active = CASE WHEN $1 IS NULL THEN active ELSE $1 END,
             query  = CASE WHEN $2 IS NULL THEN query  ELSE $2 END
         WHERE id = $3
         RETURNING *`,
        [active ?? null, query ?? null, id]
    );
    return result.rows[0] ?? null;
};

export const removeAlert = async (id) => {
    const result = await pool.query(
        'DELETE FROM alerts WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0] ?? null;
};
