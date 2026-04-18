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

// OBTENER USUARIO POR NOMBRE (Busca en first_name)
export const getBuscarNombre = async (nombre) => {
    const buscar = `%${nombre}%`;
    const result = await pool.query(
        "SELECT * FROM users WHERE first_name ILIKE $1", [buscar]
    );
    return result.rows;
};

// CREAR UN NUEVO USUARIO
export const postCrearUsuario = async (userData) => {
    const { first_name, last_name, email, password_hash, role, location, phone } = userData;
    try {
        const query = `
            INSERT INTO users 
                (first_name, last_name, email, password_hash, role, location, phone)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *;`;

        const result = await pool.query(query, [
            first_name, 
            last_name, 
            email, 
            password_hash, 
            role || 'candidate', 
            location, 
            phone
        ]);

        return result.rows[0];
    } catch (err) {
        throw err;
    }
};

// ACTUALIZAR USUARIO
export const actualizarUsuario = async (id, userData) => {
    const { first_name, last_name, email, role, location, phone, bio, status } = userData;
    
    const query = `
        UPDATE users
        SET first_name=$1, last_name=$2, email=$3, role=$4, location=$5, 
            phone=$6, bio=$7, status=$8, updated_at=CURRENT_TIMESTAMP
        WHERE id=$9
        RETURNING *;`;

    try {
        const values = [first_name, last_name, email, role, location, phone, bio, status, id];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return { error: 'Usuario no encontrado', status: 404 };
        }

        return { data: result.rows[0], status: 200 };
    } catch (err) {
        throw new Error(err.message);
    }
};

// ELIMINAR USUARIO
export const eliminarUsuario = async (id) => {
    try {
        const usuarioAEliminar = await pool.query('SELECT * FROM users WHERE id=$1', [id]);

        if (usuarioAEliminar.rowCount === 0) {
            throw new Error('Usuario no encontrado');
        }

        await pool.query('DELETE FROM users WHERE id=$1', [id]);

        return { 
            message: 'Usuario eliminado correctamente', 
            usuario: usuarioAEliminar.rows[0] 
        };
    } catch (err) {
        return { error: err.message };
    }
};