import type { TokenData } from './types';

export function parsePayloadJson(raw: string): { data: TokenData; error: string | null } {
  const source = raw.trim() || '{}';

  try {
    const parsed: unknown = JSON.parse(source);

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { data: {}, error: 'Payload must be a JSON object' };
    }

    return { data: parsed as TokenData, error: null };
  } catch {
    return { data: {}, error: 'Invalid JSON in payload' };
  }
}
