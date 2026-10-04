const DEFAULT_TTL_MS = 3_600_000;

export function minutesToTtlMs(minutes: number): number {
  return Number.isFinite(minutes) && minutes > 0 ? minutes * 60_000 : DEFAULT_TTL_MS;
}

export function secondsToToleranceMs(seconds: number): number {
  return Math.max(0, Number(seconds) || 0) * 1000;
}
