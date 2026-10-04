import type { AccessTokenOptions, CreateTokenOptions, TokenData } from './types.js';
import { encodeBase64Url } from './base64url.js';
import { sign } from './sign.js';

function hasOwnData(data: TokenData | undefined): data is TokenData {
  return !!data && Object.keys(data).length > 0;
}

export function createTokenValue(secret: string, ttlMs: Required<AccessTokenOptions>['ttlMs']) {
  const signWithSecret = sign(secret);

  return (options: CreateTokenOptions = {}) => {
    const { data, now = Date.now() } = options;
    const expiresAt = String(now + ttlMs);

    if (!hasOwnData(data)) {
      return `${expiresAt}.${signWithSecret(expiresAt)}`;
    }

    const payload = encodeBase64Url(JSON.stringify(data));
    const signedPayload = `${expiresAt}.${payload}`;

    return `${signedPayload}.${signWithSecret(signedPayload)}`;
  };
}
