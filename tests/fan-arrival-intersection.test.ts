import { describe, it, expect } from 'vitest';
import { unreachableReads, type ActivityGraph } from '../src/utils/activity-variables.js';

/**
 * The arrival meet, at fixture grain. This lands inside a hard-zero guard with no ledger to diff,
 * so a bug in it is silent and these are the whole protection. Three ways exist to apply the change
 * and have it do nothing, and each is caught only here: an un-split predecessor index lets the
 * intersection wipe the union straight back out, an unmoved candidate seed never makes a union
 * arrival's extra names candidates, and a branch head's own predecessor must stay ordinary.
 */

type Reads = ReadonlyMap<string, ReadonlySet<string>>;

const mapOf = (entries: Record<string, string[]>): Reads =>
  new Map(Object.entries(entries).map(([id, names]) => [id, new Set(names)]));

const graphOf = (entries: Record<string, string[]>): ActivityGraph =>
  new Map(Object.entries(entries));

/** The flagship shape: one source fanning to two branches converging on one meeting point. */
const LIST_FAN = {
  graph: graphOf({
    'plan-prepare': ['research', 'codebase-comprehension'],
    research: ['assumptions-review'],
    'codebase-comprehension': ['assumptions-review'],
    'assumptions-review': [],
  }),
  fans: [{ branches: ['research', 'codebase-comprehension'], join: 'assumptions-review' }],
  writes: mapOf({
    'plan-prepare': ['plan_document'],
    research: ['research_outputs'],
    'codebase-comprehension': ['codebase_comprehension_outputs'],
    'assumptions-review': [],
  }),
};

const run = (args: {
  graph: ActivityGraph;
  fans?: ReadonlyArray<{ branches: readonly string[]; join: string | undefined }>;
  writes: Reads;
  reads: Reads;
  initialActivity?: string;
  routingReads?: Reads;
}) => unreachableReads({
  graph: args.graph,
  ...(args.fans ? { fans: args.fans } : {}),
  initialActivity: args.initialActivity ?? 'plan-prepare',
  availableAtEntry: new Set<string>(),
  reads: args.reads,
  routingReads: args.routingReads ?? new Map(),
  writes: args.writes,
  policy: new Set<string>(),
});

describe('the meet at a fan\'s meeting point', () => {
  it('a read of a name only one branch writes produces no finding', () => {
    // Every branch ran, so the meeting point's entry state is the UNION of what they leave.
    // Left as a predecessor intersection this is a false finding an author would "fix" by
    // moving declarations.
    const findings = run({
      ...LIST_FAN,
      reads: mapOf({ 'assumptions-review': ['research_outputs', 'codebase_comprehension_outputs'] }),
    });
    expect(findings).toEqual([]);
  });

  it('a genuinely unwritten read inside a branch is reported as an entry finding', () => {
    const findings = run({
      ...LIST_FAN,
      reads: mapOf({ research: ['codebase_comprehension_outputs'] }),
    });
    expect(findings).toEqual([
      { activityId: 'research', name: 'codebase_comprehension_outputs', kind: 'entry' },
    ]);
  });

  it('a branch head\'s own predecessor stays ordinary — the fan source\'s post-state is where it starts', () => {
    // The source's own write is available to every branch, by the plain edge into it.
    expect(run({ ...LIST_FAN, reads: mapOf({ research: ['plan_document'] }) })).toEqual([]);
  });

  it('the arrival split removes every duplicate predecessor entry for a repeated destination', () => {
    // Two exits of one branch bound to the meeting point push that branch twice into the plain
    // predecessor index. One surviving entry is enough to intersect the union straight back out.
    const findings = run({
      graph: graphOf({
        'plan-prepare': ['research', 'codebase-comprehension'],
        // The graph builder de-dupes per source, so a repeat arrives from a second source path.
        research: ['assumptions-review'],
        'codebase-comprehension': ['assumptions-review'],
        'assumptions-review': [],
      }),
      fans: [
        { branches: ['research', 'codebase-comprehension'], join: 'assumptions-review' },
        // A second derivation of the same fan, as a graph with two fanning exits produces.
        { branches: ['research', 'codebase-comprehension'], join: 'assumptions-review' },
      ],
      writes: LIST_FAN.writes,
      reads: mapOf({ 'assumptions-review': ['research_outputs'] }),
    });
    expect(findings).toEqual([]);
  });

  it('two fans converging on one node are two arrivals, so it may declare only what both satisfy', () => {
    // The design consequence stated beside the meet: a read of one fan's container is satisfied on
    // that fan's arrival and not on the other's, so it is reported.
    const findings = run({
      // Two exits of one activity, each fanning, both converging on one meeting point.
      graph: graphOf({
        start: ['alpha-one', 'alpha-two', 'beta-one', 'beta-two'],
        'alpha-one': ['meeting-point'],
        'alpha-two': ['meeting-point'],
        'beta-one': ['meeting-point'],
        'beta-two': ['meeting-point'],
        'meeting-point': [],
      }),
      fans: [
        { branches: ['alpha-one', 'alpha-two'], join: 'meeting-point' },
        { branches: ['beta-one', 'beta-two'], join: 'meeting-point' },
      ],
      writes: mapOf({
        start: ['start_marker'],
        'alpha-one': ['alpha_one_outputs'],
        'alpha-two': ['alpha_two_outputs'],
        'beta-one': ['beta_one_outputs'],
        'beta-two': ['beta_two_outputs'],
        'meeting-point': [],
      }),
      reads: mapOf({ 'meeting-point': ['alpha_one_outputs'] }),
      initialActivity: 'start',
    });
    expect(findings).toEqual([
      { activityId: 'meeting-point', name: 'alpha_one_outputs', kind: 'entry' },
    ]);
  });
});

describe('the meet over an instance fan', () => {
  /** Eleven instances of one activity, which the graph collapses to one node. */
  const ELEVEN = {
    graph: graphOf({
      'scope-sweep': ['probe-unit'],
      'probe-unit': ['combine-probes'],
      'combine-probes': [],
    }),
    fans: [{ branches: ['probe-unit'], join: 'combine-probes' }],
    writes: mapOf({
      'scope-sweep': ['probe_targets'],
      'probe-unit': ['probe_unit_outputs'],
      'combine-probes': [],
    }),
  };

  it('the fixed point terminates on a fan of eleven', () => {
    // The union is idempotent over instances and the set of names a fan makes available is
    // width-independent, the index living inside the value — so the walk never sees a count and an
    // unbounded run-time width cannot break it.
    const findings = run({
      ...ELEVEN,
      reads: mapOf({ 'combine-probes': ['probe_unit_outputs', 'probe_targets'] }),
      initialActivity: 'scope-sweep',
    });
    expect(findings).toEqual([]);
  });

  it('a read at the meeting point that no instance writes is still reported', () => {
    const findings = run({
      ...ELEVEN,
      reads: mapOf({ 'combine-probes': ['nothing_writes_this'] }),
      initialActivity: 'scope-sweep',
    });
    expect(findings).toEqual([
      { activityId: 'combine-probes', name: 'nothing_writes_this', kind: 'entry' },
    ]);
  });
});

describe('the fan\'s collection, as the branch reads it', () => {
  // The claim the synthetic read makes is that the collection is available ON ENTRY TO THE BRANCH.
  // Attributed to the source — which is where the collection is usually written — it reports
  // falsely on the flagship shape.
  const graph = graphOf({
    'route-choice': ['scope-sweep', 'skip-sweep'],
    'scope-sweep': ['probe-unit'],
    'skip-sweep': ['probe-unit'],
    'probe-unit': ['combine-probes'],
    'combine-probes': [],
  });
  const fans = [{ branches: ['probe-unit'], join: 'combine-probes' }];

  it('is not reported when the fan\'s source writes it', () => {
    const findings = run({
      graph: graphOf({
        'scope-sweep': ['probe-unit'],
        'probe-unit': ['combine-probes'],
        'combine-probes': [],
      }),
      fans,
      writes: mapOf({ 'scope-sweep': ['probe_targets'], 'probe-unit': [], 'combine-probes': [] }),
      reads: mapOf({ 'probe-unit': ['probe_targets'] }),
      initialActivity: 'scope-sweep',
    });
    expect(findings).toEqual([]);
  });

  it('is reported on a path that reaches the fan before anything writes it', () => {
    const findings = run({
      graph,
      fans,
      writes: mapOf({
        'route-choice': [],
        'scope-sweep': ['probe_targets'],
        'skip-sweep': [],
        'probe-unit': [],
        'combine-probes': [],
      }),
      reads: mapOf({ 'probe-unit': ['probe_targets'] }),
      initialActivity: 'route-choice',
    });
    expect(findings).toEqual([
      { activityId: 'probe-unit', name: 'probe_targets', kind: 'entry' },
    ]);
  });
});
