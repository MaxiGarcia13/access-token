export type TokenData = Record<string, unknown>;

export type TokenApiSuccess
  = | {
    ok: true;
    token?: string;
    valid?: boolean;
    expiresAt?: number | null;
    data?: TokenData | null;
    signature?: string | null;
    decodeError?: string | null;
    error?: string;
  }
  | {
    ok: false;
    error?: string;
  };

export interface PreviewResult {
  expiresAt?: number | null;
  data?: TokenData | null;
  signature?: string | null;
  valid?: boolean;
  error?: string | null;
}
