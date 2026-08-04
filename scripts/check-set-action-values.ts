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
 * Hard zero, no baseline. Every `set` in the corpus already satisfies both, which is the cheapest
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

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

/**
 * A bag name, or a dotted projection of one: what a `value` must be braced to mean.
 *
 * Deliberately wider than the bag's own snake_case convention, since the fault this catches wore
 * camelCase. Hyphens are excluded because a hyphenated word is how this corpus writes a literal — an
 * activity id like `plan-prepare` is a value, not a reference.
 */
const NAME_SHAPED = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$/;

interface SetAction { action?: unknown; target?: unknown; value?: unknown }

function checkAction(action: SetAction, site: string, findings: Finding[]): void {
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
  if (!NAME_SHAPED.test(action.value)) return;
  findings.push({
    check: 'unbraced-reference',
    site,
    detail: `value '${action.value}' is shaped like a variable but is the literal string — brace it as `
      + `'{${action.value}}' to read that variable, or write a literal nothing mistakes for a name`,
  });
}

/** Every `set` action under any `steps[]`, loops and nested steps included. */
function walk(node: unknown, file: string, stepId: string, findings: Finding[]): void {
  if (Array.isArray(node)) { for (const child of node) walk(child, file, stepId, findings); return; }
  if (!node || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : stepId;
  if (Array.isArray(record.actions)) {
    for (const action of record.actions) {
      if (action && typeof action === 'object' && !Array.isArray(action)) {
        checkAction(action as SetAction, `${file}[${id || '?'}]`, findings);
      }
    }
  }
  for (const value of Object.values(record)) walk(value, file, id, findings);
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  const workflows = readdirSync(root).filter((entry) => {
    const path = join(root, entry);
    return statSync(path).isDirectory() && existsSync(join(path, 'activities'));
  });
  for (const workflow of workflows.sort()) {
    const dir = join(root, workflow, 'activities');
    for (const file of readdirSync(dir).filter((name) => name.endsWith('.yaml')).sort()) {
      const rel = relative(root, join(dir, file));
      scanned++;
      try {
        walk(parseDefinition(readFileSync(join(dir, file), 'utf-8')), rel, '', findings);
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
