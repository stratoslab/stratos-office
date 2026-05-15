import { ParseError } from './types';

export function parseJSON(text: string): object | ParseError {
  if (!text || text.trim() === '') {
    return { error: 'parse_failed', raw: text };
  }

  let cleaned = text;

  const thinkRegex = /<think>[\s\S]*?<\/think>/g;
  cleaned = cleaned.replace(thinkRegex, '');

  const fenceRegex = /```(?:json|JSON)\s*\n([\s\S]*?)\n\s*```/;
  const match = cleaned.match(fenceRegex);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      return parsed;
    } catch {
      return { error: 'parse_failed', raw: text };
    }
  }

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIndex = -1;
  if (firstBrace === -1 && firstBracket === -1) {
    return { error: 'parse_failed', raw: text };
  }
  if (firstBrace === -1) startIndex = firstBracket;
  else if (firstBracket === -1) startIndex = firstBrace;
  else startIndex = Math.min(firstBrace, firstBracket);

  try {
    const parsed = JSON.parse(cleaned.slice(startIndex));
    return parsed;
  } catch {
    return { error: 'parse_failed', raw: text };
  }
}

export function extractText(text: string): string {
  let result = text;

  const thinkRegex = /<think>[\s\S]*?<\/think>/g;
  result = result.replace(thinkRegex, '');

  const fenceRegex = /```[\s\S]*?\n([\s\S]*?)\n\s*```/g;
  result = result.replace(fenceRegex, '$1');

  return result.trim();
}

export function markdownTableToJSON(table: string): Array<Record<string, string>> | ParseError {
  const lines = table.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length < 3) {
    return { error: 'parse_failed', raw: table };
  }

  const headers = lines[0].split('|').map(h => h.trim()).filter(h => h.length > 0);
  const separatorCells = lines[1].split('|').map(c => c.trim()).filter(c => c.length > 0);

  const validSeparator = /^[::-]+:?$/;
  for (const cell of separatorCells) {
    if (!validSeparator.test(cell)) {
      return { error: 'parse_failed', raw: table };
    }
  }

  if (headers.length === 0 || separatorCells.length === 0) {
    return { error: 'parse_failed', raw: table };
  }

  const dataLines = lines.slice(2);
  if (dataLines.length === 0) {
    return { error: 'parse_failed', raw: table };
  }

  const result: Array<Record<string, string>> = [];
  for (const line of dataLines) {
    const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = cells[i] ?? '';
    }
    result.push(row);
  }

  return result;
}

export function jsonToMarkdownTable(rows: Array<Record<string, string>>): string | ParseError {
  if (!rows || rows.length === 0) {
    return { error: 'parse_failed', raw: '' };
  }

  const keys = Object.keys(rows[0]);
  for (const row of rows) {
    const rowKeys = Object.keys(row);
    if (rowKeys.length !== keys.length || !keys.every(k => rowKeys.includes(k))) {
      return { error: 'parse_failed', raw: '' };
    }
  }

  const headerRow = '| ' + keys.join(' | ') + ' |';
  const separatorRow = '| ' + keys.map(() => '---').join(' | ') + ' |';
  const dataRows = rows.map(row =>
    '| ' + keys.map(k => row[k] ?? '').join(' | ') + ' |'
  );

  return [headerRow, separatorRow, ...dataRows].join('\n');
}
