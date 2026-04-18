import {
    findAllJobs,
    findJobById,
    findJobsByEmployer,
    insertJob,
    patchJobStatus,
    updateJob,
    deleteJob,
} from '../services/jobs.service.js';

export const getAllJobs = async (req, res) => {
    try {
        res.json(await findAllJobs());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getJobById = async (req, res) => {
    try {
        const job = await findJobById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Empleo no encontrado' });
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getJobsByEmployer = async (req, res) => {
    try {
        res.json(await findJobsByEmployer(req.params.employerId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createJob = async (req, res) => {
    try {
        const job = await insertJob(req.body);
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateJobHandler = async (req, res) => {
    try {
        // Actualización parcial: solo status
        if (Object.keys(req.body).length === 1 && req.body.status) {
            const job = await patchJobStatus(req.params.id, req.body.status);
            if (!job) return res.status(404).json({ error: 'No encontrado' });
            return res.json(job);
        }

        const job = await updateJob(req.params.id, req.body);
        if (!job) return res.status(404).json({ error: 'Empleo no encontrado' });
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteJobHandler = async (req, res) => {
    try {
        const job = await deleteJob(req.params.id);
        if (!job) return res.status(404).json({ error: 'Empleo no encontrado' });
        res.json({ message: 'Empleo eliminado correctamente', job });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
