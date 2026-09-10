import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { createHarness, type Harness } from './harness.js';
import { walk, destinationVisits, pickTargets, type ActivityDef } from './walker.js';
import { defaultPolicy } from './policies.js';
import { activityGraph } from '../../src/utils/activity-variables.js';
import { loadWorkflow } from '../../src/loaders/workflow-loader.js';
import type { Workflow } from '../../src/schema/workflow.schema.js';

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

describe('the concurrent-dispatch operation reaches the orchestrator that can use it', () => {
  const workflowBundle = async (workflowId: string): Promise<string> => {
    const start = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: workflowId,
        agent_id: 'orchestrator',
        planning_folder: `${harness.workspaceDir}/.engineering/artifacts/planning/fan-bundle-${workflowId}`,
      },
    });
    const sessionIndex = (JSON.parse((start.content as Array<{ text: string }>)[0]!.text) as { session_index: string }).session_index;
    const workflow = await harness.client.callTool({ name: 'get_workflow', arguments: { session_index: sessionIndex } });
    return (workflow.content as Array<{ text: string }>)[0]!.text;
  };

  it('rides the response for a workflow whose graph fans', async () => {
    expect(await workflowBundle('instance-fan-fixture')).toContain('dispatch-fan');
  });

  it('is absent from one whose graph fans nowhere, which can never reach it', async () => {
    expect(await workflowBundle('meta')).not.toContain('dispatch-fan');
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
