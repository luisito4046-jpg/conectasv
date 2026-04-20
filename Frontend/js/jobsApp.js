// ============================================================
//  jobsApp.js — Exploración de empleos, detalle y postulación
// ============================================================

let allJobs = [];
let previousView = 'jobs';

// ── INICIALIZAR AL CARGAR ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadAllJobs();
});

// ── CARGAR TODOS LOS EMPLEOS ─────────────────────────────────
async function loadAllJobs() {
    try {
        const res = await fetch('/api/jobs');
        allJobs = await res.json();
        renderFeaturedJobs();
    } catch (err) {
        console.error('Error cargando empleos:', err);
    }
}

// ── EMPLEOS DESTACADOS (HOME) ────────────────────────────────
function renderFeaturedJobs() {
    const container = document.getElementById('featuredJobs');
    if (!container) return;

    const featured = allJobs.filter(j => j.status === 'active').slice(0, 6);

    if (featured.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="bi bi-briefcase" style="font-size:2.5rem;opacity:.3"></i>
                <p class="mt-2" style="color:#888">No hay vacantes disponibles en este momento</p>
            </div>`;
        return;
    }

    container.innerHTML = featured.map(job => buildJobCard(job)).join('');
}

// ── TARJETA DE EMPLEO (reutilizable) ─────────────────────────
function buildJobCard(job) {
    const typeLabels = {
        full: 'Tiempo Completo', part: 'Medio Tiempo',
        remote: 'Remoto', contract: 'Contrato', freelance: 'Freelance'
    };
    const typeIcons = {
        full: 'bi-clock-fill', part: 'bi-clock-history',
        remote: 'bi-wifi', contract: 'bi-file-earmark-text', freelance: 'bi-lightning'
    };
    const salary = job.salary_min && job.salary_max
        ? `$${Number(job.salary_min).toLocaleString()} – $${Number(job.salary_max).toLocaleString()}`
        : job.salary_min ? `Desde $${Number(job.salary_min).toLocaleString()}`
        : job.salary_max ? `Hasta $${Number(job.salary_max).toLocaleString()}`
        : null;

    const initials = (job.company_name || 'NN')
        .split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);

    const daysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000);
    const timeLabel = daysAgo === 0 ? 'Hoy' : daysAgo === 1 ? 'Ayer' : `Hace ${daysAgo} días`;

    return `
    <div class="col-md-6 col-lg-4">
        <div class="tb-card h-100" style="cursor:pointer;transition:all .2s" 
             onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 25px rgba(0,0,0,.1)'"
             onmouseleave="this.style.transform='';this.style.boxShadow=''"
             onclick="showJobDetail(${job.id})">
            <div class="d-flex align-items-center gap-3 mb-3">
                <div style="width:44px;height:44px;border-radius:10px;background:rgba(26,58,92,.08);
                     display:flex;align-items:center;justify-content:center;
                     font-size:14px;font-weight:800;color:var(--accent,#e8943a)">${initials}</div>
                <div>
                    <h6 class="mb-0" style="font-weight:700;font-size:15px">${job.title}</h6>
                    <span style="font-size:12px;color:#888">${job.company_name || 'Empresa'}</span>
                </div>
            </div>
            <div class="d-flex flex-wrap gap-2 mb-3">
                <span class="badge" style="background:rgba(26,58,92,.08);color:#1a3a5c;font-size:11px;font-weight:600">
                    <i class="bi ${typeIcons[job.type] || 'bi-briefcase'} me-1"></i>${typeLabels[job.type] || job.type}
                </span>
                ${job.location ? `<span class="badge" style="background:rgba(34,197,94,.08);color:#166534;font-size:11px;font-weight:600">
                    <i class="bi bi-geo-alt me-1"></i>${job.location}</span>` : ''}
                ${job.level ? `<span class="badge" style="background:rgba(168,85,247,.08);color:#7c3aed;font-size:11px;font-weight:600">
                    <i class="bi bi-bar-chart me-1"></i>${job.level}</span>` : ''}
            </div>
            ${salary ? `<p class="mb-2" style="font-size:15px;font-weight:700;color:var(--accent,#e8943a)">
                <i class="bi bi-cash-stack me-1"></i>${salary}/mes</p>` : ''}
            <p class="mb-0 small" style="color:#888">
                <i class="bi bi-clock me-1"></i>${timeLabel}
            </p>
        </div>
    </div>`;
}

// ── RENDERIZAR LISTADO DE EMPLEOS (VISTA EXPLORAR) ───────────
function renderJobsList(jobs) {
    const container = document.getElementById('jobsList');
    const countEl = document.getElementById('resultsCount');
    const jobCountEl = document.getElementById('jobCount');

    if (!container) return;

    const activeJobs = jobs.filter(j => j.status === 'active');

    if (jobCountEl) jobCountEl.textContent = activeJobs.length;
    if (countEl) countEl.textContent = `${activeJobs.length} resultado${activeJobs.length !== 1 ? 's' : ''}`;

    if (activeJobs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-search" style="font-size:2.5rem;opacity:.3"></i>
                <p class="mt-2" style="color:#888">No se encontraron empleos con los filtros seleccionados</p>
            </div>`;
        return;
    }

    container.innerHTML = activeJobs.map(job => {
        const typeLabels = {
            full: 'Tiempo Completo', part: 'Medio Tiempo',
            remote: 'Remoto', contract: 'Contrato', freelance: 'Freelance'
        };
        const salary = job.salary_min && job.salary_max
            ? `$${Number(job.salary_min).toLocaleString()} – $${Number(job.salary_max).toLocaleString()}`
            : job.salary_min ? `Desde $${Number(job.salary_min).toLocaleString()}`
            : job.salary_max ? `Hasta $${Number(job.salary_max).toLocaleString()}`
            : 'No especificado';
        const initials = (job.company_name || 'NN')
            .split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);
        const daysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000);
        const timeLabel = daysAgo === 0 ? 'Hoy' : daysAgo === 1 ? 'Ayer' : `Hace ${daysAgo} días`;

        return `
        <div class="tb-card" style="cursor:pointer;transition:all .2s"
             onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,.08)'"
             onmouseleave="this.style.transform='';this.style.boxShadow=''"
             onclick="showJobDetail(${job.id})">
            <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex gap-3">
                    <div style="width:48px;height:48px;border-radius:12px;background:rgba(26,58,92,.06);
                         display:flex;align-items:center;justify-content:center;flex-shrink:0;
                         font-size:14px;font-weight:800;color:var(--accent,#e8943a)">${initials}</div>
                    <div>
                        <h6 class="mb-1" style="font-weight:700;font-size:15px">${job.title}</h6>
                        <p class="mb-2" style="font-size:13px;color:#888">
                            ${job.company_name || 'Empresa'} · ${job.location || 'Sin ubicación'}
                        </p>
                        <div class="d-flex flex-wrap gap-2">
                            <span class="badge" style="background:rgba(26,58,92,.08);color:#1a3a5c;font-size:11px">
                                ${typeLabels[job.type] || job.type}</span>
                            <span class="badge" style="background:rgba(232,148,58,.1);color:#c27522;font-size:11px">
                                ${salary}</span>
                            ${job.level ? `<span class="badge" style="background:rgba(168,85,247,.08);color:#7c3aed;font-size:11px">
                                ${job.level}</span>` : ''}
                        </div>
                    </div>
                </div>
                <span style="font-size:12px;color:#aaa;white-space:nowrap">${timeLabel}</span>
            </div>
        </div>`;
    }).join('');
}

// ── DETALLE DE EMPLEO ────────────────────────────────────────
window.showJobDetail = async function (jobId) {
    previousView = document.querySelector('.tb-view.active')?.id?.replace('view-', '') || 'jobs';
    showView('job-detail');

    const mainEl = document.getElementById('jobDetailMain');
    const sideEl = document.getElementById('jobDetailSide');

    mainEl.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-secondary"></div></div>';
    sideEl.innerHTML = '';

    try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) throw new Error('No se pudo cargar el empleo');
        const job = await res.json();

        const typeLabels = {
            full: 'Tiempo Completo', part: 'Medio Tiempo',
            remote: 'Remoto', contract: 'Contrato', freelance: 'Freelance'
        };
        const levelLabels = {
            entry: 'Sin Experiencia', junior: 'Junior (1–2 años)',
            mid: 'Mid-Level (3–5 años)', senior: 'Senior (5+ años)'
        };
        const salary = job.salary_min && job.salary_max
            ? `$${Number(job.salary_min).toLocaleString()} – $${Number(job.salary_max).toLocaleString()}/mes`
            : job.salary_min ? `Desde $${Number(job.salary_min).toLocaleString()}/mes`
            : job.salary_max ? `Hasta $${Number(job.salary_max).toLocaleString()}/mes`
            : 'No especificado';
        const date = new Date(job.created_at).toLocaleDateString('es-SV', {
            day: '2-digit', month: 'long', year: 'numeric'
        });

        mainEl.innerHTML = `
            <div class="tb-card">
                <div class="d-flex align-items-center gap-3 mb-4">
                    <div style="width:56px;height:56px;border-radius:14px;background:rgba(26,58,92,.06);
                         display:flex;align-items:center;justify-content:center;
                         font-size:18px;font-weight:800;color:var(--accent,#e8943a)">
                        ${(job.company_name || 'NN').split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                        <h3 class="mb-0" style="font-weight:700">${job.title}</h3>
                        <p class="mb-0" style="color:#888">${job.company_name || 'Empresa'}</p>
                    </div>
                </div>
                <div class="d-flex flex-wrap gap-2 mb-4">
                    <span class="badge" style="background:rgba(26,58,92,.08);color:#1a3a5c;font-size:12px;padding:6px 12px">
                        <i class="bi bi-briefcase me-1"></i>${typeLabels[job.type] || job.type}</span>
                    ${job.location ? `<span class="badge" style="background:rgba(34,197,94,.08);color:#166534;font-size:12px;padding:6px 12px">
                        <i class="bi bi-geo-alt me-1"></i>${job.location}</span>` : ''}
                    ${job.level ? `<span class="badge" style="background:rgba(168,85,247,.08);color:#7c3aed;font-size:12px;padding:6px 12px">
                        <i class="bi bi-bar-chart me-1"></i>${levelLabels[job.level] || job.level}</span>` : ''}
                    <span class="badge" style="background:rgba(232,148,58,.1);color:#c27522;font-size:12px;padding:6px 12px">
                        <i class="bi bi-cash me-1"></i>${salary}</span>
                </div>
                <h5 style="font-weight:700;margin-bottom:12px">Descripción del Puesto</h5>
                <p style="white-space:pre-line;line-height:1.7;color:#444">${job.description}</p>
                ${job.requirements ? `
                    <h5 style="font-weight:700;margin:24px 0 12px">Requisitos</h5>
                    <p style="white-space:pre-line;line-height:1.7;color:#444">${job.requirements}</p>
                ` : ''}
            </div>`;

        sideEl.innerHTML = `
            <div class="tb-card mb-3">
                <h6 style="font-weight:700;margin-bottom:16px"><i class="bi bi-info-circle me-2"></i>Información</h6>
                <div class="mb-3">
                    <div style="font-size:12px;color:#888;margin-bottom:2px">Fecha de Publicación</div>
                    <div style="font-size:14px;font-weight:500">${date}</div>
                </div>
                <div class="mb-3">
                    <div style="font-size:12px;color:#888;margin-bottom:2px">Correo de Contacto</div>
                    <div style="font-size:14px;font-weight:500">${job.contact || 'No disponible'}</div>
                </div>
                <div class="mb-3">
                    <div style="font-size:12px;color:#888;margin-bottom:2px">Publicado por</div>
                    <div style="font-size:14px;font-weight:500">${job.poster_first || ''} ${job.poster_last || ''}</div>
                </div>
            </div>
            <div class="tb-card">
                <h6 style="font-weight:700;margin-bottom:12px"><i class="bi bi-send me-2"></i>¿Te interesa?</h6>
                <div class="mb-3">
                    <label class="tb-label">Carta de Presentación (opcional)</label>
                    <textarea class="form-control tb-input" rows="3" id="coverLetter"
                        placeholder="Cuéntale a la empresa por qué eres ideal…"></textarea>
                </div>
                <button class="btn tb-btn-primary w-100" onclick="applyToJob(${job.id})" id="btnApply">
                    <i class="bi bi-send-fill me-2"></i>Postularme
                </button>
                <p class="text-center small mt-2 mb-0" style="color:#aaa" id="applyNote">
                    Necesitas una cuenta de candidato para postularte
                </p>
            </div>`;

        // Si no hay sesión o no es candidato, deshabilitar botón
        if (!currentUser || currentUser.role !== 'candidate') {
            const btn = document.getElementById('btnApply');
            if (btn) {
                btn.disabled = true;
                btn.style.opacity = '.5';
            }
        }

    } catch (err) {
        mainEl.innerHTML = `<div class="text-center py-5 text-danger">
            <i class="bi bi-exclamation-circle" style="font-size:2rem"></i>
            <p class="mt-2">Error al cargar el empleo</p>
        </div>`;
    }
};

// ── POSTULARSE A UN EMPLEO ───────────────────────────────────
window.applyToJob = async function (jobId) {
    if (!currentUser || currentUser.role !== 'candidate') {
        showToastNotif('Debes iniciar sesión como candidato para postularte', 'error');
        return;
    }

    const coverLetter = document.getElementById('coverLetter')?.value?.trim() || '';

    try {
        const res = await fetch('/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                job_id: jobId,
                candidate_id: currentUser.id,
                cover_letter: coverLetter || null
            })
        });

        const data = await res.json();

        if (!res.ok) {
            showToastNotif(data.error || 'Error al postularse', 'error');
            return;
        }

        showToastNotif('¡Te has postulado exitosamente!');

        // Deshabilitar botón
        const btn = document.getElementById('btnApply');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Ya te postulaste';
            btn.style.opacity = '.5';
        }

    } catch (err) {
        showToastNotif('Error de conexión al postularse', 'error');
    }
};

// ── BÚSQUEDA Y FILTROS ──────────────────────────────────────

window.performSearch = function () {
    const term = document.getElementById('searchTerm')?.value?.trim().toLowerCase() || '';
    const location = document.getElementById('searchLocation')?.value?.trim().toLowerCase() || '';
    const type = document.getElementById('filterType')?.value || '';
    const salary = document.getElementById('filterSalary')?.value || '';
    const exp = document.getElementById('filterExp')?.value || '';
    const area = document.getElementById('filterArea')?.value || '';

    const areaMap = {
        tech: 'Tecnología',
        marketing: 'Marketing',
        finance: 'Finanzas',
        health: 'Salud',
        education: 'Educación',
        sales: 'Ventas'
    };

    let filtered = allJobs.filter(j => j.status === 'active');

    if (term) {
        filtered = filtered.filter(j =>
            j.title.toLowerCase().includes(term) ||
            (j.company_name || '').toLowerCase().includes(term) ||
            (j.description || '').toLowerCase().includes(term) ||
            (j.requirements || '').toLowerCase().includes(term)
        );
    }
    if (location) {
        filtered = filtered.filter(j => (j.location || '').toLowerCase().includes(location));
    }
    if (type) {
        filtered = filtered.filter(j => j.type === type);
    }
    if (exp) {
        filtered = filtered.filter(j => j.level === exp);
    }
    if (area) {
        const expectedArea = areaMap[area] || area;
        filtered = filtered.filter(j => (j.area || '').toLowerCase() === expectedArea.toLowerCase());
    }
    if (salary) {
        filtered = filtered.filter(j => {
            const min = Number(j.salary_min) || 0;
            const max = Number(j.salary_max) || Infinity;
            if (salary === '0-500') return min < 500 || max <= 500;
            if (salary === '500-1000') return max >= 500 && min <= 1000;
            if (salary === '1000-2000') return max >= 1000 && min <= 2000;
            if (salary === '2000-4000') return max >= 2000 && min <= 4000;
            if (salary === '4000+') return max >= 4000 || min >= 4000;
            return true;
        });
    }

    showView('jobs');
    setTimeout(() => renderJobsList(filtered), 100);
};

window.quickSearch = function (term) {
    document.getElementById('searchTerm').value = term;
    performSearch();
};

window.applyFilters = function () {
    // Lee checkboxes del sidebar de la vista jobs
    const types = [...document.querySelectorAll('#view-jobs .tb-check-group:first-of-type input:checked')]
        .map(cb => cb.value);
    const levels = [...document.querySelectorAll('#view-jobs .tb-check-group:last-of-type input:checked')]
        .map(cb => cb.value);

    let filtered = allJobs.filter(j => j.status === 'active');

    if (types.length > 0) {
        filtered = filtered.filter(j => types.includes(j.type));
    }
    if (levels.length > 0) {
        filtered = filtered.filter(j => levels.includes(j.level));
    }

    renderJobsList(filtered);
};

window.clearFilters = function () {
    document.querySelectorAll('#view-jobs .form-check-input').forEach(cb => cb.checked = false);
    renderJobsList(allJobs);
};

window.sortJobs = function () {
    const sort = document.getElementById('sortJobs')?.value || 'recent';
    let sorted = [...allJobs.filter(j => j.status === 'active')];

    if (sort === 'recent') {
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort === 'salary') {
        sorted.sort((a, b) => (Number(b.salary_max) || 0) - (Number(a.salary_max) || 0));
    } else if (sort === 'name') {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    renderJobsList(sorted);
};

// ── VOLVER AL LISTADO ────────────────────────────────────────
window.goBack = function () {
    showView(previousView);
};

// ── NAVEGACIÓN ENTRE VISTAS ──────────────────────────────────
window.showView = function (viewId) {
    document.querySelectorAll('.tb-view').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('view-' + viewId);
    if (target) target.classList.add('active');

    // Scroll arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cargar datos según la vista
    if (viewId === 'jobs') {
        renderJobsList(allJobs);
    } else if (viewId === 'employer' && typeof loadEmployerJobs === 'function') {
        loadEmployerJobs();
    } else if (viewId === 'home') {
        renderFeaturedJobs();
    }
};

// ── CONTADORES ANIMADOS (HOME) ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = +el.dataset.target;
                let current = 0;
                const step = Math.ceil(target / 60);
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) { current = target; clearInterval(timer); }
                    el.textContent = current.toLocaleString();
                }, 25);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
});

// ── FUNCIONES AUXILIARES DEL CANDIDATO ────────────────────────
window.togglePassword = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    btn.querySelector('i').className = isPass ? 'bi bi-eye-slash' : 'bi bi-eye';
};

window.selectRole = function (role, btn, prefix) {
    const container = btn.closest('.tb-role-selector') || btn.parentElement;
    container.querySelectorAll('.tb-role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

// Toast helper (reutilizable)
function showToastNotif(msg, type = 'success') {
    const toastEl = document.getElementById('toastNotif');
    const toastMsg = document.getElementById('toastMsg');
    if (!toastEl || !toastMsg) return;
    toastMsg.textContent = msg;
    toastEl.className = `toast tb-toast align-items-center ${type === 'error' ? 'text-bg-danger' : 'text-bg-success'}`;
    bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3500 }).show();
}

// ── MODALES (global para onclick en index.html) ──────────────
window.openModal = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    new bootstrap.Modal(el).show();
};

window.switchModal = function (closeId, openId) {
    bootstrap.Modal.getInstance(document.getElementById(closeId))?.hide();
    setTimeout(() => {
        new bootstrap.Modal(document.getElementById(openId)).show();
    }, 300);
};

