import { describe, it, expect } from 'vitest';
import { parseJSON, extractText, markdownTableToJSON, jsonToMarkdownTable } from '../outputParser';

describe('outputParser', () => {
  describe('parseJSON', () => {
    it('parses plain JSON object', () => {
      const result = parseJSON('{"a": 1, "b": "hello"}');
      expect(result).toEqual({ a: 1, b: 'hello' });
    });

    it('parses plain JSON array', () => {
      const result = parseJSON('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it('extracts JSON from fenced code block', () => {
      const input = '```json\n{"key": "value"}\n```';
      const result = parseJSON(input);
      expect(result).toEqual({ key: 'value' });
    });

    it('uses first JSON fence if multiple present', () => {
      const input = '```json\n{"first": true}\n```\n```json\n{"second": true}\n```';
      const result = parseJSON(input);
      expect(result).toEqual({ first: true });
    });

    it('strips think blocks before parsing', () => {
      const input = '<think>reasoning</think>\n{"result": 42}';
      const result = parseJSON(input);
      expect(result).toEqual({ result: 42 });
    });

    it('returns parse_failed on invalid JSON', () => {
      const result = parseJSON('not json');
      expect(result).toHaveProperty('error', 'parse_failed');
      expect(result).toHaveProperty('raw', 'not json');
    });

    it('returns parse_failed on empty string', () => {
      const result = parseJSON('');
      expect(result).toHaveProperty('error', 'parse_failed');
    });

    it('returns parse_failed on whitespace-only string', () => {
      const result = parseJSON('   ');
      expect(result).toHaveProperty('error', 'parse_failed');
    });

    it('returns parse_failed and does not throw on syntax error', () => {
      expect(() => parseJSON('{invalid}')).not.toThrow();
      const result = parseJSON('{invalid}');
      expect(result).toHaveProperty('error', 'parse_failed');
    });

    it('finds JSON starting from first brace', () => {
      const input = 'Here is the result: {"status": "ok"}';
      const result = parseJSON(input);
      expect(result).toEqual({ status: 'ok' });
    });

    it('finds JSON array starting from first bracket', () => {
      const input = 'Results: [1, 2, 3]';
      const result = parseJSON(input);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('extractText', () => {
    it('removes think blocks', () => {
      const result = extractText('<think>hidden</think>\nvisible text');
      expect(result).toBe('visible text');
    });

    it('removes fenced code blocks', () => {
      const result = extractText('```python\nprint("hi")\n```');
      expect(result).toBe('print("hi")');
    });

    it('trims whitespace', () => {
      const result = extractText('  hello  ');
      expect(result).toBe('hello');
    });

    it('returns empty string if result is empty after stripping', () => {
      const result = extractText('<think>only</think>');
      expect(result).toBe('');
    });

    it('is idempotent', () => {
      const input = '<think>think</think>\n```code\nbody\n```';
      const first = extractText(input);
      const second = extractText(first);
      expect(first).toBe(second);
    });
  });

  describe('markdownTableToJSON', () => {
    it('parses a valid table', () => {
      const table = '| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |';
      const result = markdownTableToJSON(table);
      expect(result).toEqual([
        { Name: 'Alice', Age: '30' },
        { Name: 'Bob', Age: '25' },
      ]);
    });

    it('returns error on invalid table', () => {
      const result = markdownTableToJSON('not a table');
      expect(result).toHaveProperty('error', 'parse_failed');
    });

    it('returns error on missing separator row', () => {
      const table = '| Name | Age |\n| Alice | 30 |';
      const result = markdownTableToJSON(table);
      expect(result).toHaveProperty('error', 'parse_failed');
    });
  });

  describe('jsonToMarkdownTable', () => {
    it('converts JSON to table', () => {
      const rows = [{ Name: 'Alice', Age: '30' }, { Name: 'Bob', Age: '25' }];
      const result = jsonToMarkdownTable(rows);
      expect(result).toContain('| Name | Age |');
      expect(result).toContain('| --- | --- |');
      expect(result).toContain('| Alice | 30 |');
    });

    it('returns error on empty array', () => {
      const result = jsonToMarkdownTable([]);
      expect(result).toHaveProperty('error', 'parse_failed');
    });

    it('returns error on inconsistent keys', () => {
      const rows = [{ a: '1' }, { b: '2' }];
      const result = jsonToMarkdownTable(rows);
      expect(result).toHaveProperty('error', 'parse_failed');
    });
  });

  describe('round-trip properties', () => {
    it('parseJSON(JSON.stringify(obj)) deep-equals obj', () => {
      const obj = { a: 1, b: 'hello', c: [1, 2, 3], d: { nested: true } };
      const result = parseJSON(JSON.stringify(obj));
      expect(result).toEqual(obj);
    });

    it('parseJSON extracts from fenced JSON correctly', () => {
      const obj = { x: 42, y: 'test' };
      const fenced = '```json\n' + JSON.stringify(obj) + '\n```';
      const result = parseJSON(fenced);
      expect(result).toEqual(obj);
    });

    it('table round-trip preserves headers and data', () => {
      const original = '| A | B |\n| --- | --- |\n| 1 | 2 |';
      const json = markdownTableToJSON(original);
      if (!('error' in json)) {
        const roundTripped = jsonToMarkdownTable(json);
        if (typeof roundTripped === 'string') {
          expect(roundTripped).toContain('| A | B |');
          expect(roundTripped).toContain('| 1 | 2 |');
        }
      }
    });
  });
});
