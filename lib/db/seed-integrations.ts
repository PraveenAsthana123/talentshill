import { createIntegration, getIntegrationByKey } from './integration-queries';

const INTEGRATIONS = [
  { providerKey: 'whatsapp', name: 'WhatsApp', category: 'messaging', description: 'WhatsApp Business API integration' },
  { providerKey: 'slack', name: 'Slack', category: 'messaging', description: 'Slack workspace integration' },
  { providerKey: 'gmail', name: 'Gmail', category: 'messaging', description: 'Gmail SMTP/OAuth integration' },
  { providerKey: 'linkedin', name: 'LinkedIn', category: 'social', description: 'LinkedIn API integration' },
  { providerKey: 'facebook', name: 'Facebook', category: 'social', description: 'Facebook Graph API integration' },
  { providerKey: 'x', name: 'X (Twitter)', category: 'social', description: 'X/Twitter API integration' },
  { providerKey: 'instagram', name: 'Instagram', category: 'social', description: 'Instagram Graph API integration' },
  { providerKey: 'dropbox', name: 'Dropbox', category: 'productivity', description: 'Dropbox API integration' },
  { providerKey: 'quora', name: 'Quora', category: 'social', description: 'Quora API integration' },
  { providerKey: 'webhook', name: 'Webhook', category: 'webhook', description: 'Generic webhook integration' },
  { providerKey: 'database', name: 'Database', category: 'data', description: 'Generic database connector' },
];

export function seedIntegrations() {
  for (const integration of INTEGRATIONS) {
    const existing = getIntegrationByKey(integration.providerKey);
    if (!existing) {
      createIntegration(integration);
    }
  }
}

// Allow running directly
if (require.main === module) {
  seedIntegrations();
  console.log('Seeded 11 integration providers');
}
