import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticateToken, requireAdmin, requireRole, AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
    sign: vi.fn(),
  },
}));

import jwt from 'jsonwebtoken';

function mockReq(headers: Record<string, string> = {}): AuthRequest {
  return { headers } as AuthRequest;
}

function mockRes(): Response {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res as Response;
}

describe('authenticateToken', () => {
  const next = vi.fn() as NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('returns 401 if no authorization header', () => {
    const req = mockReq();
    const res = mockRes();
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 if token is invalid', () => {
    const req = mockReq({ authorization: 'Bearer bad-token' });
    const res = mockRes();
    (jwt.verify as any).mockImplementation(() => { throw new Error('invalid'); });
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and sets userId/userRole for valid token', () => {
    const req = mockReq({ authorization: 'Bearer valid-token' });
    const res = mockRes();
    (jwt.verify as any).mockReturnValue({ userId: 1, role: 'admin' });
    authenticateToken(req, res, next);
    expect(req.userId).toBe(1);
    expect(req.userRole).toBe('admin');
    expect(next).toHaveBeenCalled();
  });

  it('returns 500 if JWT_SECRET is not set', () => {
    delete process.env.JWT_SECRET;
    const req = mockReq({ authorization: 'Bearer any' });
    const res = mockRes();
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('requireAdmin', () => {
  const next = vi.fn() as NextFunction;

  beforeEach(() => vi.clearAllMocks());

  it('returns 403 if role is not admin', () => {
    const req = mockReq() as AuthRequest;
    req.userRole = 'sales';
    const res = mockRes();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next if role is admin', () => {
    const req = mockReq() as AuthRequest;
    req.userRole = 'admin';
    const res = mockRes();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  const next = vi.fn() as NextFunction;

  beforeEach(() => vi.clearAllMocks());

  it('returns 403 if role is not in allowed list', () => {
    const middleware = requireRole('admin', 'sales');
    const req = mockReq() as AuthRequest;
    req.userRole = 'production';
    const res = mockRes();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls next if role is in allowed list', () => {
    const middleware = requireRole('admin', 'sales');
    const req = mockReq() as AuthRequest;
    req.userRole = 'sales';
    const res = mockRes();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 if no role set', () => {
    const middleware = requireRole('admin');
    const req = mockReq() as AuthRequest;
    const res = mockRes();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
