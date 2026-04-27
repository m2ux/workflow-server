#!/usr/bin/env npx tsx
/**
 * Validate all activity files in a workflow folder against the activity schema
 * 
 * Usage: npx tsx scripts/validate-activities.ts [workflow-folder]
 * 
 * Examples:
 *   npx tsx scripts/validate-activities.ts workflows/work-package
 *   npx tsx scripts/validate-activities.ts workflows/meta
 *   npx tsx scripts/validate-activities.ts workflows  # validates all workflows
 *   npx tsx scripts/validate-activities.ts            # defaults to workflows/
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, resolve, basename } from 'path';
import { pathToFileURL } from 'url';
import { decodeToonRaw as decodeToon } from '../src/utils/toon.js';
import { safeValidateActivity } from '../src/schema/activity.schema.js';

export interface ValidationResult {
  workflow: string;
  file: string;
  passed: boolean;
  errors?: string[];
}

export function validateActivityFile(filePath: string): { passed: boolean; errors?: string[] } {
  const content = readFileSync(filePath, 'utf-8');
  try {
    const decoded = decodeToon(content);
    if (decoded == null || typeof decoded !== 'object') {
      return { passed: false, errors: ['TOON decode returned non-object value'] };
    }
    const result = safeValidateActivity(decoded);
    if (result.success) {
      return { passed: true };
    } else {
      return {
        passed: false,
        errors: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
      };
    }
  } catch (e: unknown) {
    const error = e as Error;
    return { passed: false, errors: [`Parse error: ${error.message}`] };
  }
}

function findWorkflowDirs(basePath: string): string[] {
  const activitiesPath = join(basePath, 'activities');
  
  if (existsSync(activitiesPath) && statSync(activitiesPath).isDirectory()) {
    return [basePath];
  }
  
  const workflows: string[] = [];
  try {
    const entries = readdirSync(basePath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subActivitiesPath = join(basePath, entry.name, 'activities');
        if (existsSync(subActivitiesPath) && statSync(subActivitiesPath).isDirectory()) {
          workflows.push(join(basePath, entry.name));
        }
      }
    }
  } catch {
    // Directory not readable
  }
  return workflows;
}

const isDirectInvocation =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectInvocation) {
  const inputPath = process.argv[2]
    ? resolve(process.argv[2])
    : resolve(import.meta.dirname, '../workflows');

  const workflowDirs = findWorkflowDirs(inputPath);

  if (workflowDirs.length === 0) {
    console.error(`No workflow directories found in ${inputPath}`);
    console.error('A workflow directory must contain an "activities" subfolder.');
    process.exit(2);
  }

  const results: ValidationResult[] = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const workflowDir of workflowDirs) {
    const workflowName = basename(workflowDir);
    const activitiesDir = join(workflowDir, 'activities');
    const files = readdirSync(activitiesDir).filter(f => f.endsWith('.toon'));

    console.log(`\n[INFO] ${workflowName} (${files.length} activities)`);

    for (const file of files) {
      const filePath = join(activitiesDir, file);
      const result = validateActivityFile(filePath);

      results.push({
        workflow: workflowName,
        file,
        passed: result.passed,
        errors: result.errors,
      });

      if (result.passed) {
        console.log(`   [PASS] ${file}`);
        totalPassed++;
      } else {
        console.log(`   [FAIL] ${file}`);
        for (const error of result.errors || []) {
          console.log(`      - ${error}`);
        }
        totalFailed++;
      }
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);

  if (totalFailed > 0) {
    console.log('\nFailed activities:');
    for (const r of results.filter(r => !r.passed)) {
      console.log(`  - ${r.workflow}/${r.file}`);
    }
  }

  process.exit(totalFailed > 0 ? 1 : 0);
}
