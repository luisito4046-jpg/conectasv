import {
    findAllPosts, findPostById,
    insertPost, insertReply, deletePost
} from '../services/forum.service.js';

export const getAllPosts = async (req, res) => {
    try {
        res.json(await findAllPosts());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPostById = async (req, res) => {
    try {
        const post = await findPostById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post no encontrado' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createPost = async (req, res) => {
    try {
        const post = await insertPost(req.body);
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createReply = async (req, res) => {
    try {
        const reply = await insertReply({
            post_id: req.params.id,
            ...req.body
        });
        res.status(201).json(reply);
    } catch (err) {
        res.status(500).json({ error: err.message });
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