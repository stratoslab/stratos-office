const TINYFISH_SEARCH_URL = 'https://api.search.tinyfish.ai';
const TINYFISH_FETCH_URL = 'https://api.fetch.tinyfish.ai';
const SEARCH_TTL = 5 * 60 * 1000;
const FETCH_TTL = 15 * 60 * 1000;
const SEARCH_TIMEOUT = 10000;
const FETCH_TIMEOUT = 15000;
const MAX_SEARCH_RESULTS = 5;
const MAX_FETCH_URLS = 3;
const MAX_FETCH_CHARS = 8000;
const MAX_COMBINED_CHARS = 24000;
const STORAGE_KEY = 'stratos-tinyfish-key';

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

export class McpAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'McpAuthError';
  }
}

export class McpNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'McpNetworkError';
  }
}

export function getApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export async function validateKey(key: string): Promise<'valid' | 'invalid' | 'network_error'> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const url = new URL(TINYFISH_SEARCH_URL);
    url.searchParams.set('query', 'test');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': key,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) return 'valid';
    if (response.status === 401 || response.status === 403) return 'invalid';
    return 'network_error';
  } catch {
    return 'network_error';
  }
}

export async function search(query: string): Promise<Array<{ url: string; title: string; snippet: string }>> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new McpAuthError('No API key configured');
  }

  const cached = searchCache.get(query);
  if (cached && Date.now() - cached.timestamp < SEARCH_TTL) {
    return cached.results;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SEARCH_TIMEOUT);

  try {
    const url = new URL(TINYFISH_SEARCH_URL);
    url.searchParams.set('query', query);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
      },
      signal: controller.signal,
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem(STORAGE_KEY);
      throw new McpAuthError('API key is no longer valid');
    }

    if (!response.ok) {
      throw new McpNetworkError(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    const results: Array<{ url: string; title: string; snippet: string }> = (data.results ?? [])
      .slice(0, MAX_SEARCH_RESULTS)
      .map((r: { url: string; title: string; snippet: string }) => ({
        url: r.url,
        title: r.title,
        snippet: r.snippet,
      }));

    searchCache.set(query, { results, timestamp: Date.now() });
    return results;
  } catch (err) {
    if (err instanceof McpAuthError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new McpNetworkError('Search timed out after 10 seconds');
    }
    throw new McpNetworkError(err instanceof Error ? err.message : 'Search failed');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchContent(url: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return '';
  }

  const cached = fetchCache.get(url);
  if (cached && Date.now() - cached.timestamp < FETCH_TTL) {
    return cached.content;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(TINYFISH_FETCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ urls: [url], format: 'markdown' }),
      signal: controller.signal,
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem(STORAGE_KEY);
      throw new McpAuthError('API key is no longer valid');
    }

    if (!response.ok) {
      return '';
    }

    const data = await response.json();
    const firstResult = data.results?.[0];
    const content = (firstResult?.text ?? '').slice(0, MAX_FETCH_CHARS);

    fetchCache.set(url, { content, timestamp: Date.now() });
    return content;
  } catch {
    return '';
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchMultiple(urls: string[]): Promise<string[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return [];
  }

  const cacheHits: string[] = [];
  const uncachedUrls: string[] = [];

  for (const url of urls) {
    const cached = fetchCache.get(url);
    if (cached && Date.now() - cached.timestamp < FETCH_TTL) {
      cacheHits.push(cached.content);
    } else {
      uncachedUrls.push(url);
    }
  }

  let fetchedContents: string[] = [];
  if (uncachedUrls.length > 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch(TINYFISH_FETCH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ urls: uncachedUrls, format: 'markdown' }),
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();
        fetchedContents = (data.results ?? []).map((r: { text?: string }) => r.text ?? '');
        for (let i = 0; i < uncachedUrls.length; i++) {
          if (fetchedContents[i]) {
            fetchCache.set(uncachedUrls[i], { content: fetchedContents[i], timestamp: Date.now() });
          }
        }
      }
    } catch {
      // Silently fail — return whatever we have from cache
    } finally {
      clearTimeout(timeoutId);
    }
  }

  const allContents = [...cacheHits, ...fetchedContents];
  const results: string[] = [];
  let combinedLength = 0;

  for (const content of allContents) {
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
