import type { IntegrationProvider } from '../types';

export const instagramProvider: IntegrationProvider = {
  key: 'instagram',
  name: 'Instagram',
  category: 'social',
  configSchema: { apiKey: { type: 'string', required: true } },
  async connect(config) {
    return { success: true, message: 'Instagram connected successfully (stub)' };
  },
  async disconnect() {
    return { success: true };
  },
  async testConnection() {
    return { success: true, message: 'Instagram connection is healthy (stub)' };
  },
  async getStatus() {
    return { connected: true };
  },
};
