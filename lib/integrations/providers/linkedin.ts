import type { IntegrationProvider } from '../types';

export const linkedinProvider: IntegrationProvider = {
  key: 'linkedin',
  name: 'LinkedIn',
  category: 'social',
  configSchema: { apiKey: { type: 'string', required: true } },
  async connect(config) {
    return { success: true, message: 'LinkedIn connected successfully (stub)' };
  },
  async disconnect() {
    return { success: true };
  },
  async testConnection() {
    return { success: true, message: 'LinkedIn connection is healthy (stub)' };
  },
  async getStatus() {
    return { connected: true };
  },
};
