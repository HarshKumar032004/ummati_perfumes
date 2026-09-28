/**
 * Utility: Tailwind class merging
 *
 * Combines clsx (conditional class logic) with tailwind-merge (conflict resolution).
 * Prevents duplicate/conflicting Tailwind classes when composing components.
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-accent', className)
 *   cn('text-sm text-muted', 'text-base') // → 'text-base' (merge resolves conflict)
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Utility: Format a number as a display-ready string with ordinal suffix
 * e.g., 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th"
 */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Utility: Slugify a string for URL-safe usage
 * e.g., "Oud Royale 50ml" → "oud-royale-50ml"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Utility: Truncate text to a max character count with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Utility: Generate a random alphanumeric string of given length
 * Used for guest cart IDs, idempotency keys, etc.
 */
export function generateId(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Utility: Deep equality check for plain objects (lightweight, no lodash)
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Utility: Wait for N milliseconds (async sleep)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
