import type { AccessTokenOptions } from './type.js';
import { sign } from './sign.js';

export function createSessionValue(secret: string, ttlMs: Required<AccessTokenOptions>['ttlMs']) {
  return (now = Date.now()) => {
    const expiresAt = String(now + ttlMs);
    return `${expiresAt}.${sign(secret)(expiresAt)}`;
  };
}
