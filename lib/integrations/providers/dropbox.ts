import type { IntegrationProvider } from '../types';

export const dropboxProvider: IntegrationProvider = {
  key: 'dropbox',
  name: 'Dropbox',
  category: 'productivity',
  configSchema: { apiKey: { type: 'string', required: true } },

  async connect(config) {
    const key = config?.apiKey?.trim();
    if (!key) {
      return { success: false, message: 'Dropbox requires an access token. Create a Dropbox app at dropbox.com/developers and generate an access token.' };
    }
    return { success: true, message: 'Dropbox token stored. List a folder to verify the connection.' };
  },

  async disconnect() {
    return { success: true };
  },

  async testConnection() {
    return { success: false, message: 'Live Dropbox verification requires a valid access token and an API call. Configure under Integrations → Dropbox.' };
  },

  async getStatus() {
    return { connected: false };
  },
};
