import type { IntegrationProvider } from '../types';

export const facebookProvider: IntegrationProvider = {
  key: 'facebook',
  name: 'Facebook',
  category: 'social',
  configSchema: { apiKey: { type: 'string', required: true } },

  async connect(config) {
    const key = config?.apiKey?.trim();
    if (!key) {
      return { success: false, message: 'Facebook requires a Page Access Token. Complete the Facebook Login OAuth flow and grant pages_manage_posts permission.' };
    }
    return { success: true, message: 'Facebook token stored. Post a test update to verify the connection.' };
  },

  async disconnect() {
    return { success: true };
  },

  async testConnection() {
    return { success: false, message: 'Live Facebook verification requires a valid Page Access Token. Configure under Integrations → Facebook.' };
  },

  async getStatus() {
    return { connected: false };
  },
};
