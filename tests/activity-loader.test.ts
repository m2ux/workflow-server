import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readActivity, listActivities, readActivityIndex } from '../src/loaders/activity-loader.js';
import { resolve, join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../.engineering/workflows');

describe('activity-loader', () => {
  describe('readActivity', () => {
    it('should load a known activity from a specific workflow', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'start-workflow', 'meta');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('start-workflow');
        expect(result.value.version).toBeDefined();
        expect(result.value.name).toBeDefined();
        expect(result.value.skills).toBeDefined();
        expect(result.value.skills.primary).toBeDefined();
        expect(result.value.workflowId).toBe('meta');
      }
    });

    it('should include next_action guidance pointing to the first step with a skill', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'start-workflow', 'meta');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.next_action).toBeDefined();
        expect(result.value.next_action.tool).toBe('get_skill');
        expect(result.value.next_action.parameters.step_id).toBeDefined();
      }
    });

    it('should find an activity by searching all workflows when workflowId is omitted', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'start-workflow');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('start-workflow');
      }
    });

    it('should return ActivityNotFoundError for non-existent activity', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'this-activity-does-not-exist', 'meta');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ActivityNotFoundError');
        expect(result.error.code).toBe('ACTIVITY_NOT_FOUND');
      }
    });

    it('should return ActivityNotFoundError for non-existent workflow', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'start-workflow', 'no-such-workflow');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ActivityNotFoundError');
      }
    });

    it('should have all required fields on a successfully loaded activity', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'resume-workflow', 'meta');

      expect(result.success).toBe(true);
      if (result.success) {
        const activity = result.value;
        expect(typeof activity.id).toBe('string');
        expect(typeof activity.version).toBe('string');
        expect(typeof activity.name).toBe('string');
        expect(activity.skills).toBeDefined();
        expect(typeof activity.skills.primary).toBe('string');
      }
    });
  });

  describe('readActivity validation failures (BF-08)', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await import('node:fs/promises').then(fs =>
        fs.mkdtemp(join(tmpdir(), 'activity-test-'))
      );
      await mkdir(join(tempDir, 'test-wf', 'activities'), { recursive: true });
    });

    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });

    it('should return ActivityNotFoundError on validation failure, not raw data', async () => {
      await writeFile(
        join(tempDir, 'test-wf', 'activities', '01-bad-activity.toon'),
        'just plain text, not a valid activity',
        'utf-8',
      );
      const result = await readActivity(tempDir, 'bad-activity', 'test-wf');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ActivityNotFoundError');
        expect(result.error.code).toBe('ACTIVITY_NOT_FOUND');
        expect(result.error.activityId).toBe('bad-activity');
      }
    });

    it('should return ActivityNotFoundError for TOON missing required fields', async () => {
      await writeFile(
        join(tempDir, 'test-wf', 'activities', '01-missing-fields.toon'),
        'id: missing-fields\nname: Missing Fields\n',
        'utf-8',
      );
      const result = await readActivity(tempDir, 'missing-fields', 'test-wf');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ActivityNotFoundError');
      }
    });

    it('should return ActivityNotFoundError for empty TOON file', async () => {
      await writeFile(
        join(tempDir, 'test-wf', 'activities', '01-empty.toon'),
        '',
        'utf-8',
      );
      const result = await readActivity(tempDir, 'empty', 'test-wf');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ActivityNotFoundError');
      }
    });
  });

  describe('listActivities', () => {
    it('should list activities from a specific workflow', async () => {
      const activities = await listActivities(WORKFLOW_DIR, 'meta');

      expect(activities.length).toBeGreaterThanOrEqual(3);
      const ids = activities.map(a => a.id);
      expect(ids).toContain('start-workflow');
      expect(ids).toContain('resume-workflow');
      expect(ids).toContain('end-workflow');
    });

    it('should include index, id, name, path, and workflowId in each entry', async () => {
      const activities = await listActivities(WORKFLOW_DIR, 'meta');
      const startWf = activities.find(a => a.id === 'start-workflow');

      expect(startWf).toBeDefined();
      expect(startWf?.index).toBe('01');
      expect(startWf?.name).toBe('Start Workflow');
      expect(startWf?.path).toBe('01-start-workflow.toon');
      expect(startWf?.workflowId).toBe('meta');
    });

    it('should list activities from all workflows when workflowId is omitted', async () => {
      const activities = await listActivities(WORKFLOW_DIR);

      expect(activities.length).toBeGreaterThan(3);
      const workflowIds = [...new Set(activities.map(a => a.workflowId))];
      expect(workflowIds.length).toBeGreaterThan(1);
    });

    it('should return empty array for non-existent workflow', async () => {
      const activities = await listActivities(WORKFLOW_DIR, 'no-such-workflow');
      expect(activities).toEqual([]);
    });

    it('should sort activities by index within a workflow', async () => {
      const activities = await listActivities(WORKFLOW_DIR, 'meta');
      const indices = activities.map(a => a.index);
      const sorted = [...indices].sort();
      expect(indices).toEqual(sorted);
    });
  });

  describe('readActivityIndex', () => {
    it('should build an index from all workflow activities', async () => {
      const result = await readActivityIndex(WORKFLOW_DIR);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.activities.length).toBeGreaterThanOrEqual(3);
        expect(result.value.description).toBeDefined();
        expect(result.value.usage).toBeDefined();
        expect(result.value.next_action).toBeDefined();
        expect(result.value.next_action.tool).toBe('start_session');
      }
    });

    it('should include id, workflowId, problem, and primary_skill for each entry', async () => {
      const result = await readActivityIndex(WORKFLOW_DIR);

      expect(result.success).toBe(true);
      if (result.success) {
        for (const activity of result.value.activities) {
          expect(activity.id).toBeDefined();
          expect(activity.workflowId).toBeDefined();
          expect(activity.problem).toBeDefined();
          if (activity.next_action) {
            expect(activity.next_action.tool).toBe('get_skill');
            expect(activity.next_action.parameters.step_id).toBeDefined();
          }
        }
      }
    });

    it('should populate quick_match from recognition patterns', async () => {
      const result = await readActivityIndex(WORKFLOW_DIR);

      expect(result.success).toBe(true);
      if (result.success) {
        const keys = Object.keys(result.value.quick_match);
        expect(keys.length).toBeGreaterThan(0);

        // start-workflow has recognition patterns like "Start a workflow"
        const matchesStartWorkflow = Object.entries(result.value.quick_match)
          .some(([, activityId]) => activityId === 'start-workflow');
        expect(matchesStartWorkflow).toBe(true);
      }
    });

    it('should return ActivityNotFoundError for empty workflow directory', async () => {
      const tempDir = await import('node:fs/promises').then(fs =>
        fs.mkdtemp(join(tmpdir(), 'empty-wf-'))
      );
      try {
        const result = await readActivityIndex(tempDir);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.name).toBe('ActivityNotFoundError');
        }
      } finally {
        await rm(tempDir, { recursive: true, force: true });
      }
    });
  });
});
