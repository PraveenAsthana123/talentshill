import type { IntegrationProvider } from '../types';

export const dropboxProvider: IntegrationProvider = {
  key: 'dropbox',
  name: 'Dropbox',
  category: 'productivity',
  configSchema: { apiKey: { type: 'string', required: true } },
  async connect(config) {
    return { success: true, message: 'Dropbox connected successfully (stub)' };
  },
  async disconnect() {
    return { success: true };
  },
  async testConnection() {
    return { success: true, message: 'Dropbox connection is healthy (stub)' };
  },
  async getStatus() {
    return { connected: true };
  },
};
