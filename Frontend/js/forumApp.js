// ============================================================
//  forumApp.js — Lógica del Foro de Profesionales
// ============================================================

const FORUM_API = '/api/forum';
let allPosts      = [];
let activeCategory = '';

// ── Estilos inline para los botones de categoría ────────────
const forumCatStyle = `
  .tb-forum-cat {
    display: flex; align-items: center;
    width: 100%; padding: 9px 12px;
    border: none; background: none;
    border-radius: 8px; cursor: pointer;
    font-family: var(--font-body); font-size: 13px;
    color: var(--text-m); text-align: left;
    transition: all .2s;
  }
  .tb-forum-cat:hover { background: rgba(26,58,92,.06); color: var(--primary); }
  .tb-forum-cat.active { background: var(--accent); color: #fff; font-weight: 600; }
  .forum-post-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px;
    transition: box-shadow .2s;
  }
  .forum-post-card:hover { box-shadow: var(--shadow); }
  .forum-category-badge {
    font-size: 11px; font-weight: 700; padding: 3px 10px;
    border-radius: 20px; background: rgba(26,58,92,.08);
    color: var(--primary); text-transform: uppercase; letter-spacing: .05em;
  }
  .forum-reply-box {
    background: var(--bg); border-radius: 8px; padding: 16px; margin-top: 12px;
  }
  .forum-reply-item {
    border-top: 1px solid var(--border); padding-top: 12px; margin-top: 12px;
  }
`;

if (!document.getElementById('forumStyles')) {
    const style = document.createElement('style');
    style.id = 'forumStyles';
    style.textContent = forumCatStyle;
    document.head.appendChild(style);
}

// ── Cargar posts desde la API ────────────────────────────────
async function loadForumPosts() {
    try {
        const res  = await fetch(FORUM_API);
        allPosts   = await res.json();
        renderForumPosts(allPosts);
        updateForumUI();
    } catch (err) {
        document.getElementById('forumPostsList').innerHTML = `
            <div class="text-center py-5 tb-text-muted">
                <i class="bi bi-exclamation-circle" style="font-size:2rem;color:var(--danger)"></i>
                <p class="mt-2">Error al cargar el foro.</p>
            </div>`;
    }
}

// ── Mostrar/ocultar formulario según sesión ──────────────────
function updateForumUI() {
    const newPost    = document.getElementById('forumNewPost');
    const loginPrompt = document.getElementById('forumLoginPrompt');

    if (typeof currentUser !== 'undefined' && currentUser) {
        newPost.style.display     = 'block';
        loginPrompt.style.display = 'none';
    } else {
        newPost.style.display     = 'none';
        loginPrompt.style.display = 'block';
    }
}

// ── Renderizar lista de posts ────────────────────────────────
function renderForumPosts(posts) {
    const container = document.getElementById('forumPostsList');

    if (!posts.length) {
        container.innerHTML = `
            <div class="text-center py-5 tb-text-muted">
                <i class="bi bi-chat-dots" style="font-size:2.5rem"></i>
                <p class="mt-2">No hay posts en esta categoría aún. ¡Sé el primero!</p>
            </div>`;
        return;
    }

    container.innerHTML = posts.map(p => {
        const ini  = `${(p.first_name||'?')[0]}${(p.last_name||'?')[0]}`.toUpperCase();
        const date = new Date(p.created_at).toLocaleDateString('es-SV', {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        return `
        <div class="forum-post-card" id="post-${p.id}">
          <div class="d-flex align-items-start gap-3 mb-3">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);
                        color:#fff;display:grid;place-items:center;font-size:12px;
                        font-weight:700;flex-shrink:0">${ini}</div>
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <span style="font-weight:600;color:var(--primary)">${p.first_name} ${p.last_name}</span>
                ${p.category ? `<span class="forum-category-badge">${p.category}</span>` : ''}
                <span style="font-size:12px;color:var(--text-l);margin-left:auto">${date}</span>
              </div>
              <h6 style="margin:6px 0 4px;color:var(--text);font-family:var(--font-body);font-weight:700">
                ${p.title}
              </h6>
              <p style="font-size:13px;color:var(--text-m);margin:0">${p.content}</p>
            </div>
          </div>

          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-sm tb-btn-ghost" onclick="toggleReplies(${p.id})">
              <i class="bi bi-chat me-1"></i>${p.replies_count} respuestas
            </button>
          </div>

          <!-- Sección de replies (oculta por defecto) -->
          <div id="replies-${p.id}" style="display:none" class="forum-reply-box mt-3">
            <div id="repliesList-${p.id}" class="mb-3"></div>
            ${typeof currentUser !== 'undefined' && currentUser ? `
            <div class="d-flex gap-2">
              <input type="text" class="form-control tb-input" id="replyInput-${p.id}"
                     placeholder="Escribe una respuesta…" style="font-size:13px"/>
              <button class="btn tb-btn-primary btn-sm" onclick="submitReply(${p.id})">
                <i class="bi bi-send"></i>
              </button>
            </div>` : `<p class="small tb-text-muted mb-0">
              <a href="#" class="tb-link" onclick="openModal('loginModal')">Inicia sesión</a> para responder.
            </p>`}
          </div>
        </div>`;
    }).join('');
}

// ── Ver/ocultar replies de un post ──────────────────────────
async function toggleReplies(postId) {
    const section = document.getElementById(`replies-${postId}`);
    const isOpen  = section.style.display !== 'none';

    if (isOpen) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    try {
        const res  = await fetch(`${FORUM_API}/${postId}`);
        const data = await res.json();
        const list = document.getElementById(`repliesList-${postId}`);

        if (!data.replies.length) {
            list.innerHTML = `<p class="small tb-text-muted">Sin respuestas aún.</p>`;
            return;
        }

        list.innerHTML = data.replies.map(r => {
            const ini  = `${(r.first_name||'?')[0]}${(r.last_name||'?')[0]}`.toUpperCase();
            const date = new Date(r.created_at).toLocaleDateString('es-SV', {
                day: 'numeric', month: 'short'
            });
            return `
            <div class="forum-reply-item d-flex gap-2">
              <div style="width:28px;height:28px;border-radius:50%;background:var(--accent);
                          color:#fff;display:grid;place-items:center;font-size:10px;
                          font-weight:700;flex-shrink:0">${ini}</div>
              <div>
                <span style="font-weight:600;font-size:13px;color:var(--primary)">
                  ${r.first_name} ${r.last_name}
                </span>
                <span style="font-size:11px;color:var(--text-l);margin-left:8px">${date}</span>
                <p style="font-size:13px;color:var(--text-m);margin:2px 0 0">${r.content}</p>
              </div>
            </div>`;
        }).join('');
    } catch (err) {
        console.error('Error cargando replies:', err);
    }
}

// ── Filtrar por categoría ────────────────────────────────────
function filterForum(category, btn) {
    activeCategory = category;

    document.querySelectorAll('.tb-forum-cat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filtered = category
        ? allPosts.filter(p => p.category === category)
        : allPosts;

    renderForumPosts(filtered);
}

// ── Publicar nuevo post ──────────────────────────────────────
async function submitForumPost() {
    const title    = document.getElementById('newPostTitle').value.trim();
    const content  = document.getElementById('newPostContent').value.trim();
    const category = document.getElementById('newPostCategory').value;

    if (!title || !content) {
        alert('Completa el título y el contenido.');
        return;
    }

    try {
        const res = await fetch(FORUM_API, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                user_id: currentUser.id,
                category, title, content
            })
        });

        if (!res.ok) throw new Error('Error al publicar');

        document.getElementById('newPostTitle').value   = '';
        document.getElementById('newPostContent').value = '';
        await loadForumPosts();

    } catch (err) {
        alert('Error al publicar el post.');
    }
}

// ── Enviar reply ─────────────────────────────────────────────
async function submitReply(postId) {
    const input   = document.getElementById(`replyInput-${postId}`);
    const content = input.value.trim();
    if (!content) return;

    try {
        const res = await fetch(`${FORUM_API}/${postId}/reply`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ user_id: currentUser.id, content })
        });

        if (!res.ok) throw new Error('Error al responder');

        input.value = '';
        await toggleReplies(postId); 
        await toggleReplies(postId); 
        await loadForumPosts();      

    } catch (err) {
        alert('Error al enviar la respuesta.');
    }
}
const _origShowView = window.showView;
window.showView = function(view) {
    if (_origShowView) _origShowView(view);
    if (view === 'forum') {
        loadForumPosts();
    }
};