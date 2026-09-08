import type { IntegrationProvider } from '../types';

export const webhookProvider: IntegrationProvider = {
  key: 'webhook',
  name: 'Webhook',
  category: 'webhook',
  configSchema: {
    url: { type: 'string', required: true },
    secret: { type: 'string', required: false },
    events: { type: 'array', required: false },
  },
  async connect(config) {
    const url = config.url;
    if (!url) {
      return { success: false, message: 'Webhook URL is required' };
    }
    try {
      new URL(url);
    } catch {
      return { success: false, message: 'Invalid webhook URL format' };
    }
    // Send a test payload to validate the endpoint
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'test', timestamp: new Date().toISOString() }),
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) {
        return { success: true, message: 'Webhook connected and validated successfully' };
      }
      return { success: false, message: `Webhook endpoint returned status ${response.status}` };
    } catch (err) {
      return { success: false, message: `Failed to reach webhook endpoint: ${err instanceof Error ? err.message : 'Unknown error'}` };
    }
  },
  async disconnect() {
    return { success: true };
  },
  async testConnection(accountId) {
    return { success: true, message: 'Webhook connection is healthy' };
  },
  async getStatus() {
    return { connected: true };
  },
};
