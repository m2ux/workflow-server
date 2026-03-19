import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  WorkflowStateSchema,
  NestedWorkflowStateSchema,
  NestedTriggeredWorkflowRefSchema,
  StateSaveFileSchema,
  createInitialState,
} from '../src/schema/state.schema.js';
import { encodeToon, decodeToon } from '../src/utils/toon.js';

const TEST_DIR = join(tmpdir(), `state-persistence-test-${Date.now()}`);

beforeEach(async () => { await mkdir(TEST_DIR, { recursive: true }); });
afterEach(async () => { await rm(TEST_DIR, { recursive: true, force: true }); });

describe('state-persistence', () => {
  describe('NestedTriggeredWorkflowRefSchema', () => {
    it('should validate a triggered ref without nested state', () => {
      const ref = {
        workflowId: 'prism',
        triggeredAt: '2026-03-19T12:00:00Z',
        triggeredFrom: { activityId: 'comprehension', stepIndex: 2 },
        status: 'completed',
      };
      const result = NestedTriggeredWorkflowRefSchema.safeParse(ref);
      expect(result.success).toBe(true);
    });

    it('should validate a triggered ref with nested state', () => {
      const ref = {
        workflowId: 'prism',
        triggeredAt: '2026-03-19T12:00:00Z',
        triggeredFrom: { activityId: 'comprehension' },
        status: 'completed',
        state: {
          workflowId: 'prism',
          workflowVersion: '1.5.0',
          stateVersion: 1,
          startedAt: '2026-03-19T12:00:00Z',
          updatedAt: '2026-03-19T12:30:00Z',
          currentActivity: 'deliver-result',
          completedActivities: ['select-mode', 'deliver-result'],
          variables: { pipeline_mode: 'full-prism' },
          triggeredWorkflows: [],
          status: 'completed',
        },
      };
      const result = NestedTriggeredWorkflowRefSchema.safeParse(ref);
      expect(result.success).toBe(true);
    });
  });

  describe('NestedWorkflowStateSchema', () => {
    it('should validate a flat state (no children)', () => {
      const state = createInitialState('work-package', '3.4.0', 'intake', { target_path: '.' });
      const result = NestedWorkflowStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });

    it('should validate state with one level of nesting', () => {
      const state = {
        workflowId: 'work-package',
        workflowVersion: '3.4.0',
        stateVersion: 5,
        startedAt: '2026-03-19T10:00:00Z',
        updatedAt: '2026-03-19T15:00:00Z',
        currentActivity: 'implementation',
        completedActivities: ['intake', 'design-philosophy'],
        variables: { target_path: 'src/module' },
        triggeredWorkflows: [{
          workflowId: 'prism',
          triggeredAt: '2026-03-19T12:00:00Z',
          triggeredFrom: { activityId: 'comprehension', stepIndex: 2 },
          status: 'completed' as const,
          state: {
            workflowId: 'prism',
            workflowVersion: '1.5.0',
            stateVersion: 3,
            startedAt: '2026-03-19T12:00:00Z',
            updatedAt: '2026-03-19T12:30:00Z',
            currentActivity: 'deliver-result',
            completedActivities: ['select-mode', 'plan-analysis', 'deliver-result'],
            variables: { pipeline_mode: 'full-prism' },
            triggeredWorkflows: [],
            status: 'completed' as const,
          },
        }],
        status: 'running' as const,
      };
      const result = NestedWorkflowStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });

    it('should validate state with two levels of nesting', () => {
      const state = {
        workflowId: 'work-packages',
        workflowVersion: '3.0.0',
        stateVersion: 10,
        startedAt: '2026-03-19T09:00:00Z',
        updatedAt: '2026-03-19T16:00:00Z',
        currentActivity: 'implementation',
        completedActivities: ['planning'],
        variables: {},
        triggeredWorkflows: [{
          workflowId: 'work-package',
          triggeredAt: '2026-03-19T10:00:00Z',
          triggeredFrom: { activityId: 'implementation', stepIndex: 1 },
          status: 'running' as const,
          state: {
            workflowId: 'work-package',
            workflowVersion: '3.4.0',
            stateVersion: 5,
            startedAt: '2026-03-19T10:00:00Z',
            updatedAt: '2026-03-19T15:00:00Z',
            currentActivity: 'implementation',
            completedActivities: ['intake'],
            variables: {},
            triggeredWorkflows: [{
              workflowId: 'prism',
              triggeredAt: '2026-03-19T12:00:00Z',
              triggeredFrom: { activityId: 'comprehension' },
              status: 'completed' as const,
              state: {
                workflowId: 'prism',
                workflowVersion: '1.5.0',
                stateVersion: 2,
                startedAt: '2026-03-19T12:00:00Z',
                updatedAt: '2026-03-19T12:30:00Z',
                currentActivity: 'deliver-result',
                completedActivities: ['select-mode'],
                variables: {},
                triggeredWorkflows: [],
                status: 'completed' as const,
              },
            }],
            status: 'running' as const,
          },
        }],
        status: 'suspended' as const,
      };
      const result = NestedWorkflowStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });
  });

  describe('StateSaveFileSchema', () => {
    it('should validate a complete save file', () => {
      const saveFile = {
        id: 'state-2026-03-19T15-30-00-000Z',
        savedAt: '2026-03-19T15:30:00Z',
        description: 'Paused at implementation',
        workflowId: 'work-package',
        workflowVersion: '3.4.0',
        planningFolder: '.engineering/artifacts/planning/2026-03-19-feature/',
        state: {
          workflowId: 'work-package',
          workflowVersion: '3.4.0',
          stateVersion: 1,
          startedAt: '2026-03-19T10:00:00Z',
          updatedAt: '2026-03-19T15:00:00Z',
          currentActivity: 'implementation',
          completedActivities: ['intake'],
          variables: {},
          triggeredWorkflows: [],
          status: 'running' as const,
        },
      };
      const result = StateSaveFileSchema.safeParse(saveFile);
      expect(result.success).toBe(true);
    });
  });

  describe('TOON round-trip', () => {
    it('should encode and decode a flat state', () => {
      const state = createInitialState('test-workflow', '1.0.0', 'first-activity', { key: 'value' });
      const saveFile = {
        id: 'test-save',
        savedAt: new Date().toISOString(),
        workflowId: state.workflowId,
        workflowVersion: state.workflowVersion,
        planningFolder: '/tmp/test',
        state,
      };
      const encoded = encodeToon(saveFile as unknown as Record<string, unknown>);
      const decoded = decodeToon<Record<string, unknown>>(encoded);
      expect(decoded).toEqual(saveFile);
    });

    it('should encode and decode nested state', () => {
      const saveFile = {
        id: 'nested-test',
        savedAt: '2026-03-19T15:30:00Z',
        workflowId: 'work-package',
        workflowVersion: '3.4.0',
        planningFolder: '/tmp/test',
        state: {
          workflowId: 'work-package',
          workflowVersion: '3.4.0',
          stateVersion: 3,
          startedAt: '2026-03-19T10:00:00Z',
          updatedAt: '2026-03-19T15:00:00Z',
          currentActivity: 'implementation',
          currentStep: 3,
          completedActivities: ['intake', 'design'],
          skippedActivities: [],
          completedSteps: {},
          checkpointResponses: {
            'intake-mode': { optionId: 'standard', respondedAt: '2026-03-19T10:05:00Z' },
          },
          decisionOutcomes: {},
          activeLoops: [],
          variables: { target_path: 'src/module' },
          history: [],
          status: 'running',
          triggeredWorkflows: [{
            workflowId: 'prism',
            triggeredAt: '2026-03-19T12:00:00Z',
            triggeredFrom: { activityId: 'comprehension', stepIndex: 2 },
            status: 'completed',
            state: {
              workflowId: 'prism',
              workflowVersion: '1.5.0',
              stateVersion: 2,
              startedAt: '2026-03-19T12:00:00Z',
              updatedAt: '2026-03-19T12:30:00Z',
              currentActivity: 'deliver-result',
              completedActivities: ['select-mode', 'deliver-result'],
              skippedActivities: [],
              completedSteps: {},
              checkpointResponses: {},
              decisionOutcomes: {},
              activeLoops: [],
              variables: { pipeline_mode: 'full-prism' },
              history: [],
              status: 'completed',
              triggeredWorkflows: [],
            },
          }],
        },
      };
      const encoded = encodeToon(saveFile as unknown as Record<string, unknown>);
      const decoded = decodeToon<Record<string, unknown>>(encoded);
      expect(decoded).toEqual(saveFile);
    });

    it('should write and read a state file from disk', async () => {
      const state = createInitialState('disk-test', '1.0.0', 'start', { x: 42 });
      const saveFile = {
        id: 'disk-test',
        savedAt: new Date().toISOString(),
        workflowId: state.workflowId,
        workflowVersion: state.workflowVersion,
        planningFolder: TEST_DIR,
        state,
      };
      const filePath = join(TEST_DIR, 'workflow-state.toon');
      const encoded = encodeToon(saveFile as unknown as Record<string, unknown>);
      const { writeFile: wf } = await import('node:fs/promises');
      await wf(filePath, encoded, 'utf-8');

      const content = await readFile(filePath, 'utf-8');
      const decoded = decodeToon<Record<string, unknown>>(content);
      const result = StateSaveFileSchema.safeParse(decoded);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.workflowId).toBe('disk-test');
        expect(result.data.state.currentActivity).toBe('start');
        expect(result.data.state.variables).toEqual({ x: 42 });
      }
    });
  });

  describe('backward compatibility', () => {
    it('base WorkflowStateSchema still works without nested state', () => {
      const state = createInitialState('compat-test', '1.0.0', 'first');
      const result = WorkflowStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });

    it('base WorkflowStateSchema accepts triggeredWorkflows without state field', () => {
      const state = {
        ...createInitialState('compat-test', '1.0.0', 'first'),
        triggeredWorkflows: [{
          workflowId: 'child',
          triggeredAt: '2026-03-19T12:00:00Z',
          triggeredFrom: { activityId: 'parent-activity' },
          status: 'completed' as const,
        }],
      };
      const result = WorkflowStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });
  });
});
