import type { NextFunction, Request, Response } from 'express';
import { logError, logInfo } from '../logging.js';

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
 * Responds with the JSON error body `{ error, message, requestId, timestamp }`
 * — never an HTML stack trace.
 *
 * Client errors (4xx), including OAuth well-known discovery 404s from
 * `mcp-remote`, are logged as info without a stack so they do not look like
 * server failures in agent/operator logs. Only 5xx use `logError` + stack.
 */
export function errorHandler(err: HttpStatusError, req: Request, res: Response, _next: NextFunction): void {
  const status = statusOf(err);
  const fields = { requestId: req.requestId, method: req.method, path: req.path, status };
  if (status >= 500) {
    logError('HTTP request failed', err, fields);
  } else {
    logInfo('HTTP request rejected', { ...fields, error: err.name || 'Error', message: err.message });
  }

  if (res.headersSent) return;

  res.status(status).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred',
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
}
