import { describe, it, expect } from 'vitest';
import { TraceStore, createTraceEvent, createTraceToken, decodeTraceToken } from '../src/trace.js';
import type { TraceEvent, TraceTokenPayload } from '../src/trace.js';

function makeEvent(name: string, sid = 'test-sid'): TraceEvent {
  return createTraceEvent(sid, name, 10, 'ok', 'wf-1', 'act-1', '');
}

describe('TraceStore', () => {
  it('initSession creates empty array (UT-1)', () => {
    const store = new TraceStore();
    store.initSession('s1');
    expect(store.getEvents('s1')).toEqual([]);
  });

  it('append adds event (UT-2)', () => {
    const store = new TraceStore();
    store.initSession('s1');
    store.append('s1', makeEvent('tool-a', 's1'));
    const events = store.getEvents('s1');
    expect(events).toHaveLength(1);
    expect(events[0]!.name).toBe('tool-a');
  });

  it('events maintain insertion order (UT-3)', () => {
    const store = new TraceStore();
    store.initSession('s1');
    store.append('s1', makeEvent('a', 's1'));
    store.append('s1', makeEvent('b', 's1'));
    store.append('s1', makeEvent('c', 's1'));
    const names = store.getEvents('s1').map(e => e.name);
    expect(names).toEqual(['a', 'b', 'c']);
  });

  it('unknown session returns empty array (UT-4)', () => {
    const store = new TraceStore();
    expect(store.getEvents('nonexistent')).toEqual([]);
  });

  it('listSessions returns all initialized sessions (UT-5)', () => {
    const store = new TraceStore();
    store.initSession('s1');
    store.initSession('s2');
    store.initSession('s3');
    expect(store.listSessions().sort()).toEqual(['s1', 's2', 's3']);
  });

  it('sessions are isolated (UT-6)', () => {
    const store = new TraceStore();
    store.initSession('s1');
    store.initSession('s2');
    store.append('s1', makeEvent('only-in-s1', 's1'));
    store.append('s2', makeEvent('only-in-s2', 's2'));
    expect(store.getEvents('s1').map(e => e.name)).toEqual(['only-in-s1']);
    expect(store.getEvents('s2').map(e => e.name)).toEqual(['only-in-s2']);
  });

  it('append to uninitialized session auto-initializes and stores the event', () => {
    const store = new TraceStore();
    store.append('unknown', makeEvent('auto-init'));
    expect(store.getEvents('unknown').map(e => e.name)).toEqual(['auto-init']);
  });

  describe('getSegmentAndAdvanceCursor', () => {
    it('returns all events on first call (UT-7)', () => {
      const store = new TraceStore();
      store.initSession('s1');
      store.append('s1', makeEvent('a', 's1'));
      store.append('s1', makeEvent('b', 's1'));
      const seg = store.getSegmentAndAdvanceCursor('s1');
      expect(seg.events).toHaveLength(2);
      expect(seg.fromIndex).toBe(0);
      expect(seg.toIndex).toBe(2);
    });

    it('subsequent call returns only new events (UT-8)', () => {
      const store = new TraceStore();
      store.initSession('s1');
      store.append('s1', makeEvent('a', 's1'));
      store.append('s1', makeEvent('b', 's1'));
      store.getSegmentAndAdvanceCursor('s1');

      store.append('s1', makeEvent('c', 's1'));
      const seg2 = store.getSegmentAndAdvanceCursor('s1');
      expect(seg2.events).toHaveLength(1);
      expect(seg2.events[0]!.name).toBe('c');
      expect(seg2.fromIndex).toBe(2);
      expect(seg2.toIndex).toBe(3);
    });

    it('returns empty when no new events', () => {
      const store = new TraceStore();
      store.initSession('s1');
      store.append('s1', makeEvent('a', 's1'));
      store.getSegmentAndAdvanceCursor('s1');
      const seg = store.getSegmentAndAdvanceCursor('s1');
      expect(seg.events).toHaveLength(0);
      expect(seg.fromIndex).toBe(1);
      expect(seg.toIndex).toBe(1);
    });
  });
});

describe('createTraceEvent', () => {
  it('populates all compressed fields (UT-12)', () => {
    const event = createTraceEvent('sid-1', 'next_activity', 42, 'ok', 'wp', 'start', 'w1');
    expect(event.traceId).toBe('sid-1');
    expect(event.spanId).toBeTruthy();
    expect(event.name).toBe('next_activity');
    expect(typeof event.ts).toBe('number');
    expect(event.ms).toBe(42);
    expect(event.s).toBe('ok');
    expect(event.wf).toBe('wp');
    expect(event.act).toBe('start');
    expect(event.aid).toBe('w1');
    expect(event.err).toBeUndefined();
    expect(event.vw).toBeUndefined();
  });

  it('includes error message when provided', () => {
    const event = createTraceEvent('sid-1', 'next_activity', 5, 'error', 'wp', 'act', '', { err: 'Not found' });
    expect(event.s).toBe('error');
    expect(event.err).toBe('Not found');
  });

  it('includes validation warnings when provided', () => {
    const event = createTraceEvent('sid-1', 'next_activity', 10, 'ok', 'wp', 'act', '', { vw: ['Missing steps'] });
    expect(event.vw).toEqual(['Missing steps']);
  });

  it('omits vw when empty array', () => {
    const event = createTraceEvent('sid-1', 'next_activity', 10, 'ok', 'wp', 'act', '', { vw: [] });
    expect(event.vw).toBeUndefined();
  });
});

describe('trace token encode/decode', () => {
  const samplePayload: TraceTokenPayload = {
    sid: 'test-session-id',
    act: 'design-philosophy',
    from: 0,
    to: 2,
    n: 2,
    t0: 1711382400,
    t1: 1711382410,
    ts: 1711382420,
    events: [
      makeEvent('next_activity', 'test-session-id'),
      makeEvent('get_skills', 'test-session-id'),
    ],
  };

  it('round-trips payload correctly (UT-9)', async () => {
    const token = await createTraceToken(samplePayload);
    const decoded = await decodeTraceToken(token);
    expect(decoded.sid).toBe(samplePayload.sid);
    expect(decoded.act).toBe(samplePayload.act);
    expect(decoded.n).toBe(2);
    expect(decoded.events).toHaveLength(2);
    expect(decoded.events[0]!.name).toBe('next_activity');
    expect(decoded.events[1]!.name).toBe('get_skills');
  });

  it('rejects tampered payload (UT-10)', async () => {
    const token = await createTraceToken(samplePayload);
    const [b64, sig] = token.split('.');
    const decoded = JSON.parse(Buffer.from(b64!, 'base64url').toString());
    decoded.n = 999;
    const tamperedB64 = Buffer.from(JSON.stringify(decoded)).toString('base64url');
    await expect(decodeTraceToken(`${tamperedB64}.${sig}`)).rejects.toThrow('HMAC signature verification failed');
  });

  it('rejects invalid HMAC (UT-11)', async () => {
    const token = await createTraceToken(samplePayload);
    const corrupted = token.slice(0, -4) + 'dead';
    await expect(decodeTraceToken(corrupted)).rejects.toThrow('HMAC signature verification failed');
  });

  it('rejects missing signature', async () => {
    await expect(decodeTraceToken('just-a-payload-no-dot')).rejects.toThrow('malformed (missing signature segment)');
  });

  it('token is an opaque string (dot-separated)', async () => {
    const token = await createTraceToken(samplePayload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(2);
    expect(token).not.toContain('{');
  });

  it('full event data survives round-trip', async () => {
    const event = createTraceEvent('s1', 'get_checkpoint', 5, 'ok', 'wp', 'act', 'w1', { vw: ['warn1'] });
    const payload: TraceTokenPayload = { sid: 's1', act: 'act', from: 0, to: 1, n: 1, t0: event.ts, t1: event.ts, ts: event.ts, events: [event] };
    const token = await createTraceToken(payload);
    const decoded = await decodeTraceToken(token);
    const e = decoded.events[0]!;
    expect(e.traceId).toBe('s1');
    expect(e.name).toBe('get_checkpoint');
    expect(e.ms).toBe(5);
    expect(e.s).toBe('ok');
    expect(e.wf).toBe('wp');
    expect(e.aid).toBe('w1');
    expect(e.vw).toEqual(['warn1']);
  });
});
