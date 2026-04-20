import { pool } from '../config/db.js';

export const findAllPosts = async () => {
    const result = await pool.query(`
        SELECT fp.*,
               u.first_name, u.last_name, u.profile_photo_url,
               (SELECT COUNT(*) FROM forum_replies fr WHERE fr.post_id = fp.id) AS replies_count
        FROM forum_posts fp
        JOIN users u ON u.id = fp.user_id
        ORDER BY fp.created_at DESC
    `);
    return result.rows;
};

export const findPostById = async (id) => {
    const post = await pool.query(`
        SELECT fp.*, u.first_name, u.last_name, u.profile_photo_url
        FROM forum_posts fp
        JOIN users u ON u.id = fp.user_id
        WHERE fp.id = $1
    `, [id]);

    const replies = await pool.query(`
        SELECT fr.*, u.first_name, u.last_name, u.profile_photo_url
        FROM forum_replies fr
        JOIN users u ON u.id = fr.user_id
        WHERE fr.post_id = $1
        ORDER BY fr.created_at ASC
    `, [id]);

    if (!post.rows[0]) return null;
    return { ...post.rows[0], replies: replies.rows };
};

export const insertPost = async ({ user_id, category, title, content }) => {
    const result = await pool.query(`
        INSERT INTO forum_posts (user_id, category, title, content)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [user_id, category ?? null, title, content]);
    return result.rows[0];
};

export const insertReply = async ({ post_id, user_id, content }) => {
    const result = await pool.query(`
        INSERT INTO forum_replies (post_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [post_id, user_id, content]);
    return result.rows[0];
};

export const deletePost = async (id) => {
    const existing = await pool.query('SELECT * FROM forum_posts WHERE id=$1', [id]);
    if (existing.rowCount === 0) return null;
    await pool.query('DELETE FROM forum_posts WHERE id=$1', [id]);
    return existing.rows[0];
};