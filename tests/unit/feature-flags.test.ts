import { describe, it, expect } from 'vitest';

// Test feature flag cache logic
describe('Feature Flag Cache', () => {
  it('should export cache functions', async () => {
    const mod = await import('@/lib/feature-flags/cache');
    expect(mod.getEnabledFlags).toBeDefined();
    expect(mod.isFeatureEnabled).toBeDefined();
    expect(mod.bustCache).toBeDefined();
  });

  it('should export flag guard functions', async () => {
    const mod = await import('@/lib/feature-flags/guard');
    expect(mod.requireFeature).toBeDefined();
    expect(mod.featureGuard).toBeDefined();
    expect(mod.withFeature).toBeDefined();
    expect(mod.FLAGS).toBeDefined();
  });

  it('should have all expected flag keys', async () => {
    const { FLAGS } = await import('@/lib/feature-flags/guard');
    expect(FLAGS.BLOG).toBe('blog');
    expect(FLAGS.CAREERS).toBe('careers');
    expect(FLAGS.CAMPAIGNS).toBe('campaigns');
    expect(FLAGS.CRM).toBe('crm');
    expect(FLAGS.BROADCASTS).toBe('broadcasts');
    expect(FLAGS.BANNERS).toBe('banners');
    expect(FLAGS.MAINTENANCE).toBe('maintenance');
  });
});
