import { describe, it, expect } from 'vitest';
import { createSessionToken, decodeSessionToken, advanceToken } from '../src/utils/session.js';

describe('session token utilities', () => {
  describe('createSessionToken', () => {
    it('should create an HMAC-signed opaque token', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
      expect(token).toContain('.');
      expect(token).not.toContain('{');
    });

    it('should encode workflow_id, version, and empty defaults', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const payload = await decodeSessionToken(token);
      expect(payload.wf).toBe('work-package');
      expect(payload.v).toBe('3.4.0');
      expect(payload.act).toBe('');
      expect(payload.skill).toBe('');
      expect(payload.seq).toBe(0);
    });

    it('should set ts to current epoch seconds', async () => {
      const before = Math.floor(Date.now() / 1000);
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const after = Math.floor(Date.now() / 1000);
      const payload = await decodeSessionToken(token);
      expect(payload.ts).toBeGreaterThanOrEqual(before);
      expect(payload.ts).toBeLessThanOrEqual(after);
    });
  });

  describe('decodeSessionToken', () => {
    it('should decode a valid token', async () => {
      const token = await createSessionToken('meta', '1.0.0', 'test-agent');
      const payload = await decodeSessionToken(token);
      expect(payload.wf).toBe('meta');
      expect(payload.v).toBe('1.0.0');
      expect(payload.seq).toBe(0);
    });

    it('should throw on garbage input', async () => {
      await expect(decodeSessionToken('not-valid')).rejects.toThrow('Invalid session token');
    });

    it('should throw on empty string', async () => {
      await expect(decodeSessionToken('')).rejects.toThrow();
    });

    it('should throw on valid base64 with wrong structure', async () => {
      const bad = Buffer.from(JSON.stringify({ foo: 'bar' })).toString('base64url') + '.fakesig';
      await expect(decodeSessionToken(bad)).rejects.toThrow('signature verification failed');
    });

    it('should throw on tampered payload', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const payload = await decodeSessionToken(token);
      const [, sig] = token.split('.');
      const tampered = Buffer.from(JSON.stringify({ ...payload, wf: 'hacked' })).toString('base64url');
      await expect(decodeSessionToken(`${tampered}.${sig}`)).rejects.toThrow('signature verification failed');
    });
  });

  describe('advanceToken', () => {
    it('should increment seq by 1', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const advanced = await advanceToken(token);
      const payload = await decodeSessionToken(advanced);
      expect(payload.seq).toBe(1);
    });

    it('should increment cumulatively', async () => {
      let token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      token = await advanceToken(token);
      token = await advanceToken(token);
      token = await advanceToken(token);
      const payload = await decodeSessionToken(token);
      expect(payload.seq).toBe(3);
    });

    it('should update act when provided', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const advanced = await advanceToken(token, { act: 'design-philosophy' });
      const payload = await decodeSessionToken(advanced);
      expect(payload.act).toBe('design-philosophy');
      expect(payload.seq).toBe(1);
    });

    it('should update skill when provided', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const advanced = await advanceToken(token, { skill: 'create-issue' });
      const payload = await decodeSessionToken(advanced);
      expect(payload.skill).toBe('create-issue');
    });

    it('should preserve fields when not updating', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const step1 = await advanceToken(token, { act: 'start-work-package', skill: 'create-issue' });
      const step2 = await advanceToken(step1);
      const payload = await decodeSessionToken(step2);
      expect(payload.wf).toBe('work-package');
      expect(payload.act).toBe('start-work-package');
      expect(payload.skill).toBe('create-issue');
      expect(payload.seq).toBe(2);
    });

    it('should produce different token strings', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const advanced = await advanceToken(token);
      expect(advanced).not.toBe(token);
    });

    it('advanced token should have valid HMAC', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const advanced = await advanceToken(token);
      const payload = await decodeSessionToken(advanced);
      expect(payload.seq).toBe(1);
    });
  });

  describe('session ID (sid)', () => {
    it('should have sid field (UT-13)', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const payload = await decodeSessionToken(token);
      expect(typeof payload.sid).toBe('string');
      expect(payload.sid.length).toBeGreaterThan(0);
    });

    it('sid should be UUID format (UT-14)', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const payload = await decodeSessionToken(token);
      expect(payload.sid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('sid should be preserved across advance (UT-15)', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const original = await decodeSessionToken(token);
      const advanced = await advanceToken(token, { act: 'some-activity' });
      const after = await decodeSessionToken(advanced);
      expect(after.sid).toBe(original.sid);
    });
  });

  describe('agent ID (aid)', () => {
    it('should be set to provided agentId (UT-16)', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const payload = await decodeSessionToken(token);
      expect(payload.aid).toBe('test-agent');
    });

    it('should be settable via advanceToken (UT-17)', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const advanced = await advanceToken(token, { aid: 'worker-1' });
      const payload = await decodeSessionToken(advanced);
      expect(payload.aid).toBe('worker-1');
    });

    it('should be preserved when not in updates (UT-18)', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const step1 = await advanceToken(token, { aid: 'worker-1' });
      const step2 = await advanceToken(step1, { act: 'some-activity' });
      const payload = await decodeSessionToken(step2);
      expect(payload.aid).toBe('worker-1');
    });
  });

  describe('pending checkpoints (pcp/pcpt)', () => {
    it('should default pcp to empty array', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const payload = await decodeSessionToken(token);
      expect(payload.pcp).toEqual([]);
      expect(payload.pcpt).toBe(0);
    });

    it('should set pcp via advanceToken', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const advanced = await advanceToken(token, { pcp: ['cp-1', 'cp-2'], pcpt: 1000 });
      const payload = await decodeSessionToken(advanced);
      expect(payload.pcp).toEqual(['cp-1', 'cp-2']);
      expect(payload.pcpt).toBe(1000);
    });

    it('pcp should persist across advance when not updated', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const step1 = await advanceToken(token, { pcp: ['cp-1'], pcpt: 500 });
      const step2 = await advanceToken(step1, { act: 'some-activity' });
      const payload = await decodeSessionToken(step2);
      expect(payload.pcp).toEqual(['cp-1']);
      expect(payload.pcpt).toBe(500);
    });

    it('pcp should be clearable', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const withCp = await advanceToken(token, { pcp: ['cp-1'], pcpt: 500 });
      const cleared = await advanceToken(withCp, { pcp: [], pcpt: 0 });
      const payload = await decodeSessionToken(cleared);
      expect(payload.pcp).toEqual([]);
      expect(payload.pcpt).toBe(0);
    });

    it('tampering with pcp should fail HMAC verification', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const advanced = await advanceToken(token, { pcp: ['cp-1'], pcpt: 100 });
      const [b64] = advanced.split('.');
      const json = Buffer.from(b64!, 'base64url').toString('utf8');
      const payload = JSON.parse(json);
      payload.pcp = [];
      const tampered = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const sig = advanced.split('.')[1];
      await expect(decodeSessionToken(`${tampered}.${sig}`)).rejects.toThrow('signature verification failed');
    });
  });

  describe('token opacity and HMAC', () => {
    it('token should not contain readable workflow id', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const b64Part = token.split('.')[0]!;
      expect(b64Part).not.toContain('work-package');
    });

    it('token should contain a dot separator (payload.signature)', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      expect(token.split('.').length).toBe(2);
    });

    it('should reject token with modified signature', async () => {
      const token = await createSessionToken('work-package', '3.4.0', 'test-agent');
      const corrupted = token.slice(0, -4) + 'dead';
      await expect(decodeSessionToken(corrupted)).rejects.toThrow('signature verification failed');
    });
  });
});
