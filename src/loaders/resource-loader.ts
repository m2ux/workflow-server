import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { ResourceNotFoundError } from '../errors.js';
import { logInfo, logError, logWarn } from '../logging.js';
import type { Resource } from '../schema/resource.schema.js';

export type { Resource };

export interface ResourceEntry {
  index: string;  // e.g., "00", "01"
  name: string;   // e.g., "start-here"
  title: string;  // e.g., "Start Here"
  path: string;   // e.g., "resources/00-start-here.md"
  format: 'markdown';
}

/** Normalize a resource index to a consistent width for comparison. */
function normalizeResourceIndex(index: string): string {
  return index.padStart(3, '0');
}

/** True when a resource ref looks like a numeric index (legacy) rather than an id. */
function isNumericIndex(ref: string): boolean {
  return /^\d+$/.test(ref);
}

/**
 * Resolve an id-style ref to a concrete numeric index by inspecting flat markdown filenames and
 * the optional `<slug>/SKILL.md` folder shape. Returns null when no match.
 */
async function resolveResourceRefToIndex(
  workflowDir: string,
  workflowId: string,
  ref: string,
): Promise<string | null> {
  if (isNumericIndex(ref)) return ref;
  const resourceDir = getResourceDir(workflowDir, workflowId);
  if (!resourceDir) return null;

  try {
    const entries = (await readdir(resourceDir)).sort();
    for (const entry of entries) {
      const parsed = parseResourceFilename(entry);
      if (!parsed) continue;
      if (parsed.name === ref) return parsed.index;
      // Inspect frontmatter id for legacy flat .md files.
      const filePath = join(resourceDir, entry);
      try {
        const content = await readFile(filePath, 'utf-8');
        const id = extractFrontmatterId(content);
        if (id === ref) return parsed.index;
      } catch { /* ignore and try next */ }
    }
  } catch (error) {
    logWarn('Failed to resolve resource ref by id', { workflowId, ref, error: error instanceof Error ? error.message : String(error) });
  }
  return null;
}

function extractFrontmatterId(content: string): string | undefined {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fmMatch) return undefined;
  const idMatch = fmMatch[1]?.match(/^id:\s*(.+)$/m);
  return idMatch?.[1]?.trim();
}

/**
 * Parse a resource filename to extract index and name.
 * Markdown-only: matches `{NN}-{name}.md`. The legacy `.toon` variant is no longer accepted by the
 * loader as of the markdown-skills migration; TOON resources are gone in Phase C and would resolve
 * to ResourceNotFoundError on this branch.
 */
function parseResourceFilename(filename: string): { index: string; name: string; format: 'markdown' } | null {
  const mdMatch = filename.match(/^(\d+)-(.+)\.md$/);
  if (mdMatch && mdMatch[1] && mdMatch[2]) {
    return { index: mdMatch[1], name: mdMatch[2], format: 'markdown' };
  }
  return null;
}

/**
 * Look up a resource folder `<slug>/SKILL.md` by slug or by its SKILL.md frontmatter id.
 * Returns the absolute path to SKILL.md, or null.
 */
async function findFolderResource(workflowDir: string, workflowId: string, ref: string): Promise<string | null> {
  const resourceDir = getResourceDir(workflowDir, workflowId);
  if (!resourceDir) return null;
  // Direct folder match by slug.
  const direct = join(resourceDir, ref, 'SKILL.md');
  if (existsSync(direct)) return direct;
  // Frontmatter-id match across folder children.
  try {
    const entries = await readdir(resourceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const candidate = join(resourceDir, entry.name, 'SKILL.md');
      if (!existsSync(candidate)) continue;
      try {
        const content = await readFile(candidate, 'utf-8');
        const id = extractFrontmatterId(content);
        if (id === ref || entry.name === ref) return candidate;
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
  return null;
}

/**
 * Get the resource directory for a workflow, checking both 'resources/' and 'guides/' (legacy).
 * The 'guides/' fallback is orthogonal to this migration and retained for backward compatibility.
 */
function getResourceDir(workflowDir: string, workflowId: string): string | null {
  const resourceDir = join(workflowDir, workflowId, 'resources');
  if (existsSync(resourceDir)) return resourceDir;

  const guidesDir = join(workflowDir, workflowId, 'guides');
  if (existsSync(guidesDir)) return guidesDir;

  return null;
}

/**
 * Read a resource by index or id.
 * Returns the markdown content as a string. TOON resources are not loaded post-migration.
 */
export async function readResource(
  workflowDir: string,
  workflowId: string,
  resourceIndex: string,
): Promise<Result<Resource | string, ResourceNotFoundError>> {
  const rawResult = await readResourceRaw(workflowDir, workflowId, resourceIndex);
  if (!rawResult.success) return rawResult;
  return ok(rawResult.value.content);
}

/**
 * Read a resource by index or id and return raw markdown content with format metadata.
 *
 * Resolution order:
 *   0. When the ref names a folder slug or matches a folder's SKILL.md frontmatter id, return that.
 *   1. Otherwise resolve via the legacy flat `{NN}-{name}.md` shape, optionally with an id-frontmatter fallback.
 */
export async function readResourceRaw(
  workflowDir: string,
  workflowId: string,
  resourceIndex: string,
): Promise<Result<{ content: string; format: 'markdown' }, ResourceNotFoundError>> {
  const resourceDir = getResourceDir(workflowDir, workflowId);
  if (!resourceDir) return err(new ResourceNotFoundError(resourceIndex, workflowId));

  // Folder-shape lookup first when the ref is id-style.
  if (!isNumericIndex(resourceIndex)) {
    const folderPath = await findFolderResource(workflowDir, workflowId, resourceIndex);
    if (folderPath) {
      try {
        const content = await readFile(folderPath, 'utf-8');
        logInfo('Resource loaded (raw, folder)', { workflowId, resourceIndex, path: folderPath, format: 'markdown' });
        return ok({ content, format: 'markdown' });
      } catch (error) {
        logWarn('Failed to read resource folder SKILL.md', { workflowId, resourceIndex, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  // Resolve id-based refs to numeric indices (numeric refs pass through unchanged).
  const effectiveIndex = isNumericIndex(resourceIndex)
    ? resourceIndex
    : (await resolveResourceRefToIndex(workflowDir, workflowId, resourceIndex)) ?? resourceIndex;

  const normalizedIndex = normalizeResourceIndex(effectiveIndex);

  try {
    const entries = (await readdir(resourceDir)).sort();
    for (const entry of entries) {
      const parsed = parseResourceFilename(entry);
      if (!parsed) continue;
      const fileIndex = normalizeResourceIndex(parsed.index);
      if (fileIndex !== normalizedIndex && parsed.index !== resourceIndex) continue;
      const filePath = join(resourceDir, entry);
      const content = await readFile(filePath, 'utf-8');
      logInfo('Resource loaded (raw, flat)', { workflowId, resourceIndex, path: filePath, format: parsed.format });
      return ok({ content, format: parsed.format });
    }
  } catch (error) {
    logError('Failed to read resource (raw)', error instanceof Error ? error : undefined, { workflowId, resourceIndex });
  }

  return err(new ResourceNotFoundError(resourceIndex, workflowId));
}

/**
 * List all resources available for a workflow. Markdown only.
 * Includes both the legacy flat `NN-name.md` shape and the new `<slug>/SKILL.md` folder shape.
 */
export async function listResources(workflowDir: string, workflowId: string): Promise<ResourceEntry[]> {
  const resourceDir = getResourceDir(workflowDir, workflowId);
  if (!resourceDir) return [];

  const resources: ResourceEntry[] = [];

  try {
    const entries = await readdir(resourceDir, { withFileTypes: true });
    for (const entry of entries) {
      // Flat NN-name.md
      if (entry.isFile()) {
        const parsed = parseResourceFilename(entry.name);
        if (parsed) {
          const title = parsed.name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          resources.push({ index: parsed.index, name: parsed.name, title, path: `resources/${entry.name}`, format: 'markdown' });
        }
        continue;
      }
      // <slug>/SKILL.md folder shape — index is not derivable from path; use frontmatter or a synthetic slot.
      if (entry.isDirectory()) {
        const candidate = join(resourceDir, entry.name, 'SKILL.md');
        if (!existsSync(candidate)) continue;
        try {
          const content = await readFile(candidate, 'utf-8');
          const id = extractFrontmatterId(content) ?? entry.name;
          // Folder resources do not carry an NN- prefix; expose the slug as both name and id-style index.
          const title = entry.name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          resources.push({ index: id, name: entry.name, title, path: `resources/${entry.name}/SKILL.md`, format: 'markdown' });
        } catch {
          // ignore unreadable entries
        }
      }
    }

    // Sort: flat NN-prefixed resources first (numeric order), folder-shape after (alpha).
    resources.sort((a, b) => {
      const aNum = /^\d+$/.test(a.index) ? parseInt(a.index, 10) : Number.POSITIVE_INFINITY;
      const bNum = /^\d+$/.test(b.index) ? parseInt(b.index, 10) : Number.POSITIVE_INFINITY;
      if (aNum !== bNum) return aNum - bNum;
      return a.name.localeCompare(b.name);
    });

    return resources;
  } catch (error) {
    logWarn('Failed to list resources', { workflowId, error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

/** Get a resource entry by index without loading content. */
export async function getResourceEntry(
  workflowDir: string,
  workflowId: string,
  resourceIndex: string,
): Promise<ResourceEntry | null> {
  const resources = await listResources(workflowDir, workflowId);
  const normalizedIndex = normalizeResourceIndex(resourceIndex);

  return resources.find((r) => {
    if (r.index === resourceIndex) return true;
    if (/^\d+$/.test(r.index) && normalizeResourceIndex(r.index) === normalizedIndex) return true;
    return false;
  }) ?? null;
}

export interface StructuredResource {
  index: string;
  id: string | undefined;
  version: string | undefined;
  content: string;
}

function parseFrontmatter(raw: string): { id: string | undefined; version: string | undefined; content: string } {
  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fmMatch) return { id: undefined, version: undefined, content: raw };

  const frontmatter = fmMatch[1] ?? '';
  const body = (fmMatch[2] ?? '').trim();

  const idMatch = frontmatter.match(/^id:\s*(.+)$/m);
  const versionMatch = frontmatter.match(/^version:\s*(.+)$/m);

  return {
    id: idMatch?.[1]?.trim(),
    version: versionMatch?.[1]?.trim(),
    content: body,
  };
}

/**
 * Read a resource and return structured metadata + content. Parses frontmatter (id, version)
 * and returns the body separately.
 */
export async function readResourceStructured(
  workflowDir: string,
  workflowId: string,
  resourceIndex: string,
): Promise<Result<StructuredResource, ResourceNotFoundError>> {
  const rawResult = await readResourceRaw(workflowDir, workflowId, resourceIndex);
  if (!rawResult.success) return rawResult;

  const { id, version, content } = parseFrontmatter(rawResult.value.content);
  const normalizedIndex = isNumericIndex(resourceIndex) ? normalizeResourceIndex(resourceIndex) : resourceIndex;

  return ok({ index: normalizedIndex, id, version, content });
}

/**
 * List all workflows that contain resources. Markdown-only — TOON resources are unsupported
 * post-migration. The `guides/` fallback is intentionally still considered.
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
