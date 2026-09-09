import { describe, it, expect } from 'vitest';
import {
  safeValidateSessionFile,
  validateSessionFile,
  createInitialSessionFile,
  bindSessionRepo,
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
    currentTechnique: '',
    condition: '',
    variables: {},
    completedActivities: [],
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

  describe('recursive embedded state', () => {
    /** A launched-workflow record holding `state`, the shape dispatch writes. */
    function record(state: SessionFile): SessionFile['triggeredWorkflows'][number] {
      return {
        workflowId: state.workflowId,
        sessionIndex: state.sessionIndex,
        triggeredAt: '2026-05-13T12:00:00.000Z',
        triggeredFrom: { activityId: 'execute-analysis' },
        status: 'running',
        state,
      };
    }

    it('accepts an embedded launched session and round-trips through serialise/parse', () => {
      const child = minimalSession({ sessionIndex: 'CHILDX', workflowId: 'prism' });
      const launcher = minimalSession({ triggeredWorkflows: [record(child)] });

      const decoded = JSON.parse(JSON.stringify(launcher));
      const result = safeValidateSessionFile(decoded);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.triggeredWorkflows[0]?.state?.sessionIndex).toBe('CHILDX');
        expect(result.data.triggeredWorkflows[0]?.state?.workflowId).toBe('prism');
      }
    });

    it('round-trips three levels of embedding', () => {
      const grandchild = minimalSession({ sessionIndex: 'GGGGGG', workflowId: 'prism' });
      const child = minimalSession({
        sessionIndex: 'CHILDX',
        workflowId: 'prism-evaluate',
        triggeredWorkflows: [record(grandchild)],
      });
      const launcher = minimalSession({
        sessionIndex: 'PRNTPR',
        workflowId: 'meta',
        triggeredWorkflows: [record(child)],
      });

      const parsed = validateSessionFile(JSON.parse(JSON.stringify(launcher)));

      const embedded = parsed.triggeredWorkflows[0]?.state;
      expect(embedded?.sessionIndex).toBe('CHILDX');
      expect(embedded?.triggeredWorkflows[0]?.state?.sessionIndex).toBe('GGGGGG');
      // The deepest session launched nothing of its own.
      expect(embedded?.triggeredWorkflows[0]?.state?.triggeredWorkflows).toEqual([]);
    });

    it('rejects when an embedded session itself fails validation', () => {
      const child = minimalSession({ sessionIndex: 'CHILDX' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (child as any).workflowId;
      const launcher = minimalSession({ triggeredWorkflows: [record(child)] });
      const result = safeValidateSessionFile(launcher);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join('.'));
        expect(paths.some((p) => p.startsWith('triggeredWorkflows.0.state'))).toBe(true);
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

    it('launches nothing of its own', () => {
      const file = createInitialSessionFile({
        sessionIndex: VALID_INDEX,
        workflowId: 'work-package',
        workflowVersion: '3.11.0',
        agentId: 'worker',
      });
      expect(file.triggeredWorkflows).toEqual([]);
    });

    it('includes optional repo when provided', () => {
      const file = createInitialSessionFile({
        sessionIndex: VALID_INDEX,
        workflowId: 'meta',
        workflowVersion: '5.0.0',
        agentId: 'orchestrator',
        repo: 'acme/app',
      });
      expect(file.repo).toBe('acme/app');
      expect(safeValidateSessionFile(file).success).toBe(true);
    });
  });

  describe('bindSessionRepo', () => {
    const identity = (s: string) => s;

    it('binds repo when missing', () => {
      const file = createInitialSessionFile({
        sessionIndex: VALID_INDEX,
        workflowId: 'meta',
        workflowVersion: '5.0.0',
        agentId: 'orchestrator',
      });
      const next = bindSessionRepo(file, 'acme/app', identity);
      expect(next.repo).toBe('acme/app');
      expect(file.repo).toBeUndefined();
    });

    it('is idempotent for the same repo', () => {
      const file = createInitialSessionFile({
        sessionIndex: VALID_INDEX,
        workflowId: 'meta',
        workflowVersion: '5.0.0',
        agentId: 'orchestrator',
        repo: 'acme/app',
      });
      const next = bindSessionRepo(file, 'acme/app', identity);
      expect(next).toBe(file);
    });

    it('rejects a conflicting rebind', () => {
      const file = createInitialSessionFile({
        sessionIndex: VALID_INDEX,
        workflowId: 'meta',
        workflowVersion: '5.0.0',
        agentId: 'orchestrator',
        repo: 'acme/app',
      });
      expect(() => bindSessionRepo(file, 'other/repo', identity)).toThrow(
        /already bound to repo 'acme\/app'/,
      );
    });
  });

});
