import { Router } from 'express';
import { uploadPhoto } from '../middleware/upload.js';  // ← solo este
import {
    actualizarUsuario, eliminarUsuario, getAllUsers,
    getBuscarNombre, getUserByEmail, getUserById, postCrearUsuario
} from '../controllers/users.controller.js';

const router = Router();

router.get('/', getAllUsers);

router.get('/buscarPorEmail/:email', getUserByEmail);

router.get('/buscarPorNombre/:nombre', getBuscarNombre);

// ← Ruta que faltaba: usada por loadProfile() y el modal de candidatos
router.get('/:id', getUserById);

router.post('/', postCrearUsuario);

router.put('/:id_usuario', uploadPhoto, actualizarUsuario);

router.delete('/:id_usuario', eliminarUsuario);

export default router;