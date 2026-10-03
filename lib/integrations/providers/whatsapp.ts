import type { IntegrationProvider } from '../types';

/**
 * WhatsApp Business API provider.
 * Requires a valid API key from a WhatsApp Business Solution Provider
 * (e.g. Twilio, 360dialog, or Meta Cloud API direct).
 * Returns honest failure when no key is configured — never silently succeeds.
 */
export const whatsappProvider: IntegrationProvider = {
  key: 'whatsapp',
  name: 'WhatsApp',
  category: 'messaging',
  configSchema: { apiKey: { type: 'string', required: true } },

  async connect(config) {
    const key = (config as Record<string, string>)?.apiKey?.trim();
    if (!key) {
      return { success: false, message: 'WhatsApp API key is required. Obtain one from a WhatsApp Business Solution Provider (Twilio, 360dialog, or Meta Cloud API).' };
    }
    // Validate that the key looks plausible before storing
    if (key.length < 20) {
      return { success: false, message: 'WhatsApp API key appears invalid (too short). Check your BSP dashboard for the correct key.' };
    }
    // Real validation would call the BSP health endpoint here.
    // Stored as configured — actual send will fail if the key is wrong.
    return { success: true, message: 'WhatsApp API key stored. Send a test message to verify the connection.' };
  },

  async disconnect() {
    return { success: true };
  },

  async testConnection() {
    // Without a live BSP call we cannot verify connectivity — report honestly.
    return {
      success: false,
      message: 'Live connection test requires a WhatsApp Business Solution Provider account and a real API key. Configure one under Integrations → WhatsApp.',
    };
  },

  async getStatus() {
    // Status is unknown without a stored, verified token — never report connected by default.
    return { connected: false };
  },
};
