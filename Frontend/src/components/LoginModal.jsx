import { createSignal, Show, createEffect } from 'solid-js';
import { authApi } from '../lib/api';
import { useAuth } from '../stores/auth';

export default function LoginModal(props) {
  const auth = useAuth();
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [showPass, setShowPass] = createSignal(false);

  createEffect(() => {
    if (!props.show) {
      setEmail('');
      setPassword('');
      setError('');
    }
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email().trim() || !password()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      const data = await authApi.login(email().trim(), password());
      auth.login(data);
      props.closeModal();
    } catch (err) {
      setError(err.data?.error || err.message || 'Error al iniciar sesión.');
    }
  };

  return (
    <Show when={props.show}>
      <div class="modal fade tb-modal show d-block" tabindex="-1" style={{ 'background-color': 'rgba(0,0,0,.5)' }}>
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header tb-modal-header">
              <h5 class="modal-title">
                <i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
              </h5>
              <button type="button" class="btn-close btn-close-white" onClick={props.closeModal} />
            </div>
            <form class="modal-body p-4" onSubmit={handleLogin}>
              <div class="mb-3">
                <label class="tb-label">Correo Electrónico</label>
                <input
                  type="email"
                  class="form-control tb-input"
                  placeholder="correo@ejemplo.com"
                  value={email()}
                  onInput={(e) => setEmail(e.target.value)}
                />
              </div>
              <div class="mb-3">
                <label class="tb-label">Contraseña</label>
                <div class="input-group tb-input-group">
                  <input
                    type={showPass() ? 'text' : 'password'}
                    class="form-control tb-input"
                    placeholder="••••••••"
                    value={password()}
                    onInput={(e) => setPassword(e.target.value)}
                  />
                  <button
                    class="input-group-text tb-eye-btn"
                    type="button"
                    onClick={() => setShowPass(!showPass())}
                  >
                    <i class={`bi ${showPass() ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>
              <Show when={error()}>
                <div
                  style={{
                    color: 'var(--danger)',
                    'font-size': '13px',
                    'margin-bottom': '12px',
                    padding: '10px 12px',
                    background: 'rgba(220,38,38,.08)',
                    'border-radius': '8px',
                    border: '1px solid rgba(220,38,38,.2)',
                  }}
                >
                  {error()}
                </div>
              </Show>
              <button type="submit" class="btn tb-btn-primary w-100">
                Iniciar Sesión
              </button>
              <hr class="my-3" />
              <p class="text-center small mb-0 tb-text-muted">
                ¿No tienes cuenta?{' '}
                <a
                  href="#"
                  class="tb-link"
                  onClick={(e) => {
                    e.preventDefault();
                    props.switchModal('loginModal', 'registerModal');
                  }}
                >
                  Regístrate gratis
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </Show>
  );
}
