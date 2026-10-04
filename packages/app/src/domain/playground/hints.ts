import type { PlaygroundMode } from '../token/types';

export const playgroundHints: Record<PlaygroundMode, string> = {
  encoder: 'Edit the payload and secret, then watch the signed token update in realtime.',
  decoder: 'Paste a token below to decode, validate, and verify against the secret.',
};
