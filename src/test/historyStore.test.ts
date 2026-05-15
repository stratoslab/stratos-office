import { describe, it, expect, beforeEach } from 'vitest';
import { addEntry, getAllEntries, deleteEntry, clearAll, getEntryCount } from '../historyStore';
import { TaskEntry } from '../types';

function makeEntry(id: string, timestamp: string): TaskEntry {
  return {
    id,
    type: 'ocr',
    category: 'documents',
    inputSummary: 'test input',
    output: 'test output',
    timestamp,
    status: 'complete',
    durationMs: 1000,
    tokenCount: null,
    tps: null,
  };
}

describe('historyStore', () => {
  beforeEach(async () => {
    await clearAll();
  });

  describe('addEntry', () => {
    it('adds a single entry', async () => {
      const entry = makeEntry('1', '2025-01-01T00:00:00Z');
      await addEntry(entry);
      const entries = await getAllEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe('1');
    });

    it('updates an existing entry with the same id', async () => {
      const entry1 = makeEntry('1', '2025-01-01T00:00:00Z');
      await addEntry(entry1);
      const entry2 = { ...entry1, output: 'updated output', timestamp: '2025-01-02T00:00:00Z' };
      await addEntry(entry2);
      const entries = await getAllEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].output).toBe('updated output');
    });
  });

  describe('getAllEntries', () => {
    it('returns entries sorted by timestamp descending', async () => {
      await addEntry(makeEntry('1', '2025-01-01T00:00:00Z'));
      await addEntry(makeEntry('2', '2025-01-03T00:00:00Z'));
      await addEntry(makeEntry('3', '2025-01-02T00:00:00Z'));
      const entries = await getAllEntries();
      expect(entries).toHaveLength(3);
      expect(entries[0].id).toBe('2');
      expect(entries[1].id).toBe('3');
      expect(entries[2].id).toBe('1');
    });

    it('returns empty array when no entries exist', async () => {
      const entries = await getAllEntries();
      expect(entries).toEqual([]);
    });
  });

  describe('deleteEntry', () => {
    it('removes the entry with the given id', async () => {
      await addEntry(makeEntry('1', '2025-01-01T00:00:00Z'));
      await addEntry(makeEntry('2', '2025-01-02T00:00:00Z'));
      await deleteEntry('1');
      const entries = await getAllEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe('2');
    });

    it('does nothing when id does not exist', async () => {
      await addEntry(makeEntry('1', '2025-01-01T00:00:00Z'));
      await deleteEntry('nonexistent');
      const entries = await getAllEntries();
      expect(entries).toHaveLength(1);
    });
  });

  describe('clearAll', () => {
    it('removes all entries', async () => {
      await addEntry(makeEntry('1', '2025-01-01T00:00:00Z'));
      await addEntry(makeEntry('2', '2025-01-02T00:00:00Z'));
      await clearAll();
      const entries = await getAllEntries();
      expect(entries).toHaveLength(0);
    });
  });

  describe('getEntryCount', () => {
    it('returns the current number of entries', async () => {
      expect(await getEntryCount()).toBe(0);
      await addEntry(makeEntry('1', '2025-01-01T00:00:00Z'));
      expect(await getEntryCount()).toBe(1);
      await addEntry(makeEntry('2', '2025-01-02T00:00:00Z'));
      expect(await getEntryCount()).toBe(2);
    });
  });

  describe('FIFO eviction', () => {
    it('evicts the oldest entry when count exceeds 200', async () => {
      for (let i = 1; i <= 200; i++) {
        const ts = `2025-01-${String(Math.ceil(i / 10)).padStart(2, '0')}T${String(i % 24).padStart(2, '0')}:00:00Z`;
        await addEntry(makeEntry(String(i), ts));
      }
      expect(await getEntryCount()).toBe(200);

      await addEntry(makeEntry('201', '2025-02-01T00:00:00Z'));
      expect(await getEntryCount()).toBe(200);

      const entries = await getAllEntries();
      const ids = entries.map(e => e.id);
      expect(ids).toContain('201');
      expect(ids).not.toContain('1');
    });
  });
});
