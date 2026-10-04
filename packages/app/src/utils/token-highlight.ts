import { escapeHtml } from './escape-html';

const PART_CLASSES = ['part-expiry', 'part-payload', 'part-signature'] as const;

export function buildTokenHighlightHtml(token: string): string {
  if (!token) {
    return '';
  }

  const parts = token.split('.');

  if (parts.length === 2) {
    return `<span class="part-expiry">${escapeHtml(parts[0] ?? '')}</span><span class="dot">.</span><span class="part-signature">${escapeHtml(parts[1] ?? '')}</span>`;
  }

  return parts
    .map((part, index) => {
      const cls = PART_CLASSES[index] ?? 'part-signature';
      const piece = `<span class="${cls}">${escapeHtml(part)}</span>`;
      return index === 0 ? piece : `<span class="dot">.</span>${piece}`;
    })
    .join('');
}
