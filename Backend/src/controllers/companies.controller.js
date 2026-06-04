import {
    findAllCompanies,
    findCompanyById,
    findCompaniesByOwner,
    findCompaniesByName,
    insertCompany,
    updateCompany,
    deleteCompany,
} from '../services/companies.service.js';
import { uploadToCloudinary } from '../middleware/upload.js';

export const getAllCompanies = async (req, res) => {
    try {
        res.json(await findAllCompanies());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getCompanyById = async (req, res) => {
    try {
        const company = await findCompanyById(req.params.id);
        if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });
        res.json(company);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getCompaniesByOwner = async (req, res) => {
    try {
        res.json(await findCompaniesByOwner(req.params.owner_id));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getBuscarEmpresaNombre = async (req, res) => {
    try {
        res.json(await findCompaniesByName(req.params.nombre));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const postCrearEmpresa = async (req, res) => {
    try {
        const company = await insertCompany(req.body);
        res.status(201).json(company);
    } catch (err) {
        if (err.code === 'COMPANY_ALREADY_EXISTS') {
            return res.status(409).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/companies/:id
// Soporta multipart/form-data con campo "company_logo" para subir logo a Cloudinary.
// Si no viene archivo, actualiza solo los campos de texto (igual que users).
export const actualizarEmpresa = async (req, res) => {
    try {
        const companyData = { ...req.body };

        if (req.file) {
            const publicId = `company_${req.params.id}_${Date.now()}`;
            const result   = await uploadToCloudinary(req.file.buffer, publicId, 'conectasv/logos');
            companyData.logo_url = result.secure_url;
        }

        const company = await updateCompany(req.params.id, companyData);
        if (!company) return res.status(404).json({ message: 'Empresa no encontrada' });

        res.status(200).json({ message: 'Empresa actualizada correctamente', empresa: company });
    } catch (err) {
        console.error('ERROR actualizarEmpresa:', err);
        res.status(500).json({ error: err.message });
    }
};

export const eliminarEmpresa = async (req, res) => {
    try {
        const company = await deleteCompany(req.params.id);
        if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });
        res.status(200).json({ message: 'Empresa eliminada correctamente', empresa: company });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
