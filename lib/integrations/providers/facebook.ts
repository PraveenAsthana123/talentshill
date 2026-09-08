import type { IntegrationProvider } from '../types';

export const facebookProvider: IntegrationProvider = {
  key: 'facebook',
  name: 'Facebook',
  category: 'social',
  configSchema: { apiKey: { type: 'string', required: true } },
  async connect(config) {
    return { success: true, message: 'Facebook connected successfully (stub)' };
  },
  async disconnect() {
    return { success: true };
  },
  async testConnection() {
    return { success: true, message: 'Facebook connection is healthy (stub)' };
  },
  async getStatus() {
    return { connected: true };
  },
};
