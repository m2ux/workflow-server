import type { NextFunction, Request, Response } from 'express';
import { logInfo } from '../logging.js';

/**
 * Log one structured `logInfo` JSON line per completed HTTP request (method,
 * path, status, durationMs, requestId). Reuses the existing stderr-JSON
 * logger rather than a separate HTTP-specific log shape, and rather than
 * `console.log` — stdout is reserved for the stdio transport's wire protocol
 * should this middleware module ever be shared or imported alongside it.
 */
export function requestLogging(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    logInfo('HTTP request', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });
  next();
}
