import { createSignal, createResource, createEffect, For, Show, onMount } from 'solid-js';
import { applicationsApi } from '../lib/api';
import { useAuth } from '../stores/auth';
import { formatDate } from '../lib/utils';

// ── Helpers ──────────────────────────────────────────────────

function initials(str) {
  return (str || '').split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);
}

function statusPill(s) {
  const m = {
    pending:   { cls: 'pill-pending',   l: 'Pendiente' },
    review:    { cls: 'pill-review',    l: 'En Revisión' },
    interview: { cls: 'pill-interview', l: 'Entrevista' },
    accepted:  { cls: 'pill-accepted',  l: 'Aceptado' },
    rejected:  { cls: 'pill-rejected',  l: 'Rechazado' },
  };
  const { cls, l } = m[s] || { cls: 'pill-review', l: s };
  return `<span class="pill ${cls}">${l}</span>`;
}

const TYPE_LABELS = { full: 'Tiempo Completo', part: 'Medio Tiempo', remote: 'Remoto', contract: 'Contrato', freelance: 'Freelance' };
const TYPE_ICONS  = { full: 'bi-clock-fill', part: 'bi-clock-history', remote: 'bi-wifi', contract: 'bi-file-earmark-text', freelance: 'bi-lightning' };
const SECTION_TITLES = {
  dashboard:     'Empleos Disponibles',
  postulaciones: 'Mis Postulaciones',
  guardados:     'Empleos Guardados',
  alertas:       'Mis Alertas',
  empresas:      'Calificar Empresas',
  perfil:        'Mi Perfil',
};

const API = '';

// ── Sub-components ────────────────────────────────────────────

function Toast(props) {
  // props: message, type ('success'|'error'|'warning'|'info'), onRemove
  const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
  return (
    <div class={`sv-toast sv-toast-${props.type || 'success'}`}>
      <i class={`bi ${icons[props.type] || icons.success}`}></i>
      <span>{props.message}</span>
      <button class="sv-toast-close" onClick={props.onRemove}><i class="bi bi-x"></i></button>
    </div>
  );
}

// ── Dashboard Section ─────────────────────────────────────────

function SectionDashboard(props) {
  // props: user, onGoToProfile, onGoToApplications, onGoToSaved, showToast
  const [allJobs, setAllJobs] = createSignal([]);
  const [filtered, setFiltered] = createSignal([]);
  const [search, setSearch] = createSignal('');
  const [typeFilter, setTypeFilter] = createSignal('');
  const [locationFilter, setLocationFilter] = createSignal('');
  const [levelFilter, setLevelFilter] = createSignal('');
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const res = await fetch(`${API}/api/jobs`);
      const jobs = await res.json();
      setAllJobs(jobs);
      setFiltered(jobs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  });

  const applyFilters = () => {
    const s = search().toLowerCase();
    const t = typeFilter();
    const l = locationFilter().toLowerCase();
    const lv = levelFilter();
    setFiltered(allJobs().filter(job => {
      const matchSearch = !s || job.title.toLowerCase().includes(s) || (job.company_name && job.company_name.toLowerCase().includes(s));
      const matchType = !t || job.type === t;
      const matchLoc = !l || (job.location && job.location.toLowerCase().includes(l));
      const matchLvl = !lv || job.level === lv;
      return matchSearch && matchType && matchLoc && matchLvl;
    }));
  };

  const handleSearch = (e) => { setSearch(e.target.value); applyFilters(); };
  const handleType = (e) => { setTypeFilter(e.target.value); applyFilters(); };
  const handleLoc = (e) => { setLocationFilter(e.target.value); applyFilters(); };
  const handleLvl = (e) => { setLevelFilter(e.target.value); applyFilters(); };

  const applyToJob = async (jobId) => {
    if (!props.user) { props.showToast('Debes iniciar sesión', 'error'); return; }
    if (!confirm('¿Confirmas tu postulación a este empleo?')) return;
    try {
      const res = await fetch(`${API}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, candidate_id: props.user.id, cover_letter: 'Postulación desde dashboard' }),
      });
      if (res.status === 409) { props.showToast('Ya te postulaste a este empleo', 'error'); return; }
      if (!res.ok) throw new Error();
      props.showToast('¡Postulación enviada exitosamente!', 'success');
    } catch { props.showToast('Error al enviar postulación', 'error'); }
  };

  const saveJob = async (jobId) => {
    if (!props.user) { props.showToast('Debes iniciar sesión', 'error'); return; }
    try {
      const res = await fetch(`${API}/api/saved-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: props.user.id, job_id: jobId }),
      });
      if (res.status === 409) { props.showToast('Este empleo ya está guardado', 'error'); return; }
      if (!res.ok) throw new Error();
      props.showToast('Empleo guardado correctamente', 'success');
    } catch { props.showToast('Error al guardar el empleo', 'error'); }
  };

  const viewDetail = (job) => {
    alert(`Detalles de ${job.title}\nEmpresa: ${job.company_name}\nDescripción: ${job.description}`);
  };

  const timeLabel = (createdAt) => {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
    return days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days} días`;
  };

  const salary = (job) => {
    if (job.salary_min && job.salary_max) return `$${Number(job.salary_min).toLocaleString()} – $${Number(job.salary_max).toLocaleString()}`;
    if (job.salary_min) return `Desde $${Number(job.salary_min).toLocaleString()}`;
    if (job.salary_max) return `Hasta $${Number(job.salary_max).toLocaleString()}`;
    return null;
  };

  return (
    <>
      <div class="section-title"><i class="bi bi-briefcase-fill me-1"></i>Empleos Disponibles</div>

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="metric-card c-blue">
            <div class="metric-icon"><i class="bi bi-person-badge"></i></div>
            <div style="font-size:15px;font-weight:700;">Perfil completo</div>
            <div style="font-size:13px;color:var(--text-m);margin-top:6px;">Actualiza tu perfil para mejorar tus oportunidades.</div>
            <button class="tb-btn-primary mt-3" style="font-size:13px;padding:8px 14px;" onClick={props.onGoToProfile}>Completar perfil</button>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card c-accent">
            <div class="metric-icon"><i class="bi bi-search"></i></div>
            <div style="font-size:15px;font-weight:700;">Buscar empleo</div>
            <div style="font-size:13px;color:var(--text-m);margin-top:6px;">Filtra por ubicación, tipo y nivel para encontrar rápido.</div>
            <button class="tb-btn-primary mt-3" style="font-size:13px;padding:8px 14px;" onClick={() => document.getElementById('searchInput')?.focus()}>Filtrar empleos</button>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card c-green">
            <div class="metric-icon"><i class="bi bi-send-fill"></i></div>
            <div style="font-size:15px;font-weight:700;">Revisar postulaciones</div>
            <div style="font-size:13px;color:var(--text-m);margin-top:6px;">Controla tus postulaciones y su estado desde aquí.</div>
            <button class="tb-btn-primary mt-3" style="font-size:13px;padding:8px 14px;" onClick={props.onGoToApplications}>Ver mis postulaciones</button>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card c-warn">
            <div class="metric-icon"><i class="bi bi-bookmark-fill"></i></div>
            <div style="font-size:15px;font-weight:700;">Empleos guardados</div>
            <div style="font-size:13px;color:var(--text-m);margin-top:6px;">Guarda tus vacantes favoritas y recuérdalas después.</div>
            <button class="tb-btn-primary mt-3" style="font-size:13px;padding:8px 14px;" onClick={props.onGoToSaved}>Ver guardados</button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div class="data-card mb-4">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="tb-label">Buscar por título o empresa</label>
            <input id="searchInput" type="text" class="form-control tb-input" placeholder="Ej: Desarrollador, Google..." onInput={handleSearch} />
          </div>
          <div class="col-md-3">
            <label class="tb-label">Tipo de empleo</label>
            <select class="form-control tb-select" onChange={handleType}>
              <option value="">Todos los tipos</option>
              <option value="full">Tiempo Completo</option>
              <option value="part">Medio Tiempo</option>
              <option value="remote">Remoto</option>
              <option value="contract">Contrato</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="tb-label">Ubicación</label>
            <input type="text" class="form-control tb-input" placeholder="Ej: San Salvador..." onInput={handleLoc} />
          </div>
          <div class="col-md-2">
            <label class="tb-label">Nivel</label>
            <select class="form-control tb-select" onChange={handleLvl}>
              <option value="">Todos los niveles</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job list */}
      <Show when={!loading()} fallback={
        <div class="text-center py-4">
          <i class="bi bi-arrow-clockwise" style="font-size:2rem;opacity:.3"></i>
          <p class="mt-2" style="color:#888">Cargando empleos...</p>
        </div>
      }>
        <Show when={filtered().length > 0} fallback={
          <div class="text-center py-4">
            <i class="bi bi-search" style="font-size:2.5rem;opacity:.3"></i>
            <p class="mt-2" style="color:#888">No se encontraron empleos con esos criterios</p>
          </div>
        }>
          <For each={filtered()}>
            {(job) => {
              const sal = salary(job);
              const ini = (job.company_name || 'NN').split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);
              return (
                <div class="job-card">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="d-flex align-items-center gap-3">
                      <div style="width:48px;height:48px;border-radius:12px;background:rgba(26,58,92,.08);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:var(--accent,#e8943a)">
                        {ini}
                      </div>
                      <div>
                        <h5 class="mb-1" style="font-weight:700;font-size:18px;color:var(--primary)">{job.title}</h5>
                        <p class="mb-0" style="font-size:14px;color:var(--text-m)">{job.company_name || 'Empresa'}</p>
                      </div>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn tb-btn-ghost" onClick={() => saveJob(job.id)} title="Guardar">
                        <i class="bi bi-bookmark"></i>
                      </button>
                      <button class="btn tb-btn-primary" onClick={() => applyToJob(job.id)}>
                        <i class="bi bi-send-fill me-1"></i>Postularme
                      </button>
                    </div>
                  </div>

                  <div class="d-flex flex-wrap gap-2 mb-3">
                    <span class="badge" style="background:rgba(26,58,92,.08);color:#1a3a5c;font-size:12px;font-weight:600">
                      <i class={`bi ${TYPE_ICONS[job.type] || 'bi-briefcase'} me-1`}></i>{TYPE_LABELS[job.type] || job.type}
                    </span>
                    <Show when={job.location}>
                      <span class="badge" style="background:rgba(34,197,94,.08);color:#166534;font-size:12px;font-weight:600">
                        <i class="bi bi-geo-alt me-1"></i>{job.location}
                      </span>
                    </Show>
                    <Show when={job.level}>
                      <span class="badge" style="background:rgba(168,85,247,.08);color:#7c3aed;font-size:12px;font-weight:600">
                        <i class="bi bi-bar-chart me-1"></i>{job.level}
                      </span>
                    </Show>
                  </div>

                  <Show when={sal}>
                    <p class="mb-2" style="font-size:16px;font-weight:700;color:var(--accent,#e8943a)">
                      <i class="bi bi-cash-stack me-1"></i>{sal}/mes
                    </p>
                  </Show>

                  <p class="mb-3" style="color:var(--text-m);font-size:14px">
                    {job.description ? job.description.substring(0, 150) + (job.description.length > 150 ? '...' : '') : 'Sin descripción'}
                  </p>

                  <div class="d-flex justify-content-between align-items-center">
                    <span style="font-size:12px;color:#888">
                      <i class="bi bi-clock me-1"></i>{timeLabel(job.created_at)}
                    </span>
                    <button class="btn tb-btn-ghost" onClick={() => viewDetail(job)}>
                      Ver detalles <i class="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </div>
              );
            }}
          </For>
        </Show>
      </Show>
    </>
  );
}

// ── Postulaciones Section ─────────────────────────────────────

function SectionPostulaciones(props) {
  const [apps, setApps] = createSignal([]);
  const [loading, setLoading] = createSignal(true);

  const load = async () => {
    if (!props.user) return;
    setLoading(true);
    try {
      const data = await fetch(`${API}/api/applications/candidate/${props.user.id}`).then(r => r.json());
      setApps(data.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  onMount(load);

  const withdraw = async (appId) => {
    if (!confirm('¿Retirar esta postulación?')) return;
    try {
      await fetch(`${API}/api/applications/${appId}`, { method: 'DELETE' });
      props.showToast('Postulación retirada', 'success');
      load();
    } catch { props.showToast('Error', 'error'); }
  };

  return (
    <>
      <div class="section-title"><i class="bi bi-send-fill me-1"></i>Mis Postulaciones</div>
      <div class="data-card">
        <div class="data-card-header">
          <span class="data-card-title"><i class="bi bi-list-check"></i>Historial de Postulaciones</span>
        </div>
        <div class="table-responsive">
          <table class="table tb-table mb-0">
            <thead>
              <tr><th>Empleo</th><th>Empresa</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <Show when={!loading()} fallback={<tr><td colspan="6" class="text-center py-3" style="color:#888">Cargando...</td></tr>}>
                <Show when={apps().length > 0} fallback={<tr><td colspan="6" class="text-center py-3" style="color:#888">No tienes postulaciones</td></tr>}>
                  <For each={apps()}>
                    {(a) => {
                      const date = new Date(a.applied_at).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
                      const logoStr = a.company_logo || '';
                      const isUrl = logoStr.startsWith('http') || logoStr.startsWith('/');
                      return (
                        <tr>
                          <td style="font-weight:600;color:var(--primary)">{a.job_title || 'Empleo'}</td>
                          <td>
                            <div class="d-flex align-items-center gap-2">
                              <div class="user-avatar-sb" style="width:24px;height:24px;font-size:9px;background:rgba(26,58,92,.08);color:var(--accent);overflow:hidden;flex-shrink:0">
                                <Show when={isUrl} fallback={initials(a.company_name || '')}>
                                  <img src={logoStr} alt={a.company_name || ''} style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />
                                </Show>
                              </div>
                              <span style="font-size:13px">{a.company_name || '—'}</span>
                            </div>
                          </td>
                          <td style="color:var(--text-m)">{TYPE_LABELS[a.job_type] || a.job_type || '—'}</td>
                          <td style="color:var(--text-m)">{date}</td>
                          <td innerHTML={statusPill(a.status)}></td>
                          <td>
                            <Show when={a.status === 'pending'} fallback={<span style="color:#aaa;font-size:12px">—</span>}>
                              <button class="btn btn-sm tb-btn-danger" onClick={() => withdraw(a.id)}>
                                <i class="bi bi-x-circle me-1"></i>Retirar
                              </button>
                            </Show>
                          </td>
                        </tr>
                      );
                    }}
                  </For>
                </Show>
              </Show>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Guardados Section ─────────────────────────────────────────

function SectionGuardados(props) {
  const [saved, setSaved] = createSignal([]);
  const [loading, setLoading] = createSignal(true);

  const load = async () => {
    if (!props.user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/saved-jobs/${props.user.id}`);
      if (!res.ok) { setSaved([]); return; }
      setSaved(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  onMount(load);

  const remove = async (jobId) => {
    if (!confirm('¿Eliminar este empleo guardado?')) return;
    try {
      const res = await fetch(`${API}/api/saved-jobs/${props.user.id}/${jobId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      props.showToast('Empleo removido de guardados', 'success');
      load();
    } catch { props.showToast('No se pudo eliminar el empleo guardado', 'error'); }
  };

  return (
    <>
      <div class="section-title"><i class="bi bi-bookmark-fill me-1"></i>Empleos Guardados</div>
      <Show when={!loading()} fallback={<div class="empty-state"><i class="bi bi-arrow-clockwise"></i><p>Cargando...</p></div>}>
        <Show when={saved().length > 0} fallback={
          <div class="data-card">
            <div class="empty-state"><i class="bi bi-bookmark"></i><p>No has guardado empleos aún. Usa el icono de guardar en la lista de empleos.</p></div>
          </div>
        }>
          <For each={saved()}>
            {(j) => (
              <div class="job-card">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 style="font-weight:700;margin:0 0 4px">{j.title}</h6>
                    <span style="font-size:13px;color:var(--text-m)">{j.company_name || '—'} · {j.location || '—'}</span>
                  </div>
                  <div class="d-flex gap-2">
                    <button class="btn btn-sm tb-btn-danger" onClick={() => remove(j.job_id)}>
                      <i class="bi bi-x-circle me-1"></i>Eliminar
                    </button>
                  </div>
                </div>
                <p style="color:var(--text-m);font-size:13px;margin-bottom:0">
                  {j.description ? j.description.substring(0, 120) + (j.description.length > 120 ? '...' : '') : 'Sin descripción disponible'}
                </p>
              </div>
            )}
          </For>
        </Show>
      </Show>
    </>
  );
}

// ── Alertas Section ───────────────────────────────────────────

function SectionAlertas(props) {
  const [alerts, setAlerts] = createSignal([]);
  const [loading, setLoading] = createSignal(true);

  const load = async () => {
    if (!props.user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/alerts/${props.user.id}`);
      setAlerts(res.ok ? await res.json() : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  onMount(load);

  const toggle = async (id, active) => {
    try {
      const res = await fetch(`${API}/api/alerts/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error();
      props.showToast(`Alerta ${active ? 'activada ✅' : 'desactivada'}`, 'success');
      load();
    } catch { props.showToast('Error', 'error'); }
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar esta alerta?')) return;
    try {
      const res = await fetch(`${API}/api/alerts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      props.showToast('Alerta eliminada', 'success');
      load();
    } catch { props.showToast('Error al eliminar la alerta', 'error'); }
  };

  const createAlert = async () => {
    const query = prompt('Describe la búsqueda para tu alerta de empleo (por ejemplo: Desarrollador backend remoto)');
    if (!query || !query.trim()) return;
    try {
      const res = await fetch(`${API}/api/alerts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: props.user.id, query: query.trim(), active: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        props.showToast(err?.error || 'Error al crear la alerta', 'error');
        return;
      }
      props.showToast('Alerta creada correctamente', 'success');
      load();
    } catch { props.showToast('Error al crear la alerta', 'error'); }
  };

  return (
    <>
      <div class="section-title"><i class="bi bi-bell-fill me-1"></i>Mis Alertas de Empleo</div>
      <div class="data-card">
        <div class="data-card-header">
          <span class="data-card-title"><i class="bi bi-bell"></i>Alertas Configuradas</span>
          <button class="btn tb-btn-primary btn-sm" onClick={createAlert}>+ Nueva alerta</button>
        </div>
        <div class="table-responsive">
          <table class="table tb-table mb-0">
            <thead><tr><th>Búsqueda</th><th>Estado</th><th>Creada</th><th>Acciones</th></tr></thead>
            <tbody>
              <Show when={!loading()} fallback={<tr><td colspan="4" class="text-center py-3" style="color:#888">Cargando...</td></tr>}>
                <Show when={alerts().length > 0} fallback={<tr><td colspan="4" class="text-center py-3" style="color:#888">No tienes alertas configuradas</td></tr>}>
                  <For each={alerts()}>
                    {(a) => {
                      const date = new Date(a.created_at).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
                      return (
                        <tr>
                          <td style="font-weight:600;color:var(--primary)">{a.query}</td>
                          <td innerHTML={a.active ? '<span class="pill pill-active">Activa</span>' : '<span class="pill pill-closed">Inactiva</span>'}></td>
                          <td style="color:var(--text-m)">{date}</td>
                          <td class="d-flex gap-2">
                            <button class="btn btn-sm tb-btn-ghost" onClick={() => toggle(a.id, !a.active)}>
                              {a.active ? 'Desactivar' : 'Activar'}
                            </button>
                            <button class="btn btn-sm tb-btn-danger" onClick={() => remove(a.id)}>Eliminar</button>
                          </td>
                        </tr>
                      );
                    }}
                  </For>
                </Show>
              </Show>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Perfil Section ────────────────────────────────────────────

function SectionPerfil(props) {
  // props: user, setUser, showToast
  const [firstName, setFirstName] = createSignal('');
  const [lastName, setLastName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [phone, setPhone] = createSignal('');
  const [location, setLocation] = createSignal('');
  const [skills, setSkills] = createSignal('');
  const [bio, setBio] = createSignal('');
  const [photoPreview, setPhotoPreview] = createSignal('');
  const [saving, setSaving] = createSignal(false);

  onMount(async () => {
    if (!props.user) return;
    try {
      const users = await fetch(`${API}/api/users`).then(r => r.json());
      const u = users.find(x => x.id === props.user.id);
      if (!u) return;
      setFirstName(u.first_name || '');
      setLastName(u.last_name || '');
      setEmail(u.email || '');
      setPhone(u.phone || '');
      setLocation(u.location || '');
      setBio(u.bio || '');
      setPhotoPreview(u.profile_photo_url || '');
      try {
        const parsed = u.skills ? JSON.parse(u.skills) : [];
        setSkills(Array.isArray(parsed) ? parsed.join(', ') : u.skills || '');
      } catch { setSkills(u.skills || ''); }
    } catch (e) { console.error(e); }
  });

  const previewFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else { setPhotoPreview(''); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const skillsArr = skills().split(',').map(s => s.trim()).filter(s => s);
      const formData = new FormData();
      formData.append('first_name', firstName());
      formData.append('last_name', lastName());
      formData.append('email', props.user.email);
      formData.append('role', 'candidate');
      formData.append('phone', phone());
      formData.append('location', location());
      formData.append('bio', bio());
      formData.append('skills', JSON.stringify(skillsArr));
      formData.append('status', 'active');
      const file = document.getElementById('profPhotoFile')?.files?.[0];
      if (file) formData.append('profile_photo', file);

      const res = await fetch(`${API}/api/users/${props.user.id}`, { method: 'PUT', body: formData });
      if (!res.ok) { props.showToast('Error al guardar', 'error'); return; }
      const updated = await res.json();
      props.showToast('Perfil actualizado correctamente ✓', 'success');
      if (props.setUser) props.setUser(prev => ({ ...prev, first_name: firstName(), last_name: lastName(), profile_photo_url: updated.usuario?.profile_photo_url }));
    } catch { props.showToast('Error de conexión', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div class="section-title"><i class="bi bi-person-gear me-1"></i>Mi Perfil</div>
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="data-card">
            <div class="data-card-header">
              <span class="data-card-title"><i class="bi bi-person"></i>Información Personal</span>
            </div>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="tb-label">Nombre</label>
                <input type="text" class="form-control tb-input" value={firstName()} onInput={(e) => setFirstName(e.target.value)} />
              </div>
              <div class="col-md-6">
                <label class="tb-label">Apellido</label>
                <input type="text" class="form-control tb-input" value={lastName()} onInput={(e) => setLastName(e.target.value)} />
              </div>
              <div class="col-md-6">
                <label class="tb-label">Correo Electrónico</label>
                <input type="email" class="form-control tb-input" value={email()} readOnly />
              </div>
              <div class="col-md-6">
                <label class="tb-label">Teléfono</label>
                <input type="text" class="form-control tb-input" value={phone()} onInput={(e) => setPhone(e.target.value)} />
              </div>
              <div class="col-12">
                <label class="tb-label">Foto de Perfil</label>
                <input id="profPhotoFile" type="file" class="form-control tb-input" accept="image/*" onChange={previewFile} />
              </div>
              <div class="col-12">
                <label class="tb-label">Vista previa</label>
                <div class="profile-photo-preview">
                  <Show when={photoPreview()}>
                    <img src={photoPreview()} alt="Vista previa foto de perfil" style="display:block" />
                  </Show>
                </div>
              </div>
              <div class="col-12">
                <label class="tb-label">Ubicación</label>
                <input type="text" class="form-control tb-input" value={location()} onInput={(e) => setLocation(e.target.value)} placeholder="Ej: San Salvador, SV" />
              </div>
              <div class="col-12">
                <label class="tb-label">Habilidades</label>
                <input type="text" class="form-control tb-input" value={skills()} onInput={(e) => setSkills(e.target.value)} placeholder='Separadas por coma: React, Node.js, PostgreSQL' />
              </div>
              <div class="col-12">
                <label class="tb-label">Resumen Profesional</label>
                <textarea class="form-control tb-input" rows="4" placeholder="Cuéntanos sobre ti..." value={bio()} onInput={(e) => setBio(e.target.value)}></textarea>
              </div>
            </div>
            <button class="btn tb-btn-primary mt-3" onClick={save} disabled={saving()}>
              <i class="bi bi-check-circle me-2"></i>{saving() ? 'Guardando…' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="data-card">
            <div class="data-card-header">
              <span class="data-card-title"><i class="bi bi-lightbulb"></i>Consejos</span>
            </div>
            <ul style="font-size:13px;color:var(--text-m);padding-left:18px;margin:0">
              <li class="mb-2">Completa tu perfil para que las empresas te encuentren más fácil.</li>
              <li class="mb-2">Agrega todas tus habilidades para mejorar tu visibilidad.</li>
              <li class="mb-2">Un buen resumen profesional aumenta tus posibilidades.</li>
              <li>Mantén tu teléfono actualizado para que te contacten.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Empresas Section ──────────────────────────────────────────

function SectionEmpresas(props) {
  const [companies, setCompanies] = createSignal([]);
  const [myRatings, setMyRatings] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [ratingModal, setRatingModal] = createSignal(null); // { companyId, name, rating, comment }
  const [selectedStar, setSelectedStar] = createSignal(0);
  const [ratingComment, setRatingComment] = createSignal('');
  const [submitting, setSubmitting] = createSignal(false);

  const load = async () => {
    if (!props.user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/ratings`);
      const list = await res.json();
      setCompanies(Array.isArray(list) ? list : []);

      const ratings = await Promise.all(
        (Array.isArray(list) ? list : []).map(c =>
          fetch(`${API}/api/ratings/user/${props.user.id}/company/${c.id}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );
      setMyRatings(ratings);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  onMount(load);

  const openModal = (companyId, name, existingRating, existingComment) => {
    setRatingModal({ companyId, name });
    setSelectedStar(existingRating || 0);
    setRatingComment(existingComment || '');
  };

  const submitRating = async () => {
    if (!selectedStar()) { props.showToast('Selecciona una calificación de 1 a 5 estrellas', 'warning'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: props.user.id,
          company_id: Number(ratingModal().companyId),
          rating: selectedStar(),
          comment: ratingComment() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al guardar');
      }
      setRatingModal(null);
      props.showToast(`¡Calificación guardada! ${'⭐'.repeat(selectedStar())}`, 'success');
      load();
    } catch (e) { props.showToast(e.message || 'Error al guardar calificación', 'error'); }
    finally { setSubmitting(false); }
  };

  const deleteRating = async (companyId) => {
    if (!confirm('¿Eliminar tu calificación de esta empresa?')) return;
    try {
      const res = await fetch(`${API}/api/ratings/${props.user.id}/${companyId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      props.showToast('Calificación eliminada', 'success');
      load();
    } catch { props.showToast('Error al eliminar calificación', 'error'); }
  };

  const StarLabel = (val) => {
    const labels = { 1: '😞 Muy malo', 2: '😕 Malo', 3: '😐 Regular', 4: '😊 Bueno', 5: '🤩 Excelente' };
    return labels[val] || '';
  };

  return (
    <>
      <div class="section-title"><i class="bi bi-star-fill me-1" style="color:#f59e0b"></i>Calificar Empresas</div>

      <div class="data-card mb-4" style="background:linear-gradient(135deg,rgba(26,58,92,.04),rgba(232,148,58,.04));border:1px solid rgba(232,148,58,.15)">
        <div style="display:flex;align-items:center;gap:12px">
          <i class="bi bi-info-circle" style="color:var(--accent);font-size:20px;flex-shrink:0"></i>
          <p style="margin:0;font-size:13px;color:var(--text-m)">Tu opinión ayuda a otros candidatos a tomar mejores decisiones. Califica empresas donde hayas postulado o trabajado.</p>
        </div>
      </div>

      <Show when={!loading()} fallback={
        <div class="row g-3">
          <div class="col-12 text-center py-4">
            <i class="bi bi-arrow-clockwise" style="font-size:2rem;opacity:.3"></i>
            <p class="mt-2" style="color:#888">Cargando empresas...</p>
          </div>
        </div>
      }>
        <Show when={companies().length > 0} fallback={
          <div class="col-12">
            <div class="empty-state"><i class="bi bi-building"></i><p>No hay empresas registradas aún.</p></div>
          </div>
        }>
          <div class="row g-3">
            <For each={companies()}>
              {(company, i) => {
                const myRating = () => myRatings()[i()];
                const avg = company.avg_rating ? Number(company.avg_rating) : 0;
                const total = Number(company.total_ratings) || 0;
                const logoStr = company.logo || '';
                const isUrl = logoStr.startsWith('http') || logoStr.startsWith('/');
                const ini = (company.name || '?').split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);
                const alreadyRated = !!myRating();

                const starsAvg = (n) => {
                  const full = avg >= n, half = !full && avg >= n - 0.5;
                  return full ? 'bi-star-fill filled' : half ? 'bi-star-half filled' : 'bi-star';
                };

                const commentPreview = myRating()?.comment
                  ? `"${myRating().comment.slice(0, 55)}${myRating().comment.length > 55 ? '…"' : '"'}`
                  : 'Sin comentario';

                return (
                  <div class="col-md-4 col-sm-6">
                    <div class="company-rating-card h-100">
                      <div class="d-flex align-items-center gap-3">
                        <div class="company-logo-badge" style={`overflow:hidden;background:${isUrl ? 'transparent' : 'rgba(26,58,92,.08)'}`}>
                          <Show when={isUrl} fallback={<span>{ini}</span>}>
                            <img src={logoStr} alt={company.name} style="width:100%;height:100%;object-fit:cover;border-radius:10px;" />
                          </Show>
                        </div>
                        <div style="flex:1;min-width:0">
                          <div style="font-weight:700;font-size:15px;color:var(--primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{company.name}</div>
                          <div style="font-size:12px;color:var(--text-m);margin-top:2px">
                            <i class="bi bi-briefcase me-1" style="opacity:.5"></i>{company.industry || 'Industria no especificada'}
                          </div>
                        </div>
                      </div>

                      <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(26,58,92,.03);border-radius:var(--radius);border:1px solid var(--border)">
                        <div style="font-size:2rem;font-family:var(--font-title);color:var(--primary);line-height:1;min-width:40px;text-align:center">
                          {avg > 0 ? avg.toFixed(1) : '—'}
                        </div>
                        <div>
                          <div style="display:flex;gap:2px;margin-bottom:3px">
                            <For each={[1,2,3,4,5]}>
                              {(n) => <i class={`bi ${starsAvg(n)} star-icon`} style="font-size:15px"></i>}
                            </For>
                          </div>
                          <div style="font-size:11px;color:var(--text-l)">{total} {total === 1 ? 'calificación' : 'calificaciones'}</div>
                        </div>
                      </div>

                      <Show when={alreadyRated}>
                        <div style="padding:10px 12px;background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.18);border-radius:var(--radius)">
                          <div style="font-size:10px;font-weight:700;letter-spacing:.06em;color:var(--text-m);margin-bottom:5px;text-transform:uppercase">Tu calificación</div>
                          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                            <div style="display:flex;gap:2px">
                              <For each={[1,2,3,4,5]}>
                                {(n) => <i class="bi bi-star-fill" style={`font-size:12px;color:${myRating()?.rating >= n ? '#f59e0b' : '#d1d5db'}`}></i>}
                              </For>
                            </div>
                            <span style="font-size:12px;color:var(--text-m);font-style:italic">{commentPreview}</span>
                          </div>
                        </div>
                      </Show>

                      <div class="d-flex gap-2 mt-auto pt-1">
                        <button class="btn tb-btn-primary flex-fill"
                          onClick={() => openModal(company.id, company.name, alreadyRated ? myRating().rating : 0, alreadyRated ? myRating().comment : '')}>
                          <i class={`bi bi-${alreadyRated ? 'pencil-fill' : 'star-fill'} me-1`}></i>{alreadyRated ? 'Editar' : 'Calificar'}
                        </button>
                        <Show when={alreadyRated}>
                          <button class="btn tb-btn-danger" onClick={() => deleteRating(company.id)} title="Eliminar mi calificación">
                            <i class="bi bi-trash"></i>
                          </button>
                        </Show>
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </Show>

      {/* Rating Modal */}
      <Show when={ratingModal()}>
        <div class="modal fade show" style="display:block;background:rgba(0,0,0,.5)" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" style="font-family:var(--font-title);font-size:1.15rem;color:var(--primary)">
                  Calificar: {ratingModal().name}
                </h5>
                <button type="button" class="btn-close" onClick={() => setRatingModal(null)}></button>
              </div>
              <div class="modal-body">
                <div style="text-align:center;margin-bottom:20px">
                  <div style="font-size:13px;color:var(--text-m);margin-bottom:10px">Selecciona una puntuación del 1 al 5</div>
                  <div class="stars-input" id="starsInput">
                    <For each={[5,4,3,2,1]}>
                      {(n) => (
                        <>
                          <input type="radio" id={`s${n}`} name="star" value={n} checked={selectedStar() === n} onChange={() => setSelectedStar(n)} />
                          <label for={`s${n}`} title={`${n} estrellas`}><i class="bi bi-star-fill"></i></label>
                        </>
                      )}
                    </For>
                  </div>
                  <div style="font-size:13px;color:var(--accent);font-weight:600;margin-top:8px;min-height:20px">
                    {StarLabel(selectedStar())}
                  </div>
                </div>
                <div>
                  <label class="tb-label">Comentario <span style="color:var(--text-l);font-weight:400">(opcional)</span></label>
                  <textarea class="form-control tb-input" rows="4" placeholder="Comparte tu experiencia con esta empresa..."
                    value={ratingComment()} onInput={(e) => setRatingComment(e.target.value)}></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn tb-btn-ghost" onClick={() => setRatingModal(null)}>Cancelar</button>
                <button type="button" class="btn tb-btn-primary" onClick={submitRating} disabled={submitting()}>
                  {submitting()
                    ? <><span class="spinner-border spinner-border-sm me-2"></span>Guardando…</>
                    : <><i class="bi bi-star-fill me-2"></i>Guardar Calificación</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}

// ── Main Candidate Component ──────────────────────────────────

export default function Candidate() {
  const auth = useAuth();
  const [section, setSection] = createSignal('dashboard');
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const [toasts, setToasts] = createSignal([]);
  const [user, setUser] = createSignal(null);

  onMount(() => {
    const stored = sessionStorage.getItem('candidateUser');
    if (stored) {
      setUser(JSON.parse(stored));
      setTimeout(() => showToast(`¡Bienvenido de nuevo, ${JSON.parse(stored).first_name}! 👋`, 'success'), 600);
    } else {
      // Use auth store if available
      if (auth.user()?.role === 'candidate') {
        setUser(auth.user());
      } else {
        showToast('No hay sesión activa. Redirigiendo…', 'error');
        setTimeout(() => { window.location.href = '/'; }, 1500);
      }
    }
    const dateEl = document.getElementById('topbarDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('es-SV', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  });

  createEffect(() => {
    // Keep session storage in sync
    const u = user();
    if (u) sessionStorage.setItem('candidateUser', JSON.stringify(u));
  });

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const navigate = (id) => {
    setSection(id);
    setSidebarOpen(false);
  };

  const confirmLogout = () => {
    if (confirm('¿Cerrar sesión?')) {
      sessionStorage.removeItem('candidateUser');
      showToast('Sesión cerrada. Redirigiendo…', 'info');
      setTimeout(() => { window.location.href = '/'; }, 1200);
    }
  };

  const topbarAvatar = () => {
    const u = user();
    if (!u) return null;
    if (u.profile_photo_url) {
      return <div class="topbar-user-avatar" style={`background-image:url("${u.profile_photo_url}");background-size:cover;background-position:center;background-color:transparent`}></div>;
    }
    return <div class="topbar-user-avatar">{`${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase()}</div>;
  };

  const navItem = (id, icon, label) => (
    <button class={`nav-link-sb${section() === id ? ' active' : ''}`} onClick={() => navigate(id)}>
      <i class={`bi ${icon}`}></i>{label}
    </button>
  );

  return (
    <>
      {/* Sidebar overlay */}
      <Show when={sidebarOpen()}>
        <div class="sidebar-overlay open" onClick={() => setSidebarOpen(false)}></div>
      </Show>

      {/* Sidebar */}
      <aside class={`admin-sidebar${sidebarOpen() ? ' open' : ''}`}>
        <div class="sidebar-logo">
          <div class="brand-icon"><i class="bi bi-briefcase-fill" style="color:#4d9cf8;font-size:18px"></i></div>
          <span class="brand-text">Conecta<strong class="brand-sv">SV</strong></span>
        </div>
        <div class="sidebar-section-label">Mi cuenta</div>
        {navItem('dashboard', 'bi-house', 'Inicio')}
        {navItem('postulaciones', 'bi-send-fill', 'Mis Postulaciones')}
        {navItem('guardados', 'bi-bookmark-fill', 'Empleos Guardados')}
        {navItem('alertas', 'bi-bell-fill', 'Mis Alertas')}
        {navItem('empresas', 'bi-star-fill', 'Calificar Empresas')}
        <div class="sidebar-section-label">Configuración</div>
        {navItem('perfil', 'bi-person-gear', 'Mi Perfil')}
        <div class="sidebar-footer">
          <button class="nav-link-sb mt-1" onClick={confirmLogout}>
            <i class="bi bi-box-arrow-right"></i>Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main wrapper */}
      <div class="admin-wrapper">
        {/* Topbar */}
        <header class="admin-topbar">
          <div class="d-flex align-items-center gap-3">
            <button class="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
              <i class="bi bi-list"></i>
            </button>
            <div>
              <div class="topbar-title">{SECTION_TITLES[section()] || section()}</div>
              <div class="topbar-date" id="topbarDate"></div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main class="admin-content">
          <Show when={section() === 'dashboard'}>
            <SectionDashboard
              user={user()}
              showToast={showToast}
              onGoToProfile={() => navigate('perfil')}
              onGoToApplications={() => navigate('postulaciones')}
              onGoToSaved={() => navigate('guardados')}
            />
          </Show>
          <Show when={section() === 'postulaciones'}>
            <SectionPostulaciones user={user()} showToast={showToast} />
          </Show>
          <Show when={section() === 'guardados'}>
            <SectionGuardados user={user()} showToast={showToast} />
          </Show>
          <Show when={section() === 'alertas'}>
            <SectionAlertas user={user()} showToast={showToast} />
          </Show>
          <Show when={section() === 'empresas'}>
            <SectionEmpresas user={user()} showToast={showToast} />
          </Show>
          <Show when={section() === 'perfil'}>
            <SectionPerfil user={user()} setUser={setUser} showToast={showToast} />
          </Show>
        </main>
      </div>

      {/* Toast container */}
      <div class="sv-toast-wrap">
        <For each={toasts()}>
          {(t) => <Toast message={t.message} type={t.type} onRemove={() => removeToast(t.id)} />}
        </For>
      </div>
    </>
  );
}