import {
    findAllPosts, findPostById,
    insertPost, insertReply,
    updatePost, updateReply,
    deletePost, togglePostLike, toggleReplyLike
} from '../services/forum.service.js';

export const getAllPosts = async (req, res) => {
    try {
        const { sort, page, limit } = req.query;
        const userId = req.query.user_id || null;
        const result = await findAllPosts({ sort, page, limit, userId });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPostById = async (req, res) => {
    try {
        const userId = req.query.user_id || null;
        const post = await findPostById(req.params.id, userId);
        if (!post) return res.status(404).json({ error: 'Post no encontrado' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createPost = async (req, res) => {
    try {
        const { user_id, category, title, content } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'user_id es requerido' });
        }
        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({ error: 'Título y contenido son requeridos' });
        }

        const post = await insertPost({ user_id, category, title, content });
        res.status(201).json(post);
    } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ error: err.message });
    }
};

export const editPost = async (req, res) => {
    try {
        const { user_id, title, content } = req.body;
        if (!user_id) return res.status(400).json({ error: 'user_id es requerido' });
        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({ error: 'Título y contenido son requeridos' });
        }

        const post = await updatePost({ id: req.params.id, user_id, title, content });
        if (!post) return res.status(403).json({ error: 'No tienes permiso para editar este post' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const editReply = async (req, res) => {
    try {
        const { user_id, content } = req.body;
        if (!user_id) return res.status(400).json({ error: 'user_id es requerido' });
        if (!content?.trim()) {
            return res.status(400).json({ error: 'El contenido es requerido' });
        }

        const reply = await updateReply({ id: req.params.id, user_id, content });
        if (!reply) return res.status(403).json({ error: 'No tienes permiso para editar este comentario' });
        res.json(reply);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createReply = async (req, res) => {
    try {
        const { user_id, content } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'user_id es requerido' });
        }
        if (!content?.trim()) {
            return res.status(400).json({ error: 'El contenido de la respuesta es requerido' });
        }

        const reply = await insertReply({
            post_id: req.params.id,
            user_id,
            content,
        });
        res.status(201).json(reply);
    } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ error: err.message });
    }
};

export const deletePostHandler = async (req, res) => {
    try {
        const post = await deletePost(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post no encontrado' });
        res.json({ message: 'Post eliminado', post });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const likePost = async (req, res) => {
    try {
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ error: 'user_id es requerido' });
        const result = await togglePostLike({ post_id: req.params.id, user_id });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const likeReply = async (req, res) => {
    try {
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ error: 'user_id es requerido' });
        const result = await toggleReplyLike({ reply_id: req.params.id, user_id });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
