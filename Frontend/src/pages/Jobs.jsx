import { A } from '@solidjs/router';
import { createSignal, createResource, For, Show } from 'solid-js';
import { jobsApi } from '../lib/api';
import {
  TYPE_LABELS,
  companyInitials,
  salaryLabel,
  daysAgo,
  jobMatchesTypeFilter,
} from '../lib/utils';

export default function Jobs() {
  const [jobs, { refetch }] = createResource(() => jobsApi.getAll());
  const [sort, setSort] = createSignal('recent');
  const [typeFilters, setTypeFilters] = createSignal([]);
  const [expFilters, setExpFilters] = createSignal([]);

  const activeJobs = () => (jobs() || []).filter((j) => j.status === 'active');

  const filtered = () => {
    let list = [...activeJobs()];
    const types = typeFilters();
    const exps = expFilters();

    if (types.length) {
      list = list.filter((j) => types.some((t) => jobMatchesTypeFilter(j.type, t)));
    }
    if (exps.length) {
      list = list.filter((j) =>
        exps.includes(String(j.level || '').toLowerCase())
      );
    }

    const s = sort();
    if (s === 'recent') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (s === 'salary') list.sort((a, b) => (Number(b.salary_max) || 0) - (Number(a.salary_max) || 0));
    else if (s === 'name') list.sort((a, b) => a.title.localeCompare(b.title));

    return list;
  };

  const toggleFilter = (setter, value) => {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  return (
    <>
      <div class="tb-page-header">
        <div class="container-xl">
          <h1 class="tb-page-title">Explorar Empleos</h1>
          <p class="tb-page-sub">
            Encuentra tu próxima oportunidad entre {activeJobs().length} vacantes disponibles.
          </p>
        </div>
      </div>
      <div class="container-xl py-5">
        <div class="row g-4">
          <div class="col-lg-3">
            <div class="tb-filter-sidebar">
              <h6 class="tb-filter-title">
                <i class="bi bi-funnel me-2"></i>Filtrar Resultados
              </h6>
              <div class="mb-3">
                <label class="tb-label">Tipo</label>
                <div class="tb-check-group">
                  <For each={[
                    { id: 'full', label: 'Tiempo Completo' },
                    { id: 'part', label: 'Medio Tiempo' },
                    { id: 'remote', label: 'Remoto' },
                    { id: 'contract', label: 'Contrato' },
                  ]}>
                    {(t) => (
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          checked={typeFilters().includes(t.id)}
                          onChange={() => toggleFilter(setTypeFilters, t.id)}
                        />
                        <label class="form-check-label">{t.label}</label>
                      </div>
                    )}
                  </For>
                </div>
              </div>
              <div class="mb-3">
                <label class="tb-label">Experiencia</label>
                <div class="tb-check-group">
                  <For each={[
                    { id: 'entry', label: 'Sin Experiencia' },
                    { id: 'junior', label: 'Junior' },
                    { id: 'mid', label: 'Mid-Level' },
                    { id: 'senior', label: 'Senior' },
                  ]}>
                    {(e) => (
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          checked={expFilters().includes(e.id)}
                          onChange={() => toggleFilter(setExpFilters, e.id)}
                        />
                        <label class="form-check-label">{e.label}</label>
                      </div>
                    )}
                  </For>
                </div>
              </div>
              <button
                type="button"
                class="btn tb-btn-ghost w-100 mt-2"
                onClick={() => {
                  setTypeFilters([]);
                  setExpFilters([]);
                }}
              >
                <i class="bi bi-x-circle me-2"></i>Limpiar
              </button>
            </div>
          </div>
          <div class="col-lg-9">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <span class="tb-results-count">
                {filtered().length} resultado{filtered().length !== 1 ? 's' : ''}
              </span>
              <select
                class="form-select tb-select"
                style={{ width: 'auto' }}
                value={sort()}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="recent">Más recientes</option>
                <option value="salary">Mayor salario</option>
                <option value="name">Nombre A–Z</option>
              </select>
            </div>
            <Show
              when={!jobs.loading}
              fallback={
                <div class="text-center py-5">
                  <div class="spinner-border text-secondary" />
                </div>
              }
            >
              <Show
                when={filtered().length > 0}
                fallback={
                  <div class="text-center py-5">
                    <i class="bi bi-search" style={{ 'font-size': '2.5rem', opacity: '.3' }}></i>
                    <p class="mt-2" style={{ color: '#888' }}>
                      No se encontraron empleos con los filtros seleccionados
                    </p>
                  </div>
                }
              >
                <div class="d-flex flex-column gap-3">
                  <For each={filtered()}>
                    {(job) => (
                      <A href={`/jobs/${job.id}`} class="text-decoration-none">
                        <div class="tb-card" style={{ cursor: 'pointer', transition: 'all .2s' }}>
                          <div class="d-flex justify-content-between align-items-start">
                            <div class="d-flex gap-3">
                              <div
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  'border-radius': '12px',
                                  background: 'rgba(26,58,92,.06)',
                                  display: 'flex',
                                  'align-items': 'center',
                                  'justify-content': 'center',
                                  'flex-shrink': '0',
                                  'font-size': '14px',
                                  'font-weight': '800',
                                  color: 'var(--accent,#e8943a)',
                                }}
                              >
                                {companyInitials(job.company_name)}
                              </div>
                              <div>
                                <h6 class="mb-1" style={{ 'font-weight': '700', 'font-size': '15px', color: 'var(--text)' }}>
                                  {job.title}
                                </h6>
                                <p class="mb-2" style={{ 'font-size': '13px', color: '#888' }}>
                                  {job.company_name || 'Empresa'} · {job.location || 'Sin ubicación'}
                                </p>
                                <div class="d-flex flex-wrap gap-2">
                                  <span class="badge" style={{ background: 'rgba(26,58,92,.08)', color: '#1a3a5c', 'font-size': '11px' }}>
                                    {TYPE_LABELS[job.type] || job.type}
                                  </span>
                                  <span class="badge" style={{ background: 'rgba(232,148,58,.1)', color: '#c27522', 'font-size': '11px' }}>
                                    {salaryLabel(job) || 'No especificado'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span style={{ 'font-size': '12px', color: '#aaa', 'white-space': 'nowrap' }}>
                              {daysAgo(job.created_at)}
                            </span>
                          </div>
                        </div>
                      </A>
                    )}
                  </For>
                </div>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </>
  );
}
