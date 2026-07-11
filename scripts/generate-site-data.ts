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

export type SiteSection = 'home' | 'guide' | 'specs' | 'api' | 'internals' | 'design';

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
  { relPath: 'specs/architecture.html', section: 'specs', title: 'Architecture overview', navLabel: 'Overview', sequence: 0, breadcrumbLabel: 'Architecture' },
  { relPath: 'specs/dispatch.html', section: 'specs', title: 'Hierarchical dispatch', navLabel: 'Dispatch', sequence: 1, parent: 'specs/architecture.html', breadcrumbLabel: 'Dispatch' },
  { relPath: 'specs/checkpoints.html', section: 'specs', title: 'Just-in-time checkpoints', navLabel: 'Checkpoints', sequence: 2, parent: 'specs/architecture.html', breadcrumbLabel: 'Checkpoints' },
  { relPath: 'specs/state-management.html', section: 'specs', title: 'State management', navLabel: 'State', sequence: 3, parent: 'specs/architecture.html', breadcrumbLabel: 'State' },
  { relPath: 'specs/artifact-management.html', section: 'specs', title: 'Artifact management', navLabel: 'Artifacts', sequence: 4, parent: 'specs/architecture.html', breadcrumbLabel: 'Artifacts' },
  { relPath: 'specs/resource-resolution.html', section: 'specs', title: 'Resource resolution', navLabel: 'Resolution', sequence: 5, parent: 'specs/architecture.html', breadcrumbLabel: 'Resolution' },
  { relPath: 'specs/workflow-fidelity.html', section: 'specs', title: 'Workflow fidelity', navLabel: 'Fidelity', sequence: 6, parent: 'specs/architecture.html', breadcrumbLabel: 'Fidelity' },
  { relPath: 'api/tools.html', section: 'api', title: 'MCP tool reference', navLabel: 'Tools', sequence: 1 },
  { relPath: 'api/schemas.html', section: 'api', title: 'Schema reference', navLabel: 'Schemas', sequence: 2 },
  { relPath: 'api/protocol.html', section: 'api', title: 'Protocol in practice', navLabel: 'Protocol guide', sequence: 3 },
  { relPath: 'internals/server-anatomy.html', section: 'internals', title: 'Server anatomy', navLabel: 'Server anatomy', sequence: 1 },
  { relPath: 'internals/request-lifecycle.html', section: 'internals', title: 'Request lifecycle', navLabel: 'Request lifecycle', sequence: 2 },
  { relPath: 'internals/session-store.html', section: 'internals', title: 'Session store', navLabel: 'Session store', sequence: 3 },
  { relPath: 'internals/quality-system.html', section: 'internals', title: 'Quality system', navLabel: 'Quality system', sequence: 4 },
  { relPath: 'design/rationale.html', section: 'design', title: 'Design rationale', navLabel: 'Design rationale', sequence: 1 },
];

const ROUTE_BY_PATH = new Map(SITE_ROUTES.map(r => [r.relPath, r]));

const NAV_SECTIONS: Array<{ id: SiteSection; label: string }> = [
  { id: 'guide', label: 'Guide' },
  { id: 'specs', label: 'Architecture' },
  { id: 'api', label: 'API' },
  { id: 'internals', label: 'Internals' },
  { id: 'design', label: 'Design' },
];

function routePrefix(relPath: string): string {
  const depth = relPath.split('/').length - 1;
  return depth === 0 ? '' : '../'.repeat(depth);
}

function hrefFrom(pageRelPath: string, targetRelPath: string): string {
  if (targetRelPath === 'index.html') {
    const depth = pageRelPath.split('/').length - 1;
    return depth === 0 ? './' : '../'.repeat(depth);
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

  if (route.section === 'design') {
    crumbs.push({ label: 'Design' });
    crumbs.push({ label: route.navLabel });
  } else if (hub && route.parent === hub.relPath) {
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
    if (prop.description) notes.push(richText(prop.description));
    if (prop.default !== undefined) notes.push(`Default: <code>${escapeHtml(JSON.stringify(prop.default))}</code>`);
    rows.push(
      `          <tr><td><code>${escapeHtml(label)}</code></td><td><code>${escapeHtml(typeLabel(prop))}</code></td>` +
      `<td>${required.has(name) ? 'yes' : 'no'}</td><td>${notes.join(' ') || '-'}</td></tr>`,
    );
    if (prop.type === 'array' && prop.items?.properties) {
      rows.push(...paramRows(prop.items, `${label}[].`, topLevelOnly));
    }
  }
  return rows;
}

function renderParamTable(schema: JsonSchemaNode, topLevelOnly: boolean): string {
  const rows = paramRows(schema, '', topLevelOnly);
  if (rows.length === 0) return '';
  return [
    '        <div class="table-wrap">',
    '        <table>',
    '          <thead><tr><th scope="col">Parameter</th><th scope="col">Type</th><th scope="col">Required</th><th scope="col">Description</th></tr></thead>',
    '          <tbody>',
    ...rows,
    '          </tbody>',
    '        </table>',
    '        </div>',
  ].join('\n');
}

function renderTool(tool: CapturedTool): string {
  const lines: string[] = [];
  const summary = firstSentence(tool.description);
  const hasLongDescription = tool.description.length > summary.length + 20;

  lines.push(`      <section class="tool" id="${escapeHtml(tool.name)}">`);
  lines.push(`        <h3><code>${escapeHtml(tool.name)}</code></h3>`);
  lines.push(`        <p class="tool-summary">${richText(summary)}</p>`);
  if (hasLongDescription) {
    lines.push('        <details class="tool-details">');
    lines.push('          <summary>Full description</summary>');
    lines.push(`          <p>${richText(tool.description)}</p>`);
    lines.push('        </details>');
  } else if (tool.description !== summary) {
    lines.push(`        <p>${richText(tool.description)}</p>`);
  }

  if (tool.params) {
    const allRows = paramRows(tool.params);
    const topRows = paramRows(tool.params, '', true);
    const hasNested = allRows.length > topRows.length;
    if (topRows.length > 0) {
      lines.push(renderParamTable(tool.params, true).replace('Parameter', 'Parameter').replace(/^        /gm, '        '));
    }
    if (hasNested || allRows.length > 6) {
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
