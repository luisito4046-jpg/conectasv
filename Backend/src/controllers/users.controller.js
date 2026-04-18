import {
    findAllUsers,
    findUserByEmail,
    findUserById,
    findUsersByName,
    insertUser,
    updateUser,
    deleteUser,
} from '../services/users.service.js';

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
        const user = await updateUser(req.params.id_usuario, req.body);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario actualizado correctamente', usuario: user });
    } catch (err) {
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
        const url = req.file?.path; // Cloudinary pone la URL aquí
        if (!url) return res.status(400).json({ error: 'No se recibió ninguna imagen.' });

        const user = await updateUser(req.params.id, { profile_photo_url: url });
        res.json({ message: 'Foto actualizada', profile_photo_url: url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
