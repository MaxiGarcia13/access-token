export interface AccessTokenOptions {
  ttlMs?: number;
  clockToleranceMs?: number;
}

export interface AccessToken {
  create: (now?: number) => string;
  isValid: (value: string | undefined | null) => boolean;
}
