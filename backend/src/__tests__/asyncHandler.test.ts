import { describe, it, expect, vi } from 'vitest';
import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response, NextFunction } from 'express';

describe('asyncHandler', () => {
  it('calls the handler and does not call next on success', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await wrapped(req, res, next);
    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next with error when handler rejects', async () => {
    const error = new Error('test error');
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await wrapped(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('calls next with error when handler throws synchronously', async () => {
    const error = new Error('sync error');
    // Synchronous throw inside an async function still rejects the promise
    const handler = vi.fn().mockImplementation(async () => { throw error; });
    const wrapped = asyncHandler(handler);
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await wrapped(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
