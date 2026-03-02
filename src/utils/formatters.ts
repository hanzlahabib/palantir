export function formatUtcTime(date: Date = new Date()): string {
  return date.toISOString().replace("T", " ").slice(0, 19) + "Z";
}

export function formatUtcClock(date: Date = new Date()): string {
  return date.toISOString().slice(11, 19) + "Z";
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatSpeed(knots: number): string {
  return `${knots.toFixed(0)} kts`;
}

export function formatSpeedKmh(ms: number): string {
  return `${(ms * 3.6).toFixed(0)} km/h`;
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function padZero(n: number, digits = 2): string {
  return n.toString().padStart(digits, "0");
}
