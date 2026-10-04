import type { PreviewResult } from '../token/types';
import { buildTokenHighlightHtml } from '@/utils/token-highlight';
import { createToken, decodeToken, verifyToken } from '../token/api';
import { parsePayloadJson } from '../token/parse-payload';
import { minutesToTtlMs, secondsToToleranceMs } from '../token/ttl';
import { examplePayload, exampleSecret, exampleTtlMinutes } from './example';
import { setExpiresAtMs, startExpiresCountdown } from './expires-countdown';

type SyncSource = 'payload' | 'token';

export function initPlayground(root: HTMLElement) {
  const tokenInput = root.querySelector<HTMLTextAreaElement>('[data-token-input]')!;
  const tokenHighlight = root.querySelector<HTMLElement>('[data-token-highlight]')!;
  const payloadInput = root.querySelector<HTMLTextAreaElement>('[data-payload-input]')!;
  const payloadError = root.querySelector<HTMLElement>('[data-payload-error]')!;
  const secretInput = root.querySelector<HTMLInputElement>('[data-secret-input]')!;
  const ttlInput = root.querySelector<HTMLInputElement>('[data-ttl-input]')!;
  const toleranceInput = root.querySelector<HTMLInputElement>('[data-tolerance-input]')!;
  const statusEl = root.querySelector<HTMLElement>('[data-status]')!;
  const skeleton = root.querySelector<HTMLElement>('[data-skeleton]')!;
  const previewBody = root.querySelector<HTMLElement>('[data-preview-body]')!;
  const expiresAtEl = root.querySelector<HTMLElement>('[data-expires-at]')!;
  const expiresInEl = root.querySelector<HTMLElement>('[data-expires-in]')!;

  let source: SyncSource = 'payload';
  let debounceTimer: number | undefined;
  let requestId = 0;
  let syncing = false;

  startExpiresCountdown(expiresInEl, statusEl);

  function renderTokenHighlight(token: string) {
    tokenHighlight.innerHTML = buildTokenHighlightHtml(token);
  }

  function setPending(pending: boolean) {
    skeleton.classList.toggle('hidden', !pending);
    previewBody.classList.toggle('hidden', pending);
    statusEl.textContent = pending ? 'Updating…' : statusEl.textContent;
    statusEl.dataset.state = pending ? 'pending' : statusEl.dataset.state;
  }

  function updatePreview(result: PreviewResult) {
    const expiresAt = result.expiresAt ?? null;
    expiresAtEl.textContent = expiresAt ? new Date(expiresAt).toLocaleString() : '—';
    setExpiresAtMs(expiresInEl, expiresAt, statusEl);

    if (result.error) {
      statusEl.textContent = result.error;
      statusEl.dataset.state = 'error';
      return;
    }

    if (expiresAt !== null && expiresAt <= Date.now()) {
      statusEl.textContent = 'Expired';
      statusEl.dataset.state = 'error';
      return;
    }

    if (typeof result.valid === 'boolean') {
      statusEl.textContent = result.valid ? 'Valid signature' : 'Invalid signature';
      statusEl.dataset.state = result.valid ? 'ok' : 'error';
      return;
    }

    statusEl.textContent = 'Ready';
    statusEl.dataset.state = 'ok';
  }

  function readPayload() {
    const result = parsePayloadJson(payloadInput.value);
    payloadError.hidden = !result.error;
    payloadError.textContent = result.error ?? '';
    return result;
  }

  async function syncFromPayload() {
    const { data, error } = readPayload();
    if (error) {
      setPending(false);
      updatePreview({ error });
      return;
    }

    const secret = secretInput.value;
    if (!secret) {
      setPending(false);
      updatePreview({ error: 'Secret is required' });
      return;
    }

    const ttlMs = minutesToTtlMs(Number(ttlInput.value));
    const id = ++requestId;
    setPending(true);

    try {
      const result = await createToken({ secret, ttlMs, data });

      if (id !== requestId)
        return;

      if (!result.ok || !result.token) {
        updatePreview({ error: result.error || 'Failed to create token' });
        return;
      }

      syncing = true;
      tokenInput.value = result.token;
      renderTokenHighlight(result.token);
      syncing = false;

      const verify = await verifyToken({
        secret,
        token: result.token,
        clockToleranceMs: secondsToToleranceMs(Number(toleranceInput.value)),
      });

      if (id !== requestId)
        return;

      if (!verify.ok) {
        updatePreview({ error: verify.error || 'Verify failed' });
        return;
      }

      updatePreview({
        expiresAt: verify.expiresAt,
        data: verify.data,
        signature: verify.signature,
        valid: verify.valid,
      });
    } catch {
      if (id !== requestId)
        return;
      updatePreview({ error: 'Request failed' });
    } finally {
      if (id === requestId)
        setPending(false);
    }
  }

  async function syncFromToken() {
    const token = tokenInput.value.trim();
    renderTokenHighlight(token);

    if (!token) {
      setPending(false);
      updatePreview({ error: 'Paste a token to inspect' });
      return;
    }

    const secret = secretInput.value;
    const id = ++requestId;
    setPending(true);

    try {
      if (!secret) {
        const decoded = await decodeToken(token);

        if (id !== requestId)
          return;

        if (!decoded.ok) {
          updatePreview({ error: decoded.error || 'Unable to decode token' });
          return;
        }

        if (decoded.data) {
          syncing = true;
          payloadInput.value = JSON.stringify(decoded.data, null, 2);
          payloadError.hidden = true;
          syncing = false;
        }

        updatePreview({
          expiresAt: decoded.expiresAt,
          data: decoded.data,
          signature: decoded.signature,
        });
        statusEl.textContent = 'Decoded (enter secret to verify)';
        statusEl.dataset.state = 'pending';
        return;
      }

      const result = await verifyToken({
        secret,
        token,
        clockToleranceMs: secondsToToleranceMs(Number(toleranceInput.value)),
      });

      if (id !== requestId)
        return;

      if (!result.ok) {
        updatePreview({ error: result.error || 'Verify failed' });
        return;
      }

      if (result.data) {
        syncing = true;
        payloadInput.value = JSON.stringify(result.data, null, 2);
        payloadError.hidden = true;
        syncing = false;
      }

      updatePreview({
        expiresAt: result.expiresAt,
        data: result.data,
        signature: result.signature,
        valid: result.valid,
        error: result.decodeError,
      });
    } catch {
      if (id !== requestId)
        return;
      updatePreview({ error: 'Request failed' });
    } finally {
      if (id === requestId)
        setPending(false);
    }
  }

  function scheduleSync(nextSource: SyncSource = source) {
    source = nextSource;
    window.clearTimeout(debounceTimer);
    setPending(true);
    debounceTimer = window.setTimeout(() => {
      if (source === 'payload')
        void syncFromPayload();
      else void syncFromToken();
    }, 280);
  }

  tokenInput.addEventListener('input', () => {
    if (syncing)
      return;
    renderTokenHighlight(tokenInput.value);
    scheduleSync('token');
  });

  payloadInput.addEventListener('input', () => {
    if (syncing)
      return;
    scheduleSync('payload');
  });

  secretInput.addEventListener('input', () => scheduleSync());
  ttlInput.addEventListener('input', () => scheduleSync('payload'));
  toleranceInput.addEventListener('input', () => scheduleSync());

  root.querySelector('[data-copy-token]')?.addEventListener('click', async () => {
    if (!tokenInput.value)
      return;
    await navigator.clipboard.writeText(tokenInput.value);
    statusEl.textContent = 'Token copied';
  });

  root.querySelector('[data-copy-payload]')?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(payloadInput.value);
    statusEl.textContent = 'Payload copied';
  });

  root.querySelector('[data-clear-token]')?.addEventListener('click', () => {
    syncing = true;
    tokenInput.value = '';
    renderTokenHighlight('');
    payloadInput.value = '{}';
    payloadError.hidden = true;
    payloadError.textContent = '';
    syncing = false;
    scheduleSync('token');
  });

  root.querySelector('[data-generate-example]')?.addEventListener('click', () => {
    syncing = true;
    payloadInput.value = JSON.stringify(examplePayload, null, 2);
    secretInput.value = exampleSecret;
    ttlInput.value = exampleTtlMinutes;
    syncing = false;
    scheduleSync('payload');
  });

  tokenInput.addEventListener('scroll', () => {
    tokenHighlight.scrollTop = tokenInput.scrollTop;
    tokenHighlight.scrollLeft = tokenInput.scrollLeft;
  });

  scheduleSync('payload');
}
