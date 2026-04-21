// ============================================================
//  indexApp.js — Lógica de autenticación para index.html
// ============================================================

let currentUser = null;

async function login() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl  = document.getElementById('loginError');

    errorEl.textContent = '';
    errorEl.style.display = 'none';

    if (!email || !password) {
        showLoginError('Por favor completa todos los campos.');
        return;
    }

    try {
        const res  = await fetch('/api/login', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showLoginError(data.error || 'Error al iniciar sesión.');
            return;
        }

        // ── Admin → redirigir a su panel ──────────────────────────────
        if (data.redirect && data.role === 'admin') {
            window.location.href = data.redirect;
            return;
        }

        // ── Employer → quedarse en home, guardar sesión y actualizar navbar ──
        if (data.role === 'employer') {
            sessionStorage.setItem('employerUser', JSON.stringify(data));
        }

        // ── Candidate → quedarse en home, guardar sesión y actualizar navbar ──
        if (data.role === 'candidate') {
            sessionStorage.setItem('candidateUser', JSON.stringify(data));
        }

        currentUser = data;
        closeLoginModal();
        updateNavbar(data);

        // Cargar datos relevantes según el rol
        if (data.role === 'employer' && typeof loadEmployerJobs === 'function') {
            loadEmployerJobs();
        }

    } catch (err) {
        showLoginError('No se pudo conectar con el servidor.');
    }
}

// ── REGISTRO ─────────────────────────────────────────────────
async function register() {
    const firstName = document.getElementById('regFirst').value.trim();
    const lastName  = document.getElementById('regLast').value.trim();
    const email     = document.getElementById('regEmail').value.trim();
    const password  = document.getElementById('regPassword').value;
    const confirm   = document.getElementById('regConfirm').value;
    const terms     = document.getElementById('acceptTerms').checked;

    // Detectar rol seleccionado
    const activeBtn = document.querySelector('.tb-role-btn.active');
    const role = activeBtn ? activeBtn.dataset.role : 'candidate';

    // Validaciones
    if (!firstName || (!lastName && role !== 'employer') || !email || !password) {
        showToastNotif('Por favor completa todos los campos.', 'error');
        return;
    }
    if (password.length < 8) {
        showToastNotif('La contraseña debe tener mínimo 8 caracteres.', 'error');
        return;
    }
    if (password !== confirm) {
        showToastNotif('Las contraseñas no coinciden.', 'error');
        return;
    }
    if (!terms) {
        showToastNotif('Debes aceptar los términos y condiciones.', 'error');
        return;
    }

    try {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email,
                password_hash: password,  // El backend hashea con bcrypt
                role
            })
        });

        const data = await res.json();

        if (!res.ok) {
            showToastNotif(data.error || 'Error al crear cuenta', 'error');
            return;
        }

        // Si es empresa, también crear registro en la tabla companies
        if (role === 'employer' && data.id) {
            try {
                await fetch('/api/companies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        owner_id: data.id,
                        name: `${firstName} ${lastName}`.trim(),
                        description: '',
                        industry: '',
                        location: ''
                    })
                });
            } catch (err) {
                console.error('Error creando registro de empresa:', err);
            }
        }

        // Cerrar modal de registro
        const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        if (modal) modal.hide();

        showToastNotif('¡Cuenta creada exitosamente! Ahora inicia sesión.');

        // Limpiar formulario
        document.getElementById('regFirst').value = '';
        document.getElementById('regLast').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regConfirm').value = '';
        document.getElementById('acceptTerms').checked = false;

        // Abrir modal de login después de un momento
        setTimeout(() => {
            openModal('loginModal');
        }, 500);

    } catch (err) {
        showToastNotif('Error de conexión al crear cuenta.', 'error');
    }
}

// ── INDICADOR DE FORTALEZA DE CONTRASEÑA ─────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // ── Restaurar sesión activa al volver desde otro panel ────
    const storedCandidate = sessionStorage.getItem('candidateUser');
    const storedEmployer  = sessionStorage.getItem('employerUser');

    if (storedCandidate) {
        currentUser = JSON.parse(storedCandidate);
        updateNavbar(currentUser);
    } else if (storedEmployer) {
        currentUser = JSON.parse(storedEmployer);
        updateNavbar(currentUser);
    }

    // ── Indicador de fortaleza de contraseña ──────────────────
    const pwInput = document.getElementById('regPassword');
    if (pwInput) {
        pwInput.addEventListener('input', () => {
            const val = pwInput.value;
            const bar = document.getElementById('pwBar');
            const label = document.getElementById('pwLabel');
            if (!bar || !label) return;

            let strength = 0;
            if (val.length >= 8) strength++;
            if (val.length >= 12) strength++;
            if (/[A-Z]/.test(val)) strength++;
            if (/[0-9]/.test(val)) strength++;
            if (/[^A-Za-z0-9]/.test(val)) strength++;

            const levels = [
                { w: '10%', color: '#dc2626', text: 'Muy débil' },
                { w: '25%', color: '#dc2626', text: 'Débil' },
                { w: '50%', color: '#f59e0b', text: 'Regular' },
                { w: '75%', color: '#22c55e', text: 'Buena' },
                { w: '90%', color: '#16a34a', text: 'Fuerte' },
                { w: '100%', color: '#059669', text: 'Muy fuerte' }
            ];

            const level = levels[Math.min(strength, levels.length - 1)];
            bar.style.width = level.w;
            bar.style.background = level.color;
            label.textContent = val ? level.text : '';
        });
    }
});

function logout() {
    currentUser = null;
    sessionStorage.removeItem('candidateUser');
    sessionStorage.removeItem('employerUser');

    // Restaurar controles de sesión
    document.getElementById('authControls').style.setProperty('display', 'flex', 'important');
    document.getElementById('userControls').style.setProperty('display', 'none', 'important');

    // Ocultar nav items de rol
    document.getElementById('navCandidate').style.display = 'none';
    document.getElementById('navEmployer').style.display  = 'none';
    document.getElementById('navAdmin').style.display     = 'none';

    // Limpiar campos del modal
    document.getElementById('loginEmail').value    = '';
    document.getElementById('loginPassword').value = '';

    // Volver al home
    if (typeof showView === 'function') showView('home');
}

// ── Helpers ──────────────────────────────────────────────────

function showLoginError(msg) {
    const errorEl = document.getElementById('loginError');
    errorEl.textContent    = msg;
    errorEl.style.display  = 'block';
}

function closeLoginModal() {
    const modalEl = document.getElementById('loginModal');
    const modal   = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
}

function updateNavbar(user) {
    const avatarEl = document.getElementById('navAvatar');

    // ── Foto de perfil o iniciales ────────────────────────────
    if (user.logo_url || user.profile_photo_url) {
        avatarEl.innerHTML = '';
        avatarEl.style.backgroundImage    = `url('${user.logo_url || user.profile_photo_url}')`;
        avatarEl.style.backgroundSize     = 'cover';
        avatarEl.style.backgroundPosition = 'center';
        avatarEl.textContent = '';
    } else {
        avatarEl.style.backgroundImage = '';
        const f = user.first_name ? user.first_name[0] : '';
        const l = user.last_name ? user.last_name[0] : '';
        avatarEl.textContent = `${f}${l}`.toUpperCase();
    }

    const dName = user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
    document.getElementById('navUserName').textContent = dName;

    // ── El avatar lleva al panel correspondiente al rol ───────
    const profileLink = document.getElementById('navProfileLink');
    if (profileLink) {
        profileLink.href = user.role === 'employer' ? '/employee.html' : '/candidate.html';
    }

    // ── Ocultar botones de sesión y mostrar controles de usuario ──
    document.getElementById('authControls').style.setProperty('display', 'none', 'important');
    document.getElementById('userControls').style.setProperty('display', 'flex', 'important');

    // ── Mostrar el enlace de nav correspondiente al rol ───────
    document.getElementById('navCandidate').style.display =
        user.role === 'candidate' ? 'block' : 'none';
    document.getElementById('navEmployer').style.display  =
        user.role === 'employer'  ? 'block' : 'none';
}

// Toast helper (por si se llama antes de jobsApp.js)
function showToastNotif(msg, type = 'success') {
    const toastEl = document.getElementById('toastNotif');
    const toastMsg = document.getElementById('toastMsg');
    if (!toastEl || !toastMsg) return;
    toastMsg.textContent = msg;
    toastEl.className = `toast tb-toast align-items-center ${type === 'error' ? 'text-bg-danger' : 'text-bg-success'}`;
    bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3500 }).show();
}