import type { PreviewResult } from '../token/types';
import type { PlaygroundElements } from './elements';
import { setExpiresAtMs } from './expires-countdown';

export function createVerificationView(els: PlaygroundElements) {
  const { statusEl, skeleton, previewBody, expiresAtEl, expiresInEl } = els;

  function setStatus(text: string, state: string) {
    statusEl.textContent = text;
    statusEl.dataset.state = state;
  }

  function setPending(pending: boolean) {
    skeleton.classList.toggle('hidden', !pending);
    previewBody.classList.toggle('hidden', pending);
    if (pending) {
      setStatus('Updating…', 'pending');
    }
  }

  function update(result: PreviewResult) {
    const expiresAt = result.expiresAt ?? null;
    expiresAtEl.textContent = expiresAt ? new Date(expiresAt).toLocaleString() : '—';
    setExpiresAtMs(expiresInEl, expiresAt, statusEl);

    if (result.error) {
      setStatus(result.error, 'error');
      return;
    }

    if (expiresAt !== null && expiresAt <= Date.now()) {
      setStatus('Expired', 'error');
      return;
    }

    if (typeof result.valid === 'boolean') {
      setStatus(result.valid ? 'Valid signature' : 'Invalid signature', result.valid ? 'ok' : 'error');
      return;
    }

    setStatus('Ready', 'ok');
  }

  function clear(message = 'Paste a token to inspect') {
    expiresAtEl.textContent = '—';
    setExpiresAtMs(expiresInEl, null);
    setPending(false);
    setStatus(message, 'error');
  }

  return { setPending, setStatus, update, clear };
}

export type VerificationView = ReturnType<typeof createVerificationView>;
