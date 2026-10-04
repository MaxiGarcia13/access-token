import type { AccessToken, AccessTokenOptions } from './type.js';
import { createSessionValue } from './create-session-value.js';
import { isValidSession } from './is-valid-session.js';
import { sign } from './sign.js';

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 *
 * @param secret
 * @param options
 * @param options.ttlMs - The time to live for the access token in milliseconds. Defaults to 1 hour.
 * @returns An object with the following properties:
 *  - sessionValue: A function that creates a session value.
 *  - isValid: A function that validates a session value.
 *  - sign: A function that signs a payload.
 */
export function createAccessToken(
  secret: string,
  options: AccessTokenOptions = {},
): AccessToken {
  return {
    sessionValue: createSessionValue(secret, options.ttlMs ?? SESSION_TTL_MS),
    isValid: isValidSession(secret),
    sign: sign(secret),
  };
}
