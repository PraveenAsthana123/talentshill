import { describe, it, expect } from 'vitest';

describe('Template Renderer', () => {
  it('should export render functions', async () => {
    const mod = await import('@/lib/db/template-queries');
    expect(mod.renderTemplate).toBeDefined();
  });

  it('should replace template variables', async () => {
    const { renderTemplate } = await import('@/lib/db/template-queries');
    const result = renderTemplate('Hello {{name}}, welcome to {{company}}!', {
      name: 'John',
      company: 'TalentsHill',
    });
    expect(result).toBe('Hello John, welcome to TalentsHill!');
  });

  it('should handle missing variables gracefully', async () => {
    const { renderTemplate } = await import('@/lib/db/template-queries');
    const result = renderTemplate('Hello {{name}}, your role is {{role}}', {
      name: 'Jane',
    });
    expect(result).toBe('Hello Jane, your role is {{role}}');
  });

  it('should handle empty variables object', async () => {
    const { renderTemplate } = await import('@/lib/db/template-queries');
    const result = renderTemplate('No vars here', {});
    expect(result).toBe('No vars here');
  });

  it('should replace multiple occurrences of same variable', async () => {
    const { renderTemplate } = await import('@/lib/db/template-queries');
    const result = renderTemplate('{{name}} is {{name}}', { name: 'Test' });
    expect(result).toBe('Test is Test');
  });
});
