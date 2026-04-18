import { pool } from '../db.js';
import bcrypt from 'bcrypt';

const REDIRECTS = {
    admin:     '/admin/admin.html',
    employer:  '/Employee/employee.html',
    candidate: '/Candidate/candidate.html',
};

/**
 * Valida las credenciales y devuelve los datos del usuario + redirect.
 * Lanza un error con `.status` si hay un problema de autenticación.
 */
export const authenticateUser = async (email, password) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    if (result.rowCount === 0) {
        const err = new Error('Credenciales inválidas');
        err.status = 401;
        throw err;
    }

    const user = result.rows[0];

    if (user.status === 'suspended') {
        const err = new Error('Cuenta suspendida');
        err.status = 403;
        throw err;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
        const err = new Error('Credenciales inválidas');
        err.status = 401;
        throw err;
    }

    return {
        id:                user.id,
        first_name:        user.first_name,
        last_name:         user.last_name,
        email:             user.email,
        role:              user.role,
        profile_photo_url: user.profile_photo_url ?? null,
        redirect:          REDIRECTS[user.role] ?? '/Candidate/candidate.html',
    };
};
