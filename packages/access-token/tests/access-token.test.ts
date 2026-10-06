import { describe, expect, it } from 'vitest';

import { accessToken } from '../src/access-token.js';

describe('accessToken', () => {
  const secret = 'test-secret';

  it('exposes create, isValid, and decode', () => {
    const tokenManager = accessToken(secret);

    expect(tokenManager).toEqual(
      expect.objectContaining({
        create: expect.any(Function),
        isValid: expect.any(Function),
        decode: expect.any(Function),
      }),
    );
  });

  it('creates a valid token with the default ttl', () => {
    const tokenManager = accessToken(secret);
    const value = tokenManager.create();

    expect(tokenManager.isValid(value)).toBe(true);
  });

  it('uses a custom ttlMs when creating token values', () => {
    const ttlMs = 5_000;
    const now = Date.now();
    const tokenManager = accessToken(secret, { ttlMs });
    const value = tokenManager.create({ now });
    const [expiresAt] = value.split('.');

    expect(Number(expiresAt)).toBe(now + ttlMs);
    expect(tokenManager.isValid(value)).toBe(true);
  });

  it('rejects tokens signed with a different secret', () => {
    const issuer = accessToken(secret);
    const verifier = accessToken('other-secret');

    expect(verifier.isValid(issuer.create())).toBe(false);
  });

  it('applies clockToleranceMs when validating', () => {
    const ttlMs = 5_000;
    const clockToleranceMs = 3_000;
    const tokenManager = accessToken(secret, { ttlMs, clockToleranceMs });
    const value = tokenManager.create({ now: Date.now() - ttlMs - 1_000 });

    expect(tokenManager.isValid(value)).toBe(true);
  });

  it('creates and validates tokens with custom data', () => {
    const tokenManager = accessToken(secret);
    const data = { sub: 'user-1', scope: 'read' };
    const value = tokenManager.create({ data });

    expect(tokenManager.isValid(value)).toBe(true);
    expect(tokenManager.decode(value)?.data).toEqual(data);
  });
});
