export type TokenData = Record<string, unknown>;

export interface AccessTokenOptions {
  ttlMs?: number;
  clockToleranceMs?: number;
}

export interface CreateTokenOptions {
  data?: TokenData;
  now?: number;
}

export interface DecodedAccessToken {
  expiresAt: number;
  data: TokenData;
  signature: string;
  signedPayload: string;
}

export interface AccessToken {
  create: {
    (now?: number): string;
    (data: TokenData, now?: number): string;
    (options: CreateTokenOptions): string;
  };
  isValid: (value: string | undefined | null) => boolean;
  decode: (value: string | undefined | null) => DecodedAccessToken | null;
}
