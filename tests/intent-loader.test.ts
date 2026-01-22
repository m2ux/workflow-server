import { describe, it, expect } from 'vitest';
import { listIntents, readIntent, readIntentIndex } from '../src/loaders/intent-loader.js';
import { join } from 'node:path';

const WORKFLOW_DIR = join(process.cwd(), 'workflow-data');

describe('intent-loader', () => {
  describe('listIntents', () => {
    it('should list available intents from meta workflow', async () => {
      const intents = await listIntents(WORKFLOW_DIR);
      expect(intents.length).toBeGreaterThanOrEqual(3);
      
      const ids = intents.map(i => i.id);
      expect(ids).toContain('start-workflow');
      expect(ids).toContain('resume-workflow');
      expect(ids).toContain('end-workflow');
    });

    it('should not include index.toon in intent list', async () => {
      const intents = await listIntents(WORKFLOW_DIR);
      const ids = intents.map(i => i.id);
      expect(ids).not.toContain('index');
    });

    it('should include name and path in intent entries', async () => {
      const intents = await listIntents(WORKFLOW_DIR);
      const startWorkflow = intents.find(i => i.id === 'start-workflow');
      
      expect(startWorkflow).toBeDefined();
      expect(startWorkflow?.name).toBe('Start Workflow');
      expect(startWorkflow?.path).toBe('start-workflow.toon');
    });
  });

  describe('readIntent', () => {
    it('should load a valid intent', async () => {
      const result = await readIntent(WORKFLOW_DIR, 'start-workflow');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('start-workflow');
        expect(result.value.version).toBe('2.0.0');
        expect(result.value.problem).toBeDefined();
      }
    });

    it('should return error for non-existent intent', async () => {
      const result = await readIntent(WORKFLOW_DIR, 'non-existent-intent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('IntentNotFoundError');
        expect(result.error.code).toBe('INTENT_NOT_FOUND');
      }
    });

    it('should load intent with all required sections', async () => {
      const result = await readIntent(WORKFLOW_DIR, 'start-workflow');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const intent = result.value;
        
        // Check recognition patterns
        expect(intent.recognition).toBeDefined();
        expect(intent.recognition.length).toBeGreaterThan(0);
        
        // Check skills
        expect(intent.skills).toBeDefined();
        expect(intent.skills.primary).toBe('workflow-execution');
        expect(intent.skills.supporting).toBeDefined();
        
        // Check outcome
        expect(intent.outcome).toBeDefined();
        expect(intent.outcome.length).toBeGreaterThan(0);
        
        // Check flow
        expect(intent.flow).toBeDefined();
        expect(intent.flow.length).toBeGreaterThan(0);
        
        // Check context to preserve
        expect(intent.context_to_preserve).toBeDefined();
        expect(intent.context_to_preserve.length).toBeGreaterThan(0);
      }
    });

    it('should load all three intents successfully', async () => {
      const intentIds = ['start-workflow', 'resume-workflow', 'end-workflow'];
      
      for (const id of intentIds) {
        const result = await readIntent(WORKFLOW_DIR, id);
        expect(result.success, `Intent ${id} should load successfully`).toBe(true);
        if (result.success) {
          expect(result.value.id).toBe(id);
          expect(result.value.skills.primary).toBe('workflow-execution');
        }
      }
    });
  });

  describe('readIntentIndex', () => {
    it('should load the intent index from meta workflow', async () => {
      const result = await readIntentIndex(WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.version).toBe('3.0.0');
        expect(result.value.description).toBeDefined();
        expect(result.value.intents.length).toBe(3);
      }
    });

    it('should have quick_match patterns', async () => {
      const result = await readIntentIndex(WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.quick_match).toBeDefined();
        expect(result.value.quick_match['start a workflow']).toBe('start-workflow');
        expect(result.value.quick_match['resume workflow']).toBe('resume-workflow');
        expect(result.value.quick_match['end workflow']).toBe('end-workflow');
      }
    });

    it('should list all intents with problem and primary skill', async () => {
      const result = await readIntentIndex(WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        for (const intent of result.value.intents) {
          expect(intent.id).toBeDefined();
          expect(intent.problem).toBeDefined();
          expect(intent.primary_skill).toBe('workflow-execution');
        }
      }
    });
  });
});
