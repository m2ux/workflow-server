import { describe, it, expect } from 'vitest';
import { listActivities, readActivity, readActivityIndex } from '../src/loaders/activity-loader.js';
import { join } from 'node:path';

const WORKFLOW_DIR = join(process.cwd(), 'registry/workflows');

describe('activity-loader', () => {
  describe('listActivities', () => {
    it('should list available activities from meta workflow', async () => {
      const activities = await listActivities(WORKFLOW_DIR);
      expect(activities.length).toBeGreaterThanOrEqual(3);
      
      const ids = activities.map(i => i.id);
      expect(ids).toContain('start-workflow');
      expect(ids).toContain('resume-workflow');
      expect(ids).toContain('end-workflow');
    });

    it('should not include index.toon in activity list', async () => {
      const activities = await listActivities(WORKFLOW_DIR);
      const ids = activities.map(i => i.id);
      expect(ids).not.toContain('index');
    });

    it('should include index, name, and path in activity entries', async () => {
      const activities = await listActivities(WORKFLOW_DIR);
      const startWorkflow = activities.find(i => i.id === 'start-workflow');
      
      expect(startWorkflow).toBeDefined();
      expect(startWorkflow?.index).toBe('01');
      expect(startWorkflow?.name).toBe('Start Workflow');
      expect(startWorkflow?.path).toBe('01-start-workflow.toon');
    });
  });

  describe('readActivity', () => {
    it('should load a valid activity', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'start-workflow');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('start-workflow');
        expect(result.value.version).toBe('3.0.0');
        expect(result.value.name).toBeDefined();
        expect(result.value.problem).toBeDefined();
      }
    });

    it('should return error for non-existent activity', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'non-existent-activity');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ActivityNotFoundError');
        expect(result.error.code).toBe('ACTIVITY_NOT_FOUND');
      }
    });

    it('should load activity with all required sections', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'start-workflow');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const activity = result.value;
        
        // Check name (required in unified schema)
        expect(activity.name).toBe('Start Workflow');
        
        // Check recognition patterns
        expect(activity.recognition).toBeDefined();
        expect(activity.recognition!.length).toBeGreaterThan(0);
        
        // Check skills
        expect(activity.skills).toBeDefined();
        expect(activity.skills.primary).toBe('workflow-execution');
        expect(activity.skills.supporting).toBeDefined();
        
        // Check outcome
        expect(activity.outcome).toBeDefined();
        expect(activity.outcome!.length).toBeGreaterThan(0);
        
        // Check steps (unified schema uses steps, not flow)
        expect(activity.steps).toBeDefined();
        expect(activity.steps!.length).toBeGreaterThan(0);
        
        // Check context to preserve
        expect(activity.context_to_preserve).toBeDefined();
        expect(activity.context_to_preserve!.length).toBeGreaterThan(0);
      }
    });

    it('should include next_action with primary skill guidance', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'start-workflow');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.next_action).toBeDefined();
        expect(result.value.next_action.tool).toBe('get_skill');
        expect(result.value.next_action.parameters).toBeDefined();
        expect(result.value.next_action.parameters.skill_id).toBe(result.value.skills.primary);
      }
    });
  });

  describe('readActivityIndex', () => {
    it('should build activity index dynamically from activity files', async () => {
      const result = await readActivityIndex(WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.description).toBeDefined();
        // 3 meta activities + 11 work-package activities = 14 total
        expect(result.value.activities.length).toBeGreaterThanOrEqual(14);
      }
    });

    it('should have quick_match patterns from activity recognition arrays', async () => {
      const result = await readActivityIndex(WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.quick_match).toBeDefined();
        // Recognition patterns are lowercased
        expect(result.value.quick_match['start a workflow']).toBe('start-workflow');
        expect(result.value.quick_match['resume workflow']).toBe('resume-workflow');
        expect(result.value.quick_match['end workflow']).toBe('end-workflow');
      }
    });

    it('should list all activities with problem and primary skill', async () => {
      const result = await readActivityIndex(WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        for (const activity of result.value.activities) {
          expect(activity.id).toBeDefined();
          expect(activity.problem).toBeDefined();
          expect(activity.primary_skill).toBeDefined();
          expect(activity.workflowId).toBeDefined();
        }
        
        // Meta activities should have workflow-execution or activity-resolution as primary skill
        const metaActivities = result.value.activities.filter(a => a.workflowId === 'meta');
        const validMetaSkills = ['workflow-execution', 'activity-resolution'];
        for (const activity of metaActivities) {
          expect(validMetaSkills).toContain(activity.primary_skill);
        }
      }
    });

    it('should include usage instructions and next_action for each activity', async () => {
      const result = await readActivityIndex(WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Check usage instructions exist
        expect(result.value.usage).toBeDefined();
        expect(result.value.usage).toContain('next_action');
        
        // Check each activity has next_action pointing to its primary skill
        for (const activity of result.value.activities) {
          expect(activity.next_action).toBeDefined();
          expect(activity.next_action.tool).toBe('get_skill');
          expect(activity.next_action.parameters).toBeDefined();
          expect(activity.next_action.parameters.skill_id).toBe(activity.primary_skill);
        }
      }
    });

  });
});
