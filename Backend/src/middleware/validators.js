// ── HELPER INTERNO ────────────────────────────────────────────
const fail = (res, message) => res.status(400).json({ error: message });

// ── AUTH / LOGIN ──────────────────────────────────────────────
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)      return fail(res, 'Email y contraseña son requeridos.');
    if (!/\S+@\S+\.\S+/.test(email)) return fail(res, 'Formato de email inválido.');
    next();
};

// ── USUARIOS ──────────────────────────────────────────────────
export const validateCrearUsuario = (req, res, next) => {
    const { first_name, last_name, email, password_hash } = req.body;
    if (!first_name)                   return fail(res, 'El campo first_name es obligatorio.');
    if (!last_name)                    return fail(res, 'El campo last_name es obligatorio.');
    if (!email)                        return fail(res, 'El campo email es obligatorio.');
    if (!/\S+@\S+\.\S+/.test(email))  return fail(res, 'Formato de email inválido.');
    if (!password_hash)                return fail(res, 'La contraseña es obligatoria.');
    if (password_hash.length < 6)      return fail(res, 'La contraseña debe tener al menos 6 caracteres.');
    next();
};

export const validateActualizarUsuario = (req, res, next) => {
    const { email, role, status } = req.body;
    const rolesValidos   = ['candidate', 'employer', 'admin'];
    const statusValidos  = ['active', 'suspended'];

    if (email && !/\S+@\S+\.\S+/.test(email))     return fail(res, 'Formato de email inválido.');
    if (role   && !rolesValidos.includes(role))    return fail(res, `Rol inválido. Valores permitidos: ${rolesValidos.join(', ')}.`);
    if (status && !statusValidos.includes(status)) return fail(res, `Status inválido. Valores permitidos: ${statusValidos.join(', ')}.`);
    next();
};

// ── EMPRESAS ──────────────────────────────────────────────────
export const validateCrearEmpresa = (req, res, next) => {
    const { owner_id, name } = req.body;
    if (!owner_id) return fail(res, 'El campo owner_id es obligatorio.');
    if (!name)     return fail(res, 'El campo name es obligatorio.');
    next();
};

export const validateActualizarEmpresa = (req, res, next) => {
    const { website } = req.body;
    if (website && !/^https?:\/\/.+/.test(website)) {
        return fail(res, 'El campo website debe ser una URL válida (http/https).');
    }
    next();
};

// ── EMPLEOS ───────────────────────────────────────────────────
const JOB_TYPES   = ['full', 'part', 'contract', 'internship', 'temporary'];
const JOB_LEVELS  = ['junior', 'mid', 'senior', 'lead', 'executive'];
const JOB_STATUS  = ['active', 'paused', 'closed'];

export const validateCrearEmpleo = (req, res, next) => {
    const { company_id, posted_by, title, description, type, level } = req.body;
    if (!company_id)                           return fail(res, 'El campo company_id es obligatorio.');
    if (!posted_by)                            return fail(res, 'El campo posted_by es obligatorio.');
    if (!title)                                return fail(res, 'El campo title es obligatorio.');
    if (!description)                          return fail(res, 'El campo description es obligatorio.');
    if (type  && !JOB_TYPES.includes(type))   return fail(res, `Tipo inválido. Valores permitidos: ${JOB_TYPES.join(', ')}.`);
    if (level && !JOB_LEVELS.includes(level)) return fail(res, `Nivel inválido. Valores permitidos: ${JOB_LEVELS.join(', ')}.`);
    next();
};

export const validateActualizarEmpleo = (req, res, next) => {
    const { type, level, status } = req.body;
    if (type   && !JOB_TYPES.includes(type))   return fail(res, `Tipo inválido. Valores permitidos: ${JOB_TYPES.join(', ')}.`);
    if (level  && !JOB_LEVELS.includes(level)) return fail(res, `Nivel inválido. Valores permitidos: ${JOB_LEVELS.join(', ')}.`);
    if (status && !JOB_STATUS.includes(status)) return fail(res, `Status inválido. Valores permitidos: ${JOB_STATUS.join(', ')}.`);
    next();
};

// ── POSTULACIONES ─────────────────────────────────────────────
const APP_STATUS = ['pending', 'reviewed', 'interview', 'rejected', 'accepted'];

export const validateCrearPostulacion = (req, res, next) => {
    const { job_id, candidate_id } = req.body;
    if (!job_id)       return fail(res, 'El campo job_id es obligatorio.');
    if (!candidate_id) return fail(res, 'El campo candidate_id es obligatorio.');
    next();
};

export const validateActualizarEstadoPostulacion = (req, res, next) => {
    const { status } = req.body;
    if (!status)                        return fail(res, 'El campo status es obligatorio.');
    if (!APP_STATUS.includes(status))   return fail(res, `Status inválido. Valores permitidos: ${APP_STATUS.join(', ')}.`);
    next();
};

// ── EMPLEOS GUARDADOS ─────────────────────────────────────────
export const validateCrearSavedJob = (req, res, next) => {
    const { user_id, job_id } = req.body;
    if (!user_id) return fail(res, 'El campo user_id es obligatorio.');
    if (!job_id)  return fail(res, 'El campo job_id es obligatorio.');
    next();
};

// ── ALERTAS ───────────────────────────────────────────────────
export const validateCrearAlerta = (req, res, next) => {
    const { user_id, query } = req.body;
    if (!user_id) return fail(res, 'El campo user_id es obligatorio.');
    if (!query)   return fail(res, 'El campo query es obligatorio.');
    next();
};
