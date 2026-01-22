import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { IntentNotFoundError } from '../errors.js';
import { logInfo } from '../logging.js';
import { decodeToon } from '../utils/toon.js';

/** The meta workflow contains all intents */
const META_WORKFLOW_ID = 'meta';

export interface IntentEntry { 
  index: string;
  id: string; 
  name: string; 
  path: string; 
}

/** Parse intent filename to extract index and id: NN-intent-id.toon */
function parseIntentFilename(filename: string): { index: string; id: string } | null {
  const match = filename.match(/^(\d{2})-(.+)\.toon$/);
  if (!match || !match[1] || !match[2]) return null;
  return { index: match[1], id: match[2] };
}

export interface Intent {
  id: string;
  version: string;
  problem: string;
  recognition: string[];
  skills: {
    primary: string;
    supporting: string[];
  };
  outcome: string[];
  flow: string[];
  context_to_preserve: string[];
}

/** Get the intent directory from the meta workflow */
function getIntentDir(workflowDir: string): string {
  return join(workflowDir, META_WORKFLOW_ID, 'intents');
}

export async function readIntent(workflowDir: string, intentId: string): Promise<Result<Intent, IntentNotFoundError>> {
  const intentDir = getIntentDir(workflowDir);
  
  if (!existsSync(intentDir)) {
    return err(new IntentNotFoundError(intentId));
  }
  
  try {
    // Find file matching NN-{intentId}.toon pattern
    const files = await readdir(intentDir);
    const matchingFile = files.find(f => {
      const parsed = parseIntentFilename(f);
      return parsed && parsed.id === intentId;
    });
    
    if (!matchingFile) {
      return err(new IntentNotFoundError(intentId));
    }
    
    const filePath = join(intentDir, matchingFile);
    const content = await readFile(filePath, 'utf-8');
    const intent = decodeToon<Intent>(content);
    logInfo('Intent loaded', { id: intentId, path: filePath });
    return ok(intent);
  } catch {
    return err(new IntentNotFoundError(intentId));
  }
}

export async function listIntents(workflowDir: string): Promise<IntentEntry[]> {
  const intentDir = getIntentDir(workflowDir);
  
  if (!existsSync(intentDir)) return [];
  
  try {
    const files = await readdir(intentDir);
    return files
      .map(file => {
        const parsed = parseIntentFilename(file);
        if (!parsed || parsed.id === 'index') return null;
        const name = parsed.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { index: parsed.index, id: parsed.id, name, path: file };
      })
      .filter((entry): entry is IntentEntry => entry !== null)
      .sort((a, b) => a.index.localeCompare(b.index));
  } catch { 
    return []; 
  }
}

export interface IntentIndex {
  version: string;
  description: string;
  intents: Array<{
    id: string;
    problem: string;
    primary_skill: string;
  }>;
  quick_match: Record<string, string>;
}

export async function readIntentIndex(workflowDir: string): Promise<Result<IntentIndex, IntentNotFoundError>> {
  const intentDir = getIntentDir(workflowDir);
  const filePath = join(intentDir, '00-index.toon');
  
  if (!existsSync(filePath)) {
    return err(new IntentNotFoundError('index'));
  }
  
  try {
    const content = await readFile(filePath, 'utf-8');
    const index = decodeToon<IntentIndex>(content);
    logInfo('Intent index loaded', { path: filePath });
    return ok(index);
  } catch {
    return err(new IntentNotFoundError('index'));
  }
}
