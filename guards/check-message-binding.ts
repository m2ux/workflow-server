/**
 * check-message-binding — a gate may only show a value the bag holds when the gate is presented.
 *
 * The server renders a checkpoint's message, and each option's label and description, from the
 * session bag at `present_checkpoint`. What the bag holds at that moment is the values earlier
 * activities put there, the session facts, the effects of gates answered before this one, and the
 * values the steps before this gate produced, which the worker publishes when it yields the gate.
 * A value this activity produces only at or after the gate is none of those, so the gate shows the
 * placeholder itself, or the declared default, and says nothing it meant to say. The reader sees a
 * dead link and cannot tell it from a real one.
 *
 * A message action is not rendered by the server: the agent carrying the activity states it, from
 * values it already holds. So only the gate's own wording is measured here.
 *
 * A gate inside a loop is reached again on the next pass, after the steps below it in the body have
 * run. A value one of those steps produces is therefore bound on every later pass, and a declared
 * default is what the first pass shows — so a loop-carried value with a default is bound.
 *
 * Producers come from the same index the provenance annotation reads (`buildProducerIndex`): each
 * bound technique's declared outputs and remaps, each `set` target, each gate's effects, each loop
 * variable, in document order. A name more than one activity produces may already be bound by
 * whichever ran first, and the graph decides which, so only a name this activity alone produces is
 * judged.
 *
 * This check answers when a name is bound, and nothing about the shape of what it is bound to. A
 * message addressing into a value — `{report.summary}` — has its member measured against the
 * producing output's declared components by `check-binding-fidelity`'s `output-path-undeclared`.
 *
 * Run: npx tsx guards/check-message-binding.ts [--root <workflows-dir>] [--json]
 */
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import { buildProducerIndex } from '../src/utils/binding-provenance.js';
import { flattenActivitySteps, type Step } from '../src/schema/activity.schema.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { assertScanned, corpusWorkflows, defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

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

/** The wording `present_checkpoint` renders from the bag: the message, and each option's text. */
function gateTexts(step: { message?: string | undefined; options?: { id: string; label?: string | undefined; description?: string | undefined }[] | undefined }): { where: string; template: string }[] {
  const out: { where: string; template: string }[] = [];
  if (typeof step.message === 'string') out.push({ where: 'checkpoint message', template: step.message });
  for (const option of step.options ?? []) {
    if (typeof option.label === 'string') out.push({ where: `label of option '${option.id}'`, template: option.label });
    if (typeof option.description === 'string') out.push({ where: `description of option '${option.id}'`, template: option.description });
  }
  return out;
}

/** For each loop, the ids of every step its body holds, nested loops included. */
function loopBodies(steps: Step[] | undefined, out: Set<string>[] = []): Set<string>[] {
  for (const step of steps ?? []) {
    if (step.kind !== 'loop') continue;
    const body = new Set<string>();
    const collect = (inner: Step[] | undefined): void => {
      for (const s of inner ?? []) {
        if (s.id !== undefined) body.add(s.id);
        if (s.kind === 'loop') collect(s.steps as Step[]);
      }
    };
    collect(step.steps as Step[]);
    out.push(body);
    loopBodies(step.steps as Step[], out);
  }
  return out;
}

export async function collectFindings(root: string = DEFAULT_ROOT): Promise<Finding[]> {
  const findings: Finding[] = [];
  let scanned = 0;
  const index = indexCorpus(root);
  for (const { id: workflowId } of corpusWorkflows(root, index)) {
    const loaded = await loadWorkflowWithDiagnostics(root, workflowId);
    if (!loaded.success) continue;
    const { workflow, activitySourceWorkflow } = loaded.value;
    const producerIndex = await buildProducerIndex({ workflow, workflowDir: root, activitySourceWorkflow });
    const producingActivities = new Map<string, Set<string>>();
    for (const producer of producerIndex.producers) {
      const activities = producingActivities.get(producer.name) ?? new Set<string>();
      activities.add(producer.activityId);
      producingActivities.set(producer.name, activities);
    }
    const defaulted = new Set(
      (workflow.variables ?? []).filter((v) => v.defaultValue !== undefined).map((v) => v.name),
    );

    for (const activity of workflow.activities ?? []) {
      // A borrowed activity is judged in the workflow that authored it, so each file is read once.
      if ((activitySourceWorkflow.get(activity.id) ?? workflowId) !== workflowId) continue;
      scanned++;
      const loops = loopBodies(activity.steps);
      for (const step of flattenActivitySteps(activity)) {
        if (step.kind !== 'checkpoint' || step.id === undefined) continue;
        const position = producerIndex.positions.get(`${activity.id}|${step.id}`) ?? -1;
        const gateId = step.id;
        const enclosing = loops.filter((body) => body.has(gateId));
        for (const { where, template } of gateTexts(step)) {
          for (const name of new Set(interpolations(template))) {
            const activities = producingActivities.get(name);
            // Prior state, a session fact, or a name another activity may have produced first.
            if (activities === undefined || !activities.has(activity.id) || activities.size > 1) continue;
            const producedBefore = producerIndex.producers.some(
              (p) => p.name === name && p.activityId === activity.id && p.ordinal < position,
            );
            if (producedBefore) continue;
            const loopCarried = defaulted.has(name) && producerIndex.producers.some(
              (p) => p.name === name && p.activityId === activity.id && enclosing.some((body) => body.has(p.stepId)),
            );
            if (loopCarried) continue;
            const rendersDefault = defaulted.has(name);
            findings.push({
              check: rendersDefault ? 'renders-declared-default' : 'renders-placeholder',
              site: `${workflowId}/${activity.id}::${step.id}`,
              detail: `${where} on step '${step.id}' interpolates '${name}', which this activity produces `
                + `only at or after this gate, so the gate shows ${rendersDefault ? 'the declared default' : 'the placeholder text'} `
                + `rather than the value. Produce it in a step before the gate, or move the text to where '${name}' is prior state.`,
            });
          }
        }
      }
    }
  }
  assertScanned(scanned, 'activities', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('message-binding', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every gate shows only values the bag holds when it is presented',
    remedy: 'produce the value in a step before the gate, or move the text to where the value is prior state',
  });
}
