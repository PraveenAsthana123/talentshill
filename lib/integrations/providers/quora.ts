import type { IntegrationProvider } from '../types';

export const quoraProvider: IntegrationProvider = {
  key: 'quora',
  name: 'Quora',
  category: 'social',
  configSchema: { apiKey: { type: 'string', required: true } },

  async connect(config) {
    const key = config?.apiKey?.trim();
    if (!key) {
      return { success: false, message: 'Quora Ads API access requires approval from Quora. Apply at quora.com/business/ads-api.' };
    }
    return { success: true, message: 'Quora credentials stored. Fetch campaigns to verify the connection.' };
  },

  async disconnect() {
    return { success: true };
  },

  async testConnection() {
    return { success: false, message: 'Live Quora verification requires an approved API token. Configure under Integrations → Quora.' };
  },

  async getStatus() {
    return { connected: false };
  },
};
