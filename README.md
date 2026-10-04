# Access Token

Small dependency for creating and verifying short-lived HMAC-signed access tokens. Useful for protecting API routes with a cookie-friendly “has a valid pass” check — not full user sessions. No session store, no runtime dependencies.

## Install

```bash
npm install @maxigarcia/access-token
```

## Usage

```ts
import { createAccessToken } from '@maxigarcia/access-token';

const accessToken = createAccessToken(process.env.ACCESS_TOKEN_SECRET!, {
  ttlMs: 60 * 60 * 1000, // optional, defaults to 1 hour
});

// Issue a token (e.g. set as a cookie after a successful challenge)
const value = accessToken.create();

// Verify on protected routes
if (!accessToken.isValid(value)) {
  throw new Error('Unauthorized');
}
```
