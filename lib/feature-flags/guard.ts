import { NextResponse } from 'next/server';
import { isFeatureEnabled } from './cache';

/**
 * Check if a feature is enabled. Returns true if the feature flag exists and is enabled.
 */
export function requireFeature(key: string): boolean {
  return isFeatureEnabled(key);
}

/**
 * API route guard — returns 404 response if feature is disabled.
 * Usage: const blocked = featureGuard('campaigns'); if (blocked) return blocked;
 */
export function featureGuard(key: string): NextResponse | null {
  if (!isFeatureEnabled(key)) {
    return NextResponse.json(
      { error: 'Feature not available' },
      { status: 404 }
    );
  }
  return null;
}

/**
 * Higher-order function wrapping an API route handler with a feature flag check.
 */
export function withFeature(key: string) {
  return function <T extends (...args: unknown[]) => Promise<NextResponse>>(handler: T): T {
    return (async (...args: unknown[]) => {
      const blocked = featureGuard(key);
      if (blocked) return blocked;
      return handler(...args);
    }) as T;
  };
}

// Feature flag key constants
export const FLAGS = {
  BLOG: 'blog',
  CAREERS: 'careers',
  DEMOS: 'demos',
  VIDEOS: 'videos',
  SURVEY: 'survey',
  BOOKING: 'booking',
  CHATBOT: 'chatbot',
  WHATSAPP: 'whatsapp',
  SOCIAL_LINKS: 'social_links',
  CONTACT: 'contact',
  NEWSLETTER: 'newsletter',
  CAMPAIGNS: 'campaigns',
  CRM: 'crm',
  BROADCASTS: 'broadcasts',
  BANNERS: 'banners',
  MAINTENANCE: 'maintenance',
} as const;
