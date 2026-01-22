import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { GuideNotFoundError } from '../errors.js';
import { logInfo, logError } from '../logging.js';
import { decodeToon } from '../utils/toon.js';

export interface GuideEntry { 
  id: string; 
  title: string; 
  path: string;
  format: 'toon' | 'markdown';
}

export interface Guide {
  id: string;
  version?: string;
  title: string;
  purpose?: string;
  sections?: unknown[];
  [key: string]: unknown;
}

/**
 * Read a guide from a workflow directory.
 * Supports both TOON (.guide.toon) and Markdown (.guide.md, .md) formats.
 * 
 * @param workflowDir - Base workflow directory (e.g., './workflow-data/workflows')
 * @param workflowId - Workflow ID (e.g., 'work-package')
 * @param guideId - Guide ID (e.g., 'requirements-elicitation')
 * @returns Guide content as decoded object (TOON) or raw string (Markdown)
 */
export async function readGuide(
  workflowDir: string, 
  workflowId: string, 
  guideId: string
): Promise<Result<Guide | string, GuideNotFoundError>> {
  const guideDir = join(workflowDir, workflowId);
  
  // Try TOON format first, then Markdown
  const patterns = [
    { file: `${guideId}.guide.toon`, format: 'toon' as const },
    { file: `${guideId}.toon`, format: 'toon' as const },
    { file: `${guideId}.guide.md`, format: 'markdown' as const },
    { file: `${guideId}.md`, format: 'markdown' as const },
  ];

  for (const { file, format } of patterns) {
    const filePath = join(guideDir, file);
    if (existsSync(filePath)) {
      try {
        const content = await readFile(filePath, 'utf-8');
        logInfo('Guide loaded', { workflowId, guideId, path: filePath, format });
        
        if (format === 'toon') {
          return ok(decodeToon<Guide>(content));
        }
        return ok(content);
      } catch (error) {
        logError('Failed to parse guide', error instanceof Error ? error : undefined, { workflowId, guideId });
        // Continue to next pattern
      }
    }
  }
  
  return err(new GuideNotFoundError(guideId, workflowId));
}

/**
 * Read a guide and return raw content (for resource serving).
 * Returns the original file content without parsing.
 */
export async function readGuideRaw(
  workflowDir: string, 
  workflowId: string, 
  guideId: string
): Promise<Result<{ content: string; format: 'toon' | 'markdown' }, GuideNotFoundError>> {
  const guideDir = join(workflowDir, workflowId);
  
  const patterns = [
    { file: `${guideId}.guide.toon`, format: 'toon' as const },
    { file: `${guideId}.toon`, format: 'toon' as const },
    { file: `${guideId}.guide.md`, format: 'markdown' as const },
    { file: `${guideId}.md`, format: 'markdown' as const },
  ];

  for (const { file, format } of patterns) {
    const filePath = join(guideDir, file);
    if (existsSync(filePath)) {
      try {
        const content = await readFile(filePath, 'utf-8');
        logInfo('Guide loaded (raw)', { workflowId, guideId, path: filePath, format });
        return ok({ content, format });
      } catch {
        // Continue to next pattern
      }
    }
  }
  
  return err(new GuideNotFoundError(guideId, workflowId));
}

/**
 * List all guides available for a workflow.
 * Looks in {workflowDir}/{workflowId}/ for .guide.toon and .guide.md files.
 */
export async function listGuides(workflowDir: string, workflowId: string): Promise<GuideEntry[]> {
  const guideDir = join(workflowDir, workflowId);
  
  if (!existsSync(guideDir)) return [];
  
  try {
    const files = await readdir(guideDir);
    const guides: GuideEntry[] = [];
    
    for (const file of files) {
      let id: string | null = null;
      let format: 'toon' | 'markdown' | null = null;
      
      if (file.endsWith('.guide.toon')) {
        id = basename(file, '.guide.toon');
        format = 'toon';
      } else if (file.endsWith('.toon') && !file.includes('.guide.')) {
        // Handle files like work-package.toon (workflow definitions, not guides)
        // Skip workflow definition files
        continue;
      } else if (file.endsWith('.guide.md')) {
        id = basename(file, '.guide.md');
        format = 'markdown';
      }
      
      if (id && format) {
        // Generate title from id
        const title = id.split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        
        guides.push({ id, title, path: file, format });
      }
    }
    
    return guides;
  } catch { 
    return []; 
  }
}

/**
 * List all workflows that contain guides.
 * Scans {workflowDir}/ for subdirectories containing guide files.
 */
export async function listWorkflowsWithGuides(workflowDir: string): Promise<string[]> {
  if (!existsSync(workflowDir)) return [];
  
  try {
    const entries = await readdir(workflowDir);
    const workflows: string[] = [];
    
    for (const entry of entries) {
      const entryPath = join(workflowDir, entry);
      const stats = await stat(entryPath);
      
      if (stats.isDirectory()) {
        const guides = await listGuides(workflowDir, entry);
        if (guides.length > 0) {
          workflows.push(entry);
        }
      }
    }
    
    return workflows;
  } catch {
    return [];
  }
}
