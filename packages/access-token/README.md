# @maxigarcia/access-token

Small dependency for creating and verifying short-lived HMAC-signed access tokens. Useful for protecting API routes with a cookie-friendly “has a valid pass” check — not full user sessions. No session store, no runtime dependencies.

## Install

```bash
npm install @maxigarcia/access-token
```

## Usage

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

## Token format

- Without data: `expiresAt.signature`
- With data: `expiresAt.base64url(json).signature`

`signature` is HMAC-SHA256 (hex) over the signed payload (`expiresAt` or `expiresAt.payload`).
