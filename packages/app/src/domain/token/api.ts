import type { TokenApiSuccess, TokenData } from './types';

async function callTokenApi(body: Record<string, unknown>): Promise<TokenApiSuccess> {
  const response = await fetch('/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return (await response.json()) as TokenApiSuccess;
}

export function createToken(input: {
  secret: string;
  ttlMs: number;
  data: TokenData;
}): Promise<TokenApiSuccess> {
  return callTokenApi({
    action: 'create',
    secret: input.secret,
    ttlMs: input.ttlMs,
    data: input.data,
  });
}

export function verifyToken(input: {
  secret: string;
  token: string;
  clockToleranceMs: number;
}): Promise<TokenApiSuccess> {
  return callTokenApi({
    action: 'verify',
    secret: input.secret,
    token: input.token,
    clockToleranceMs: input.clockToleranceMs,
  });
}

export function decodeToken(token: string): Promise<TokenApiSuccess> {
  return callTokenApi({ action: 'decode', token });
}
