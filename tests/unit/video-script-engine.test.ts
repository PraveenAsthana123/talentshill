import { describe, it, expect } from 'vitest';
import { buildScriptPrompt } from '@/lib/video/video-script-engine';

describe('buildScriptPrompt', () => {
  it('includes the real topic and platform in the prompt (positive case)', () => {
    const prompt = buildScriptPrompt('AI in banking compliance', 'linkedin');
    expect(prompt).toContain('AI in banking compliance');
    expect(prompt).toContain('linkedin');
  });

  it('requests a bounded length so output stays short-form (consistency)', () => {
    expect(buildScriptPrompt('x', 'tiktok')).toMatch(/150 words/);
  });
});
