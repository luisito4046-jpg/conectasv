import { Router } from 'express';
import { uploadLogo } from '../middleware/upload.js';
import {
    getAllCompanies,
    getCompanyById,
    getCompaniesByOwner,
    getBuscarEmpresaNombre,
    postCrearEmpresa,
    actualizarEmpresa,
    eliminarEmpresa
} from '../controllers/companies.controller.js';

const router = Router();

// OBTENER TODAS LAS EMPRESAS
router.get('/', getAllCompanies);

// OBTENER EMPRESAS POR ID DEL DUEÑO
router.get('/buscarPorDuenio/:owner_id', getCompaniesByOwner);

// BUSCAR EMPRESA POR NOMBRE
router.get('/buscarPorNombre/:nombre', getBuscarEmpresaNombre);

// OBTENER EMPRESA POR ID
router.get('/:id', getCompanyById);

// CREAR UNA NUEVA EMPRESA
router.post('/', postCrearEmpresa);

// ACTUALIZAR EMPRESA — uploadLogo procesa multipart/form-data
// El campo del archivo debe llamarse "company_logo"
router.put('/:id', uploadLogo, actualizarEmpresa);

// ELIMINAR EMPRESA
router.delete('/:id', eliminarEmpresa);

export default router;
