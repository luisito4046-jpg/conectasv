import { Router } from 'express';
import { getAlertsByUser, createAlert, updateAlert, deleteAlert } from '../controllers/alerts.controller.js';

const router = Router();

router.get('/:userId', getAlertsByUser);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

export default router;
