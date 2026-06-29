import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { ResourceNotFoundError } from '../errors.js';
import { logInfo, logError } from '../logging.js';
import type { Resource } from '../schema/resource.schema.js';

export { ResourceNotFoundError } from '../errors.js';
export type { Resource };

/**
 * Extract a YAML-frontmatter scalar value (e.g. `name`, `version`) by key.
 * Mirrors the canonical frontmatter shape used by markdown-technique-loader.ts.
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
 */
function getResourceDir(workflowDir: string, workflowId: string): string | null {
  const resourceDir = join(workflowDir, workflowId, 'resources');
  if (existsSync(resourceDir)) return resourceDir;
  return null;
}

/**
 * Locate the markdown file for a resource by id.
 * Resolution:
 *   1. Flat file match `<resourceDir>/<id>.md`.
 *   2. Frontmatter-name match across flat resource files — accommodates the case where the
 *      caller passed a name that does not equal the file slug.
 * Returns the absolute path to the resource file, or null.
 */
async function findResourceSkillMd(workflowDir: string, workflowId: string, id: string): Promise<string | null> {
  const resourceDir = getResourceDir(workflowDir, workflowId);
  if (!resourceDir) return null;

  // 1. Flat file match by slug: `<resourceDir>/<id>.md`.
  const flat = join(resourceDir, `${id}.md`);
  if (existsSync(flat)) return flat;

  // 2. Frontmatter-name match across flat resource files.
  try {
    const entries = await readdir(resourceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name === 'README.md') continue;
      const candidate = join(resourceDir, entry.name);
      try {
        const content = await readFile(candidate, 'utf-8');
        const name = extractFrontmatterScalar(content, 'name');
        const slug = entry.name.replace(/\.md$/, '');
        if (name === id || slug === id) return candidate;
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
  return null;
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

  // Canonical SKILL.md uses `name:` (sibling to markdown-technique-loader).
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
