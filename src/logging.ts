import type { TraceStore } from './trace.js';
import { createTraceEvent } from './trace.js';
import { decodeSessionToken } from './utils/session.js';

export interface AuditEvent { timestamp: string; tool: string; parameters: Record<string, unknown>; result: 'success' | 'error'; duration_ms: number; error_message?: string; }

export function logAuditEvent(event: AuditEvent): void { console.error(JSON.stringify({ type: 'audit', ...event })); }
export function logInfo(message: string, data?: Record<string, unknown>): void { console.error(JSON.stringify({ type: 'info', message, ...data, timestamp: new Date().toISOString() })); }
export function logWarn(message: string, data?: Record<string, unknown>): void { console.error(JSON.stringify({ type: 'warn', message, ...data, timestamp: new Date().toISOString() })); }
export function logError(message: string, error?: Error, data?: Record<string, unknown>): void { console.error(JSON.stringify({ type: 'error', message, error: error?.message, stack: error?.stack, ...data, timestamp: new Date().toISOString() })); }

export interface TraceOptions {
  traceStore: TraceStore;
  excludeFromTrace?: boolean;
}

function extractValidationWarnings(result: unknown): string[] | undefined {
  if (result && typeof result === 'object' && '_meta' in result) {
    const meta = (result as Record<string, unknown>)['_meta'];
    if (meta && typeof meta === 'object' && 'validation' in meta) {
      const validation = (meta as Record<string, unknown>)['validation'];
      if (validation && typeof validation === 'object' && 'warnings' in validation) {
        const warnings = (validation as Record<string, unknown>)['warnings'];
        if (Array.isArray(warnings) && warnings.length > 0) {
          return warnings as string[];
        }
      }
    }
  }
  return undefined;
}

async function appendTraceEvent(
  traceStore: TraceStore,
  toolName: string,
  params: Record<string, unknown>,
  durationMs: number,
  status: 'ok' | 'error',
  result: unknown,
  errorMessage?: string,
): Promise<void> {
  const tokenStr = params['session_token'];
  if (typeof tokenStr !== 'string') return;

  try {
    const token = await decodeSessionToken(tokenStr);
    const vw = status === 'ok' ? extractValidationWarnings(result) : undefined;
    const opts: { err?: string; vw?: string[] } = {};
    if (errorMessage !== undefined) opts.err = errorMessage;
    if (vw !== undefined) opts.vw = vw;
    const event = createTraceEvent(
      token.sid, toolName, durationMs, status,
      token.wf, token.act, token.aid,
      opts,
    );
    traceStore.append(token.sid, event);
  } catch {
    // Token decode failure — skip trace capture silently
  }
}

export function withAuditLog<T extends Record<string, unknown>, R>(toolName: string, handler: (params: T) => Promise<R>, traceOpts?: TraceOptions): (params: T) => Promise<R> {
  return async (params: T): Promise<R> => {
    const start = Date.now();
    try {
      const result = await handler(params);
      const duration = Date.now() - start;
      logAuditEvent({ timestamp: new Date().toISOString(), tool: toolName, parameters: params, result: 'success', duration_ms: duration });
      if (traceOpts?.traceStore && !traceOpts.excludeFromTrace) {
        await appendTraceEvent(traceOpts.traceStore, toolName, params as Record<string, unknown>, duration, 'ok', result);
      }
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logAuditEvent({ timestamp: new Date().toISOString(), tool: toolName, parameters: params, result: 'error', duration_ms: duration, error_message: errorMessage });
      if (traceOpts?.traceStore && !traceOpts.excludeFromTrace) {
        await appendTraceEvent(traceOpts.traceStore, toolName, params as Record<string, unknown>, duration, 'error', undefined, errorMessage);
      }
      throw error;
    }
  };
}
