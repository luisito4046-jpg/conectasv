import { createSignal, createResource, For, Show, onMount } from 'solid-js';
import { jobsApi, companiesApi, applicationsApi, usersApi } from '../lib/api';
import { useAuth } from '../stores/auth';
import { TYPE_LABELS, salaryLabel } from '../lib/utils';
import '../../css/styles.css';

const SECTION_TITLES = {
  dashboard: 'Dashboard',
  publicar: 'Publicar Vacante',
  vacantes: 'Mis Vacantes',
  postulantes: 'Postulantes',
  perfil: 'Perfil Empresa',
};

const STATUS_PILL = { active: 'pill-active', paused: 'pill-paused', closed: 'pill-closed' };
const STATUS_LABEL = { active: 'Activa', paused: 'Pausada', closed: 'Cerrada' };
const APP_STATUS_LABEL = { pending: 'Pendiente', review: 'Revisado', reviewed: 'Revisado', interview: 'Entrevista', accepted: 'Aceptado', rejected: 'Rechazado' };

export default function Employer() {
  const auth = useAuth();

  // ── NAVIGATION ────────────────────────────────────────────────
  const [activeSection, setActiveSection] = createSignal('dashboard');
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const today = new Date().toLocaleDateString('es-SV', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const showSection = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
  };

  // ── DATA ─────────────────────────────────────────────────────
  const [myCompanies, setMyCompanies] = createSignal([]);
  const [myJobs, setMyJobs] = createSignal([]);
  const [dashboardApps, setDashboardApps] = createSignal([]);
  const [metricApps, setMetricApps] = createSignal(0);

  // Postulantes
  const [selectedJobId, setSelectedJobId] = createSignal('');
  const [appsForJob, setAppsForJob] = createSignal([]);
  const [selectedJobName, setSelectedJobName] = createSignal('');
  const [loadingApps, setLoadingApps] = createSignal(false);

  // Candidate modal
  const [candidateModalOpen, setCandidateModalOpen] = createSignal(false);
  const [candidateData, setCandidateData] = createSignal(null);

  // ── PUBLISH FORM ──────────────────────────────────────────────
  const [jobCompanyId, setJobCompanyId] = createSignal('');
  const [jobTitle, setJobTitle] = createSignal('');
  const [jobType, setJobType] = createSignal('full');
  const [jobLevel, setJobLevel] = createSignal('entry');
  const [jobArea, setJobArea] = createSignal('');
  const [jobSalaryMin, setJobSalaryMin] = createSignal('');
  const [jobSalaryMax, setJobSalaryMax] = createSignal('');
  const [jobLocation, setJobLocation] = createSignal('');
  const [jobRequirements, setJobRequirements] = createSignal('');
  const [jobDescription, setJobDescription] = createSignal('');
  const [jobContact, setJobContact] = createSignal('');
  const [publishing, setPublishing] = createSignal(false);

  // ── PROFILE FORM ──────────────────────────────────────────────
  const [profFirstName, setProfFirstName] = createSignal('');
  const [profLastName, setProfLastName] = createSignal('');
  const [profEmail, setProfEmail] = createSignal('');
  const [profPhone, setProfPhone] = createSignal('');
  const [profLocation, setProfLocation] = createSignal('');
  const [companyName, setCompanyName] = createSignal('');
  const [companyIndustry, setCompanyIndustry] = createSignal('');
  const [companySize, setCompanySize] = createSignal('');
  const [companyWebsite, setCompanyWebsite] = createSignal('');
  const [companyLocation, setCompanyLocation] = createSignal('');
  const [companyDescription, setCompanyDescription] = createSignal('');
  const [companyLogoUrl, setCompanyLogoUrl] = createSignal(null);
  const [companyLogoFile, setCompanyLogoFile] = createSignal(null);
  const [savingProfile, setSavingProfile] = createSignal(false);

  // ── TOPBAR USER ───────────────────────────────────────────────
  const userInitials = () => {
    const comp = myCompanies()[0];
    if (comp?.name) return comp.name.substring(0, 2).toUpperCase();
    const u = auth.user();
    return `${(u?.first_name || 'E')[0]}${(u?.last_name || 'M')[0]}`.toUpperCase();
  };
  const displayName = () => myCompanies()[0]?.name || `${auth.user()?.first_name || ''} ${auth.user()?.last_name || ''}`.trim();
  const avatarUrl = () => myCompanies()[0]?.logo_url || auth.user()?.profile_photo_url || null;

  // ── LOAD COMPANIES ────────────────────────────────────────────
  const loadCompanies = async () => {
    try {
      const data = await companiesApi.getByOwner(auth.user()?.id);
      setMyCompanies(Array.isArray(data) ? data : []);
      if (data[0]) {
        setJobCompanyId(String(data[0].id));
        fillCompanyForm(data[0]);
      }
    } catch { /* silent */ }
  };

  const fillCompanyForm = (c) => {
    setCompanyName(c?.name || '');
    setCompanyIndustry(c?.industry || '');
    setCompanySize(c?.size || '');
    setCompanyWebsite(c?.website || '');
    setCompanyLocation(c?.location || '');
    setCompanyDescription(c?.description || '');
    setCompanyLogoUrl(c?.logo_url || null);
  };

  // ── LOAD DASHBOARD ────────────────────────────────────────────
  const loadDashboard = async () => {
    try {
      const jobs = await jobsApi.getByEmployer(auth.user()?.id);
      setMyJobs(Array.isArray(jobs) ? jobs : []);
      let total = 0;
      const recent = [];
      for (const job of jobs) {
        try {
          const apps = await applicationsApi.getByJob(job.id);
          total += apps.length;
          apps.forEach(a => recent.push({ ...a, job_title: job.title }));
        } catch { /* silent */ }
      }
      setMetricApps(total);
      setDashboardApps(recent.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at)).slice(0, 8));
    } catch { /* silent */ }
  };

  // ── LOAD MY JOBS ──────────────────────────────────────────────
  const loadMyJobs = async () => {
    try {
      const jobs = await jobsApi.getByEmployer(auth.user()?.id);
      setMyJobs(Array.isArray(jobs) ? jobs : []);
    } catch { /* silent */ }
  };

  // ── LOAD PROFILE ──────────────────────────────────────────────
  const loadProfile = async () => {
    try {
      const u = await usersApi.getById(auth.user()?.id);
      setProfFirstName(u.first_name || '');
      setProfLastName(u.last_name || '');
      setProfEmail(u.email || '');
      setProfPhone(u.phone || '');
      setProfLocation(u.location || '');
    } catch { /* silent */ }
    await loadCompanies();
  };

  // ── LOAD JOB SELECTOR (postulantes) ──────────────────────────
  const loadJobSelector = async () => {
    await loadMyJobs();
  };

  // ── SECTION CHANGE SIDE EFFECTS ───────────────────────────────
  const handleShowSection = (id) => {
    showSection(id);
    if (id === 'dashboard') loadDashboard();
    if (id === 'vacantes') loadMyJobs();
    if (id === 'postulantes') loadJobSelector();
    if (id === 'perfil') loadProfile();
  };

  onMount(() => {
    loadCompanies().then(() => loadDashboard());
    const u = auth.user();
    if (u) {
      setProfFirstName(u.first_name || '');
      setProfLastName(u.last_name || '');
      setProfEmail(u.email || '');
    }
  });

  // ── PUBLISH JOB ───────────────────────────────────────────────
  const publishJob = async (e) => {
    e.preventDefault();
    if (!jobCompanyId()) { auth.showToast('Selecciona una empresa.', 'error'); return; }
    if (!jobTitle().trim() || !jobDescription().trim() || !jobContact().trim()) {
      auth.showToast('Título, descripción y contacto son obligatorios.', 'error'); return;
    }
    setPublishing(true);
    try {
      await jobsApi.create({
        company_id: parseInt(jobCompanyId()),
        posted_by: auth.user()?.id,
        title: jobTitle().trim(),
        area: jobArea() || null,
        type: jobType(),
        level: jobLevel(),
        salary_min: jobSalaryMin() || null,
        salary_max: jobSalaryMax() || null,
        location: jobLocation().trim(),
        requirements: jobRequirements().trim(),
        description: jobDescription().trim(),
        contact: jobContact().trim(),
      });
      auth.showToast('¡Vacante publicada exitosamente!');
      setJobTitle(''); setJobSalaryMin(''); setJobSalaryMax('');
      setJobLocation(''); setJobRequirements(''); setJobDescription(''); setJobContact('');
      loadDashboard(); loadMyJobs();
    } catch (err) {
      auth.showToast(err.data?.error || 'Error al publicar', 'error');
    } finally {
      setPublishing(false);
    }
  };

  // ── JOB STATUS ────────────────────────────────────────────────
  const changeJobStatus = async (id, status) => {
    try {
      await jobsApi.updateStatus(id, status);
      auth.showToast(status === 'active' ? 'Vacante reactivada' : status === 'paused' ? 'Vacante pausada' : 'Vacante cerrada');
      loadMyJobs();
    } catch { auth.showToast('Error al actualizar estado', 'error'); }
  };

  const deleteJob = async (id) => {
    if (!confirm('¿Eliminar esta vacante permanentemente?')) return;
    try {
      await jobsApi.delete(id);
      auth.showToast('Vacante eliminada');
      loadMyJobs();
    } catch { auth.showToast('Error', 'error'); }
  };

  // ── APPS FOR JOB ──────────────────────────────────────────────
  const handleJobSelect = async (jobId) => {
    setSelectedJobId(jobId);
    if (!jobId) { setAppsForJob([]); return; }
    const found = myJobs().find(j => String(j.id) === String(jobId));
    setSelectedJobName(found?.title || '');
    setLoadingApps(true);
    try {
      const apps = await applicationsApi.getByJob(jobId);
      setAppsForJob(Array.isArray(apps) ? apps : []);
    } catch { setAppsForJob([]); }
    finally { setLoadingApps(false); }
  };

  const changeAppStatus = async (appId, status) => {
    try {
      await applicationsApi.updateStatus(appId, status);
      const labels = { review: 'revisado', interview: 'en entrevista', accepted: 'aceptado', rejected: 'rechazado' };
      auth.showToast(`Candidato marcado como ${labels[status] || status}`);
      handleJobSelect(selectedJobId());
    } catch { auth.showToast('Error', 'error'); }
  };

  const viewCandidate = async (candidateId) => {
    try {
      const u = await usersApi.getById(candidateId);
      setCandidateData(u);
      setCandidateModalOpen(true);
    } catch { auth.showToast('Error al cargar candidato', 'error'); }
  };

  // ── SAVE PROFILE ─────────────────────────────────────────────
  const saveAll = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await usersApi.update(auth.user()?.id, {
        first_name: profFirstName(),
        last_name: profLastName(),
        email: profEmail(),
        role: 'employer',
        phone: profPhone(),
        location: profLocation(),
        status: 'active',
      });

      const companyId = myCompanies()[0]?.id || null;
      if (!companyName().trim()) { auth.showToast('El nombre de la empresa es obligatorio.', 'error'); return; }

      const fd = new FormData();
      fd.append('owner_id', auth.user()?.id);
      fd.append('name', companyName().trim());
      if (companyIndustry()) fd.append('industry', companyIndustry());
      if (companySize()) fd.append('size', companySize());
      if (companyWebsite()) fd.append('website', companyWebsite());
      if (companyDescription()) fd.append('description', companyDescription());
      if (companyLocation()) fd.append('location', companyLocation());
      if (companyLogoFile()) fd.append('company_logo', companyLogoFile());

      if (companyId) {
        await companiesApi.update(companyId, fd);
      } else {
        await companiesApi.create({
          owner_id: auth.user()?.id,
          name: companyName().trim(),
          industry: companyIndustry() || null,
          size: companySize() || null,
          website: companyWebsite() || null,
          description: companyDescription() || null,
          location: companyLocation() || null,
        });
      }

      auth.showToast(companyId ? 'Empresa actualizada correctamente' : 'Empresa registrada correctamente');
      await loadCompanies();
      loadDashboard();
    } catch (err) {
      auth.showToast('Error guardando perfil: ' + err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCompanyLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCompanyLogoUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── SALARY HELPER ─────────────────────────────────────────────
  const jobSalaryDisplay = (j) => {
    if (j.salary_min && j.salary_max) return `$${Number(j.salary_min).toLocaleString()} – $${Number(j.salary_max).toLocaleString()}`;
    if (j.salary_min) return `Desde $${Number(j.salary_min).toLocaleString()}`;
    if (j.salary_max) return `Hasta $${Number(j.salary_max).toLocaleString()}`;
    return '—';
  };

  return (
    <>
      {/* Sidebar overlay (mobile) */}
      <div
        class={`emp-sidebar-overlay${sidebarOpen() ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside class={`emp-sidebar${sidebarOpen() ? ' open' : ''}`}>
        <div class="emp-sidebar-logo" onClick={() => (window.location.href = '/')} title="Volver al inicio">
          <div class="emp-brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11.5L10 22L20.5 9.5H13.5L13 2Z" fill="#9ca3b0" stroke="#9ca3b0" strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
          </div>
          <span class="emp-brand-text">Conecta<strong class="emp-brand-sv">SV</strong></span>
        </div>

        <nav class="emp-sidebar-nav">
          <div class="emp-sidebar-section-label">Gestión</div>
          <button class={`emp-nav-link${activeSection() === 'dashboard' ? ' active' : ''}`} onClick={() => handleShowSection('dashboard')}>
            <i class="bi bi-grid-1x2-fill" />Dashboard
          </button>
          <button class={`emp-nav-link${activeSection() === 'publicar' ? ' active' : ''}`} onClick={() => handleShowSection('publicar')}>
            <i class="bi bi-plus-circle-fill" />Publicar Vacante
          </button>
          <button class={`emp-nav-link${activeSection() === 'vacantes' ? ' active' : ''}`} onClick={() => handleShowSection('vacantes')}>
            <i class="bi bi-briefcase-fill" />Mis Vacantes
          </button>
          <button class={`emp-nav-link${activeSection() === 'postulantes' ? ' active' : ''}`} onClick={() => handleShowSection('postulantes')}>
            <i class="bi bi-people-fill" />Postulantes
          </button>
          <div class="emp-sidebar-section-label">Cuenta</div>
          <button class={`emp-nav-link${activeSection() === 'perfil' ? ' active' : ''}`} onClick={() => handleShowSection('perfil')}>
            <i class="bi bi-building" />Perfil Empresa
          </button>
        </nav>

        <div class="emp-sidebar-footer">
          <button class="emp-nav-link" onClick={() => auth.logout()}>
            <i class="bi bi-box-arrow-right" />Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div class="emp-wrapper">

        {/* TOPBAR */}
        <header class="emp-topbar">
          <div class="d-flex align-items-center gap-3">
            <button class="emp-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen())}>
              <i class="bi bi-list" />
            </button>
            <div>
              <div class="emp-topbar-title">{SECTION_TITLES[activeSection()]}</div>
              <div class="emp-topbar-date">{today}</div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main class="emp-content">

          {/* ══ DASHBOARD ══ */}
          <Show when={activeSection() === 'dashboard'}>
            <div class="emp-section-title"><i class="bi bi-activity me-1" />Resumen de tu Empresa</div>
            <div class="row g-3 mb-4">
              <div class="col-6 col-md-3">
                <div class="emp-metric-card c-blue">
                  <div class="emp-metric-icon"><i class="bi bi-briefcase-fill" /></div>
                  <div class="emp-metric-value">{myJobs().length}</div>
                  <div class="emp-metric-label">Vacantes Publicadas</div>
                  <button class="btn emp-btn-ghost mt-3" onClick={() => handleShowSection('vacantes')}>Ver vacantes</button>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="emp-metric-card c-accent">
                  <div class="emp-metric-icon"><i class="bi bi-people-fill" /></div>
                  <div class="emp-metric-value">{metricApps()}</div>
                  <div class="emp-metric-label">Postulaciones Total</div>
                  <button class="btn emp-btn-ghost mt-3" onClick={() => handleShowSection('postulantes')}>Revisar ahora</button>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="emp-metric-card c-green">
                  <div class="emp-metric-icon"><i class="bi bi-building" /></div>
                  <div class="emp-metric-value">{myCompanies().length}</div>
                  <div class="emp-metric-label">Empresas registradas</div>
                  <button class="btn emp-btn-ghost mt-3" onClick={() => handleShowSection('perfil')}>Editar empresa</button>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="emp-metric-card c-warn">
                  <div class="emp-metric-icon"><i class="bi bi-plus-circle-fill" /></div>
                  <div class="emp-metric-value">{myJobs().filter(j => j.status === 'active').length}</div>
                  <div class="emp-metric-label">Vacantes activas</div>
                  <button class="btn emp-btn-ghost mt-3" onClick={() => handleShowSection('publicar')}>Publicar vacante</button>
                </div>
              </div>
            </div>

            <div class="emp-data-card">
              <div class="emp-data-card-header">
                <span class="emp-data-card-title"><i class="bi bi-clock-history" />Postulaciones Recientes</span>
              </div>
              <div class="table-responsive">
                <table class="table emp-table mb-0">
                  <thead>
                    <tr>
                      <th>Candidato</th><th>Vacante</th><th>Fecha</th><th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <Show when={dashboardApps().length > 0} fallback={
                      <tr><td colspan="4" class="text-center py-3" style={{ color: '#888' }}>No hay postulaciones aún</td></tr>
                    }>
                      <For each={dashboardApps()}>
                        {(a) => {
                          const ini = `${(a.first_name || '?')[0]}${(a.last_name || '?')[0]}`.toUpperCase();
                          const date = new Date(a.applied_at).toLocaleDateString('es-SV', { day: '2-digit', month: 'short' });
                          return (
                            <tr>
                              <td>
                                <div class="d-flex align-items-center gap-2">
                                  <div class="emp-user-avatar-sm">{ini}</div>
                                  <span style={{ 'font-weight': '600' }}>{a.first_name} {a.last_name}</span>
                                </div>
                              </td>
                              <td style={{ color: 'var(--emp-text-m)' }}>{a.job_title}</td>
                              <td style={{ color: 'var(--emp-text-m)' }}>{date}</td>
                              <td><span class={`emp-pill emp-${a.status}`}>{APP_STATUS_LABEL[a.status] || a.status}</span></td>
                            </tr>
                          );
                        }}
                      </For>
                    </Show>
                  </tbody>
                </table>
              </div>
            </div>
          </Show>

          {/* ══ PUBLICAR VACANTE ══ */}
          <Show when={activeSection() === 'publicar'}>
            <div class="emp-section-title"><i class="bi bi-plus-circle me-1" />Nueva Vacante</div>
            <div class="row g-4">
              <div class="col-lg-8">
                <div class="emp-data-card">
                  <div class="emp-data-card-header">
                    <span class="emp-data-card-title"><i class="bi bi-file-earmark-text" />Información de la Vacante</span>
                  </div>
                  <form onSubmit={publishJob}>
                    <div class="mb-3">
                      <label class="emp-label">Empresa *</label>
                      <select class="form-select emp-select" value={jobCompanyId()} onChange={(e) => setJobCompanyId(e.target.value)}
                        disabled={myCompanies().length === 0}>
                        <Show when={myCompanies().length === 0} fallback={
                          <For each={myCompanies()}>
                            {(c) => <option value={String(c.id)}>{c.name}</option>}
                          </For>
                        }>
                          <option value="">— Registra una empresa primero —</option>
                        </Show>
                      </select>
                    </div>
                    <div class="mb-3">
                      <label class="emp-label">Título del Puesto *</label>
                      <input type="text" class="form-control emp-input" value={jobTitle()} onInput={(e) => setJobTitle(e.target.value)} placeholder="Ej: Desarrollador Full-Stack" required />
                    </div>
                    <div class="row g-2 mb-3">
                      <div class="col-md-4">
                        <label class="emp-label">Tipo</label>
                        <select class="form-select emp-select" value={jobType()} onChange={(e) => setJobType(e.target.value)}>
                          <option value="full">Tiempo Completo</option>
                          <option value="part">Medio Tiempo</option>
                          <option value="remote">Remoto</option>
                          <option value="contract">Contrato</option>
                          <option value="freelance">Freelance</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <label class="emp-label">Nivel</label>
                        <select class="form-select emp-select" value={jobLevel()} onChange={(e) => setJobLevel(e.target.value)}>
                          <option value="entry">Sin experiencia</option>
                          <option value="junior">Junior</option>
                          <option value="mid">Mid-Level</option>
                          <option value="senior">Senior</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <label class="emp-label">Área</label>
                        <select class="form-select emp-select" value={jobArea()} onChange={(e) => setJobArea(e.target.value)}>
                          <option value="">Sin especificar</option>
                          <option value="tech">Tecnología</option>
                          <option value="marketing">Marketing</option>
                          <option value="finance">Finanzas</option>
                          <option value="health">Salud</option>
                          <option value="education">Educación</option>
                          <option value="sales">Ventas</option>
                        </select>
                      </div>
                    </div>
                    <div class="row g-2 mb-3">
                      <div class="col-md-4">
                        <label class="emp-label">Salario Mínimo (USD)</label>
                        <input type="number" class="form-control emp-input" value={jobSalaryMin()} onInput={(e) => setJobSalaryMin(e.target.value)} placeholder="1000" />
                      </div>
                      <div class="col-md-4">
                        <label class="emp-label">Salario Máximo (USD)</label>
                        <input type="number" class="form-control emp-input" value={jobSalaryMax()} onInput={(e) => setJobSalaryMax(e.target.value)} placeholder="2000" />
                      </div>
                      <div class="col-md-4">
                        <label class="emp-label">Ubicación</label>
                        <input type="text" class="form-control emp-input" value={jobLocation()} onInput={(e) => setJobLocation(e.target.value)} placeholder="Ciudad o 'Remoto'" />
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="emp-label">Requisitos</label>
                      <textarea class="form-control emp-input" rows="3" value={jobRequirements()} onInput={(e) => setJobRequirements(e.target.value)} placeholder="Lista las habilidades y experiencia requeridas…" />
                    </div>
                    <div class="mb-3">
                      <label class="emp-label">Descripción del Puesto *</label>
                      <textarea class="form-control emp-input" rows="4" value={jobDescription()} onInput={(e) => setJobDescription(e.target.value)} placeholder="Describe las responsabilidades, beneficios y cultura…" required />
                    </div>
                    <div class="mb-3">
                      <label class="emp-label">Correo de Contacto *</label>
                      <input type="email" class="form-control emp-input" value={jobContact()} onInput={(e) => setJobContact(e.target.value)} placeholder="rh@empresa.com" required />
                    </div>
                    <button type="submit" class="btn emp-btn-primary" disabled={publishing()}>
                      <i class="bi bi-send-fill me-2" />{publishing() ? 'Publicando…' : 'Publicar Vacante'}
                    </button>
                  </form>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="emp-data-card">
                  <div class="emp-data-card-header">
                    <span class="emp-data-card-title"><i class="bi bi-lightbulb" />Consejos</span>
                  </div>
                  <ul style={{ 'font-size': '13px', color: 'var(--emp-text-m)', 'padding-left': '18px', margin: '0' }}>
                    <li class="mb-2">Usa un <strong>título claro</strong> y específico</li>
                    <li class="mb-2">Incluye el <strong>rango salarial</strong> para atraer más candidatos</li>
                    <li class="mb-2">Detalla los <strong>beneficios</strong> de tu empresa</li>
                    <li class="mb-2">Sé específico con los <strong>requisitos</strong></li>
                    <li>Asegúrate de que el <strong>correo de contacto</strong> sea correcto</li>
                  </ul>
                </div>
              </div>
            </div>
          </Show>

          {/* ══ MIS VACANTES ══ */}
          <Show when={activeSection() === 'vacantes'}>
            <div class="emp-section-title"><i class="bi bi-briefcase me-1" />Mis Vacantes Publicadas</div>
            <Show when={myJobs().length > 0} fallback={
              <div class="emp-empty-state">
                <i class="bi bi-inbox" />
                <p>No has publicado vacantes aún.</p>
              </div>
            }>
              <div class="d-flex flex-column gap-3">
                <For each={myJobs()}>
                  {(j) => (
                    <div class={`emp-job-card ${j.status}`}>
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 style={{ 'font-weight': '700', margin: '0 0 4px' }}>{j.title}</h6>
                          <div class="d-flex flex-wrap gap-2 align-items-center" style={{ 'font-size': '12px', color: 'var(--emp-text-m)' }}>
                            <span class={`emp-pill ${STATUS_PILL[j.status]}`}>{STATUS_LABEL[j.status]}</span>
                            <span><i class="bi bi-building me-1" />{j.company_name || '—'}</span>
                            <span><i class="bi bi-briefcase me-1" />{TYPE_LABELS[j.type] || j.type}</span>
                            <span><i class="bi bi-geo-alt me-1" />{j.location || '—'}</span>
                            <span><i class="bi bi-cash me-1" />{jobSalaryDisplay(j)}</span>
                          </div>
                        </div>
                        <span style={{ 'font-size': '12px', 'font-weight': '700', color: 'var(--emp-primary)' }}>
                          <i class="bi bi-people me-1" />{j.applications_count || 0}
                        </span>
                      </div>
                      <div class="d-flex gap-2 mt-2">
                        <Show when={j.status === 'active'}>
                          <button type="button" class="btn btn-sm emp-btn-ghost" onClick={() => changeJobStatus(j.id, 'paused')}>
                            <i class="bi bi-pause-circle me-1" />Pausar
                          </button>
                        </Show>
                        <Show when={j.status === 'paused'}>
                          <button type="button" class="btn btn-sm emp-btn-ghost" onClick={() => changeJobStatus(j.id, 'active')}>
                            <i class="bi bi-play-circle me-1" />Reactivar
                          </button>
                        </Show>
                        <Show when={j.status !== 'closed'}>
                          <button type="button" class="btn btn-sm emp-btn-ghost" onClick={() => changeJobStatus(j.id, 'closed')}>
                            <i class="bi bi-x-circle me-1" />Cerrar
                          </button>
                        </Show>
                        <button type="button" class="btn btn-sm emp-btn-danger" onClick={() => deleteJob(j.id)}>
                          <i class="bi bi-trash me-1" />Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </Show>

          {/* ══ POSTULANTES ══ */}
          <Show when={activeSection() === 'postulantes'}>
            <div class="emp-section-title"><i class="bi bi-people me-1" />Gestión de Postulantes</div>
            <div class="emp-data-card mb-3">
              <div class="emp-data-card-header">
                <span class="emp-data-card-title"><i class="bi bi-briefcase" />Selecciona una Vacante</span>
              </div>
              <select class="form-select emp-select" value={selectedJobId()} onChange={(e) => handleJobSelect(e.target.value)}>
                <option value="">— Selecciona una vacante —</option>
                <For each={myJobs()}>
                  {(j) => <option value={String(j.id)}>{j.title} ({j.applications_count || 0} postulantes)</option>}
                </For>
              </select>
            </div>
            <Show when={selectedJobId()}>
              <div class="emp-data-card">
                <div class="emp-data-card-header">
                  <span class="emp-data-card-title">
                    <i class="bi bi-people" />Postulantes de: <span style={{ color: 'var(--emp-accent)' }}>{selectedJobName()}</span>
                  </span>
                </div>
                <Show when={!loadingApps()} fallback={<div class="text-center py-3"><div class="spinner-border spinner-border-sm" /></div>}>
                  <div class="table-responsive">
                    <table class="table emp-table mb-0">
                      <thead>
                        <tr>
                          <th>Candidato</th><th>Correo</th><th>Fecha</th><th>Estado</th><th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <Show when={appsForJob().length > 0} fallback={
                          <tr><td colspan="5" class="text-center py-3" style={{ color: '#888' }}>Sin postulantes</td></tr>
                        }>
                          <For each={appsForJob()}>
                            {(a) => {
                              const ini = `${(a.first_name || '?')[0]}${(a.last_name || '?')[0]}`.toUpperCase();
                              const date = new Date(a.applied_at).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
                              return (
                                <tr>
                                  <td>
                                    <div class="d-flex align-items-center gap-2">
                                      <div class="emp-user-avatar-sm">{ini}</div>
                                      <span style={{ 'font-weight': '600' }}>{a.first_name} {a.last_name}</span>
                                    </div>
                                  </td>
                                  <td style={{ color: 'var(--emp-text-m)', 'font-size': '12px' }}>{a.email}</td>
                                  <td style={{ color: 'var(--emp-text-m)' }}>{date}</td>
                                  <td><span class={`emp-pill emp-pill-${a.status}`}>{APP_STATUS_LABEL[a.status] || a.status}</span></td>
                                  <td>
                                    <div class="dropdown">
                                      <button class="btn btn-sm emp-btn-ghost dropdown-toggle" data-bs-toggle="dropdown" style={{ 'font-size': '12px' }}>Acción</button>
                                      <ul class="dropdown-menu dropdown-menu-end">
                                        <li><a class="dropdown-item small" href="#" onClick={(e) => { e.preventDefault(); viewCandidate(a.candidate_id || a.user_id); }}><i class="bi bi-person me-2" />Ver Perfil</a></li>
                                        <li><hr class="dropdown-divider" /></li>
                                        <li><a class="dropdown-item small" href="#" onClick={(e) => { e.preventDefault(); changeAppStatus(a.id, 'reviewed'); }}><i class="bi bi-eye me-2" />Revisado</a></li>
                                        <li><a class="dropdown-item small" href="#" onClick={(e) => { e.preventDefault(); changeAppStatus(a.id, 'interview'); }}><i class="bi bi-calendar-event me-2" />Entrevista</a></li>
                                        <li><a class="dropdown-item small text-success" href="#" onClick={(e) => { e.preventDefault(); changeAppStatus(a.id, 'accepted'); }}><i class="bi bi-check-circle me-2" />Aceptar</a></li>
                                        <li><a class="dropdown-item small text-danger" href="#" onClick={(e) => { e.preventDefault(); changeAppStatus(a.id, 'rejected'); }}><i class="bi bi-x-circle me-2" />Rechazar</a></li>
                                      </ul>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }}
                          </For>
                        </Show>
                      </tbody>
                    </table>
                  </div>
                </Show>
              </div>
            </Show>
          </Show>

          {/* ══ PERFIL EMPRESA ══ */}
          <Show when={activeSection() === 'perfil'}>
            <div class="emp-section-title"><i class="bi bi-building me-1" />Perfil de la Empresa</div>
            <Show when={myCompanies().length === 0}>
              <div class="emp-no-company-banner mb-4 p-3 rounded-3">
                <p class="mb-0" style={{ 'font-size': '13px', color: 'var(--emp-text-m)' }}>
                  <i class="bi bi-info-circle me-1" style={{ color: 'var(--emp-accent)' }} />
                  Aún no tienes una empresa registrada. Completa el formulario para crear la tuya.
                </p>
              </div>
            </Show>
            <div class="emp-data-card">
              <div class="emp-data-card-header">
                <span class="emp-data-card-title"><i class="bi bi-building" />Información de la Empresa</span>
                <span style={{ 'font-size': '12px', color: 'var(--emp-text-m)' }}>
                  {myCompanies()[0] ? (myCompanies()[0].verified ? '✓ Empresa verificada' : 'Sin verificar') : 'No hay empresa registrada'}
                </span>
              </div>

              {/* Logo + nombre */}
              <div class="d-flex align-items-center gap-4 mb-4 pb-4" style={{ 'border-bottom': '1px solid var(--emp-border)' }}>
                <div style={{ position: 'relative', 'flex-shrink': '0' }}>
                  <div class="emp-logo-circle" onClick={() => document.getElementById('companyLogoFileInput').click()} title="Haz clic para cambiar el logo">
                    <Show when={companyLogoUrl()} fallback={
                      <div id="logoPlaceholder" style={{ 'text-align': 'center', color: 'var(--emp-accent)' }}>
                        <i class="bi bi-camera" style={{ 'font-size': '22px', display: 'block', 'margin-bottom': '4px' }} />
                        <span style={{ 'font-size': '10px', 'font-weight': '600', 'text-transform': 'uppercase', 'letter-spacing': '.05em' }}>Logo</span>
                      </div>
                    }>
                      <img src={companyLogoUrl()} alt="Logo" style={{ width: '100%', height: '100%', 'object-fit': 'cover' }} />
                    </Show>
                  </div>
                  <input type="file" id="companyLogoFileInput" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                </div>
                <div style={{ flex: '1', 'min-width': '0' }}>
                  <label class="emp-label">Nombre de la Empresa *</label>
                  <input type="text" class="form-control emp-input" value={companyName()} onInput={(e) => setCompanyName(e.target.value)} placeholder="Nombre oficial" />
                  <p class="mt-1 mb-0" style={{ 'font-size': '11px', color: 'var(--emp-text-l)' }}>Haz clic en el logo para cambiarlo</p>
                </div>
              </div>

              <form onSubmit={saveAll}>
                <div class="row g-3">
                  <div class="col-12">
                    <p style={{ 'font-size': '11px', 'font-weight': '700', color: 'var(--emp-text-l)', 'letter-spacing': '.08em', 'text-transform': 'uppercase', margin: '0' }}>Representante / Contacto</p>
                  </div>
                  <div class="col-md-6">
                    <label class="emp-label">Nombre del Representante</label>
                    <input type="text" class="form-control emp-input" value={profFirstName()} onInput={(e) => setProfFirstName(e.target.value)} placeholder="Tu nombre" />
                  </div>
                  <div class="col-md-6">
                    <label class="emp-label">Correo Electrónico</label>
                    <input type="email" class="form-control emp-input" value={profEmail()} disabled />
                  </div>
                  <div class="col-md-6">
                    <label class="emp-label">Teléfono de Contacto</label>
                    <input type="tel" class="form-control emp-input" value={profPhone()} onInput={(e) => setProfPhone(e.target.value)} placeholder="+503 0000-0000" />
                  </div>
                  <div class="col-md-6">
                    <label class="emp-label">Ubicación del Representante</label>
                    <input type="text" class="form-control emp-input" value={profLocation()} onInput={(e) => setProfLocation(e.target.value)} placeholder="Ciudad, País" />
                  </div>

                  <div class="col-12 mt-2">
                    <p style={{ 'font-size': '11px', 'font-weight': '700', color: 'var(--emp-text-l)', 'letter-spacing': '.08em', 'text-transform': 'uppercase', margin: '0' }}>Datos de la Empresa</p>
                  </div>
                  <div class="col-md-6">
                    <label class="emp-label">Industria</label>
                    <input type="text" class="form-control emp-input" value={companyIndustry()} onInput={(e) => setCompanyIndustry(e.target.value)} placeholder="Ej: Tecnología" />
                  </div>
                  <div class="col-md-6">
                    <label class="emp-label">Tamaño</label>
                    <select class="form-select emp-select" value={companySize()} onChange={(e) => setCompanySize(e.target.value)}>
                      <option value="">Sin especificar</option>
                      <option value="1-10">1–10 empleados</option>
                      <option value="10-50">10–50 empleados</option>
                      <option value="50-200">50–200 empleados</option>
                      <option value="200+">200+ empleados</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="emp-label">Sitio Web</label>
                    <input type="url" class="form-control emp-input" value={companyWebsite()} onInput={(e) => setCompanyWebsite(e.target.value)} placeholder="https://tuempresa.com" />
                  </div>
                  <div class="col-md-6">
                    <label class="emp-label">Ubicación de la Empresa</label>
                    <input type="text" class="form-control emp-input" value={companyLocation()} onInput={(e) => setCompanyLocation(e.target.value)} placeholder="Ciudad, País" />
                  </div>
                  <div class="col-12">
                    <label class="emp-label">Descripción</label>
                    <textarea class="form-control emp-input" rows="3" value={companyDescription()} onInput={(e) => setCompanyDescription(e.target.value)} placeholder="¿Qué hace tu empresa?" />
                  </div>
                  <div class="col-12 d-flex gap-2 align-items-center pt-2">
                    <button type="submit" class="btn emp-btn-primary" disabled={savingProfile()}>
                      <i class="bi bi-floppy me-2" />{savingProfile() ? 'Guardando…' : 'Guardar Todo'}
                    </button>
                    <Show when={myCompanies().length === 0}>
                      <span style={{ 'font-size': '12px', color: 'var(--emp-text-l)' }}>Se creará una nueva empresa al guardar</span>
                    </Show>
                  </div>
                </div>
              </form>
            </div>
          </Show>

        </main>
      </div>

      {/* ══ MODAL: CANDIDATO ══ */}
      <Show when={candidateModalOpen() && candidateData()}>
        {() => {
          const u = candidateData();
          const ini = `${(u.first_name || '?')[0]}${(u.last_name || '?')[0]}`.toUpperCase();
          let skills = [];
          try { skills = u.skills ? JSON.parse(u.skills) : []; } catch { skills = []; }
          return (
            <div class="modal fade show" style={{ display: 'block' }} tabIndex="-1" onClick={(e) => { if (e.target === e.currentTarget) setCandidateModalOpen(false); }}>
              <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content" style={{ border: 'none', 'border-radius': 'var(--emp-radius-lg)', 'box-shadow': 'var(--emp-shadow-lg)' }}>
                  <div class="modal-header" style={{ background: 'var(--emp-primary)', color: '#fff', 'border-radius': 'var(--emp-radius-lg) var(--emp-radius-lg) 0 0', padding: '16px 24px' }}>
                    <h5 class="modal-title"><i class="bi bi-person-circle me-2" />Perfil del Candidato</h5>
                    <button type="button" class="btn-close btn-close-white" onClick={() => setCandidateModalOpen(false)} />
                  </div>
                  <div class="modal-body p-4">
                    <div class="d-flex align-items-center gap-3 mb-4">
                      <Show when={u.profile_photo_url} fallback={
                        <div class="emp-user-avatar-lg">{ini}</div>
                      }>
                        <img src={u.profile_photo_url} alt="Foto" style={{ width: '56px', height: '56px', 'border-radius': '50%', 'object-fit': 'cover', 'flex-shrink': '0' }} />
                      </Show>
                      <div>
                        <h5 style={{ 'font-weight': '700', margin: '0' }}>{u.first_name} {u.last_name}</h5>
                        <p class="mb-0" style={{ color: '#888', 'font-size': '13px' }}>Candidato</p>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6"><label class="emp-label">Correo</label><p>{u.email}</p></div>
                      <div class="col-md-6"><label class="emp-label">Teléfono</label><p>{u.phone || 'No especificado'}</p></div>
                      <div class="col-md-6"><label class="emp-label">Ubicación</label><p>{u.location || 'No especificado'}</p></div>
                      <div class="col-md-6">
                        <label class="emp-label">Estado</label>
                        <p><span class={`emp-pill emp-pill-${u.status}`}>{u.status === 'active' ? 'Activo' : 'Suspendido'}</span></p>
                      </div>
                      <div class="col-12"><label class="emp-label">Habilidades</label><p>{skills.length > 0 ? skills.join(', ') : 'No especificado'}</p></div>
                      <div class="col-12"><label class="emp-label">Resumen</label><p>{u.bio || 'Sin resumen profesional'}</p></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-backdrop fade show" style={{ 'z-index': '-1' }} />
            </div>
          );
        }}
      </Show>
    </>
  );
}