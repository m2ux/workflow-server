import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { GuideNotFoundError } from '../errors.js';
import { logInfo, logError } from '../logging.js';
import { decodeToon } from '../utils/toon.js';

export interface GuideEntry { 
  index: string;  // e.g., "00", "01"
  name: string;   // e.g., "start-here"
  title: string;  // e.g., "Start Here"
  path: string;   // e.g., "guides/00-start-here.toon"
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
 * Parse a guide filename to extract index and name.
 * Expected format: {NN}-{name}.toon or {NN}-{name}.md (in guides/ subdirectory)
 * 
 * @param filename - Guide filename
 * @returns Parsed index, name, and format, or null if not a valid guide file
 */
function parseGuideFilename(filename: string): { index: string; name: string; format: 'toon' | 'markdown' } | null {
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
 * Read a guide by index from a workflow directory.
 * Guides are stored in {workflowDir}/{workflowId}/guides/ subdirectory.
 * Supports both TOON (.toon) and Markdown (.md) formats.
 * 
 * @param workflowDir - Base workflow directory (e.g., './workflow-data')
 * @param workflowId - Workflow ID (e.g., 'work-package')
 * @param guideIndex - Guide index (e.g., '00', '0', '01')
 * @returns Guide content as decoded object (TOON) or raw string (Markdown)
 */
export async function readGuide(
  workflowDir: string, 
  workflowId: string, 
  guideIndex: string
): Promise<Result<Guide | string, GuideNotFoundError>> {
  const guideDir = join(workflowDir, workflowId, 'guides');
  
  if (!existsSync(guideDir)) {
    return err(new GuideNotFoundError(guideIndex, workflowId));
  }
  
  // Normalize index (e.g., '0' -> '00' for lookup)
  const normalizedIndex = guideIndex.padStart(2, '0');
  
  try {
    const files = await readdir(guideDir);
    
    for (const file of files) {
      const parsed = parseGuideFilename(file);
      if (parsed) {
        // Match either exact index or normalized index
        const fileIndex = parsed.index.padStart(2, '0');
        if (fileIndex === normalizedIndex || parsed.index === guideIndex) {
          const filePath = join(guideDir, file);
          const content = await readFile(filePath, 'utf-8');
          logInfo('Guide loaded', { workflowId, guideIndex, path: filePath, format: parsed.format });
          
          if (parsed.format === 'toon') {
            return ok(decodeToon<Guide>(content));
          }
          return ok(content);
        }
      }
    }
  } catch (error) {
    logError('Failed to read guide', error instanceof Error ? error : undefined, { workflowId, guideIndex });
  }
  
  return err(new GuideNotFoundError(guideIndex, workflowId));
}

/**
 * Read a guide by index and return raw content (for resource serving).
 * Guides are stored in {workflowDir}/{workflowId}/guides/ subdirectory.
 * Returns the original file content without parsing.
 */
export async function readGuideRaw(
  workflowDir: string, 
  workflowId: string, 
  guideIndex: string
): Promise<Result<{ content: string; format: 'toon' | 'markdown' }, GuideNotFoundError>> {
  const guideDir = join(workflowDir, workflowId, 'guides');
  
  if (!existsSync(guideDir)) {
    return err(new GuideNotFoundError(guideIndex, workflowId));
  }
  
  // Normalize index (e.g., '0' -> '00' for lookup)
  const normalizedIndex = guideIndex.padStart(2, '0');
  
  try {
    const files = await readdir(guideDir);
    
    for (const file of files) {
      const parsed = parseGuideFilename(file);
      if (parsed) {
        const fileIndex = parsed.index.padStart(2, '0');
        if (fileIndex === normalizedIndex || parsed.index === guideIndex) {
          const filePath = join(guideDir, file);
          const content = await readFile(filePath, 'utf-8');
          logInfo('Guide loaded (raw)', { workflowId, guideIndex, path: filePath, format: parsed.format });
          return ok({ content, format: parsed.format });
        }
      }
    }
  } catch {
    // Fall through to error
  }
  
  return err(new GuideNotFoundError(guideIndex, workflowId));
}

/**
 * List all guides available for a workflow.
 * Looks in {workflowDir}/{workflowId}/guides/ for {NN}-{name}.toon and .md files.
 */
export async function listGuides(workflowDir: string, workflowId: string): Promise<GuideEntry[]> {
  const guideDir = join(workflowDir, workflowId, 'guides');
  
  if (!existsSync(guideDir)) return [];
  
  try {
    const files = await readdir(guideDir);
    const guides: GuideEntry[] = [];
    
    for (const file of files) {
      const parsed = parseGuideFilename(file);
      if (parsed) {
        // Generate title from name
        const title = parsed.name.split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        
        guides.push({
          index: parsed.index,
          name: parsed.name,
          title,
          path: `guides/${file}`,
          format: parsed.format,
        });
      }
    }
    
    // Sort by index
    guides.sort((a, b) => parseInt(a.index, 10) - parseInt(b.index, 10));
    
    return guides;
  } catch { 
    return []; 
  }
}

/**
 * Get a guide entry by index without loading content.
 */
export async function getGuideEntry(
  workflowDir: string, 
  workflowId: string, 
  guideIndex: string
): Promise<GuideEntry | null> {
  const guides = await listGuides(workflowDir, workflowId);
  const normalizedIndex = guideIndex.padStart(2, '0');
  
  return guides.find(g => 
    g.index.padStart(2, '0') === normalizedIndex || 
    g.index === guideIndex
  ) ?? null;
}

/**
 * List all workflows that contain guides.
 * Scans {workflowDir}/ for subdirectories containing a guides/ subdirectory with guide files.
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
