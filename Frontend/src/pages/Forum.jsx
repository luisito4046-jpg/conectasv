import { createSignal, createResource, createEffect, For, Show } from 'solid-js';
import { forumApi } from '../lib/api';
import { useAuth } from '../stores/auth';
import { useUI } from '../stores/ui';
import { formatDate, initials, FORUM_CATEGORIES } from '../lib/utils';

const CATEGORY_ICONS = {
  '': 'bi-globe',
  Tecnología: 'bi-code-slash',
  Diseño: 'bi-palette',
  Marketing: 'bi-megaphone',
  Finanzas: 'bi-cash-stack',
  Ventas: 'bi-graph-up',
  Educación: 'bi-book',
  General: 'bi-chat',
};

function Avatar(props) {
  const size = () => props.size || 36;
  const fontSize = () => props.size <= 28 ? '10px' : '12px';
  const bg = () => props.accent ? 'var(--accent)' : 'var(--primary)';

  return (
    <Show
      when={props.photoUrl}
      fallback={
        <div
          style={{
            width: `${size()}px`,
            height: `${size()}px`,
            'border-radius': '50%',
            background: bg(),
            color: '#fff',
            display: 'grid',
            'place-items': 'center',
            'font-size': fontSize(),
            'font-weight': '700',
            'flex-shrink': '0',
          }}
        >
          {initials(props.firstName, props.lastName)}
        </div>
      }
    >
      <img
        src={props.photoUrl}
        alt=""
        style={{
          width: `${size()}px`,
          height: `${size()}px`,
          'border-radius': '50%',
          'object-fit': 'cover',
          'flex-shrink': '0',
        }}
      />
    </Show>
  );
}

function PostCard(props) {
  const auth = useAuth();
  const ui = useUI();
  const [commentText, setCommentText] = createSignal('');
  const [submitting, setSubmitting] = createSignal(false);
  const [comments, setComments] = createSignal(props.post.replies || props.post.comments || []);
  const [liked, setLiked] = createSignal(props.post.liked_by_me || false);
  const [likesCount, setLikesCount] = createSignal(props.post.likes_count || 0);
  const [editing, setEditing] = createSignal(false);
  const [editTitle, setEditTitle] = createSignal(props.post.title);
  const [editContent, setEditContent] = createSignal(props.post.content);
  const [editingReply, setEditingReply] = createSignal(null);

  createEffect(() => {
    setComments(props.post.replies || props.post.comments || []);
    setLiked(props.post.liked_by_me || false);
    setLikesCount(props.post.likes_count || 0);
  });

  const isOwner = () => {
    const u = auth.user();
    if (!u) return false;
    return Number(u.id) === Number(props.post.user_id);
  };

  const canDelete = () => {
    const u = auth.user();
    const p = props.post;
    return u && (Number(u.id) === Number(p.user_id) || u.role === 'admin');
  };

  const toggleLike = async () => {
    const u = auth.user();
    if (!u) { ui.openModal('loginModal'); return; }
    const prevLiked = liked();
    setLiked(!prevLiked);
    setLikesCount(prev => prev + (prevLiked ? -1 : 1));
    try {
      await forumApi.toggleLike(props.post.id, u.id);
      props.onRefresh();
    } catch {
      setLiked(prevLiked);
      setLikesCount(prev => prev + (prevLiked ? 1 : -1));
    }
  };

  const startEdit = () => {
    setEditTitle(props.post.title);
    setEditContent(props.post.content);
    setEditing(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    const u = auth.user();
    if (!u) return;
    try {
      const updated = await forumApi.updatePost(props.post.id, {
        user_id: u.id,
        title: editTitle().trim(),
        content: editContent().trim(),
      });
      setEditing(false);
      props.onRefresh();
      auth.showToast('Post actualizado');
    } catch (err) {
      auth.showToast(err.data?.error || 'Error al editar', 'error');
    }
  };

  const submitComment = async (e) => {
    e?.preventDefault?.();
    const content = commentText().trim();
    const u = auth.user();

    if (!u) { ui.openModal('loginModal'); return; }
    if (!content) { auth.showToast('Escribe un comentario antes de publicar.', 'error'); return; }

    setSubmitting(true);
    try {
      const created = await forumApi.createComment(props.post.id, { user_id: u.id, content });
      setCommentText('');
      setComments((prev) => [...prev, created]);
      props.onRefresh();
      auth.showToast('Comentario publicado');
    } catch (err) {
      auth.showToast(err.data?.error || 'Error al publicar el comentario', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const deletePost = async () => {
    if (!confirm('¿Eliminar este post y todos sus comentarios?')) return;
    try {
      await forumApi.deletePost(props.post.id);
      auth.showToast('Post eliminado');
      props.onRefresh();
    } catch {
      auth.showToast('Error al eliminar el post', 'error');
    }
  };

  const toggleReplyLike = async (replyId) => {
    const u = auth.user();
    if (!u) { ui.openModal('loginModal'); return; }
    try {
      const result = await forumApi.toggleReplyLike(replyId, u.id);
      setComments(prev => prev.map(c =>
        c.id === replyId
          ? { ...c, liked_by_me: result.liked, likes_count: (c.likes_count || 0) + (result.liked ? 1 : -1) }
          : c
      ));
    } catch {}
  };

  const saveReplyEdit = async (replyId) => {
    const u = auth.user();
    if (!u) return;
    try {
      const updated = await forumApi.updateReply(replyId, {
        user_id: u.id,
        content: editingReply().content.trim(),
      });
      setComments(prev => prev.map(c => (c.id === replyId ? { ...c, content: updated.content } : c)));
      setEditingReply(null);
      auth.showToast('Comentario actualizado');
    } catch (err) {
      auth.showToast(err.data?.error || 'Error al editar', 'error');
    }
  };

  const p = () => props.post;
  const commentCount = () => comments().length;

  return (
    <div class="forum-post-card">
      <div class="d-flex align-items-start gap-3 mb-3">
        <Avatar
          firstName={p().first_name}
          lastName={p().last_name}
          photoUrl={p().profile_photo_url}
        />
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span style={{ 'font-weight': '600', color: 'var(--primary)' }}>
              {p().first_name} {p().last_name}
            </span>
            <Show when={p().category}>
              <span class="forum-category-badge">{p().category}</span>
            </Show>
            <span style={{ 'font-size': '12px', color: 'var(--text-l)', 'margin-left': 'auto' }}>
              {formatDate(p().created_at)}
            </span>
          </div>

          <Show
            when={editing()}
            fallback={
              <>
                <h6 style={{ margin: '6px 0 4px', color: 'var(--text)', 'font-family': 'var(--font-body)', 'font-weight': '700' }}>
                  {p().title}
                </h6>
                <p style={{ 'font-size': '13px', color: 'var(--text-m)', margin: '0', 'white-space': 'pre-wrap' }}>
                  {p().content}
                </p>
              </>
            }
          >
            <form onSubmit={saveEdit} class="mt-2">
              <input
                type="text"
                class="form-control tb-input mb-2"
                value={editTitle()}
                onInput={(e) => setEditTitle(e.target.value)}
                required
              />
              <textarea
                class="form-control tb-input mb-2"
                rows="3"
                value={editContent()}
                onInput={(e) => setEditContent(e.target.value)}
                required
              />
              <div class="d-flex gap-2">
                <button type="submit" class="btn tb-btn-primary btn-sm">Guardar</button>
                <button type="button" class="btn tb-btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancelar</button>
              </div>
            </form>
          </Show>

          <div class="d-flex align-items-center gap-3 mt-2">
            <button
              class="btn btn-sm tb-btn-ghost"
              style={{ color: liked() ? 'var(--accent)' : 'var(--text-l)', border: 'none', padding: '2px 6px' }}
              onClick={toggleLike}
            >
              <i class={`bi ${liked() ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
              {likesCount()}
            </button>
            <Show when={isOwner()}>
              <button
                class="btn btn-sm tb-btn-ghost"
                style={{ border: 'none', padding: '2px 6px', color: 'var(--text-l)' }}
                onClick={startEdit}
              >
                <i class="bi bi-pencil me-1"></i>Editar
              </button>
            </Show>
          </div>
        </div>
      </div>

      <Show when={canDelete()}>
        <div class="d-flex justify-content-end mb-2">
          <button type="button" class="btn btn-sm tb-btn-ghost text-danger" onClick={deletePost}>
            <i class="bi bi-trash me-1"></i>Eliminar post
          </button>
        </div>
      </Show>

      <div class="forum-comments-section">
        <h6 class="forum-comments-title">
          <i class="bi bi-chat-left-text me-2"></i>
          Comentarios ({commentCount()})
        </h6>

        <Show
          when={commentCount() > 0}
          fallback={<p class="small tb-text-muted mb-3">Sé el primero en comentar.</p>}
        >
          <div class="forum-reply-box mb-3">
            <For each={comments()}>
              {(c) => (
                <div class="forum-reply-item d-flex gap-2">
                  <Avatar
                    firstName={c.first_name}
                    lastName={c.last_name}
                    photoUrl={c.profile_photo_url}
                    size={28}
                    accent
                  />
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center gap-2">
                      <span style={{ 'font-weight': '600', 'font-size': '13px', color: 'var(--primary)' }}>
                        {c.first_name} {c.last_name}
                      </span>
                      <span style={{ 'font-size': '11px', color: 'var(--text-l)' }}>
                        {formatDate(c.created_at, { year: undefined })}
                      </span>
                    </div>

                    <Show
                      when={editingReply()?.id === c.id}
                      fallback={
                        <p style={{ 'font-size': '13px', color: 'var(--text-m)', margin: '2px 0 0', 'white-space': 'pre-wrap' }}>
                          {c.content}
                        </p>
                      }
                    >
                      <div class="d-flex gap-2 mt-1">
                        <textarea
                          class="form-control tb-input"
                          rows="2"
                          value={editingReply()?.content || ''}
                          onInput={(e) => setEditingReply({ id: c.id, content: e.target.value })}
                        />
                      </div>
                      <div class="d-flex gap-2 mt-1">
                        <button class="btn tb-btn-primary btn-sm" onClick={() => saveReplyEdit(c.id)}>Guardar</button>
                        <button class="btn tb-btn-ghost btn-sm" onClick={() => setEditingReply(null)}>Cancelar</button>
                      </div>
                    </Show>

                    <div class="d-flex align-items-center gap-2 mt-1">
                      <button
                        class="btn btn-sm"
                        style={{ color: c.liked_by_me ? 'var(--accent)' : 'var(--text-l)', border: 'none', padding: '0 4px', 'font-size': '12px' }}
                        onClick={() => toggleReplyLike(c.id)}
                      >
                        <i class={`bi ${c.liked_by_me ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
                        {c.likes_count || 0}
                      </button>
                      <Show when={auth.user() && Number(auth.user()?.id) === Number(c.user_id)}>
                        <button
                          class="btn btn-sm"
                          style={{ border: 'none', padding: '0 4px', 'font-size': '12px', color: 'var(--text-l)' }}
                          onClick={() => setEditingReply({ id: c.id, content: c.content })}
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                      </Show>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>

        <Show
          when={auth.user()}
          fallback={
            <div class="forum-comment-form tb-card p-3">
              <p class="small tb-text-muted mb-2">
                <i class="bi bi-person-lock me-1"></i>
                Inicia sesión para comentar en este post.
              </p>
              <button type="button" class="btn tb-btn-primary btn-sm" onClick={() => ui.openModal('loginModal')}>
                Iniciar sesión
              </button>
            </div>
          }
        >
          <form class="forum-comment-form" onSubmit={submitComment}>
            <label class="tb-label mb-2">
              <i class="bi bi-pencil me-1"></i>Escribe un comentario
            </label>
            <textarea
              class="form-control tb-input mb-2"
              rows="3"
              placeholder="Comparte tu opinión o experiencia…"
              value={commentText()}
              onInput={(e) => setCommentText(e.target.value)}
              disabled={submitting()}
            />
            <button type="submit" class="btn tb-btn-primary btn-sm" disabled={submitting() || !commentText().trim()}>
              <i class="bi bi-send me-1"></i>
              {submitting() ? 'Publicando…' : 'Publicar comentario'}
            </button>
          </form>
        </Show>
      </div>
    </div>
  );
}

export default function Forum() {
  const auth = useAuth();
  const ui = useUI();
  const [category, setCategory] = createSignal('');
  const [title, setTitle] = createSignal('');
  const [content, setContent] = createSignal('');
  const [postCategory, setPostCategory] = createSignal('General');
  const [submitting, setSubmitting] = createSignal(false);
  const [sort, setSort] = createSignal('recent');
  const [page, setPage] = createSignal(1);

  const [data, { refetch }] = createResource(
    () => ({
      sort: sort(),
      page: page(),
      limit: 20,
      user_id: auth.user()?.id || '',
    }),
    (params) => forumApi.getAll(params)
  );

  const posts = () => data()?.posts || [];
  const total = () => data()?.total || 0;
  const totalPages = () => Math.ceil(total() / 20);

  createEffect(() => {
    if (auth.user()) refetch();
  });

  const filtered = () => {
    const all = posts();
    const cat = category();
    return cat ? all.filter((p) => p.category === cat) : all;
  };

  const submitPost = async (e) => {
    e.preventDefault();
    const u = auth.user();
    if (!u) return;

    const t = title().trim();
    const c = content().trim();
    if (!t || !c) {
      auth.showToast('Completa el título y el contenido.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await forumApi.createPost({ user_id: u.id, category: postCategory(), title: t, content: c });
      setTitle('');
      setContent('');
      setPage(1);
      refetch();
      auth.showToast('Post publicado');
    } catch (err) {
      auth.showToast(err.data?.error || 'Error al publicar el post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const changeSort = (s) => {
    setSort(s);
    setPage(1);
  };

  const categories = [
    { value: '', label: 'Todas', icon: 'bi-globe' },
    ...FORUM_CATEGORIES.map((c) => ({
      value: c,
      label: c,
      icon: CATEGORY_ICONS[c] || 'bi-chat',
    })),
  ];

  return (
    <>
      <div class="tb-page-header">
        <div class="container-xl">
          <h1 class="tb-page-title">
            <i class="bi bi-chat-dots me-2"></i>Foro de Profesionales
          </h1>
          <p class="tb-page-sub">
            Publica temas, comenta, da like y participa en la conversación.
          </p>
        </div>
      </div>

      <div class="container-xl py-5">
        <div class="row g-4">
          <div class="col-lg-3">
            <div class="tb-filter-sidebar">
              <h6 class="tb-filter-title">
                <i class="bi bi-grid me-2"></i>Categorías
              </h6>
              <div class="d-flex flex-column gap-1 mt-2">
                <For each={categories}>
                  {(cat) => (
                    <button
                      type="button"
                      class={`tb-forum-cat ${category() === cat.value ? 'active' : ''}`}
                      onClick={() => { setCategory(cat.value); setPage(1); }}
                    >
                      <i class={`bi ${cat.icon} me-2`}></i>
                      {cat.label}
                    </button>
                  )}
                </For>
              </div>

              <hr style={{ borderColor: 'var(--border)', margin: '16px 0' }} />

              <h6 class="tb-filter-title">
                <i class="bi bi-sort-down me-2"></i>Ordenar
              </h6>
              <div class="d-flex flex-column gap-1 mt-2">
                {[
                  { value: 'recent', label: 'Más recientes', icon: 'bi-clock' },
                  { value: 'popular', label: 'Más likes', icon: 'bi-heart' },
                  { value: 'comments', label: 'Más comentados', icon: 'bi-chat-dots' },
                ].map((opt) => (
                  <button
                    type="button"
                    class={`tb-forum-cat ${sort() === opt.value ? 'active' : ''}`}
                    onClick={() => changeSort(opt.value)}
                  >
                    <i class={`bi ${opt.icon} me-2`}></i>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div class="col-lg-9">
            <Show
              when={auth.user()}
              fallback={
                <div class="tb-card mb-4 text-center">
                  <i class="bi bi-lock" style={{ 'font-size': '2rem', color: 'var(--text-l)' }}></i>
                  <p class="mt-2 tb-text-muted">Inicia sesión para publicar posts y comentar en las publicaciones.</p>
                  <button type="button" class="btn tb-btn-primary" onClick={() => ui.openModal('loginModal')}>
                    <i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
                  </button>
                </div>
              }
            >
              <form class="tb-card mb-4" onSubmit={submitPost}>
                <h6 class="tb-card-title">
                  <i class="bi bi-pencil-square me-2"></i>Nuevo Post
                </h6>
                <div class="mb-3">
                  <label class="tb-label">Categoría</label>
                  <select
                    class="form-select tb-select"
                    value={postCategory()}
                    onChange={(e) => setPostCategory(e.target.value)}
                  >
                    <For each={FORUM_CATEGORIES}>
                      {(c) => <option value={c}>{c}</option>}
                    </For>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="tb-label">Título</label>
                  <input
                    type="text"
                    class="form-control tb-input"
                    placeholder="¿Sobre qué quieres hablar?"
                    value={title()}
                    onInput={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="tb-label">Contenido</label>
                  <textarea
                    class="form-control tb-input"
                    rows="4"
                    placeholder="Escribe tu mensaje aquí…"
                    value={content()}
                    onInput={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" class="btn tb-btn-primary" disabled={submitting()}>
                  <i class="bi bi-send me-2"></i>
                  {submitting() ? 'Publicando…' : 'Publicar'}
                </button>
              </form>
            </Show>

            <div class="d-flex justify-content-between align-items-center mb-3">
              <span style={{ 'font-size': '13px', color: 'var(--text-m)' }}>
                {total()} {total() === 1 ? 'post' : 'posts'}
              </span>
            </div>

            <Show
              when={!data.loading}
              fallback={
                <div class="text-center py-5 tb-text-muted">
                  <div class="spinner-border text-secondary mb-2" role="status" />
                  <p class="mt-2">Cargando posts…</p>
                </div>
              }
            >
              <Show
                when={!data.error}
                fallback={
                  <div class="text-center py-5 tb-text-muted">
                    <i class="bi bi-exclamation-circle" style={{ 'font-size': '2rem', color: 'var(--danger)' }}></i>
                    <p class="mt-2">{data.error?.message || 'Error al cargar el foro.'}</p>
                    <p class="small tb-text-muted">Verifica que el backend esté corriendo en el puerto 3000.</p>
                    <button type="button" class="btn tb-btn-primary btn-sm mt-2" onClick={() => refetch()}>Reintentar</button>
                  </div>
                }
              >
                <Show
                  when={filtered().length > 0}
                  fallback={
                    <div class="text-center py-5 tb-text-muted">
                      <i class="bi bi-chat-dots" style={{ 'font-size': '2.5rem' }}></i>
                      <p class="mt-2">No hay posts en esta categoría aún. ¡Sé el primero!</p>
                    </div>
                  }
                >
                  <div class="d-flex flex-column gap-3">
                    <For each={filtered()}>
                      {(post) => (
                        <PostCard post={post} onRefresh={refetch} />
                      )}
                    </For>
                  </div>

                  <Show when={totalPages() > 1}>
                    <nav class="mt-4 d-flex justify-content-center">
                      <ul class="pagination" style={{ gap: '4px' }}>
                        <li class={`page-item ${page() <= 1 ? 'disabled' : ''}`}>
                          <button class="page-link" style={{ border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--primary)' }}
                            onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
                        </li>
                        <For each={Array.from({ length: totalPages() }, (_, i) => i + 1)}>
                          {(p) => (
                            <li class={`page-item ${p === page() ? 'active' : ''}`}>
                              <button class="page-link"
                                style={{
                                  border: '1px solid var(--border)', borderRadius: '8px',
                                  background: p === page() ? 'var(--accent)' : 'transparent',
                                  color: p === page() ? '#fff' : 'var(--primary)'
                                }}
                                onClick={() => setPage(p)}>{p}</button>
                            </li>
                          )}
                        </For>
                        <li class={`page-item ${page() >= totalPages() ? 'disabled' : ''}`}>
                          <button class="page-link" style={{ border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--primary)' }}
                            onClick={() => setPage(p => Math.min(totalPages(), p + 1))}>Siguiente</button>
                        </li>
                      </ul>
                    </nav>
                  </Show>
                </Show>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </>
  );
}
