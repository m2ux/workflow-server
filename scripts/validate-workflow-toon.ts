#!/usr/bin/env npx tsx
/**
 * Validate a workflow's TOON files (workflow.toon, activities/*.toon, skills/*.toon) against schemas.
 * Usage: npx tsx scripts/validate-workflow-toon.ts <path-to-workflow-dir>
 * Example: npx tsx scripts/validate-workflow-toon.ts /path/to/workflows/substrate-node-security-audit
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { decodeToon } from '../src/utils/toon.js';
import { safeValidateWorkflow } from '../src/schema/workflow.schema.js';
import { safeValidateActivity } from '../src/schema/activity.schema.js';
import { safeValidateSkill } from '../src/schema/skill.schema.js';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';

const workflowDirPath = resolve(process.argv[2] ?? '');
if (!workflowDirPath || !existsSync(workflowDirPath)) {
  console.error('Usage: npx tsx scripts/validate-workflow-toon.ts <path-to-workflow-dir>');
  console.error('Example: npx tsx scripts/validate-workflow-toon.ts workflows/substrate-node-security-audit');
  process.exit(1);
}

const workflowId = workflowDirPath.split(/[/\\]/).pop() ?? '';
const parentDir = resolve(workflowDirPath, '..');

async function main() {
  let failed = 0;

  // 1. Validate workflow.toon (via loader so activities are merged and validated)
  const workflowPath = join(workflowDirPath, 'workflow.toon');
  if (!existsSync(workflowPath)) {
    console.error(`❌ workflow.toon not found at ${workflowPath}`);
    process.exit(1);
  }
  const loadResult = await loadWorkflow(parentDir, workflowId);
  if (loadResult.success) {
    console.log('✅ workflow.toon valid');
    console.log(`   ID: ${loadResult.value.id}, Version: ${loadResult.value.version}, Activities: ${loadResult.value.activities.length}`);
  } else {
    console.error('❌ workflow.toon validation failed:', loadResult.error);
    failed++;
  }

  // 2. Validate each activity file (redundant if load succeeded, but reports per-file)
  const activitiesDir = join(workflowDirPath, 'activities');
  if (existsSync(activitiesDir)) {
    const activityFiles = readdirSync(activitiesDir).filter((f) => f.endsWith('.toon'));
    console.log(`\n📁 activities/ (${activityFiles.length} files)`);
    for (const file of activityFiles) {
      const content = readFileSync(join(activitiesDir, file), 'utf-8');
      const decoded = decodeToon(content);
      const result = safeValidateActivity(decoded);
      if (result.success) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file}`);
        result.error.issues.forEach((i) => console.log(`      - ${i.path.join('.')}: ${i.message}`));
        failed++;
      }
    }
  }

  // 3. Validate each skill file
  const skillsDir = join(workflowDirPath, 'skills');
  if (existsSync(skillsDir)) {
    const skillFiles = readdirSync(skillsDir).filter((f) => f.endsWith('.toon'));
    console.log(`\n📁 skills/ (${skillFiles.length} files)`);
    for (const file of skillFiles) {
      const content = readFileSync(join(skillsDir, file), 'utf-8');
      try {
        const decoded = decodeToon(content);
        const result = safeValidateSkill(decoded);
        if (result.success) {
          console.log(`   ✅ ${file}`);
        } else {
          console.log(`   ❌ ${file}`);
          result.error.issues.forEach((i) => console.log(`      - ${i.path.join('.')}: ${i.message}`));
          failed++;
        }
      } catch (e) {
        console.log(`   ❌ ${file}`);
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
