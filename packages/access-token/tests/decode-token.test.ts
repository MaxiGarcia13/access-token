import { describe, expect, it } from 'vitest';

import { createTokenValue } from '../src/create-token-value.js';
import { decodeToken } from '../src/decode-token.js';
import { sign } from '../src/sign.js';

describe('decodeToken', () => {
  const secret = 'test-secret';
  const ttlMs = 60_000;

  it('returns null for empty values', () => {
    expect(decodeToken(null)).toBeNull();
    expect(decodeToken(undefined)).toBeNull();
    expect(decodeToken('')).toBeNull();
  });

  it('decodes a 2-part token with empty data', () => {
    const now = 1_700_000_000_000;
    const value = createTokenValue(secret, ttlMs)({ now });
    const expiresAt = now + ttlMs;

    expect(decodeToken(value)).toEqual({
      expiresAt,
      data: {},
      signature: sign(secret)(String(expiresAt)),
      signedPayload: String(expiresAt),
    });
  });

  it('decodes a 3-part token with payload data', () => {
    const now = 1_700_000_000_000;
    const data = { sub: '123', admin: true };
    const value = createTokenValue(secret, ttlMs)({ data, now });
    const decoded = decodeToken(value);

    expect(decoded).toMatchObject({
      expiresAt: now + ttlMs,
      data,
    });
    expect(decoded?.signature).toBeTruthy();
    expect(decoded?.signedPayload.includes('.')).toBe(true);
  });

  it('returns null for malformed tokens', () => {
    expect(decodeToken('only-one-part')).toBeNull();
    expect(decodeToken('a.b.c.d')).toBeNull();
    expect(decodeToken(`abc.${sign(secret)('abc')}`)).toBeNull();
  });
});
