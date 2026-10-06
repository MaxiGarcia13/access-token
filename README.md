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
import { accessToken } from '@maxigarcia/access-token';

const tokenManager = accessToken(process.env.ACCESS_TOKEN_SECRET!, {
  ttlMs: 10 * 60 * 1000, // 10 minutes
  clockToleranceMs: 5 * 60 * 1000, // 5 minutes
});

// Issue a token (e.g. set as a cookie after a successful challenge)
const value = tokenManager.create();

// Optional custom claims (base64url JSON payload)
const withData = tokenManager.create({
  data: { sub: 'user-1', scope: 'read' },
});

// Verify on protected routes
if (!tokenManager.isValid(value)) {
  throw new Error('Unauthorized');
}

// Inspect without verifying
const decoded = tokenManager.decode(withData);
// { expiresAt, data: { sub, scope }, signature, signedPayload }
```

### Standalone helpers

You can also use `decodeToken` and `isValidToken` directly — useful when you only need to parse or verify, without creating a manager.

```ts
import { decodeToken, isValidToken } from '@maxigarcia/access-token';

// Parse without verifying signature or expiry
const decoded = decodeToken(value);
// { expiresAt, data, signature, signedPayload } | null

// Build a validator (HMAC + expiry check)
const isValid = isValidToken(process.env.ACCESS_TOKEN_SECRET!, 5 * 60 * 1000);

if (!isValid(value)) {
  throw new Error('Unauthorized');
}
```

### Token format

- Without data: `expiresAt.signature`
- With data: `expiresAt.base64url(json).signature`

`signature` is HMAC-SHA256 (hex) over the signed payload (`expiresAt` or `expiresAt.payload`).
