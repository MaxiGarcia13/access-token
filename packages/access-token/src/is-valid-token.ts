import { decodeToken } from './decode-token.js';
import { safeEqual } from './safe-equal.js';
import { sign } from './sign.js';

/**
 * Checks if a token is valid.
 * @param secret - The secret used to sign the token.
 * @param clockToleranceMs - The allowed clock tolerance in milliseconds. Defaults to 0.
 * @returns A function that checks if a token is valid.
 */
export function isValidToken(secret: string, clockToleranceMs = 0) {
  const toleranceMs = Math.max(0, clockToleranceMs);
  const signWithSecret = sign(secret);

  return (value: string | undefined | null) => {
    const decoded = decodeToken(value);

    if (!decoded) {
      return false;
    }

    if (decoded.expiresAt + toleranceMs < Date.now()) {
      return false;
    }

    return safeEqual(decoded.signature, signWithSecret(decoded.signedPayload));
  };
}
