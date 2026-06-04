import { A } from '@solidjs/router';
import { useUI } from '../stores/ui';

export default function Footer() {
  const ui = useUI();
  return (
    <footer class="tb-footer">
      <div class="container-xl">
        <div class="row g-4">
          <div class="col-md-4">
            <div class="tb-brand mb-3">
              <span class="brand-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            </div>
            <p class="tb-text-muted small">
              Conectando talento con oportunidades en El Salvador. Tu próxima oportunidad está a un clic.
            </p>
          </div>
          <div class="col-md-2">
            <h6 class="tb-footer-heading">Plataforma</h6>
            <ul class="tb-footer-links">
              <li>
                <A href="/jobs">Explorar Empleos</A>
              </li>
              <li>
                <A href="/forum">Foro</A>
              </li>
              <li>
                <A href="/recursos">Recursos</A>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); ui.openModal('registerModal'); }}>
                  Registrarse
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); ui.openModal('loginModal'); }}>
                  Iniciar Sesión
                </a>
              </li>
            </ul>
          </div>
          <div class="col-md-2">
            <h6 class="tb-footer-heading">Empresa</h6>
            <ul class="tb-footer-links">
              <li>
                <a href="#">Sobre Nosotros</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Contacto</a>
              </li>
            </ul>
          </div>
          <div class="col-md-4">
            <h6 class="tb-footer-heading">Newsletter</h6>
            <p class="tb-text-muted small">Recibe las mejores oportunidades en tu correo.</p>
            <div class="input-group tb-input-group">
              <input type="email" class="form-control tb-input" placeholder="correo@ejemplo.com" />
              <button class="btn tb-btn-primary" type="button">
                Suscribir
              </button>
            </div>
          </div>
        </div>
        <hr class="tb-footer-divider" />
        <div class="d-flex flex-wrap justify-content-between align-items-center">
          <p class="small tb-text-muted mb-0">© 2024 ConectaSV. Todos los derechos reservados.</p>
          <div class="d-flex gap-3">
            <a href="#" class="tb-social">
              <i class="bi bi-linkedin"></i>
            </a>
            <a href="#" class="tb-social">
              <i class="bi bi-twitter-x"></i>
            </a>
            <a href="#" class="tb-social">
              <i class="bi bi-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
