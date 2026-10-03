export function validateEnv() {
  const required = ['SESSION_SECRET'];
  if (process.env.NODE_ENV === 'production') {
    const missing = required.filter(k => !process.env[k]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}
