import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { TemplateNotFoundError } from '../errors.js';
import { logInfo } from '../logging.js';

export interface TemplateEntry { 
  index: string;  // e.g., "01", "02"
  name: string;   // e.g., "implementation-analysis"
  title: string;  // e.g., "Implementation Analysis"
  path: string;   // e.g., "templates/01-implementation-analysis.md"
}

/**
 * Parse a template filename to extract index and name.
 * Expected format: {NN}-{name}.md (in templates/ subdirectory)
 * 
 * @param filename - Template filename
 * @returns Parsed index and name, or null if not a valid template file
 */
function parseTemplateFilename(filename: string): { index: string; name: string } | null {
  // Match pattern: {digits}-{name}.md
  const match = filename.match(/^(\d+)-(.+)\.md$/);
  if (!match || !match[1] || !match[2]) return null;
  
  return {
    index: match[1],
    name: match[2],
  };
}

/**
 * Read a template by index from a workflow directory.
 * Templates are stored in {workflowDir}/{workflowId}/templates/ subdirectory.
 * 
 * @param workflowDir - Base workflow directory (e.g., './workflow-data/workflows')
 * @param workflowId - Workflow ID (e.g., 'work-package')
 * @param templateIndex - Template index (e.g., '01', '1')
 * @returns Template content as raw Markdown string
 */
export async function readTemplate(
  workflowDir: string, 
  workflowId: string, 
  templateIndex: string
): Promise<Result<string, TemplateNotFoundError>> {
  const templateDir = join(workflowDir, workflowId, 'templates');
  
  if (!existsSync(templateDir)) {
    return err(new TemplateNotFoundError(templateIndex, workflowId));
  }
  
  // Normalize index (e.g., '1' -> '01' for lookup)
  const normalizedIndex = templateIndex.padStart(2, '0');
  
  try {
    const files = await readdir(templateDir);
    
    for (const file of files) {
      const parsed = parseTemplateFilename(file);
      if (parsed) {
        // Match either exact index or normalized index
        const fileIndex = parsed.index.padStart(2, '0');
        if (fileIndex === normalizedIndex || parsed.index === templateIndex) {
          const filePath = join(templateDir, file);
          const content = await readFile(filePath, 'utf-8');
          logInfo('Template loaded', { workflowId, templateIndex, path: filePath });
          return ok(content);
        }
      }
    }
  } catch {
    // Fall through to error
  }
  
  return err(new TemplateNotFoundError(templateIndex, workflowId));
}

/**
 * List all templates available for a workflow.
 * Looks in {workflowDir}/{workflowId}/templates/ for {NN}-{name}.md files.
 */
export async function listTemplates(workflowDir: string, workflowId: string): Promise<TemplateEntry[]> {
  const templateDir = join(workflowDir, workflowId, 'templates');
  
  if (!existsSync(templateDir)) return [];
  
  try {
    const files = await readdir(templateDir);
    const templates: TemplateEntry[] = [];
    
    for (const file of files) {
      const parsed = parseTemplateFilename(file);
      if (parsed) {
        // Generate title from name
        const title = parsed.name.split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        
        templates.push({
          index: parsed.index,
          name: parsed.name,
          title,
          path: `templates/${file}`,
        });
      }
    }
    
    // Sort by index
    templates.sort((a, b) => parseInt(a.index, 10) - parseInt(b.index, 10));
    
    return templates;
  } catch { 
    return []; 
  }
}

/**
 * Get a template entry by index without loading content.
 */
export async function getTemplateEntry(
  workflowDir: string, 
  workflowId: string, 
  templateIndex: string
): Promise<TemplateEntry | null> {
  const templates = await listTemplates(workflowDir, workflowId);
  const normalizedIndex = templateIndex.padStart(2, '0');
  
  return templates.find(t => 
    t.index.padStart(2, '0') === normalizedIndex || 
    t.index === templateIndex
  ) ?? null;
}
