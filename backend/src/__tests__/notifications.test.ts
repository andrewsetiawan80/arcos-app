import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the pool before importing
vi.mock('../db/client', () => ({
  default: {
    query: vi.fn(),
  },
}));

import pool from '../db/client';
import { createNotification } from '../routes/notifications';

describe('createNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts a notification with correct parameters', async () => {
    (pool.query as any).mockResolvedValue({ rows: [] });
    await createNotification('contact', 'New contact', 'Hello', '/app/contacts');
    expect(pool.query).toHaveBeenCalledTimes(1);
    const [sql, params] = (pool.query as any).mock.calls[0];
    expect(sql).toContain('INSERT INTO notifications');
    expect(params[1]).toBe('contact');
    expect(params[2]).toBe('New contact');
    expect(params[3]).toBe('Hello');
    expect(params[4]).toBe('/app/contacts');
  });

  it('uses null for link when not provided', async () => {
    (pool.query as any).mockResolvedValue({ rows: [] });
    await createNotification('quote', 'Quote created', 'Body');
    const [, params] = (pool.query as any).mock.calls[0];
    expect(params[4]).toBeNull();
  });

  it('does not throw on database error', async () => {
    (pool.query as any).mockRejectedValue(new Error('DB error'));
    // Should not throw
    await expect(createNotification('test', 'Test', 'msg')).resolves.toBeUndefined();
  });
});
