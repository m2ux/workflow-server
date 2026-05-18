import { describe, it, expect } from 'vitest';
import {
  SessionFileSchema,
  safeValidateSessionFile,
  validateSessionFile,
  createInitialSessionFile,
  parentChainDepth,
  PARENT_CHAIN_DEPTH_WARN_THRESHOLD,
  type SessionFile,
} from '../src/schema/session.schema.js';

const VALID_INDEX = 'ABCDEF';

function minimalSession(overrides: Partial<SessionFile> = {}): SessionFile {
  return {
    schemaVersion: 1,
    sessionIndex: VALID_INDEX,
    workflowId: 'work-package',
    workflowVersion: '3.11.0',
    agentId: 'worker',
    seq: 0,
    ts: 1778700000,
    startedAt: '2026-05-13T12:00:00.000Z',
    currentActivity: '',
    currentSkill: '',
    condition: '',
    variables: {},
    completedActivities: [],
    skippedActivities: [],
    checkpointResponses: {},
    history: [],
    triggeredWorkflows: [],
    ...overrides,
  };
}

describe('SessionFile schema', () => {
  describe('minimal valid payload', () => {
    it('accepts a minimal valid session.json with all required fields', () => {
      const data = minimalSession();
      const result = safeValidateSessionFile(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.schemaVersion).toBe(1);
        expect(result.data.sessionIndex).toBe(VALID_INDEX);
        expect(result.data.workflowId).toBe('work-package');
      }
    });

    it('strict validateSessionFile() returns parsed data for a minimal valid payload', () => {
      const data = minimalSession();
      const parsed = validateSessionFile(data);
      expect(parsed.sessionIndex).toBe(VALID_INDEX);
      expect(parsed.history).toEqual([]);
    });
  });

  describe('required-field rejection', () => {
    it('rejects a payload missing schemaVersion', () => {
      const data = minimalSession();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (data as any).schemaVersion;
      const result = safeValidateSessionFile(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join('.'));
        expect(paths).toContain('schemaVersion');
      }
    });

    it('rejects a payload with schemaVersion other than 1', () => {
      const data = { ...minimalSession(), schemaVersion: 2 as unknown as 1 };
      const result = safeValidateSessionFile(data);
      expect(result.success).toBe(false);
    });

    it('rejects a payload missing workflowId', () => {
      const data = minimalSession();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (data as any).workflowId;
      const result = safeValidateSessionFile(data);
      expect(result.success).toBe(false);
    });

    it('rejects a payload missing sessionIndex', () => {
      const data = minimalSession();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (data as any).sessionIndex;
      const result = safeValidateSessionFile(data);
      expect(result.success).toBe(false);
    });

    it('rejects a sessionIndex that does not match the 6-char base32 regex', () => {
      const data = minimalSession({ sessionIndex: 'AB1DEF' }); // '1' is not in A-Z2-7
      const result = safeValidateSessionFile(data);
      expect(result.success).toBe(false);
    });

    it('rejects a sessionIndex shorter than 6 chars', () => {
      const data = minimalSession({ sessionIndex: 'ABCDE' });
      const result = safeValidateSessionFile(data);
      expect(result.success).toBe(false);
    });

    it('rejects a workflowVersion that is not semantic-version-shaped', () => {
      const data = minimalSession({ workflowVersion: 'v3.11' });
      const result = safeValidateSessionFile(data);
      expect(result.success).toBe(false);
    });

    it('rejects a non-ISO startedAt timestamp', () => {
      const data = minimalSession({ startedAt: 'yesterday' });
      const result = safeValidateSessionFile(data);
      expect(result.success).toBe(false);
    });
  });

  describe('activeCheckpoint field', () => {
    it('accepts an activeCheckpoint object', () => {
      const data = minimalSession({
        activeCheckpoint: {
          checkpointId: 'approve',
          activityId: 'review',
          yieldedAt: '2026-05-13T12:30:00.000Z',
        },
      });
      const result = safeValidateSessionFile(data);
      expect(result.success).toBe(true);
    });

    it('rejects an activeCheckpoint missing checkpointId', () => {
      const data = minimalSession({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        activeCheckpoint: { activityId: 'review', yieldedAt: '2026-05-13T12:30:00.000Z' } as any,
      });
      const result = safeValidateSessionFile(data);
      expect(result.success).toBe(false);
    });

    it('omits activeCheckpoint when absent', () => {
      const data = minimalSession();
      const parsed = validateSessionFile(data);
      expect(parsed.activeCheckpoint).toBeUndefined();
    });
  });

  describe('recursive parentSession', () => {
    it('accepts recursive parentSession and round-trips through serialise/parse', () => {
      const parent = minimalSession({
        sessionIndex: 'PARENT',
        workflowId: 'meta',
        agentId: 'orchestrator',
      });
      const child = minimalSession({ parentSession: parent });

      const json = JSON.stringify(child);
      const decoded = JSON.parse(json);
      const result = safeValidateSessionFile(decoded);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parentSession?.sessionIndex).toBe('PARENT');
        expect(result.data.parentSession?.workflowId).toBe('meta');
      }
    });

    it('round-trips a 3-level nested parentSession.parentSession.parentSession', () => {
      const gp = minimalSession({ sessionIndex: 'GGGGGG', workflowId: 'meta' });
      const grandparent = minimalSession({
        sessionIndex: 'GRANDP',
        workflowId: 'roadmap',
        parentSession: gp,
      });
      const parent = minimalSession({
        sessionIndex: 'PRNTPR',
        workflowId: 'work-packages',
        parentSession: grandparent,
      });
      const child = minimalSession({
        sessionIndex: 'CHILDX',
        workflowId: 'work-package',
        parentSession: parent,
      });

      const json = JSON.stringify(child);
      const decoded = JSON.parse(json);
      const parsed = validateSessionFile(decoded);

      expect(parsed.parentSession?.sessionIndex).toBe('PRNTPR');
      expect(parsed.parentSession?.parentSession?.sessionIndex).toBe('GRANDP');
      expect(parsed.parentSession?.parentSession?.parentSession?.sessionIndex).toBe('GGGGGG');
      // ensure deepest parent has no further ancestor
      expect(parsed.parentSession?.parentSession?.parentSession?.parentSession).toBeUndefined();
    });

    it('rejects when a nested parentSession itself fails validation', () => {
      const parent = minimalSession();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (parent as any).workflowId;
      const child = minimalSession({ parentSession: parent });
      const result = safeValidateSessionFile(child);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join('.'));
        expect(paths.some((p) => p.startsWith('parentSession'))).toBe(true);
      }
    });
  });

  describe('structured error reporting', () => {
    it('safeValidateSessionFile returns structured errors with field paths for invalid payloads', () => {
      const data = minimalSession({ sessionIndex: 'lowercase' as string });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any).seq = 'not-a-number';
      const result = safeValidateSessionFile(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join('.'));
        expect(paths).toContain('sessionIndex');
        expect(paths).toContain('seq');
        // every issue must have a defined path
        for (const issue of result.error.issues) {
          expect(Array.isArray(issue.path)).toBe(true);
        }
      }
    });
  });

  describe('createInitialSessionFile', () => {
    it('produces a SessionFile that passes schema validation', () => {
      const file = createInitialSessionFile({
        sessionIndex: VALID_INDEX,
        workflowId: 'work-package',
        workflowVersion: '3.11.0',
        agentId: 'worker',
      });
      const result = safeValidateSessionFile(file);
      expect(result.success).toBe(true);
      expect(file.schemaVersion).toBe(1);
      expect(file.seq).toBe(0);
      // Fresh sessions seed history with a workflow_started event and start
      // in the `running` status.
      expect(file.history).toHaveLength(1);
      expect(file.history[0]).toMatchObject({ type: 'workflow_started' });
      expect(file.status).toBe('running');
    });

    it('attaches an optional parentSession when provided', () => {
      const parent = createInitialSessionFile({
        sessionIndex: 'PARENT',
        workflowId: 'meta',
        workflowVersion: '5.0.0',
        agentId: 'orchestrator',
      });
      const child = createInitialSessionFile({
        sessionIndex: VALID_INDEX,
        workflowId: 'work-package',
        workflowVersion: '3.11.0',
        agentId: 'worker',
        parentSession: parent,
      });
      expect(child.parentSession?.sessionIndex).toBe('PARENT');
      // schema round-trip
      const parsed = validateSessionFile(JSON.parse(JSON.stringify(child)));
      expect(parsed.parentSession?.workflowId).toBe('meta');
    });

    it('omits parentSession field when not provided', () => {
      const file = createInitialSessionFile({
        sessionIndex: VALID_INDEX,
        workflowId: 'work-package',
        workflowVersion: '3.11.0',
        agentId: 'worker',
      });
      expect(file.parentSession).toBeUndefined();
    });
  });

  describe('schema exports', () => {
    it('SessionFileSchema is a Zod schema', () => {
      expect(SessionFileSchema).toBeDefined();
      expect(typeof SessionFileSchema.parse).toBe('function');
      expect(typeof SessionFileSchema.safeParse).toBe('function');
    });

    it('exposes PARENT_CHAIN_DEPTH_WARN_THRESHOLD as a numeric constant', () => {
      expect(typeof PARENT_CHAIN_DEPTH_WARN_THRESHOLD).toBe('number');
      expect(PARENT_CHAIN_DEPTH_WARN_THRESHOLD).toBe(5);
    });
  });

  describe('parentChainDepth helper', () => {
    it('returns 0 for a session with no parent', () => {
      const state = minimalSession();
      expect(parentChainDepth(state)).toBe(0);
    });

    it('returns 0 when called with undefined', () => {
      expect(parentChainDepth(undefined)).toBe(0);
    });

    it('returns 1 for a single-parent chain', () => {
      const parent = minimalSession({ sessionIndex: 'PARENT' });
      const child = minimalSession({ parentSession: parent });
      expect(parentChainDepth(child)).toBe(1);
    });

    it('returns N for an N-ancestor chain', () => {
      let cursor: SessionFile = minimalSession({ sessionIndex: 'ROOTAA' });
      // Build a chain of 7 ancestors above the leaf.
      for (let i = 0; i < 7; i++) {
        cursor = minimalSession({ sessionIndex: 'AAAAAA', parentSession: cursor });
      }
      expect(parentChainDepth(cursor)).toBe(7);
    });

    it('caps traversal at the safety limit when parentSession forms a cycle', () => {
      // Forge a cycle by self-reference (cannot happen via schema round-trip
      // because Zod recurses through `z.lazy`, but possible in process-only
      // hand-built objects).
      const node = minimalSession();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node as any).parentSession = node;
      const d = parentChainDepth(node);
      // Cap is 1024; helper must return without infinite-looping.
      expect(d).toBe(1024);
    });
  });
});
