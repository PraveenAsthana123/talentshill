import type { IntegrationProvider } from '../types';

export const instagramProvider: IntegrationProvider = {
  key: 'instagram',
  name: 'Instagram',
  category: 'social',
  configSchema: { apiKey: { type: 'string', required: true } },

  async connect(config) {
    const key = config?.apiKey?.trim();
    if (!key) {
      return { success: false, message: 'Instagram requires a Facebook Page Access Token with instagram_basic and instagram_content_publish permissions.' };
    }
    return { success: true, message: 'Instagram token stored. Post a test image to verify the connection.' };
  },

  async disconnect() {
    return { success: true };
  },

  async testConnection() {
    return { success: false, message: 'Live Instagram verification requires a valid access token and a connected Facebook Page. Configure under Integrations → Instagram.' };
  },

  async getStatus() {
    return { connected: false };
  },
};
