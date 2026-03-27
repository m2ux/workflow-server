#!/usr/bin/env npx tsx
/**
 * Validate a workflow's TOON files (workflow.toon, activities/*.toon, skills/*.toon) against schemas.
 * Usage: npx tsx scripts/validate-workflow-toon.ts <path-to-workflow-dir>
 * Example: npx tsx scripts/validate-workflow-toon.ts /path/to/workflows/substrate-node-security-audit
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { decodeToon } from '../src/utils/toon.js';
import { safeValidateSkill } from '../src/schema/skill.schema.js';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';
import { validateActivityFile } from './validate-activities.js';

const workflowDirPath = resolve(process.argv[2] ?? '');
if (!workflowDirPath || !existsSync(workflowDirPath)) {
  console.error('Usage: npx tsx scripts/validate-workflow-toon.ts <path-to-workflow-dir>');
  console.error('Example: npx tsx scripts/validate-workflow-toon.ts workflows/substrate-node-security-audit');
  process.exit(2);
}

const workflowToonPath = join(workflowDirPath, 'workflow.toon');
if (!existsSync(workflowToonPath)) {
  console.error(`[FAIL] workflow.toon not found at ${workflowToonPath}`);
  console.error('The specified directory does not appear to be a workflow directory.');
  process.exit(2);
}

const workflowId = workflowDirPath.split(/[/\\]/).pop() ?? '';
const parentDir = resolve(workflowDirPath, '..');

async function main() {
  let failed = 0;

  const loadResult = await loadWorkflow(parentDir, workflowId);
  if (loadResult.success) {
    console.log('[PASS] workflow.toon valid');
    console.log(`   ID: ${loadResult.value.id}, Version: ${loadResult.value.version}, Activities: ${loadResult.value.activities.length}`);
  } else {
    console.error('[FAIL] workflow.toon validation failed:', loadResult.error);
    failed++;
  }

  const activitiesDir = join(workflowDirPath, 'activities');
  if (existsSync(activitiesDir)) {
    const activityFiles = readdirSync(activitiesDir).filter((f) => f.endsWith('.toon'));
    console.log(`\n[INFO] activities/ (${activityFiles.length} files)`);
    for (const file of activityFiles) {
      const result = validateActivityFile(join(activitiesDir, file));
      if (result.passed) {
        console.log(`   [PASS] ${file}`);
      } else {
        console.log(`   [FAIL] ${file}`);
        for (const err of result.errors ?? []) {
          console.log(`      - ${err}`);
        }
        failed++;
      }
    }
  }

  const skillsDir = join(workflowDirPath, 'skills');
  if (existsSync(skillsDir)) {
    const skillFiles = readdirSync(skillsDir).filter((f) => f.endsWith('.toon'));
    console.log(`\n[INFO] skills/ (${skillFiles.length} files)`);
    for (const file of skillFiles) {
      const content = readFileSync(join(skillsDir, file), 'utf-8');
      try {
        const decoded = decodeToon(content);
        if (decoded == null || typeof decoded !== 'object') {
          console.log(`   [FAIL] ${file}`);
          console.log(`      - TOON decode returned non-object value`);
          failed++;
          continue;
        }
        const result = safeValidateSkill(decoded);
        if (result.success) {
          console.log(`   [PASS] ${file}`);
        } else {
          console.log(`   [FAIL] ${file}`);
          result.error.issues.forEach((i) => console.log(`      - ${i.path.join('.')}: ${i.message}`));
          failed++;
        }
      } catch (e) {
        console.log(`   [FAIL] ${file}`);
        console.log(`      - Parse error: ${(e as Error).message}`);
        failed++;
      }
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(failed === 0 ? 'All TOON files valid.' : `Validation failed: ${failed} file(s).`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
