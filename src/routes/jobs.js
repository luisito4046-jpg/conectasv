import { Router } from 'express';
import {
    getAllJobs, getJobById, getJobsByEmployer,
    createJob, updateJob, deleteJob
} from '../controllers/jobsServices.js';

const router = Router();

// GET /api/jobs — todos los empleos
router.get('/', getAllJobs);

// GET /api/jobs/:id — empleo por ID
router.get('/:id', getJobById);

// GET /api/jobs/employer/:employerId — empleos del employer (via companies.owner_id)
router.get('/employer/:employerId', getJobsByEmployer);

// POST /api/jobs — crear empleo
router.post('/', createJob);

// PUT /api/jobs/:id — actualizar empleo
router.put('/:id', updateJob);

// DELETE /api/jobs/:id — eliminar empleo
router.delete('/:id', deleteJob);

export default router;
