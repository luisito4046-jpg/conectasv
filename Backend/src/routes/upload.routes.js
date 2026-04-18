import { uploadAvatar } from '../config/cloudinary.js';
import { actualizarFotoPerfil } from '../controllers/users.controller.js';

router.patch('/users/:id/avatar', uploadAvatar.single('photo'), actualizarFotoPerfil);