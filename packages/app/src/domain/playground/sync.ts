import type { TokenData } from '../token/types';
import type { PlaygroundElements } from './elements';
import type { VerificationView } from './verification-view';
import { buildTokenHighlightHtml } from '@/utils/token-highlight';
import { createToken, decodeToken, verifyToken } from '../token/api';
import { parsePayloadJson } from '../token/parse-payload';
import { minutesToTtlMs, secondsToToleranceMs } from '../token/ttl';

export type SyncSource = 'payload' | 'token';

interface SyncOptions {
  els: PlaygroundElements;
  view: VerificationView;
  isCurrent: (id: number) => boolean;
  nextRequestId: () => number;
  setSyncing: (value: boolean) => void;
}

function renderTokenHighlight(els: PlaygroundElements, token: string) {
  els.tokenHighlight.innerHTML = buildTokenHighlightHtml(token);
}

function readPayload(els: PlaygroundElements) {
  const result = parsePayloadJson(els.payloadInput.value);
  els.payloadError.hidden = !result.error;
  els.payloadError.textContent = result.error ?? '';
  return result;
}

function writePayload(els: PlaygroundElements, data: TokenData, setSyncing: (value: boolean) => void) {
  setSyncing(true);
  els.payloadInput.value = JSON.stringify(data, null, 2);
  els.payloadError.hidden = true;
  els.payloadError.textContent = '';
  setSyncing(false);
}

function writeToken(els: PlaygroundElements, token: string, setSyncing: (value: boolean) => void) {
  setSyncing(true);
  els.tokenInput.value = token;
  renderTokenHighlight(els, token);
  setSyncing(false);
}

export async function syncFromPayload({
  els,
  view,
  isCurrent,
  nextRequestId,
  setSyncing,
}: SyncOptions) {
  const { data, error } = readPayload(els);
  if (error) {
    view.setPending(false);
    view.update({ error });
    return;
  }

  const secret = els.secretInput.value;
  if (!secret) {
    view.setPending(false);
    view.update({ error: 'Secret is required' });
    return;
  }

  const id = nextRequestId();
  view.setPending(true);

  try {
    const created = await createToken({
      secret,
      ttlMs: minutesToTtlMs(Number(els.ttlInput.value)),
      data,
    });

    if (!isCurrent(id))
      return;

    if (!created.ok || !created.token) {
      view.update({ error: created.error || 'Failed to create token' });
      return;
    }

    writeToken(els, created.token, setSyncing);

    const verified = await verifyToken({
      secret,
      token: created.token,
      clockToleranceMs: secondsToToleranceMs(Number(els.toleranceInput.value)),
    });

    if (!isCurrent(id))
      return;

    if (!verified.ok) {
      view.update({ error: verified.error || 'Verify failed' });
      return;
    }

    view.update({
      expiresAt: verified.expiresAt,
      valid: verified.valid,
    });
  } catch {
    if (isCurrent(id))
      view.update({ error: 'Request failed' });
  } finally {
    if (isCurrent(id))
      view.setPending(false);
  }
}

export async function syncFromToken({
  els,
  view,
  isCurrent,
  nextRequestId,
  setSyncing,
}: SyncOptions) {
  const token = els.tokenInput.value.trim();
  renderTokenHighlight(els, token);

  if (!token) {
    view.setPending(false);
    view.update({ error: 'Paste a token to inspect' });
    return;
  }

  const secret = els.secretInput.value;
  const id = nextRequestId();
  view.setPending(true);

  try {
    if (!secret) {
      const decoded = await decodeToken(token);
      if (!isCurrent(id))
        return;

      if (!decoded.ok) {
        view.update({ error: decoded.error || 'Unable to decode token' });
        return;
      }

      if (decoded.data) {
        writePayload(els, decoded.data, setSyncing);
      }

      view.update({ expiresAt: decoded.expiresAt });
      view.setStatus('Decoded (enter secret to verify)', 'pending');
      return;
    }

    const verified = await verifyToken({
      secret,
      token,
      clockToleranceMs: secondsToToleranceMs(Number(els.toleranceInput.value)),
    });

    if (!isCurrent(id))
      return;

    if (!verified.ok) {
      view.update({ error: verified.error || 'Verify failed' });
      return;
    }

    if (verified.data) {
      writePayload(els, verified.data, setSyncing);
    }

    view.update({
      expiresAt: verified.expiresAt,
      valid: verified.valid,
      error: verified.decodeError,
    });
  } catch {
    if (isCurrent(id))
      view.update({ error: 'Request failed' });
  } finally {
    if (isCurrent(id))
      view.setPending(false);
  }
}

export { renderTokenHighlight };
