import { describe, it, expect } from 'vitest';
import { getPrompt } from '../prompts';
import { TASK_CONFIGS } from '../taskRouter';

describe('promptTemplates', () => {
  const taskTypes = Object.keys(TASK_CONFIGS) as Parameters<typeof getPrompt>[0][];

  it('returns non-empty string for all defined task types except general_text', () => {
    for (const taskType of taskTypes) {
      if (taskType === 'general_text') continue;
      const prompt = getPrompt(taskType);
      expect(prompt.length).toBeGreaterThan(0);
    }
  });

  it('throws for unknown task type', () => {
    expect(() => getPrompt('unknown_type' as any)).toThrow('Unknown task type: unknown_type');
  });

  it('interpolates question into pdf_qa prompt', () => {
    const prompt = getPrompt('pdf_qa', { question: 'What is the total?' });
    expect(prompt).toContain('What is the total?');
  });

  it('interpolates tone into tone_rewriter prompt', () => {
    const prompt = getPrompt('tone_rewriter', { tone: 'professional' });
    expect(prompt).toContain('professional');
  });

  it('general_text returns empty string', () => {
    const prompt = getPrompt('general_text');
    expect(prompt).toBe('');
  });
});
