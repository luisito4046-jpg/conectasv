import { useParams, A } from '@solidjs/router';
import { createSignal, createResource, Show } from 'solid-js';
import { jobsApi, applicationsApi } from '../lib/api';
import { useAuth } from '../stores/auth';
import { TYPE_LABELS, LEVEL_LABELS, companyInitials, salaryLabel } from '../lib/utils';

export default function JobDetail() {
  const params = useParams();
  const auth = useAuth();
  const [coverLetter, setCoverLetter] = createSignal('');
  const [applied, setApplied] = createSignal(false);
  const [applying, setApplying] = createSignal(false);

  const [job] = createResource(() => params.id, (id) => jobsApi.getById(id));

  const apply = async () => {
    const u = auth.user();
    if (!u || u.role !== 'candidate') {
      auth.showToast('Debes iniciar sesión como candidato para postularte', 'error');
      return;
    }

    setApplying(true);
    try {
      await applicationsApi.apply({
        job_id: Number(params.id),
        candidate_id: u.id,
        cover_letter: coverLetter().trim() || null,
      });
      setApplied(true);
      auth.showToast('¡Te has postulado exitosamente!');
    } catch (err) {
      auth.showToast(err.data?.error || 'Error al postularse', 'error');
    } finally {
      setApplying(false);
    }
  };

  const salary = () => {
    const j = job();
    if (!j) return 'No especificado';
    const s = salaryLabel(j);
    return s ? `${s}/mes` : 'No especificado';
  };

  return (
    <div class="container-xl py-5">
      <A href="/jobs" class="btn tb-btn-ghost mb-4 text-decoration-none">
        <i class="bi bi-arrow-left me-2"></i>Volver
      </A>

      <Show
        when={!job.loading}
        fallback={
          <div class="text-center py-5">
            <div class="spinner-border text-secondary" />
          </div>
        }
      >
        <Show
          when={job()}
          fallback={
            <div class="text-center py-5 text-danger">
              <i class="bi bi-exclamation-circle" style={{ 'font-size': '2rem' }}></i>
              <p class="mt-2">Error al cargar el empleo</p>
            </div>
          }
        >
          {(j) => (
            <div class="row g-4">
              <div class="col-lg-8">
                <div class="tb-card">
                  <div class="d-flex align-items-center gap-3 mb-4">
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        'border-radius': '14px',
                        background: 'rgba(26,58,92,.06)',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        'font-size': '18px',
                        'font-weight': '800',
                        color: 'var(--accent,#e8943a)',
                      }}
                    >
                      {companyInitials(j().company_name)}
                    </div>
                    <div>
                      <h3 class="mb-0" style={{ 'font-weight': '700' }}>
                        {j().title}
                      </h3>
                      <p class="mb-0" style={{ color: '#888' }}>
                        {j().company_name || 'Empresa'}
                      </p>
                    </div>
                  </div>
                  <div class="d-flex flex-wrap gap-2 mb-4">
                    <span class="badge" style={{ background: 'rgba(26,58,92,.08)', color: '#1a3a5c', 'font-size': '12px', padding: '6px 12px' }}>
                      <i class="bi bi-briefcase me-1"></i>
                      {TYPE_LABELS[j().type] || j().type}
                    </span>
                    {j().location && (
                      <span class="badge" style={{ background: 'rgba(34,197,94,.08)', color: '#166534', 'font-size': '12px', padding: '6px 12px' }}>
                        <i class="bi bi-geo-alt me-1"></i>
                        {j().location}
                      </span>
                    )}
                    {j().level && (
                      <span class="badge" style={{ background: 'rgba(168,85,247,.08)', color: '#7c3aed', 'font-size': '12px', padding: '6px 12px' }}>
                        <i class="bi bi-bar-chart me-1"></i>
                        {LEVEL_LABELS[j().level] || j().level}
                      </span>
                    )}
                    <span class="badge" style={{ background: 'rgba(232,148,58,.1)', color: '#c27522', 'font-size': '12px', padding: '6px 12px' }}>
                      <i class="bi bi-cash me-1"></i>
                      {salary()}
                    </span>
                  </div>
                  <h5 style={{ 'font-weight': '700', 'margin-bottom': '12px' }}>Descripción del Puesto</h5>
                  <p style={{ 'white-space': 'pre-line', 'line-height': '1.7', color: '#444' }}>{j().description}</p>
                  {j().requirements && (
                    <>
                      <h5 style={{ 'font-weight': '700', margin: '24px 0 12px' }}>Requisitos</h5>
                      <p style={{ 'white-space': 'pre-line', 'line-height': '1.7', color: '#444' }}>{j().requirements}</p>
                    </>
                  )}
                </div>
              </div>
              <div class="col-lg-4">
                <div class="tb-card mb-3">
                  <h6 style={{ 'font-weight': '700', 'margin-bottom': '16px' }}>
                    <i class="bi bi-info-circle me-2"></i>Información
                  </h6>
                  <div class="mb-3">
                    <div style={{ 'font-size': '12px', color: '#888', 'margin-bottom': '2px' }}>Fecha de Publicación</div>
                    <div style={{ 'font-size': '14px', 'font-weight': '500' }}>
                      {new Date(j().created_at).toLocaleDateString('es-SV', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div style={{ 'font-size': '12px', color: '#888', 'margin-bottom': '2px' }}>Correo de Contacto</div>
                    <div style={{ 'font-size': '14px', 'font-weight': '500' }}>{j().contact || 'No disponible'}</div>
                  </div>
                </div>
                <div class="tb-card">
                  <h6 style={{ 'font-weight': '700', 'margin-bottom': '12px' }}>
                    <i class="bi bi-send me-2"></i>¿Te interesa?
                  </h6>
                  <div class="mb-3">
                    <label class="tb-label">Carta de Presentación (opcional)</label>
                    <textarea
                      class="form-control tb-input"
                      rows="3"
                      placeholder="Cuéntale a la empresa por qué eres ideal…"
                      value={coverLetter()}
                      onInput={(e) => setCoverLetter(e.target.value)}
                      disabled={applied() || auth.user()?.role !== 'candidate'}
                    />
                  </div>
                  <button
                    type="button"
                    class="btn tb-btn-primary w-100"
                    disabled={applied() || applying() || auth.user()?.role !== 'candidate'}
                    style={{ opacity: auth.user()?.role !== 'candidate' ? '.5' : '1' }}
                    onClick={apply}
                  >
                    {applied() ? (
                      <>
                        <i class="bi bi-check-circle me-2"></i>Ya te postulaste
                      </>
                    ) : (
                      <>
                        <i class="bi bi-send-fill me-2"></i>Postularme
                      </>
                    )}
                  </button>
                  <p class="text-center small mt-2 mb-0" style={{ color: '#aaa' }}>
                    Necesitas una cuenta de candidato para postularte
                  </p>
                </div>
              </div>
            </div>
          )}
        </Show>
      </Show>
    </div>
  );
}
