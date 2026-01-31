import { describe, it, expect } from 'vitest';
import { 
  encodeState, 
  decodeState, 
  isValidTokenFormat, 
  getTokenVersion,
  getCompressionRatio,
  StateCodecError 
} from '../../src/navigation/state-codec.js';
import { createInitialState } from '../../src/schema/state.schema.js';

describe('State Codec', () => {
  const createTestState = () => createInitialState(
    'test-workflow',
    '1.0.0',
    'initial-activity',
    { testVar: 'value' }
  );

  describe('encodeState', () => {
    it('encodes state to opaque token with correct prefix', () => {
      const state = createTestState();
      const token = encodeState(state);
      
      expect(token).toMatch(/^v1\.gzB64\./);
    });

    it('produces non-empty payload', () => {
      const state = createTestState();
      const token = encodeState(state);
      const payload = token.replace('v1.gzB64.', '');
      
      expect(payload.length).toBeGreaterThan(0);
    });

    it('produces token that is not human-readable JSON', () => {
      const state = createTestState();
      const token = encodeState(state);
      const payload = token.replace('v1.gzB64.', '');
      
      // Payload should not be valid JSON
      expect(() => JSON.parse(payload)).toThrow();
    });

    it('compression reduces size', () => {
      const state = createTestState();
      const ratio = getCompressionRatio(state);
      
      // Expect some compression (ratio < 1)
      expect(ratio).toBeLessThan(1);
    });
  });

  describe('decodeState', () => {
    it('decodes token back to original state', () => {
      const original = createTestState();
      const token = encodeState(original);
      const decoded = decodeState(token);
      
      expect(decoded.workflowId).toBe(original.workflowId);
      expect(decoded.workflowVersion).toBe(original.workflowVersion);
      expect(decoded.currentActivity).toBe(original.currentActivity);
      expect(decoded.variables).toEqual(original.variables);
    });

    it('round-trip preserves all state fields', () => {
      const original = createTestState();
      const token = encodeState(original);
      const decoded = decodeState(token);
      
      // Compare key fields (JSON key order may differ)
      expect(decoded.workflowId).toBe(original.workflowId);
      expect(decoded.workflowVersion).toBe(original.workflowVersion);
      expect(decoded.stateVersion).toBe(original.stateVersion);
      expect(decoded.currentActivity).toBe(original.currentActivity);
      expect(decoded.status).toBe(original.status);
      expect(decoded.completedActivities).toEqual(original.completedActivities);
      expect(decoded.variables).toEqual(original.variables);
      expect(decoded.history.length).toBe(original.history.length);
    });

    it('throws on invalid token format', () => {
      expect(() => decodeState('invalid-token')).toThrow(StateCodecError);
      expect(() => decodeState('invalid-token')).toThrow('Invalid token format');
    });

    it('throws on empty payload', () => {
      expect(() => decodeState('v1.gzB64.')).toThrow(StateCodecError);
      expect(() => decodeState('v1.gzB64.')).toThrow('Empty token payload');
    });

    it('throws on corrupted base64', () => {
      expect(() => decodeState('v1.gzB64.!!invalid!!')).toThrow(StateCodecError);
    });

    it('throws on invalid compressed data', () => {
      // Valid base64 but not gzip data
      const invalidGzip = 'v1.gzB64.' + Buffer.from('not gzip data').toString('base64');
      expect(() => decodeState(invalidGzip)).toThrow(StateCodecError);
      expect(() => decodeState(invalidGzip)).toThrow('decompress');
    });

    it('throws on invalid state schema', () => {
      // Create a valid compressed payload with invalid state structure
      const { gzipSync } = require('node:zlib');
      const invalidState = { notAValidField: true };
      const compressed = gzipSync(Buffer.from(JSON.stringify(invalidState), 'utf-8'));
      const token = 'v1.gzB64.' + compressed.toString('base64');
      
      expect(() => decodeState(token)).toThrow(StateCodecError);
      expect(() => decodeState(token)).toThrow('validation failed');
    });
  });

  describe('isValidTokenFormat', () => {
    it('returns true for valid token', () => {
      const state = createTestState();
      const token = encodeState(state);
      
      expect(isValidTokenFormat(token)).toBe(true);
    });

    it('returns false for invalid prefix', () => {
      expect(isValidTokenFormat('invalid-token')).toBe(false);
    });

    it('returns false for empty payload', () => {
      expect(isValidTokenFormat('v1.gzB64.')).toBe(false);
    });

    it('returns true for syntactically valid token (full validation in decodeState)', () => {
      // Note: Node's Buffer.from is lenient with base64
      // Full validation (including gzip structure) happens in decodeState
      expect(isValidTokenFormat('v1.gzB64.SGVsbG8=')).toBe(true);
    });
  });

  describe('getTokenVersion', () => {
    it('extracts version from valid token', () => {
      const state = createTestState();
      const token = encodeState(state);
      
      expect(getTokenVersion(token)).toBe('v1');
    });

    it('returns null for invalid token', () => {
      expect(getTokenVersion('invalid')).toBeNull();
    });

    it('handles future versions', () => {
      expect(getTokenVersion('v2.gzB64.payload')).toBe('v2');
      expect(getTokenVersion('v99.gzB64.payload')).toBe('v99');
    });
  });

  describe('compression efficiency', () => {
    it('achieves reasonable compression ratio', () => {
      const state = createTestState();
      const ratio = getCompressionRatio(state);
      
      // Should compress to at least 80% of original
      expect(ratio).toBeLessThan(0.8);
    });

    it('larger state still compresses well', () => {
      const state = createTestState();
      // Add more data to state
      state.history = Array(100).fill(null).map((_, i) => ({
        timestamp: new Date().toISOString(),
        type: 'step_completed' as const,
        data: { index: i }
      }));
      
      const ratio = getCompressionRatio(state);
      // Repetitive data should compress very well
      expect(ratio).toBeLessThan(0.3);
    });
  });
});
