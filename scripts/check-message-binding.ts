/**
 * check-message-binding — a user-facing message may only interpolate a value the bag already holds.
 *
 * The server receives an activity's technique outputs at the activity boundary, on next_activity.
 * A message rendered before that boundary therefore reads a bag that does not yet hold them, so a
 * message interpolating a value its own activity produces renders the placeholder itself, or the
 * declared default, and says nothing it meant to say. The reader sees a dead link and cannot tell
 * it from a real one.
 *
 * Two producers do reach the bag mid-activity: a checkpoint `setVariable` effect, applied when the
 * orchestrator resolves the gate, and a worker publishing step outputs on `yield_checkpoint`. A
 * name a checkpoint before this step sets is bound; a name only a technique step produces is not.
 *
 * Run: npx tsx scripts/check-message-binding.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { assertScanned, corpusWorkflows, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';
import { declaredVariables } from './workflow-declarations.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

interface Step {
  kind?: string;
  id?: string;
  message?: string;
  actions?: { action?: string; message?: string }[];
  options?: { effect?: { setVariable?: Record<string, unknown> } }[];
}

interface Activity {
  id?: string;
  steps?: Step[];
  variables?: { writes?: ({ name?: string } | string)[] };
}

/** The bag entry a dotted path belongs to: producers name whole variables, prose reads into them. */
function rootOf(path: string): string {
  return path.split('.')[0] ?? path;
}

/**
 * Names a template interpolates. Only a bare `{name}` or `{name.path}` reads the bag — a brace run
 * carrying spaces or punctuation is prose, not a substitution.
 */
function interpolations(template: string): string[] {
  const names: string[] = [];
  for (const match of template.matchAll(/\{([A-Za-z_][A-Za-z0-9_.]*)\}/g)) {
    names.push(rootOf(match[1]!));
  }
  return names;
}

/** Every message a step renders to a user: a gate's own wording, and its message actions. */
function messages(step: Step): { where: string; template: string }[] {
  const out: { where: string; template: string }[] = [];
  if (step.kind === 'checkpoint' && typeof step.message === 'string') {
    out.push({ where: 'checkpoint message', template: step.message });
  }
  for (const action of step.actions ?? []) {
    if (action.action === 'message' && typeof action.message === 'string') {
      out.push({ where: 'message action', template: action.message });
    }
  }
  return out;
}

/** Names an activity declares it puts in the bag. */
function writesOf(activity: Activity): Set<string> {
  const out = new Set<string>();
  for (const write of activity.variables?.writes ?? []) {
    const name = typeof write === 'string' ? write : write.name;
    if (typeof name === 'string') out.add(name);
  }
  return out;
}

/** Names bound by a checkpoint effect at a step index below `before`. */
function setByEarlierGate(steps: Step[], before: number): Set<string> {
  const out = new Set<string>();
  for (const step of steps.slice(0, before)) {
    if (step.kind !== 'checkpoint') continue;
    for (const option of step.options ?? []) {
      for (const name of Object.keys(option.effect?.setVariable ?? {})) out.add(name);
    }
  }
  return out;
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  const index = indexCorpus(root);
  for (const { id: workflow, dir } of corpusWorkflows(root, index)) {
    const activitiesDir = join(dir, 'activities');
    if (!existsSync(activitiesDir) || !statSync(activitiesDir).isDirectory()) continue;

    const files = readdirSync(activitiesDir).sort().filter((e) => /\.ya?ml$/.test(e));
    const parsed = new Map<string, Activity>();
    for (const entry of files) {
      const def = parse(readFileSync(join(activitiesDir, entry), 'utf-8')) as Activity | null;
      if (def) parsed.set(entry, def);
    }

    // A name more than one activity writes may already be bound by whichever ran first, and the
    // graph decides which that is. Only a name with a single producer is provably unbound here.
    const producers = new Map<string, number>();
    for (const activity of parsed.values()) {
      for (const name of writesOf(activity)) producers.set(name, (producers.get(name) ?? 0) + 1);
    }

    // A name no activity produces is a session fact, seeded before any activity runs.
    const sessionFacts = new Set<string>();
    // A produced name carrying a default renders that default in place of the value: not the
    // placeholder text, and not what the message meant to say either.
    const defaulted = new Set<string>();
    for (const [name, declaration] of declaredVariables(root, workflow, index)) {
      if (!producers.has(name)) sessionFacts.add(name);
      else if (declaration.defaultValue !== undefined) defaulted.add(name);
    }

    for (const [entry, activity] of parsed) {
      scanned++;
      const writes = writesOf(activity);
      const steps = activity.steps ?? [];
      steps.forEach((step, index) => {
        const boundByGate = setByEarlierGate(steps, index);
        for (const { where, template } of messages(step)) {
          for (const name of new Set(interpolations(template))) {
            if (!writes.has(name)) continue;
            if (sessionFacts.has(name)) continue;
            if ((producers.get(name) ?? 0) > 1) continue;
            if (boundByGate.has(name)) continue;
            const rendersDefault = defaulted.has(name);
            const renders = rendersDefault ? 'the declared default' : 'the placeholder text';
            findings.push({
              check: rendersDefault ? 'renders-declared-default' : 'renders-placeholder',
              site: `${relative(root, join(activitiesDir, entry))}::${step.id ?? '?'}`,
              detail: `${where} on step '${step.id ?? '?'}' interpolates '${name}', which this `
                + `activity produces itself. The bag receives an activity's technique outputs at the `
                + `activity boundary, so at this point it renders ${renders} rather than the value. `
                + `Publish it on yield_checkpoint, bind it from a checkpoint effect before this step, `
                + `or move the message to an activity that reads '${name}' as prior state.`,
            });
          }
        }
      });
    }
  }
  assertScanned(scanned, 'activity files', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('message-binding', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every user-facing message interpolates a value the bag holds when it renders',
    remedy: 'publish the value on yield_checkpoint, bind it from an earlier checkpoint effect, or render the message where the value is prior state',
  });
}
