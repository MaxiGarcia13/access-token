import type { PlaygroundElements } from './elements';
import { defaultPayload, defaultToleranceSec, defaultTtlMinutes } from './example';
import { renderTokenHighlight } from './sync';

export function clearEncodedToken(
  els: PlaygroundElements,
  setSyncing: (value: boolean) => void,
) {
  setSyncing(true);
  els.tokenInput.value = '';
  renderTokenHighlight(els, '');
  els.payloadInput.value = JSON.stringify(defaultPayload, null, 2);
  els.payloadError.hidden = true;
  els.payloadError.textContent = '';
  els.secretInput.value = '';
  els.ttlInput.value = defaultTtlMinutes;
  els.toleranceInput.value = defaultToleranceSec;
  setSyncing(false);
}
