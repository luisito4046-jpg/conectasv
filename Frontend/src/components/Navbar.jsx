import { Show } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { useAuth } from "../stores/auth";
import { useUI } from "../stores/ui";
import { initials } from "../lib/utils";

export default function Navbar() {
  const ui = useUI();
  const auth = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    const p = location.pathname;
    if (path === "/") return p === "/" || p === "";
    return p.startsWith(path);
  };

  const displayName = () => {
    const u = auth.user();
    if (!u) return "";
    return u.last_name ? `${u.first_name} ${u.last_name}` : u.first_name;
  };

  const profileHref = () => {
    const u = auth.user();
    if (!u) return "#";
    if (u.role === "admin") return "/admin";
    if (u.role === "employer") return "/employer";
    return "/candidate";
  };

  return (
    <nav class="tb-navbar navbar navbar-expand-lg" id="mainNavbar">
      <div class="container-xl">
        <A class="navbar-brand tb-brand" href="/">
          <span class="brand-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 2L4.5 13.5H11.5L10 22L20.5 9.5H13.5L13 2Z"
                fill="#9ca3b0"
                stroke="#9ca3b0"
                stroke-width="0.5"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="brand-text">
            Conecta<strong class="brand-sv">SV</strong>
          </span>
        </A>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto ms-4 gap-1">
            <li class="nav-item">
              <A
                class={`nav-link tb-nav-link ${isActive("/") && !isActive("/jobs") && !isActive("/forum") && !isActive("/employer") ? "active" : ""}`}
                href="/"
              >
                <i class="bi bi-house me-1"></i>Inicio
              </A>
            </li>
            <li class="nav-item">
              <A
                class={`nav-link tb-nav-link ${isActive("/jobs") ? "active" : ""}`}
                href="/jobs"
              >
                <i class="bi bi-search me-1"></i>Explorar Empleos
              </A>
            </li>
            <li class="nav-item">
              <A
                class={`nav-link tb-nav-link ${isActive("/forum") ? "active" : ""}`}
                href="/forum"
              >
                <i class="bi bi-chat-dots me-1"></i>Foro
              </A>
            </li>
            <li class="nav-item">
              <A
                class={`nav-link tb-nav-link ${isActive("/recursos") ? "active" : ""}`}
                href="/recursos"
              >
                <i class="bi bi-journal-bookmark me-1"></i>Recursos
              </A>
            </li>
            <Show when={auth.user()?.role === "candidate"}>
              <li class="nav-item">
                <A
                  class={`nav-link tb-nav-link ${isActive("/candidate") ? "active" : ""}`}
                  href="/candidate"
                >
                  <i class="bi bi-person-circle me-1"></i>Mi Perfil
                </A>
              </li>
            </Show>
            <Show when={auth.user()?.role === "admin"}>
              <li class="nav-item">
                <A
                  class={`nav-link tb-nav-link ${isActive("/admin") ? "active" : ""}`}
                  href="/admin"
                >
                  <i class="bi bi-shield-lock me-1"></i>Admin
                </A>
              </li>
            </Show>
            <Show when={auth.user()?.role === "employer"}>
              <li class="nav-item">
                <A
                  class={`nav-link tb-nav-link ${isActive("/employer") ? "active" : ""}`}
                  href="/employer"
                >
                  <i class="bi bi-building me-1"></i>Panel Empresa
                </A>
              </li>
            </Show>
          </ul>

          <Show
            when={auth.user()}
            fallback={
              <div class="d-flex align-items-center gap-2">
                <button
                  class="btn tb-btn-ghost"
                  onClick={() => ui.openModal("loginModal")}
                >
                  <i class="bi bi-box-arrow-in-right me-1"></i>Iniciar Sesión
                </button>
                <button
                  class="btn tb-btn-primary"
                  onClick={() => ui.openModal("registerModal")}
                >
                  <i class="bi bi-person-plus me-1"></i>Registrarse
                </button>
              </div>
            }
          >
            <div class="d-flex align-items-center gap-3">
              <a
                href={profileHref()}
                class="tb-user-badge text-decoration-none"
                title="Ver mi perfil"
              >
                <Show
                  when={auth.user()?.logo_url || auth.user()?.profile_photo_url}
                  fallback={
                    <span class="user-avatar">
                      {initials(
                        auth.user()?.first_name,
                        auth.user()?.last_name,
                      )}
                    </span>
                  }
                >
                  <span
                    class="user-avatar"
                    style={{
                      "background-image": `url('${auth.user()?.logo_url || auth.user()?.profile_photo_url}')`,
                      "background-size": "cover",
                      "background-position": "center",
                    }}
                  />
                </Show>
                <div class="tb-user-meta">
                  <span class="tb-user-name">{displayName()}</span>
                  <span class="tb-user-email">{auth.user()?.email}</span>
                </div>
              </a>
              <button
                class="btn tb-btn-ghost btn-sm tb-btn-logout"
                onClick={() => auth.logout()}
              >
                <i class="bi bi-box-arrow-right me-1"></i>Salir
              </button>
            </div>
          </Show>
        </div>
      </div>
    </nav>
  );
}
