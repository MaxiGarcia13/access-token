export interface AccessTokenOptions {
  ttlMs?: number;
}

export interface AccessToken {
  sessionValue: (now?: number) => string;
  isValid: (value: string | undefined | null) => boolean;
  sign: (payload: string) => string;
}
