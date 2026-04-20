// ============================================================
//  adminApp.js — Sistema completo de administración
// ============================================================

const API = '';

// ── DATOS GLOBALES ──────────────────────────────────────────
let allUsers = [];
let allCompanies = [];
let allJobs = [];
let allApplications = [];

// ── UTILIDADES ──────────────────────────────────────────────
function initials(str = '') {
    return str.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);
}

function roleBadge(role) {
    const map = {
        candidate: { cls: 'pill-review', label: 'Candidato' },
        employer: { cls: 'pill-pending', label: 'Empleador' },
        admin: { cls: 'pill-admin', label: 'Admin' }
    };
    const { cls, label } = map[role] || { cls: 'pill-review', label: role };
    return `<span class="pill ${cls}">${label}</span>`;
}

function statusBadge(s) {
    return s === 'active'
        ? '<span class="pill pill-active">Activo</span>'
        : '<span class="pill pill-suspended">Suspendido</span>';
}

function verifiedBadge(v) {
    return v
        ? '<span class="pill pill-verified">Verificada</span>'
        : '<span class="pill pill-unverified">Pendiente</span>';
}

function appStatusBadge(s) {
    const m = {
        pending: { cls: 'pill-pending', l: 'Pendiente' },
        review: { cls: 'pill-review', l: 'En revisión' },
        interview: { cls: 'pill-active', l: 'Entrevista' },
        accepted: { cls: 'pill-active', l: 'Aceptado' },
        rejected: { cls: 'pill-suspended', l: 'Rechazado' }
    };
    const { cls, l } = m[s] || { cls: 'pill-review', l: s };
    return `<span class="pill ${cls}">${l}</span>`;
}

function jobStatusBadge(s) {
    const m = {
        active: { cls: 'pill-active', l: 'Activa' },
        paused: { cls: 'pill-pending', l: 'Pausada' },
        closed: { cls: 'pill-suspended', l: 'Cerrada' }
    };
    const { cls, l } = m[s] || { cls: 'pill-review', l: s };
    return `<span class="pill ${cls}">${l}</span>`;
}

const typeLabels = {
    full: 'Tiempo Completo',
    part: 'Tiempo Parcial',
    remote: 'Remoto',
    contract: 'Contrato',
    freelance: 'Freelance'
};

const levelLabels = {
    entry: 'Nivel Entry',
    junior: 'Junior',
    mid: 'Mid',
    senior: 'Senior'
};

function showToast(msg, isError = false) {
    const el = document.getElementById('toastEl');
    const msgEl = document.getElementById('toastMsg');
    const icon = document.getElementById('toastIcon');
    msgEl.textContent = msg;
    icon.className = isError ? 'bi bi-x-circle-fill' : 'bi bi-check-circle-fill';
    el.style.background = isError ? 'var(--danger)' : 'var(--success)';
    bootstrap.Toast.getOrCreateInstance(el).show();
}

// ── NAVEGACIÓN ──────────────────────────────────────────────
const SECTION_TITLES = {
    dashboard: 'Dashboard',
    usuarios: 'Gestión de Usuarios',
    empresas: 'Gestión de Empresas',
    empleos: 'Gestión de Empleos',
    postulaciones: 'Postulaciones',
    valoraciones: 'Valoraciones'
};

function showSection(id, el) {
    document.querySelectorAll('section[id^="sec-"]').forEach(s => s.style.display = 'none');
    const sec = document.getElementById('sec-' + id);
    if (sec) sec.style.display = '';
    document.querySelectorAll('.nav-link-sb').forEach(a => a.classList.remove('active'));
    if (el) el.classList.add('active');
    const topTitle = document.querySelector('.topbar-title');
    if (topTitle) topTitle.textContent = SECTION_TITLES[id] || id;
    closeSidebar();

    // Cargar datos según la sección
    if (id === 'usuarios') loadUsers();
    if (id === 'empresas') loadCompanies();
    if (id === 'empleos') loadJobs();
    if (id === 'postulaciones') loadApplications();
    if (id === 'dashboard') loadDashboard();
}

function toggleSidebar() {
    document.getElementById('adminSidebar')?.classList.toggle('open');
    document.getElementById('sidebarOverlay')?.classList.toggle('open');
}

function closeSidebar() {
    document.getElementById('adminSidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('open');
}

// ── USUARIOS ────────────────────────────────────────────────
async function loadUsers() {
    try {
        const res = await fetch(`${API}/api/users`);
        if (!res.ok) throw new Error('Error al cargar usuarios');
        allUsers = await res.json();
        renderUsersTable();
    } catch (err) {
        console.error('Error loadUsers:', err);
        showToast('Error al cargar usuarios', true);
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = allUsers.map(u => {
        const ini = initials(`${u.first_name} ${u.last_name}`);
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        const btnLabel = u.status === 'active' ? 'Suspender' : 'Activar';
        const btnCls = u.status === 'active' ? 'tb-btn-danger' : 'tb-btn-success';
        
        return `<tr>
          <td><div class="d-flex align-items-center gap-2">
            <div class="u-avatar uav-primary">${ini}</div>
            <div>
              <div style="font-weight:600;color:var(--primary)">${u.first_name} ${u.last_name}</div>
              <div style="font-size:11px;color:var(--text-l)">${u.email}</div>
            </div>
          </div></td>
          <td>${roleBadge(u.role)}</td>
          <td style="color:var(--text-m)">${u.location || '—'}</td>
          <td style="color:var(--text-m)">${u.profile_views ?? 0}</td>
          <td>${statusBadge(u.status)}</td>
          <td class="text-end" style="font-size:12px;white-space:nowrap">
            <button class="btn btn-sm ${btnCls}" onclick="updateUserStatus(${u.id},'${nextStatus}')">${btnLabel}</button>
            <button class="btn btn-sm btn-icon" onclick="editUser(${u.id})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-icon danger" onclick="deleteUser(${u.id})"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`;
    }).join('');
}

async function updateUserStatus(id, newStatus) {
    try {
        const user = allUsers.find(u => u.id === id);
        if (!user) return;
        
        const res = await fetch(`${API}/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...user, status: newStatus })
        });
        
        if (!res.ok) throw new Error('Error al actualizar usuario');
        await loadUsers();
        showToast(`Usuario ${newStatus === 'active' ? 'activado' : 'suspendido'} correctamente`);
    } catch (err) {
        console.error('Error updateUserStatus:', err);
        showToast('Error al actualizar usuario', true);
    }
}

function editUser(id) {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;
    
    document.getElementById('userModalTitle').textContent = 'Editar Usuario';
    document.getElementById('userId').value = user.id;
    document.getElementById('userFirstName').value = user.first_name;
    document.getElementById('userLastName').value = user.last_name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userLocation').value = user.location || '';
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userStatus').value = user.status;
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').placeholder = 'Dejar vacío para no cambiar';
    
    new bootstrap.Modal(document.getElementById('userModal')).show();
}

function newUser() {
    document.getElementById('userModalTitle').textContent = 'Crear Nuevo Usuario';
    document.getElementById('userId').value = '';
    document.getElementById('userForm').reset();
    document.getElementById('userPassword').placeholder = 'Contraseña requerida';
    document.getElementById('userRole').value = 'candidate';
    document.getElementById('userStatus').value = 'active';
    new bootstrap.Modal(document.getElementById('userModal')).show();
}

async function saveUser() {
    try {
        const userId = document.getElementById('userId').value;
        const data = {
            first_name: document.getElementById('userFirstName').value,
            last_name: document.getElementById('userLastName').value,
            email: document.getElementById('userEmail').value,
            role: document.getElementById('userRole').value,
            location: document.getElementById('userLocation').value,
            phone: document.getElementById('userPhone').value,
            status: document.getElementById('userStatus').value
        };

        const password = document.getElementById('userPassword').value;
        if (password) data.password_hash = password;

        if (!data.first_name || !data.last_name || !data.email) {
            showToast('Completa todos los campos requeridos', true);
            return;
        }

        let res;
        if (userId) {
            res = await fetch(`${API}/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            if (!password) {
                showToast('La contraseña es requerida', true);
                return;
            }
            res = await fetch(`${API}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al guardar usuario');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
        await loadUsers();
        showToast(userId ? 'Usuario actualizado' : 'Usuario creado');
    } catch (err) {
        console.error('Error saveUser:', err);
        showToast('Error al guardar usuario: ' + err.message, true);
    }
}

async function deleteUser(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
        const res = await fetch(`${API}/api/users/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar usuario');
        await loadUsers();
        showToast('Usuario eliminado');
    } catch (err) {
        console.error('Error deleteUser:', err);
        showToast('Error al eliminar usuario', true);
    }
}

function filterUsers(query) {
    const rows = document.querySelectorAll('#usersTableBody tr');
    const q = query.toLowerCase();
    rows.forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

// ── EMPRESAS ────────────────────────────────────────────────
async function loadCompanies() {
    try {
        const res = await fetch(`${API}/api/companies`);
        if (!res.ok) throw new Error('Error al cargar empresas');
        allCompanies = await res.json();
        renderCompaniesTable();
    } catch (err) {
        console.error('Error loadCompanies:', err);
        showToast('Error al cargar empresas', true);
    }
}

function renderCompaniesTable() {
    const tbody = document.getElementById('companiesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = allCompanies.map(c => {
        const ini = initials(c.name || '');
        return `<tr>
          <td><div class="d-flex align-items-center gap-2">
            <div class="company-logo-sm">${c.logo || ini}</div>
            <div>
              <div style="font-weight:600;color:var(--primary)">${c.name}</div>
              <div style="font-size:11px;color:var(--text-l)">${c.description ? c.description.substring(0, 40) + '...' : ''}</div>
            </div>
          </div></td>
          <td style="color:var(--text-m)">${c.industry || '—'}</td>
          <td style="color:var(--text-m)">${c.size || '—'}</td>
          <td>${c.website ? `<a href="${c.website}" target="_blank" style="color:var(--accent);text-decoration:none">Visitar</a>` : '—'}</td>
          <td>${verifiedBadge(c.verified)}</td>
          <td class="text-end" style="font-size:12px;white-space:nowrap">
            ${!c.verified ? `<button class="btn btn-sm tb-btn-success" onclick="verifyCompany(${c.id})">Verificar</button>` : ''}
            <button class="btn btn-sm btn-icon" onclick="editCompany(${c.id})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-icon danger" onclick="deleteCompany(${c.id})"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`;
    }).join('');
}

async function verifyCompany(id) {
    try {
        const company = allCompanies.find(c => c.id === id);
        if (!company) return;
        
        const res = await fetch(`${API}/api/companies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...company, verified: true })
        });
        
        if (!res.ok) throw new Error('Error al verificar empresa');
        await loadCompanies();
        showToast('Empresa verificada correctamente');
    } catch (err) {
        console.error('Error verifyCompany:', err);
        showToast('Error al verificar empresa', true);
    }
}

async function deleteCompany(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta empresa? Esta acción no se puede deshacer.')) return;
    
    try {
        const res = await fetch(`${API}/api/companies/${id}`, { method: 'DELETE' });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            const msg = errorData?.error || 'Error desconocido';
            showToast(`Error al eliminar empresa: ${msg}`, true);
            return;
        }
        
        // Remover de la lista local
        allCompanies = allCompanies.filter(c => c.id !== id);
        renderCompaniesTable();
        showToast('Empresa eliminada correctamente');
    } catch (err) {
        console.error('Error deleteCompany:', err);
        showToast('Error al eliminar empresa: sin conexión', true);
    }
}

function editCompany(id) {
    const company = allCompanies.find(c => c.id === id);
    if (!company) return;
    
    document.getElementById('companyModalTitle').textContent = 'Ver Empresa';
    document.getElementById('companyInfo').innerHTML = `
        <p><strong>Nombre:</strong> ${company.name}</p>
        <p><strong>Industria:</strong> ${company.industry || '—'}</p>
        <p><strong>Tamaño:</strong> ${company.size || '—'}</p>
        <p><strong>Sitio Web:</strong> ${company.website ? `<a href="${company.website}" target="_blank">${company.website}</a>` : '—'}</p>
        <p><strong>Descripción:</strong> ${company.description || '—'}</p>
        <p><strong>Ubicación:</strong> ${company.location || '—'}</p>
        <p><strong>Estado:</strong> ${verifiedBadge(company.verified)}</p>
    `;
    new bootstrap.Modal(document.getElementById('companyModal')).show();
}

// ── EMPLEOS ─────────────────────────────────────────────────
async function loadJobs() {
    try {
        const res = await fetch(`${API}/api/jobs`);
        if (!res.ok) throw new Error('Error al cargar empleos');
        allJobs = await res.json();
        renderJobsTable();
    } catch (err) {
        console.error('Error loadJobs:', err);
        showToast('Error al cargar empleos', true);
    }
}

function renderJobsTable() {
    const tbody = document.getElementById('jobsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = allJobs.map(j => {
        const company = allCompanies.find(c => c.id === j.company_id);
        const ini = initials(company?.name || '');
        return `<tr>
          <td>
            <div style="font-weight:600;color:var(--primary)">${j.title}</div>
            <div style="font-size:11px;color:var(--text-l)">${typeLabels[j.type] || j.type}</div>
          </td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="company-logo-sm" style="width:24px;height:24px;font-size:9px">${ini}</div>
              <span style="font-size:13px">${company?.name || '—'}</span>
            </div>
          </td>
          <td style="color:var(--text-m)">${levelLabels[j.level] || j.level}</td>
          <td style="color:var(--text-m)">${j.location || (j.remote ? 'Remoto' : '—')}</td>
          <td>${jobStatusBadge(j.status)}</td>
          <td class="text-end" style="font-size:12px;white-space:nowrap">
            <button class="btn btn-sm btn-icon" onclick="editJob(${j.id})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-icon danger" onclick="deleteJob(${j.id})"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`;
    }).join('');
}

function editJob(id) {
    const job = allJobs.find(j => j.id === id);
    if (!job) return;
    
    const company = allCompanies.find(c => c.id === job.company_id);
    document.getElementById('jobModalTitle').textContent = 'Editar Empleo';
    document.getElementById('jobId').value = job.id;
    document.getElementById('jobTitle').value = job.title;
    document.getElementById('jobArea').value = job.area || '';
    document.getElementById('jobType').value = job.type;
    document.getElementById('jobLevel').value = job.level;
    document.getElementById('jobCompany').value = company?.name || '';
    document.getElementById('jobLocation').value = job.location || '';
    document.getElementById('jobRemote').checked = job.remote;
    document.getElementById('jobStatus').value = job.status;
    document.getElementById('jobDescription').value = job.description;
    document.getElementById('jobRequirements').value = job.requirements || '';
    document.getElementById('jobBenefits').value = job.benefits || '';
    
    new bootstrap.Modal(document.getElementById('jobModal')).show();
}

async function saveJob() {
    try {
        const jobId = document.getElementById('jobId').value;
        const company = allCompanies.find(c => c.name === document.getElementById('jobCompany').value);
        
        if (!company) {
            showToast('Empresa no encontrada', true);
            return;
        }

        const data = {
            company_id: company.id,
            title: document.getElementById('jobTitle').value,
            area: document.getElementById('jobArea').value,
            type: document.getElementById('jobType').value,
            level: document.getElementById('jobLevel').value,
            location: document.getElementById('jobLocation').value,
            remote: document.getElementById('jobRemote').checked,
            status: document.getElementById('jobStatus').value,
            description: document.getElementById('jobDescription').value,
            requirements: document.getElementById('jobRequirements').value,
            benefits: document.getElementById('jobBenefits').value
        };

        if (!data.title || !data.description) {
            showToast('Completa los campos requeridos', true);
            return;
        }

        let res;
        if (jobId) {
            res = await fetch(`${API}/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Para crear, agregar posted_by (asumimos que el admin es el ID 1 o el actual)
            res = await fetch(`${API}/api/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, posted_by: 1 })
            });
        }

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al guardar empleo');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('jobModal')).hide();
        await loadJobs();
        showToast(jobId ? 'Empleo actualizado' : 'Empleo creado');
    } catch (err) {
        console.error('Error saveJob:', err);
        showToast('Error al guardar empleo: ' + err.message, true);
    }
}

async function deleteJob(id) {
    if (!confirm('¿Eliminar este empleo?')) return;
    try {
        const res = await fetch(`${API}/api/jobs/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar empleo');
        await loadJobs();
        showToast('Empleo eliminado');
    } catch (err) {
        console.error('Error deleteJob:', err);
        showToast('Error al eliminar empleo', true);
    }
}

function newJob() {
    document.getElementById('jobModalTitle').textContent = 'Crear Nuevo Empleo';
    document.getElementById('jobId').value = '';
    document.getElementById('jobForm').reset();
    document.getElementById('jobStatus').value = 'active';
    document.getElementById('jobType').value = 'full';
    document.getElementById('jobLevel').value = 'mid';
    
    // Poblar datalist de empresas
    const datalist = document.getElementById('companiesList');
    datalist.innerHTML = allCompanies.map(c => `<option value="${c.name}" label="${c.industry || ''}">`).join('');
    
    new bootstrap.Modal(document.getElementById('jobModal')).show();
}

// ── POSTULACIONES ───────────────────────────────────────────
async function loadApplications() {
    try {
        const res = await fetch(`${API}/api/applications`);
        if (!res.ok) throw new Error('Error al cargar postulaciones');
        allApplications = await res.json();
        renderApplicationsTable();
        updateDashboardApplications();
    } catch (err) {
        console.error('Error loadApplications:', err);
        showToast('Error al cargar postulaciones', true);
    }
}

function renderApplicationsTable() {
    const tbody = document.getElementById('appsTableBody');
    if (!tbody) return;
    
    const sorted = [...allApplications].sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
    
    tbody.innerHTML = sorted.map(a => {
        const job = allJobs.find(j => j.id === a.job_id);
        const company = allCompanies.find(c => c.id === job?.company_id);
        const date = new Date(a.applied_at).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
        
        return `<tr>
          <td style="font-weight:600;color:var(--primary)">${a.candidate_name || 'Candidato'}</td>
          <td>${job?.title || '—'}</td>
          <td>${company?.name || '—'}</td>
          <td style="font-size:12px;color:var(--text-l)">${date}</td>
          <td>${appStatusBadge(a.status)}</td>
          <td class="text-end" style="font-size:12px;white-space:nowrap">
            <select class="form-select form-select-sm" style="width:120px" onchange="updateApplicationStatus(${a.id}, this.value)">
              <option value="pending" ${a.status === 'pending' ? 'selected' : ''}>Pendiente</option>
              <option value="review" ${a.status === 'review' ? 'selected' : ''}>Revisión</option>
              <option value="interview" ${a.status === 'interview' ? 'selected' : ''}>Entrevista</option>
              <option value="accepted" ${a.status === 'accepted' ? 'selected' : ''}>Aceptada</option>
              <option value="rejected" ${a.status === 'rejected' ? 'selected' : ''}>Rechazada</option>
            </select>
          </td>
        </tr>`;
    }).join('');
}

async function updateApplicationStatus(id, status) {
    try {
        const app = allApplications.find(a => a.id === id);
        if (!app) return;
        
        const res = await fetch(`${API}/api/applications/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...app, status })
        });
        
        if (!res.ok) throw new Error('Error al actualizar postulación');
        await loadApplications();
        showToast('Estado actualizado');
    } catch (err) {
        console.error('Error updateApplicationStatus:', err);
        showToast('Error al actualizar', true);
    }
}

// ── DASHBOARD ───────────────────────────────────────────────
async function loadDashboard() {
    try {
        const users = await fetch(`${API}/api/users`).then(r => r.json());
        const companies = await fetch(`${API}/api/companies`).then(r => r.json());
        const jobs = await fetch(`${API}/api/jobs`).then(r => r.json());
        const apps = await fetch(`${API}/api/applications`).then(r => r.json());

        // Actualizar métricas
        document.querySelectorAll('.metric-value')[0].textContent = users.filter(u => u.role === 'candidate').length;
        document.querySelectorAll('.metric-value')[1].textContent = users.filter(u => u.role === 'employer').length;
        document.querySelectorAll('.metric-value')[2].textContent = jobs.filter(j => j.status === 'active').length;
        document.querySelectorAll('.metric-value')[3].textContent = apps.length;
        document.querySelectorAll('.metric-value')[4].textContent = companies.length;

        updateDashboardApplications();
    } catch (err) {
        console.error('Error loadDashboard:', err);
    }
}

function updateDashboardApplications() {
    const dashTbody = document.querySelector('#sec-dashboard .data-card:last-child tbody');
    if (!dashTbody || !allApplications.length) return;

    const sorted = [...allApplications].sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
    
    dashTbody.innerHTML = sorted.slice(0, 5).map(a => {
        const job = allJobs.find(j => j.id === a.job_id);
        const company = allCompanies.find(c => c.id === job?.company_id);
        const date = new Date(a.applied_at).toLocaleDateString('es-SV', { day: '2-digit', month: 'short' });
        
        return `<tr>
          <td style="font-weight:600">${a.candidate_name || 'Candidato'}</td>
          <td style="color:var(--text-m)">${job?.title || '—'}</td>
          <td style="color:var(--text-m)">${company?.name || '—'}</td>
          <td style="color:var(--text-l);font-size:12px">${date}</td>
          <td>${appStatusBadge(a.status)}</td>
        </tr>`;
    }).join('') || '<tr><td colspan="5" class="text-center py-3" style="color:#888">Sin postulaciones</td></tr>';
}

// ── INICIALIZACIÓN ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Cargar todos los datos
        const [users, companies, jobs, apps] = await Promise.all([
            fetch(`${API}/api/users`).then(r => r.json()),
            fetch(`${API}/api/companies`).then(r => r.json()),
            fetch(`${API}/api/jobs`).then(r => r.json()),
            fetch(`${API}/api/applications`).then(r => r.json())
        ]);
        
        allUsers = users;
        allCompanies = companies;
        allJobs = jobs;
        allApplications = apps;
        
        renderUsersTable();
        renderCompaniesTable();
        renderJobsTable();
        renderApplicationsTable();
        loadDashboard();
    } catch (err) {
        console.error('Error en inicialización:', err);
    }

    // Cerrar modales cuando se presiona Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            bootstrap.Modal.getOrCreateInstance(document.getElementById('userModal')).hide();
            bootstrap.Modal.getOrCreateInstance(document.getElementById('jobModal')).hide();
            bootstrap.Modal.getOrCreateInstance(document.getElementById('companyModal')).hide();
        }
    });
});

function confirmLogout() {
    if (confirm('¿Cerrar sesión?')) {
        // Limpiar datos de sesión si es necesario
        window.location.href = '/';
    }
}
