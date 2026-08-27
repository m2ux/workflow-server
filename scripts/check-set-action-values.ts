/**
 * check-set-action-values — a `set` action writes somewhere, and names what it reads (#407).
 *
 * A `set` action is how an activity puts a value in the bag. It carries a `target` — the bag name it
 * writes — and either a `value` or nothing at all, the second meaning the executing agent supplies it.
 * That leaves two ways for one to look right and do nothing.
 *
 * The first is a `set` with no `target`. It has nowhere to write, so whatever it says happens does not.
 * Three of these sat in the corpus reading `message: <name>=true`, plainly meant as a target and a
 * value, writing neither, and passing every other guard.
 *
 * The second is subtler and is why this guard exists. A `value` that names another variable has to be
 * braced — `value: "{worker_result.next_activity_id}"` — because an unbraced one is the literal string.
 * The two spellings are a character apart and read identically to a person. `value: initialActivity`
 * looked like a reference to the workflow's first activity for as long as it existed; it was the word
 * itself, and the word reached the server as an activity id, where the lookup failed on every run.
 * `variable-binding` already draws this line: a bare string is a rename only where it matches the bag's
 * own naming and resolves there, and a literal otherwise. Nothing checked it.
 *
 * So a `value` shaped like a name — letters, digits and underscores, optionally dotted — is refused
 * unless it is braced. Shape is what separates the two: a real literal in this corpus is a boolean, a
 * number, null, an empty collection, or hyphenated prose, and none of those matches. A rename written
 * bare is refused too, though none exists; one spelling for reading a variable is the point.
 *
 * A third fault is available once the target declares a value set: a literal the set does not admit.
 *
 * Hard zero, no baseline. Every `set` in the corpus already satisfies all three, which is the cheapest
 * moment to hold the line — added later this arrives with a debt list and an argument over each entry.
 *
 * Run: npx tsx scripts/check-set-action-values.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';
import { isTemplateReference } from '../src/utils/variable-seed.js';
import { declaredVariables } from './workflow-declarations.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

/**
 * A bag name, or a dotted projection of one: what a `value` must be braced to mean.
 *
 * Hyphens are excluded because a hyphenated word is how this corpus writes a literal — an activity id
 * like `plan-prepare` is a value, not a reference, and no bag name could contain one.
 */
const NAME_SHAPED = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$/;

/**
 * What tells a bag name from a bare word that is simply a value.
 *
 * `variable-binding` resolves the ambiguity by asking whether the string resolves in the bag, and calls
 * it a literal when it does not. That reading is what let the fault through: the word this branch
 * started with resolved to nothing, so it WAS a literal, and being a literal is precisely what made it
 * wrong. Refusing every name-shaped value instead goes too far the other way — a checkpoint writes bare
 * enum words like `single` and `create` to the same variables, so the identical assignment would be
 * legal in one place and refused in the other.
 *
 * The line that actually separates them is shape. Every bag name in this corpus carries an underscore,
 * a capital, or a dotted projection; all 49 bare words the corpus assigns as enum values carry none of
 * the three. So a value is read as a name only when it is marked as one.
 */
const BAG_NAME_MARK = /[_.]|[A-Z]/;

/** A filename, whose extension would otherwise read as a dotted projection of a bag name. */
const FILE_EXTENSION = /\.(md|json|ya?ml|html?|ts|js|txt|csv|svg|png|sh)$/i;

/** Whether this string names something rather than being something. */
function readsAsBagName(value: string): boolean {
  const trimmed = value.trim();
  return NAME_SHAPED.test(trimmed) && BAG_NAME_MARK.test(trimmed) && !FILE_EXTENSION.test(trimmed);
}

interface SetAction { action?: unknown; target?: unknown; value?: unknown }

/** The value sets the workflow being scanned declares, by variable name. */
type ValueSets = (name: string) => string[] | undefined;

function checkAction(action: SetAction, site: string, findings: Finding[], valueSets: ValueSets): void {
  if (action.action !== 'set') return;

  if (typeof action.target !== 'string' || action.target.trim() === '') {
    findings.push({
      check: 'set-without-target',
      site,
      detail: 'a set action with no target writes nowhere, so whatever it reads as doing does not '
        + 'happen — name the bag variable it writes',
    });
    return;
  }

  // No `value` is the agent-derived form, which is the majority of them and carries nothing to check.
  if (typeof action.value !== 'string') return;

  const declared = valueSets(action.target);
  if (declared && !isTemplateReference(action.value) && !declared.includes(action.value)) {
    findings.push({
      check: 'value-outside-declared-set',
      site,
      detail: `value '${action.value}' is outside the set '${action.target}' declares [${declared.join(', ')}]`,
    });
    return;
  }

  if (!readsAsBagName(action.value)) return;
  findings.push({
    check: 'unbraced-reference',
    site,
    detail: `value '${action.value}' is shaped like a variable but is the literal string — brace it as `
      + `'{${action.value.trim()}}' to read that variable, or write a literal nothing mistakes for a name`,
  });
}

/**
 * A checkpoint's `setVariable` writes the bag too, under the same braced-reference convention, so a bare
 * name means the same wrong thing there. Its keys are the variables written; only string values can
 * carry the fault.
 */
function checkSetVariable(effect: Record<string, unknown>, site: string, findings: Finding[]): void {
  for (const [name, value] of Object.entries(effect)) {
    if (typeof value !== 'string' || !readsAsBagName(value)) continue;
    findings.push({
      check: 'unbraced-reference',
      site: `${site} setVariable.${name}`,
      detail: `value '${value}' is shaped like a variable but is the literal string — brace it as `
        + `'{${value.trim()}}' to read that variable, or write a literal nothing mistakes for a name`,
    });
  }
}

/** Every `set` action under any `steps[]`, loops and nested steps included. */
function walk(node: unknown, file: string, stepId: string, findings: Finding[], valueSets: ValueSets): void {
  if (Array.isArray(node)) { for (const child of node) walk(child, file, stepId, findings, valueSets); return; }
  if (!node || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : stepId;
  if (Array.isArray(record.actions)) {
    for (const action of record.actions) {
      if (action && typeof action === 'object' && !Array.isArray(action)) {
        checkAction(action as SetAction, `${file}[${id || '?'}]`, findings, valueSets);
      }
    }
  }
  if (record.setVariable && typeof record.setVariable === 'object' && !Array.isArray(record.setVariable)) {
    checkSetVariable(record.setVariable as Record<string, unknown>, `${file}[${id || '?'}]`, findings);
  }
  for (const value of Object.values(record)) walk(value, file, id, findings, valueSets);
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  const workflows = readdirSync(root).filter((entry) => {
    const path = join(root, entry);
    return statSync(path).isDirectory() && existsSync(join(path, 'activities'));
  });
  // Recursive, because activity definitions also sit a level down — `meta/activities/patterns/` holds
  // five, and a flat read leaves them unscanned while `assertScanned` still passes on the rest.
  const definitions = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return definitions(path);
      return entry.name.endsWith('.yaml') ? [path] : [];
    });

  for (const workflow of workflows.sort()) {
    const declarations = declaredVariables(root, workflow);
    const valueSets: ValueSets = (name) => declarations.get(name)?.values;
    // `workflow.yaml` too: a workflow root carries checkpoint fragments, and a `setVariable` there
    // writes the bag exactly as one inside an activity does.
    const roots = [join(root, workflow, 'workflow.yaml')].filter((path) => existsSync(path));
    for (const path of [...roots, ...definitions(join(root, workflow, 'activities'))]) {
      const rel = relative(root, path);
      scanned++;
      try {
        walk(parseDefinition(readFileSync(path, 'utf-8')), rel, '', findings, valueSets);
      } catch {
        // Malformed YAML is validate-workflow-yaml's finding, not this guard's.
      }
    }
  }
  assertScanned(scanned, 'activity definitions', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('set-action-values', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every set action names where it writes, and braces what it reads',
    remedy: 'give the action a target, and brace a value that names a variable',
  });
}
