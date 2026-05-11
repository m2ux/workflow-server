import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createSessionToken,
  loadSession,
  advanceToken,
  setDefaultSessionStore,
  assertCheckpointsResolved,
  type SessionView,
} from '../src/utils/session.js';
import { SessionStore } from '../src/utils/session-store.js';

beforeEach(() => {
  // Isolate each test in its own SessionStore so disk state from a prior test
  // can't leak in. Vitest's per-worker default tmpdir is also fine but this
  // gives stricter per-test isolation for stores that share sid space.
  const dir = mkdtempSync(join(tmpdir(), 'session-test-'));
  setDefaultSessionStore(new SessionStore(dir));
});

describe('createSessionToken', () => {
  it('creates an HMAC-signed opaque token (base64url.base64url)', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
    expect(token).toContain('.');
    expect(token).not.toContain('{');
    expect(token.split('.').length).toBe(2);
  });

  it('binds the token to a SessionRecord with the workflow id and version', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const view = await loadSession(token);
    expect(view.wf).toBe('work-package');
    expect(view.v).toBe('3.4.0');
    expect(view.aid).toBe('test-agent');
    expect(view.act).toBe('');
    expect(view.seq).toBe(0);
    expect(view.bcp).toBeUndefined();
  });

  it('sets ts to current epoch seconds', async () => {
    const before = Math.floor(Date.now() / 1000);
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const after = Math.floor(Date.now() / 1000);
    const view = await loadSession(token);
    expect(view.ts).toBeGreaterThanOrEqual(before);
    expect(view.ts).toBeLessThanOrEqual(after);
  });

  it('generates a UUID-formatted sid', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const view = await loadSession(token);
    expect(view.sid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('embeds parent context when provided', async () => {
    const parent = { psid: 'parent-sid', pwf: 'meta', pact: 'init', pv: '5.0.0' };
    const token = await createSessionToken('work-package', '3.4.0', 'worker', parent);
    const view = await loadSession(token);
    expect(view.psid).toBe('parent-sid');
    expect(view.pwf).toBe('meta');
    expect(view.pact).toBe('init');
    expect(view.pv).toBe('5.0.0');
  });

  it('records createdAt and updatedAt timestamps', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const view = await loadSession(token);
    expect(typeof view.createdAt).toBe('number');
    expect(typeof view.updatedAt).toBe('number');
    expect(view.createdAt).toBeLessThanOrEqual(view.updatedAt);
  });
});

describe('loadSession', () => {
  it('decodes a valid token', async () => {
    const token = await createSessionToken('meta', '1.0.0', 'test-agent');
    const view = await loadSession(token);
    expect(view.wf).toBe('meta');
    expect(view.v).toBe('1.0.0');
    expect(view.seq).toBe(0);
  });

  it('throws on garbage input', async () => {
    await expect(loadSession('not-valid')).rejects.toThrow(/missing signature segment/);
  });

  it('throws on empty string', async () => {
    await expect(loadSession('')).rejects.toThrow();
  });

  it('throws on a tampered payload (HMAC fails)', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const [payloadB64, sig] = token.split('.');
    const bytes = Buffer.from(payloadB64!, 'base64url');
    bytes[Math.floor(bytes.length / 2)] ^= 0x01;
    const tampered = `${bytes.toString('base64url')}.${sig}`;
    await expect(loadSession(tampered)).rejects.toThrow(/HMAC signature verification failed/);
  });
});

describe('advanceToken', () => {
  it('increments seq by 1', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const advanced = await advanceToken(token);
    const view = await loadSession(advanced);
    expect(view.seq).toBe(1);
  });

  it('increments cumulatively', async () => {
    let token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    token = await advanceToken(token);
    token = await advanceToken(token);
    token = await advanceToken(token);
    const view = await loadSession(token);
    expect(view.seq).toBe(3);
  });

  it('updates act when provided', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const advanced = await advanceToken(token, { act: 'design-philosophy' });
    const view = await loadSession(advanced);
    expect(view.act).toBe('design-philosophy');
    expect(view.seq).toBe(1);
  });

  it('preserves wf and other record fields when not in updates', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const step1 = await advanceToken(token, { act: 'start-work-package' });
    const step2 = await advanceToken(step1);
    const view = await loadSession(step2);
    expect(view.wf).toBe('work-package');
    expect(view.act).toBe('start-work-package');
    expect(view.seq).toBe(2);
  });

  it('produces a different token string each advance', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const advanced = await advanceToken(token);
    expect(advanced).not.toBe(token);
  });

  it('preserves sid across advances', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const original = await loadSession(token);
    const advanced = await advanceToken(token, { act: 'some-activity' });
    const after = await loadSession(advanced);
    expect(after.sid).toBe(original.sid);
  });

  it('sets aid when provided', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const advanced = await advanceToken(token, { aid: 'worker-1' });
    const view = await loadSession(advanced);
    expect(view.aid).toBe('worker-1');
  });

  it('preserves aid across advances when not in updates', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const step1 = await advanceToken(token, { aid: 'worker-1' });
    const step2 = await advanceToken(step1, { act: 'some-activity' });
    const view = await loadSession(step2);
    expect(view.aid).toBe('worker-1');
  });
});

describe('active yielded checkpoint (bcp)', () => {
  it('defaults bcp to undefined', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const view = await loadSession(token);
    expect(view.bcp).toBeUndefined();
  });

  it('sets bcp via advanceToken', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const advanced = await advanceToken(token, { bcp: 'cp-1' });
    const view = await loadSession(advanced);
    expect(view.bcp).toBe('cp-1');
  });

  it('persists bcp across advance when not updated', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const step1 = await advanceToken(token, { bcp: 'cp-1' });
    const step2 = await advanceToken(step1, { act: 'some-activity' });
    const view = await loadSession(step2);
    expect(view.bcp).toBe('cp-1');
  });

  it('is clearable using null', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const withCp = await advanceToken(token, { bcp: 'cp-1' });
    const cleared = await advanceToken(withCp, { bcp: null });
    const view = await loadSession(cleared);
    expect(view.bcp).toBeUndefined();
  });
});

describe('token opacity and HMAC', () => {
  it('does not contain the readable workflow id', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const payloadB64 = token.split('.')[0]!;
    expect(payloadB64).not.toContain('work-package');
  });

  it('has exactly one "." separator', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    expect(token.split('.').length).toBe(2);
  });

  it('rejects a token with a modified signature', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    const corrupted = token.slice(0, -4) + 'dead';
    await expect(loadSession(corrupted)).rejects.toThrow(/HMAC signature verification failed/);
  });

  it('wire form is materially smaller than the legacy ~480-char target', async () => {
    const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
    expect(token.length).toBeLessThan(200);
  });
});

describe('assertCheckpointsResolved', () => {
  function viewWithBcp(bcp: string | undefined): SessionView {
    return {
      sid: 'test',
      seq: 0,
      ts: 0,
      wf: 'wf', act: 'a', v: '1', aid: 'agent',
      createdAt: 0, updatedAt: 0,
      ...(bcp !== undefined ? { bcp } : {}),
    };
  }

  it('does not throw when bcp is absent', () => {
    expect(() => assertCheckpointsResolved(viewWithBcp(undefined))).not.toThrow();
  });

  it('throws when bcp is set', () => {
    expect(() => assertCheckpointsResolved(viewWithBcp('cp-1'))).toThrow(/Active checkpoint/);
  });
});
