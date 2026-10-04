import { describe, expect, it } from 'vitest';

import { createSessionValue } from '../src/create-session-value.js';
import { sign } from '../src/sign.js';

describe('createSessionValue', () => {
  const secret = 'test-secret';
  const ttlMs = 60_000;

  it('returns expiresAt.signature using the given now and ttl', () => {
    const now = 1_700_000_000_000;
    const expiresAt = String(now + ttlMs);
    const expected = `${expiresAt}.${sign(secret)(expiresAt)}`;

    expect(createSessionValue(secret, ttlMs)(now)).toBe(expected);
  });

  it('defaults now to Date.now()', () => {
    const before = Date.now();
    const value = createSessionValue(secret, ttlMs)();
    const after = Date.now();

    const [expiresAt, signature] = value.split('.');
    const expiresAtMs = Number(expiresAt);

    expect(expiresAtMs).toBeGreaterThanOrEqual(before + ttlMs);
    expect(expiresAtMs).toBeLessThanOrEqual(after + ttlMs);
    expect(signature).toBe(sign(secret)(expiresAt!));
  });
});
