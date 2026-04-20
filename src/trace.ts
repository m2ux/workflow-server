import { randomUUID } from 'node:crypto';
import { getOrCreateServerKey, hmacSign, hmacVerify } from './utils/crypto.js';
import { logWarn } from './logging.js';

/** Mechanical trace event with compressed field names (opaque to agents). */
export interface TraceEvent {
  traceId: string;
  spanId: string;
  name: string;
  ts: number;
  ms: number;
  s: 'ok' | 'error';
  wf: string;
  act: string;
  aid: string;
  err?: string;
  vw?: string[];
}

/** HMAC-signed trace token payload containing full event data for a segment. */
export interface TraceTokenPayload {
  sid: string;
  act: string;
  from: number;
  to: number;
  n: number;
  t0: number;
  t1: number;
  ts: number;
  events: TraceEvent[];
}

const DEFAULT_MAX_SESSIONS = 1000;

/** Create a trace event with compressed field names. */
export function createTraceEvent(
  traceId: string,
  name: string,
  durationMs: number,
  status: 'ok' | 'error',
  wf: string,
  act: string,
  aid: string,
  options?: { err?: string; vw?: string[] },
): TraceEvent {
  return {
    traceId,
    spanId: randomUUID(),
    name,
    ts: Math.floor(Date.now() / 1000),
    ms: durationMs,
    s: status,
    wf,
    act,
    aid,
    ...(options?.err !== undefined ? { err: options.err } : {}),
    ...(options?.vw !== undefined && options.vw.length > 0 ? { vw: options.vw } : {}),
  };
}

/** In-process trace store. Accumulates events per session with cursor-based segment emission. */
export class TraceStore {
  private sessions = new Map<string, TraceEvent[]>();
  private cursors = new Map<string, number>();
  private readonly maxSessions: number;

  constructor(maxSessions: number = DEFAULT_MAX_SESSIONS) {
    this.maxSessions = maxSessions;
  }

  initSession(sid: string): void {
    if (!this.sessions.has(sid)) {
      if (this.sessions.size >= this.maxSessions) {
        const oldest = this.sessions.keys().next().value;
        if (oldest !== undefined) {
          logWarn('TraceStore evicting oldest session', { evictedSid: oldest, maxSessions: this.maxSessions });
          this.sessions.delete(oldest);
          this.cursors.delete(oldest);
        }
      }
      this.sessions.set(sid, []);
      this.cursors.set(sid, 0);
    }
  }

  append(sid: string, event: TraceEvent): void {
    if (!this.sessions.has(sid)) {
      this.initSession(sid);
    }
    const events = this.sessions.get(sid);
    if (events) events.push(event);
  }

  getEvents(sid: string): TraceEvent[] {
    return [...(this.sessions.get(sid) ?? [])];
  }

  listSessions(): string[] {
    return [...this.sessions.keys()];
  }

  getSegmentAndAdvanceCursor(sid: string): { events: TraceEvent[]; fromIndex: number; toIndex: number } {
    const events = this.sessions.get(sid) ?? [];
    const from = this.cursors.get(sid) ?? 0;
    const to = events.length;
    this.cursors.set(sid, to);
    return { events: events.slice(from, to), fromIndex: from, toIndex: to };
  }
}

/** Encode a trace token payload as an HMAC-signed base64url string. */
export async function createTraceToken(payload: TraceTokenPayload): Promise<string> {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, 'utf8').toString('base64url');
  const key = await getOrCreateServerKey();
  const sig = hmacSign(b64, key);
  return `${b64}.${sig}`;
}

function validateTraceTokenPayload(parsed: unknown): asserts parsed is TraceTokenPayload {
  if (parsed === null || typeof parsed !== 'object') {
    throw new Error('Invalid trace token: payload is not an object');
  }
  const p = parsed as Record<string, unknown>;
  const invalid: string[] = [];
  if (typeof p['sid'] !== 'string') invalid.push('sid (expected string)');
  if (typeof p['act'] !== 'string') invalid.push('act (expected string)');
  if (typeof p['from'] !== 'number') invalid.push('from (expected number)');
  if (typeof p['to'] !== 'number') invalid.push('to (expected number)');
  if (typeof p['n'] !== 'number') invalid.push('n (expected number)');
  if (typeof p['t0'] !== 'number') invalid.push('t0 (expected number)');
  if (typeof p['t1'] !== 'number') invalid.push('t1 (expected number)');
  if (typeof p['ts'] !== 'number') invalid.push('ts (expected number)');
  if (!Array.isArray(p['events'])) invalid.push('events (expected array)');
  if (invalid.length > 0) {
    throw new Error(`Invalid trace token: malformed payload fields: ${invalid.join(', ')}`);
  }
}

/** Decode and verify an HMAC-signed trace token, returning the payload with events. */
export async function decodeTraceToken(token: string): Promise<TraceTokenPayload> {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) {
    throw new Error(
      'Invalid trace token: the token is malformed (missing signature segment). ' +
      'A valid trace token must contain a "." separator between the payload and HMAC signature. ' +
      'This usually means the token was truncated or the value passed is not a trace token. ' +
      'Trace tokens are returned in the _meta.trace_token field of next_activity responses. ' +
      'If the token is invalid, you can omit the trace_tokens parameter and use server-side tracing instead.'
    );
  }

  const b64 = token.substring(0, dotIndex);
  const sig = token.substring(dotIndex + 1);

  const key = await getOrCreateServerKey();
  if (!hmacVerify(b64, sig, key)) {
    throw new Error(
      'Invalid trace token: HMAC signature verification failed. ' +
      'The token was either signed by a different server instance (e.g., the server was restarted and generated a new signing key), ' +
      'or the token has been tampered with. ' +
      'If the token is invalid, you can omit the trace_tokens parameter and use server-side tracing instead.'
    );
  }

  const json = Buffer.from(b64, 'base64url').toString('utf8');
  const parsed: unknown = JSON.parse(json);
  validateTraceTokenPayload(parsed);
  return parsed;
}
