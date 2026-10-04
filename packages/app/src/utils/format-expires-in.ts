export function formatExpiresIn(expiresAt: number | null | undefined) {
  if (!expiresAt) {
    return '—';
  }

  const delta = expiresAt - Date.now();

  if (delta <= 0) {
    return 'expired';
  }

  const seconds = Math.round(delta / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${rem}s`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
