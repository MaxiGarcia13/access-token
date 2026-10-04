import { isDigits } from './is-digits.js';
import { safeEqual } from './safe-equal.js';
import { sign } from './sign.js';

export function isValidToken(secret: string, clockToleranceMs = 0) {
  const toleranceMs = Math.max(0, clockToleranceMs);

  return (value: string | undefined | null) => {
    if (!value) {
      return false;
    }

    const [expiresAt, signature] = value.split('.');

    if (!expiresAt || !signature || !isDigits(expiresAt)) {
      return false;
    }

    if (Number(expiresAt) + toleranceMs < Date.now()) {
      return false;
    }

    return safeEqual(signature, sign(secret)(expiresAt));
  };
}
