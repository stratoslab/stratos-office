import { describe, it, expect } from 'vitest';
import { getPipelineTemplate, getAllPipelineTemplates, BUILTIN_PIPELINES } from '../pipelineTemplates';
import { buildTaskMessages, getTaskConfig, TASK_CONFIGS } from '../taskRouter';
import { render, screen } from '@testing-library/react';
import {
  FinancialDataTable,
  RiskLevelBadge,
  TranscriptPanel,
  MeetingMinutesDisplay,
  EmailDraftDisplay,
  CodeReviewIssues,
  SearchResultList,
  PainPointsList,
} from '../components/pipelines/PipelineOutputHelpers';

describe('pipeline templates', () => {
  it('has exactly 8 built-in pipelines', () => {
    expect(BUILTIN_PIPELINES.length).toBe(8);
  });

  it('all pipeline IDs are unique', () => {
    const ids = BUILTIN_PIPELINES.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getPipelineTemplate returns correct template by id', () => {
    const template = getPipelineTemplate('due-diligence');
    expect(template).toBeDefined();
    expect(template?.name).toBe('Due Diligence Engine');
    expect(template?.steps.length).toBe(4);
  });

  it('getPipelineTemplate returns undefined for unknown id', () => {
    expect(getPipelineTemplate('nonexistent')).toBeUndefined();
  });

  it('getAllPipelineTemplates returns all templates', () => {
    const all = getAllPipelineTemplates();
    expect(all.length).toBe(8);
    expect(all.map(t => t.id)).toContain('meeting-intelligence');
    expect(all.map(t => t.id)).toContain('customer-intelligence');
  });

  it('each pipeline has at least 2 steps', () => {
    for (const pipeline of BUILTIN_PIPELINES) {
      expect(pipeline.steps.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('each pipeline has expected inputs defined', () => {
    for (const pipeline of BUILTIN_PIPELINES) {
      expect(pipeline.expectedInputs.length).toBeGreaterThan(0);
    }
  });

  it('each step has a valid taskType', () => {
    for (const pipeline of BUILTIN_PIPELINES) {
      for (const step of pipeline.steps) {
        expect(TASK_CONFIGS[step.taskType]).toBeDefined();
      }
    }
  });

  it('each step has a label', () => {
    for (const pipeline of BUILTIN_PIPELINES) {
      for (const step of pipeline.steps) {
        expect(step.label).toBeDefined();
        expect(step.label.length).toBeGreaterThan(0);
      }
    }
  });

  it('due-diligence pipeline has correct step chain', () => {
    const template = getPipelineTemplate('due-diligence')!;
    expect(template.steps[0].taskType).toBe('financial_parser');
    expect(template.steps[1].taskType).toBe('contract_analyzer');
    expect(template.steps[2].taskType).toBe('legal_analyzer');
    expect(template.steps[3].taskType).toBe('report_generator');
  });

  it('meeting-intelligence pipeline has correct step chain', () => {
    const template = getPipelineTemplate('meeting-intelligence')!;
    expect(template.steps[0].taskType).toBe('transcription');
    expect(template.steps[1].taskType).toBe('meeting_minutes');
    expect(template.steps[2].taskType).toBe('email_draft');
    expect(template.steps[3].taskType).toBe('meeting_prep');
  });

  it('product-discovery pipeline has correct step chain', () => {
    const template = getPipelineTemplate('product-discovery')!;
    expect(template.steps[0].taskType).toBe('whiteboard_ocr');
    expect(template.steps[1].taskType).toBe('wireframe_to_html');
    expect(template.steps[2].taskType).toBe('screen_analysis');
    expect(template.steps[3].taskType).toBe('report_generator');
  });

  it('compliance-auditor pipeline has correct step chain', () => {
    const template = getPipelineTemplate('compliance-auditor')!;
    expect(template.steps[0].taskType).toBe('contract_analyzer');
    expect(template.steps[1].taskType).toBe('legal_analyzer');
    expect(template.steps[2].taskType).toBe('medical_summarizer');
    expect(template.steps[3].taskType).toBe('report_generator');
  });

  it('research-synthesis pipeline has correct step chain', () => {
    const template = getPipelineTemplate('research-synthesis')!;
    expect(template.steps[0].taskType).toBe('research');
    expect(template.steps[1].taskType).toBe('deep_doc_qa');
    expect(template.steps[2].taskType).toBe('chart_extract');
    expect(template.steps[3].taskType).toBe('report_generator');
  });

  it('negotiation-prep pipeline has correct step chain', () => {
    const template = getPipelineTemplate('negotiation-prep')!;
    expect(template.steps[0].taskType).toBe('contract_analyzer');
    expect(template.steps[1].taskType).toBe('transcription');
    expect(template.steps[2].taskType).toBe('tone_rewriter');
    expect(template.steps[3].taskType).toBe('email_draft');
  });

  it('incident-response pipeline has correct step chain', () => {
    const template = getPipelineTemplate('incident-response')!;
    expect(template.steps[0].taskType).toBe('screen_analysis');
    expect(template.steps[1].taskType).toBe('code_review');
    expect(template.steps[2].taskType).toBe('report_generator');
    expect(template.steps[3].taskType).toBe('email_draft');
  });

  it('customer-intelligence pipeline has correct step chain', () => {
    const template = getPipelineTemplate('customer-intelligence')!;
    expect(template.steps[0].taskType).toBe('transcription');
    expect(template.steps[1].taskType).toBe('summarize');
    expect(template.steps[2].taskType).toBe('tone_rewriter');
    expect(template.steps[3].taskType).toBe('email_reply');
  });
});

describe('pipeline input mappings', () => {
  it('due-diligence uses file mapping for first step', () => {
    const template = getPipelineTemplate('due-diligence')!;
    expect(template.steps[0].inputMapping.type).toBe('file');
  });

  it('due-diligence chains raw_output between steps', () => {
    const template = getPipelineTemplate('due-diligence')!;
    expect(template.steps[1].inputMapping.type).toBe('raw_output');
    expect(template.steps[2].inputMapping.type).toBe('combined');
    expect(template.steps[3].inputMapping.type).toBe('raw_output');
  });

  it('meeting-intelligence chains raw_output between all steps', () => {
    const template = getPipelineTemplate('meeting-intelligence')!;
    for (const step of template.steps) {
      expect(step.inputMapping.type).toBe('raw_output');
    }
  });

  it('product-discovery uses file mapping for image-based steps', () => {
    const template = getPipelineTemplate('product-discovery')!;
    expect(template.steps[0].inputMapping.type).toBe('file');
    expect(template.steps[1].inputMapping.type).toBe('file');
    expect(template.steps[2].inputMapping.type).toBe('file');
  });

  it('research-synthesis uses text mapping for first step', () => {
    const template = getPipelineTemplate('research-synthesis')!;
    expect(template.steps[0].inputMapping.type).toBe('text');
  });
});

describe('buildTaskMessages with pipelineContext', () => {
  it('resolves step output placeholders in system prompt', () => {
    const previousOutputs = [
      { text: 'Revenue: $1M', parsed: { revenue: 1000000 } },
      { text: 'Low risk contract', parsed: undefined },
    ];

    const messages = buildTaskMessages('report_generator', { text: 'Generate report' }, {
      pipelineContext: { previousOutputs, currentStepIndex: 2 },
    });

    expect(messages.length).toBeGreaterThan(0);
    const systemMessage = messages.find(m => m.role === 'system');
    expect(systemMessage).toBeDefined();
    expect(typeof systemMessage!.content).toBe('string');
    const systemContent = systemMessage!.content as string;
    expect(systemContent).not.toContain('{step_');
  });

  it('resolves step parsed placeholders when parsed output exists', () => {
    const previousOutputs = [
      { text: 'Financial data', parsed: { revenue: 1000000, expenses: 500000 } },
    ];

    const messages = buildTaskMessages('report_generator', { text: 'Summary' }, {
      pipelineContext: { previousOutputs, currentStepIndex: 1 },
    });

    const systemContent = messages.find(m => m.role === 'system')!.content as string;
    expect(systemContent).not.toContain('{step_1_parsed}');
  });

  it('handles empty pipelineContext', () => {
    const messages = buildTaskMessages('general_text', { text: 'Hello' }, {
      pipelineContext: { previousOutputs: [], currentStepIndex: 0 },
    });

    expect(messages.length).toBeGreaterThan(0);
  });

  it('includes user content for text-only tasks', () => {
    const messages = buildTaskMessages('summarize', { text: 'Long text to summarize' }, {
      pipelineContext: { previousOutputs: [], currentStepIndex: 0 },
    });

    const userMessage = messages.find(m => m.role === 'user');
    expect(userMessage).toBeDefined();
    expect(userMessage!.content).toBe('Long text to summarize');
  });

  it('includes image data for image-requiring tasks', () => {
    const messages = buildTaskMessages('screen_analysis', {
      imageDataUrl: 'data:image/png;base64,abc',
    });

    const userMessage = messages.find(m => m.role === 'user');
    expect(userMessage).toBeDefined();
    expect(Array.isArray(userMessage!.content)).toBe(true);
    const parts = userMessage!.content as Array<{ type: string }>;
    expect(parts.some(p => p.type === 'image')).toBe(true);
  });
});

describe('pipeline task configs', () => {
  it('all pipeline step tasks have valid configs', () => {
    for (const pipeline of BUILTIN_PIPELINES) {
      for (const step of pipeline.steps) {
        const config = getTaskConfig(step.taskType);
        expect(config).toBeDefined();
        expect(config.taskType).toBe(step.taskType);
        expect(config.max_new_tokens).toBeGreaterThan(0);
      }
    }
  });

  it('research step has correct config', () => {
    const config = getTaskConfig('research');
    expect(config.requiresText).toBe(true);
    expect(config.outputFormat).toBe('markdown');
  });

  it('financial_parser requires privacy notice', () => {
    const config = getTaskConfig('financial_parser');
    expect(config.requiresPrivacyNotice).toBe(true);
    expect(config.requiresDisclaimer).toBe(true);
  });

  it('legal_analyzer requires privacy notice', () => {
    const config = getTaskConfig('legal_analyzer');
    expect(config.requiresPrivacyNotice).toBe(true);
    expect(config.requiresDisclaimer).toBe(true);
  });

  it('medical_summarizer requires privacy notice', () => {
    const config = getTaskConfig('medical_summarizer');
    expect(config.requiresPrivacyNotice).toBe(true);
    expect(config.requiresDisclaimer).toBe(true);
  });
});

describe('FinancialDataTable', () => {
  it('renders vendor and line items', () => {
    const data = {
      vendor: 'Acme Corp',
      date: '2025-01-15',
      total: 1500000,
      currency: 'USD',
      tax: 150000,
      line_items: [
        { description: 'Revenue', quantity: 1, unit_price: 1000000, total: 1000000 },
        { description: 'Expenses', quantity: 1, unit_price: 500000, total: 500000 },
      ],
    };

    render(<FinancialDataTable data={data} />);
    expect(screen.getByText('Acme Corp')).toBeTruthy();
    expect(screen.getByText('Revenue')).toBeTruthy();
    expect(screen.getByText('Expenses')).toBeTruthy();
  });

  it('renders null for non-object data', () => {
    const { container } = render(<FinancialDataTable data="No financial data" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null for null data', () => {
    const { container } = render(<FinancialDataTable data={null} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('RiskLevelBadge', () => {
  it('renders low risk badge', () => {
    render(<RiskLevelBadge level="low" />);
    expect(screen.getByText('Low')).toBeTruthy();
  });

  it('renders medium risk badge', () => {
    render(<RiskLevelBadge level="medium" />);
    expect(screen.getByText('Medium')).toBeTruthy();
  });

  it('renders high risk badge', () => {
    render(<RiskLevelBadge level="high" />);
    expect(screen.getByText('High')).toBeTruthy();
  });
});

describe('TranscriptPanel', () => {
  it('renders transcript text', () => {
    const text = 'Speaker 1: Hello\nSpeaker 2: Hi there';
    render(<TranscriptPanel text={text} />);
    expect(screen.getByText(/Speaker 1: Hello/)).toBeTruthy();
    expect(screen.getByText(/Speaker 2: Hi there/)).toBeTruthy();
  });
});

describe('MeetingMinutesDisplay', () => {
  it('renders structured minutes', () => {
    const data = {
      meeting_title: 'Q4 Planning',
      date: '2025-01-15',
      attendees: ['Alice', 'Bob'],
      action_items: [
        { task: 'Update roadmap', owner: 'Alice', due_date: '2025-02-01' },
        { task: 'Review budget', owner: 'Bob', due_date: '2025-01-30' },
      ],
    };

    render(<MeetingMinutesDisplay data={data} />);
    expect(screen.getByText('Q4 Planning')).toBeTruthy();
    expect(screen.getByText('Alice, Bob')).toBeTruthy();
    expect(screen.getByText('Update roadmap')).toBeTruthy();
    expect(screen.getByText('Review budget')).toBeTruthy();
  });

  it('renders markdown fallback for non-object data', () => {
    render(<MeetingMinutesDisplay data="No minutes available" />);
    expect(screen.getByText('No minutes available')).toBeTruthy();
  });
});

describe('EmailDraftDisplay', () => {
  it('renders email with subject, to, body', () => {
    const data = {
      subject: 'Follow-up from meeting',
      to: 'team@acme.com',
      tone: 'Professional',
      body: 'Thanks for attending...',
    };

    render(<EmailDraftDisplay data={data} />);
    expect(screen.getByText('Follow-up from meeting')).toBeTruthy();
    expect(screen.getByText('team@acme.com')).toBeTruthy();
    expect(screen.getByText('Thanks for attending...')).toBeTruthy();
  });

  it('renders markdown fallback for non-object data', () => {
    render(<EmailDraftDisplay data="No email draft" />);
    expect(screen.getByText('No email draft')).toBeTruthy();
  });
});

describe('CodeReviewIssues', () => {
  it('renders issues sorted by severity', () => {
    const data = {
      overall_assessment: 'Code needs attention',
      issues: [
        { severity: 'critical', description: 'SQL injection vulnerability', suggested_fix: 'Use parameterized queries', line_reference: 'line 42' },
        { severity: 'warning', description: 'Unused variable', suggested_fix: 'Remove it', line_reference: 'line 15' },
        { severity: 'suggestion', description: 'Consider using const', suggested_fix: 'Change let to const', line_reference: 'line 8' },
      ],
    };

    render(<CodeReviewIssues data={data} />);
    expect(screen.getByText('SQL injection vulnerability')).toBeTruthy();
    expect(screen.getByText('Unused variable')).toBeTruthy();
    expect(screen.getByText('Consider using const')).toBeTruthy();
    expect(screen.getByText('CRITICAL')).toBeTruthy();
    expect(screen.getByText('WARNING')).toBeTruthy();
  });

  it('renders null for data without issues array', () => {
    const { container } = render(<CodeReviewIssues data={{}} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('SearchResultList', () => {
  it('renders search results', () => {
    const data = [
      { title: 'AI Research Paper', url: 'https://example.com/paper', snippet: 'This paper discusses...' },
      { title: 'Machine Learning Guide', url: 'https://example.com/guide', snippet: 'A comprehensive guide...' },
    ];

    render(<SearchResultList data={data} />);
    expect(screen.getByText('AI Research Paper')).toBeTruthy();
    expect(screen.getByText('Machine Learning Guide')).toBeTruthy();
  });

  it('renders null for non-array data', () => {
    const { container } = render(<SearchResultList data={null} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('PainPointsList', () => {
  it('renders bullet point pain points', () => {
    const text = '- Slow response times\n- Confusing UI\n- Missing documentation';

    render(<PainPointsList text={text} />);
    expect(screen.getByText('Slow response times')).toBeTruthy();
    expect(screen.getByText('Confusing UI')).toBeTruthy();
    expect(screen.getByText('Missing documentation')).toBeTruthy();
  });

  it('falls back to markdown for non-list text', () => {
    const text = 'No specific pain points identified';

    render(<PainPointsList text={text} />);
    expect(screen.getByText('No specific pain points identified')).toBeTruthy();
  });
});
