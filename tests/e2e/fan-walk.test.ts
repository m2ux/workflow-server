import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { createHarness, type Harness } from './harness.js';
import { walk, destinationVisits, pickTargets, type ActivityDef } from './walker.js';
import { defaultPolicy } from './policies.js';
import { activityGraph } from '../../src/utils/activity-variables.js';
import { loadWorkflow } from '../../src/loaders/workflow-loader.js';
import type { Workflow } from '../../src/schema/workflow.schema.js';
import { liveCorpusRoot } from '../corpus-root.js';

/**
 * Every reader that walks a destination reads all three forms. The two silent ones are proved live
 * rather than merely quiet, and the walk is the reader that must precede any corpus fan: unflattened
 * it sends a list where a single activity id is required, the tool's type rejects it, the walk
 * throws, and the coverage job's no-walk-errored assertion fails.
 */
const FAN_CORPUS = resolve(import.meta.dirname, '../fixtures/fan-corpus');

let harness: Harness;

beforeAll(async () => {
  harness = await createHarness({ workflowDir: FAN_CORPUS });
});

afterAll(async () => {
  await harness.close();
});

/** The response body a tool call returned. */
function bodyOf(result: unknown): Record<string, unknown> {
  return JSON.parse(((result as { content: Array<{ text: string }> }).content)[0]!.text) as Record<string, unknown>;
}

async function load(id: string): Promise<Workflow> {
  const result = await loadWorkflow(FAN_CORPUS, id);
  if (!result.success) throw new Error(`${id} failed to load: ${result.error.message}`);
  return result.value;
}

describe('the walk enters each branch and then the meeting point once', () => {
  it('a list fan walks end to end, entering both branches before the meeting point', async () => {
    const result = await walk(harness, 'list-fan-fixture', defaultPolicy, { mode: 'graph', localCheckpoints: true });
    expect(result.loadErrors).toEqual([]);
    expect(result.path).toEqual(['plan-prepare', 'survey-pass', 'dependency-review', 'combine-findings']);
    expect(result.path.filter((id) => id === 'combine-findings')).toHaveLength(1);
    expect(result.finalStatus).toBe('completed');
  });

  it('an instance fan walks one visit per element of its collection', async () => {
    const result = await walk(harness, 'instance-fan-fixture', defaultPolicy, { mode: 'graph', localCheckpoints: true });
    expect(result.loadErrors).toEqual([]);
    // Three elements seeded into the collection, so three branches of one activity — each a
    // distinct frontier entry, the activity id and its instance segment — then the meeting point
    // once, entered by the branch whose return empties the frontier.
    expect(result.path).toEqual([
      'scope-sweep', 'probe-unit#0', 'probe-unit#1', 'probe-unit#2', 'combine-probes',
    ]);
    expect(result.finalStatus).toBe('completed');
  });

  it('a mixed fan walks the bare member and every instance before the meeting point', async () => {
    const result = await walk(harness, 'mixed-fan-fixture', defaultPolicy, { mode: 'graph', localCheckpoints: true });
    expect(result.loadErrors).toEqual([]);
    expect(result.path).toEqual([
      'scope-sweep', 'knowledge-survey', 'probe-unit#0', 'probe-unit#1', 'probe-unit#2', 'combine-probes',
    ]);
    expect(result.path.filter((id) => id === 'combine-probes')).toHaveLength(1);
    expect(result.finalStatus).toBe('completed');
  });
});

describe('the collection a fan runs over', () => {
  it('is the bag as the call that opens the fan leaves it, so the source seeds its own fan', async () => {
    // The activity a fan hangs off is the activity that assigns its work units, so it reports that
    // write on the very call that opens the fan. The fixture declares three units as its default;
    // this call reports two, and two branches open — which is only true if the enter reads the bag
    // with this call's writes already in it.
    const start = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'instance-fan-fixture',
        agent_id: 'orchestrator',
        planning_folder: `${harness.workspaceDir}/.engineering/artifacts/planning/fan-source-seeds`,
      },
    });
    const sessionIndex = (JSON.parse((start.content as Array<{ text: string }>)[0]!.text) as { session_index: string }).session_index;

    await harness.client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: 'scope-sweep' },
    });
    const opened = await harness.client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: { activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target' },
        from_activity: 'scope-sweep',
        exit: 'scoped',
        variables_changed: { probe_targets: ['reported-one', 'reported-two'] },
      },
    });
    const fan = bodyOf(opened)['fan'] as Array<{ branches: string[] }> | undefined;
    expect(fan?.flatMap((member) => member.branches)).toEqual(['probe-unit#0', 'probe-unit#1']);
  });

  it('reads the barrier on the open, on each retirement, and on a fan opened from its join', async () => {
    // Every fan-related call carries the barrier, and `met` turns on the call that enters the
    // destination, whose `pending` is the frontier it leaves: the destination alone. The second fan
    // hangs off the first one's join, so its barrier names the join the graph gives that exit.
    const start = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'chained-fan-fixture',
        agent_id: 'orchestrator',
        planning_folder: `${harness.workspaceDir}/.engineering/artifacts/planning/fan-barrier-reading`,
      },
    });
    const sessionIndex = bodyOf(start)['session_index'] as string;
    const advance = async (args: Record<string, unknown>): Promise<unknown> => bodyOf(
      await harness.client.callTool({ name: 'next_activity', arguments: { session_index: sessionIndex, ...args } }),
    )['barrier'];

    expect(await advance({ activity_id: 'scope-sweep' })).toBeUndefined();
    expect(await advance({
      activity_id: { activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target' },
      from_activity: 'scope-sweep',
      exit: 'scoped',
      variables_changed: { probe_targets: ['one', 'two'] },
    })).toEqual({ destination: 'combine-probes', pending: ['probe-unit#0', 'probe-unit#1'], met: false });
    expect(await advance({ activity_id: 'combine-probes', from_activity: 'probe-unit#0', exit: 'probed', agent_id: 'branch-0' }))
      .toEqual({ destination: 'combine-probes', pending: ['probe-unit#1'], met: false });
    expect(await advance({ activity_id: 'combine-probes', from_activity: 'probe-unit#1', exit: 'probed', agent_id: 'branch-1' }))
      .toEqual({ destination: 'combine-probes', pending: ['combine-probes'], met: true });
    expect(await advance({
      activity_id: { activity: 'unit-review', over: 'probe_unit_outputs', variable: 'review_unit' },
      from_activity: 'combine-probes',
      exit: 'swept',
    })).toEqual({ destination: 'reconcile-review', pending: ['unit-review#0', 'unit-review#1'], met: false });
  });
});

/**
 * The fan procedure reaches the orchestrator as the steps of the activity that runs it.
 *
 * A step's bound technique rides the activity's delivery, so the binding is what carries the
 * procedure to the context that reaches the step. `spawn-concurrent` is the one that cannot arrive
 * any other way: `spawn-branches` applies it from inside its own Protocol, and an inline reference
 * is never re-resolved, so a delivery that leaves it out hands the orchestrator a Protocol naming a
 * technique it does not hold.
 *
 * Measured against the live corpus rather than the fan fixture, because the binding lives in the
 * routines the graph-holding activity splices in, which the fixture has no equivalent of.
 */
describe.skipIf(!liveCorpusRoot())('the fan procedure reaches the activity that runs it', () => {
  /** Every technique bound by a step of `id`, at any nesting depth. */
  async function stepTechniques(workflowId: string, id: string): Promise<string[]> {
    const result = await loadWorkflow(liveCorpusRoot()!, workflowId);
    if (!result.success) throw new Error(`${workflowId} failed to load: ${result.error.message}`);
    const activity = (result.value.activities ?? []).find((a) => a.id === id);
    expect(activity, `${workflowId} declares no activity '${id}'`).toBeDefined();
    const found: string[] = [];
    const collect = (steps: ActivityDef['steps']): void => {
      for (const step of steps ?? []) {
        const named = (step as { technique?: { name?: string } }).technique?.name;
        if (named) found.push(named);
        collect((step as { steps?: ActivityDef['steps'] }).steps);
      }
    };
    collect(activity!.steps as ActivityDef['steps']);
    return found;
  }

  it('binds the open, the spawn, the retirement and the batch dispatch it applies', async () => {
    const bound = await stepTechniques('meta', 'dispatch-client-workflow');
    expect(bound).toContain('fan::enter-fan');
    expect(bound).toContain('fan::spawn-branches');
    expect(bound).toContain('fan::retire-branch');
    expect(bound).toContain('harness-compat::spawn-concurrent');
  });
});

describe('the graph builder flattens, and de-duplicates after', () => {
  it('a list fan contributes both branch heads as successors of its source', async () => {
    const graph = activityGraph(await load('list-fan-fixture'));
    expect(graph.get('plan-prepare')).toEqual(['survey-pass', 'dependency-review']);
  });

  it('an instance fan of eleven produces one graph node', async () => {
    // The instance fan's target list is one activity however wide the fan runs, so de-duplicating
    // AFTER the flatten is what keeps the forward search, the predecessor index and the cycle pass
    // seeing the graph one visit would produce. Width is a run-time value the graph never sees.
    const workflow = await load('instance-fan-fixture');
    const graph = activityGraph(workflow);
    expect(graph.get('scope-sweep')).toEqual(['probe-unit']);
    expect([...graph.keys()]).toEqual(['scope-sweep', 'probe-unit', 'combine-probes']);

    const eleven = Array.from({ length: 11 }, (_, i) => `unit-${i}`);
    const fan = workflow.graph!['scope-sweep']!['scoped']!;
    // Eleven instances, one node in the graph and eleven visits in a walk.
    expect(destinationVisits(fan, { probe_targets: eleven })).toHaveLength(11);
    expect(new Set(destinationVisits(fan, { probe_targets: eleven }))).toEqual(new Set(['probe-unit']));
  });

  it('a mixed fan contributes the bare member and the fanned activity, each once', async () => {
    const graph = activityGraph(await load('mixed-fan-fixture'));
    expect(graph.get('scope-sweep')).toEqual(['knowledge-survey', 'probe-unit']);
  });
});

describe('the walk derivation', () => {
  const act = (id: string, exitId: string): ActivityDef => ({ id, exits: [{ id: exitId, isDefault: true }] });

  it('an instance fan is one visit per element, and one where the bag holds nothing to seed from', () => {
    const fan = { activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target' };
    expect(destinationVisits(fan, { probe_targets: ['a', 'b', 'c'] }))
      .toEqual(['probe-unit', 'probe-unit', 'probe-unit']);
    expect(destinationVisits(fan, {})).toEqual(['probe-unit']);
    expect(destinationVisits(fan, { probe_targets: [] })).toEqual(['probe-unit']);
  });

  it('a plain destination is one visit and the branch set is the whole flattened list', () => {
    expect(destinationVisits('assumptions-review', {})).toEqual(['assumptions-review']);
    expect(destinationVisits(['survey-pass', 'dependency-review'], {}))
      .toEqual(['survey-pass', 'dependency-review']);
  });

  it('pickTargets reads the destination off the graph in every form', async () => {
    const listFan = await load('list-fan-fixture');
    expect(pickTargets(act('plan-prepare', 'done'), listFan.graph!, {}))
      .toEqual(['survey-pass', 'dependency-review']);

    const instanceFan = await load('instance-fan-fixture');
    expect(pickTargets(act('scope-sweep', 'scoped'), instanceFan.graph!, { probe_targets: ['a', 'b'] }))
      .toEqual(['probe-unit', 'probe-unit']);
  });
});
