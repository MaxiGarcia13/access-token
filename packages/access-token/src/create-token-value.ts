import type { AccessTokenOptions } from './types.js';
import { sign } from './sign.js';

export function createTokenValue(secret: string, ttlMs: Required<AccessTokenOptions>['ttlMs']) {
  return (now = Date.now()) => {
    const expiresAt = String(now + ttlMs);
    return `${expiresAt}.${sign(secret)(expiresAt)}`;
  };
}
