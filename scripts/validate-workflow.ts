#!/usr/bin/env npx tsx
/**
 * Validate a workflow JSON file against the Zod schema
 * Usage: npx tsx scripts/validate-workflow.ts <path-to-workflow.json>
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { WorkflowSchema } from '../src/schema/workflow.schema.js';

const workflowPath = process.argv[2];

if (!workflowPath) {
  console.error('Usage: npx tsx scripts/validate-workflow.ts <path-to-workflow.json>');
  process.exit(2);
}

const resolvedPath = resolve(workflowPath);
if (!existsSync(resolvedPath)) {
  console.error(`[FAIL] File not found: ${resolvedPath}`);
  process.exit(2);
}

const workflow = JSON.parse(readFileSync(resolvedPath, 'utf-8'));
const result = WorkflowSchema.safeParse(workflow);

if (result.success) {
  console.log(`[PASS] ${workflowPath} is valid`);
  console.log(`   ID: ${result.data.id}`);
  console.log(`   Version: ${result.data.version}`);
  console.log(`   Activities: ${result.data.activities?.length ?? 0}`);
  process.exit(0);
} else {
  console.error(`[FAIL] ${workflowPath} validation failed:`);
  for (const issue of result.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}
