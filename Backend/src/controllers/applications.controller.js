import {
    findAllApplications,
    findApplicationsByJob,
    findApplicationsByCandidate,
    findExistingApplication,
    insertApplication,
    patchApplicationStatus,
    findApplicationById,
    removeApplication,
} from '../services/applications.service.js';

export const getAllApplications = async (req, res) => {
    try {
        const applications = await findAllApplications();
        res.json(applications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getApplicationsByJob = async (req, res) => {
    try {
        const applications = await findApplicationsByJob(req.params.jobId);
        res.json(applications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getApplicationsByCandidate = async (req, res) => {
    try {
        const applications = await findApplicationsByCandidate(req.params.candidateId);
        res.json(applications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createApplication = async (req, res) => {
    try {
        const { job_id, candidate_id, cover_letter } = req.body;

        const existing = await findExistingApplication(job_id, candidate_id);
        if (existing) {
            return res.status(409).json({ error: 'Ya te postulaste a este empleo' });
        }

        const application = await insertApplication({ job_id, candidate_id, cover_letter });
        res.status(201).json(application);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const application = await patchApplicationStatus(req.params.id, req.body.status);
        if (!application) return res.status(404).json({ error: 'Postulación no encontrada' });
        res.json(application);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteApplication = async (req, res) => {
    try {
        const existing = await findApplicationById(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Postulación no encontrada' });

        await removeApplication(req.params.id);
        res.json({ message: 'Postulación eliminada', application: existing });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
