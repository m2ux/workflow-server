import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateSessionToken, validateSessionToken } from '../src/utils/session.js';
import { encryptToken, decryptToken } from '../src/utils/crypto.js';
import { randomBytes } from 'node:crypto';

describe('session token utilities', () => {
  describe('generateSessionToken', () => {
    it('should produce token matching structured format', () => {
      const token = generateSessionToken('3.4.0');
      expect(token).toMatch(/^[\d.]+_\d+_[0-9a-f]{8}$/);
    });

    it('should embed the workflow version as prefix', () => {
      const token = generateSessionToken('2.1.0');
      expect(token.startsWith('2.1.0_')).toBe(true);
    });

    it('should produce unique tokens on successive calls', () => {
      const tokens = new Set(Array.from({ length: 10 }, () => generateSessionToken('1.0.0')));
      expect(tokens.size).toBe(10);
    });

    it('should embed a recent epoch timestamp', () => {
      const before = Math.floor(Date.now() / 1000);
      const token = generateSessionToken('1.0.0');
      const after = Math.floor(Date.now() / 1000);
      const epoch = parseInt(token.split('_')[1]!, 10);
      expect(epoch).toBeGreaterThanOrEqual(before);
      expect(epoch).toBeLessThanOrEqual(after);
    });
  });

  describe('validateSessionToken', () => {
    it('should accept valid tokens', () => {
      expect(validateSessionToken('3.4.0_1711300000_a3b2c1d4')).toBe(true);
      expect(validateSessionToken('1.0.0_1700000000_00000000')).toBe(true);
      expect(validateSessionToken('10.20.30_9999999999_abcdef01')).toBe(true);
    });

    it('should reject tokens without version prefix', () => {
      expect(validateSessionToken('_1711300000_a3b2c1d4')).toBe(false);
    });

    it('should reject tokens with wrong separators', () => {
      expect(validateSessionToken('3.4.0-1711300000-a3b2c1d4')).toBe(false);
    });

    it('should reject tokens with short hex part', () => {
      expect(validateSessionToken('3.4.0_1711300000_a3b2c1')).toBe(false);
    });

    it('should reject tokens with non-hex characters', () => {
      expect(validateSessionToken('3.4.0_1711300000_g3b2c1d4')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateSessionToken('')).toBe(false);
    });

    it('should reject tokens with extra segments', () => {
      expect(validateSessionToken('3.4.0_1711300000_a3b2c1d4_extra')).toBe(false);
    });
  });
});

describe('token encryption', () => {
  const testKey = randomBytes(32);
  const testToken = '3.4.0_1711300000_a3b2c1d4';

  describe('encryptToken / decryptToken', () => {
    it('should produce ciphertext different from plaintext', () => {
      const encrypted = encryptToken(testToken, testKey);
      expect(encrypted).not.toBe(testToken);
    });

    it('should round-trip: decrypt(encrypt(token)) returns original', () => {
      const encrypted = encryptToken(testToken, testKey);
      const decrypted = decryptToken(encrypted, testKey);
      expect(decrypted).toBe(testToken);
    });

    it('should produce different ciphertext for same input (random IV)', () => {
      const a = encryptToken(testToken, testKey);
      const b = encryptToken(testToken, testKey);
      expect(a).not.toBe(b);
    });

    it('should fail with wrong key', () => {
      const encrypted = encryptToken(testToken, testKey);
      const wrongKey = randomBytes(32);
      expect(() => decryptToken(encrypted, wrongKey)).toThrow();
    });

    it('should fail with malformed encrypted string', () => {
      expect(() => decryptToken('not-valid', testKey)).toThrow();
    });
  });
});
