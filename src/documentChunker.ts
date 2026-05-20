/**
 * Smart document chunking for large PDF/text processing.
 * Splits documents into logical chunks that fit within model context limits,
 * preserving paragraph/section boundaries to maintain semantic coherence.
 */

import { estimateTokens as _estimateTokens } from './fileHandler';

export interface DocumentChunk {
  index: number;
  total: number;
  text: string;
  tokenEstimate: number;
}

/**
 * Split text into chunks at paragraph boundaries.
 * Preserves semantic structure by not splitting mid-paragraph.
 * 
 * @param text - Full document text
 * @param maxTokensPerChunk - Maximum tokens per chunk (default 2500)
 * @returns Array of DocumentChunk objects
 */
export function chunkDocument(
  text: string,
  maxTokensPerChunk: number = 2500
): DocumentChunk[] {
  // Split into paragraphs (preserve double-newlines as boundaries)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  const chunks: DocumentChunk[] = [];
  let currentChunk = '';
  let currentTokens = 0;
  
  for (const paragraph of paragraphs) {
    const paraTokens = Math.ceil(paragraph.length / 4);
    
    // If single paragraph exceeds limit, split by sentences
    if (paraTokens > maxTokensPerChunk) {
      // Flush current chunk first
      if (currentChunk) {
        chunks.push({
          index: chunks.length + 1,
          total: 0, // Will update after all chunks
          text: currentChunk.trim(),
          tokenEstimate: currentTokens,
        });
        currentChunk = '';
        currentTokens = 0;
      }
      
      // Split oversized paragraph by sentences
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        const sentTokens = Math.ceil(sentence.length / 4);
        if (currentTokens + sentTokens > maxTokensPerChunk && currentChunk) {
          chunks.push({
            index: chunks.length + 1,
            total: 0,
            text: currentChunk.trim(),
            tokenEstimate: currentTokens,
          });
          currentChunk = sentence;
          currentTokens = sentTokens;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
          currentTokens += sentTokens;
        }
      }
    }
    // If adding this paragraph would exceed limit, start new chunk
    else if (currentTokens + paraTokens > maxTokensPerChunk && currentChunk) {
      chunks.push({
        index: chunks.length + 1,
        total: 0,
        text: currentChunk.trim(),
        tokenEstimate: currentTokens,
      });
      currentChunk = paragraph;
      currentTokens = paraTokens;
    }
    // Otherwise add to current chunk
    else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      currentTokens += paraTokens;
    }
  }
  
  // Flush remaining
  if (currentChunk) {
    chunks.push({
      index: chunks.length + 1,
      total: 0,
      text: currentChunk.trim(),
      tokenEstimate: currentTokens,
    });
  }
  
  // Update total count
  chunks.forEach(c => c.total = chunks.length);
  
  return chunks;
}

/**
 * Estimate tokens for text (rough: 1 token ≈ 4 chars)
 * Re-exported from fileHandler for convenience.
 */
export const estimateTokens = _estimateTokens;

/**
 * Check if document needs chunking
 */
export function needsChunking(text: string, maxTokens: number = 3000): boolean {
  return _estimateTokens(text) > maxTokens;
}
