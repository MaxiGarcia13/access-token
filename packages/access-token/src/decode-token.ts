import type { DecodedAccessToken, TokenData } from './types.js';
import { decodeBase64Url } from './base64url.js';
import { isDigits } from './is-digits.js';

function parsePayload(payload: string): TokenData | null {
  try {
    const parsed: unknown = JSON.parse(decodeBase64Url(payload));

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    return parsed as TokenData;
  } catch {
    return null;
  }
}

/**
 * Parses a token without verifying its signature or expiry.
 */
export function decodeToken(value: string | undefined | null): DecodedAccessToken | null {
  if (!value) {
    return null;
  }

  const parts = value.split('.');

  if (parts.length < 2 || parts.length > 3) {
    return null;
  }

  const hasThreeParts = parts.length === 3;
  const [expiresAt, middle, maybeSignature] = parts;
  const payload = hasThreeParts ? middle : undefined;
  const signature = hasThreeParts ? maybeSignature : middle;

  if (!expiresAt || !signature || !isDigits(expiresAt) || payload === '') {
    return null;
  }

  const data = payload === undefined ? {} : parsePayload(payload);

  if (data === null) {
    return null;
  }

  return {
    expiresAt: Number(expiresAt),
    data,
    signature,
    signedPayload: payload === undefined ? expiresAt : `${expiresAt}.${payload}`,
  };
}
