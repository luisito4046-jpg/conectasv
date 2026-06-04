import {
    findSavedJobsByUser,
    findExistingSavedJob,
    insertSavedJob,
    removeSavedJob,
} from '../services/savedJobs.service.js';

export const getSavedJobsByUser = async (req, res) => {
    try {
        res.json(await findSavedJobsByUser(req.params.userId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createSavedJob = async (req, res) => {
    try {
        const { user_id, job_id } = req.body;
        if (!user_id || !job_id) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        const existing = await findExistingSavedJob(user_id, job_id);
        if (existing) {
            return res.status(409).json({ error: 'Ya tienes este empleo guardado' });
        }

        const savedJob = await insertSavedJob(user_id, job_id);
        res.status(201).json(savedJob);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteSavedJob = async (req, res) => {
    try {
        const { userId, jobId } = req.params;
        const savedJob = await removeSavedJob(userId, jobId);
        if (!savedJob) return res.status(404).json({ error: 'Empleo guardado no encontrado' });
        res.json({ message: 'Empleo eliminado de guardados', savedJob });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
