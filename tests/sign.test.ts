import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { sign } from '../src/sign.js';

describe('sign', () => {
  it('returns an HMAC-SHA256 hex digest of the payload', () => {
    const secret = 'test-secret';
    const payload = '1234567890';
    const expected = createHmac('sha256', secret).update(payload).digest('hex');

    expect(sign(secret)(payload)).toBe(expected);
  });

  it('produces different signatures for different secrets', () => {
    const payload = 'same-payload';

    expect(sign('secret-a')(payload)).not.toBe(sign('secret-b')(payload));
  });

  it('produces different signatures for different payloads', () => {
    const signWithSecret = sign('test-secret');

    expect(signWithSecret('payload-a')).not.toBe(signWithSecret('payload-b'));
  });
});
