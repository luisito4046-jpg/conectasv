import { Router } from 'express';
import { loginService } from '../controllers/loginService.js';

const router = Router();

router.post('/', loginService);

export default router;