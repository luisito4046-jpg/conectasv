import { Router } from 'express';
import {
    getApplicationsByJob, getApplicationsByCandidate,
    createApplication, updateApplicationStatus, deleteApplication
} from '../controllers/applications.controller.js';

const router = Router();

// GET /api/applications/job/:jobId — postulaciones de un empleo
router.get('/job/:jobId', getApplicationsByJob);

// GET /api/applications/candidate/:candidateId — postulaciones de un candidato
router.get('/candidate/:candidateId', getApplicationsByCandidate);

// POST /api/applications — crear postulación
router.post('/', createApplication);

// PUT /api/applications/:id — actualizar estado
router.put('/:id', updateApplicationStatus);

// DELETE /api/applications/:id — eliminar postulación
router.delete('/:id', deleteApplication);

export default router;
