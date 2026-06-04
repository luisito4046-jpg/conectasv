import { A } from '@solidjs/router';
import { TYPE_LABELS, companyInitials, salaryLabel, daysAgo } from '../lib/utils';

export default function JobCard(props) {
  const job = () => props.job;
  const typeIcons = {
    full: 'bi-clock-fill',
    part: 'bi-clock-history',
    remote: 'bi-wifi',
    contract: 'bi-file-earmark-text',
    freelance: 'bi-lightning',
  };

  return (
    <div class="col-md-6 col-lg-4">
      <A href={`/jobs/${job().id}`} class="text-decoration-none">
        <div
          class="tb-card h-100"
          style={{ cursor: 'pointer', transition: 'all .2s' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div class="d-flex align-items-center gap-3 mb-3">
            <div
              style={{
                width: '44px',
                height: '44px',
                'border-radius': '10px',
                background: 'rgba(26,58,92,.08)',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'font-size': '14px',
                'font-weight': '800',
                color: 'var(--accent,#e8943a)',
              }}
            >
              {companyInitials(job().company_name)}
            </div>
            <div>
              <h6 class="mb-0" style={{ 'font-weight': '700', 'font-size': '15px', color: 'var(--text)' }}>
                {job().title}
              </h6>
              <span style={{ 'font-size': '12px', color: '#888' }}>{job().company_name || 'Empresa'}</span>
            </div>
          </div>
          <div class="d-flex flex-wrap gap-2 mb-3">
            <span
              class="badge"
              style={{
                background: 'rgba(26,58,92,.08)',
                color: '#1a3a5c',
                'font-size': '11px',
                'font-weight': '600',
              }}
            >
              <i class={`bi ${typeIcons[job().type] || 'bi-briefcase'} me-1`}></i>
              {TYPE_LABELS[job().type] || job().type}
            </span>
            {job().location && (
              <span
                class="badge"
                style={{
                  background: 'rgba(34,197,94,.08)',
                  color: '#166534',
                  'font-size': '11px',
                  'font-weight': '600',
                }}
              >
                <i class="bi bi-geo-alt me-1"></i>
                {job().location}
              </span>
            )}
          </div>
          {salaryLabel(job()) && (
            <p class="mb-2" style={{ 'font-size': '15px', 'font-weight': '700', color: 'var(--accent,#e8943a)' }}>
              <i class="bi bi-cash-stack me-1"></i>
              {salaryLabel(job())}/mes
            </p>
          )}
          <p class="mb-0 small" style={{ color: '#888' }}>
            <i class="bi bi-clock me-1"></i>
            {daysAgo(job().created_at)}
          </p>
        </div>
      </A>
    </div>
  );
}
