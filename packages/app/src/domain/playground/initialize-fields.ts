import type { PlaygroundElements } from './elements';
import { renderTokenHighlight } from './sync';

function formatInitialPayload(raw: string | undefined) {
  if (!raw) {
    return '{}';
  }

  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return '{}';
  }
}

export function initializePlaygroundFields(els: PlaygroundElements) {
  els.tokenInput.value = '';
  renderTokenHighlight(els, '');
  els.payloadInput.value = formatInitialPayload(els.payloadInput.dataset.initial);
  els.payloadError.hidden = true;
  els.payloadError.textContent = '';
}
