import { safeEqual } from './safe-equal.js';
import { sign } from './sign.js';

export function isValidToken(secret: string) {
  return (value: string | undefined | null) => {
    if (!value) {
      return false;
    }

    const [expiresAt, signature] = value.split('.');

    if (!expiresAt || !signature) {
      return false;
    }

    if (Number(expiresAt) < Date.now()) {
      return false;
    }

    return safeEqual(signature, sign(secret)(expiresAt));
  };
}
