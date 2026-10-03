import type { IntegrationProvider } from '../types';

export const slackProvider: IntegrationProvider = {
  key: 'slack',
  name: 'Slack',
  category: 'messaging',
  configSchema: { apiKey: { type: 'string', required: true } },

  async connect(config) {
    const key = config?.apiKey?.trim();
    if (!key) {
      return { success: false, message: 'Slack requires a Bot User OAuth token (starts with xoxb-). Create a Slack app at api.slack.com and install it to your workspace.' };
    }
    if (!key.startsWith('xoxb-') && !key.startsWith('xoxp-')) {
      return { success: false, message: 'Invalid Slack token format. Bot tokens start with xoxb- and user tokens with xoxp-.' };
    }
    return { success: true, message: 'Slack token stored. Post a test message to verify the connection.' };
  },

  async disconnect() {
    return { success: true };
  },

  async testConnection() {
    return { success: false, message: 'Live Slack verification requires a valid Bot token and a real auth.test API call. Configure under Integrations → Slack.' };
  },

  async getStatus() {
    return { connected: false };
  },
};
