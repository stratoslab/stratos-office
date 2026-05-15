const SEARCH_TTL = 5 * 60 * 1000;
const FETCH_TTL = 15 * 60 * 1000;
const SEARCH_TIMEOUT = 10000;
const FETCH_TIMEOUT = 10000;
const MAX_SEARCH_RESULTS = 5;
const MAX_FETCH_URLS = 3;
const MAX_FETCH_CHARS = 8000;
const MAX_COMBINED_CHARS = 24000;

interface SearchCacheEntry {
  results: Array<{ url: string; title: string; snippet: string }>;
  timestamp: number;
}

interface FetchCacheEntry {
  content: string;
  timestamp: number;
}

const searchCache = new Map<string, SearchCacheEntry>();
const fetchCache = new Map<string, FetchCacheEntry>();

export class McpSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'McpSearchError';
  }
}

export async function search(query: string): Promise<Array<{ url: string; title: string; snippet: string }>> {
  const cached = searchCache.get(query);
  if (cached && Date.now() - cached.timestamp < SEARCH_TTL) {
    return cached.results;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SEARCH_TIMEOUT);

  try {
    const response = await fetch('/api/mcp/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new McpSearchError(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    const results: Array<{ url: string; title: string; snippet: string }> = (data.results ?? []).slice(0, MAX_SEARCH_RESULTS);

    searchCache.set(query, { results, timestamp: Date.now() });
    return results;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new McpSearchError('Search timed out after 10 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchContent(url: string): Promise<string> {
  const cached = fetchCache.get(url);
  if (cached && Date.now() - cached.timestamp < FETCH_TTL) {
    return cached.content;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch('/api/mcp/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return '';
    }

    const data = await response.json();
    const content = (data.content ?? '').slice(0, MAX_FETCH_CHARS);

    fetchCache.set(url, { content, timestamp: Date.now() });
    return content;
  } catch {
    return '';
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchMultiple(urls: string[]): Promise<string[]> {
  const results: string[] = [];
  let combinedLength = 0;

  for (const url of urls) {
    const content = await fetchContent(url);
    if (content && combinedLength + content.length <= MAX_COMBINED_CHARS) {
      results.push(content);
      combinedLength += content.length;
    } else if (content && combinedLength < MAX_COMBINED_CHARS) {
      const remaining = MAX_COMBINED_CHARS - combinedLength;
      results.push(content.slice(0, remaining));
      combinedLength = MAX_COMBINED_CHARS;
    }
  }

  return results;
}
