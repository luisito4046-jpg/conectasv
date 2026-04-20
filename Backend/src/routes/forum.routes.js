import { Router } from 'express';
import {
    getAllPosts, getPostById,
    createPost, createReply, deletePostHandler
} from '../controllers/forum.controller.js';

const router = Router();

router.get('/',          getAllPosts);
router.get('/:id',       getPostById);
router.post('/',         createPost);
router.post('/:id/reply', createReply);
router.delete('/:id',   deletePostHandler);

export default router;