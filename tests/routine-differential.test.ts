import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { buildRoutineLookup, loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import {
  collectRoutineRefLines,
  hasRoutineStepLine,
  injectRoutineSteps,
  materializeRoutineStep,
} from '../src/loaders/routine-resolver.js';
import { injectResolvedStepIds, type Activity, type Step } from '../src/schema/activity.schema.js';
import { parseDefinition } from '../src/utils/serialization.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * The two representations, compared (#704 W02).
 *
 * A routine resolves twice, because two delivery paths need it: once in the parsed object graph, so
 * tool payloads and the guards see full steps; and once in the RAW YAML text, because `get_activity`
 * hands the worker the original file. While both live, they have to agree on every generated
 * identifier — a disagreement shows up as a worker reading a step the server does not believe
 * exists, which no other test in the tree would catch.
 */

let root: string;

const WORKFLOW_ID = 'differential';
const ACTIVITY_FILE = '01-host.yaml';

/** A host activity written as TEXT, so the raw path has real authored formatting to preserve. */
const HOST_YAML = `id: host
version: 1.0.0
name: Host
steps:
  - kind: technique
    id: open
    technique: analysis::open
  - kind: routine
    id: review-residuals
    routine: assumption-interview
    with:
      gate_message: "Open assumptions remain ({assumption_review_presentation})."
    outputs:
      assumption_outcome: research_assumption_outcome
    when: has_open_assumptions == true
  - kind: action
    id: close
    actions:
      - action: log
        message: done
`;

const ROUTINE_YAML = `id: assumption-interview
version: 1.0.0
name: Assumption Interview
inputs:
  - id: gate_message
    description: Text presented at the batch gate.
  - id: decision_space
    description: Which option set the per-item gate offers.
    default: resolve-or-defer
outputs:
  - id: assumption_outcome
    type: string
    description: The outcome the deciding gate gave.
internals:
  - id: current_assumption
    description: The assumption under discussion.
steps:
  - kind: checkpoint
    id: batch-gate
    message: "{gate_message}"
    options:
      - id: go
        label: Go
        effect:
          setVariable:
            assumption_outcome: accepted
  - kind: loop
    id: interview
    loopType: forEach
    variable: current_assumption
    over: open_assumptions
    steps:
      - kind: checkpoint
        id: "decision#{current_assumption.id}"
        message: "Decide using {decision_space}."
        options:
          - id: ok
            label: OK
`;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'routine-diff-'));
  const dir = join(root, WORKFLOW_ID);
  mkdirSync(join(dir, 'activities'), { recursive: true });
  mkdirSync(join(dir, 'routines'), { recursive: true });
  writeFileSync(join(dir, 'workflow.yaml'),
    `id: ${WORKFLOW_ID}\nversion: 1.0.0\ntitle: Differential\ninitialActivity: host\ngraph:\n  host: {}\n`);
  writeFileSync(join(dir, 'activities', ACTIVITY_FILE), HOST_YAML);
  writeFileSync(join(dir, 'routines', 'assumption-interview.yaml'), ROUTINE_YAML);
});
afterAll(() => { rmSync(root, { recursive: true, force: true }); });

/** The activity as the raw delivery path produces it, then parsed back for comparison. */
async function throughTextPath(): Promise<Activity> {
  const raw = readFileSync(join(root, WORKFLOW_ID, 'activities', ACTIVITY_FILE), 'utf-8');
  let body = injectResolvedStepIds(raw);
  const lookup = await buildRoutineLookup(root, [WORKFLOW_ID], collectRoutineRefLines(raw));
  body = injectRoutineSteps(body, (step) => materializeRoutineStep(step, lookup, WORKFLOW_ID, 'host'));
  return parseDefinition(body) as Activity;
}

/** The activity as the object path produces it. */
async function throughObjectPath(): Promise<Activity> {
  const result = await loadWorkflowWithDiagnostics(root, WORKFLOW_ID);
  if (!result.success) throw new Error(`load failed: ${result.error.message}`);
  return result.value.workflow.activities!.find((a) => a.id === 'host')!;
}

describe('the pre-scan keeps routine-free text off the splice path', () => {
  it('sees a reference step', () => {
    expect(hasRoutineStepLine(HOST_YAML)).toBe(true);
    expect(collectRoutineRefLines(HOST_YAML)).toEqual(['assumption-interview']);
  });

  it('does not see one in an activity that carries none', () => {
    const plain = 'id: plain\nsteps:\n  - kind: action\n    id: a\n';
    expect(hasRoutineStepLine(plain)).toBe(false);
    expect(injectRoutineSteps(plain, () => { throw new Error('must not be called'); })).toBe(plain);
  });

  /**
   * The pre-scan is what decides whether the splice runs at all, so a shape it misses is a reference
   * handed to a worker while the object graph holds ordinary steps — the one divergence between the
   * two representations that nothing else would catch.
   */
  it('sees a reference step whose kind line carries a trailing comment', () => {
    const commented = 'steps:\n  - kind: routine  # the shared run\n    id: run\n    routine: shared-run  # in meta\n';
    expect(hasRoutineStepLine(commented)).toBe(true);
    expect(collectRoutineRefLines(commented)).toEqual(['shared-run']);
  });
});

describe('the raw text path', () => {
  it('leaves the lines outside the reference block byte-identical', async () => {
    const raw = readFileSync(join(root, WORKFLOW_ID, 'activities', ACTIVITY_FILE), 'utf-8');
    const lookup = await buildRoutineLookup(root, [WORKFLOW_ID], collectRoutineRefLines(raw));
    const before = raw.split('\n');
    const after = injectRoutineSteps(injectResolvedStepIds(raw),
      (step) => materializeRoutineStep(step, lookup, WORKFLOW_ID, 'host')).split('\n');
    // The header and the steps either side of the block survive unchanged, character for character.
    expect(after.slice(0, 6)).toEqual(before.slice(0, 6));
    expect(after.slice(-5)).toEqual(before.slice(-5));
  });

  it('keeps the blank lines trailing a final reference block', async () => {
    const raw = 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n'
      + '    routine: assumption-interview\n    outputs:\n      assumption_outcome: host_outcome\n';
    const lookup = await buildRoutineLookup(root, [WORKFLOW_ID], collectRoutineRefLines(raw));
    const out = injectRoutineSteps(raw, (step) => materializeRoutineStep(step, lookup, WORKFLOW_ID, 'host'));
    // The file's own final newline belongs to the file, not to the step block that happened to be last.
    expect(out.endsWith('\n')).toBe(true);
  });

  it('keeps the host\'s own steps as authored', async () => {
    const delivered = await throughTextPath();
    expect(delivered.steps![0]!.id).toBe('open');
    expect(delivered.steps!.at(-1)!.id).toBe('close');
  });

  it('writes an explicit prefixed id on every spliced step, nested bodies included', async () => {
    const raw = readFileSync(join(root, WORKFLOW_ID, 'activities', ACTIVITY_FILE), 'utf-8');
    const lookup = await buildRoutineLookup(root, [WORKFLOW_ID], collectRoutineRefLines(raw));
    const text = injectRoutineSteps(injectResolvedStepIds(raw),
      (step) => materializeRoutineStep(step, lookup, WORKFLOW_ID, 'host'));
    expect(text).toContain('id: review-residuals.batch-gate');
    expect(text).toContain('id: review-residuals.interview');
    expect(text).toContain('review-residuals.interview.decision#{host_review_residuals_current_assumption.id}');
  });
});

describe('the two paths agree', () => {
  it('produces the same steps, field for field', async () => {
    const [text, object] = await Promise.all([throughTextPath(), throughObjectPath()]);
    expect(text.steps).toEqual(object.steps);
  });

  it('agrees as TEXT on the fields a worker acts on directly', async () => {
    const [text, object] = await Promise.all([throughTextPath(), throughObjectPath()]);
    /** A checkpoint's message and id, an option's label and effect, a step's when, a loop's over. */
    const worker = (activity: Activity): string[] => {
      const out: string[] = [];
      const walk = (steps: Step[]): void => {
        for (const step of steps) {
          out.push(`${step.kind}:${step.id}`, `when:${step.when ?? ''}`);
          if (step.kind === 'checkpoint') {
            out.push(`message:${step.message ?? ''}`);
            for (const option of step.options ?? []) {
              out.push(`option:${option.id}:${option.label}:${JSON.stringify(option.effect ?? null)}`);
            }
          }
          if (step.kind === 'loop') {
            out.push(`over:${step.over ?? ''}`, `continueWhile:${JSON.stringify(step.continueWhile ?? null)}`);
            walk(step.steps as Step[]);
          }
        }
      };
      walk(activity.steps ?? []);
      return out;
    };
    expect(worker(text)).toEqual(worker(object));
  });

  it('carries the reference site gate onto every spliced step in both paths', async () => {
    const [text, object] = await Promise.all([throughTextPath(), throughObjectPath()]);
    for (const activity of [text, object]) {
      expect(activity.steps!.slice(1, 3).map((s) => s.when))
        .toEqual(['has_open_assumptions == true', 'has_open_assumptions == true']);
    }
  });
});

describe('where the two paths disagree, and why no corpus file reaches it', () => {
  /**
   * `injectResolvedStepIds` derives an id textually from a step whose FIRST key is `technique:`,
   * with the id line absent. A step written `- kind: technique` with no id is therefore given one by
   * the object path and not by the text path.
   *
   * Measured at corpus `11e94155`: of **636** kind:technique steps across **126** activity files,
   * **zero** omit an explicit id, and `injectResolvedStepIds` changes **zero** files. So the gap is
   * real and inert — no definition in the repository reaches it. It is pinned here rather than
   * silently passed, because a fixture that omits the id is the only way to see it, and a reader
   * would otherwise take the agreement below as general.
   */
  it('disagrees on a technique step that omits its id — the shape no corpus file has', async () => {
    const withoutId = HOST_YAML.replace('    id: open\n', '');
    const lookup = await buildRoutineLookup(root, [WORKFLOW_ID], collectRoutineRefLines(withoutId));
    const text = parseDefinition(injectRoutineSteps(injectResolvedStepIds(withoutId),
      (step) => materializeRoutineStep(step, lookup, WORKFLOW_ID, 'host'))) as Activity;
    expect(text.steps![0]!.id).toBeUndefined();
    // The object path fills it, from the last `::` segment of the technique name.
    expect((await throughObjectPath()).steps![0]!.id).toBe('open');
  });
});

describe('an activity carrying no routine, in a workflow that declares them', () => {
  const FIXTURES = resolve(import.meta.dirname, 'fixtures/routines');

  it('delivers byte-identical to its source', () => {
    const path = join(FIXTURES, 'host-fixture', 'activities', '02-carries-no-routine.yaml');
    const source = readFileSync(path, 'utf-8');
    expect(hasRoutineStepLine(source)).toBe(false);
    const delivered = injectRoutineSteps(injectResolvedStepIds(source),
      () => { throw new Error('the splice must not be reached for a routine-free activity'); });
    expect(delivered).toBe(source);
  });
});

describe('the live corpus', () => {
  const LIVE = liveCorpusRoot();

  it.skipIf(!LIVE)('carries no routine reference yet, so every activity delivers unchanged', async () => {
    const { indexCorpus } = await import('../src/loaders/corpus-index.js');
    const { readdirSync, existsSync } = await import('node:fs');
    let scanned = 0;
    for (const location of indexCorpus(LIVE!).workflows.values()) {
      const activitiesDir = join(location.dir, 'activities');
      if (!existsSync(activitiesDir)) continue;
      for (const file of readdirSync(activitiesDir)) {
        if (!file.endsWith('.yaml')) continue;
        const raw = readFileSync(join(activitiesDir, file), 'utf-8');
        scanned += 1;
        if (!hasRoutineStepLine(raw)) {
          expect(injectRoutineSteps(raw, () => { throw new Error(`splice attempted on ${file}`); })).toBe(raw);
        }
      }
    }
    expect(scanned).toBeGreaterThan(0);
  });
});
