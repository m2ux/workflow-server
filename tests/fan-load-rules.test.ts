import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stringifyForResponse } from '../src/utils/serialization.js';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';

/**
 * The fan's shape rules, one test per rule. They live in the load and only there, so a malformed
 * fan cannot be walked at all — a guard would let a session start on a graph the guard rejects.
 * Every message names the fan as `<source>.<exit>` and names the offending activity, so the
 * author's fix site is in the message, and each test asserts that rather than merely that the
 * load failed.
 */

/** Whatever an activity file may carry, loosely typed: these fixtures author illegal shapes. */
type ActivitySpec = Record<string, unknown> & { id: string };

let root: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'fan-load-rules-'));
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

let counter = 0;

/** An activity with the minimum a legal one carries, plus whatever the case overrides. */
const activity = (id: string, overrides: Record<string, unknown> = {}): ActivitySpec => ({
  id,
  version: '1.0.0',
  name: id,
  ...overrides,
});

/** One exit, bound by the graph, defaulted so a single-exit activity needs no second field. */
const exits = (...ids: string[]): unknown[] =>
  ids.map((id, i) => ({ id, ...(ids.length > 1 ? { isDefault: i === 0 } : { isDefault: true }) }));

/**
 * Write a workflow whose activities are its own files and load it, returning the error messages.
 * An empty list is a clean load.
 */
async function loadErrors(spec: {
  graph: Record<string, Record<string, unknown>>;
  activities: ActivitySpec[];
  initialActivity?: string;
  variables?: unknown[];
}): Promise<string[]> {
  counter += 1;
  const id = `fixture-${counter}`;
  const dir = join(root, id);
  mkdirSync(join(dir, 'activities'), { recursive: true });
  writeFileSync(join(dir, 'workflow.yaml'), stringifyForResponse({
    id,
    version: '1.0.0',
    title: id,
    initialActivity: spec.initialActivity ?? spec.activities[0]!.id,
    ...(spec.variables ? { variables: spec.variables } : {}),
    graph: spec.graph,
  }));
  spec.activities.forEach((a, i) => {
    const prefix = String(i + 1).padStart(2, '0');
    writeFileSync(join(dir, 'activities', `${prefix}-${a.id}.yaml`), stringifyForResponse(a));
  });
  const result = await loadWorkflow(root, id);
  if (result.success) return [];
  return (result.error as { issues?: string[] }).issues ?? [result.error.message];
}

const rendered = (errors: string[]): string => errors.join('\n');

/** The flagship shape: one source fanning to two branches that converge on one meeting point. */
const listFan = {
  graph: {
    'plan-prepare': { done: ['research', 'codebase-comprehension'] },
    research: { done: 'assumptions-review' },
    'codebase-comprehension': { done: 'assumptions-review' },
    'assumptions-review': { approved: '__terminal__' },
  },
  activities: [
    activity('plan-prepare', { exits: exits('done') }),
    activity('research', { exits: exits('done') }),
    activity('codebase-comprehension', { exits: exits('done') }),
    activity('assumptions-review', { exits: exits('approved') }),
  ],
};

/** One activity over a collection, the collection written by the activity whose exit fans. */
const instanceFanFixture = {
  graph: {
    'scope-research': { scoped: { activity: 'research-pass', over: 'research_topics', variable: 'research_topic' } },
    'research-pass': { researched: 'combine-research' },
    'combine-research': { settled: '__terminal__' },
  },
  activities: [
    activity('scope-research', {
      exits: exits('scoped'),
      variables: { writes: [{ name: 'research_topics', type: 'array' }] },
    }),
    activity('research-pass', {
      exits: exits('researched'),
      variables: { reads: ['research_topic'] },
    }),
    activity('combine-research', { exits: exits('settled') }),
  ],
};

describe('fan load rules', () => {
  it('a correct list fan and a correct instance fan both load clean', async () => {
    expect(await loadErrors(listFan)).toEqual([]);
    expect(await loadErrors(instanceFanFixture)).toEqual([]);
  });

  // L1 — the existing destination-existence check, iterating the destination's targets and
  // keeping its message per target.
  it('L1 refuses a branch the workflow does not contain', async () => {
    const errors = await loadErrors({
      ...listFan,
      graph: { ...listFan.graph, 'plan-prepare': { done: ['research', 'reserch'] } },
    });
    expect(rendered(errors)).toContain(
      "Workflow graph sends 'plan-prepare.done' to 'reserch', which this workflow does not contain.",
    );
  });

  // L2 — two members over one activity would derive one branch key and write one container.
  it('L2 refuses a list naming one activity twice', async () => {
    const errors = await loadErrors({
      ...listFan,
      graph: { ...listFan.graph, 'plan-prepare': { done: ['research', 'research'] } },
    });
    expect(rendered(errors)).toContain("Workflow graph fans 'plan-prepare.done' to 'research' twice.");
    expect(rendered(errors)).toContain('name it with the collection it runs over in a single member');
  });

  it('L2 counts the activity an instance-fan member runs', async () => {
    const errors = await loadErrors({
      graph: {
        'scope-research': {
          scoped: [
            'research-pass',
            { activity: 'research-pass', over: 'research_topics', variable: 'research_topic' },
          ],
        },
        'research-pass': { researched: 'combine-research' },
        'combine-research': { settled: '__terminal__' },
      },
      activities: instanceFanFixture.activities,
    });
    expect(rendered(errors)).toContain("fans 'scope-research.scoped' to 'research-pass' twice");
  });

  // L3 — an activity that ends the run never returns, so the fan has no last branch.
  it('L3 refuses the terminal sentinel as a branch', async () => {
    const errors = await loadErrors({
      ...listFan,
      graph: { ...listFan.graph, 'plan-prepare': { done: ['research', '__terminal__'] } },
    });
    expect(rendered(errors)).toContain("Workflow graph fans 'plan-prepare.done' to '__terminal__'.");
    expect(rendered(errors)).toContain('no last branch to release its destination');
  });

  // L4 — the join is read off the branches' own bindings and nothing else declares it.
  it('L4 refuses a branch that binds no exit', async () => {
    const errors = await loadErrors({
      graph: {
        'plan-prepare': { done: ['research', 'codebase-comprehension'] },
        'codebase-comprehension': { done: 'assumptions-review' },
        'assumptions-review': { approved: '__terminal__' },
      },
      activities: [
        activity('plan-prepare', { exits: exits('done') }),
        activity('research'),
        activity('codebase-comprehension', { exits: exits('done') }),
        activity('assumptions-review', { exits: exits('approved') }),
      ],
    });
    expect(rendered(errors)).toContain(
      "Activity 'research' is a branch of the fan at 'plan-prepare.done' and binds no exit",
    );
  });

  // L5 — a branch runs in one worker and returns to the join.
  it('L5 refuses a branch that fans again', async () => {
    const errors = await loadErrors({
      graph: {
        'plan-prepare': { done: ['research', 'codebase-comprehension'] },
        research: { done: ['deep-dive', 'survey-scan'] },
        'codebase-comprehension': { done: 'assumptions-review' },
        'deep-dive': { done: 'assumptions-review' },
        'survey-scan': { done: 'assumptions-review' },
        'assumptions-review': { approved: '__terminal__' },
      },
      activities: [
        activity('plan-prepare', { exits: exits('done') }),
        activity('research', { exits: exits('done') }),
        activity('codebase-comprehension', { exits: exits('done') }),
        activity('deep-dive', { exits: exits('done') }),
        activity('survey-scan', { exits: exits('done') }),
        activity('assumptions-review', { exits: exits('approved') }),
      ],
    });
    expect(rendered(errors)).toContain(
      "Activity 'research' is a branch of the fan at 'plan-prepare.done', and its exit 'done' fans to 'deep-dive, survey-scan'.",
    );
  });

  // L5 also rejects a branch that is the fan's own source, that activity's exit being the fan.
  it('L5 refuses a branch that is the fan\'s own source', async () => {
    const errors = await loadErrors({
      graph: {
        'plan-prepare': { done: ['plan-prepare', 'research'] },
        research: { done: 'assumptions-review' },
        'assumptions-review': { approved: '__terminal__' },
      },
      activities: [
        activity('plan-prepare', { exits: exits('done') }),
        activity('research', { exits: exits('done') }),
        activity('assumptions-review', { exits: exits('approved') }),
      ],
    });
    expect(rendered(errors)).toContain(
      "Activity 'plan-prepare' is a branch of the fan at 'plan-prepare.done', and its exit 'done' fans",
    );
  });

  // L6 — a branch runs once and returns to the join, so a retry belongs inside it as a loop step.
  it('L6 refuses a branch routing an exit back onto itself', async () => {
    const errors = await loadErrors({
      graph: {
        'plan-prepare': { done: ['research', 'codebase-comprehension'] },
        research: { insufficient: 'research', done: 'assumptions-review' },
        'codebase-comprehension': { done: 'assumptions-review' },
        'assumptions-review': { approved: '__terminal__' },
      },
      activities: [
        activity('plan-prepare', { exits: exits('done') }),
        activity('research', { exits: exits('done', 'insufficient') }),
        activity('codebase-comprehension', { exits: exits('done') }),
        activity('assumptions-review', { exits: exits('approved') }),
      ],
    });
    expect(rendered(errors)).toContain(
      "Activity 'research' is a branch of the fan at 'plan-prepare.done' and its exit 'insufficient' returns to 'research'.",
    );
  });

  // L7 — branches that disagree converge nowhere, and the fan has no join.
  it('L7 refuses branches that name different destinations, spelling out what it found', async () => {
    const errors = await loadErrors({
      graph: {
        'plan-prepare': { done: ['research', 'codebase-comprehension'] },
        research: { done: 'assumptions-review' },
        'codebase-comprehension': { done: 'plan-review' },
        'assumptions-review': { approved: '__terminal__' },
        'plan-review': { approved: '__terminal__' },
      },
      activities: [
        activity('plan-prepare', { exits: exits('done') }),
        activity('research', { exits: exits('done') }),
        activity('codebase-comprehension', { exits: exits('done') }),
        activity('assumptions-review', { exits: exits('approved') }),
        activity('plan-review', { exits: exits('approved') }),
      ],
    });
    expect(rendered(errors)).toContain("The fan at 'plan-prepare.done' converges nowhere:");
    expect(rendered(errors)).toContain("'research' sends its exits to 'assumptions-review'");
    expect(rendered(errors)).toContain("'codebase-comprehension' sends its exits to 'plan-review'");
  });

  // L8 — the destination is entered once after the last branch returns.
  it('L8 refuses a fan converging on the terminal sentinel', async () => {
    const errors = await loadErrors({
      graph: {
        'plan-prepare': { done: ['research', 'codebase-comprehension'] },
        research: { done: '__terminal__' },
        'codebase-comprehension': { done: '__terminal__' },
      },
      activities: [
        activity('plan-prepare', { exits: exits('done') }),
        activity('research', { exits: exits('done') }),
        activity('codebase-comprehension', { exits: exits('done') }),
      ],
    });
    expect(rendered(errors)).toContain("The fan at 'plan-prepare.done' converges on '__terminal__'.");
  });

  // L9 — a session holds one outstanding decision at a time and every tool call is gated while it
  // is held, so a gate inside a fan stops its siblings.
  it('L9 refuses a branch declaring a checkpoint, and offers taking it out of the fan', async () => {
    const errors = await loadErrors({
      ...listFan,
      activities: [
        activity('plan-prepare', { exits: exits('done') }),
        activity('research', {
          exits: exits('done'),
          steps: [{
            kind: 'checkpoint',
            id: 'research-convergence',
            message: 'Converged?',
            options: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }],
          }],
        }),
        activity('codebase-comprehension', { exits: exits('done') }),
        activity('assumptions-review', { exits: exits('approved') }),
      ],
    });
    expect(rendered(errors)).toContain(
      "Activity 'research' is a branch of the fan at 'plan-prepare.done' and declares checkpoint 'research-convergence'.",
    );
    expect(rendered(errors)).toContain('or take this activity out of the fan');
  });

  it('L9 tells an instance fan there is no instance to take out', async () => {
    const errors = await loadErrors({
      ...instanceFanFixture,
      activities: [
        instanceFanFixture.activities[0]!,
        activity('research-pass', {
          exits: exits('researched'),
          variables: { reads: ['research_topic'] },
          steps: [{
            kind: 'checkpoint',
            id: 'pass-convergence',
            message: 'Converged?',
            options: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }],
          }],
        }),
        instanceFanFixture.activities[2]!,
      ],
    });
    expect(rendered(errors)).toContain('there is no instance to take out of the fan');
  });

  // L10 — a branch lands its outputs under a key derived from its activity id.
  it('L10 refuses a branch whose derived key is not a legal variable name', async () => {
    const errors = await loadErrors({
      graph: {
        'plan-prepare': { done: ['2nd-pass', 'codebase-comprehension'] },
        '2nd-pass': { done: 'assumptions-review' },
        'codebase-comprehension': { done: 'assumptions-review' },
        'assumptions-review': { approved: '__terminal__' },
      },
      activities: [
        activity('plan-prepare', { exits: exits('done') }),
        activity('2nd-pass', { exits: exits('done') }),
        activity('codebase-comprehension', { exits: exits('done') }),
        activity('assumptions-review', { exits: exits('approved') }),
      ],
    });
    expect(rendered(errors)).toContain(
      "Activity '2nd-pass' is a branch of the fan at 'plan-prepare.done', and its branch key '2nd_pass_outputs' is not a legal variable name.",
    );
  });

  // L11 — the parameter's name lives in the destination that supplies it and the activity that
  // reads it, and this rule keeps them in agreement.
  it('L11 refuses a parameter the fanned activity does not declare among its reads', async () => {
    const errors = await loadErrors({
      ...instanceFanFixture,
      activities: [
        instanceFanFixture.activities[0]!,
        activity('research-pass', { exits: exits('researched'), variables: { reads: ['problem_statement'] } }),
        instanceFanFixture.activities[2]!,
      ],
    });
    expect(rendered(errors)).toContain(
      "Workflow graph fans 'scope-research.scoped' to 'research-pass' over 'research_topics', handing each instance its element at 'research_topic', which 'research-pass' does not declare among the names it needs its workflow to supply.",
    );
  });

  // L12 — a fan reads its collection out of the variable bag, checked at the head so a dotted
  // expression is checked correctly.
  it('L12 refuses a collection the workflow declares nowhere', async () => {
    const errors = await loadErrors({
      ...instanceFanFixture,
      activities: [
        activity('scope-research', { exits: exits('scoped') }),
        instanceFanFixture.activities[1]!,
        instanceFanFixture.activities[2]!,
      ],
    });
    expect(rendered(errors)).toContain(
      "Workflow graph fans 'scope-research.scoped' to 'research-pass' over 'research_topics', which this workflow declares nowhere.",
    );
  });

  it('L12 checks a dotted collection at its head, so a path into a declared value loads', async () => {
    const errors = await loadErrors({
      graph: {
        'scope-research': { scoped: { activity: 'research-pass', over: 'sweep_plan.units', variable: 'research_topic' } },
        'research-pass': { researched: 'combine-research' },
        'combine-research': { settled: '__terminal__' },
      },
      activities: [
        activity('scope-research', {
          exits: exits('scoped'),
          variables: { writes: [{ name: 'sweep_plan', type: 'object' }] },
        }),
        instanceFanFixture.activities[1]!,
        instanceFanFixture.activities[2]!,
      ],
    });
    expect(errors).toEqual([]);
  });

  // L13 — an index above the operative ceiling addresses a slot the fan can never fill.
  it('L13 refuses an authored index at or above the fan\'s ceiling', async () => {
    const errors = await loadErrors({
      ...instanceFanFixture,
      activities: [
        instanceFanFixture.activities[0]!,
        instanceFanFixture.activities[1]!,
        activity('combine-research', {
          exits: exits('settled'),
          steps: [{
            kind: 'technique',
            id: 'combine',
            technique: {
              name: 'research-sweep::combine',
              inputs: { topic_findings: '{research_pass_outputs.7.result.topic_findings}' },
            },
          }],
        }),
      ],
    });
    expect(rendered(errors)).toContain(
      "Activity 'combine-research' reads 'research_pass_outputs.7.result.topic_findings'.",
    );
    expect(rendered(errors)).toContain('admits 4 instances, so slot 7 is never filled');
  });

  it('L13 reads the member\'s own maxInstances where it declares one', async () => {
    const errors = await loadErrors({
      graph: {
        'scope-research': {
          scoped: { activity: 'research-pass', over: 'research_topics', variable: 'research_topic', maxInstances: 2 },
        },
        'research-pass': { researched: 'combine-research' },
        'combine-research': { settled: '__terminal__' },
      },
      activities: [
        instanceFanFixture.activities[0]!,
        instanceFanFixture.activities[1]!,
        activity('combine-research', {
          exits: exits('settled'),
          steps: [{
            kind: 'technique',
            id: 'combine',
            technique: {
              name: 'research-sweep::combine',
              inputs: { topic_findings: '{research_pass_outputs.3.result.topic_findings}' },
            },
          }],
        }),
      ],
    });
    expect(rendered(errors)).toContain('admits 2 instances, so slot 3 is never filled');
  });

  it('L13 refuses an authored index above a bare member\'s single slot', async () => {
    const errors = await loadErrors({
      ...listFan,
      activities: [
        listFan.activities[0]!,
        listFan.activities[1]!,
        listFan.activities[2]!,
        activity('assumptions-review', {
          exits: exits('approved'),
          steps: [{
            kind: 'technique',
            id: 'combine',
            technique: {
              name: 'research-sweep::combine',
              inputs: { topic_findings: '{research_outputs.1.result.topic_findings}' },
            },
          }],
        }),
      ],
    });
    expect(rendered(errors)).toContain(
      "Activity 'assumptions-review' reads 'research_outputs.1.result.topic_findings'.",
    );
    expect(rendered(errors)).toContain('admits 1 instance, so slot 1 is never filled');
  });

  it('L13 is one-sided: an index the ceiling admits loads', async () => {
    const errors = await loadErrors({
      ...instanceFanFixture,
      activities: [
        instanceFanFixture.activities[0]!,
        instanceFanFixture.activities[1]!,
        activity('combine-research', {
          exits: exits('settled'),
          steps: [{
            kind: 'technique',
            id: 'combine',
            technique: {
              name: 'research-sweep::combine',
              inputs: { topic_findings: '{research_pass_outputs.0.result.topic_findings}' },
            },
          }],
        }),
      ],
    });
    expect(errors).toEqual([]);
  });

  // L14 — one rule covers every operation a branch cannot execute, each case carrying its reason.
  it('L14 refuses a fanned activity binding the persist operation', async () => {
    const errors = await loadErrors({
      ...instanceFanFixture,
      activities: [
        instanceFanFixture.activities[0]!,
        activity('research-pass', {
          exits: exits('researched'),
          variables: { reads: ['research_topic'] },
          steps: [{ kind: 'technique', id: 'persist', technique: 'workflow-engine::commit-and-persist' }],
        }),
        instanceFanFixture.activities[2]!,
      ],
    });
    expect(rendered(errors)).toContain(
      "Activity 'research-pass' is fanned by 'scope-research.scoped' and binds 'workflow-engine::commit-and-persist'.",
    );
    // The reason is what the instances share beyond their checkouts, so it reads the same whether
    // or not the destination splits the trees.
    expect(rendered(errors)).toContain('persists the session record and the planning folder');
  });

  it('L14 refuses a fanned activity binding a version-control operation', async () => {
    const errors = await loadErrors({
      ...instanceFanFixture,
      activities: [
        instanceFanFixture.activities[0]!,
        activity('research-pass', {
          exits: exits('researched'),
          variables: { reads: ['research_topic'] },
          steps: [{ kind: 'technique', id: 'commit', technique: 'version-control::commit-regular-files' }],
        }),
        instanceFanFixture.activities[2]!,
      ],
    });
    expect(rendered(errors)).toContain("binds 'version-control::commit-regular-files'");
    // The refusal names the binding that would admit it, so the author is not left to infer that
    // the shared tree is the whole of the reason.
    expect(rendered(errors)).toContain("bind 'version-control::create-worktree' in this activity");
  });

  // L14 reads the branch's own bindings: an activity that materialises a checkout of its own
  // commits into that one, so the shared-tree reason does not hold and the checkout group is legal.
  it('L14 admits a version-control operation where the branch takes a checkout of its own', async () => {
    const errors = await loadErrors({
      ...instanceFanFixture,
      activities: [
        instanceFanFixture.activities[0]!,
        activity('research-pass', {
          exits: exits('researched'),
          variables: { reads: ['research_topic'] },
          steps: [
            { kind: 'technique', id: 'worktree', technique: 'version-control::create-worktree' },
            { kind: 'technique', id: 'commit', technique: 'version-control::commit-regular-files' },
          ],
        }),
        instanceFanFixture.activities[2]!,
      ],
    });
    expect(rendered(errors)).not.toContain("binds 'version-control::commit-regular-files'");
  });

  it('L14 admits the branch that took a checkout and refuses the sibling that did not', async () => {
    // The evidence is each activity's own wiring, so one branch of a list can commit while another
    // in the same fan cannot — and neither the destination nor the routing says anything about it.
    const errors = await loadErrors({
      ...instanceFanFixture,
      graph: {
        'scope-research': {
          scoped: [
            { activity: 'research-pass', over: 'research_topics', variable: 'research_topic' },
            'summarise-pass',
          ],
        },
        'research-pass': { researched: 'combine-research' },
        'summarise-pass': { summarised: 'combine-research' },
        'combine-research': { settled: '__terminal__' },
      },
      activities: [
        instanceFanFixture.activities[0]!,
        activity('research-pass', {
          exits: exits('researched'),
          variables: { reads: ['research_topic'] },
          steps: [
            { kind: 'technique', id: 'worktree', technique: 'version-control::create-worktree' },
            { kind: 'technique', id: 'commit', technique: 'version-control::commit-regular-files' },
          ],
        }),
        activity('summarise-pass', {
          exits: exits('summarised'),
          steps: [{ kind: 'technique', id: 'commit', technique: 'version-control::commit-regular-files' }],
        }),
        instanceFanFixture.activities[2]!,
      ],
    });
    expect(rendered(errors)).not.toContain("Activity 'research-pass' is fanned by");
    expect(rendered(errors)).toContain(
      "Activity 'summarise-pass' is fanned by 'scope-research.scoped' and binds 'version-control::commit-regular-files'.",
    );
  });

  it('L14 refuses the session-level persist however the working trees are split', async () => {
    // What a checkout of its own splits is the working tree. The session record and the planning
    // folder are shared either way, so the operation that commits them stays refused — and says so
    // rather than repeating the shared-tree reason that no longer applies.
    const errors = await loadErrors({
      ...instanceFanFixture,
      activities: [
        instanceFanFixture.activities[0]!,
        activity('research-pass', {
          exits: exits('researched'),
          variables: { reads: ['research_topic'] },
          steps: [
            { kind: 'technique', id: 'worktree', technique: 'version-control::create-worktree' },
            { kind: 'technique', id: 'persist', technique: 'workflow-engine::commit-and-persist' },
          ],
        }),
        instanceFanFixture.activities[2]!,
      ],
    });
    expect(rendered(errors)).toContain("binds 'workflow-engine::commit-and-persist'");
    expect(rendered(errors)).toContain('what that splits is the working tree, not the record');
  });

  it('L14 refuses a fanned activity binding the child-workflow dispatch, for its own reason', async () => {
    const errors = await loadErrors({
      ...instanceFanFixture,
      activities: [
        instanceFanFixture.activities[0]!,
        activity('research-pass', {
          exits: exits('researched'),
          variables: { reads: ['research_topic'] },
          steps: [{ kind: 'technique', id: 'child', technique: 'workflow-engine::handle-sub-workflow' }],
        }),
        instanceFanFixture.activities[2]!,
      ],
    });
    expect(rendered(errors)).toContain("binds 'workflow-engine::handle-sub-workflow'");
    expect(rendered(errors)).toContain('records one activity id and a fan holds several in flight');
  });

  // L15 — a fan reached from its own meeting point opens again on every convergence. It satisfies
  // the nesting, self-routing, convergence and join-is-an-activity rules together.
  it('L15 refuses a fan whose meeting point is its own source', async () => {
    const errors = await loadErrors({
      graph: {
        'scope-sweep': { scoped: ['survey-pass', 'dependency-review'] },
        'survey-pass': { done: 'scope-sweep' },
        'dependency-review': { done: 'scope-sweep' },
      },
      activities: [
        activity('scope-sweep', { exits: exits('scoped') }),
        activity('survey-pass', { exits: exits('done') }),
        activity('dependency-review', { exits: exits('done') }),
      ],
    });
    expect(rendered(errors)).toContain(
      "The fan at 'scope-sweep.scoped' converges on 'scope-sweep', the activity whose exit opens it.",
    );
    expect(rendered(errors)).toContain('opens again on every convergence');
  });

  // L16 — the parameter carries a name of its own, in two arms.
  it('L16 refuses a parameter equal to the collection', async () => {
    const errors = await loadErrors({
      graph: {
        'scope-research': { scoped: { activity: 'research-pass', over: 'research_topics', variable: 'research_topics' } },
        'research-pass': { researched: 'combine-research' },
        'combine-research': { settled: '__terminal__' },
      },
      activities: [
        instanceFanFixture.activities[0]!,
        activity('research-pass', { exits: exits('researched'), variables: { reads: ['research_topics'] } }),
        instanceFanFixture.activities[2]!,
      ],
    });
    expect(rendered(errors)).toContain('handing each instance its element at that same name');
    expect(rendered(errors)).toContain('an instance asking for the collection would be handed its own element');
  });

  it('L16 refuses a parameter the fanned activity also declares among its writes', async () => {
    const errors = await loadErrors({
      ...instanceFanFixture,
      activities: [
        instanceFanFixture.activities[0]!,
        activity('research-pass', {
          exits: exits('researched'),
          variables: {
            reads: ['research_topic'],
            writes: [{ name: 'research_topic', type: 'object' }],
          },
        }),
        instanceFanFixture.activities[2]!,
      ],
    });
    expect(rendered(errors)).toContain(
      "which 'research-pass' also declares among its writes. The parameter is a read-only projection",
    );
  });

  // The mixed form: a list whose members are part different activities and part repeats of one.
  it('a list mixing a bare member with an instance-fan member loads clean', async () => {
    const errors = await loadErrors({
      graph: {
        'scope-research': {
          scoped: [
            'knowledge-base-research',
            { activity: 'web-research', over: 'research_topics', variable: 'research_topic' },
          ],
        },
        'knowledge-base-research': { surveyed: 'combine-research' },
        'web-research': { surveyed: 'combine-research' },
        'combine-research': { settled: '__terminal__' },
      },
      activities: [
        activity('scope-research', {
          exits: exits('scoped'),
          variables: { writes: [{ name: 'research_topics', type: 'array' }] },
        }),
        activity('knowledge-base-research', { exits: exits('surveyed') }),
        activity('web-research', { exits: exits('surveyed'), variables: { reads: ['research_topic'] } }),
        activity('combine-research', { exits: exits('settled') }),
      ],
    });
    expect(errors).toEqual([]);
  });

});
