import { Router } from 'express';
import { getSavedJobsByUser, createSavedJob, deleteSavedJob } from '../controllers/savedJobs.controller.js';

const router = Router();

router.get('/:userId', getSavedJobsByUser);
router.post('/', createSavedJob);
router.delete('/:userId/:jobId', deleteSavedJob);

export default router;
