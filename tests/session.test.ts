import { describe, it, expect } from 'vitest';
import { createSessionToken, decodeSessionToken, advanceToken } from '../src/utils/session.js';

describe('session token utilities', () => {
  describe('createSessionToken', () => {
    it('should create a base64url-encoded token', () => {
      const token = createSessionToken('work-package', '3.4.0', 'start-work-package');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
      expect(token).not.toContain('{');
      expect(token).not.toContain(' ');
    });

    it('should encode workflow_id and version', () => {
      const token = createSessionToken('work-package', '3.4.0');
      const payload = decodeSessionToken(token);
      expect(payload.wf).toBe('work-package');
      expect(payload.v).toBe('3.4.0');
    });

    it('should set initial activity when provided', () => {
      const token = createSessionToken('work-package', '3.4.0', 'start-work-package');
      const payload = decodeSessionToken(token);
      expect(payload.act).toBe('start-work-package');
    });

    it('should default activity to empty string', () => {
      const token = createSessionToken('work-package', '3.4.0');
      const payload = decodeSessionToken(token);
      expect(payload.act).toBe('');
    });

    it('should set seq to 0', () => {
      const token = createSessionToken('work-package', '3.4.0');
      const payload = decodeSessionToken(token);
      expect(payload.seq).toBe(0);
    });

    it('should set ts to current epoch seconds', () => {
      const before = Math.floor(Date.now() / 1000);
      const token = createSessionToken('work-package', '3.4.0');
      const after = Math.floor(Date.now() / 1000);
      const payload = decodeSessionToken(token);
      expect(payload.ts).toBeGreaterThanOrEqual(before);
      expect(payload.ts).toBeLessThanOrEqual(after);
    });
  });

  describe('decodeSessionToken', () => {
    it('should decode a valid token', () => {
      const token = createSessionToken('meta', '1.0.0', 'start-workflow');
      const payload = decodeSessionToken(token);
      expect(payload.wf).toBe('meta');
      expect(payload.v).toBe('1.0.0');
      expect(payload.act).toBe('start-workflow');
      expect(payload.seq).toBe(0);
    });

    it('should throw on garbage input', () => {
      expect(() => decodeSessionToken('not-valid')).toThrow('Invalid session token');
    });

    it('should throw on empty string', () => {
      expect(() => decodeSessionToken('')).toThrow();
    });

    it('should throw on valid base64 with wrong structure', () => {
      const bad = Buffer.from(JSON.stringify({ foo: 'bar' })).toString('base64url');
      expect(() => decodeSessionToken(bad)).toThrow('Missing or invalid token fields');
    });
  });

  describe('advanceToken', () => {
    it('should increment seq by 1', () => {
      const token = createSessionToken('work-package', '3.4.0');
      const advanced = advanceToken(token);
      const payload = decodeSessionToken(advanced);
      expect(payload.seq).toBe(1);
    });

    it('should increment cumulatively', () => {
      let token = createSessionToken('work-package', '3.4.0');
      token = advanceToken(token);
      token = advanceToken(token);
      token = advanceToken(token);
      const payload = decodeSessionToken(token);
      expect(payload.seq).toBe(3);
    });

    it('should update act when provided', () => {
      const token = createSessionToken('work-package', '3.4.0', 'start-work-package');
      const advanced = advanceToken(token, { act: 'design-philosophy' });
      const payload = decodeSessionToken(advanced);
      expect(payload.act).toBe('design-philosophy');
      expect(payload.seq).toBe(1);
    });

    it('should preserve fields when not updating act', () => {
      const token = createSessionToken('work-package', '3.4.0', 'start-work-package');
      const advanced = advanceToken(token);
      const payload = decodeSessionToken(advanced);
      expect(payload.wf).toBe('work-package');
      expect(payload.v).toBe('3.4.0');
      expect(payload.act).toBe('start-work-package');
    });

    it('should produce different token strings', () => {
      const token = createSessionToken('work-package', '3.4.0');
      const advanced = advanceToken(token);
      expect(advanced).not.toBe(token);
    });
  });

  describe('token opacity', () => {
    it('token should not contain readable workflow id', () => {
      const token = createSessionToken('work-package', '3.4.0');
      expect(token).not.toContain('work-package');
      expect(token).not.toContain('3.4.0');
    });

    it('token should not look like JSON', () => {
      const token = createSessionToken('work-package', '3.4.0');
      expect(token).not.toContain('{');
      expect(token).not.toContain('"');
    });
  });
});
