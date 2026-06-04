export async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Error en la solicitud');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const jobsApi = {
  getAll: () => apiFetch('/api/jobs'),
  getById: (id) => apiFetch(`/api/jobs/${id}`),
  getByEmployer: (id) => apiFetch(`/api/jobs/employer/${id}`),
  create: (body) => apiFetch('/api/jobs', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id, status) =>
    apiFetch(`/api/jobs/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export const forumApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/forum${q ? '?' + q : ''}`);
  },
  getById: (id, userId) => {
    const q = userId ? `?user_id=${userId}` : '';
    return apiFetch(`/api/forum/${id}${q}`);
  },
  createPost: (body) => apiFetch('/api/forum', { method: 'POST', body: JSON.stringify(body) }),
  createReply: (postId, body) =>
    apiFetch(`/api/forum/${postId}/comments`, { method: 'POST', body: JSON.stringify(body) }),
  createComment: (postId, body) =>
    apiFetch(`/api/forum/${postId}/comments`, { method: 'POST', body: JSON.stringify(body) }),
  updatePost: (id, body) =>
    apiFetch(`/api/forum/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  updateReply: (id, body) =>
    apiFetch(`/api/forum/reply/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePost: (id) => apiFetch(`/api/forum/${id}`, { method: 'DELETE' }),
  toggleLike: (postId, userId) =>
    apiFetch(`/api/forum/${postId}/like`, { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
  toggleReplyLike: (replyId, userId) =>
    apiFetch(`/api/forum/reply/${replyId}/like`, { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
};

export const authApi = {
  login: (email, password) =>
    apiFetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (body) => apiFetch('/api/users', { method: 'POST', body: JSON.stringify(body) }),
};

export const applicationsApi = {
  apply: (body) =>
    apiFetch('/api/applications', { method: 'POST', body: JSON.stringify(body) }),
  getByCandidate: (id) => apiFetch(`/api/applications/candidate/${id}`),
  getByJob: (id) => apiFetch(`/api/applications/job/${id}`),
};

export const companiesApi = {
  getAll: () => apiFetch('/api/companies'),
  getById: (id) => apiFetch(`/api/companies/${id}`),
  getByOwner: (id) => apiFetch(`/api/companies/buscarPorDuenio/${id}`),
  create: (body) => apiFetch('/api/companies', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => apiFetch(`/api/companies/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

export const usersApi = {
  getAll: () => apiFetch('/api/users'),
  getById: (id) => apiFetch(`/api/users/${id}`),
  create: (body) => apiFetch('/api/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};
