import { Router } from 'express';
import {
    getAllJobs, getJobById, getJobsByEmployer,
    createJob, updateJobHandler, deleteJobHandler
} from '../controllers/jobs.controller.js';

const router = Router();

// GET /api/jobs — todos los empleos
router.get('/', getAllJobs);

// GET /api/jobs/employer/:employerId — empleos del employer (antes de /:id)
router.get('/employer/:employerId', getJobsByEmployer);

// GET /api/jobs/:id — empleo por ID
router.get('/:id', getJobById);

// POST /api/jobs — crear empleo
router.post('/', createJob);

// PUT /api/jobs/:id — actualizar empleo
router.put('/:id', updateJobHandler);

// DELETE /api/jobs/:id — eliminar empleo
router.delete('/:id', deleteJobHandler);

export default router;
