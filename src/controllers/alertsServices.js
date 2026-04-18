import { pool } from '../db.js';

export const getAlertsByUser = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.params.userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createAlert = async (req, res) => {
    try {
        const { user_id, query, active } = req.body;
        if (!user_id || !query) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        const result = await pool.query(
            `INSERT INTO alerts (user_id, query, active)
             VALUES ($1, $2, $3) RETURNING *`,
            [user_id, query, active !== undefined ? active : true]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateAlert = async (req, res) => {
    try {
        const { active, query } = req.body;

        const result = await pool.query(
            `UPDATE alerts
             SET active = CASE WHEN $1 IS NULL THEN active ELSE $1 END,
                 query = CASE WHEN $2 IS NULL THEN query ELSE $2 END
             WHERE id = $3
             RETURNING *`,
            [active, query, req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Alerta no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteAlert = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM alerts WHERE id=$1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Alerta no encontrada' });
        }
        res.json({ message: 'Alerta eliminada', alert: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
