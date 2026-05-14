import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getCategoryBadgeClass(color: string): string {
  const map: Record<string, string> = {
    purple: 'badge-purple',
    red: 'badge-red',
    blue: 'badge-blue',
    green: 'badge-green',
    yellow: 'badge-yellow',
  };
  return map[color] || 'badge-purple';
}
