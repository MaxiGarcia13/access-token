export interface PlaygroundElements {
  root: HTMLElement;
  tokenInput: HTMLTextAreaElement;
  tokenHighlight: HTMLElement;
  payloadInput: HTMLTextAreaElement;
  payloadError: HTMLElement;
  secretInput: HTMLInputElement;
  ttlInput: HTMLInputElement;
  toleranceInput: HTMLInputElement;
  statusEl: HTMLElement;
  skeleton: HTMLElement;
  previewBody: HTMLElement;
  expiresAtEl: HTMLElement;
  expiresInEl: HTMLElement;
}

function requireEl<T extends Element>(root: HTMLElement, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) {
    throw new Error(`Missing playground element: ${selector}`);
  }
  return el;
}

export function getPlaygroundElements(root: HTMLElement): PlaygroundElements {
  return {
    root,
    tokenInput: requireEl(root, '[data-token-input]'),
    tokenHighlight: requireEl(root, '[data-token-highlight]'),
    payloadInput: requireEl(root, '[data-payload-input]'),
    payloadError: requireEl(root, '[data-payload-error]'),
    secretInput: requireEl(root, '[data-secret-input]'),
    ttlInput: requireEl(root, '[data-ttl-input]'),
    toleranceInput: requireEl(root, '[data-tolerance-input]'),
    statusEl: requireEl(root, '[data-status]'),
    skeleton: requireEl(root, '[data-skeleton]'),
    previewBody: requireEl(root, '[data-preview-body]'),
    expiresAtEl: requireEl(root, '[data-expires-at]'),
    expiresInEl: requireEl(root, '[data-expires-in]'),
  };
}
