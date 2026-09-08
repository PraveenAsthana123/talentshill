import type { IntegrationProvider } from '../types';

export const databaseProvider: IntegrationProvider = {
  key: 'database',
  name: 'Database',
  category: 'data',
  configSchema: { apiKey: { type: 'string', required: true } },
  async connect(config) {
    return { success: true, message: 'Database connected successfully (stub)' };
  },
  async disconnect() {
    return { success: true };
  },
  async testConnection() {
    return { success: true, message: 'Database connection is healthy (stub)' };
  },
  async getStatus() {
    return { connected: true };
  },
};
