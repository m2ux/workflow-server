import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    /** Per-request correlation id — echoed back on the `x-request-id` response header. */
    requestId: string;
  }
}

const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Attach a correlation id to `req.requestId`, reusing an inbound
 * `x-request-id` header when the caller (e.g. a reverse proxy) already
 * assigned one, otherwise generating a fresh UUID. Echoes the id back on the
 * response header so a client can correlate its request with server logs.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const inbound = req.headers[REQUEST_ID_HEADER];
  const id = (Array.isArray(inbound) ? inbound[0] : inbound)?.trim() || randomUUID();
  req.requestId = id;
  res.setHeader(REQUEST_ID_HEADER, id);
  next();
}
