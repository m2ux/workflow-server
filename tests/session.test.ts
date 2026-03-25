import { describe, it, expect } from 'vitest';
import { createSessionToken, decodeSessionToken, advanceToken } from '../src/utils/session.js';

describe('session token utilities', () => {
  describe('createSessionToken', () => {
    it('should create an HMAC-signed opaque token', async () => {
      const token = await createSessionToken('work-package', '3.4.0');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
      expect(token).toContain('.');
      expect(token).not.toContain('{');
    });

    it('should encode workflow_id, version, and empty defaults', async () => {
      const token = await createSessionToken('work-package', '3.4.0');
      const payload = await decodeSessionToken(token);
      expect(payload.wf).toBe('work-package');
      expect(payload.v).toBe('3.4.0');
      expect(payload.act).toBe('');
      expect(payload.skill).toBe('');
      expect(payload.seq).toBe(0);
    });

    it('should set ts to current epoch seconds', async () => {
      const before = Math.floor(Date.now() / 1000);
      const token = await createSessionToken('work-package', '3.4.0');
      const after = Math.floor(Date.now() / 1000);
      const payload = await decodeSessionToken(token);
      expect(payload.ts).toBeGreaterThanOrEqual(before);
      expect(payload.ts).toBeLessThanOrEqual(after);
    });
  });

  describe('decodeSessionToken', () => {
    it('should decode a valid token', async () => {
      const token = await createSessionToken('meta', '1.0.0');
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
      const token = await createSessionToken('work-package', '3.4.0');
      const [, sig] = token.split('.');
      const tampered = Buffer.from(JSON.stringify({ wf: 'hacked', act: '', skill: '', v: '1.0.0', seq: 0, ts: 0 })).toString('base64url');
      await expect(decodeSessionToken(`${tampered}.${sig}`)).rejects.toThrow('signature verification failed');
    });
  });

  describe('advanceToken', () => {
    it('should increment seq by 1', async () => {
      const token = await createSessionToken('work-package', '3.4.0');
      const advanced = await advanceToken(token);
      const payload = await decodeSessionToken(advanced);
      expect(payload.seq).toBe(1);
    });

    it('should increment cumulatively', async () => {
      let token = await createSessionToken('work-package', '3.4.0');
      token = await advanceToken(token);
      token = await advanceToken(token);
      token = await advanceToken(token);
      const payload = await decodeSessionToken(token);
      expect(payload.seq).toBe(3);
    });

    it('should update act when provided', async () => {
      const token = await createSessionToken('work-package', '3.4.0');
      const advanced = await advanceToken(token, { act: 'design-philosophy' });
      const payload = await decodeSessionToken(advanced);
      expect(payload.act).toBe('design-philosophy');
      expect(payload.seq).toBe(1);
    });

    it('should update skill when provided', async () => {
      const token = await createSessionToken('work-package', '3.4.0');
      const advanced = await advanceToken(token, { skill: 'create-issue' });
      const payload = await decodeSessionToken(advanced);
      expect(payload.skill).toBe('create-issue');
    });

    it('should preserve fields when not updating', async () => {
      const token = await createSessionToken('work-package', '3.4.0');
      const step1 = await advanceToken(token, { act: 'start-work-package', skill: 'create-issue' });
      const step2 = await advanceToken(step1);
      const payload = await decodeSessionToken(step2);
      expect(payload.wf).toBe('work-package');
      expect(payload.act).toBe('start-work-package');
      expect(payload.skill).toBe('create-issue');
      expect(payload.seq).toBe(2);
    });

    it('should produce different token strings', async () => {
      const token = await createSessionToken('work-package', '3.4.0');
      const advanced = await advanceToken(token);
      expect(advanced).not.toBe(token);
    });

    it('advanced token should have valid HMAC', async () => {
      const token = await createSessionToken('work-package', '3.4.0');
      const advanced = await advanceToken(token);
      const payload = await decodeSessionToken(advanced);
      expect(payload.seq).toBe(1);
    });
  });

  describe('token opacity and HMAC', () => {
    it('token should not contain readable workflow id', async () => {
      const token = await createSessionToken('work-package', '3.4.0');
      const b64Part = token.split('.')[0]!;
      expect(b64Part).not.toContain('work-package');
    });

    it('token should contain a dot separator (payload.signature)', async () => {
      const token = await createSessionToken('work-package', '3.4.0');
      expect(token.split('.').length).toBe(2);
    });

    it('should reject token with modified signature', async () => {
      const token = await createSessionToken('work-package', '3.4.0');
      const corrupted = token.slice(0, -4) + 'dead';
      await expect(decodeSessionToken(corrupted)).rejects.toThrow('signature verification failed');
    });
  });
});
