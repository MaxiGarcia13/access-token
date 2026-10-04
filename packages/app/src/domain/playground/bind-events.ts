import type { PlaygroundElements } from './elements';
import type { SyncSource } from './sync';
import type { VerificationView } from './verification-view';
import { debounce } from '@/utils/debounce';
import { examplePayload, exampleSecret, exampleTtlMinutes } from './example';
import { renderTokenHighlight } from './sync';

interface BindOptions {
  els: PlaygroundElements;
  scheduleSync: (source?: SyncSource) => void;
  setSyncing: (value: boolean) => void;
  isSyncing: () => boolean;
}

export function bindPlaygroundEvents({
  els,
  scheduleSync,
  setSyncing,
  isSyncing,
}: BindOptions) {
  const {
    root,
    tokenInput,
    tokenHighlight,
    payloadInput,
    payloadError,
    secretInput,
    ttlInput,
    toleranceInput,
    statusEl,
  } = els;

  tokenInput.addEventListener('input', () => {
    if (isSyncing())
      return;
    renderTokenHighlight(els, tokenInput.value);
    scheduleSync('token');
  });

  payloadInput.addEventListener('input', () => {
    if (isSyncing())
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
    setSyncing(true);
    tokenInput.value = '';
    renderTokenHighlight(els, '');
    payloadInput.value = '{}';
    payloadError.hidden = true;
    payloadError.textContent = '';
    setSyncing(false);
    scheduleSync('token');
  });

  root.querySelector('[data-generate-example]')?.addEventListener('click', () => {
    setSyncing(true);
    payloadInput.value = JSON.stringify(examplePayload, null, 2);
    secretInput.value = exampleSecret;
    ttlInput.value = exampleTtlMinutes;
    setSyncing(false);
    scheduleSync('payload');
  });

  tokenInput.addEventListener('scroll', () => {
    tokenHighlight.scrollTop = tokenInput.scrollTop;
    tokenHighlight.scrollLeft = tokenInput.scrollLeft;
  });
}

export function createScheduler(
  run: (source: SyncSource) => void,
  view: VerificationView,
  ms = 280,
) {
  let source: SyncSource = 'payload';

  const debounced = debounce(() => run(source), ms);

  return (nextSource: SyncSource = source) => {
    source = nextSource;
    view.setPending(true);
    debounced();
  };
}
