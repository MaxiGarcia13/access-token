import { createHmac } from 'node:crypto';

export function sign(secret: string) {
  return (payload: string) =>
    createHmac('sha256', secret).update(payload).digest('hex');
}
