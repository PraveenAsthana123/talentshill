import type { IntegrationProvider } from '../types';

export const linkedinProvider: IntegrationProvider = {
  key: 'linkedin',
  name: 'LinkedIn',
  category: 'social',
  configSchema: { apiKey: { type: 'string', required: true } },

  async connect(config) {
    const key = config?.apiKey?.trim();
    if (!key) {
      return { success: false, message: 'LinkedIn requires an OAuth access token from the LinkedIn Developer Portal. Complete the OAuth flow first.' };
    }
    return { success: true, message: 'LinkedIn token stored. Send a test post to verify the connection.' };
  },

  async disconnect() {
    return { success: true };
  },

  async testConnection() {
    return { success: false, message: 'Live LinkedIn verification requires a valid OAuth token and API call. Configure your LinkedIn app credentials first.' };
  },

  async getStatus() {
    return { connected: false };
  },
};
