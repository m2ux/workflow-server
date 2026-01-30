import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { RulesNotFoundError } from '../errors.js';
import { logInfo, logError } from '../logging.js';
import { decodeToon } from '../utils/toon.js';
import { type Rules, type RuleSection, safeValidateRules } from '../schema/rules.schema.js';

/** The meta workflow contains global rules */
const META_WORKFLOW_ID = 'meta';
const RULES_FILE = 'rules.toon';

// Re-export types from schema
export type { Rules, RuleSection } from '../schema/rules.schema.js';
export { RulePrioritySchema, getSectionsByPriority, getSection, getAllRules } from '../schema/rules.schema.js';

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
    const rawRules = decodeToon<unknown>(content);
    
    // Validate against schema
    const result = safeValidateRules(rawRules);
    if (!result.success) {
      logError('Rules schema validation failed', result.error);
      return err(new RulesNotFoundError());
    }
    
    logInfo('Rules loaded', { path: rulesPath, sectionCount: result.data.sections?.length ?? 0 });
    return ok(result.data);
  } catch (error) {
    logError('Rules parse error', error instanceof Error ? error : new Error(String(error)));
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
