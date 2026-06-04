import { A } from '@solidjs/router';
import { createResource, For, Show, onMount } from 'solid-js';
import { jobsApi } from '../lib/api';
import { useUI } from '../stores/ui';
import JobCard from '../components/JobCard';

export default function Home() {
  const ui = useUI();
  const [jobs] = createResource(() => jobsApi.getAll());

  onMount(() => {
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = +el.dataset.target;
            let current = 0;
            const step = Math.ceil(target / 60);
            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = current.toLocaleString();
            }, 25);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => observer.observe(c));
  });

  const featured = () => (jobs() || []).filter((j) => j.status === 'active').slice(0, 6);

  return (
    <>
      <section class="tb-hero">
        <div class="hero-bg-pattern"></div>
        <div class="container-xl position-relative">
          <div class="row align-items-center min-vh-70">
            <div class="col-lg-7">
              <div class="hero-badge mb-3">
                <i class="bi bi-lightning-fill me-1"></i>
                Más de 1,200 vacantes activas hoy
              </div>
              <h1 class="tb-hero-title">
                Encuentra el trabajo
                <br />
                <em>que mereces</em>
              </h1>
              <p class="tb-hero-sub">
                Conectamos talento con oportunidades reales. Más de 850 empresas confían en ConectaSV
                para encontrar a sus próximos colaboradores.
              </p>
              <div class="d-flex flex-wrap gap-3 mt-4">
                <A href="/jobs" class="btn tb-btn-primary btn-lg">
                  <i class="bi bi-search me-2"></i>Buscar Empleo
                </A>
                <button class="btn tb-btn-outline btn-lg" onClick={() => ui.openModal('registerModal')}>
                  <i class="bi bi-building me-2"></i>Publicar Vacante
                </button>
              </div>
            </div>
            <div class="col-lg-5 d-none d-lg-block">
              <div class="hero-card-float">
                <div class="floating-card card-1">
                  <i class="bi bi-check-circle-fill text-success"></i>
                  <span>Contratado en 14 días</span>
                </div>
                <div class="floating-card card-2">
                  <i class="bi bi-star-fill text-warning"></i>
                  <span>4.9 / 5 satisfacción</span>
                </div>
                <div class="floating-card card-3">
                  <i class="bi bi-people-fill" style={{ color: 'var(--accent)' }}></i>
                  <span>+38,000 candidatos</span>
                </div>
                <div class="hero-central-icon">
                  <i class="bi bi-briefcase-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="tb-metrics">
        <div class="container-xl">
          <div class="row g-4">
            <div class="col-6 col-md-3">
              <div class="tb-metric-card">
                <div class="metric-icon" style={{ '--mic': '#4f8ef7' }}>
                  <i class="bi bi-building"></i>
                </div>
                <div class="metric-value counter" data-target="852">
                  0
                </div>
                <div class="metric-label">Empresas Registradas</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="tb-metric-card">
                <div class="metric-icon" style={{ '--mic': '#22c55e' }}>
                  <i class="bi bi-people-fill"></i>
                </div>
                <div class="metric-value counter" data-target="38420">
                  0
                </div>
                <div class="metric-label">Usuarios Activos</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="tb-metric-card">
                <div class="metric-icon" style={{ '--mic': '#f59e0b' }}>
                  <i class="bi bi-briefcase-fill"></i>
                </div>
                <div class="metric-value counter" data-target="1247">
                  0
                </div>
                <div class="metric-label">Empleos Publicados</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="tb-metric-card">
                <div class="metric-icon" style={{ '--mic': '#a855f7' }}>
                  <i class="bi bi-send-fill"></i>
                </div>
                <div class="metric-value counter" data-target="9831">
                  0
                </div>
                <div class="metric-label">Solicitudes Recibidas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="tb-featured py-5">
        <div class="container-xl">
          <div class="section-header">
            <h2 class="tb-section-title">Empleos Destacados</h2>
            <A href="/jobs" class="tb-link-more">
              Ver todos <i class="bi bi-arrow-right"></i>
            </A>
          </div>
          <Show
            when={!jobs.loading}
            fallback={
              <div class="text-center py-4">
                <div class="spinner-border text-secondary" />
              </div>
            }
          >
            <Show
              when={featured().length > 0}
              fallback={
                <div class="col-12 text-center py-4">
                  <i class="bi bi-briefcase" style={{ 'font-size': '2.5rem', opacity: '.3' }}></i>
                  <p class="mt-2" style={{ color: '#888' }}>
                    No hay vacantes disponibles en este momento
                  </p>
                </div>
              }
            >
              <div class="row g-4">
                <For each={featured()}>{(job) => <JobCard job={job} />}</For>
              </div>
            </Show>
          </Show>
        </div>
      </section>
    </>
  );
}
