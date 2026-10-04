import { describe, expect, it } from 'vitest';

import { createSessionValue } from '../src/create-session-value.js';
import { isValidSession } from '../src/is-valid-session.js';
import { sign } from '../src/sign.js';

describe('isValidSession', () => {
  const secret = 'test-secret';
  const ttlMs = 60_000;
  const isValid = isValidSession(secret);

  it('returns true for a freshly created session', () => {
    const value = createSessionValue(secret, ttlMs)();

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

  it('returns false when the session has expired', () => {
    const past = Date.now() - ttlMs - 1;
    const value = createSessionValue(secret, ttlMs)(past);

    expect(isValid(value)).toBe(false);
  });

  it('returns false when the signature does not match', () => {
    const expiresAt = String(Date.now() + ttlMs);
    const value = `${expiresAt}.${sign('wrong-secret')(expiresAt)}`;

    expect(isValid(value)).toBe(false);
  });

  it('returns false when the signature is tampered with', () => {
    const value = createSessionValue(secret, ttlMs)();
    const [expiresAt, signature] = value.split('.');
    const tampered = `${expiresAt}.${signature!.slice(0, -1)}x`;

    expect(isValid(tampered)).toBe(false);
  });
});
