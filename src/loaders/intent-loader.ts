import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { IntentNotFoundError } from '../errors.js';
import { logInfo } from '../logging.js';
import { decodeToon } from '../utils/toon.js';

/** The meta workflow contains all intents */
const META_WORKFLOW_ID = 'meta';

export interface IntentEntry { id: string; name: string; path: string; }

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
  const filePath = join(intentDir, `${intentId}.toon`);
  
  if (!existsSync(filePath)) {
    return err(new IntentNotFoundError(intentId));
  }
  
  try {
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
      .filter(f => f.endsWith('.toon') && f !== 'index.toon')
      .map(file => {
        const id = basename(file, '.toon');
        const name = id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { id, name, path: file };
      });
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
  const filePath = join(intentDir, 'index.toon');
  
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
