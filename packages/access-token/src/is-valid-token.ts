import { createTokenValidator } from './create-token-validator.js';

type TokenValidatorParams = Parameters<typeof createTokenValidator>;
type TokenValidator = ReturnType<typeof createTokenValidator>;

/**
 * Checks if a token is valid.
 * @param secret - The secret used to sign the token.
 * @param token - The token to check.
 * @param clockToleranceMs - The allowed clock tolerance in milliseconds. Defaults to 0.
 * @returns True if the token is valid, false otherwise.
 */
export function isValidToken(
  secret: TokenValidatorParams[0],
  token: Parameters<TokenValidator>[0],
  clockToleranceMs: TokenValidatorParams[1] = 0,
): boolean {
  return createTokenValidator(secret, clockToleranceMs)(token);
}
