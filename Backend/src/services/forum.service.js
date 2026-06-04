import { pool } from '../config/db.js';

const POST_SELECT = `
    SELECT fp.*,
           u.first_name, u.last_name, u.profile_photo_url,
           (SELECT COUNT(*)::int FROM forum_replies fr WHERE fr.post_id = fp.id) AS replies_count,
           (SELECT COUNT(*)::int FROM forum_likes fl WHERE fl.post_id = fp.id) AS likes_count
    FROM forum_posts fp
    JOIN users u ON u.id = fp.user_id`;

const REPLY_SELECT = `
    SELECT fr.*, u.first_name, u.last_name, u.profile_photo_url,
           (SELECT COUNT(*)::int FROM forum_reply_likes frl WHERE frl.reply_id = fr.id) AS likes_count
    FROM forum_replies fr
    JOIN users u ON u.id = fr.user_id`;

export const findAllPosts = async ({ sort, page, limit, userId } = {}) => {
    sort = sort || 'recent';
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(50, Math.max(1, parseInt(limit) || 50));
    const offset = (page - 1) * limit;

    let orderBy;
    if (sort === 'popular') orderBy = 'likes_count DESC, fp.created_at DESC';
    else if (sort === 'comments') orderBy = 'replies_count DESC, fp.created_at DESC';
    else orderBy = 'fp.created_at DESC';

    const countResult = await pool.query('SELECT COUNT(*)::int FROM forum_posts');
    const total = countResult.rows[0].count;

    const result = await pool.query(`
        ${POST_SELECT}
        ORDER BY ${orderBy}
        LIMIT $1 OFFSET $2
    `, [limit, offset]);
    const posts = result.rows;

    if (posts.length === 0) return { posts: [], total, page, limit };

    const repliesResult = await pool.query(`
        ${REPLY_SELECT}
        ORDER BY fr.created_at ASC
    `);

    const byPost = {};
    for (const r of repliesResult.rows) {
        if (!byPost[r.post_id]) byPost[r.post_id] = [];
        byPost[r.post_id].push(r);
    }

    let userLikes = new Set();
    if (userId) {
        const likesRes = await pool.query(
            'SELECT post_id FROM forum_likes WHERE user_id = $1', [userId]
        );
        for (const row of likesRes.rows) userLikes.add(row.post_id);
    }

    const mapped = posts.map((p) => ({
        ...p,
        replies: byPost[p.id] || [],
        comments: byPost[p.id] || [],
        liked_by_me: userLikes.has(p.id),
    }));

    return { posts: mapped, total, page, limit };
};

export const findPostById = async (id, userId) => {
    const post = await pool.query(`${POST_SELECT} WHERE fp.id = $1`, [id]);

    const replies = await pool.query(`
        ${REPLY_SELECT}
        WHERE fr.post_id = $1
        ORDER BY fr.created_at ASC
    `, [id]);

    if (!post.rows[0]) return null;

    let likedByMe = false;
    if (userId) {
        const lr = await pool.query(
            'SELECT 1 FROM forum_likes WHERE post_id = $1 AND user_id = $2', [id, userId]
        );
        likedByMe = lr.rowCount > 0;
    }

    const replyLikes = {};
    if (userId) {
        const rlRes = await pool.query(
            'SELECT reply_id FROM forum_reply_likes WHERE user_id = $1', [userId]
        );
        for (const row of rlRes.rows) replyLikes[row.reply_id] = true;
    }

    return {
        ...post.rows[0],
        replies: replies.rows.map(r => ({ ...r, liked_by_me: !!replyLikes[r.id] })),
        liked_by_me: likedByMe,
    };
};

export const insertPost = async ({ user_id, category, title, content }) => {
    const result = await pool.query(`
        INSERT INTO forum_posts (user_id, category, title, content)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `, [user_id, category ?? null, title.trim(), content.trim()]);

    return findPostById(result.rows[0].id);
};

export const insertReply = async ({ post_id, user_id, content }) => {
    const postCheck = await pool.query('SELECT id FROM forum_posts WHERE id = $1', [post_id]);
    if (postCheck.rowCount === 0) {
        const err = new Error('Post no encontrado');
        err.status = 404;
        throw err;
    }

    const result = await pool.query(`
        INSERT INTO forum_replies (post_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING id
    `, [post_id, user_id, content.trim()]);

    const reply = await pool.query(`
        ${REPLY_SELECT}
        WHERE fr.id = $1
    `, [result.rows[0].id]);

    return { ...reply.rows[0], liked_by_me: false };
};

export const updatePost = async ({ id, user_id, title, content }) => {
    const existing = await pool.query(
        'SELECT * FROM forum_posts WHERE id=$1 AND user_id=$2', [id, user_id]
    );
    if (existing.rowCount === 0) return null;

    const result = await pool.query(`
        UPDATE forum_posts
        SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND user_id = $4
        RETURNING id
    `, [title.trim(), content.trim(), id, user_id]);

    return findPostById(result.rows[0].id);
};

export const updateReply = async ({ id, user_id, content }) => {
    const result = await pool.query(`
        UPDATE forum_replies
        SET content = $1
        WHERE id = $2 AND user_id = $3
        RETURNING id
    `, [content.trim(), id, user_id]);

    if (result.rowCount === 0) return null;

    const reply = await pool.query(`
        ${REPLY_SELECT}
        WHERE fr.id = $1
    `, [result.rows[0].id]);

    return reply.rows[0];
};

export const deletePost = async (id) => {
    const existing = await pool.query('SELECT * FROM forum_posts WHERE id=$1', [id]);
    if (existing.rowCount === 0) return null;
    await pool.query('DELETE FROM forum_reply_likes WHERE reply_id IN (SELECT id FROM forum_replies WHERE post_id=$1)', [id]);
    await pool.query('DELETE FROM forum_likes WHERE post_id=$1', [id]);
    await pool.query('DELETE FROM forum_replies WHERE post_id=$1', [id]);
    await pool.query('DELETE FROM forum_posts WHERE id=$1', [id]);
    return existing.rows[0];
};

export const togglePostLike = async ({ post_id, user_id }) => {
    const existing = await pool.query(
        'SELECT id FROM forum_likes WHERE post_id=$1 AND user_id=$2', [post_id, user_id]
    );
    if (existing.rowCount > 0) {
        await pool.query('DELETE FROM forum_likes WHERE id=$1', [existing.rows[0].id]);
        return { liked: false };
    }
    await pool.query(
        'INSERT INTO forum_likes (post_id, user_id) VALUES ($1, $2)', [post_id, user_id]
    );
    return { liked: true };
};

export const toggleReplyLike = async ({ reply_id, user_id }) => {
    const existing = await pool.query(
        'SELECT id FROM forum_reply_likes WHERE reply_id=$1 AND user_id=$2', [reply_id, user_id]
    );
    if (existing.rowCount > 0) {
        await pool.query('DELETE FROM forum_reply_likes WHERE id=$1', [existing.rows[0].id]);
        return { liked: false };
    }
    await pool.query(
        'INSERT INTO forum_reply_likes (reply_id, user_id) VALUES ($1, $2)', [reply_id, user_id]
    );
    return { liked: true };
};
