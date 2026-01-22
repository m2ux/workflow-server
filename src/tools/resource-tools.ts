import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog, logInfo } from '../logging.js';

// Loaders
import { listWorkflows, loadWorkflow } from '../loaders/workflow-loader.js';
import { listGuides, readGuideRaw, listWorkflowsWithGuides } from '../loaders/guide-loader.js';
import { listTemplates, readTemplate } from '../loaders/template-loader.js';
import { listIntents, readIntent, readIntentIndex } from '../loaders/intent-loader.js';
import { listSkills, readSkill } from '../loaders/skill-loader.js';

interface ParsedUri {
  type: 'intents' | 'intents-item' | 'skills' | 'skills-item' | 
        'workflows' | 'workflow' | 'guides' | 'guides-item' | 
        'templates' | 'templates-item';
  workflowId?: string;
  itemId?: string;
}

/**
 * Parse a workflow:// URI into its components.
 * 
 * Supported patterns:
 * - workflow://intents           -> list/index intents
 * - workflow://intents/{id}      -> get specific intent
 * - workflow://skills            -> list skills
 * - workflow://skills/{id}       -> get specific skill
 * - workflow://workflows         -> list all workflows
 * - workflow://{workflowId}      -> get workflow definition
 * - workflow://{workflowId}/guides           -> list guides
 * - workflow://{workflowId}/guides/{index}   -> get guide
 * - workflow://{workflowId}/templates        -> list templates
 * - workflow://{workflowId}/templates/{index} -> get template
 */
function parseUri(uri: string): ParsedUri | null {
  // Remove protocol
  const path = uri.replace(/^workflow:\/\//, '');
  if (!path) return null;
  
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length === 0) return null;
  
  const seg0 = segments[0];
  const seg1 = segments[1];
  const seg2 = segments[2];
  
  if (!seg0) return null;
  
  // Handle top-level resources
  if (seg0 === 'intents') {
    if (segments.length === 1) return { type: 'intents' };
    if (segments.length === 2 && seg1) return { type: 'intents-item', itemId: seg1 };
    return null;
  }
  
  if (seg0 === 'skills') {
    if (segments.length === 1) return { type: 'skills' };
    if (segments.length === 2 && seg1) return { type: 'skills-item', itemId: seg1 };
    return null;
  }
  
  if (seg0 === 'workflows') {
    return { type: 'workflows' };
  }
  
  // Handle workflow-scoped resources: workflow://{workflowId}/...
  const workflowId = seg0;
  
  if (segments.length === 1) {
    return { type: 'workflow', workflowId };
  }
  
  if (seg1 === 'guides') {
    if (segments.length === 2) return { type: 'guides', workflowId };
    if (segments.length === 3 && seg2) return { type: 'guides-item', workflowId, itemId: seg2 };
    return null;
  }
  
  if (seg1 === 'templates') {
    if (segments.length === 2) return { type: 'templates', workflowId };
    if (segments.length === 3 && seg2) return { type: 'templates-item', workflowId, itemId: seg2 };
    return null;
  }
  
  return null;
}

async function fetchResource(uri: string, config: ServerConfig): Promise<{ content: string; mimeType: string }> {
  const parsed = parseUri(uri);
  if (!parsed) {
    throw new Error(`Invalid URI: ${uri}`);
  }
  
  logInfo('Fetching resource', { uri, type: parsed.type });
  
  switch (parsed.type) {
    case 'intents': {
      const result = await readIntentIndex();
      if (!result.success) {
        const intents = await listIntents();
        return { content: JSON.stringify(intents, null, 2), mimeType: 'application/json' };
      }
      return { content: JSON.stringify(result.value, null, 2), mimeType: 'application/json' };
    }
    
    case 'intents-item': {
      const result = await readIntent(parsed.itemId!);
      if (!result.success) throw result.error;
      return { content: JSON.stringify(result.value, null, 2), mimeType: 'application/json' };
    }
    
    case 'skills': {
      const skills = await listSkills();
      return { content: JSON.stringify(skills, null, 2), mimeType: 'application/json' };
    }
    
    case 'skills-item': {
      const result = await readSkill(parsed.itemId!);
      if (!result.success) throw result.error;
      return { content: JSON.stringify(result.value, null, 2), mimeType: 'application/json' };
    }
    
    case 'workflows': {
      const workflows = await listWorkflows(config.workflowDir);
      return { content: JSON.stringify(workflows, null, 2), mimeType: 'application/json' };
    }
    
    case 'workflow': {
      const result = await loadWorkflow(config.workflowDir, parsed.workflowId!);
      if (!result.success) throw result.error;
      return { content: JSON.stringify(result.value, null, 2), mimeType: 'application/json' };
    }
    
    case 'guides': {
      const guides = await listGuides(config.workflowDir, parsed.workflowId!);
      const result = guides.map(g => ({
        index: g.index,
        name: g.name,
        title: g.title,
        format: g.format,
        uri: `workflow://${parsed.workflowId}/guides/${g.index}`,
      }));
      return { content: JSON.stringify(result, null, 2), mimeType: 'application/json' };
    }
    
    case 'guides-item': {
      const result = await readGuideRaw(config.workflowDir, parsed.workflowId!, parsed.itemId!);
      if (!result.success) throw result.error;
      const mimeType = result.value.format === 'toon' ? 'text/plain' : 'text/markdown';
      return { content: result.value.content, mimeType };
    }
    
    case 'templates': {
      const templates = await listTemplates(config.workflowDir, parsed.workflowId!);
      const result = templates.map(t => ({
        index: t.index,
        name: t.name,
        title: t.title,
        uri: `workflow://${parsed.workflowId}/templates/${t.index}`,
      }));
      return { content: JSON.stringify(result, null, 2), mimeType: 'application/json' };
    }
    
    case 'templates-item': {
      const result = await readTemplate(config.workflowDir, parsed.workflowId!, parsed.itemId!);
      if (!result.success) throw result.error;
      return { content: result.value, mimeType: 'text/markdown' };
    }
    
    default:
      throw new Error(`Unknown resource type: ${(parsed as ParsedUri).type}`);
  }
}

async function listAllResources(config: ServerConfig): Promise<object> {
  const workflows = await listWorkflows(config.workflowDir);
  const workflowsWithGuides = await listWorkflowsWithGuides(config.workflowDir);
  
  const resources: Record<string, unknown> = {
    intents: {
      uri: 'workflow://intents',
      description: 'Intent index - primary entry point for workflow execution',
    },
    skills: {
      uri: 'workflow://skills',
      description: 'Available workflow execution skills',
    },
    workflows: {
      uri: 'workflow://workflows',
      description: 'List all workflow definitions',
      items: workflows.map(w => ({
        id: w.id,
        title: w.title,
        uri: `workflow://${w.id}`,
      })),
    },
  };
  
  // Add workflow-specific resources
  for (const workflowId of workflowsWithGuides) {
    const guides = await listGuides(config.workflowDir, workflowId);
    const templates = await listTemplates(config.workflowDir, workflowId);
    
    const workflowResources: Record<string, unknown> = {
      uri: `workflow://${workflowId}`,
      guides: {
        uri: `workflow://${workflowId}/guides`,
        count: guides.length,
      },
    };
    
    if (templates.length > 0) {
      workflowResources['templates'] = {
        uri: `workflow://${workflowId}/templates`,
        count: templates.length,
      };
    }
    
    resources[workflowId] = workflowResources;
  }
  
  return resources;
}

export function registerResourceTools(server: McpServer, config: ServerConfig): void {
  server.tool(
    'fetch_resource',
    'Fetch any workflow resource by URI. Use list_resources to discover available URIs.',
    { uri: z.string().describe('Resource URI (e.g., workflow://intents, workflow://work-package/guides/0)') },
    withAuditLog('fetch_resource', async ({ uri }) => {
      const result = await fetchResource(uri, config);
      return { content: [{ type: 'text', text: result.content }] };
    })
  );
  
  server.tool(
    'list_resources',
    'List all available workflow resources and their URIs',
    {},
    withAuditLog('list_resources', async () => {
      const resources = await listAllResources(config);
      return { content: [{ type: 'text', text: JSON.stringify(resources, null, 2) }] };
    })
  );
}
