import type { AccessToken, AccessTokenOptions } from './types.js';
import { createTokenValue } from './create-token-value.js';
import { isValidToken } from './is-valid-token.js';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 *
 * @param secret
 * @param options
 * @param options.ttlMs - The time to live for the access token in milliseconds. Defaults to 1 hour.
 * @returns An object with the following properties:
 *  - create: A function that creates a token value.
 *  - isValid: A function that validates a token value.
 */
export function createAccessToken(
  secret: string,
  options: AccessTokenOptions = {},
): AccessToken {
  return {
    create: createTokenValue(secret, options.ttlMs ?? TOKEN_TTL_MS),
    isValid: isValidToken(secret),
  };
}
