export interface AuditEvent { timestamp: string; tool: string; parameters: Record<string, unknown>; result: 'success' | 'error'; duration_ms: number; error_message?: string; }

export function logAuditEvent(event: AuditEvent): void { console.error(JSON.stringify({ type: 'audit', ...event })); }
export function logInfo(message: string, data?: Record<string, unknown>): void { console.error(JSON.stringify({ type: 'info', message, ...data, timestamp: new Date().toISOString() })); }
export function logWarn(message: string, data?: Record<string, unknown>): void { console.error(JSON.stringify({ type: 'warn', message, ...data, timestamp: new Date().toISOString() })); }
export function logError(message: string, error?: Error, data?: Record<string, unknown>): void { console.error(JSON.stringify({ type: 'error', message, error: error?.message, stack: error?.stack, ...data, timestamp: new Date().toISOString() })); }

export function withAuditLog<T extends Record<string, unknown>, R>(toolName: string, handler: (params: T) => Promise<R>): (params: T) => Promise<R> {
  return async (params: T): Promise<R> => {
    const start = Date.now();
    try {
      const result = await handler(params);
      logAuditEvent({ timestamp: new Date().toISOString(), tool: toolName, parameters: params, result: 'success', duration_ms: Date.now() - start });
      return result;
    } catch (error) {
      logAuditEvent({ timestamp: new Date().toISOString(), tool: toolName, parameters: params, result: 'error', duration_ms: Date.now() - start, error_message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  };
}
