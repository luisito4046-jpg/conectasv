import { Router } from 'express';
import {
    getAllPosts, getPostById,
    createPost, createReply,
    editPost, editReply,
    deletePostHandler,
    likePost, likeReply
} from '../controllers/forum.controller.js';

const router = Router();

router.get('/',          getAllPosts);
router.get('/:id',       getPostById);
router.post('/',         createPost);
router.post('/:id/reply', createReply);
router.post('/:id/comments', createReply);
router.put('/:id',       editPost);
router.put('/reply/:id', editReply);
router.post('/:id/like', likePost);
router.post('/reply/:id/like', likeReply);
router.delete('/:id',   deletePostHandler);

export default router;
