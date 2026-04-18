import { pool } from '../db.js';

// OBTENER TODAS LAS EMPRESAS
export const getAllCompanies = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM companies');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// OBTENER EMPRESA POR ID
export const getCompanyById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
        const company = result.rows[0] || null;
        if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });
        res.json(company);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// OBTENER EMPRESA POR ID DEL DUEÑO (owner_id)
export const getCompaniesByOwner = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM companies WHERE owner_id = $1', [req.params.owner_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// BUSCAR EMPRESA POR NOMBRE
export const getBuscarEmpresaNombre = async (req, res) => {
    try {
        const { nombre } = req.params;
        const buscar = `%${nombre}%`;
        const result = await pool.query(
            "SELECT * FROM companies WHERE name ILIKE $1", [buscar]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREAR UNA NUEVA EMPRESA
export const postCrearEmpresa = async (req, res) => {
    try {
        const { owner_id, name, logo, industry, size, website, description, location } = req.body;
        const query = `
            INSERT INTO companies
                (owner_id, name, logo, industry, size, website, description, location)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;`;

        const result = await pool.query(query, [
            owner_id,
            name,
            logo,
            industry,
            size,
            website,
            description,
            location
        ]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ACTUALIZAR EMPRESA
export const actualizarEmpresa = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, logo, industry, size, website, description, location, verified } = req.body;

        const query = `
            UPDATE companies
            SET name=$1, logo=$2, industry=$3, size=$4, website=$5,
                description=$6, location=$7, verified=$8, updated_at=CURRENT_TIMESTAMP
            WHERE id=$9
            RETURNING *;`;

        const values = [name, logo, industry, size, website, description, location, verified, id];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }

        res.status(200).json({
            message: 'Empresa actualizada correctamente',
            empresa: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ELIMINAR EMPRESA
export const eliminarEmpresa = async (req, res) => {
    try {
        const { id } = req.params;

        const empresaAEliminar = await pool.query('SELECT * FROM companies WHERE id=$1', [id]);

        if (empresaAEliminar.rowCount === 0) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }

        await pool.query('DELETE FROM companies WHERE id=$1', [id]);

        res.status(200).json({
            message: 'Empresa eliminada correctamente',
            empresa: empresaAEliminar.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};