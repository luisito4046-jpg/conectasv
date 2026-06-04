import {
    findAllCompanyRatings,
    findRatingsByCompany,
    findRatingByUser,
    upsertRating,
    deleteRating,
} from '../services/ratings.service.js';

// GET /api/ratings  — todas las empresas con su promedio
export const getAllRatings = async (req, res) => {
    try {
        res.json(await findAllCompanyRatings());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/ratings/company/:id  — ratings de una empresa
export const getCompanyRatings = async (req, res) => {
    try {
        const ratings = await findRatingsByCompany(req.params.id);
        res.json(ratings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/ratings/user/:user_id/company/:company_id
export const getUserRating = async (req, res) => {
    try {
        const { user_id, company_id } = req.params;
        const rating = await findRatingByUser(user_id, company_id);
        if (!rating) return res.status(404).json({ error: 'Sin calificación' });
        res.json(rating);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/ratings  — crear o actualizar calificación
export const postUpsertRating = async (req, res) => {
    try {
        const { user_id, company_id, rating, comment } = req.body;

        if (!user_id || !company_id || !rating) {
            return res.status(400).json({ error: 'user_id, company_id y rating son requeridos' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'El rating debe estar entre 1 y 5' });
        }

        const result = await upsertRating(user_id, company_id, rating, comment);
        res.status(201).json({ message: 'Calificación guardada', rating: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/ratings/:user_id/:company_id
export const deleteRatingCtrl = async (req, res) => {
    try {
        const { user_id, company_id } = req.params;
        const deleted = await deleteRating(user_id, company_id);
        if (!deleted) return res.status(404).json({ error: 'Calificación no encontrada' });
        res.json({ message: 'Calificación eliminada', rating: deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
