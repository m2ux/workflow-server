#!/usr/bin/env npx tsx
/**
 * Regenerates the machine-derived regions of the documentation site
 * (site/api/tools.html, site/api/schemas.html) from the server source:
 * tool names, descriptions, and parameter schemas are captured by replaying
 * the MCP tool registrations against a recording stub, and the schema
 * reference is rendered from the checked-in schemas/*.schema.json files.
 *
 * Only the content between the BEGIN/END GENERATED markers is rewritten;
 * everything outside the markers is hand-authored. tests/site.test.ts fails
 * when the committed pages drift from a fresh regeneration.
 */
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../src/config.js';
import { registerWorkflowTools } from '../src/tools/workflow-tools.js';
import { registerResourceTools } from '../src/tools/resource-tools.js';

const ROOT = resolve(import.meta.dirname, '..');
const SITE_DIR = join(ROOT, 'site');
const GITHUB_BLOB = 'https://github.com/m2ux/workflow-server/blob/main';

// ---------------------------------------------------------------------------
// Tool capture

interface JsonSchemaNode {
  type?: string;
  properties?: Record<string, JsonSchemaNode>;
  required?: string[];
  items?: JsonSchemaNode;
  enum?: unknown[];
  const?: unknown;
  anyOf?: JsonSchemaNode[];
  oneOf?: JsonSchemaNode[];
  $ref?: string;
  default?: unknown;
  description?: string;
  definitions?: Record<string, JsonSchemaNode>;
}

interface CapturedTool {
  name: string;
  description: string;
  params: JsonSchemaNode | null;
}

function isZodType(value: unknown): value is z.ZodTypeAny {
  return typeof value === 'object' && value !== null && '_def' in value;
}

function toParamsSchema(shape: unknown): JsonSchemaNode | null {
  if (shape === undefined || shape === null || typeof shape === 'function') return null;
  const zobj = isZodType(shape) ? shape : z.object(shape as z.ZodRawShape);
  const json = zodToJsonSchema(zobj) as JsonSchemaNode;
  if (!json.properties || Object.keys(json.properties).length === 0) return null;
  return json;
}

/** Replay the tool registrations against a recorder instead of a live server. */
export function captureTools(): CapturedTool[] {
  const tools: CapturedTool[] = [];
  const recorder = {
    tool(name: string, description: string, shapeOrHandler: unknown) {
      tools.push({ name, description, params: toParamsSchema(shapeOrHandler) });
    },
    registerTool(name: string, cfg: { description: string; inputSchema?: unknown }) {
      tools.push({ name, description: cfg.description, params: toParamsSchema(cfg.inputSchema) });
    },
  } as unknown as McpServer;

  const config: ServerConfig = {
    workflowDir: join(ROOT, 'workflows'),
    schemasDir: join(ROOT, 'schemas'),
    workspaceDir: ROOT,
    serverName: 'workflow-server',
    serverVersion: 'site-data-generation',
  };
  registerWorkflowTools(recorder, config);
  registerResourceTools(recorder, config);
  return tools;
}

// The six concerns mirror the README's tools-at-a-glance table. Membership is
// asserted below so a new or renamed tool fails generation instead of being
// silently omitted from the site.
const TOOL_GROUPS: Array<{ title: string; note: string; tools: string[] }> = [
  { title: 'Bootstrap', note: 'Callable without a session_index.', tools: ['discover', 'list_workflows', 'health_check'] },
  { title: 'Session', note: 'Create, inspect, and extend workflow sessions.', tools: ['start_session', 'get_workflow_status', 'dispatch_child'] },
  { title: 'Workflow and activity navigation', note: 'Load workflow structure and advance through activities.', tools: ['get_workflow', 'next_activity', 'get_activity'] },
  { title: 'Checkpoint flow', note: 'Yield to the orchestrator, present decisions to the user, and resume.', tools: ['yield_checkpoint', 'resume_checkpoint', 'present_checkpoint', 'respond_checkpoint'] },
  { title: 'Techniques and resources', note: 'Fetch technique definitions and lazy-loaded reference material.', tools: ['get_technique', 'get_resource'] },
  { title: 'Trace', note: 'Execution history for debugging and audit.', tools: ['get_trace'] },
];

// ---------------------------------------------------------------------------
// HTML rendering

function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

/** Escape, then promote `backtick` spans to <code>. */
function richText(text: string): string {
  return escapeHtml(text).replace(/`([^`]+)`/g, '<code>$1</code>');
}

function typeLabel(prop: JsonSchemaNode): string {
  if (prop.$ref) return prop.$ref.split('/').pop() ?? 'object';
  if (prop.enum) return prop.enum.map(v => JSON.stringify(v)).join(' | ');
  if (prop.const !== undefined) return JSON.stringify(prop.const);
  const variants = prop.anyOf ?? prop.oneOf;
  if (variants) return [...new Set(variants.map(variantLabel))].join(' | ');
  if (prop.type === 'array') {
    const inner = prop.items ? typeLabel(prop.items) : 'any';
    return inner.includes(' | ') ? `(${inner})[]` : `${inner}[]`;
  }
  return prop.type ?? 'any';
}

/** Discriminated-union variants read better by their tag (`kind`/`type` const) than as `object`. */
function variantLabel(variant: JsonSchemaNode): string {
  const tag = variant.properties?.['kind']?.const ?? variant.properties?.['type']?.const;
  return tag !== undefined ? String(tag) : typeLabel(variant);
}

function paramRows(schema: JsonSchemaNode, prefix = ''): string[] {
  const rows: string[] = [];
  const required = new Set(schema.required ?? []);
  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    const label = `${prefix}${name}`;
    const notes: string[] = [];
    if (prop.description) notes.push(richText(prop.description));
    if (prop.default !== undefined) notes.push(`Default: <code>${escapeHtml(JSON.stringify(prop.default))}</code>`);
    rows.push(
      `          <tr><td><code>${escapeHtml(label)}</code></td><td><code>${escapeHtml(typeLabel(prop))}</code></td>` +
      `<td>${required.has(name) ? 'yes' : 'no'}</td><td>${notes.join(' ') || '—'}</td></tr>`,
    );
    // Array-of-object parameters (e.g. step_manifest) get one row per item field.
    if (prop.type === 'array' && prop.items?.properties) {
      rows.push(...paramRows(prop.items, `${label}[].`));
    }
  }
  return rows;
}

function renderTool(tool: CapturedTool): string {
  const lines: string[] = [];
  lines.push(`      <section class="tool" id="${escapeHtml(tool.name)}">`);
  lines.push(`        <h3><code>${escapeHtml(tool.name)}</code></h3>`);
  lines.push(`        <p>${richText(tool.description)}</p>`);
  if (tool.params) {
    lines.push('        <div class="table-wrap">');
    lines.push('        <table>');
    lines.push('          <thead><tr><th scope="col">Parameter</th><th scope="col">Type</th><th scope="col">Required</th><th scope="col">Description</th></tr></thead>');
    lines.push('          <tbody>');
    lines.push(...paramRows(tool.params));
    lines.push('          </tbody>');
    lines.push('        </table>');
    lines.push('        </div>');
  } else {
    lines.push('        <p class="no-params">No parameters.</p>');
  }
  lines.push('      </section>');
  return lines.join('\n');
}

export function renderToolsRegion(): string {
  const tools = captureTools();
  const byName = new Map(tools.map(t => [t.name, t]));

  const grouped = new Set(TOOL_GROUPS.flatMap(g => g.tools));
  const unlisted = tools.filter(t => !grouped.has(t.name)).map(t => t.name);
  const missing = TOOL_GROUPS.flatMap(g => g.tools).filter(name => !byName.has(name));
  if (unlisted.length > 0 || missing.length > 0) {
    throw new Error(
      `Tool/group drift — update TOOL_GROUPS in scripts/generate-site-data.ts. ` +
      `Registered but ungrouped: [${unlisted.join(', ')}]. Grouped but unregistered: [${missing.join(', ')}].`,
    );
  }

  const toc = TOOL_GROUPS.map(g =>
    `        <li>${escapeHtml(g.title)}: ${g.tools.map(t => `<a href="#${t}"><code>${t}</code></a>`).join(', ')}</li>`,
  );

  const sections = TOOL_GROUPS.map(g => {
    const body = g.tools.map(name => renderTool(byName.get(name)!)).join('\n');
    return `      <h2>${escapeHtml(g.title)}</h2>\n      <p>${escapeHtml(g.note)}</p>\n${body}`;
  });

  return [
    `      <p>The server registers ${tools.length} MCP tools.</p>`,
    '      <nav aria-label="Tools">',
    '      <ul>',
    ...toc,
    '      </ul>',
    '      </nav>',
    ...sections,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Schema reference

function schemaRoot(json: JsonSchemaNode & { title?: string }): JsonSchemaNode {
  if (json.$ref && json.definitions) {
    const name = json.$ref.split('/').pop()!;
    return json.definitions[name] ?? json;
  }
  return json;
}

export function renderSchemasRegion(): string {
  const files = readdirSync(join(ROOT, 'schemas')).filter(f => f.endsWith('.schema.json')).sort();
  const sections: string[] = [];
  for (const file of files) {
    const json = JSON.parse(readFileSync(join(ROOT, 'schemas', file), 'utf-8')) as JsonSchemaNode & { title?: string; description?: string };
    const root = schemaRoot(json);
    const anchor = file.replace('.schema.json', '');
    const lines: string[] = [];
    lines.push(`      <section class="schema" id="${escapeHtml(anchor)}">`);
    lines.push(`        <h2><code>${escapeHtml(file)}</code></h2>`);
    if (json.description) lines.push(`        <p>${richText(json.description)}</p>`);
    lines.push(`        <p><a href="${GITHUB_BLOB}/schemas/${file}">Full schema on GitHub</a></p>`);
    if (root.properties) {
      lines.push('        <div class="table-wrap">');
      lines.push('        <table>');
      lines.push('          <thead><tr><th scope="col">Field</th><th scope="col">Type</th><th scope="col">Required</th><th scope="col">Description</th></tr></thead>');
      lines.push('          <tbody>');
      lines.push(...paramRows(root));
      lines.push('          </tbody>');
      lines.push('        </table>');
      lines.push('        </div>');
    } else if (root.anyOf) {
      const variants = root.anyOf.map(v => {
        const typeProp = v.properties?.['type'];
        return typeProp?.const !== undefined ? String(typeProp.const) : typeLabel(v);
      });
      lines.push(`        <p>One of ${root.anyOf.length} variants: ${variants.map(v => `<code>${escapeHtml(v)}</code>`).join(', ')}.</p>`);
    }
    lines.push('      </section>');
    sections.push(lines.join('\n'));
  }
  return sections.join('\n');
}

// ---------------------------------------------------------------------------
// Marker injection

const PAGES: Array<{ relPath: string; render: () => string }> = [
  { relPath: 'api/tools.html', render: renderToolsRegion },
  { relPath: 'api/schemas.html', render: renderSchemasRegion },
];

const BEGIN = '<!-- BEGIN GENERATED — edit scripts/generate-site-data.ts, then run npm run build:site -->';
const END = '<!-- END GENERATED -->';

export function injectRegion(page: string, generated: string, relPath: string): string {
  const start = page.indexOf(BEGIN);
  const end = page.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Missing or malformed GENERATED markers in site/${relPath}`);
  }
  return page.slice(0, start + BEGIN.length) + '\n' + generated + '\n      ' + page.slice(end);
}

/** Compute the post-injection content of every generated page. */
export function renderSitePages(): Array<{ relPath: string; content: string }> {
  return PAGES.map(({ relPath, render }) => {
    const pagePath = join(SITE_DIR, relPath);
    const current = readFileSync(pagePath, 'utf-8');
    return { relPath, content: injectRegion(current, render(), relPath) };
  });
}

const isMain = process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.filename);
if (isMain) {
  for (const { relPath, content } of renderSitePages()) {
    writeFileSync(join(SITE_DIR, relPath), content);
    console.log(`[PASS] Regenerated site/${relPath}`);
  }
}
