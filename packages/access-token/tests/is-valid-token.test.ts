import { describe, expect, it } from 'vitest';

import { createTokenValue } from '../src/create-token-value.js';
import { isValidToken } from '../src/is-valid-token.js';

describe('isValidToken', () => {
  const secret = 'test-secret';
  const ttlMs = 60_000;

  it('returns true for a freshly created token', () => {
    const value = createTokenValue(secret, ttlMs)();

    expect(isValidToken(secret, value)).toBe(true);
  });

  it('returns false for null, undefined, or empty values', () => {
    expect(isValidToken(secret, null)).toBe(false);
    expect(isValidToken(secret, undefined)).toBe(false);
    expect(isValidToken(secret, '')).toBe(false);
  });

  it('returns false when the token has expired', () => {
    const past = Date.now() - ttlMs - 1;
    const value = createTokenValue(secret, ttlMs)({ now: past });

    expect(isValidToken(secret, value)).toBe(false);
  });

  it('accepts tokens within clockToleranceMs after expiry', () => {
    const clockToleranceMs = 5_000;
    const expiredBy = 2_000;
    const value = createTokenValue(secret, ttlMs)({ now: Date.now() - ttlMs - expiredBy });

    expect(isValidToken(secret, value)).toBe(false);
    expect(isValidToken(secret, value, clockToleranceMs)).toBe(true);
  });

  it('rejects tokens signed with a different secret', () => {
    const value = createTokenValue(secret, ttlMs)({ data: { room: 'a1' } });

    expect(isValidToken('other-secret', value)).toBe(false);
  });
});
