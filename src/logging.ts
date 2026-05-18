import type { TraceStore } from './trace.js';
import { createTraceEvent } from './trace.js';
import { loadSessionForTool } from './utils/session/resolver.js';

/**
 * Workspace path injected at startup so the audit-log wrapper can re-resolve
 * `session_index` parameters against the canonical planning root. Set once by
 * `setAuditWorkspaceDir`; unauthenticated tool calls (no `session_index`)
 * bypass the resolver and emit trace events without session-derived fields.
 */
let auditWorkspaceDir: string | undefined;

/**
 * Wire the workspace path into the audit-log infrastructure. Called by
 * `createServer` after `loadConfig` resolves `--workspace=PATH` / env. Tools
 * call `loadSessionForTool` indirectly via the wrapper below; without this
 * setter the wrapper falls back to logging without `sid/wf/act/aid` (the
 * tool itself still works — only the trace event loses the session fields).
 */
export function setAuditWorkspaceDir(workspaceDir: string): void {
  auditWorkspaceDir = workspaceDir;
}

const MAX_LOG_VALUE_LENGTH = 8192;

export interface AuditEvent { tool: string; parameters: Record<string, unknown>; result: 'success' | 'error'; duration_ms: number; error_message?: string; }

export function logAuditEvent(event: AuditEvent): void { console.error(JSON.stringify({ type: 'audit', ...event, timestamp: new Date().toISOString() })); }
export function logInfo(message: string, data?: Record<string, unknown>): void { console.error(JSON.stringify({ type: 'info', message, ...data, timestamp: new Date().toISOString() })); }

export function logWarn(message: string, data?: Record<string, unknown>): void {
  console.error(JSON.stringify({ type: 'warn', message, ...truncateDataValues(data), timestamp: new Date().toISOString() }));
}

export function logError(message: string, error?: Error, data?: Record<string, unknown>): void {
  console.error(JSON.stringify({ type: 'error', message, error: error?.message, stack: error?.stack, ...truncateDataValues(data), timestamp: new Date().toISOString() }));
}

function truncateDataValues(data: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!data) return data;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.length > MAX_LOG_VALUE_LENGTH) {
      out[key] = value.slice(0, MAX_LOG_VALUE_LENGTH) + `... [truncated ${value.length - MAX_LOG_VALUE_LENGTH} chars]`;
    } else {
      out[key] = value;
    }
  }
  return out;
}

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
  const sessionIndex = params['session_index'];
  if (typeof sessionIndex !== 'string') return; // Unauthenticated tool — no session-derived fields.

  if (!auditWorkspaceDir) {
    // Workspace not wired into the audit infrastructure; skip session-derived
    // fields. This branch is hit by ad-hoc test setups that build a tool
    // pipeline without `setAuditWorkspaceDir`.
    return;
  }

  try {
    const { state } = await loadSessionForTool(auditWorkspaceDir, sessionIndex);
    const vw = status === 'ok' ? extractValidationWarnings(result) : undefined;
    const opts: { err?: string; vw?: string[] } = {};
    if (errorMessage !== undefined) opts.err = errorMessage;
    if (vw !== undefined) opts.vw = vw;
    const event = createTraceEvent(
      state.sessionIndex, toolName, durationMs, status,
      state.workflowId, state.currentActivity, state.agentId,
      opts,
    );
    traceStore.append(state.sessionIndex, event);
  } catch (e) {
    logWarn('Trace capture skipped: session_index resolution failed', { tool: toolName, error: e instanceof Error ? e.message : String(e) });
  }
}

export function withAuditLog<T extends Record<string, unknown>, R>(toolName: string, handler: (params: T) => Promise<R>, traceOpts?: TraceOptions): (params: T) => Promise<R> {
  return async (params: T): Promise<R> => {
    const start = Date.now();
    let result: R;
    try {
      result = await handler(params);
    } catch (error) {
      const duration = Date.now() - start;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logAuditEvent({ tool: toolName, parameters: params, result: 'error', duration_ms: duration, error_message: errorMessage });
      if (traceOpts?.traceStore && !traceOpts.excludeFromTrace) {
        await appendTraceEvent(traceOpts.traceStore, toolName, params as Record<string, unknown>, duration, 'error', undefined, errorMessage);
      }
      throw error;
    }
    const duration = Date.now() - start;
    logAuditEvent({ tool: toolName, parameters: params, result: 'success', duration_ms: duration });
    if (traceOpts?.traceStore && !traceOpts.excludeFromTrace) {
      await appendTraceEvent(traceOpts.traceStore, toolName, params as Record<string, unknown>, duration, 'ok', result);
    }
    return result;
  };
}
