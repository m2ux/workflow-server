/**
 * Variable-model guard (B7, issue #166).
 *
 * The server seeds every declared `defaultValue` into the session variable bag
 * at session creation and warn-only-validates checkpoint `setVariable` values
 * against the declared `type`. This guard keeps the corpus coherent with that
 * model:
 *
 * - `exists-on-defaulted` — an `exists`/`notExists` condition targets a
 *   variable that declares a `defaultValue`. Seeding makes such a gate
 *   constant: the variable is always present. Either drop the default
 *   (absence is meaningful) or rewrite the gate as a value comparison.
 * - `default-type-mismatch` — a declaration's `defaultValue` does not match
 *   its own declared `type` (e.g. `type: array` with `defaultValue: "[]"`).
 * - `setvariable-type-mismatch` — a checkpoint option's `setVariable` literal
 *   does not match the target variable's declared `type`. `{name}` template
 *   passthroughs are references resolved agent-side and are exempt.
 * - `setvariable-undeclared` — a `setVariable` targets a variable that is not
 *   declared in the workflow's `variables[]`.
 *
 * Only structured conditions are walked; the `when:` string dialect has no
 * exists-shaped predicate (verified against the corpus during B7). Dotted
 * condition targets (`current_unit.pipeline_mode`) address INSIDE a value and
 * never match a declaration name.
 *
 * Hard-zero: every violation is a defect in the corpus, not the guard.
 *
 * Run: npx tsx scripts/check-variable-model.ts [--root <workflows-dir>]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { jsonTypeOf, isTemplateReference } from '../src/utils/variable-seed.js';
import { resolveWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolveWorkflowsRoot(resolve(join(DIR, '..', 'workflows')));

export interface VariableModelViolation {
  /** File, relative to the workflows root. */
  file: string;
  rule:
    | 'exists-on-defaulted'
    | 'default-type-mismatch'
    | 'setvariable-type-mismatch'
    | 'setvariable-undeclared';
  /** The offending variable and the observed shape. */
  detail: string;
}

interface VariableDeclaration {
  type?: string;
  hasDefault: boolean;
  defaultValue?: unknown;
}

/** Declared variables of one workflow.yaml, keyed by name. */
function readDeclarations(workflowYaml: unknown): Map<string, VariableDeclaration> {
  const decls = new Map<string, VariableDeclaration>();
  const vars = (workflowYaml as { variables?: unknown })?.variables;
  if (!Array.isArray(vars)) return decls;
  for (const v of vars) {
    if (typeof v !== 'object' || v === null) continue;
    const rec = v as Record<string, unknown>;
    if (typeof rec.name !== 'string') continue;
    decls.set(rec.name, {
      type: typeof rec.type === 'string' ? rec.type : undefined,
      hasDefault: 'defaultValue' in rec && rec.defaultValue !== undefined,
      defaultValue: rec.defaultValue,
    });
  }
  return decls;
}

/** Depth-first walk over every object/array node of a parsed YAML document. */
function* walkNodes(node: unknown): Generator<Record<string, unknown>> {
  if (Array.isArray(node)) {
    for (const item of node) yield* walkNodes(item);
    return;
  }
  if (typeof node !== 'object' || node === null) return;
  yield node as Record<string, unknown>;
  for (const value of Object.values(node)) yield* walkNodes(value);
}

/** Lint one parsed YAML document against the workflow's declarations. */
export function lintDocument(
  doc: unknown,
  decls: Map<string, VariableDeclaration>,
  file: string,
): VariableModelViolation[] {
  const violations: VariableModelViolation[] = [];
  for (const node of walkNodes(doc)) {
    // exists/notExists gate on a seeded (defaulted) variable.
    if (
      (node.operator === 'exists' || node.operator === 'notExists') &&
      typeof node.variable === 'string' &&
      decls.get(node.variable)?.hasDefault
    ) {
      violations.push({
        file,
        rule: 'exists-on-defaulted',
        detail: `${String(node.operator)} on '${node.variable}', which declares a defaultValue — seeded, so the gate is constant`,
      });
    }
    // Checkpoint-option effect assignments.
    const setVariable = node.setVariable;
    if (typeof setVariable === 'object' && setVariable !== null && !Array.isArray(setVariable)) {
      for (const [name, value] of Object.entries(setVariable)) {
        const decl = decls.get(name);
        if (!decl) {
          violations.push({ file, rule: 'setvariable-undeclared', detail: `setVariable '${name}' has no declaration in workflow.yaml variables[]` });
          continue;
        }
        if (decl.type !== undefined && !isTemplateReference(value) && jsonTypeOf(value) !== decl.type) {
          violations.push({
            file,
            rule: 'setvariable-type-mismatch',
            detail: `setVariable '${name}': value is ${jsonTypeOf(value)} but the variable is declared ${decl.type}`,
          });
        }
      }
    }
  }
  return violations;
}

/** Lint the declarations themselves: a default must match its declared type. */
export function lintDeclarations(
  decls: Map<string, VariableDeclaration>,
  file: string,
): VariableModelViolation[] {
  const violations: VariableModelViolation[] = [];
  for (const [name, decl] of decls) {
    if (decl.hasDefault && decl.type !== undefined && jsonTypeOf(decl.defaultValue) !== decl.type) {
      violations.push({
        file,
        rule: 'default-type-mismatch',
        detail: `'${name}': defaultValue is ${jsonTypeOf(decl.defaultValue)} but the variable is declared ${decl.type}`,
      });
    }
  }
  return violations;
}

export function collectVariableModelViolations(root: string = ROOT): VariableModelViolation[] {
  const violations: VariableModelViolation[] = [];
  for (const workflow of readdirSync(root).sort()) {
    const workflowYamlPath = join(root, workflow, 'workflow.yaml');
    if (!existsSync(workflowYamlPath)) continue;
    const workflowDoc: unknown = parse(readFileSync(workflowYamlPath, 'utf-8'));
    const decls = readDeclarations(workflowDoc);
    violations.push(...lintDeclarations(decls, relative(root, workflowYamlPath)));
    violations.push(...lintDocument(workflowDoc, decls, relative(root, workflowYamlPath)));
    const activitiesDir = join(root, workflow, 'activities');
    if (!existsSync(activitiesDir) || !statSync(activitiesDir).isDirectory()) continue;
    for (const entry of readdirSync(activitiesDir).sort()) {
      if (!entry.endsWith('.yaml') && !entry.endsWith('.yml')) continue;
      const path = join(activitiesDir, entry);
      violations.push(...lintDocument(parse(readFileSync(path, 'utf-8')), decls, relative(root, path)));
    }
  }
  return violations;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const violations = collectVariableModelViolations();
  if (violations.length === 0) {
    process.stdout.write('variable-model: OK — defaults, gates and setVariable effects are coherent with the seeded variable model\n');
    process.exit(0);
  }
  process.stdout.write(`variable-model: ${violations.length} violation(s):\n`);
  for (const v of violations) process.stdout.write(`  [${v.rule}] ${v.file}: ${v.detail}\n`);
  process.exit(1);
}
