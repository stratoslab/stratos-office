import { describe, it, expect } from 'vitest';

function generateExportFilename(taskType: string, format: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `stratos-${taskType}-${date}.${format}`;
}

describe('exportFilename', () => {
  const formats = ['txt', 'json', 'md', 'html'];
  const taskTypes = ['ocr', 'document_parse', 'transcription', 'email_draft', 'research'];

  it('matches expected pattern for all task types and formats', () => {
    const pattern = /^stratos-[a-z_]+-\d{4}-\d{2}-\d{2}\.[a-z]+$/;
    for (const taskType of taskTypes) {
      for (const format of formats) {
        const filename = generateExportFilename(taskType, format);
        expect(pattern.test(filename)).toBe(true);
      }
    }
  });

  it('uses correct date format', () => {
    const filename = generateExportFilename('ocr', 'txt');
    const datePart = filename.split('-').slice(2, 5).join('-').split('.')[0];
    expect(datePart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('uses correct extension', () => {
    expect(generateExportFilename('ocr', 'txt')).toMatch(/\.txt$/);
    expect(generateExportFilename('ocr', 'json')).toMatch(/\.json$/);
    expect(generateExportFilename('ocr', 'md')).toMatch(/\.md$/);
    expect(generateExportFilename('ocr', 'html')).toMatch(/\.html$/);
  });
});
