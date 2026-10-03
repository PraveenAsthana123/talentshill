import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    // SQLite (better-sqlite3) is not safe for concurrent access from
    // multiple OS processes — parallel vitest workers all opening the
    // same file cause lock timeouts and OOM crashes.
    // singleFork serialises all test files inside one child process,
    // eliminating inter-worker contention without sacrificing test coverage.
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
