import { Router } from 'express';
import { uploadPhoto } from '../middleware/upload.js';  // ← solo este
import {
    actualizarUsuario, eliminarUsuario, getAllUsers,
    getBuscarNombre, getUserByEmail, postCrearUsuario
} from '../controllers/users.controller.js';

const router = Router();

router.get('/', getAllUsers);

router.get('/buscarPorEmail/:email', getUserByEmail);

router.get('/buscarPorNombre/:nombre', getBuscarNombre);

router.post('/', postCrearUsuario);

// ← uploadPhoto de Cloudinary reemplaza al multer local
router.put('/:id_usuario', uploadPhoto, actualizarUsuario);

router.delete('/:id_usuario', eliminarUsuario);

export default router;