import { describe, expect, it } from 'vitest';

import { createTokenValue } from '../src/create-token-value.js';
import { isValidToken } from '../src/is-valid-token.js';
import { sign } from '../src/sign.js';

describe('isValidToken', () => {
  const secret = 'test-secret';
  const ttlMs = 60_000;
  const isValid = isValidToken(secret);

  it('returns true for a freshly created token', () => {
    const value = createTokenValue(secret, ttlMs)();

    expect(isValid(value)).toBe(true);
  });

  it('returns false for null, undefined, or empty values', () => {
    expect(isValid(null)).toBe(false);
    expect(isValid(undefined)).toBe(false);
    expect(isValid('')).toBe(false);
  });

  it('returns false when the value is missing a signature', () => {
    expect(isValid('1234567890')).toBe(false);
    expect(isValid('1234567890.')).toBe(false);
  });

  it('returns false when expiresAt is not an integer timestamp', () => {
    expect(isValid(`abc.${sign(secret)('abc')}`)).toBe(false);
    expect(isValid(`1e21.${sign(secret)('1e21')}`)).toBe(false);
    expect(isValid(`12.34.${sign(secret)('12.34')}`)).toBe(false);
  });

  it('returns false when the token has expired', () => {
    const past = Date.now() - ttlMs - 1;
    const value = createTokenValue(secret, ttlMs)(past);

    expect(isValid(value)).toBe(false);
  });

  it('accepts tokens within clockToleranceMs after expiry', () => {
    const clockToleranceMs = 5_000;
    const isValidWithTolerance = isValidToken(secret, clockToleranceMs);
    const expiredBy = 2_000;
    const value = createTokenValue(secret, ttlMs)(Date.now() - ttlMs - expiredBy);

    expect(isValid(value)).toBe(false);
    expect(isValidWithTolerance(value)).toBe(true);
  });

  it('rejects tokens that are beyond clockToleranceMs', () => {
    const clockToleranceMs = 1_000;
    const isValidWithTolerance = isValidToken(secret, clockToleranceMs);
    const value = createTokenValue(secret, ttlMs)(Date.now() - ttlMs - 2_000);

    expect(isValidWithTolerance(value)).toBe(false);
  });

  it('returns false when the signature does not match', () => {
    const expiresAt = String(Date.now() + ttlMs);
    const value = `${expiresAt}.${sign('wrong-secret')(expiresAt)}`;

    expect(isValid(value)).toBe(false);
  });

  it('returns false when the signature is tampered with', () => {
    const value = createTokenValue(secret, ttlMs)();
    const [expiresAt, signature] = value.split('.');
    const tampered = `${expiresAt}.${signature!.slice(0, -1)}x`;

    expect(isValid(tampered)).toBe(false);
  });
});
