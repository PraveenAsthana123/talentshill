import type { IntegrationProvider } from '../types';

export const gmailProvider: IntegrationProvider = {
  key: 'gmail',
  name: 'Gmail',
  category: 'messaging',
  configSchema: { apiKey: { type: 'string', required: true } },
  async connect(config) {
    return { success: true, message: 'Gmail connected successfully (stub)' };
  },
  async disconnect() {
    return { success: true };
  },
  async testConnection() {
    return { success: true, message: 'Gmail connection is healthy (stub)' };
  },
  async getStatus() {
    return { connected: true };
  },
};
