import { createHash } from 'crypto';

/**
 * Strip HTML tags, trim whitespace, and limit to 10000 characters.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 10_000);
}

/**
 * Normalize an email address: lowercase and trim.
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Hash an IP address using SHA-256 for privacy.
 * Returns a truncated 16-character hex string.
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}
