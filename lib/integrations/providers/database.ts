import type { IntegrationProvider } from '../types';

export const databaseProvider: IntegrationProvider = {
  key: 'database',
  name: 'Database',
  category: 'data',
  configSchema: { apiKey: { type: 'string', required: true } },

  async connect(config) {
    const connectionString = config?.apiKey?.trim();
    if (!connectionString) {
      return { success: false, message: 'A PostgreSQL/MySQL connection string (DATABASE_URL) is required.' };
    }
    if (!connectionString.startsWith('postgres') && !connectionString.startsWith('mysql')) {
      return { success: false, message: 'Connection string must be a valid PostgreSQL (postgres://) or MySQL (mysql://) URL.' };
    }
    return { success: true, message: 'Connection string stored. A real connection test will run on the next query.' };
  },

  async disconnect() {
    return { success: true };
  },

  async testConnection() {
    return { success: false, message: 'Live database connection test requires a real connection string and a query execution. Configure under Integrations → Database.' };
  },

  async getStatus() {
    return { connected: false };
  },
};
