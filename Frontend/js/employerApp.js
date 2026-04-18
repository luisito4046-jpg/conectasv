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

            return `
            <div class="tb-card" style="border-left:3px solid var(--${statusColors[job.status] || 'secondary'})">
                <div class="d-flex justify-content-between align-items-start mb-2">
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
        const res = await fetch(`/api/users/buscarPorEmail/placeholder`);
        // Usaremos el endpoint de todos los usuarios y filtramos
        const allRes = await fetch('/api/users');
        const users = await allRes.json();
        const user = users.find(u => u.id === candidateId);

        if (!user) {
            showToastNotif('Candidato no encontrado', 'error');
            return;
        }

        const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        const body = document.getElementById('candidateDetailBody');

        body.innerHTML = `
            <div class="d-flex align-items-center gap-3 mb-4">
                <div style="width:56px;height:56px;border-radius:50%;background:var(--accent,#e8943a);
                     color:#fff;display:flex;align-items:center;justify-content:center;
                     font-size:20px;font-weight:700">${initials}</div>
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
                              text-${user.status === 'active' ? 'success' : 'danger'}">${user.status === 'active' ? 'Activo' : 'Suspendido'}</span>
                    </p>
                </div>
                <div class="col-12">
                    <label class="tb-label">Resumen Profesional</label>
                    <p style="font-size:14px">${user.bio || 'Sin resumen profesional'}</p>
                </div>
            </div>`;

        const modal = new bootstrap.Modal(document.getElementById('candidateDetailModal'));
        modal.show();

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

        // Ocultar tabla de postulantes si estaba visible
        const card = document.getElementById('candidateTableCard');
        if (card) card.style.display = 'none';

    } catch (err) {
        showToastNotif('Error de conexión', 'error');
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
