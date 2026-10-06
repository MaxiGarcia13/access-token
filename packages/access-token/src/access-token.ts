import type { AccessToken, AccessTokenOptions } from './types.js';
import { createTokenValue } from './create-token-value.js';
import { decodeToken } from './decode-token.js';
import { isValidToken } from './is-valid-token.js';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const DEFAULT_CLOCK_TOLERANCE_MS = 0;

/**
 *
 * @param secret
 * @param options
 * @param options.ttlMs - The time to live for the access token in milliseconds. Defaults to 1 hour.
 * @param options.clockToleranceMs - Allowed clock skew when checking expiry, in milliseconds. Defaults to 0.
 * @returns An object with the following properties:
 *  - create: A function that creates a token value. Accepts optional `{ data, now }`.
 *  - isValid: A function that validates a token value.
 *  - decode: A function that parses a token without verifying it.
 */
export function accessToken(
  secret: string,
  options: AccessTokenOptions = {},
): AccessToken {
  return {
    create: createTokenValue(secret, options.ttlMs ?? TOKEN_TTL_MS),
    isValid: isValidToken(secret, options.clockToleranceMs ?? DEFAULT_CLOCK_TOLERANCE_MS),
    decode: decodeToken,
  };
}
