import { describe, expect, it } from 'vitest';

import { createAccessToken } from '../src/create-access-token.js';

describe('createAccessToken', () => {
  const secret = 'test-secret';

  it('exposes create and isValid', () => {
    const token = createAccessToken(secret);

    expect(token).toEqual(
      expect.objectContaining({
        create: expect.any(Function),
        isValid: expect.any(Function),
      }),
    );
  });

  it('creates a valid token with the default ttl', () => {
    const token = createAccessToken(secret);
    const value = token.create();

    expect(token.isValid(value)).toBe(true);
  });

  it('uses a custom ttlMs when creating token values', () => {
    const ttlMs = 5_000;
    const now = Date.now();
    const token = createAccessToken(secret, { ttlMs });
    const value = token.create(now);
    const [expiresAt] = value.split('.');

    expect(Number(expiresAt)).toBe(now + ttlMs);
    expect(token.isValid(value)).toBe(true);
  });

  it('rejects tokens signed with a different secret', () => {
    const issuer = createAccessToken(secret);
    const verifier = createAccessToken('other-secret');

    expect(verifier.isValid(issuer.create())).toBe(false);
  });

  it('applies clockToleranceMs when validating', () => {
    const ttlMs = 5_000;
    const clockToleranceMs = 3_000;
    const token = createAccessToken(secret, { ttlMs, clockToleranceMs });
    const value = token.create(Date.now() - ttlMs - 1_000);

    expect(token.isValid(value)).toBe(true);
  });
});
