import { describe, it, expect } from 'vitest';
import { validate, estimateTokens } from '../fileHandler';

describe('fileHandler', () => {
  describe('validate', () => {
    it('rejects files over 50 MB', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 51 * 1024 * 1024 });
      const result = validate(file, 'ocr');
      expect(result.accepted).toBe(false);
      expect(result.error).toContain('50 MB');
    });

    it('rejects unsupported MIME types', () => {
      const file = new File([''], 'test.exe', { type: 'application/x-executable' });
      const result = validate(file, 'ocr');
      expect(result.accepted).toBe(false);
      expect(result.error).toContain('Unsupported');
    });

    it('accepts valid image files', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const result = validate(file, 'ocr');
      expect(result.accepted).toBe(true);
    });

    it('accepts valid audio files', () => {
      const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
      const result = validate(file, 'transcription');
      expect(result.accepted).toBe(true);
    });

    it('rejects image for audio task', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const result = validate(file, 'transcription');
      expect(result.accepted).toBe(false);
    });
  });

  describe('estimateTokens', () => {
    it('estimates tokens correctly', () => {
      expect(estimateTokens('hello')).toBe(2);
      expect(estimateTokens('')).toBe(0);
      expect(estimateTokens('a'.repeat(100))).toBe(25);
    });
  });
});
