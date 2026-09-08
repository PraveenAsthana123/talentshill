import type { IntegrationProvider } from '../types';

export const slackProvider: IntegrationProvider = {
  key: 'slack',
  name: 'Slack',
  category: 'messaging',
  configSchema: { apiKey: { type: 'string', required: true } },
  async connect(config) {
    return { success: true, message: 'Slack connected successfully (stub)' };
  },
  async disconnect() {
    return { success: true };
  },
  async testConnection() {
    return { success: true, message: 'Slack connection is healthy (stub)' };
  },
  async getStatus() {
    return { connected: true };
  },
};
