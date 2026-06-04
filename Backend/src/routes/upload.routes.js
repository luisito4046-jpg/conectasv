import { Router } from 'express';
import { uploadPhoto, uploadCV } from '../middleware/upload.js';                        // ← uploadCV agregado
import { actualizarFotoPerfil, actualizarCV } from '../controllers/users.controller.js'; // ← actualizarCV agregado

const router = Router();

// PATCH /api/users/:id/avatar — sube foto de perfil a Cloudinary
router.patch('/:id/avatar', uploadPhoto, actualizarFotoPerfil);

// NUEVO: PATCH /api/users/:id/cv — sube CV en PDF a Cloudinary y guarda url en DB
router.patch('/:id/cv', uploadCV, actualizarCV);

export default router;
