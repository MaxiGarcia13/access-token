import { Buffer } from 'node:buffer';

export function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

export function decodeBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}
