const API_URL = '';

// --- CONFIGURACIÓN DE TÍTULOS ---
const TITLES = {
    dashboard: 'Dashboard',
    usuarios: 'Gestión de Usuarios',
    empresas: 'Gestión de Empresas',
    empleos: 'Gestión de Empleos',
    postulaciones: 'Postulaciones',
    valoraciones: 'Valoraciones',
    alertas: 'Alertas de Empleo',
    moderacion: 'Moderación de Contenido',
    configuracion: 'Configuración'
};

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    const dateEl = document.getElementById('topbarDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('es-SV', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
    updateDashboardMetrics();
});

// --- FUNCIONES DE CARGA DE DATOS (API) ---

async function fetchUsers() {
    try {
        const response = await fetch(`${API_URL}/api/users`);   // ← /api/
        const users = await response.json();
        renderUsers(users);
        return users;
    } catch (err) {
        console.error("Error cargando usuarios:", err);
    }
}

async function fetchCompanies() {
    try {
        const response = await fetch(`${API_URL}/api/companies`);  // ← /api/
        const companies = await response.json();
        renderCompanies(companies);
        return companies;
    } catch (err) {
        console.error("Error cargando empresas:", err);
    }
}

// --- RENDERIZADO DE TABLAS ---

function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    users.forEach(user => {
        const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="u-avatar uav-primary">${initials}</div>
                    ${user.first_name} ${user.last_name}
                </div>
            </td>
            <td style="color:var(--text-m)">${user.email}</td>
            <td><span class="pill pill-${user.role}">${user.role}</span></td>
            <td style="color:var(--text-m)">${user.location || 'N/A'}</td>
            <td style="font-weight:600">${user.profile_views}</td>
            <td><span class="pill pill-${user.status}">${user.status}</span></td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn-icon" title="Ver"><i class="bi bi-eye"></i></button>
                    <button class="btn-icon danger" onclick="deleteUser(${user.id})" title="Eliminar"><i class="bi bi-slash-circle"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCompanies(companies) {
    const tbody = document.querySelector('#sec-empresas tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    companies.forEach(company => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="company-logo-sm">${company.logo || 'C'}</div>
                    <span style="font-weight:600">${company.name}</span>
                </div>
            </td>
            <td style="color:var(--text-m)">${company.industry || 'N/A'}</td>
            <td style="color:var(--text-m)">${company.size || 'N/A'}</td>
            <td>
                <a href="${company.website}" style="color:var(--accent);font-size:12px;font-weight:600" target="_blank">
                    ${company.website ? company.website.replace('https://','') : 'N/A'} ↗
                </a>
            </td>
            <td>
                <span class="pill ${company.verified ? 'pill-verified' : 'pill-unverified'}">
                    ${company.verified ? 'verificada' : 'sin verificar'}
                </span>
            </td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn-icon"><i class="bi bi-eye"></i></button>
                    ${!company.verified ?
                        `<button class="btn-icon success" onclick="verifyCompany(${company.id})"><i class="bi bi-patch-check"></i></button>` : ''}
                    <button class="btn-icon danger" onclick="deleteCompany(${company.id})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- NAVEGACIÓN ---

window.showSection = function(id, el) {
    const section = document.getElementById('sec-' + id);
    if (!section) return;

    document.querySelectorAll('section[id^="sec-"]').forEach(s => s.style.display = 'none');
    section.style.display = '';

    if (id === 'usuarios') fetchUsers();
    if (id === 'empresas') fetchCompanies();
    if (id === 'dashboard') updateDashboardMetrics();

    document.querySelectorAll('.nav-link-sb').forEach(a => a.classList.remove('active'));
    if (el) el.classList.add('active');

    const titleEl = document.getElementById('topbarTitle');
    if (titleEl) titleEl.textContent = TITLES[id] || id;

    window.closeSidebar();
};

window.toggleSidebar = function() {
    document.getElementById('adminSidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('open');
};

window.closeSidebar = function() {
    document.getElementById('adminSidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');
};

// --- AUTO-REFRESCO (POLLING DE 10 SEGUNDOS) ---

setInterval(async () => {
    const titleEl = document.getElementById('topbarTitle');
    if (!titleEl) return;
    const currentTitle = titleEl.textContent;

    if (currentTitle === TITLES.usuarios) await fetchUsers();
    if (currentTitle === TITLES.empresas) await fetchCompanies();
    if (currentTitle === TITLES.dashboard) updateDashboardMetrics();
}, 10000);

// --- MÉTRICAS DEL DASHBOARD ---

async function updateDashboardMetrics() {
    try {
        const users     = await fetch(`${API_URL}/api/users`).then(r => r.json());      // ← /api/
        const companies = await fetch(`${API_URL}/api/companies`).then(r => r.json());  // ← /api/

        const metricValues = document.querySelectorAll('.metric-value');
        if (metricValues.length >= 5) {
            metricValues[0].textContent = users.filter(u => u.role === 'candidate').length;
            metricValues[1].textContent = users.filter(u => u.role === 'employer').length;
            metricValues[4].textContent = companies.length;
        }
    } catch (err) {
        console.error("Error al actualizar métricas:", err);
    }
}

// --- ACCIONES DE USUARIO/EMPRESA ---

window.deleteUser = async function(id) {
    if (!confirm('¿Deseas eliminar permanentemente a este usuario?')) return;

    try {
        const response = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const msg = data.error || `Error ${response.status}`;
            window.showToast(`Error al eliminar usuario: ${msg}`, 'error');
            return;
        }

        window.showToast('Usuario eliminado');
        fetchUsers();

    } catch (err) {
        console.error('deleteUser:', err);
        window.showToast('Error al eliminar usuario: sin conexión', 'error');
    }
};

window.deleteCompany = async function(id) {
    if (!confirm('¿Deseas eliminar esta empresa?')) return;

    try {
        const response = await fetch(`${API_URL}/api/companies/${id}`, { method: 'DELETE' });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const msg = data.error || `Error ${response.status}`;
            window.showToast(`Error al eliminar empresa: ${msg}`, 'error');
            return;
        }

        window.showToast('Empresa eliminada');
        fetchCompanies();

    } catch (err) {
        console.error('deleteCompany:', err);
        window.showToast('Error al eliminar empresa: sin conexión', 'error');
    }
};

window.verifyCompany = async function(id) {
    try {
        const response = await fetch(`${API_URL}/api/companies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ verified: true })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const msg = data.error || `Error ${response.status}`;
            window.showToast(`Error al verificar empresa: ${msg}`, 'error');
            return;
        }

        window.showToast('Empresa verificada con éxito');
        fetchCompanies();

    } catch (err) {
        console.error('verifyCompany:', err);
        window.showToast('Error al verificar empresa: sin conexión', 'error');
    }
};

// --- UTILIDADES ---

window.showToast = function(msg, type = 'success') {
    const el    = document.getElementById('toastEl');
    const msgEl = document.getElementById('toastMsg');
    const iconEl = document.getElementById('toastIcon');

    if (!el || !msgEl || !iconEl) return;

    msgEl.textContent = msg;
    el.className = 'toast tb-toast ' + (type === 'success' ? 'success' : 'error');
    iconEl.className = 'bi ' + (type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill');

    bootstrap.Toast.getOrCreateInstance(el, { delay: 3000 }).show();
};

window.confirmLogout = function() {
    if (confirm('¿Deseas cerrar la sesión de administrador?')) {
        window.showToast('Sesión cerrada. Redirigiendo...');
        setTimeout(() => { window.location.href = '/'; }, 1500);
    }
};

window.filterUsers = function(q) {
    q = q.toLowerCase();
    document.querySelectorAll('#usersTableBody tr').forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
};

// --- MODALES (global para onclick en index.html) ---

window.openModal = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    new bootstrap.Modal(el).show();
};

window.switchModal = function(closeId, openId) {
    bootstrap.Modal.getInstance(document.getElementById(closeId))?.hide();
    setTimeout(() => {
        new bootstrap.Modal(document.getElementById(openId)).show();
    }, 300);
};