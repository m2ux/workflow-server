import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { RulesNotFoundError } from '../errors.js';
import { logInfo, logWarn } from '../logging.js';
import { decodeToonRaw } from '../utils/toon.js';
import { RulesSchema, type Rules, type RulesSection } from '../schema/rules.schema.js';

export type { Rules, RulesSection };

/** The meta workflow contains global rules */
const META_WORKFLOW_ID = 'meta';
const RULES_FILE = 'rules.toon';

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
    const decoded = decodeToonRaw(content);
    const result = RulesSchema.safeParse(decoded);
    if (!result.success) {
      const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      logWarn('Rules validation failed', { path: rulesPath, issues });
      return err(new RulesNotFoundError(`Rules file exists but failed validation: ${issues}`));
    }
    const rules = result.data as Rules;
    logInfo('Rules loaded', { path: rulesPath, sectionCount: rules.sections.length });
    return ok(rules);
  } catch (error) {
    logWarn('Rules parse error', { path: rulesPath, error: String(error) });
    return err(new RulesNotFoundError(`Rules file exists but could not be parsed: ${error instanceof Error ? error.message : String(error)}`));
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
  } catch (error) {
    logWarn('Failed to read rules file', { path: rulesPath, error: error instanceof Error ? error.message : String(error) });
    return err(new RulesNotFoundError(`Failed to read rules file: ${error instanceof Error ? error.message : String(error)}`));
  }
}
