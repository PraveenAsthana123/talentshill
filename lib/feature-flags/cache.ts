import { getEnabledFlagKeys } from '@/lib/db/feature-flag-queries';

const CACHE_TTL_MS = 60_000; // 60 seconds

let cachedFlags: Set<string> | null = null;
let cacheTimestamp = 0;

function refreshCache(): Set<string> {
  const keys = getEnabledFlagKeys();
  cachedFlags = new Set(keys);
  cacheTimestamp = Date.now();
  return cachedFlags;
}

export function getEnabledFlags(): Set<string> {
  if (!cachedFlags || Date.now() - cacheTimestamp > CACHE_TTL_MS) {
    return refreshCache();
  }
  return cachedFlags;
}

export function isFeatureEnabled(key: string): boolean {
  return getEnabledFlags().has(key);
}

export function bustCache(): void {
  cachedFlags = null;
  cacheTimestamp = 0;
}
