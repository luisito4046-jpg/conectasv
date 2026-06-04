// ============================================================
//  employerApp.js — Lógica del Panel de Empresa (Empleador)
// ============================================================

// ── PUBLICAR VACANTE ─────────────────────────────────────────
window.publishJob = async function () {
    if (!currentUser || currentUser.role !== 'employer') {
        showToastNotif('Debes iniciar sesión como empresa', 'error');
        return;
    }

    const title       = document.getElementById('jobTitle').value.trim();
    const type        = document.getElementById('jobType').value;
    const level       = document.getElementById('jobLevel').value;
    const salaryMin   = document.getElementById('jobSalaryMin').value;
    const salaryMax   = document.getElementById('jobSalaryMax').value;
    const location    = document.getElementById('jobLocation').value.trim();
    const requirements = document.getElementById('jobRequirements').value.trim();
    const description = document.getElementById('jobDescription').value.trim();
    const contactEmail = document.getElementById('jobContact').value.trim();

    // Validaciones
    if (!title || !description || !contactEmail) {
        showToastNotif('Título, descripción y correo de contacto son obligatorios.', 'error');
        return;
    }

    try {
        const res = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employer_id: currentUser.id,
                company_name: `${currentUser.first_name} ${currentUser.last_name}`,
                title,
                type,
                level,
                salary_min: salaryMin || null,
                salary_max: salaryMax || null,
                location,
                requirements,
                description,
                contact_email: contactEmail
            })
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToastNotif(data.error || 'Error al publicar vacante', 'error');
            return;
        }

        showToastNotif('¡Vacante publicada exitosamente!');

        // Limpiar formulario
        document.getElementById('jobTitle').value = '';
        document.getElementById('jobSalaryMin').value = '';
        document.getElementById('jobSalaryMax').value = '';
        document.getElementById('jobLocation').value = '';
        document.getElementById('jobRequirements').value = '';
        document.getElementById('jobDescription').value = '';
        document.getElementById('jobContact').value = '';

        // Recargar lista de vacantes
        loadEmployerJobs();

    } catch (err) {
        showToastNotif('Error de conexión al publicar vacante', 'error');
    }
};

// ── CARGAR VACANTES DEL EMPLEADOR ────────────────────────────
window.loadEmployerJobs = async function () {
    if (!currentUser) return;

    const container = document.getElementById('employerJobsList');
    if (!container) return;

    try {
        const res = await fetch(`/api/jobs/employer/${currentUser.id}`);
        const jobs = await res.json();

        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4" style="color:var(--tb-muted)">
                    <i class="bi bi-inbox" style="font-size:2rem;opacity:.4"></i>
                    <p class="mt-2 small" style="color:#888">No has publicado vacantes aún. ¡Publica tu primera vacante!</p>
                </div>`;
            return;
        }

        container.innerHTML = jobs.map(job => {
            const typeLabels = { full: 'Tiempo Completo', part: 'Medio Tiempo', remote: 'Remoto', contract: 'Contrato', freelance: 'Freelance' };
            const statusColors = { active: 'success', paused: 'warning', closed: 'secondary' };
            const statusLabels = { active: 'Activa', paused: 'Pausada', closed: 'Cerrada' };
            const salary = job.salary_min && job.salary_max
                ? `$${Number(job.salary_min).toLocaleString()} – $${Number(job.salary_max).toLocaleString()}`
                : job.salary_min ? `Desde $${Number(job.salary_min).toLocaleString()}`
                : job.salary_max ? `Hasta $${Number(job.salary_max).toLocaleString()}`
                : 'No especificado';

            // Logo de empresa en la card de vacante
            const logoUrl = currentUser?.company_logo_url ?? job.company_logo_url ?? null;
            const logoHTML = logoUrl
                ? `<img src="${logoUrl}" alt="Logo"
                        style="width:40px;height:40px;border-radius:8px;object-fit:cover;
                               border:1px solid rgba(0,0,0,.08);flex-shrink:0">`
                : `<div style="width:40px;height:40px;border-radius:8px;flex-shrink:0;
                               background:var(--accent,#e8943a);color:#fff;
                               display:flex;align-items:center;justify-content:center;
                               font-size:16px;font-weight:700">
                       ${(currentUser?.first_name ?? job.company_name ?? '?')[0].toUpperCase()}
                   </div>`;

            return `
            <div class="tb-card" style="border-left:3px solid var(--${statusColors[job.status] || 'secondary'})">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center gap-3">
                        ${logoHTML}
                        <div>
                        <h6 class="mb-1" style="font-weight:700;color:var(--tb-heading,#1a1a2e)">${job.title}</h6>
                        <div class="d-flex flex-wrap gap-2 align-items-center">
                            <span class="badge bg-${statusColors[job.status] || 'secondary'} bg-opacity-10 text-${statusColors[job.status] || 'secondary'}" 
                                  style="font-size:11px">${statusLabels[job.status] || job.status}</span>
                            <span style="font-size:12px;color:#888">
                                <i class="bi bi-briefcase me-1"></i>${typeLabels[job.type] || job.type}
                            </span>
                            <span style="font-size:12px;color:#888">
                                <i class="bi bi-geo-alt me-1"></i>${job.location || 'No especificado'}
                            </span>
                            <span style="font-size:12px;color:#888">
                                <i class="bi bi-cash me-1"></i>${salary}
                            </span>
                        </div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-primary bg-opacity-10 text-primary" style="font-size:12px">
                            <i class="bi bi-people me-1"></i>${job.total_applications || 0} postulantes
                        </span>
                    </div>
                </div>
                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-sm tb-btn-primary" onclick="showCandidates(${job.id}, '${job.title.replace(/'/g, "\\'")}')">
                        <i class="bi bi-people me-1"></i>Ver Postulantes
                    </button>
                    ${job.status === 'active' 
                        ? `<button class="btn btn-sm tb-btn-ghost" onclick="toggleJobStatus(${job.id}, 'paused')">
                               <i class="bi bi-pause-circle me-1"></i>Pausar
                           </button>`
                        : job.status === 'paused'
                        ? `<button class="btn btn-sm tb-btn-ghost" onclick="toggleJobStatus(${job.id}, 'active')">
                               <i class="bi bi-play-circle me-1"></i>Reactivar
                           </button>`
                        : ''
                    }
                    <button class="btn btn-sm tb-btn-ghost" onclick="closeJob(${job.id})" 
                            ${job.status === 'closed' ? 'disabled' : ''}>
                        <i class="bi bi-x-circle me-1"></i>Cerrar
                    </button>
                    <button class="btn btn-sm" style="color:#dc3545;border:1px solid rgba(220,53,69,.3);font-size:12px" 
                            onclick="deleteEmployerJob(${job.id})">
                        <i class="bi bi-trash me-1"></i>Eliminar
                    </button>
                </div>
            </div>`;
        }).join('');

    } catch (err) {
        container.innerHTML = '<p class="text-center text-danger small">Error al cargar vacantes</p>';
    }
};

// ── VER POSTULANTES DE UNA VACANTE ───────────────────────────
window.showCandidates = async function (jobId, jobTitle) {
    const card = document.getElementById('candidateTableCard');
    const titleEl = document.getElementById('selectedJobTitle');
    const tbody = document.getElementById('candidatesTableBody');

    if (!card || !tbody) return;

    titleEl.textContent = jobTitle;
    card.style.display = '';

    try {
        const res = await fetch(`/api/applications/job/${jobId}`);
        const apps = await res.json();

        if (apps.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="4" class="text-center py-3" style="color:#888">
                    No hay postulantes para esta vacante
                </td></tr>`;
            return;
        }

        tbody.innerHTML = apps.map(app => {
            const initials = `${app.first_name[0]}${app.last_name[0]}`.toUpperCase();
            const statusLabels = {
                pending: 'Pendiente', reviewed: 'Revisado',
                interview: 'Entrevista', accepted: 'Aceptado', rejected: 'Rechazado'
            };
            const statusColors = {
                pending: 'warning', reviewed: 'info',
                interview: 'primary', accepted: 'success', rejected: 'danger'
            };
            const date = new Date(app.applied_at).toLocaleDateString('es-SV', {
                day: '2-digit', month: 'short', year: 'numeric'
            });

            return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div style="width:32px;height:32px;border-radius:50%;background:var(--accent,#e8943a);
                             color:#fff;display:flex;align-items:center;justify-content:center;
                             font-size:12px;font-weight:700">${initials}</div>
                        <div>
                            <div style="font-weight:600">${app.first_name} ${app.last_name}</div>
                            <div style="font-size:11px;color:#888">${app.email}</div>
                        </div>
                    </div>
                </td>
                <td style="font-size:13px;color:#666">${date}</td>
                <td>
                    <span class="badge bg-${statusColors[app.status]} bg-opacity-10 text-${statusColors[app.status]}" 
                          style="font-size:11px">${statusLabels[app.status] || app.status}</span>
                </td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-sm tb-btn-ghost dropdown-toggle" data-bs-toggle="dropdown" 
                                style="font-size:12px">
                            Acción
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item small" href="#" onclick="viewCandidateDetail(${app.candidate_id}); return false;">
                                <i class="bi bi-person me-2"></i>Ver Perfil</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item small" href="#" onclick="updateCandidateStatus(${app.id}, 'reviewed', ${jobId}, '${jobTitle.replace(/'/g, "\\'")}'); return false;">
                                <i class="bi bi-eye me-2"></i>Marcar Revisado</a></li>
                            <li><a class="dropdown-item small" href="#" onclick="updateCandidateStatus(${app.id}, 'interview', ${jobId}, '${jobTitle.replace(/'/g, "\\'")}'); return false;">
                                <i class="bi bi-calendar-event me-2"></i>Agendar Entrevista</a></li>
                            <li><a class="dropdown-item small text-success" href="#" onclick="updateCandidateStatus(${app.id}, 'accepted', ${jobId}, '${jobTitle.replace(/'/g, "\\'")}'); return false;">
                                <i class="bi bi-check-circle me-2"></i>Aceptar</a></li>
                            <li><a class="dropdown-item small text-danger" href="#" onclick="updateCandidateStatus(${app.id}, 'rejected', ${jobId}, '${jobTitle.replace(/'/g, "\\'")}'); return false;">
                                <i class="bi bi-x-circle me-2"></i>Rechazar</a></li>
                        </ul>
                    </div>
                </td>
            </tr>`;
        }).join('');

    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger small">Error al cargar postulantes</td></tr>';
    }
};

// ── CAMBIAR ESTADO DE POSTULACIÓN ────────────────────────────
window.updateCandidateStatus = async function (appId, newStatus, jobId, jobTitle) {
    try {
        const res = await fetch(`/api/applications/${appId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!res.ok) {
            showToastNotif('Error al actualizar estado', 'error');
            return;
        }

        const labels = {
            reviewed: 'revisado', interview: 'en entrevista',
            accepted: 'aceptado', rejected: 'rechazado'
        };
        showToastNotif(`Candidato marcado como ${labels[newStatus] || newStatus}`);
        showCandidates(jobId, jobTitle);

    } catch (err) {
        showToastNotif('Error de conexión', 'error');
    }
};

// ── VER PERFIL DEL CANDIDATO (MODAL) ─────────────────────────
window.viewCandidateDetail = async function (candidateId) {
    try {
        const res  = await fetch(`/api/users/${candidateId}`);
        if (!res.ok) { showToastNotif('Candidato no encontrado', 'error'); return; }
        const user = await res.json();

        const avatar = user.profile_photo_url
            ? `<img src="${user.profile_photo_url}" alt="Avatar"
                    style="width:56px;height:56px;border-radius:50%;object-fit:cover;flex-shrink:0">`
            : `<div style="width:56px;height:56px;border-radius:50%;background:var(--accent,#e8943a);
                    color:#fff;display:flex;align-items:center;justify-content:center;
                    font-size:20px;font-weight:700;flex-shrink:0">
                   ${user.first_name[0]}${user.last_name[0]}
               </div>`;

        const body = document.getElementById('candidateDetailBody');
        body.innerHTML = `
            <div class="d-flex align-items-center gap-3 mb-4">
                ${avatar}
                <div>
                    <h5 class="mb-0" style="font-weight:700">${user.first_name} ${user.last_name}</h5>
                    <p class="mb-0 small" style="color:#888">${user.role === 'candidate' ? 'Candidato' : user.role}</p>
                </div>
            </div>
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="tb-label">Correo Electrónico</label>
                    <p style="font-size:14px">${user.email}</p>
                </div>
                <div class="col-md-6">
                    <label class="tb-label">Teléfono</label>
                    <p style="font-size:14px">${user.phone || 'No especificado'}</p>
                </div>
                <div class="col-md-6">
                    <label class="tb-label">Ubicación</label>
                    <p style="font-size:14px">${user.location || 'No especificado'}</p>
                </div>
                <div class="col-md-6">
                    <label class="tb-label">Estado</label>
                    <p style="font-size:14px">
                        <span class="badge bg-${user.status === 'active' ? 'success' : 'danger'} bg-opacity-10 
                              text-${user.status === 'active' ? 'success' : 'danger'}">
                            ${user.status === 'active' ? 'Activo' : 'Suspendido'}
                        </span>
                    </p>
                </div>
                <div class="col-12">
                    <label class="tb-label">Resumen Profesional</label>
                    <p style="font-size:14px">${user.bio || 'Sin resumen profesional'}</p>
                </div>
            </div>`;

        new bootstrap.Modal(document.getElementById('candidateDetailModal')).show();
    } catch (err) {
        showToastNotif('Error al cargar perfil del candidato', 'error');
    }
};

// ── PAUSAR / REACTIVAR VACANTE ───────────────────────────────
window.toggleJobStatus = async function (jobId, newStatus) {
    try {
        const res = await fetch(`/api/jobs/${jobId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!res.ok) {
            showToastNotif('Error al cambiar estado', 'error');
            return;
        }

        showToastNotif(`Vacante ${newStatus === 'active' ? 'reactivada' : 'pausada'}`);
        loadEmployerJobs();

    } catch (err) {
        showToastNotif('Error de conexión', 'error');
    }
};

// ── CERRAR VACANTE ───────────────────────────────────────────
window.closeJob = async function (jobId) {
    if (!confirm('¿Cerrar esta vacante? Ya no aparecerá en las búsquedas.')) return;

    try {
        const res = await fetch(`/api/jobs/${jobId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'closed' })
        });

        if (!res.ok) {
            showToastNotif('Error al cerrar vacante', 'error');
            return;
        }

        showToastNotif('Vacante cerrada');
        loadEmployerJobs();

    } catch (err) {
        showToastNotif('Error de conexión', 'error');
    }
};

// ── ELIMINAR VACANTE ─────────────────────────────────────────
window.deleteEmployerJob = async function (jobId) {
    if (!confirm('¿Eliminar esta vacante permanentemente? Esta acción no se puede deshacer.')) return;

    try {
        const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });

        if (!res.ok) {
            showToastNotif('Error al eliminar vacante', 'error');
            return;
        }

        showToastNotif('Vacante eliminada');
        loadEmployerJobs();
        
        const card = document.getElementById('candidateTableCard');
        if (card) card.style.display = 'none';

    } catch (err) {
        showToastNotif('Error de conexión', 'error');
    }
};

// ── ACTUALIZAR FOTO DE PERFIL (EMPLOYER) ─────────────────────
window.uploadProfilePhoto = async function () {
    const fileInput = document.getElementById('photoInput');
    if (!fileInput?.files[0]) {
        showToastNotif('Selecciona una imagen primero', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('photo', fileInput.files[0]);

    try {
        const res  = await fetch(`/api/users/${currentUser.id}/avatar`, {
            method: 'PATCH',
            body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
            showToastNotif(data.error || 'Error al subir foto', 'error');
            return;
        }

        const avatar = document.getElementById('employerAvatar');
        if (avatar) avatar.src = data.profile_photo_url;

        showToastNotif('Foto de perfil actualizada');
    } catch (err) {
        showToastNotif('Error de conexión al subir foto', 'error');
    }
};

// ── GUARDAR PERFIL DE EMPRESA (soporta logo via FormData) ────
window.saveCompanyProfile = async function () {
    const companyId = currentUser?.company_id ?? null;

    const name        = document.getElementById('companyName')?.value.trim()         ?? '';
    const industry    = document.getElementById('companyIndustry')?.value.trim()     ?? '';
    const size        = document.getElementById('companySize')?.value                ?? '';
    const website     = document.getElementById('companyWebsite')?.value.trim()      ?? '';
    const location    = document.getElementById('companyLocation')?.value.trim()     ?? '';
    const description = document.getElementById('companyDescription')?.value.trim()  ?? '';
    const logoFile    = document.getElementById('companyLogoInput')?.files[0]        ?? null;

    if (!name) {
        showToastNotif('El nombre de la empresa es obligatorio', 'error');
        return;
    }

    try {
        let res;

        if (companyId) {
            // ── EDITAR empresa existente (PUT) ────────────────────────
            if (logoFile) {
                const formData = new FormData();
                formData.append('name',        name);
                formData.append('industry',    industry);
                formData.append('size',        size);
                formData.append('website',     website);
                formData.append('location',    location);
                formData.append('description', description);
                formData.append('company_logo', logoFile);
                res = await fetch(`/api/companies/${companyId}`, { method: 'PUT', body: formData });
            } else {
                res = await fetch(`/api/companies/${companyId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, industry, size, website, location, description })
                });
            }
        } else {
            // ── CREAR empresa nueva (POST) ────────────────────────────
            res = await fetch('/api/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner_id: currentUser.id,
                    name, industry, size, website, location, description
                })
            });
        }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            showToastNotif(data.error || 'Error al guardar perfil de empresa', 'error');
            return;
        }

        // Si se creó empresa nueva, guardar el company_id en sesión
        const company = data.empresa ?? data;
        if (!companyId && company?.id) {
            currentUser.company_id = company.id;
            const key = currentUser.role === 'employer' ? 'employerUser' : 'candidateUser';
            sessionStorage.setItem(key, JSON.stringify(currentUser));

            // Ocultar el aviso de "sin empresa" si existe
            const noCompanyBanner = document.getElementById('noCompanyBanner');
            if (noCompanyBanner) noCompanyBanner.style.display = 'none';
        }

        // Actualizar vista previa del logo si el backend devuelve la URL
        const logoUrl = company?.logo_url ?? data?.logo_url ?? null;
        if (logoUrl) {
            const preview = document.getElementById('companyLogoPreview');
            if (preview) { preview.src = logoUrl; preview.style.display = 'block'; }

            if (currentUser) {
                currentUser.company_logo_url = logoUrl;
                currentUser.profile_photo_url = logoUrl; // Make the profile photo the logo
                const key = currentUser.role === 'employer' ? 'employerUser' : 'candidateUser';
                sessionStorage.setItem(key, JSON.stringify(currentUser));
                
                const avatar = document.getElementById('employerAvatar');
                if (avatar) avatar.src = logoUrl;
                
                const topAvatar = document.getElementById('topbarAvatar');
                if (topAvatar) {
                    topAvatar.style.backgroundImage = `url("${logoUrl}")`;
                    topAvatar.style.backgroundSize = 'cover';
                    topAvatar.style.backgroundPosition = 'center';
                    topAvatar.style.backgroundColor = 'transparent';
                    topAvatar.textContent = '';
                }
            }
        }

        showToastNotif(companyId ? 'Perfil de empresa actualizado' : '¡Empresa creada correctamente!');

    } catch (err) {
        console.error('saveCompanyProfile error:', err);
        showToastNotif('Error de conexión al guardar perfil', 'error');
    }
};

// ── AVATAR/LOGO DE EMPRESA (clickeable en detalle de empleo) ──
window.buildCompanyAvatar = function (job, size = 56, clickable = false) {
    const click = clickable && job.company_id
        ? `onclick="openCompanyProfile(${job.company_id})" title="Ver perfil de empresa" style="cursor:pointer"`
        : '';
    const sizeCSS = `width:${size}px;height:${size}px;border-radius:12px;flex-shrink:0;`;

    if (job.company_logo_url) {
        return `<img src="${job.company_logo_url}" alt="${job.company_name ?? ''}"
                     ${click}
                     style="${sizeCSS}object-fit:cover;border:2px solid rgba(0,0,0,.06)">`;
    }

    const initial = (job.company_name ?? '?')[0].toUpperCase();
    const fontSize = Math.round(size * 0.36);
    return `<div ${click}
                 style="${sizeCSS}background:var(--accent,#e8943a);color:#fff;
                        display:flex;align-items:center;justify-content:center;
                        font-size:${fontSize}px;font-weight:700;
                        ${clickable ? 'cursor:pointer;' : ''}">
                ${initial}
            </div>`;
};

// ── MODAL DE PERFIL DE EMPRESA ────────────────────────────────
window.openCompanyProfile = async function (companyId) {
    if (!companyId) return;

    const body  = document.getElementById('companyProfileBody');
    const modal = new bootstrap.Modal(document.getElementById('companyProfileModal'));

    body.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="mt-2 small" style="color:#888">Cargando perfil...</p>
        </div>`;
    modal.show();

    try {
        const res = await fetch(`/api/companies/${companyId}`);
        if (!res.ok) throw new Error('not found');
        const c = await res.json();

        const logoHTML = c.logo_url
            ? `<img src="${c.logo_url}" alt="${c.name}"
                    style="width:80px;height:80px;border-radius:16px;object-fit:cover;
                           border:2px solid rgba(0,0,0,.08)">`
            : `<div style="width:80px;height:80px;border-radius:16px;
                           background:var(--accent,#e8943a);color:#fff;
                           display:flex;align-items:center;justify-content:center;
                           font-size:32px;font-weight:700">
                   ${(c.name ?? '?')[0].toUpperCase()}
               </div>`;

        const sizeLabels = { small: 'Pequeña (1–50)', medium: 'Mediana (51–200)', large: 'Grande (200+)' };

        body.innerHTML = `
            <div class="d-flex align-items-center gap-3 mb-4">
                ${logoHTML}
                <div>
                    <h4 class="mb-0" style="font-weight:700">${c.name ?? '—'}</h4>
                    ${c.industry
                        ? `<span class="badge rounded-pill mt-1"
                                  style="background:rgba(232,148,58,.15);color:var(--accent,#e8943a);
                                         font-size:12px;font-weight:600">
                               ${c.industry}
                           </span>`
                        : ''}
                </div>
            </div>
            <div class="row g-3">
                ${c.location ? `
                <div class="col-md-6">
                    <p class="tb-label mb-1">Ubicación</p>
                    <p style="font-size:14px"><i class="bi bi-geo-alt me-1" style="color:var(--accent,#e8943a)"></i>${c.location}</p>
                </div>` : ''}
                ${c.size ? `
                <div class="col-md-6">
                    <p class="tb-label mb-1">Tamaño</p>
                    <p style="font-size:14px"><i class="bi bi-people me-1" style="color:var(--accent,#e8943a)"></i>${sizeLabels[c.size] ?? c.size}</p>
                </div>` : ''}
                ${c.website ? `
                <div class="col-md-6">
                    <p class="tb-label mb-1">Sitio Web</p>
                    <p style="font-size:14px">
                        <a href="${c.website}" target="_blank" rel="noopener"
                           style="color:var(--accent,#e8943a);text-decoration:none">
                            <i class="bi bi-link-45deg me-1"></i>${c.website}
                        </a>
                    </p>
                </div>` : ''}
                ${c.founded_year ? `
                <div class="col-md-6">
                    <p class="tb-label mb-1">Fundada</p>
                    <p style="font-size:14px"><i class="bi bi-calendar me-1" style="color:var(--accent,#e8943a)"></i>${c.founded_year}</p>
                </div>` : ''}
                ${c.description ? `
                <div class="col-12">
                    <p class="tb-label mb-1">Sobre la Empresa</p>
                    <p style="font-size:14px;line-height:1.6">${c.description}</p>
                </div>` : ''}
            </div>`;

    } catch {
        body.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-building-x" style="font-size:2.5rem;opacity:.3"></i>
                <p class="mt-2 small" style="color:#888">No se encontró información de la empresa.</p>
            </div>`;
    }
};

// ── TOAST HELPER (reutiliza el toast del index.html) ─────────
function showToastNotif(msg, type = 'success') {
    const toastEl = document.getElementById('toastNotif');
    const toastMsg = document.getElementById('toastMsg');
    if (!toastEl || !toastMsg) return;

    toastMsg.textContent = msg;
    toastEl.className = `toast tb-toast align-items-center ${type === 'error' ? 'text-bg-danger' : 'text-bg-success'}`;
    bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3500 }).show();
}
