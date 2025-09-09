// Format seconds as a pretty duration string
// type: 'long' (default) = e.g. 1 hour 2 minutes 3 seconds
// type: 'short' = hh:mm:ss
export function prettyDuration(totalSeconds: number | null, type: 'long' | 'short' = 'long'): string {
  if (totalSeconds === null || isNaN(totalSeconds)) return 'Calculating...';
  totalSeconds = Math.round(totalSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (type === 'short') {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  let parts = [];
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  return parts.join(' ');
}
export function formatDate(dateString: string | null, locale = 'en-GB') {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
