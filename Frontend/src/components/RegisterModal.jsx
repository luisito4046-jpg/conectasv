import { createSignal, Show, createEffect } from 'solid-js';
import { authApi, companiesApi } from '../lib/api';
import { useAuth } from '../stores/auth';

export default function RegisterModal(props) {
  const auth = useAuth();
  const [role, setRole] = createSignal('candidate');
  const [firstName, setFirstName] = createSignal('');
  const [lastName, setLastName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirm, setConfirm] = createSignal('');
  const [terms, setTerms] = createSignal(false);
  const [showPass, setShowPass] = createSignal(false);
  const [pwStrength, setPwStrength] = createSignal({ w: '10%', color: '#dc2626', text: '' });

  createEffect(() => {
    if (!props.show) {
      setRole('candidate');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirm('');
      setTerms(false);
    }
  });

  const updateStrength = (val) => {
    let strength = 0;
    if (val.length >= 8) strength++;
    if (val.length >= 12) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;
    const levels = [
      { w: '10%', color: '#dc2626', text: 'Muy débil' },
      { w: '25%', color: '#dc2626', text: 'Débil' },
      { w: '50%', color: '#f59e0b', text: 'Regular' },
      { w: '75%', color: '#22c55e', text: 'Buena' },
      { w: '90%', color: '#16a34a', text: 'Fuerte' },
      { w: '100%', color: '#059669', text: 'Muy fuerte' },
    ];
    const level = levels[Math.min(strength, levels.length - 1)];
    setPwStrength({ ...level, text: val ? level.text : '' });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const r = role();

    if (!firstName().trim() || (r !== 'employer' && !lastName().trim()) || !email().trim() || !password()) {
      auth.showToast('Por favor completa todos los campos.', 'error');
      return;
    }
    if (password().length < 8) {
      auth.showToast('La contraseña debe tener mínimo 8 caracteres.', 'error');
      return;
    }
    if (password() !== confirm()) {
      auth.showToast('Las contraseñas no coinciden.', 'error');
      return;
    }
    if (!terms()) {
      auth.showToast('Debes aceptar los términos y condiciones.', 'error');
      return;
    }

    try {
      const data = await authApi.register({
        first_name: firstName().trim(),
        last_name: lastName().trim(),
        email: email().trim(),
        password_hash: password(),
        role: r,
      });

      if (r === 'employer' && data.id) {
        try {
          await companiesApi.create({
            owner_id: data.id,
            name: `${firstName()} ${lastName()}`.trim(),
            description: '',
            industry: '',
            location: '',
          });
        } catch {
          /* non-blocking */
        }
      }

      props.closeModal();
      auth.showToast('¡Cuenta creada exitosamente! Ahora inicia sesión.');
      setTimeout(() => props.switchModal('registerModal', 'loginModal'), 500);
    } catch (err) {
      auth.showToast(err.data?.error || 'Error al crear cuenta', 'error');
    }
  };

  return (
    <Show when={props.show}>
      <div class="modal fade tb-modal show d-block" tabindex="-1" style={{ 'background-color': 'rgba(0,0,0,.5)' }}>
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header tb-modal-header">
              <h5 class="modal-title">
                <i class="bi bi-person-plus me-2"></i>Crear Cuenta
              </h5>
              <button type="button" class="btn-close btn-close-white" onClick={props.closeModal} />
            </div>
            <form class="modal-body p-4" onSubmit={handleRegister}>
              <div class="tb-role-selector d-flex gap-2 mb-4">
                <button
                  type="button"
                  class={`tb-role-btn flex-fill ${role() === 'candidate' ? 'active' : ''}`}
                  onClick={() => setRole('candidate')}
                >
                  <i class="bi bi-person me-2"></i>Candidato
                </button>
                <button
                  type="button"
                  class={`tb-role-btn flex-fill ${role() === 'employer' ? 'active' : ''}`}
                  onClick={() => setRole('employer')}
                >
                  <i class="bi bi-building me-2"></i>Empresa
                </button>
              </div>
              <div class="row g-3 mb-3">
                <div class={role() === 'employer' ? 'col-12' : 'col-6'}>
                  <label class="tb-label">{role() === 'employer' ? 'Nombre de la empresa' : 'Nombre'}</label>
                  <input
                    type="text"
                    class="form-control tb-input"
                    placeholder={role() === 'employer' ? 'Nombre de la empresa' : 'Juan'}
                    value={firstName()}
                    onInput={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <Show when={role() !== 'employer'}>
                  <div class="col-6">
                    <label class="tb-label">Apellido</label>
                    <input
                      type="text"
                      class="form-control tb-input"
                      placeholder="Pérez"
                      value={lastName()}
                      onInput={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </Show>
              </div>
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
                    placeholder="Mínimo 8 caracteres"
                    value={password()}
                    onInput={(e) => {
                      setPassword(e.target.value);
                      updateStrength(e.target.value);
                    }}
                  />
                  <button type="button" class="input-group-text tb-eye-btn" onClick={() => setShowPass(!showPass())}>
                    <i class={`bi ${showPass() ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
                <div class="mt-2">
                  <div style={{ height: '4px', background: '#eee', 'border-radius': '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: pwStrength().w,
                        background: pwStrength().color,
                        transition: 'all .3s',
                      }}
                    />
                  </div>
                  <small class="tb-text-muted">{pwStrength().text}</small>
                </div>
              </div>
              <div class="mb-3">
                <label class="tb-label">Confirmar Contraseña</label>
                <input
                  type="password"
                  class="form-control tb-input"
                  placeholder="Repite tu contraseña"
                  value={confirm()}
                  onInput={(e) => setConfirm(e.target.value)}
                />
              </div>
              <div class="form-check mb-4">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="acceptTerms"
                  checked={terms()}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                <label class="form-check-label small" for="acceptTerms">
                  Acepto los términos y condiciones
                </label>
              </div>
              <button type="submit" class="btn tb-btn-primary w-100">
                <i class="bi bi-person-check me-2"></i>Crear Cuenta
              </button>
              <hr class="my-3" />
              <p class="text-center small mb-0 tb-text-muted">
                ¿Ya tienes cuenta?{' '}
                <a
                  href="#"
                  class="tb-link"
                  onClick={(e) => {
                    e.preventDefault();
                    props.switchModal('registerModal', 'loginModal');
                  }}
                >
                  Inicia sesión
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </Show>
  );
}
