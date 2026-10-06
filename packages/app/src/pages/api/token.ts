import type { TokenData } from '@maxigarcia/access-token';
import type { APIRoute } from 'astro';
import {
  accessToken,
  decodeToken,
} from '@maxigarcia/access-token';

export const prerender = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!isRecord(body) || typeof body.action !== 'string') {
    return json({ error: 'Missing action' }, 400);
  }

  const action = body.action;

  if (action === 'decode') {
    const token = typeof body.token === 'string' ? body.token : '';
    const decoded = decodeToken(token);

    if (!decoded) {
      return json({ ok: false, error: 'Unable to decode token' }, 200);
    }

    return json({
      ok: true,
      expiresAt: decoded.expiresAt,
      data: decoded.data,
      signature: decoded.signature,
    });
  }

  if (action === 'create') {
    const secret = typeof body.secret === 'string' ? body.secret : '';

    if (!secret) {
      return json({ error: 'Secret is required' }, 400);
    }

    const ttlMs = typeof body.ttlMs === 'number' && body.ttlMs > 0 ? body.ttlMs : undefined;
    const now = typeof body.now === 'number' ? body.now : undefined;
    const data = isRecord(body.data) ? (body.data as TokenData) : undefined;
    const tokenManager = accessToken(secret, { ttlMs });
    const token = tokenManager.create({ data, now });
    const decoded = tokenManager.decode(token);

    return json({
      ok: true,
      token,
      expiresAt: decoded?.expiresAt,
      data: decoded?.data ?? {},
      signature: decoded?.signature,
    });
  }

  if (action === 'verify') {
    const secret = typeof body.secret === 'string' ? body.secret : '';
    const token = typeof body.token === 'string' ? body.token : '';

    if (!secret) {
      return json({ error: 'Secret is required' }, 400);
    }

    const clockToleranceMs
      = typeof body.clockToleranceMs === 'number' && body.clockToleranceMs >= 0
        ? body.clockToleranceMs
        : undefined;
    const tokenManager = accessToken(secret, { clockToleranceMs });
    const decoded = tokenManager.decode(token);
    const valid = tokenManager.isValid(token);

    return json({
      ok: true,
      valid,
      expiresAt: decoded?.expiresAt ?? null,
      data: decoded?.data ?? null,
      signature: decoded?.signature ?? null,
      decodeError: decoded ? null : 'Unable to decode token',
    });
  }

  return json({ error: `Unknown action: ${action}` }, 400);
};
