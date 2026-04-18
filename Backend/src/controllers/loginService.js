import { pool } from '../db.js';
import bcrypt from 'bcrypt';

export const loginService = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validación básica de campos
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // 1. Buscar usuario por email
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // 2. Verificar que la cuenta esté activa
        if (user.status === 'suspended') {
            return res.status(403).json({ error: 'Cuenta suspendida' });
        }

        // 3. Comparar contraseña con bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 4. Construir respuesta según el rol
        const userData = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            profile_photo_url: user.profile_photo_url || null,
        };

        if (user.role === 'admin') {
            return res.status(200).json({ ...userData, redirect: '/admin/admin.html' });
        }

        if (user.role === 'employer') {
            return res.status(200).json({ ...userData, redirect: '/Employee/employee.html' });
        }

        // candidate → redirigir al panel de candidato
        return res.status(200).json({ ...userData, redirect: '/Candidate/candidate.html' });
    } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ error: err.message });
    }
};