import type { IntegrationProvider } from '../types';

export const xProvider: IntegrationProvider = {
  key: 'x',
  name: 'X (Twitter)',
  category: 'social',
  configSchema: { apiKey: { type: 'string', required: true } },

  async connect(config) {
    const key = config?.apiKey?.trim();
    if (!key) {
      return { success: false, message: 'X (Twitter) requires a Bearer Token and OAuth 2.0 credentials from developer.twitter.com. Apply for API access if not already approved.' };
    }
    return { success: true, message: 'X credentials stored. Post a test tweet to verify the connection.' };
  },

  async disconnect() {
    return { success: true };
  },

  async testConnection() {
    return { success: false, message: 'Live X verification requires valid OAuth credentials and a real API call. Configure under Integrations → X.' };
  },

  async getStatus() {
    return { connected: false };
  },
};
