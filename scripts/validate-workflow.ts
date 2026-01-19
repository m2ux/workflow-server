#!/usr/bin/env npx tsx
/**
 * Validate a workflow JSON file against the schema
 * Usage: npx tsx scripts/validate-workflow.ts <path-to-workflow.json>
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import Ajv from 'ajv';

const schemaPath = resolve(import.meta.dirname, '../schemas/workflow.schema.json');
const workflowPath = process.argv[2];

if (!workflowPath) {
  console.error('Usage: npx tsx scripts/validate-workflow.ts <path-to-workflow.json>');
  process.exit(1);
}

const resolvedPath = resolve(workflowPath);
if (!existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  process.exit(1);
}

if (!existsSync(schemaPath)) {
  console.error(`Schema not found: ${schemaPath}`);
  console.error('Run "npm run build:schemas" first to generate JSON schemas.');
  process.exit(1);
}

const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
const workflow = JSON.parse(readFileSync(resolvedPath, 'utf-8'));

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
const valid = validate(workflow);

if (valid) {
  console.log(`✅ ${workflowPath} is valid`);
  console.log(`   ID: ${workflow.id}`);
  console.log(`   Version: ${workflow.version}`);
  console.log(`   Phases: ${workflow.phases?.length ?? 0}`);
  process.exit(0);
} else {
  console.error(`❌ ${workflowPath} validation failed:`);
  for (const error of validate.errors ?? []) {
    console.error(`   - ${error.instancePath}: ${error.message}`);
    if (error.params) {
      console.error(`     Params: ${JSON.stringify(error.params)}`);
    }
  }
  process.exit(1);
}
