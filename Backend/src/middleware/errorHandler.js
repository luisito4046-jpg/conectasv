// ── CÓDIGOS DE ERROR CONOCIDOS ────────────────────────────────
const PG_ERRORS = {
    '23505': { status: 409, message: 'Ya existe un registro con esos datos (duplicado).' },
    '23503': { status: 400, message: 'Referencia inválida: el recurso relacionado no existe.' },
    '23502': { status: 400, message: 'Falta un campo obligatorio en la base de datos.' },
    '22P02': { status: 400, message: 'Formato de dato inválido (ej: UUID o número esperado).' },
    '42703': { status: 400, message: 'Columna no reconocida en la consulta.' },
};

// ── MIDDLEWARE PRINCIPAL ──────────────────────────────────────
export const errorHandler = (err, req, res, next) => {
    // Log en consola siempre (puedes cambiarlo por un logger como winston)
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} →`, err);

    // Error de PostgreSQL
    if (err.code && PG_ERRORS[err.code]) {
        const { status, message } = PG_ERRORS[err.code];
        return res.status(status).json({ error: message, detail: err.detail ?? null });
    }

    // Error tipado manualmente (ej: desde login.service.js)
    if (err.status) {
        return res.status(err.status).json({ error: err.message });
    }

    // Error genérico / inesperado
    res.status(500).json({ error: 'Error interno del servidor.' });
};

// ── RUTA NO ENCONTRADA (404) ──────────────────────────────────
export const notFound = (req, res) => {
    res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};
