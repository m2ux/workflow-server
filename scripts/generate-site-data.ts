#!/usr/bin/env npx tsx
/**
 * Regenerates machine-derived regions of the documentation site:
 * - Global navigation, breadcrumbs, and pagination on every HTML page
 * - Tool and schema reference bodies on api/tools.html and api/schemas.html
 *
 * Hand-authored content outside the BEGIN/END GENERATED markers is preserved.
 * tests/site.test.ts fails when committed pages drift from a fresh regeneration.
 */
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../src/config.js';
import { registerWorkflowTools } from '../src/tools/workflow-tools.js';
import { registerResourceTools } from '../src/tools/resource-tools.js';

const ROOT = resolve(import.meta.dirname, '..');
const SITE_DIR = join(ROOT, 'site');
const GITHUB_BLOB = 'https://github.com/m2ux/workflow-server/blob/main';

// ---------------------------------------------------------------------------
// Site route registry

export type SiteSection = 'home' | 'guide' | 'specs' | 'api' | 'internals';

export interface SiteRoute {
  relPath: string;
  section: SiteSection;
  title: string;
  navLabel: string;
  /** Order within section for prev/next links. Omit on hubs without sequence. */
  sequence?: number;
  /** Parent route relPath for breadcrumbs (e.g. specs/architecture.html). */
  parent?: string;
  breadcrumbLabel?: string;
}

export const SITE_ROUTES: SiteRoute[] = [
  { relPath: 'index.html', section: 'home', title: 'Home', navLabel: 'Home' },
  { relPath: 'guide/getting-started.html', section: 'guide', title: 'Getting started', navLabel: 'Getting started', sequence: 1 },
  { relPath: 'guide/ide-setup.html', section: 'guide', title: 'IDE setup', navLabel: 'IDE setup', sequence: 2 },
  { relPath: 'guide/concepts.html', section: 'guide', title: 'Concepts', navLabel: 'Concepts', sequence: 3 },
  { relPath: 'guide/running-workflows.html', section: 'guide', title: 'Running workflows', navLabel: 'Running workflows', sequence: 4 },
  { relPath: 'guide/rationale.html', section: 'guide', title: 'Design rationale', navLabel: 'Design rationale', sequence: 5 },
  { relPath: 'specs/architecture.html', section: 'specs', title: 'Architecture overview', navLabel: 'Overview', sequence: 0, breadcrumbLabel: 'Architecture' },
  { relPath: 'specs/workflows.html', section: 'specs', title: 'Workflow architecture', navLabel: 'Workflows', sequence: 1, parent: 'specs/architecture.html', breadcrumbLabel: 'Workflows' },
  { relPath: 'specs/dispatch.html', section: 'specs', title: 'Hierarchical dispatch', navLabel: 'Dispatch', sequence: 2, parent: 'specs/architecture.html', breadcrumbLabel: 'Dispatch' },
  { relPath: 'specs/checkpoints.html', section: 'specs', title: 'Just-in-time checkpoints', navLabel: 'Checkpoints', sequence: 3, parent: 'specs/architecture.html', breadcrumbLabel: 'Checkpoints' },
  { relPath: 'specs/state-management.html', section: 'specs', title: 'State management', navLabel: 'State', sequence: 4, parent: 'specs/architecture.html', breadcrumbLabel: 'State' },
  { relPath: 'specs/artifact-management.html', section: 'specs', title: 'Artifact management', navLabel: 'Artifacts', sequence: 5, parent: 'specs/architecture.html', breadcrumbLabel: 'Artifacts' },
  { relPath: 'specs/resource-resolution.html', section: 'specs', title: 'Resource resolution', navLabel: 'Resolution', sequence: 6, parent: 'specs/architecture.html', breadcrumbLabel: 'Resolution' },
  { relPath: 'specs/workflow-fidelity.html', section: 'specs', title: 'Workflow fidelity', navLabel: 'Fidelity', sequence: 7, parent: 'specs/architecture.html', breadcrumbLabel: 'Fidelity' },
  { relPath: 'api/tools.html', section: 'api', title: 'MCP tool reference', navLabel: 'Tools', sequence: 1 },
  { relPath: 'api/schemas.html', section: 'api', title: 'Schema reference', navLabel: 'Schemas', sequence: 2 },
  { relPath: 'api/protocol.html', section: 'api', title: 'Protocol in practice', navLabel: 'Protocol guide', sequence: 3 },
  { relPath: 'internals/server-anatomy.html', section: 'internals', title: 'Server anatomy', navLabel: 'Server anatomy', sequence: 1 },
  { relPath: 'internals/request-lifecycle.html', section: 'internals', title: 'Request lifecycle', navLabel: 'Request lifecycle', sequence: 2 },
  { relPath: 'internals/session-store.html', section: 'internals', title: 'Session store', navLabel: 'Session store', sequence: 3 },
  { relPath: 'internals/quality-system.html', section: 'internals', title: 'Quality system', navLabel: 'Quality system', sequence: 4 },
];

const ROUTE_BY_PATH = new Map(SITE_ROUTES.map(r => [r.relPath, r]));

const NAV_SECTIONS: Array<{ id: SiteSection; label: string }> = [
  { id: 'guide', label: 'Guide' },
  { id: 'specs', label: 'Architecture' },
  { id: 'api', label: 'API' },
  { id: 'internals', label: 'Internals' },
];

function routePrefix(relPath: string): string {
  const depth = relPath.split('/').length - 1;
  return depth === 0 ? '' : '../'.repeat(depth);
}

function hrefFrom(pageRelPath: string, targetRelPath: string): string {
  if (targetRelPath === 'index.html') {
    const depth = pageRelPath.split('/').length - 1;
    return depth === 0 ? './index.html' : `${'../'.repeat(depth)}index.html`;
  }
  const fromDir = dirname(join(SITE_DIR, pageRelPath));
  const target = join(SITE_DIR, targetRelPath);
  let href = relative(fromDir, target).replace(/\\/g, '/');
  if (!href.startsWith('.') && !href.startsWith('/')) href = `./${href}`;
  return href;
}

function routesInSection(section: SiteSection): SiteRoute[] {
  return SITE_ROUTES.filter(r => r.section === section && r.relPath !== 'index.html')
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
}

export function renderSiteNav(pageRelPath: string): string {
  const current = ROUTE_BY_PATH.get(pageRelPath);
  const homeHref = hrefFrom(pageRelPath, 'index.html');
  const lines: string[] = [];
  lines.push('    <nav class="site-nav" aria-label="Documentation">');
  lines.push('      <ul class="site-nav__primary">');
  lines.push(`        <li><a href="${homeHref}"${current?.section === 'home' ? ' aria-current="page"' : ''}>Home</a></li>`);

  for (const { id, label } of NAV_SECTIONS) {
    const items = routesInSection(id);
    const inSection = current?.section === id;
    lines.push('        <li>');
    lines.push(`          <details class="site-nav__group"${inSection ? ' open' : ''}>`);
    lines.push(`            <summary>${escapeHtml(label)}</summary>`);
    lines.push('            <ul>');
    for (const item of items) {
      const href = hrefFrom(pageRelPath, item.relPath);
      const isCurrent = pageRelPath === item.relPath;
      lines.push(`              <li><a href="${href}"${isCurrent ? ' aria-current="page"' : ''}>${escapeHtml(item.navLabel)}</a></li>`);
    }
    lines.push('            </ul>');
    lines.push('          </details>');
    lines.push('        </li>');
  }

  lines.push('        <li><a href="https://github.com/m2ux/workflow-server">GitHub</a></li>');
  lines.push('      </ul>');
  lines.push('    </nav>');
  return lines.join('\n');
}

export function renderBreadcrumb(pageRelPath: string): string {
  const route = ROUTE_BY_PATH.get(pageRelPath);
  if (!route || route.section === 'home') return '';

  const crumbs: Array<{ label: string; href?: string }> = [];
  const sectionLabel = NAV_SECTIONS.find(s => s.id === route.section)?.label ?? route.section;
  const hub = routesInSection(route.section).find(r => r.sequence === 0);

  if (hub && route.parent === hub.relPath) {
    crumbs.push({ label: sectionLabel, href: hrefFrom(pageRelPath, hub.relPath) });
    crumbs.push({ label: route.breadcrumbLabel ?? route.navLabel });
  } else if (hub && route.relPath === hub.relPath) {
    crumbs.push({ label: sectionLabel });
    crumbs.push({ label: route.navLabel });
  } else {
    crumbs.push({ label: sectionLabel });
    if (hub) crumbs.push({ label: hub.navLabel, href: hrefFrom(pageRelPath, hub.relPath) });
    crumbs.push({ label: route.navLabel });
  }

  const items = crumbs.map((c, i) => {
    const isLast = i === crumbs.length - 1;
    if (c.href && !isLast) {
      return `      <li><a href="${c.href}">${escapeHtml(c.label)}</a></li>`;
    }
    return `      <li${isLast ? ' aria-current="page"' : ''}>${escapeHtml(c.label)}</li>`;
  });

  return [
    '  <nav class="breadcrumb" aria-label="Breadcrumb">',
    '    <ol>',
    ...items,
    '    </ol>',
    '  </nav>',
  ].join('\n');
}

export function renderPagination(pageRelPath: string): string {
  const route = ROUTE_BY_PATH.get(pageRelPath);
  if (!route || route.section === 'home' || route.sequence === undefined) return '';

  const sectionRoutes = routesInSection(route.section).filter(r => r.sequence !== undefined && r.sequence > 0);
  const idx = sectionRoutes.findIndex(r => r.relPath === pageRelPath);
  if (idx === -1) return '';

  const prev = idx > 0 ? sectionRoutes[idx - 1] : undefined;
  const next = idx < sectionRoutes.length - 1 ? sectionRoutes[idx + 1] : undefined;
  if (!prev && !next) return '';

  const parts: string[] = ['  <nav class="page-pagination" aria-label="Page sequence">'];
  if (prev) {
    parts.push(`    <a class="page-pagination__prev" href="${hrefFrom(pageRelPath, prev.relPath)}">← ${escapeHtml(prev.navLabel)}</a>`);
  } else {
    parts.push('    <span></span>');
  }
  if (next) {
    parts.push(`    <a class="page-pagination__next" href="${hrefFrom(pageRelPath, next.relPath)}">${escapeHtml(next.navLabel)} →</a>`);
  }
  parts.push('  </nav>');
  return parts.join('\n');
}

/** Every registered page except home must appear in generated global nav. */
export function checkSiteNavigation(): string[] {
  const errors: string[] = [];
  const navHtml = renderSiteNav('index.html');
  for (const route of SITE_ROUTES) {
    if (route.relPath === 'index.html') continue;
    const href = hrefFrom('index.html', route.relPath);
    if (!navHtml.includes(`href="${href}"`)) {
      errors.push(`Global nav from index.html missing link to ${route.relPath}`);
    }
  }

  for (const route of SITE_ROUTES) {
    const pagePath = join(SITE_DIR, route.relPath);
    const html = readFileSync(pagePath, 'utf-8');
    if (!html.includes('BEGIN GENERATED NAV')) {
      errors.push(`site/${route.relPath}: missing GENERATED NAV markers`);
    }
    const expectedNav = renderSiteNav(route.relPath);
    const actualNav = extractRegion(html, 'NAV');
    if (actualNav !== expectedNav) {
      errors.push(`site/${route.relPath}: stale navigation — run npm run build:site`);
    }
  }
  return errors;
}

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

const TOOL_GROUPS: Array<{ title: string; note: string; tools: string[] }> = [
  { title: 'Bootstrap', note: 'Callable without a session_index.', tools: ['discover', 'list_workflows', 'health_check'] },
  { title: 'Session', note: 'Create, inspect, and extend workflow sessions.', tools: ['start_session', 'get_workflow_status', 'dispatch_child'] },
  { title: 'Workflow and activity navigation', note: 'Load workflow structure and advance through activities.', tools: ['get_workflow', 'next_activity', 'get_activity'] },
  { title: 'Checkpoint flow', note: 'Yield to the orchestrator, present decisions to the user, and resume.', tools: ['yield_checkpoint', 'resume_checkpoint', 'present_checkpoint', 'respond_checkpoint'] },
  { title: 'Techniques and resources', note: 'Fetch technique definitions and lazy-loaded reference material.', tools: ['get_technique', 'get_resource'] },
  { title: 'Trace', note: 'Execution history for debugging and audit.', tools: ['get_trace'] },
];

/** Plain-language one-line summaries for the site (source descriptions stay authoritative for MCP). */
const SITE_TOOL_SUMMARIES: Partial<Record<string, string>> = {
  start_session: 'Start or resume a workflow session.',
  dispatch_child: 'Start a child workflow inside the current session.',
  get_activity: 'Load the current activity definition, including steps and transitions.',
};

/** Readable full descriptions for the site. Parameter tables still come from source schemas. */
const SITE_TOOL_GUIDES: Partial<Record<string, string[]>> = {
  discover: [
    'Call this first. Returns the server name, version, and the bootstrap steps for starting a workflow.',
    'No session required. Use `list_workflows` to see what you can run.',
  ],
  list_workflows: [
    'Lists every workflow the server can run, with id, title, version, and tags.',
    'If some workflow files cannot be loaded, you still get the working entries plus a `load_errors` list for the failures.',
  ],
  health_check: [
    'Quick ping to confirm the server is up. Returns status, name, version, workflow count, and uptime.',
    'No session required.',
  ],
  start_session: [
    'Opens a new workflow session or resumes an existing one.',
    'Returns a `session_index` (six characters), basic workflow metadata, and `planning_folder_path` — the absolute path where the server stores session artifacts.',
    'Pass `planning_folder` as any absolute path whose basename is your planning slug (for example, `.../planning/2026-05-28-my-slug`). Only the slug is used; the server resolves it under its own workspace. A stale or wrong path prefix is harmless.',
    'If that slug already has `session.json`, the session resumes and `workflow_id` is ignored. Otherwise the server creates a fresh session and seeds variables from the workflow defaults.',
    'Omit `planning_folder` to start a meta bootstrap session in a temp folder. Use `dispatch_child` later to promote it to a real planning folder.',
    'Child workflows are started with `dispatch_child`, not `start_session`.',
  ],
  get_workflow_status: [
    'Returns whether the session is active, blocked at a checkpoint, or completed, plus the current activity and completed steps.',
    'If the session is nested under a parent, parent context is included too.',
  ],
  dispatch_child: [
    'Starts a child workflow inside the parent session you are already in.',
    'Returns the child\'s `session_index` and `planning_folder_path`. The child\'s variables are seeded from the child workflow\'s defaults; the parent is unchanged.',
    'The child state is stored inside the parent\'s `session.json` under `triggeredWorkflows`.',
    'When the parent is a temporary meta-bootstrap session, the server first promotes it to a real planning folder on disk, then embeds the child. You can keep using the parent\'s original `session_index`.',
  ],
  get_workflow: [
    'Loads the workflow definition for the current session.',
    'The response starts with the orchestrator technique, then a separator, then metadata: rules, variables, `initialActivity` (the first activity to run), and a short list of all activities.',
    'Use `initialActivity` for your first `next_activity` call — this is the only tool that returns it.',
    'Also returns `planning_folder_path`. Treat this as the one true artifact location; do not build paths relative to your own working directory.',
    'If some activity files failed to load, `activity_load_errors` lists them and those activities are omitted from the list.',
  ],
  next_activity: [
    'Moves the session to a new activity. This is the orchestrator\'s advance call — it updates state and records the trace but does not return the activity body.',
    'After `next_activity`, the worker should call `get_activity` to load steps, checkpoints, transitions, and technique references.',
    'For the first transition, use `initialActivity` from `get_workflow`. After that, use ids from the current activity\'s `transitions`.',
    'Optional `step_manifest` and `transition_condition` help the server validate what you completed. Manifest checks are advisory — mismatches produce warnings, not hard errors.',
  ],
  get_activity: [
    'Loads the full definition for whatever activity the session is currently on. No `activity_id` parameter — the server reads it from session state.',
    'You must pass `context_tokens`: your worker\'s context window size in tokens. The server uses this to decide how many step techniques to bundle inline.',
    'Ungated techniques that fit the budget are included in the response under `step_techniques` — the same content you would get from `get_technique` for that step. Gated steps and overflow techniques still need a separate `get_technique` call.',
    'If the session uses persistent context mode (or you pass `bundle: "reference"`), content you already received may come back as short unchanged markers instead of full text. Pass `bundle: "full"` to force full delivery.',
  ],
  yield_checkpoint: [
    'Call when a checkpoint step tells you to stop and hand control to the orchestrator.',
    'Records the checkpoint as active and returns the `session_index` for a `<checkpoint_yield>` block in your output.',
  ],
  resume_checkpoint: [
    'Call after the orchestrator resolves a checkpoint and resumes you.',
    'Verifies the checkpoint is cleared and returns any variable updates to apply before continuing the activity.',
  ],
  present_checkpoint: [
    'Loads the active checkpoint\'s message, options, and effects so you can show it to the user.',
    'Reads from `state.activeCheckpoint` — no separate checkpoint handle is needed.',
  ],
  respond_checkpoint: [
    'Submits the user\'s checkpoint decision and clears the active checkpoint.',
    'Present the checkpoint to the user and wait for input before calling this.',
    'Provide exactly one of: `option_id` (user picked an option), `auto_advance` (timer elapsed on a checkpoint with a default), or `condition_not_met` (conditional checkpoint whose condition was false).',
    'Variable effects from the chosen option are applied; type mismatches produce warnings in `_meta.validation` but do not block the response.',
  ],
  get_technique: [
    'Fetches one technique for the current workflow or activity.',
    'Before any activity is active, returns the workflow\'s first technique. During an activity, use `step_id` to fetch a specific step\'s technique, or omit `step_id` for the activity\'s first technique.',
    'The response is fully composed: inherited inputs/outputs and merged rules from ancestor techniques, plus binding annotations when fetched via a step.',
    'Techniques load one at a time. In persistent context mode, an identical refetch may return a short unchanged marker; pass `full: true` to get the full payload again.',
    'Every fetch is recorded for trace and advisory manifest checks on the next `next_activity` call.',
  ],
  get_resource: [
    'Loads reference material by id — templates, guides, or other markdown resources linked from techniques.',
    'Bare ids (`review-mode`) resolve within the current workflow. Prefixed ids (`meta/bootstrap-protocol`) load from another workflow.',
    'Add `#section` to fetch one heading slice instead of the whole file.',
    'Each fetch is logged for observability only; nothing validates that you called it.',
  ],
  get_trace: [
    'Returns the tool-call history for debugging or audit.',
    'Pass accumulated `trace_tokens` from `next_activity` responses to reconstruct a specific segment. Omit them to read the live in-memory trace for the session.',
  ],
};

/** Shorter parameter descriptions for the site tables (schemas in source stay authoritative). */
const SITE_PARAM_HINTS: Record<string, string> = {
  session_index: 'Six-character token from `start_session`. Use the same value for every call in this session.',
  workflow_id: 'Workflow id to run or dispatch (for example, `work-package`).',
  planning_folder: 'Absolute path whose basename is the planning slug. The server resolves the slug under its own workspace — the directory prefix is only a hint.',
  agent_id: 'Label for this agent in the session trace.',
  context_mode: '`persistent`: reuse earlier deliveries when one agent keeps full context. `fresh` (default): always return full content.',
  planning_slug: 'Slug for the promoted planning folder when dispatching from a meta bootstrap session. Ignored if the parent already has a persistent folder.',
  activity_id: 'Activity to move to. First call: use `initialActivity` from `get_workflow`. Later: use an id from `transitions`.',
  transition_condition: 'The condition name that led to this transition, from the previous activity.',
  step_manifest: 'Steps completed in the previous activity, for example `[{ "step_id": "detect-review-mode", "output": "is_review_mode=false" }]`. Omit if no steps ran.',
  'step_manifest[].step_id': 'Step id from the activity definition (field name is `step_id`, not `id`).',
  'step_manifest[].output': 'Short summary of what the step produced. Use a JSON object when the step has multiple outputs.',
  activity_manifest: 'History of completed activities with outcomes and transition conditions.',
  'activity_manifest[].activity_id': 'Completed activity id.',
  'activity_manifest[].outcome': 'Short outcome summary for that activity.',
  'activity_manifest[].transition_condition': 'Condition that led out of that activity, if any.',
  context_tokens: 'Your worker context window in tokens. Required so the server can size inline technique bundling.',
  bundle: '`reference`: return unchanged markers for content already delivered. `full`: always return complete text.',
  checkpoint_id: 'Id of the checkpoint step you are yielding.',
  option_id: 'Option the user selected. Must match one of the checkpoint\'s defined options.',
  auto_advance: 'Set `true` to use the checkpoint\'s default option after its timer elapses.',
  condition_not_met: 'Set `true` to dismiss a conditional checkpoint whose condition evaluated to false.',
  step_id: 'Step within the current activity. Omit to get the first technique for the activity or workflow.',
  full: 'Force full technique content even when persistent mode would return an unchanged marker.',
  resource_id: 'Resource slug, optionally workflow-prefixed (`meta/bootstrap-protocol`), optionally with `#section` anchor.',
  trace_tokens: 'Tokens collected from `next_activity` `_meta.trace_token` responses.',
};

// ---------------------------------------------------------------------------
// HTML rendering

function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function richText(text: string): string {
  return escapeHtml(text).replace(/`([^`]+)`/g, '<code>$1</code>');
}

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?]+[.!?]/);
  if (match) return match[0];
  return trimmed.length > 160 ? `${trimmed.slice(0, 157)}…` : trimmed;
}

function siteParamDescription(label: string, fallback?: string): string {
  if (SITE_PARAM_HINTS[label]) return SITE_PARAM_HINTS[label];
  const base = label.split('.').pop() ?? label;
  if (SITE_PARAM_HINTS[base]) return SITE_PARAM_HINTS[base];
  return fallback ?? '-';
}

function renderGuideParagraphs(paragraphs: string[]): string {
  return paragraphs.map(p => `          <p>${richText(p)}</p>`).join('\n');
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

function variantLabel(variant: JsonSchemaNode): string {
  const tag = variant.properties?.['kind']?.const ?? variant.properties?.['type']?.const;
  return tag !== undefined ? String(tag) : typeLabel(variant);
}

function paramRows(schema: JsonSchemaNode, prefix = '', topLevelOnly = false): string[] {
  const rows: string[] = [];
  const required = new Set(schema.required ?? []);
  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    const label = `${prefix}${name}`;
    if (topLevelOnly && prefix !== '') continue;
    const notes: string[] = [];
    const hint = siteParamDescription(label, prop.description);
    if (hint !== '-') notes.push(richText(hint));
    if (prop.default !== undefined) notes.push(`Default: <code>${escapeHtml(JSON.stringify(prop.default))}</code>`);
    rows.push(
      `          <tr><td><code>${escapeHtml(label)}</code></td><td><code>${escapeHtml(typeLabel(prop))}</code></td>` +
      `<td>${required.has(name) ? 'yes' : 'no'}</td><td>${notes.join(' ') || '-'}</td></tr>`,
    );
    if (!topLevelOnly && prop.type === 'array' && prop.items?.properties) {
      rows.push(...paramRows(prop.items, `${label}[].`, topLevelOnly));
    }
  }
  return rows;
}

function nestedParamRows(schema: JsonSchemaNode): string[] {
  const rows: string[] = [];
  let groupIndex = 0;
  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    if (prop.type !== 'array' || !prop.items?.properties) continue;
    const scope = `${name}[]`;
    const fields = Object.entries(prop.items.properties);
    const itemRequired = new Set(prop.items.required ?? []);
    fields.forEach(([field, fieldProp], index) => {
      const fullLabel = `${name}[].${field}`;
      const notes: string[] = [];
      const hint = siteParamDescription(fullLabel, fieldProp.description);
      if (hint !== '-') notes.push(richText(hint));
      if (fieldProp.default !== undefined) {
        notes.push(`Default: <code>${escapeHtml(JSON.stringify(fieldProp.default))}</code>`);
      }
      const groupClass = index === 0 && groupIndex > 0 ? ' param-row--group-start' : '';
      const scopeCell = index === 0
        ? `<td class="param-scope" rowspan="${fields.length}"><code>${escapeHtml(scope)}</code></td>`
        : '';
      rows.push(
        `          <tr class="param-row--nested${groupClass}">${scopeCell}<td><code>${escapeHtml(field)}</code></td>` +
        `<td><code>${escapeHtml(typeLabel(fieldProp))}</code></td>` +
        `<td>${itemRequired.has(field) ? 'yes' : 'no'}</td><td>${notes.join(' ') || '-'}</td></tr>`,
      );
    });
    groupIndex += 1;
  }
  return rows;
}

function renderParamTable(schema: JsonSchemaNode, topLevelOnly: boolean): string {
  const rows = paramRows(schema, '', topLevelOnly);
  if (rows.length === 0) return '';
  return [
    '        <div class="table-wrap">',
    '        <table class="param-table">',
    '          <thead><tr><th scope="col">Parameter</th><th scope="col">Type</th><th scope="col">Required</th><th scope="col">Description</th></tr></thead>',
    '          <tbody>',
    ...rows,
    '          </tbody>',
    '        </table>',
    '        </div>',
  ].join('\n');
}

function renderNestedParamTable(schema: JsonSchemaNode): string {
  const rows = nestedParamRows(schema);
  if (rows.length === 0) return '';
  return [
    '        <div class="table-wrap">',
    '        <table class="param-table param-table--nested">',
    '          <thead><tr><th scope="col">In</th><th scope="col">Field</th><th scope="col">Type</th><th scope="col">Required</th><th scope="col">Description</th></tr></thead>',
    '          <tbody>',
    ...rows,
    '          </tbody>',
    '        </table>',
    '        </div>',
  ].join('\n');
}

function renderTool(tool: CapturedTool): string {
  const lines: string[] = [];
  const siteGuide = SITE_TOOL_GUIDES[tool.name];
  const summary = SITE_TOOL_SUMMARIES[tool.name] ?? firstSentence(tool.description);
  const hasSiteGuide = siteGuide !== undefined && siteGuide.length > 0;
  const hasLongSource = tool.description.length > summary.length + 20;

  lines.push(`      <section class="tool" id="${escapeHtml(tool.name)}">`);
  lines.push(`        <h3><code>${escapeHtml(tool.name)}</code></h3>`);
  lines.push(`        <p class="tool-summary">${richText(summary)}</p>`);
  if (hasSiteGuide || hasLongSource) {
    lines.push('        <details class="tool-details">');
    lines.push('          <summary>Full description</summary>');
    if (hasSiteGuide) {
      lines.push(renderGuideParagraphs(siteGuide));
    } else {
      lines.push(`          <p>${richText(tool.description)}</p>`);
    }
    lines.push('        </details>');
  } else if (tool.description !== summary) {
    lines.push(`        <p>${richText(tool.description)}</p>`);
  }

  if (tool.params) {
    const topRows = paramRows(tool.params, '', true);
    const nestedRows = nestedParamRows(tool.params);
    const hasNested = nestedRows.length > 0;
    const allRows = paramRows(tool.params);
    if (topRows.length > 0) {
      lines.push(renderParamTable(tool.params, true));
    }
    if (hasNested) {
      lines.push('        <details class="tool-details">');
      lines.push('          <summary>Nested fields</summary>');
      lines.push('          <p class="table-caption">Each item in these arrays is an object with the fields below.</p>');
      lines.push(renderNestedParamTable(tool.params));
      lines.push('        </details>');
    } else if (allRows.length > 6) {
      lines.push('        <details class="tool-details">');
      lines.push('          <summary>All parameters</summary>');
      lines.push(renderParamTable(tool.params, false));
      lines.push('        </details>');
    } else if (topRows.length === 0) {
      lines.push(renderParamTable(tool.params, false));
    }
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
    `      <p>The server registers ${tools.length} MCP tools. Each entry shows a short summary; expand for the full description and advanced parameters.</p>`,
    '      <nav aria-label="Tools on this page">',
    '      <ul>',
    ...toc,
    '      </ul>',
    '      </nav>',
    ...sections,
  ].join('\n');
}

function schemaRoot(json: JsonSchemaNode & { title?: string }): JsonSchemaNode {
  if (json.$ref && json.definitions) {
    const name = json.$ref.split('/').pop()!;
    return json.definitions[name] ?? json;
  }
  return json;
}

function renderFieldTable(schema: JsonSchemaNode, caption: string): string {
  const rows = paramRows(schema);
  if (rows.length === 0) return '';
  return [
    `        <p class="table-caption">${escapeHtml(caption)}</p>`,
    '        <div class="table-wrap">',
    '        <table>',
    '          <thead><tr><th scope="col">Field</th><th scope="col">Type</th><th scope="col">Required</th><th scope="col">Description</th></tr></thead>',
    '          <tbody>',
    ...rows,
    '          </tbody>',
    '        </table>',
    '        </div>',
  ].join('\n');
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
    if (json.description) lines.push(`        <p class="schema-summary">${richText(firstSentence(json.description))}</p>`);
    if (json.description && json.description.length > 120) {
      lines.push('        <details class="schema-details">');
      lines.push('          <summary>Full schema description</summary>');
      lines.push(`          <p>${richText(json.description)}</p>`);
      lines.push('        </details>');
    }
    lines.push(`        <p><a href="${GITHUB_BLOB}/schemas/${file}">Edit source on GitHub</a></p>`);
    if (root.properties) {
      const topLevel: JsonSchemaNode = { properties: {}, required: root.required };
      for (const [name, prop] of Object.entries(root.properties)) {
        topLevel.properties![name] = prop;
      }
      lines.push(renderFieldTable(topLevel, 'Top-level fields'));
      const allRows = paramRows(root);
      const topRows = paramRows(topLevel);
      if (allRows.length > topRows.length) {
        lines.push('        <details class="schema-details">');
        lines.push('          <summary>All fields (including nested)</summary>');
        lines.push(renderFieldTable(root, 'Complete field list'));
        lines.push('        </details>');
      }
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

const BEGIN = '<!-- BEGIN GENERATED';
const END = '<!-- END GENERATED';

type GeneratedRegion = 'NAV' | 'BREADCRUMB' | 'PAGINATION' | 'CONTENT';

function markerPair(region: GeneratedRegion): { begin: string; end: string } {
  if (region === 'CONTENT') {
    return {
      begin: `${BEGIN} — edit scripts/generate-site-data.ts, then run npm run build:site -->`,
      end: `${END} -->`,
    };
  }
  return { begin: `${BEGIN} ${region} -->`, end: `${END} ${region} -->` };
}

export function extractRegion(page: string, region: GeneratedRegion): string {
  const { begin, end } = markerPair(region);
  const start = page.indexOf(begin);
  const endIdx = page.indexOf(end);
  if (start === -1 || endIdx === -1 || endIdx < start) return '';
  return page.slice(start + begin.length, endIdx).replace(/^\n/, '').replace(/\n\s*$/, '');
}

export function injectRegion(page: string, generated: string, region: GeneratedRegion): string {
  const { begin, end } = markerPair(region);
  const start = page.indexOf(begin);
  const endIdx = page.indexOf(end);
  if (start === -1 || endIdx === -1 || endIdx < start) {
    throw new Error(`Missing or malformed GENERATED ${region} markers`);
  }
  const pad = region === 'CONTENT' ? '\n' : '\n';
  const suffix = region === 'CONTENT' ? '\n      ' : '\n';
  return page.slice(0, start + begin.length) + pad + generated + suffix + page.slice(endIdx);
}

function renderContentRegion(relPath: string): string | null {
  if (relPath === 'api/tools.html') return renderToolsRegion();
  if (relPath === 'api/schemas.html') return renderSchemasRegion();
  return null;
}

function allHtmlRelPaths(): string[] {
  return readdirSync(SITE_DIR, { recursive: true, encoding: 'utf-8' })
    .filter(f => f.endsWith('.html'))
    .map(f => f.replace(/\\/g, '/'));
}

/** Compute post-regeneration content for every site page that has generated markers. */
export function renderSitePages(): Array<{ relPath: string; content: string }> {
  const results: Array<{ relPath: string; content: string }> = [];
  for (const relPath of allHtmlRelPaths()) {
    const pagePath = join(SITE_DIR, relPath);
    let content = readFileSync(pagePath, 'utf-8');
    if (!content.includes('BEGIN GENERATED NAV')) continue;

    content = injectRegion(content, renderSiteNav(relPath), 'NAV');
    content = injectRegion(content, renderBreadcrumb(relPath), 'BREADCRUMB');
    content = injectRegion(content, renderPagination(relPath), 'PAGINATION');

    const homeHref = hrefFrom(relPath, 'index.html');
    content = content.replace(
      /<a class="site-title" href="[^"]*">Workflow Server<\/a>/,
      `<a class="site-title" href="${homeHref}">Workflow Server</a>`,
    );

    const body = renderContentRegion(relPath);
    if (body !== null) {
      content = injectRegion(content, body, 'CONTENT');
    }
    results.push({ relPath, content });
  }
  return results;
}

const isMain = process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.filename);
if (isMain) {
  for (const { relPath, content } of renderSitePages()) {
    writeFileSync(join(SITE_DIR, relPath), content);
    console.log(`[PASS] Regenerated site/${relPath}`);
  }
}
