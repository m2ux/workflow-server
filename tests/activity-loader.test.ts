import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readActivity, listActivities } from '../src/loaders/activity-loader.js';
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
        // discover-session's steps bind their operations via step.technique.
        expect(result.value.steps?.some((s) => s.technique)).toBe(true);
        expect(result.value.workflowId).toBe('meta');
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
        if (activity.techniques) {
          expect(Array.isArray(activity.techniques)).toBe(true);
          for (const t of activity.techniques) expect(typeof t).toBe('string');
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
        join(tempDir, 'test-wf', 'activities', '01-bad-activity.yaml'),
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

    it('should return ActivityNotFoundError for YAML missing required fields', async () => {
      await writeFile(
        join(tempDir, 'test-wf', 'activities', '01-missing-fields.yaml'),
        'id: missing-fields\nname: Missing Fields\n',
        'utf-8',
      );
      const result = await readActivity(tempDir, 'missing-fields', 'test-wf');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ActivityNotFoundError');
      }
    });

    it('should return ActivityNotFoundError for empty YAML file', async () => {
      await writeFile(
        join(tempDir, 'test-wf', 'activities', '01-empty.yaml'),
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
      expect(startWf?.path).toBe('00-discover-session.yaml');
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
});
