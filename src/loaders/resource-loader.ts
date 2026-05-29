import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { ResourceNotFoundError } from '../errors.js';
import { logInfo, logError, logWarn } from '../logging.js';
import type { Resource } from '../schema/resource.schema.js';

export { ResourceNotFoundError } from '../errors.js';
export type { Resource };

/**
 * A resource entry. Resources are identified ONLY by id (the frontmatter `name:`
 * slug, which equals the folder name on disk). The numeric-index layout
 * (`NN-name.md` flat files) is no longer supported.
 */
export interface ResourceEntry {
  /** Canonical id — the folder slug (also the frontmatter `name:`). */
  id: string;
  /** Same as id; kept for callers that previously read .name. */
  name: string;
  /** Human-readable title derived from the slug. */
  title: string;
  /** Repo-relative path to the resource's `SKILL.md`. */
  path: string;
  format: 'markdown';
}

/**
 * Extract a YAML-frontmatter scalar value (e.g. `name`, `version`) by key.
 * Mirrors the canonical frontmatter shape used by markdown-skill-loader.ts.
 */
function extractFrontmatterScalar(content: string, key: string): string | undefined {
  const fmMatch = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return undefined;
  const re = new RegExp(`^${key}\\s*:\\s*(.+)$`, 'm');
  const m = fmMatch[1]?.match(re);
  if (!m || !m[1]) return undefined;
  let v = m[1].trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  else if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
  return v;
}

/**
 * Resolve the resource directory for a workflow.
 * The `guides/` fallback is retained for backward compatibility (orthogonal to this migration).
 */
function getResourceDir(workflowDir: string, workflowId: string): string | null {
  const resourceDir = join(workflowDir, workflowId, 'resources');
  if (existsSync(resourceDir)) return resourceDir;

  const guidesDir = join(workflowDir, workflowId, 'guides');
  if (existsSync(guidesDir)) return guidesDir;

  return null;
}

/**
 * Locate the SKILL.md for a resource by id.
 * Resolution:
 *   1. Direct folder match `<resourceDir>/<id>/SKILL.md`.
 *   2. Frontmatter-name match across folder children — accommodates the case where the
 *      caller passed a name that does not equal the folder slug.
 * Returns the absolute path to SKILL.md, or null.
 */
async function findResourceSkillMd(workflowDir: string, workflowId: string, id: string): Promise<string | null> {
  const resourceDir = getResourceDir(workflowDir, workflowId);
  if (!resourceDir) return null;

  // 1. Direct folder match by slug.
  const direct = join(resourceDir, id, 'SKILL.md');
  if (existsSync(direct)) return direct;

  // 2. Frontmatter-name match across folder children.
  try {
    const entries = await readdir(resourceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const candidate = join(resourceDir, entry.name, 'SKILL.md');
      if (!existsSync(candidate)) continue;
      try {
        const content = await readFile(candidate, 'utf-8');
        const name = extractFrontmatterScalar(content, 'name');
        if (name === id || entry.name === id) return candidate;
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
  return null;
}

/**
 * Read a resource by id.
 * Returns the raw markdown content as a string.
 */
export async function readResource(
  workflowDir: string,
  workflowId: string,
  resourceId: string,
): Promise<Result<Resource | string, ResourceNotFoundError>> {
  const rawResult = await readResourceRaw(workflowDir, workflowId, resourceId);
  if (!rawResult.success) return rawResult;
  return ok(rawResult.value.content);
}

/**
 * Read a resource by id and return raw markdown content with format metadata.
 *
 * Resources live exclusively under `<workflowDir>/<workflowId>/resources/<id>/SKILL.md`.
 * The legacy flat `NN-name.md` shape is no longer supported.
 */
export async function readResourceRaw(
  workflowDir: string,
  workflowId: string,
  resourceId: string,
): Promise<Result<{ content: string; format: 'markdown' }, ResourceNotFoundError>> {
  const resourceDir = getResourceDir(workflowDir, workflowId);
  if (!resourceDir) return err(new ResourceNotFoundError(resourceId, workflowId));

  const folderPath = await findResourceSkillMd(workflowDir, workflowId, resourceId);
  if (folderPath) {
    try {
      const content = await readFile(folderPath, 'utf-8');
      logInfo('Resource loaded (raw)', { workflowId, resourceId, path: folderPath, format: 'markdown' });
      return ok({ content, format: 'markdown' });
    } catch (error) {
      logError('Failed to read resource SKILL.md', error instanceof Error ? error : undefined, { workflowId, resourceId });
    }
  }

  return err(new ResourceNotFoundError(resourceId, workflowId));
}

/**
 * List all resources available for a workflow. Folder-shape only.
 */
export async function listResources(workflowDir: string, workflowId: string): Promise<ResourceEntry[]> {
  const resourceDir = getResourceDir(workflowDir, workflowId);
  if (!resourceDir) return [];

  const resources: ResourceEntry[] = [];

  try {
    const entries = await readdir(resourceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const candidate = join(resourceDir, entry.name, 'SKILL.md');
      if (!existsSync(candidate)) continue;
      try {
        const content = await readFile(candidate, 'utf-8');
        const id = extractFrontmatterScalar(content, 'name') ?? entry.name;
        const title = entry.name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        resources.push({ id, name: entry.name, title, path: `resources/${entry.name}/SKILL.md`, format: 'markdown' });
      } catch {
        // ignore unreadable entries
      }
    }

    resources.sort((a, b) => a.name.localeCompare(b.name));
    return resources;
  } catch (error) {
    logWarn('Failed to list resources', { workflowId, error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

/** Get a resource entry by id without loading content. */
export async function getResourceEntry(
  workflowDir: string,
  workflowId: string,
  resourceId: string,
): Promise<ResourceEntry | null> {
  const resources = await listResources(workflowDir, workflowId);
  return resources.find((r) => r.id === resourceId || r.name === resourceId) ?? null;
}

export interface StructuredResource {
  /** Canonical id of the resource (the frontmatter `name:` slug). */
  id: string;
  version: string | undefined;
  content: string;
}

function parseStructuredFrontmatter(raw: string): { name: string | undefined; version: string | undefined; content: string } {
  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fmMatch) return { name: undefined, version: undefined, content: raw };

  const frontmatter = fmMatch[1] ?? '';
  const body = (fmMatch[2] ?? '').trim();

  // Canonical SKILL.md uses `name:` (sibling to markdown-skill-loader).
  // `version:` lives under either `version:` at top level or `metadata.version:` nested.
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const topVersionMatch = frontmatter.match(/^version:\s*(.+)$/m);
  const nestedVersionMatch = frontmatter.match(/^\s{2,}version:\s*(.+)$/m);

  return {
    name: nameMatch?.[1]?.trim(),
    version: (topVersionMatch?.[1] ?? nestedVersionMatch?.[1])?.trim(),
    content: body,
  };
}

/**
 * Read a resource and return structured metadata + content. Parses frontmatter (name, version)
 * and returns the body separately.
 */
export async function readResourceStructured(
  workflowDir: string,
  workflowId: string,
  resourceId: string,
): Promise<Result<StructuredResource, ResourceNotFoundError>> {
  const rawResult = await readResourceRaw(workflowDir, workflowId, resourceId);
  if (!rawResult.success) return rawResult;

  const { name, version, content } = parseStructuredFrontmatter(rawResult.value.content);
  return ok({ id: name ?? resourceId, version, content });
}

/**
 * List all workflows that contain resources. Folder-shape only.
 */
export async function listWorkflowsWithResources(workflowDir: string): Promise<string[]> {
  if (!existsSync(workflowDir)) return [];

  try {
    const entries = await readdir(workflowDir);
    const workflows: string[] = [];

    for (const entry of entries) {
      const entryPath = join(workflowDir, entry);
      const stats = await stat(entryPath);

      if (stats.isDirectory()) {
        const resources = await listResources(workflowDir, entry);
        if (resources.length > 0) {
          workflows.push(entry);
        }
      }
    }

    return workflows.sort();
  } catch (error) {
    logWarn('Failed to list workflows with resources', { workflowDir, error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}
