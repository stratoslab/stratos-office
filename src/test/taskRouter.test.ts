import { describe, it, expect } from 'vitest';
import { getTaskConfig, getTokenBudget, TASK_CONFIGS, buildTaskMessages } from '../taskRouter';

describe('taskRouter', () => {
  it('returns correct config for each task type', () => {
    const config = getTaskConfig('ocr');
    expect(config.taskType).toBe('ocr');
    expect(config.category).toBe('documents');
    expect(config.requiresImage).toBe(true);
    expect(config.max_new_tokens).toBe(512);
  });

  it('token budget is within valid range for all tasks', () => {
    for (const taskType of Object.keys(TASK_CONFIGS)) {
      const budget = getTokenBudget(taskType as any);
      expect(budget).toBeGreaterThan(0);
      expect(budget).toBeLessThanOrEqual(2048);
    }
  });

  it('thinking mode is enabled by default for correct tasks', () => {
    expect(TASK_CONFIGS.contract_analyzer.enableThinkingByDefault).toBe(true);
    expect(TASK_CONFIGS.redline_comparison.enableThinkingByDefault).toBe(true);
    expect(TASK_CONFIGS.code_review.enableThinkingByDefault).toBe(true);
    expect(TASK_CONFIGS.legal_analyzer.enableThinkingByDefault).toBe(true);
  });

  it('two-pass pipeline is set for correct tasks', () => {
    expect(TASK_CONFIGS.meeting_minutes.twoPassPipeline).toBe(true);
    expect(TASK_CONFIGS.voice_to_email.twoPassPipeline).toBe(true);
    expect(TASK_CONFIGS.ocr.twoPassPipeline).toBe(false);
  });

  it('privacy notice is required for privacy tasks', () => {
    expect(TASK_CONFIGS.medical_summarizer.requiresPrivacyNotice).toBe(true);
    expect(TASK_CONFIGS.legal_analyzer.requiresPrivacyNotice).toBe(true);
    expect(TASK_CONFIGS.financial_parser.requiresPrivacyNotice).toBe(true);
  });

  it('buildTaskMessages assembles correct messages for text task', () => {
    const messages = buildTaskMessages('general_text', { text: 'Hello world' });
    expect(messages.length).toBe(2);
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toBe('Hello world');
  });

  it('buildTaskMessages assembles correct messages for image task', () => {
    const messages = buildTaskMessages('ocr', { imageDataUrl: 'data:image/png;base64,abc' });
    expect(messages.length).toBe(2);
    expect(messages[0].role).toBe('system');
    expect(Array.isArray(messages[1].content)).toBe(true);
  });
});
