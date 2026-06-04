import { Router } from 'express';
import {
    getAllRatings,
    getCompanyRatings,
    getUserRating,
    postUpsertRating,
    deleteRatingCtrl,
} from '../controllers/ratings.controller.js';

const router = Router();

// GET /api/ratings — todas las empresas con promedio de calificación
router.get('/', getAllRatings);

// GET /api/ratings/company/:id — calificaciones de una empresa
router.get('/company/:id', getCompanyRatings);

// GET /api/ratings/user/:user_id/company/:company_id — calificación de un usuario
router.get('/user/:user_id/company/:company_id', getUserRating);

// POST /api/ratings — crear o actualizar calificación (upsert)
router.post('/', postUpsertRating);

// DELETE /api/ratings/:user_id/:company_id — eliminar calificación
router.delete('/:user_id/:company_id', deleteRatingCtrl);

export default router;
