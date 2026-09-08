import type { IntegrationProvider } from '../types';

export const quoraProvider: IntegrationProvider = {
  key: 'quora',
  name: 'Quora',
  category: 'social',
  configSchema: { apiKey: { type: 'string', required: true } },
  async connect(config) {
    return { success: true, message: 'Quora connected successfully (stub)' };
  },
  async disconnect() {
    return { success: true };
  },
  async testConnection() {
    return { success: true, message: 'Quora connection is healthy (stub)' };
  },
  async getStatus() {
    return { connected: true };
  },
};
