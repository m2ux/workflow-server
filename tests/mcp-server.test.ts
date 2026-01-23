import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { resolve } from 'node:path';

describe('mcp-server integration', () => {
  let client: Client;
  let closeTransport: () => Promise<void>;

  beforeAll(async () => {
    const config = {
      workflowDir: resolve(import.meta.dirname, '../workflows'),
      guideDir: resolve(import.meta.dirname, '../workflows/guides'),
      serverName: 'test-workflow-server',
      serverVersion: '1.0.0',
    };

    const server = createServer(config);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await server.connect(serverTransport);
    
    client = new Client({ name: 'test-client', version: '1.0.0' }, {});
    await client.connect(clientTransport);

    closeTransport = async () => {
      await client.close();
      await server.close();
    };
  });

  afterAll(async () => {
    await closeTransport();
  });

  describe('tool: list_workflows', () => {
    it('should list available workflows', async () => {
      const result = await client.callTool({ name: 'list_workflows', arguments: {} });
      
      expect(result.content).toBeDefined();
      expect(result.content[0]).toHaveProperty('type', 'text');
      
      const workflows = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBeGreaterThanOrEqual(2);
      
      const ids = workflows.map((w: { id: string }) => w.id);
      expect(ids).toContain('work-package');
      expect(ids).toContain('meta');
    });
  });

  describe('tool: get_workflow', () => {
    it('should get work-package workflow', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { workflow_id: 'work-package' },
      });
      
      expect(result.content).toBeDefined();
      const workflow = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(workflow.id).toBe('work-package');
      expect(workflow.version).toBe('1.0.0');
      expect(workflow.phases).toHaveLength(11);
      expect(workflow.initialPhase).toBe('phase-1-issue-verification');
    });

    it('should return error for non-existent workflow', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { workflow_id: 'non-existent' },
      });
      
      expect(result.isError).toBe(true);
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain('not found');
    });
  });

  describe('tool: get_phase', () => {
    it('should get specific phase', async () => {
      const result = await client.callTool({
        name: 'get_phase',
        arguments: { workflow_id: 'work-package', phase_id: 'phase-1-issue-verification' },
      });
      
      const phase = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(phase.id).toBe('phase-1-issue-verification');
      expect(phase.name).toBe('Issue Verification & PR Creation');
      expect(phase.checkpoints).toBeDefined();
      expect(phase.checkpoints.length).toBeGreaterThan(0);
    });

    it('should return error for non-existent phase', async () => {
      const result = await client.callTool({
        name: 'get_phase',
        arguments: { workflow_id: 'work-package', phase_id: 'non-existent' },
      });
      
      expect(result.isError).toBe(true);
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain('not found');
    });
  });

  describe('tool: get_checkpoint', () => {
    it('should get specific checkpoint', async () => {
      const result = await client.callTool({
        name: 'get_checkpoint',
        arguments: {
          workflow_id: 'work-package',
          phase_id: 'phase-1-issue-verification',
          checkpoint_id: 'checkpoint-1-2-issue-verification',
        },
      });
      
      const checkpoint = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(checkpoint.id).toBe('checkpoint-1-2-issue-verification');
      expect(checkpoint.name).toBe('Issue Verification Checkpoint');
      expect(checkpoint.options).toBeDefined();
      expect(checkpoint.options.length).toBeGreaterThan(0);
    });
  });

  describe('tool: validate_transition', () => {
    it('should validate allowed transition', async () => {
      const result = await client.callTool({
        name: 'validate_transition',
        arguments: {
          workflow_id: 'work-package',
          from_phase: 'phase-1-issue-verification',
          to_phase: 'phase-2-requirements-elicitation',
        },
      });
      
      const validation = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(validation.valid).toBe(true);
    });

    it('should reject invalid transition', async () => {
      const result = await client.callTool({
        name: 'validate_transition',
        arguments: {
          workflow_id: 'work-package',
          from_phase: 'phase-1-issue-verification',
          to_phase: 'phase-11-post-implementation',
        },
      });
      
      const validation = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('No valid transition');
    });
  });

  describe('tool: health_check', () => {
    it('should return healthy status', async () => {
      const result = await client.callTool({ name: 'health_check', arguments: {} });
      
      const health = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(health.status).toBe('healthy');
      expect(health.server).toBe('test-workflow-server');
      expect(health.workflows_available).toBeGreaterThanOrEqual(2);
      expect(health.uptime_seconds).toBeGreaterThanOrEqual(0);
    });
  });

  describe('tool: list_resources', () => {
    it('should list all available resources', async () => {
      const result = await client.callTool({ name: 'list_resources', arguments: {} });
      
      expect(result.content).toBeDefined();
      const resources = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(resources.activities).toBeDefined();
      expect(resources.universal_skills).toBeDefined();
      expect(resources.workflows).toBeDefined();
      expect(resources['work-package']).toBeDefined();
      expect(resources['work-package'].guides).toBeDefined();
    });
  });

  describe('tool: get_activities', () => {
    it('should get activities index', async () => {
      const result = await client.callTool({ name: 'get_activities', arguments: {} });
      
      expect(result.content).toBeDefined();
      const activities = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(activities).toBeDefined();
      expect(activities.quick_match).toBeDefined();
    });

    it('should include first_action instructing to call get_rules', async () => {
      const result = await client.callTool({ name: 'get_activities', arguments: {} });
      
      const activities = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(activities.first_action).toBeDefined();
      expect(activities.first_action.tool).toBe('get_rules');
      expect(activities.usage).toContain('get_rules');
    });
  });

  describe('tool: get_rules', () => {
    it('should get global agent rules', async () => {
      const result = await client.callTool({ name: 'get_rules', arguments: {} });
      
      expect(result.content).toBeDefined();
      const rules = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(rules.id).toBe('agent-rules');
      expect(rules.sections).toBeDefined();
      expect(Array.isArray(rules.sections)).toBe(true);
    });

    it('should include code modification boundaries', async () => {
      const result = await client.callTool({ name: 'get_rules', arguments: {} });
      
      const rules = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      const codeModSection = rules.sections.find((s: { id: string }) => s.id === 'code-modification');
      expect(codeModSection).toBeDefined();
      expect(codeModSection.priority).toBe('critical');
    });

    it('should include precedence statement', async () => {
      const result = await client.callTool({ name: 'get_rules', arguments: {} });
      
      const rules = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(rules.precedence).toContain('Workflow-specific rules override');
    });
  });

  describe('tool: get_activity', () => {
    it('should get specific activity', async () => {
      const result = await client.callTool({
        name: 'get_activity',
        arguments: { activity_id: 'start-workflow' },
      });
      
      expect(result.content).toBeDefined();
      const activity = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(activity.id).toBe('start-workflow');
    });
  });

  describe('tool: list_skills', () => {
    it('should list skills', async () => {
      const result = await client.callTool({ name: 'list_skills', arguments: {} });
      
      expect(result.content).toBeDefined();
      const skills = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(Array.isArray(skills)).toBe(true);
    });
  });

  describe('tool: get_skill', () => {
    it('should get workflow-specific skill with workflow_id', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { skill_id: 'workflow-execution', workflow_id: 'work-package' },
      });
      
      expect(result.content).toBeDefined();
      const skill = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(skill.id).toBe('workflow-execution');
    });

    it('should get universal skill without workflow_id', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { skill_id: 'activity-resolution' },
      });
      
      expect(result.content).toBeDefined();
      const skill = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(skill.id).toBe('activity-resolution');
    });
  });

  describe('tool: list_guides', () => {
    it('should list guides for a workflow', async () => {
      const result = await client.callTool({
        name: 'list_guides',
        arguments: { workflow_id: 'work-package' },
      });
      
      expect(result.content).toBeDefined();
      const guides = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(Array.isArray(guides)).toBe(true);
      expect(guides.length).toBeGreaterThan(0);
      expect(guides[0].index).toBeDefined();
      expect(guides[0].name).toBeDefined();
    });
  });

  describe('tool: get_guide', () => {
    it('should get specific guide by index', async () => {
      const result = await client.callTool({
        name: 'get_guide',
        arguments: { workflow_id: 'work-package', index: '00' },
      });
      
      expect(result.content).toBeDefined();
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain('start-here');
    });
  });

  describe('tool: list_templates', () => {
    it('should list templates for a workflow', async () => {
      const result = await client.callTool({
        name: 'list_templates',
        arguments: { workflow_id: 'work-package' },
      });
      
      expect(result.content).toBeDefined();
      const templates = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });
  });

  describe('tool: get_template', () => {
    it('should get specific template by index', async () => {
      const result = await client.callTool({
        name: 'get_template',
        arguments: { workflow_id: 'work-package', index: '01' },
      });
      
      expect(result.content).toBeDefined();
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain('Implementation Analysis');
    });
  });
});
