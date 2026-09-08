export interface IntegrationProvider {
  key: string;
  name: string;
  category: 'messaging' | 'social' | 'productivity' | 'data' | 'webhook';
  configSchema: Record<string, unknown>;
  connect(config: Record<string, string>): Promise<{ success: boolean; message: string }>;
  disconnect(accountId: string): Promise<{ success: boolean }>;
  testConnection(accountId: string): Promise<{ success: boolean; message: string }>;
  sync?(accountId: string): Promise<{ success: boolean; syncedItems: number }>;
  getStatus(accountId: string): Promise<{ connected: boolean; lastSync?: string }>;
}
