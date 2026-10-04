# @maxigarcia/access-token

Tiny signed access tokens for cookie-based API auth — HMAC expiry checks, no session store.

## Purpose

`@maxigarcia/access-token` creates and verifies short-lived HMAC-signed tokens. Use it when you need a simple “has a valid pass” check on API routes (for example after a challenge or login), without a session store or full user-session system.

- No runtime dependencies
- Cookie-friendly opaque token strings
- Optional custom claims in the payload
- Expiry checked via HMAC-SHA256 signature

## How to use it

```bash
npm install @maxigarcia/access-token
```

```ts
import { createAccessToken, decodeToken } from '@maxigarcia/access-token';

const accessToken = createAccessToken(process.env.ACCESS_TOKEN_SECRET!, {
  ttlMs: 10 * 60 * 1000, // 10 minutes
  clockToleranceMs: 5 * 60 * 1000, // 5 minutes
});

// Issue a token (e.g. set as a cookie after a successful challenge)
const value = accessToken.create();

// Optional custom claims (base64url JSON payload)
const withData = accessToken.create({
  data: { sub: 'user-1', scope: 'read' },
});

// Verify on protected routes
if (!accessToken.isValid(value)) {
  throw new Error('Unauthorized');
}

// Inspect without verifying
const decoded = decodeToken(withData);
// { expiresAt, data: { sub, scope }, signature, signedPayload }
```

### Token format

- Without data: `expiresAt.signature`
- With data: `expiresAt.base64url(json).signature`

`signature` is HMAC-SHA256 (hex) over the signed payload (`expiresAt` or `expiresAt.payload`).
