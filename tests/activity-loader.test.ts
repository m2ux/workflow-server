import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readActivity, listActivities, readActivityIndex } from '../src/loaders/activity-loader.js';
import { resolve, join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');

describe('activity-loader', () => {
  describe('readActivity', () => {
    it('should load a known activity from a specific workflow', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'discover-session', 'meta');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('discover-session');
        expect(result.value.version).toBeDefined();
        expect(result.value.name).toBeDefined();
        // discover-session has migrated off skills.primary; operations[] may be omitted entirely
        // when the activity relies solely on the core worker operations bundled by get_activity.
        expect((result.value as { skills?: unknown }).skills).toBeUndefined();
        expect(result.value.workflowId).toBe('meta');
      }
    });

    it('should include next_action guidance pointing to the first step with a skill', async () => {
      // Use work-package start-work-package activity which has steps with skills
      const result = await readActivity(WORKFLOW_DIR, 'start-work-package', 'work-package');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.next_action).toBeDefined();
        expect(result.value.next_action?.tool).toBe('get_skill');
        expect(result.value.next_action?.parameters.step_id).toBeDefined();
      }
    });

    it('should find an activity by searching all workflows when workflowId is omitted', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'discover-session');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('discover-session');
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
      const result = await readActivity(WORKFLOW_DIR, 'discover-session', 'no-such-workflow');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ActivityNotFoundError');
      }
    });

    it('should have all required fields on a successfully loaded activity', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'dispatch-client-workflow', 'meta');

      expect(result.success).toBe(true);
      if (result.success) {
        const activity = result.value;
        expect(typeof activity.id).toBe('string');
        expect(typeof activity.version).toBe('string');
        expect(typeof activity.name).toBe('string');
        if (activity.skills && typeof activity.skills === 'object' && 'primary' in activity.skills && activity.skills.primary) {
          expect(typeof activity.skills.primary).toBe('string');
        }
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

      expect(activities.length).toBeGreaterThanOrEqual(1);
      const ids = activities.map(a => a.id);
      expect(ids).toContain('discover-session');
    });

    it('should include index, id, name, path, and workflowId in each entry', async () => {
      const activities = await listActivities(WORKFLOW_DIR, 'meta');
      const startWf = activities.find(a => a.id === 'discover-session');

      expect(startWf).toBeDefined();
      expect(startWf?.index).toBe('00');
      expect(startWf?.name).toBe('Discover Session');
      expect(startWf?.path).toBe('00-discover-session.toon');
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

        const matchesStartWorkflow = Object.entries(result.value.quick_match)
          .some(([, activityId]) => activityId === 'discover-session');
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
