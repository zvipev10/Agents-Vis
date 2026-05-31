import { describe, expect, it } from 'vitest';
import { normalizeDatabaseInteger, normalizeDatabaseTimestamp } from './dashboard-store';

describe('dashboard store database normalization', () => {
  it('normalizes Neon timestamp values to ISO strings', () => {
    expect(normalizeDatabaseTimestamp(new Date('2026-05-28T14:12:47.000Z'))).toBe(
      '2026-05-28T14:12:47.000Z',
    );
    expect(normalizeDatabaseTimestamp('2026-05-28T17:12:47.000+03:00')).toBe(
      '2026-05-28T14:12:47.000Z',
    );
  });

  it('normalizes Neon bigint values before version arithmetic and event ordering', () => {
    expect(normalizeDatabaseInteger('12')).toBe(12);
    expect(normalizeDatabaseInteger(13n)).toBe(13);
    expect(normalizeDatabaseInteger(null)).toBeNull();
  });

  it('degrades malformed legacy values without crashing dashboard reads', () => {
    expect(normalizeDatabaseInteger('9007199254740993')).toBeNull();
    expect(normalizeDatabaseTimestamp('not-a-date')).toBe('');
  });
});
