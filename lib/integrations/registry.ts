import type { IntegrationProvider } from './types';
import { gmailProvider } from './providers/gmail';
import { slackProvider } from './providers/slack';
import { whatsappProvider } from './providers/whatsapp';
import { linkedinProvider } from './providers/linkedin';
import { facebookProvider } from './providers/facebook';
import { xProvider } from './providers/x';
import { instagramProvider } from './providers/instagram';
import { quoraProvider } from './providers/quora';
import { dropboxProvider } from './providers/dropbox';
import { databaseProvider } from './providers/database';
import { webhookProvider } from './providers/webhook';

class ProviderRegistry {
  private providers = new Map<string, IntegrationProvider>();

  register(provider: IntegrationProvider) {
    this.providers.set(provider.key, provider);
  }

  get(key: string): IntegrationProvider | undefined {
    return this.providers.get(key);
  }

  list(): IntegrationProvider[] {
    return Array.from(this.providers.values());
  }

  getByCategory(category: string): IntegrationProvider[] {
    return this.list().filter(p => p.category === category);
  }
}

export const registry = new ProviderRegistry();

// Register all providers
registry.register(gmailProvider);
registry.register(slackProvider);
registry.register(whatsappProvider);
registry.register(linkedinProvider);
registry.register(facebookProvider);
registry.register(xProvider);
registry.register(instagramProvider);
registry.register(quoraProvider);
registry.register(dropboxProvider);
registry.register(databaseProvider);
registry.register(webhookProvider);
