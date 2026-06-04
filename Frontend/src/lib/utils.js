export function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-SV', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  });
}

export function initials(first, last) {
  const f = (first || '?')[0];
  const l = (last || '?')[0];
  return `${f}${l}`.toUpperCase();
}

export function companyInitials(name) {
  return (name || 'NN')
    .split(' ')
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const TYPE_LABELS = {
  full: 'Tiempo Completo',
  'full-time': 'Tiempo Completo',
  part: 'Medio Tiempo',
  'part-time': 'Medio Tiempo',
  remote: 'Remoto',
  contract: 'Contrato',
  freelance: 'Freelance',
};

const TYPE_ALIASES = {
  full: 'full-time',
  'full-time': 'full-time',
  part: 'part-time',
  'part-time': 'part-time',
  remote: 'remote',
  contract: 'contract',
  freelance: 'freelance',
};

export function normalizeJobType(type) {
  if (!type) return '';
  const key = String(type).toLowerCase();
  return TYPE_ALIASES[key] ?? key;
}

export function jobMatchesTypeFilter(jobType, filterId) {
  return normalizeJobType(jobType) === normalizeJobType(filterId);
}

export const LEVEL_LABELS = {
  entry: 'Sin Experiencia',
  junior: 'Junior (1–2 años)',
  mid: 'Mid-Level (3–5 años)',
  senior: 'Senior (5+ años)',
};

export const FORUM_CATEGORIES = [
  'General',
  'Tecnología',
  'Diseño',
  'Marketing',
  'Finanzas',
  'Ventas',
  'Educación',
];

export function salaryLabel(job) {
  if (job.salary_min && job.salary_max) {
    return `$${Number(job.salary_min).toLocaleString()} – $${Number(job.salary_max).toLocaleString()}`;
  }
  if (job.salary_min) return `Desde $${Number(job.salary_min).toLocaleString()}`;
  if (job.salary_max) return `Hasta $${Number(job.salary_max).toLocaleString()}`;
  return null;
}

export function daysAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
}
