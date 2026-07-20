import type { NextFunction, Request, Response } from 'express';
import { logError } from '../logging.js';

/** Error shapes carrying an HTTP status, e.g. body-parser's `entity.parse.failed`. */
interface HttpStatusError extends Error {
  status?: number;
  statusCode?: number;
}

function statusOf(err: HttpStatusError): number {
  const status = err.status ?? err.statusCode;
  return Number.isInteger(status) && status! >= 400 && status! < 600 ? status! : 500;
}

/**
 * Express error-handling middleware (four-parameter signature is what makes
 * Express treat this as an error handler rather than regular middleware).
 * Logs via `logError` (stderr JSON) and responds with the JSON error body
 * `{ error, message, requestId, timestamp }` — never an HTML stack trace.
 */
export function errorHandler(err: HttpStatusError, req: Request, res: Response, _next: NextFunction): void {
  const status = statusOf(err);
  logError('HTTP request failed', err, { requestId: req.requestId, method: req.method, path: req.path, status });

  if (res.headersSent) return;

  res.status(status).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred',
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
}
