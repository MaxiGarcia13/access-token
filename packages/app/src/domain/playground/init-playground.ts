import type { SyncSource } from './sync';
import { bindPlaygroundEvents, createScheduler } from './bind-events';
import { getPlaygroundElements } from './elements';
import { startExpiresCountdown } from './expires-countdown';
import { initializePlaygroundFields } from './initialize-fields';
import { syncFromPayload, syncFromToken } from './sync';
import { createVerificationView } from './verification-view';

export function initPlayground(root: HTMLElement) {
  const els = getPlaygroundElements(root);
  const view = createVerificationView(els);

  let requestId = 0;
  let syncing = false;

  initializePlaygroundFields(els);
  startExpiresCountdown(els.expiresInEl, els.statusEl);

  const syncOptions = {
    els,
    view,
    isCurrent: (id: number) => id === requestId,
    nextRequestId: () => ++requestId,
    setSyncing: (value: boolean) => {
      syncing = value;
    },
  };

  const runSync = (source: SyncSource) => {
    if (source === 'payload')
      void syncFromPayload(syncOptions);
    else void syncFromToken(syncOptions);
  };

  const scheduleSync = createScheduler(runSync, view);

  bindPlaygroundEvents({
    els,
    view,
    scheduleSync,
    cancelPending: () => {
      requestId += 1;
      scheduleSync.cancel();
    },
    setSyncing: (value) => {
      syncing = value;
    },
    isSyncing: () => syncing,
  });

  scheduleSync('payload');
}
