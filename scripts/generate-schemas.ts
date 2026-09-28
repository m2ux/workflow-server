#!/usr/bin/env npx tsx
import { zodToJsonSchema } from 'zod-to-json-schema';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { WorkflowSchema } from '../src/schema/workflow.schema.js';
import { ConditionSchema } from '../src/schema/condition.schema.js';
import { SessionFileSchema } from '../src/schema/session.schema.js';
import { ActivitySchema } from '../src/schema/activity.schema.js';
import { RoutineSchema } from '../src/schema/routine.schema.js';
import { TechniqueSchema } from '../src/schema/technique.schema.js';
import { WhenExpressionSchema } from '../src/schema/when-expression.js';
import { renderEnforcement } from '../src/schema/enforcement.js';

/**
 * The JSON Schema files under `schemas/`, generated from the Zod sources they mirror.
 *
 * The generated set is declared here and rendered by `renderSchema`, so the guard that verifies the
 * files on disk match reads the same list. A file in `schemas/` that is not in this list is reported.
 */

export const SCHEMAS_DIR = resolve(import.meta.dirname, '..', 'schemas');

interface GeneratedSchema {
  name: string;
  schema: Parameters<typeof zodToJsonSchema>[0];
  description: string;
  /**
   * `none` inlines fully (no $ref); `root` emits $defs for recursive schemas (the loop-kind step's
   * nested steps[] body references StepSchema, and the and/or/not condition combinators reference
   * ConditionSchema), which `none` cannot represent — it silently degrades each cycle to the empty
   * schema `{}` (accept-anything), so any schema embedding ConditionSchema must use `root`.
   */
  refStrategy: 'none' | 'root';
  /** Shared schemas emitted once under `definitions` and referenced from every site that uses them. */
  definitions?: Record<string, Parameters<typeof zodToJsonSchema>[0]>;
}

/**
 * The gate languages — the `when` dialect and structured conditions — defined once for every schema
 * that carries step or exit gates, so a nested condition references the condition definition rather
 * than the first field that happened to carry one.
 */
const GATE_DEFINITIONS = { whenExpression: WhenExpressionSchema, condition: ConditionSchema };

export const GENERATED_SCHEMAS: GeneratedSchema[] = [
  { name: 'workflow', schema: WorkflowSchema, description: 'Workflow definition schema', refStrategy: 'root', definitions: GATE_DEFINITIONS },
  { name: 'condition', schema: ConditionSchema, description: 'Condition expression schema', refStrategy: 'root' },
  { name: 'session-file', schema: SessionFileSchema, description: 'Session state recorded in session.json.', refStrategy: 'root' },
  { name: 'activity', schema: ActivitySchema, description: 'Activity definition with ordered steps.', refStrategy: 'root', definitions: GATE_DEFINITIONS },
  { name: 'routine', schema: RoutineSchema, description: 'Reusable steps with declared inputs, outputs, and internals.', refStrategy: 'root', definitions: GATE_DEFINITIONS },
  { name: 'technique', schema: TechniqueSchema, description: 'Technique capability with inputs, protocol, rules, and outputs.', refStrategy: 'root' },
];

/** One schema's file content, byte for byte as it is written to disk. */
export function renderSchema(entry: GeneratedSchema): string {
  const json = zodToJsonSchema(entry.schema, { name: entry.name, $refStrategy: entry.refStrategy, definitions: entry.definitions ?? {} });
  return JSON.stringify(
    { $schema: 'https://json-schema.org/draft/2020-12/schema', title: entry.name, description: entry.description, ...json },
    null,
    2,
  ) + '\n';
}

export function schemaPath(name: string): string {
  return join(SCHEMAS_DIR, `${name}.schema.json`);
}

export const ENFORCEMENT_FILE = 'enforcement.json';

export function enforcementPath(): string {
  return join(SCHEMAS_DIR, ENFORCEMENT_FILE);
}

export function renderEnforcementFile(): string {
  return renderEnforcement(GENERATED_SCHEMAS);
}

function generateAll(): void {
  mkdirSync(SCHEMAS_DIR, { recursive: true });
  console.log('Generating JSON Schema files...\n');
  for (const entry of GENERATED_SCHEMAS) {
    writeFileSync(schemaPath(entry.name), renderSchema(entry));
    console.log(`[PASS] Generated ${entry.name}.schema.json`);
  }
  writeFileSync(enforcementPath(), renderEnforcementFile());
  console.log(`[PASS] Generated ${ENFORCEMENT_FILE}`);
  console.log('\n[PASS] Done');
}

// Only when run as a script: importing this module for its exports must not write.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) generateAll();
