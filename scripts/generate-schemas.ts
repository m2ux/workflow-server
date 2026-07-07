#!/usr/bin/env npx tsx
import { zodToJsonSchema } from 'zod-to-json-schema';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { WorkflowSchema } from '../src/schema/workflow.schema.js';
import { WorkflowStateSchema } from '../src/schema/state.schema.js';
import { ConditionSchema } from '../src/schema/condition.schema.js';
import { SessionFileSchema } from '../src/schema/session.schema.js';
import { ActivitySchema } from '../src/schema/activity.schema.js';

const schemasDir = join(import.meta.dirname, '..', 'schemas');
mkdirSync(schemasDir, { recursive: true });

// `none` inlines fully (no $ref); `root` emits $defs for recursive schemas (the loop-kind step's
// nested steps[] body references StepSchema, and the and/or/not condition combinators reference
// ConditionSchema), which `none` cannot represent — it silently degrades each cycle to the empty
// schema `{}` (accept-anything), so any schema embedding ConditionSchema must use `root`.
function generate(schema: Parameters<typeof zodToJsonSchema>[0], name: string, desc: string, refStrategy: 'none' | 'root' = 'none'): void {
  const json = zodToJsonSchema(schema, { name, $refStrategy: refStrategy });
  writeFileSync(join(schemasDir, `${name}.schema.json`), JSON.stringify({ $schema: 'https://json-schema.org/draft/2020-12/schema', title: name, description: desc, ...json }, null, 2) + '\n');
  console.log(`[PASS] Generated ${name}.schema.json`);
}

console.log('Generating JSON Schema files...\n');
generate(WorkflowSchema, 'workflow', 'Workflow definition schema', 'root');
generate(WorkflowStateSchema, 'state', 'Workflow state schema');
generate(ConditionSchema, 'condition', 'Condition expression schema', 'root');
generate(SessionFileSchema, 'session-file', 'Server-managed session file (session.json) — canonical session state owned by the workflow server.', 'root');
generate(ActivitySchema, 'activity', 'Activity definition schema — unified ordered, kind-tagged steps[] (technique | action | checkpoint | loop).', 'root');
console.log('\n[PASS] Done');
