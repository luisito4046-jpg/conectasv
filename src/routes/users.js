import { Router } from 'express';
import multer from 'multer';
import { actualizarUsuario, eliminarUsuario, getAllUsers, getBuscarNombre, getUserByEmail, postCrearUsuario } from '../controllers/usersServices.js';

const router = Router();

// Configurar multer para subir archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.get('/', getAllUsers);

router.get('/buscarPorEmail/:email', getUserByEmail);

router.get('/buscarPorNombre/:nombre', getBuscarNombre);

router.post('/', postCrearUsuario);

router.put('/:id_usuario', upload.single('profile_photo'), actualizarUsuario);

router.delete('/:id_usuario', eliminarUsuario);

export default router;