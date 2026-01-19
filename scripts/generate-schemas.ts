#!/usr/bin/env tsx
import { zodToJsonSchema } from 'zod-to-json-schema';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WorkflowSchema } from '../src/schema/workflow.schema.js';
import { WorkflowStateSchema } from '../src/schema/state.schema.js';
import { ConditionSchema } from '../src/schema/condition.schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemasDir = join(__dirname, '..', 'schemas');
mkdirSync(schemasDir, { recursive: true });

function generate(schema: Parameters<typeof zodToJsonSchema>[0], name: string, desc: string): void {
  const json = zodToJsonSchema(schema, { name, $refStrategy: 'none' });
  writeFileSync(join(schemasDir, `${name}.schema.json`), JSON.stringify({ $schema: 'https://json-schema.org/draft/2020-12/schema', title: name, description: desc, ...json }, null, 2) + '\n');
  console.log(`✓ Generated ${name}.schema.json`);
}

console.log('Generating JSON Schema files...\n');
generate(WorkflowSchema, 'workflow', 'Workflow definition schema');
generate(WorkflowStateSchema, 'state', 'Workflow state schema');
generate(ConditionSchema, 'condition', 'Condition expression schema');
console.log('\n✓ Done');
