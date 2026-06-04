import {
    findAlertsByUser,
    insertAlert,
    patchAlert,
    removeAlert,
} from '../services/alerts.service.js';

export const getAlertsByUser = async (req, res) => {
    try {
        const alerts = await findAlertsByUser(req.params.userId);
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createAlert = async (req, res) => {
    try {
        const { user_id, query, active } = req.body;
        if (!user_id || !query) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }
        const alert = await insertAlert({ user_id, query, active });
        res.status(201).json(alert);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateAlert = async (req, res) => {
    try {
        const alert = await patchAlert(req.params.id, req.body);
        if (!alert) return res.status(404).json({ error: 'Alerta no encontrada' });
        res.json(alert);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteAlert = async (req, res) => {
    try {
        const alert = await removeAlert(req.params.id);
        if (!alert) return res.status(404).json({ error: 'Alerta no encontrada' });
        res.json({ message: 'Alerta eliminada', alert });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
