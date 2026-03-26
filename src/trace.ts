import { randomUUID } from 'node:crypto';
import { getOrCreateServerKey, hmacSign, hmacVerify } from './utils/crypto.js';

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
    spanId: randomUUID().slice(0, 8),
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

export class TraceStore {
  private sessions = new Map<string, TraceEvent[]>();
  private cursors = new Map<string, number>();

  initSession(sid: string): void {
    if (!this.sessions.has(sid)) {
      this.sessions.set(sid, []);
      this.cursors.set(sid, 0);
    }
  }

  append(sid: string, event: TraceEvent): void {
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

export async function createTraceToken(payload: TraceTokenPayload): Promise<string> {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, 'utf8').toString('base64url');
  const key = await getOrCreateServerKey();
  const sig = hmacSign(b64, key);
  return `${b64}.${sig}`;
}

export async function decodeTraceToken(token: string): Promise<TraceTokenPayload> {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) throw new Error('Invalid trace token: missing signature');

  const b64 = token.substring(0, dotIndex);
  const sig = token.substring(dotIndex + 1);

  const key = await getOrCreateServerKey();
  if (!hmacVerify(b64, sig, key)) {
    throw new Error('Invalid trace token: signature verification failed');
  }

  const json = Buffer.from(b64, 'base64url').toString('utf8');
  const parsed = JSON.parse(json) as TraceTokenPayload;
  if (typeof parsed.sid !== 'string' || !Array.isArray(parsed.events)) {
    throw new Error('Invalid trace token: malformed payload');
  }
  return parsed;
}
