import { Show, For } from 'solid-js';
import { formatDate } from '../lib/utils';

const TYPE_LABELS = { article:'Artículo', video:'Video', pdf:'Plantilla PDF', guide:'Guía' };
const TYPE_ICONS = { article:'bi-file-text', video:'bi-play-circle', pdf:'bi-file-earmark-pdf', guide:'bi-book' };
const TYPE_ACTIONS = {
  article: { icon: 'bi-book-fill', label: 'Leer artículo' },
  video: { icon: 'bi-play-fill', label: 'Ver video' },
  pdf: { icon: 'bi-download', label: 'Descargar plantilla' },
  guide: { icon: 'bi-journal-richtext', label: 'Seguir guía' },
};

export default function ResourceModal(props) {
  const r = () => props.resource;

  const thumbGrad = (thumb) =>
    thumb === 'thumb-purple' ? 'linear-gradient(135deg,#f3e8ff,#e9d5ff)' :
    thumb === 'thumb-blue' ? 'linear-gradient(135deg,#dbeafe,#bfdbfe)' :
    thumb === 'thumb-orange' ? 'linear-gradient(135deg,#ffedd5,#fed7aa)' :
    thumb === 'thumb-green' ? 'linear-gradient(135deg,#dcfce7,#bbf7d0)' :
    thumb === 'thumb-yellow' ? 'linear-gradient(135deg,#fef9c3,#fef08a)' :
    'linear-gradient(135deg,#fee2e2,#fecaca)';

  return (
    <Show when={props.show && r()}>
      <div class="modal fade tb-modal show d-block" tabindex="-1" style={{ 'background-color': 'rgba(0,0,0,.5)' }}>
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content" style={{ border: 'none', 'border-radius': 'var(--radius-lg)', overflow: 'hidden' }}>
            <div class="res-modal-header-bg" style={{ background: thumbGrad(r().thumb) }}>
              {r().icon}
            </div>
            <div class="modal-header" style={{ background: 'var(--surface)', border: 'none', padding: '20px 24px 0' }}>
              <div style={{ display: 'flex', 'align-items': 'center', gap: '8px', 'flex-wrap': 'wrap' }}>
                <span style={{ 'font-size': '11px', 'font-weight': 700, 'letter-spacing': '.08em', 'text-transform': 'uppercase', background: 'rgba(26,58,92,.08)', color: 'var(--primary)', 'border-radius': '6px', padding: '3px 10px' }}>
                  {r().cat === 'cv' ? 'Mejora tu CV' : r().cat === 'interview' ? 'Entrevistas' : r().cat === 'skills' ? 'Habilidades' : r().cat === 'career' ? 'Carrera' : 'Noticias'}
                </span>
                <span style={{ display: 'inline-flex', 'align-items': 'center', gap: '4px', 'font-size': '11px', padding: '3px 10px', 'border-radius': '6px', 'font-weight': 700, background: r().type === 'article' ? 'rgba(59,130,246,.08)' : r().type === 'video' ? 'rgba(239,68,68,.08)' : r().type === 'pdf' ? 'rgba(22,163,74,.08)' : 'rgba(168,85,247,.08)', color: r().type === 'article' ? '#2563eb' : r().type === 'video' ? '#dc2626' : r().type === 'pdf' ? 'var(--success)' : '#7c3aed' }}>
                  <i class={`bi ${TYPE_ICONS[r().type]}`}></i>
                  {TYPE_LABELS[r().type]}
                </span>
              </div>
              <button type="button" class="btn-close" onClick={props.close} />
            </div>
            <div class="modal-body p-4">
              <h3 style={{ 'font-family': 'var(--font-title)', 'font-size': '1.4rem', color: 'var(--primary)', 'margin-bottom': '12px', 'line-height': 1.3 }}>
                {r().title}
              </h3>
              <p style={{ 'font-size': '14px', color: 'var(--text-m)', 'line-height': 1.7, 'margin-bottom': '20px' }}>
                {r().desc}
              </p>

              <div style={{ display: 'flex', gap: '6px', 'flex-wrap': 'wrap', 'margin-bottom': '20px' }}>
                <For each={r().tags}>
                  {(tag) => (
                    <span style={{ background: 'var(--bg)', border: '1px solid var(--border)', 'border-radius': '50px', padding: '4px 12px', 'font-size': '12px', 'font-weight': 600, color: 'var(--text-m)' }}>
                      {tag}
                    </span>
                  )}
                </For>
              </div>

              <div style={{ display: 'flex', gap: '24px', 'flex-wrap': 'wrap', 'font-size': '13px', color: 'var(--text-l)', 'margin-bottom': '24px', padding: '14px 0', 'border-top': '1px solid var(--border)', 'border-bottom': '1px solid var(--border)' }}>
                <span><i class="bi bi-eye me-1"></i>{r().views.toLocaleString()} vistas</span>
                <span><i class="bi bi-calendar3 me-1"></i>{formatDate(r().date)}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button class="btn tb-btn-primary" onClick={() => alert(`🔗 Enlace externo para: "${r().title}"\n\nConecta aquí tu URL real.`)}>
                  <i class={`bi ${TYPE_ACTIONS[r().type].icon} me-1`}></i>
                  {TYPE_ACTIONS[r().type].label}
                </button>
                <button class="btn tb-btn-ghost-dark" onClick={props.close}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
