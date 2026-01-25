import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { RulesNotFoundError } from '../errors.js';
import { logInfo } from '../logging.js';
import { decodeToon } from '../utils/toon.js';

/** The meta workflow contains global rules */
const META_WORKFLOW_ID = 'meta';
const RULES_FILE = 'rules.toon';

export interface RulesSection {
  id: string;
  title: string;
  priority?: string;
  rules?: string[];
  content?: string;
  [key: string]: unknown;
}

export interface Rules {
  id: string;
  version: string;
  title: string;
  description: string;
  precedence: string;
  sections: RulesSection[];
}

/**
 * Read global agent rules from meta/rules.toon
 */
export async function readRules(workflowDir: string): Promise<Result<Rules, RulesNotFoundError>> {
  const rulesPath = join(workflowDir, META_WORKFLOW_ID, RULES_FILE);
  
  if (!existsSync(rulesPath)) {
    return err(new RulesNotFoundError());
  }
  
  try {
    const content = await readFile(rulesPath, 'utf-8');
    const rules = decodeToon<Rules>(content);
    logInfo('Rules loaded', { path: rulesPath, sectionCount: rules.sections?.length ?? 0 });
    return ok(rules);
  } catch (error) {
    logInfo('Rules parse error', { path: rulesPath, error: String(error) });
    return err(new RulesNotFoundError());
  }
}

/**
 * Read global agent rules as raw TOON content
 */
export async function readRulesRaw(workflowDir: string): Promise<Result<string, RulesNotFoundError>> {
  const rulesPath = join(workflowDir, META_WORKFLOW_ID, RULES_FILE);
  
  if (!existsSync(rulesPath)) {
    return err(new RulesNotFoundError());
  }
  
  try {
    const content = await readFile(rulesPath, 'utf-8');
    logInfo('Rules loaded (raw)', { path: rulesPath });
    return ok(content);
  } catch {
    return err(new RulesNotFoundError());
  }
}
