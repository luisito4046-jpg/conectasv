import { pool } from '../db.js';

// OBTENER TODOS LOS USUARIOS
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// OBTENER USUARIOS POR EMAIL
export const getUserByEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// OBTENER USUARIO POR ID
export const getUserById = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
};

// OBTENER USUARIO POR NOMBRE (Busca en first_name)
export const getBuscarNombre = async (req, res) => {
    const { nombre } = req.params;
    try {
        const buscar = `%${nombre}%`;
        const result = await pool.query(
            "SELECT * FROM users WHERE first_name ILIKE $1", [buscar]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREAR UN NUEVO USUARIO
export const postCrearUsuario = async (req, res) => {
    try {
        const { first_name, last_name, email, password_hash, role, location, phone, profile_photo_url } = req.body;

        // Si viene password_hash sin hashear (texto plano del frontend), hashear con bcrypt
        const bcrypt = (await import('bcrypt')).default;
        let finalHash = password_hash;
        if (password_hash && !password_hash.startsWith('$2b$')) {
            finalHash = await bcrypt.hash(password_hash, 10);
        }

        const query = `
            INSERT INTO users 
                (first_name, last_name, email, password_hash, role, location, phone, profile_photo_url)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *;`;

        const result = await pool.query(query, [
            first_name, 
            last_name, 
            email, 
            finalHash,
            role || 'candidate', 
            location, 
            phone,
            profile_photo_url || null
        ]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ACTUALIZAR USUARIO
export const actualizarUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const { first_name, last_name, email, role, location, phone, bio, status, profile_photo_url } = req.body;
        
        const query = `
            UPDATE users
            SET first_name=$1, last_name=$2, email=$3, role=$4, location=$5, 
                phone=$6, bio=$7, profile_photo_url=$8, status=$9, updated_at=CURRENT_TIMESTAMP
            WHERE id=$10
            RETURNING *;`;

        const values = [first_name, last_name, email, role, location, phone, bio, profile_photo_url || null, status, id_usuario];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({
            message: 'Usuario actualizado correctamente',
            usuario: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ELIMINAR USUARIO
export const eliminarUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const usuarioAEliminar = await pool.query('SELECT * FROM users WHERE id=$1', [id_usuario]);

        if (usuarioAEliminar.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await pool.query('DELETE FROM users WHERE id=$1', [id_usuario]);

        res.status(200).json({ 
            message: 'Usuario eliminado correctamente', 
            usuario: usuarioAEliminar.rows[0] 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};