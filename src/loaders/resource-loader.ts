import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { ResourceNotFoundError } from '../errors.js';
import { logInfo, logError, logWarn } from '../logging.js';
import { decodeToon } from '../utils/toon.js';

export interface ResourceEntry { 
  index: string;  // e.g., "00", "01"
  name: string;   // e.g., "start-here"
  title: string;  // e.g., "Start Here"
  path: string;   // e.g., "resources/00-start-here.toon"
  format: 'toon' | 'markdown';
}

export interface Resource {
  id: string;
  version?: string;
  title: string;
  purpose?: string;
  sections?: unknown[];
  [key: string]: unknown;
}

/** Normalize a resource index to a consistent width for comparison. */
function normalizeResourceIndex(index: string): string {
  return index.padStart(3, '0');
}

/**
 * Parse a resource filename to extract index and name.
 * Expected format: {NN}-{name}.toon or {NN}-{name}.md (in resources/ subdirectory)
 * 
 * @param filename - Resource filename
 * @returns Parsed index, name, and format, or null if not a valid resource file
 */
function parseResourceFilename(filename: string): { index: string; name: string; format: 'toon' | 'markdown' } | null {
  // Match pattern: {digits}-{name}.toon
  const toonMatch = filename.match(/^(\d+)-(.+)\.toon$/);
  if (toonMatch && toonMatch[1] && toonMatch[2]) {
    return { index: toonMatch[1], name: toonMatch[2], format: 'toon' };
  }
  
  // Match pattern: {digits}-{name}.md
  const mdMatch = filename.match(/^(\d+)-(.+)\.md$/);
  if (mdMatch && mdMatch[1] && mdMatch[2]) {
    return { index: mdMatch[1], name: mdMatch[2], format: 'markdown' };
  }
  
  return null;
}

/**
 * Get the resource directory for a workflow, checking both 'resources/' and 'guides/' (legacy).
 */
function getResourceDir(workflowDir: string, workflowId: string): string | null {
  const resourceDir = join(workflowDir, workflowId, 'resources');
  if (existsSync(resourceDir)) return resourceDir;
  
  // Fallback to legacy 'guides/' folder
  const guidesDir = join(workflowDir, workflowId, 'guides');
  if (existsSync(guidesDir)) return guidesDir;
  
  return null;
}

/**
 * Read a resource by index from a workflow directory.
 * Resources are stored in {workflowDir}/{workflowId}/resources/ subdirectory.
 * Falls back to {workflowDir}/{workflowId}/guides/ for backwards compatibility.
 * Supports both TOON (.toon) and Markdown (.md) formats.
 * 
 * @param workflowDir - Base workflow directory (e.g., './workflows')
 * @param workflowId - Workflow ID (e.g., 'work-package')
 * @param resourceIndex - Resource index (e.g., '00', '0', '01')
 * @returns Resource content as decoded object (TOON) or raw string (Markdown)
 */
export async function readResource(
  workflowDir: string, 
  workflowId: string, 
  resourceIndex: string
): Promise<Result<Resource | string, ResourceNotFoundError>> {
  const resourceDir = getResourceDir(workflowDir, workflowId);
  
  if (!resourceDir) {
    return err(new ResourceNotFoundError(resourceIndex, workflowId));
  }
  
  const normalizedIndex = normalizeResourceIndex(resourceIndex);
  
  try {
    const files = (await readdir(resourceDir)).sort();
    
    // Two-pass: prefer TOON over Markdown for the same index
    let mdFallback: string | null = null;
    for (const file of files) {
      const parsed = parseResourceFilename(file);
      if (!parsed) continue;
      const fileIndex = normalizeResourceIndex(parsed.index);
      if (fileIndex !== normalizedIndex && parsed.index !== resourceIndex) continue;
      
      if (parsed.format === 'toon') {
        const filePath = join(resourceDir, file);
        const content = await readFile(filePath, 'utf-8');
        logInfo('Resource loaded', { workflowId, resourceIndex, path: filePath, format: 'toon' });
        return ok(decodeToon<Resource>(content));
      }
      if (!mdFallback) mdFallback = file;
    }
    
    if (mdFallback) {
      const filePath = join(resourceDir, mdFallback);
      const content = await readFile(filePath, 'utf-8');
      logInfo('Resource loaded', { workflowId, resourceIndex, path: filePath, format: 'markdown' });
      return ok(content);
    }
  } catch (error) {
    logError('Failed to read resource', error instanceof Error ? error : undefined, { workflowId, resourceIndex });
  }
  
  return err(new ResourceNotFoundError(resourceIndex, workflowId));
}

/**
 * Read a resource by index and return raw content (for resource serving).
 * Resources are stored in {workflowDir}/{workflowId}/resources/ subdirectory.
 * Falls back to {workflowDir}/{workflowId}/guides/ for backwards compatibility.
 * Returns the original file content without parsing.
 */
export async function readResourceRaw(
  workflowDir: string, 
  workflowId: string, 
  resourceIndex: string
): Promise<Result<{ content: string; format: 'toon' | 'markdown' }, ResourceNotFoundError>> {
  const resourceDir = getResourceDir(workflowDir, workflowId);
  
  if (!resourceDir) {
    return err(new ResourceNotFoundError(resourceIndex, workflowId));
  }
  
  const normalizedIndex = normalizeResourceIndex(resourceIndex);
  
  try {
    const files = (await readdir(resourceDir)).sort();
    
    // Prefer TOON over Markdown for the same index
    let mdFallback: { file: string; parsed: ReturnType<typeof parseResourceFilename> } | null = null;
    for (const file of files) {
      const parsed = parseResourceFilename(file);
      if (!parsed) continue;
      const fileIndex = normalizeResourceIndex(parsed.index);
      if (fileIndex !== normalizedIndex && parsed.index !== resourceIndex) continue;
      
      if (parsed.format === 'toon') {
        const filePath = join(resourceDir, file);
        const content = await readFile(filePath, 'utf-8');
        logInfo('Resource loaded (raw)', { workflowId, resourceIndex, path: filePath, format: 'toon' });
        return ok({ content, format: parsed.format });
      }
      if (!mdFallback) mdFallback = { file, parsed };
    }
    
    if (mdFallback && mdFallback.parsed) {
      const filePath = join(resourceDir, mdFallback.file);
      const content = await readFile(filePath, 'utf-8');
      logInfo('Resource loaded (raw)', { workflowId, resourceIndex, path: filePath, format: mdFallback.parsed.format });
      return ok({ content, format: mdFallback.parsed.format });
    }
  } catch (error) {
    logWarn('Failed to read resource (raw)', { workflowId, resourceIndex, error: error instanceof Error ? error.message : String(error) });
  }
  
  return err(new ResourceNotFoundError(resourceIndex, workflowId));
}

/**
 * List all resources available for a workflow.
 * Looks in {workflowDir}/{workflowId}/resources/ for {NN}-{name}.toon and .md files.
 * Falls back to {workflowDir}/{workflowId}/guides/ for backwards compatibility.
 */
export async function listResources(workflowDir: string, workflowId: string): Promise<ResourceEntry[]> {
  const resourceDir = getResourceDir(workflowDir, workflowId);
  
  if (!resourceDir) return [];
  
  try {
    const files = await readdir(resourceDir);
    const resources: ResourceEntry[] = [];
    
    for (const file of files) {
      const parsed = parseResourceFilename(file);
      if (parsed) {
        // Generate title from name
        const title = parsed.name.split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        
        resources.push({
          index: parsed.index,
          name: parsed.name,
          title,
          path: `resources/${file}`,
          format: parsed.format,
        });
      }
    }
    
    // Sort by index
    resources.sort((a, b) => parseInt(a.index, 10) - parseInt(b.index, 10));
    
    return resources;
  } catch (error) {
    logWarn('Failed to list resources', { workflowId, error: error instanceof Error ? error.message : String(error) });
    return []; 
  }
}

/**
 * Get a resource entry by index without loading content.
 */
export async function getResourceEntry(
  workflowDir: string, 
  workflowId: string, 
  resourceIndex: string
): Promise<ResourceEntry | null> {
  const resources = await listResources(workflowDir, workflowId);
  const normalizedIndex = normalizeResourceIndex(resourceIndex);
  
  return resources.find(r => 
    normalizeResourceIndex(r.index) === normalizedIndex || 
    r.index === resourceIndex
  ) ?? null;
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
 * Read a resource by index and return structured metadata + content.
 * Parses frontmatter (id, version) and returns body separately.
 */
export async function readResourceStructured(
  workflowDir: string,
  workflowId: string,
  resourceIndex: string,
): Promise<Result<StructuredResource, ResourceNotFoundError>> {
  const rawResult = await readResourceRaw(workflowDir, workflowId, resourceIndex);
  if (!rawResult.success) return rawResult;

  const { id, version, content } = parseFrontmatter(rawResult.value.content);
  const normalizedIndex = normalizeResourceIndex(resourceIndex);

  return ok({ index: normalizedIndex, id, version, content });
}

/**
 * List all workflows that contain resources.
 * Scans {workflowDir}/ for subdirectories containing a resources/ subdirectory with resource files.
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
