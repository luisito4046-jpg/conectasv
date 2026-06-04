import { createSignal, createResource, createMemo, For, Show, onMount } from 'solid-js';
import { usersApi, companiesApi, jobsApi, applicationsApi } from '../lib/api';
import { useAuth } from '../stores/auth';

// ── Constantes ────────────────────────────────────────────────
const SECTIONS = [
  { id: 'dashboard',      label: 'Dashboard',      icon: 'bi-grid-1x2-fill' },
  { id: 'usuarios',       label: 'Usuarios',        icon: 'bi-people-fill' },
  { id: 'empresas',       label: 'Empresas',        icon: 'bi-building' },
  { id: 'empleos',        label: 'Empleos',         icon: 'bi-briefcase-fill' },
  { id: 'postulaciones',  label: 'Postulaciones',   icon: 'bi-send-fill' },
  { id: 'valoraciones',   label: 'Valoraciones',    icon: 'bi-star-fill' },
];

const SYSTEM_SECTIONS = [
  { id: 'alertas',        label: 'Alertas',         icon: 'bi-bell-fill',          badge: 3 },
  { id: 'moderacion',     label: 'Moderación',      icon: 'bi-shield-exclamation' },
  { id: 'configuracion',  label: 'Configuración',   icon: 'bi-gear-fill' },
];

const TYPE_LABELS  = { full:'Completo', part:'Parcial', remote:'Remoto', contract:'Contrato', freelance:'Freelance' };
const LEVEL_LABELS = { entry:'Entry', junior:'Junior', mid:'Mid', senior:'Senior' };

// ── Utilidades ────────────────────────────────────────────────
function initials(str = '') {
  return str.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '??';
}

// ── Componentes pequeños ──────────────────────────────────────
function Pill(props) {
  const styles = {
    active:    { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
    verified:  { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
    accepted:  { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
    interview: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
    paused:    { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' },
    pending:   { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' },
    closed:    { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
    rejected:  { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
    suspended: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
    review:    { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
    candidate: { background: '#fdf4ff', color: '#7e22ce', border: '1px solid #e9d5ff' },
    employer:  { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' },
    admin:     { background: 'rgba(232,148,58,.12)', color: 'var(--warning)', border: '1px solid rgba(232,148,58,.3)' },
  };
  const s = styles[props.variant] || { background: 'var(--bg)', color: 'var(--text-l)', border: '1px solid var(--border)' };
  return (
    <span class="admin-pill" style={{ ...s }}>
      {props.children}
    </span>
  );
}

function AvatarSmall(props) {
  const ini = () => {
    const f = (props.firstName || '?')[0];
    const l = (props.lastName || '?')[0];
    return `${f}${l}`.toUpperCase();
  };
  const grads = [
    'linear-gradient(135deg, var(--primary), var(--primary-l))',
    'linear-gradient(135deg, var(--accent), var(--accent-l))',
    'linear-gradient(135deg, #16a34a, #0d9488)',
    'linear-gradient(135deg, #0d9488, #2a5f9e)',
  ];
  const bg = () => grads[(props.id || 0) % grads.length];
  return (
    <div class="avatar-sm" style={{ background: bg() }}>
      {ini()}
    </div>
  );
}

function MetricCard(props) {
  return (
    <div class={`metric-card ${props.color || ''}`}>
      <div class="metric-icon"><i class={`bi ${props.icon}`}></i></div>
      <div class="metric-value">{props.value}</div>
      <div class="metric-label">{props.label}</div>
      {props.trend && (
        <span class={`metric-trend ${props.trendUp ? 'trend-up' : 'trend-neu'}`}>
          {props.trendUp && <i class="bi bi-arrow-up-short"></i>}
          {props.trend}
        </span>
      )}
    </div>
  );
}

function BarChart(props) {
  const max = () => Math.max(...props.items.map(i => i.value), 1);
  return (
    <div class="bar-chart-wrap">
      <For each={props.items}>
        {(item) => (
          <div class="bar-chart-row">
            <div class="bar-chart-label">{item.label}</div>
            <div class="bar-track">
              <div class="bar-fill" style={{ width: `${(item.value / max()) * 100}%`, background: item.color }}></div>
            </div>
            <div class="bar-val">{item.value}</div>
          </div>
        )}
      </For>
    </div>
  );
}

function ProgressRow(props) {
  return (
    <div class="progress-row">
      <div class="progress-header">
        <span class="progress-label">{props.label}</span>
        <span class="progress-count">{props.current} / {props.total}</span>
      </div>
      <div class="progress-tb">
        <div class="progress-fill-tb" style={{ width: `${props.total ? (props.current / props.total) * 100 : 0}%`, background: props.color }}></div>
      </div>
    </div>
  );
}

function DataCard(props) {
  return (
    <div class="data-card" style={props.style || {}}>
      <div class="data-card-header">
        <span class="data-card-title">
          <i class={`bi ${props.icon}`}></i>{props.title}
        </span>
        {props.action && (
          <button class="tb-btn-ghost" onClick={props.action.fn}>{props.action.label}</button>
        )}
      </div>
      {props.children}
    </div>
  );
}

function TableHead(props) {
  return (
    <thead>
      <tr>
        <For each={props.cols}>
          {(col) => <th class="tb-th">{col}</th>}
        </For>
      </tr>
    </thead>
  );
}

// ── Dashboard Section ─────────────────────────────────────────
function DashboardSection(props) {
  const { users, jobs, companies, apps, setSection } = props;

  const metrics = () => [
    { label: 'Candidatos',      value: users().filter(u => u.role === 'candidate').length, icon: 'bi-people-fill',      color: 'c-blue',   trend: '+1 esta semana', trendUp: true },
    { label: 'Empleadores',     value: users().filter(u => u.role === 'employer').length,  icon: 'bi-building',         color: 'c-accent', trend: 'Sin cambios' },
    { label: 'Empleos Activos', value: jobs().filter(j => j.status === 'active').length,   icon: 'bi-briefcase-fill',   color: 'c-green',  trend: '+2 esta semana', trendUp: true },
    { label: 'Postulaciones',   value: apps().length,                                       icon: 'bi-send-fill',        color: 'c-warn',   trend: '+1 hoy', trendUp: true },
    { label: 'Empresas Totales',value: companies().length,                                  icon: 'bi-patch-check-fill', color: 'c-teal',   trend: `${companies().filter(c => c.verified).length} verificadas` },
    { label: 'Empleos Guardados',value: 4,                                                  icon: 'bi-bookmark-fill',    color: 'c-blue',   trend: 'Por 3 usuarios' },
    { label: 'Alertas Activas', value: 3,                                                   icon: 'bi-bell-fill',        color: 'c-red',    trend: 'De 2 usuarios' },
    { label: 'Calificaciones',  value: 2,                                                   icon: 'bi-star-fill',        color: 'c-accent', trend: 'Promedio ★ 4.5', trendUp: true },
  ];

  const jobAreas = () => {
    const areas = {};
    jobs().forEach(j => { areas[j.area || j.category || 'Otro'] = (areas[j.area || j.category || 'Otro'] || 0) + 1; });
    const colors = ['var(--primary)', 'var(--accent)', 'var(--warning)', '#0d9488', 'var(--success)'];
    return Object.entries(areas).map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }));
  };

  const appStats = () => {
    const total = apps().length || 4;
    const pending  = apps().filter(a => a.status === 'pending').length  || 2;
    const review   = apps().filter(a => a.status === 'review').length   || 1;
    const accepted = apps().filter(a => a.status === 'accepted').length || 1;
    return { total, pending, review, accepted };
  };

  const recent5 = () => [...apps()].sort((a,b) => new Date(b.applied_at||b.created_at) - new Date(a.applied_at||a.created_at)).slice(0,5);

  return (
    <>
      <div class="section-title"><i class="bi bi-activity me-1"></i>Resumen General</div>

      {/* Métricas */}
      <div class="metrics-grid">
        <For each={metrics()}>
          {(m) => <MetricCard {...m} />}
        </For>
      </div>

      {/* Gráficos */}
      <div class="row-2col">
        {/* Empleos por Área */}
        <DataCard icon="bi-bar-chart-fill" title="Empleos por Área">
          <Show when={jobAreas().length > 0} fallback={
            <BarChart items={[
              { label: 'Tecnología', value: 3, color: 'var(--primary)' },
              { label: 'Diseño',     value: 1, color: 'var(--accent)'  },
              { label: 'Marketing',  value: 1, color: 'var(--warning)' },
              { label: 'Ventas',     value: 1, color: '#0d9488'        },
              { label: 'Finanzas',   value: 1, color: 'var(--success)' },
            ]} />
          }>
            <BarChart items={jobAreas()} />
          </Show>
          <hr class="divider" />
          <div class="sub-title"><i class="bi bi-pie-chart-fill me-1" style={{ color: 'var(--accent)' }}></i>Tipos de Empleo</div>
          <div class="pills-row">
            <span class="pill pill-review">Tiempo completo ({jobs().filter(j=>j.type==='full').length||3})</span>
            <span class="pill pill-active">Remoto ({jobs().filter(j=>j.type==='remote').length||2})</span>
            <span class="pill pill-pending">Contrato ({jobs().filter(j=>j.type==='contract').length||1})</span>
          </div>
        </DataCard>

        {/* Estado Postulaciones + Valoraciones */}
        <DataCard icon="bi-send" title="Estado de Postulaciones">
          <ProgressRow label="En revisión" current={appStats().review}   total={appStats().total} color="var(--primary-l)" />
          <ProgressRow label="Pendiente"   current={appStats().pending}  total={appStats().total} color="var(--accent)" />
          <ProgressRow label="Aceptada"    current={appStats().accepted} total={appStats().total} color="var(--success)" />
          <hr class="divider" />
          <div class="sub-title"><i class="bi bi-star-fill me-1" style={{ color: 'var(--accent)' }}></i>Valoraciones de Empresas</div>
          <div class="company-row">
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div class="company-logo-sm">TN</div>
              <span class="company-name">TechNova SV</span>
              <span class="pill pill-verified" style={{ fontSize:'10px' }}>verificada</span>
            </div>
            <span class="stars">★★★★★ <span class="star-val">5.0</span></span>
          </div>
          <div class="company-row">
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div class="company-logo-sm" style={{ color:'var(--success)', background:'rgba(22,163,74,.1)' }}>CH</div>
              <span class="company-name">CreativeHub</span>
              <span class="pill pill-verified" style={{ fontSize:'10px' }}>verificada</span>
            </div>
            <span class="stars">★★★★<span class="star-empty">★</span> <span class="star-val">4.0</span></span>
          </div>
        </DataCard>
      </div>

      {/* Postulaciones Recientes */}
      <DataCard
        icon="bi-clock-history"
        title="Postulaciones Recientes"
        action={{ label: 'Ver todas', fn: () => setSection('postulaciones') }}
      >
        <div class="table-responsive">
          <table class="tb-table">
            <TableHead cols={['Candidato','Empleo','Empresa','Fecha','Estado']} />
            <tbody>
              <Show when={recent5().length > 0} fallback={
                <tr><td colspan="5" class="empty-cell">Sin postulaciones recientes</td></tr>
              }>
                <For each={recent5()}>
                  {(a) => (
                    <tr>
                      <td class="tb-td">
                        <div class="user-cell">
                          <AvatarSmall id={a.id} firstName={a.first_name} lastName={a.last_name} />
                          <span class="user-name">{a.first_name} {a.last_name}</span>
                        </div>
                      </td>
                      <td class="tb-td tb-muted">{a.job_title || '—'}</td>
                      <td class="tb-td tb-muted">{a.company_name || '—'}</td>
                      <td class="tb-td tb-muted">
                        {a.applied_at ? new Date(a.applied_at).toLocaleDateString('es-SV',{day:'2-digit',month:'short'}) : '—'}
                      </td>
                      <td class="tb-td"><Pill variant={a.status}>{a.status}</Pill></td>
                    </tr>
                  )}
                </For>
              </Show>
            </tbody>
          </table>
        </div>
      </DataCard>
    </>
  );
}

// ── Usuarios Section ──────────────────────────────────────────
function UsuariosSection(props) {
  const [query, setQuery] = createSignal('');
  const filtered = () => {
    const q = query().toLowerCase();
    if (!q) return props.users();
    return props.users().filter(u =>
      `${u.first_name} ${u.last_name} ${u.email} ${u.role} ${u.location||''}`.toLowerCase().includes(q)
    );
  };

  return (
    <DataCard icon="bi-people-fill" title="Gestión de Usuarios">
      <div class="data-card-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '18px' }}>
        <div class="search-wrap">
          <i class="bi bi-search"></i>
          <input
            type="text"
            class="tb-input"
            placeholder="Buscar usuario…"
            value={query()}
            onInput={e => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div class="table-responsive">
        <table class="tb-table">
          <TableHead cols={['Usuario','Email','Rol','Ubicación','Vistas','Estado','Acciones']} />
          <tbody>
            <For each={filtered()}>
              {(u) => (
                <tr>
                  <td class="tb-td">
                    <div class="user-cell">
                      <AvatarSmall id={u.id} firstName={u.first_name} lastName={u.last_name} />
                      <span class="user-name">{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td class="tb-td tb-muted">{u.email}</td>
                  <td class="tb-td"><Pill variant={u.role}>{u.role}</Pill></td>
                  <td class="tb-td tb-muted">{u.location || '—'}</td>
                  <td class="tb-td tb-muted">{u.profile_views ?? 0}</td>
                  <td class="tb-td"><Pill variant={u.status === 'active' ? 'active' : 'suspended'}>{u.status === 'active' ? 'Activo' : 'Suspendido'}</Pill></td>
                  <td class="tb-td">
                    <button
                      class={`tb-action-btn ${u.status === 'active' ? 'tb-btn-danger' : 'tb-btn-ghost'}`}
                      onClick={() => props.onToggleStatus(u)}
                    >
                      {u.status === 'active' ? 'Suspender' : 'Activar'}
                    </button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </DataCard>
  );
}

// ── Empresas Section ──────────────────────────────────────────
function EmpresasSection(props) {
  return (
    <DataCard icon="bi-building" title="Gestión de Empresas">
      <div class="table-responsive">
        <table class="tb-table">
          <TableHead cols={['Empresa','Industria','Tamaño','Sitio Web','Verificación','Acciones']} />
          <tbody>
            <For each={props.companies()}>
              {(c) => (
                <tr>
                  <td class="tb-td">
                    <div class="user-cell">
                      <div class="company-logo-sm">{(c.name||'NN').substring(0,2).toUpperCase()}</div>
                      <span class="user-name">{c.name}</span>
                    </div>
                  </td>
                  <td class="tb-td tb-muted">{c.industry || '—'}</td>
                  <td class="tb-td tb-muted">{c.size || '—'}</td>
                  <td class="tb-td">
                    {c.website
                      ? <a href={c.website} target="_blank" class="tb-link">Ver sitio</a>
                      : '—'}
                  </td>
                  <td class="tb-td">
                    <Pill variant={c.verified ? 'active' : 'pending'}>{c.verified ? 'Verificada' : 'Pendiente'}</Pill>
                  </td>
                  <td class="tb-td">
                    <button
                      class="tb-action-btn tb-btn-ghost"
                      disabled={c.verified}
                      onClick={() => props.onVerify(c)}
                    >
                      {c.verified ? 'Verificada' : 'Verificar'}
                    </button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </DataCard>
  );
}

// ── Empleos Section ───────────────────────────────────────────
function EmpleosSection(props) {
  return (
    <DataCard icon="bi-briefcase-fill" title="Gestión de Empleos">
      <div class="table-responsive">
        <table class="tb-table">
          <TableHead cols={['Título','Empresa','Tipo','Nivel','Ubicación','Estado','Postulaciones']} />
          <tbody>
            <For each={props.jobs()}>
              {(j) => (
                <tr>
                  <td class="tb-td user-name">{j.title}</td>
                  <td class="tb-td">
                    <div class="user-cell">
                      <div class="company-logo-sm" style={{ width:'24px', height:'24px', fontSize:'9px' }}>
                        {initials(j.company_name||'')}
                      </div>
                      <span style={{ fontSize:'13px' }}>{j.company_name || '—'}</span>
                    </div>
                  </td>
                  <td class="tb-td tb-muted">{TYPE_LABELS[j.type]  || j.type  || '—'}</td>
                  <td class="tb-td tb-muted">{LEVEL_LABELS[j.level]|| j.level || '—'}</td>
                  <td class="tb-td tb-muted">{j.location || '—'}</td>
                  <td class="tb-td"><Pill variant={j.status}>{j.status}</Pill></td>
                  <td class="tb-td" style={{ fontWeight:700, color:'var(--primary)' }}>{j.applications_count || 0}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </DataCard>
  );
}

// ── Postulaciones Section ────────────────────────────────────
function PostulacionesSection(props) {
  const sorted = () => [...props.apps()].sort((a,b) => new Date(b.applied_at||b.created_at) - new Date(a.applied_at||a.created_at));
  return (
    <DataCard icon="bi-send-fill" title="Todas las Postulaciones">
      <div class="table-responsive">
        <table class="tb-table">
          <TableHead cols={['Candidato','Empleo','Empresa','Fecha','Estado']} />
          <tbody>
            <Show when={sorted().length > 0} fallback={
              <tr><td colspan="5" class="empty-cell">Sin postulaciones</td></tr>
            }>
              <For each={sorted()}>
                {(a) => (
                  <tr>
                    <td class="tb-td">
                      <div class="user-cell">
                        <AvatarSmall id={a.id} firstName={a.first_name} lastName={a.last_name} />
                        <span class="user-name">{a.first_name} {a.last_name}</span>
                      </div>
                    </td>
                    <td class="tb-td tb-muted">{a.job_title || '—'}</td>
                    <td class="tb-td tb-muted">{a.company_name || '—'}</td>
                    <td class="tb-td tb-muted">
                      {a.applied_at ? new Date(a.applied_at).toLocaleDateString('es-SV',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                    </td>
                    <td class="tb-td"><Pill variant={a.status}>{a.status}</Pill></td>
                  </tr>
                )}
              </For>
            </Show>
          </tbody>
        </table>
      </div>
    </DataCard>
  );
}

// ── Sidebar NavButton ─────────────────────────────────────────
function NavBtn(props) {
  return (
    <button
      class={`nav-link-sb ${props.active ? 'active' : ''}`}
      onClick={props.onClick}
    >
      <i class={`bi ${props.icon}`}></i>
      {props.label}
      {props.badge && <span class="badge-nav">{props.badge}</span>}
    </button>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast(props) {
  return (
    <Show when={props.msg()}>
      <div class={`admin-toast ${props.isError() ? 'toast-error' : 'toast-ok'}`}>
        <i class={`bi ${props.isError() ? 'bi-x-circle-fill' : 'bi-check-circle-fill'}`}></i>
        {props.msg()}
      </div>
    </Show>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function Admin() {
  const auth = useAuth();
  const [section, setSection]         = createSignal('dashboard');
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const [toastMsg, setToastMsg]       = createSignal('');
  const [toastErr, setToastErr]       = createSignal(false);

  const [users,     { refetch: refetchUsers }]     = createResource(() => usersApi.getAll().catch(() => []));
  const [companies, { refetch: refetchCompanies }] = createResource(() => companiesApi.getAll().catch(() => []));
  const [allJobs]                                   = createResource(() => jobsApi.getAll().catch(() => []));

  // Postulaciones: recopila de todos los empleos
  const [apps, setApps] = createSignal([]);
  onMount(async () => {
    if (auth.user()?.role !== 'admin') return;
    try {
      const jobs = await jobsApi.getAll().catch(() => []);
      const all  = [];
      for (const j of jobs) {
        const a = await applicationsApi.getByJob(j.id).catch(() => []);
        a.forEach(x => all.push({ ...x, job_title: j.title, company_name: j.company_name }));
      }
      setApps(all.sort((a,b) => new Date(b.applied_at||b.created_at) - new Date(a.applied_at||a.created_at)));
    } catch(e) {}
  });

  const usersList      = () => users()      || [];
  const companiesList  = () => companies()  || [];
  const jobsList       = () => allJobs()    || [];

  function showToast(msg, isError = false) {
    setToastMsg(msg); setToastErr(isError);
    setTimeout(() => setToastMsg(''), 3500);
  }

  async function handleToggleStatus(u) {
    try {
      const newStatus = u.status === 'active' ? 'suspended' : 'active';
      await usersApi.update(u.id, { ...u, status: newStatus });
      refetchUsers();
      showToast(`Usuario ${newStatus === 'active' ? 'activado' : 'suspendido'} correctamente`);
    } catch { showToast('Error al actualizar el usuario', true); }
  }

  async function handleVerifyCompany(c) {
    try {
      await companiesApi.update(c.id, { ...c, verified: true });
      refetchCompanies();
      showToast('Empresa verificada correctamente');
    } catch { showToast('Error al verificar la empresa', true); }
  }

  const today = new Date().toLocaleDateString('es-SV', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  return (
    <Show
      when={auth.user()?.role === 'admin'}
      fallback={
        <div class="admin-access-denied">
          <i class="bi bi-lock"></i>
          <p>Acceso restringido a administradores.</p>
        </div>
      }
    >
      {/* Overlay móvil */}
      <div
        class={`sidebar-overlay ${sidebarOpen() ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div class="admin-root">

        {/* ── Sidebar ── */}
        <aside class={`admin-sidebar ${sidebarOpen() ? 'open' : ''}`}>
          {/* Logo */}
          <div class="sidebar-logo">
            <div class="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.5 13.5H11.5L10 22L20.5 9.5H13.5L13 2Z" fill="#9ca3b0" stroke="#9ca3b0" stroke-width="0.5" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="brand-text">Conecta<strong class="brand-sv">SV</strong></span>
          </div>

          {/* Nav Principal */}
          <nav class="sidebar-nav">
            <div class="sidebar-section-label">Principal</div>
            <For each={SECTIONS}>
              {(s) => (
                <NavBtn
                  active={section() === s.id}
                  icon={s.icon}
                  label={s.label}
                  onClick={() => { setSection(s.id); setSidebarOpen(false); }}
                />
              )}
            </For>
            <div class="sidebar-section-label">Sistema</div>
            <For each={SYSTEM_SECTIONS}>
              {(s) => (
                <NavBtn
                  active={section() === s.id}
                  icon={s.icon}
                  label={s.label}
                  badge={s.badge}
                  onClick={() => { setSection(s.id); setSidebarOpen(false); }}
                />
              )}
            </For>
          </nav>

          {/* Footer */}
          <div class="sidebar-footer">
            <div class="sidebar-user">
              <div class="user-avatar-sb">
                {auth.user()?.first_name?.[0]}{auth.user()?.last_name?.[0]}
              </div>
              <div>
                <p class="u-name">{auth.user()?.first_name} {auth.user()?.last_name}</p>
                <p class="u-role">{auth.user()?.email}</p>
              </div>
            </div>
            <button class="nav-link-sb" onClick={() => auth.logout()}>
              <i class="bi bi-box-arrow-right"></i>Cerrar sesión
            </button>
          </div>
        </aside>

        {/* ── Main Wrapper ── */}
        <div class="admin-wrapper">

          {/* Topbar */}
          <header class="admin-topbar">
            <div class="topbar-left">
              <button class="sidebar-toggle" onClick={() => setSidebarOpen(v => !v)}>
                <i class="bi bi-list"></i>
              </button>
              <div>
                <div class="topbar-title">
                  {SECTIONS.find(s => s.id === section())?.label ||
                   SYSTEM_SECTIONS.find(s => s.id === section())?.label ||
                   'Dashboard'}
                </div>
                <div class="topbar-date">{today}</div>
              </div>
            </div>
            <div class="topbar-actions">
              <span class="topbar-badge-pending"><i class="bi bi-clock me-1"></i>3 pendientes</span>
              <div class="topbar-icon-btn">
                <i class="bi bi-bell" style={{ fontSize:'14px' }}></i>
                <span class="notif-dot"></span>
              </div>
            </div>
          </header>

          {/* Content */}
          <main class="admin-content">
            <Show when={section() === 'dashboard'}>
              <DashboardSection
                users={usersList}
                jobs={jobsList}
                companies={companiesList}
                apps={apps}
                setSection={setSection}
              />
            </Show>
            <Show when={section() === 'usuarios'}>
              <UsuariosSection users={usersList} onToggleStatus={handleToggleStatus} />
            </Show>
            <Show when={section() === 'empresas'}>
              <EmpresasSection companies={companiesList} onVerify={handleVerifyCompany} />
            </Show>
            <Show when={section() === 'empleos'}>
              <EmpleosSection jobs={jobsList} />
            </Show>
            <Show when={section() === 'postulaciones'}>
              <PostulacionesSection apps={apps} />
            </Show>
            <Show when={section() === 'valoraciones'}>
              <div class="data-card">
                <div class="data-card-header">
                  <span class="data-card-title"><i class="bi bi-star-fill"></i>Valoraciones</span>
                </div>
                <p style={{ color:'var(--text-m)', fontSize:'13px', padding:'12px 0' }}>Módulo en desarrollo.</p>
              </div>
            </Show>
            <Show when={['alertas','moderacion','configuracion'].includes(section())}>
              <div class="data-card">
                <div class="data-card-header">
                  <span class="data-card-title">
                    <i class={`bi ${SYSTEM_SECTIONS.find(s=>s.id===section())?.icon||'bi-gear'}`}></i>
                    {SYSTEM_SECTIONS.find(s=>s.id===section())?.label}
                  </span>
                </div>
                <p style={{ color:'var(--text-m)', fontSize:'13px', padding:'12px 0' }}>Módulo en desarrollo.</p>
              </div>
            </Show>
          </main>
        </div>
      </div>

      {/* Toast */}
      <Toast msg={toastMsg} isError={toastErr} />
    </Show>
  );
}