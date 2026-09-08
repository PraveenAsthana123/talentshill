/**
 * Merge CSS module class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate a unique ID for messages, form submissions, etc.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncate text to a given length with ellipsis.
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '…';
}

/**
 * Delay helper for simulating async operations.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Slugify a string for URLs.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Basic prompt injection guard (placeholder).
 */
export function sanitizePrompt(input: string): string {
  const blocked = [
    'ignore previous instructions',
    'ignore all instructions',
    'system prompt',
    'you are now',
    'disregard',
  ];
  const lower = input.toLowerCase();
  for (const phrase of blocked) {
    if (lower.includes(phrase)) {
      return '[Message filtered for safety]';
    }
  }
  return input.trim();
}
