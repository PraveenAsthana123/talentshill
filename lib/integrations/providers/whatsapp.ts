import type { IntegrationProvider } from '../types';

export const whatsappProvider: IntegrationProvider = {
  key: 'whatsapp',
  name: 'WhatsApp',
  category: 'messaging',
  configSchema: { apiKey: { type: 'string', required: true } },
  async connect(config) {
    return { success: true, message: 'WhatsApp connected successfully (stub)' };
  },
  async disconnect() {
    return { success: true };
  },
  async testConnection() {
    return { success: true, message: 'WhatsApp connection is healthy (stub)' };
  },
  async getStatus() {
    return { connected: true };
  },
};
