import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrap an async route handler so unhandled rejections are forwarded to
 * Express's error middleware via next(err).
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
