import securityPlugin from 'eslint-plugin-security';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  // Security rules — applied globally
  {
    plugins: {
      security: securityPlugin,
    },
    rules: {
      ...securityPlugin.configs.recommended.rules,
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-possible-timing-attacks': 'error',
    },
  },
];

export default config;
