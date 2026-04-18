import { authenticateUser } from '../services/login.service.js';

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const userData = await authenticateUser(email, password);
        res.status(200).json(userData);
    } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ error: err.message });
    }
};
