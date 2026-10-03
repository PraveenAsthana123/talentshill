import type { IntegrationProvider } from '../types';

export const gmailProvider: IntegrationProvider = {
  key: 'gmail',
  name: 'Gmail',
  category: 'messaging',
  configSchema: { apiKey: { type: 'string', required: true } },

  async connect(config) {
    const key = config?.apiKey?.trim();
    if (!key) {
      return { success: false, message: 'Gmail requires a Google OAuth refresh token. Complete the Google OAuth consent flow to generate one.' };
    }
    return { success: true, message: 'Gmail token stored. Send a test email to verify the connection.' };
  },

  async disconnect() {
    return { success: true };
  },

  async testConnection() {
    return { success: false, message: 'Live Gmail verification requires a valid Google OAuth token. Complete setup under Integrations → Gmail.' };
  },

  async getStatus() {
    return { connected: false };
  },
};
