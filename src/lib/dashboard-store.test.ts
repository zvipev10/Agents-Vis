import { describe, expect, it } from 'vitest';
import { normalizeDatabaseInteger, normalizeDatabaseTimestamp } from './dashboard-store';

describe('dashboard store database normalization', () => {
  it('normalizes Neon timestamp values to ISO strings', () => {
    expect(normalizeDatabaseTimestamp(new Date('2026-05-28T14:12:47.000Z'), 'missions.updated_at')).toBe(
      '2026-05-28T14:12:47.000Z',
    );
    expect(normalizeDatabaseTimestamp('2026-05-28T17:12:47.000+03:00', 'missions.updated_at')).toBe(
      '2026-05-28T14:12:47.000Z',
    );
  });

  it('normalizes Neon bigint values before version arithmetic and event ordering', () => {
    expect(normalizeDatabaseInteger('12', 'missions.version')).toBe(12);
    expect(normalizeDatabaseInteger(13n, 'mission_events.sequence_index')).toBe(13);
    expect(normalizeDatabaseInteger(null, 'mission_events.parallel_order')).toBeNull();
  });

  it('rejects unsafe integers instead of letting them overflow later', () => {
    expect(() => normalizeDatabaseInteger('9007199254740993', 'missions.version')).toThrow(
      'Invalid missions.version integer from database',
    );
    expect(() => normalizeDatabaseTimestamp('not-a-date', 'missions.updated_at')).toThrow(
      'Invalid missions.updated_at timestamp from database',
    );
  });
});