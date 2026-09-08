import { describe, it, expect } from 'vitest';

describe('Maintenance Module', () => {
  it('should export maintenance functions', async () => {
    const mod = await import('@/lib/ops/maintenance');
    expect(mod.getMaintenanceStatus).toBeDefined();
    expect(mod.setMaintenanceMode).toBeDefined();
    expect(mod.isMaintenanceMode).toBeDefined();
  });

  it('should return default maintenance status', async () => {
    const { getMaintenanceStatus } = await import('@/lib/ops/maintenance');
    const status = getMaintenanceStatus();
    expect(status).toHaveProperty('enabled');
    expect(status).toHaveProperty('message');
    expect(status).toHaveProperty('scheduledEnd');
    expect(typeof status.enabled).toBe('boolean');
  });
});
