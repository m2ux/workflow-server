import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { ResourceNotFoundError } from '../errors.js';
import { logInfo, logError } from '../logging.js';
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
  
  // Normalize index (e.g., '0' -> '00' for lookup)
  const normalizedIndex = resourceIndex.padStart(2, '0');
  
  try {
    const files = await readdir(resourceDir);
    
    for (const file of files) {
      const parsed = parseResourceFilename(file);
      if (parsed) {
        // Match either exact index or normalized index
        const fileIndex = parsed.index.padStart(2, '0');
        if (fileIndex === normalizedIndex || parsed.index === resourceIndex) {
          const filePath = join(resourceDir, file);
          const content = await readFile(filePath, 'utf-8');
          logInfo('Resource loaded', { workflowId, resourceIndex, path: filePath, format: parsed.format });
          
          if (parsed.format === 'toon') {
            return ok(decodeToon<Resource>(content));
          }
          return ok(content);
        }
      }
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
  
  // Normalize index (e.g., '0' -> '00' for lookup)
  const normalizedIndex = resourceIndex.padStart(2, '0');
  
  try {
    const files = await readdir(resourceDir);
    
    for (const file of files) {
      const parsed = parseResourceFilename(file);
      if (parsed) {
        const fileIndex = parsed.index.padStart(2, '0');
        if (fileIndex === normalizedIndex || parsed.index === resourceIndex) {
          const filePath = join(resourceDir, file);
          const content = await readFile(filePath, 'utf-8');
          logInfo('Resource loaded (raw)', { workflowId, resourceIndex, path: filePath, format: parsed.format });
          return ok({ content, format: parsed.format });
        }
      }
    }
  } catch {
    // Fall through to error
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
  } catch { 
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
  const normalizedIndex = resourceIndex.padStart(2, '0');
  
  return resources.find(r => 
    r.index.padStart(2, '0') === normalizedIndex || 
    r.index === resourceIndex
  ) ?? null;
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
    
    return workflows;
  } catch {
    return [];
  }
}
