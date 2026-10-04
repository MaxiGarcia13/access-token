import { describe, expect, it } from 'vitest';

import { encodeBase64Url } from '../src/base64url.js';
import { createTokenValue } from '../src/create-token-value.js';
import { decodeToken } from '../src/decode-token.js';
import { sign } from '../src/sign.js';

describe('createTokenValue', () => {
  const secret = 'test-secret';
  const ttlMs = 60_000;

  it('returns expiresAt.signature using the given now and ttl', () => {
    const now = 1_700_000_000_000;
    const expiresAt = String(now + ttlMs);
    const expected = `${expiresAt}.${sign(secret)(expiresAt)}`;

    expect(createTokenValue(secret, ttlMs)({ now })).toBe(expected);
  });

  it('defaults now to Date.now()', () => {
    const before = Date.now();
    const value = createTokenValue(secret, ttlMs)();
    const after = Date.now();

    const [expiresAt, signature] = value.split('.');
    const expiresAtMs = Number(expiresAt);

    expect(expiresAtMs).toBeGreaterThanOrEqual(before + ttlMs);
    expect(expiresAtMs).toBeLessThanOrEqual(after + ttlMs);
    expect(signature).toBe(sign(secret)(expiresAt!));
  });

  it('embeds payload data in a 3-part token', () => {
    const now = 1_700_000_000_000;
    const data = { role: 'admin', n: 1 };
    const value = createTokenValue(secret, ttlMs)({ data, now });
    const expiresAt = String(now + ttlMs);
    const payload = encodeBase64Url(JSON.stringify(data));
    const signedPayload = `${expiresAt}.${payload}`;

    expect(value).toBe(`${signedPayload}.${sign(secret)(signedPayload)}`);
    expect(decodeToken(value)?.data).toEqual(data);
  });
});
