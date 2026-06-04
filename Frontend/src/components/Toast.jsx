import { Show } from 'solid-js';
import { useAuth } from '../stores/auth';

export default function Toast() {
  const auth = useAuth();

  return (
    <Show when={auth.toast()}>
      {(t) => (
        <div class="position-fixed bottom-0 end-0 p-3" style={{ 'z-index': '9999' }}>
          <div
            class={`toast tb-toast align-items-center show ${t().type === 'error' ? 'text-bg-danger' : 'text-bg-success'}`}
            role="alert"
          >
            <div class="d-flex">
              <div class="toast-body">{t().msg}</div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" />
            </div>
          </div>
        </div>
      )}
    </Show>
  );
}
