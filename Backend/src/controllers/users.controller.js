import {
    findAllUsers,
    findUserByEmail,
    findUserById,
    findUsersByName,
    insertUser,
    updateUser,
    deleteUser,
} from '../services/users.service.js';
import { uploadToCloudinary, uploadToCloudinaryRaw } from '../middleware/upload.js'; // ← ambos

export const getAllUsers = async (req, res) => {
    try {
        res.json(await findAllUsers());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserByEmail = async (req, res) => {
    try {
        res.json(await findUserByEmail(req.params.email));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await findUserById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getBuscarNombre = async (req, res) => {
    try {
        res.json(await findUsersByName(req.params.nombre));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const postCrearUsuario = async (req, res) => {
    try {
        const user = await insertUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const actualizarUsuario = async (req, res) => {
    try {
        console.log('BODY:', req.body);
        console.log('FILE:', req.file);
        console.log('ID:', req.params.id_usuario);

        const userData = { ...req.body };

        if (req.file) {
            const publicId = `user_${req.params.id_usuario}_${Date.now()}`;
            const result   = await uploadToCloudinary(req.file.buffer, publicId);
            userData.profile_photo_url = result.secure_url;
        }

        const user = await updateUser(req.params.id_usuario, userData);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario actualizado correctamente', usuario: user });
    } catch (err) {
        console.error('ERROR actualizarUsuario:', err);
        res.status(500).json({ error: err.message });
    }
};

export const eliminarUsuario = async (req, res) => {
    try {
        const user = await deleteUser(req.params.id_usuario);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario eliminado correctamente', usuario: user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const actualizarFotoPerfil = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen.' });

        const publicId = `user_${req.params.id}_${Date.now()}`;
        const result   = await uploadToCloudinary(req.file.buffer, publicId, 'conectasv/profiles');

        const user = await updateUser(req.params.id, { profile_photo_url: result.secure_url });
        res.json({ message: 'Foto actualizada', profile_photo_url: result.secure_url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ NUEVO: Sube CV en PDF a Cloudinary y guarda la URL en la base de datos
export const actualizarCV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ningún archivo PDF.' });
        }

        const publicId = `cv_${req.params.id}_${Date.now()}`;
        const result   = await uploadToCloudinaryRaw(req.file.buffer, publicId, 'conectasv/cvs');

        const user = await updateUser(req.params.id, { cv_url: result.secure_url });
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json({ message: 'CV actualizado correctamente', cv_url: result.secure_url });
    } catch (err) {
        console.error('ERROR actualizarCV:', err);
        res.status(500).json({ error: err.message });
    }
};
