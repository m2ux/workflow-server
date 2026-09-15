import { describe, it, expect } from 'vitest';
import {
  RoutineResolutionError,
  type RoutineLookup,
  collectRoutineRefs,
  materializeActivityRoutines,
  parseRoutineRef,
  resolveRoutine,
} from '../src/loaders/routine-resolver.js';
import { type Activity, type Step } from '../src/schema/activity.schema.js';
import { type Routine, RoutineSchema } from '../src/schema/routine.schema.js';

/**
 * Routine materialisation (#704 W02): a `kind: routine` step is replaced by the routine's own
 * steps, with the reference site's arguments substituted through them and every identifier inside
 * them prefixed from the reference step's id. The construct is erased at load, so the assertions
 * here are about what an activity holds AFTER materialisation — no consumer downstream sees a
 * reference.
 */

const routine = (partial: Partial<Routine> & { id: string; steps: Step[] }): Routine =>
  RoutineSchema.parse({ version: '1.0.0', name: partial.id, ...partial });

const lookupFrom = (map: Record<string, Routine[]>): RoutineLookup =>
  (workflowId) => {
    const declared = map[workflowId];
    return declared ? new Map(declared.map((r) => [r.id, r])) : undefined;
  };

const activity = (steps: Step[], id = 'host'): Activity =>
  ({ id, version: '1.0.0', name: id, required: true, steps } as Activity);

/** The interview routine the design works through, trimmed to what each case needs. */
const INTERVIEW = routine({
  id: 'assumption-interview',
  inputs: [
    { id: 'gate_message', description: 'Text presented at the batch gate.' },
    { id: 'decision_space', description: 'Which option set the per-item gate offers.', default: 'resolve-or-defer' },
  ],
  outputs: [
    { id: 'assumption_outcome', type: 'string', description: 'The outcome the deciding gate gave.' },
  ],
  internals: [
    { id: 'current_assumption', description: 'The assumption under discussion.' },
  ],
  steps: [
    { kind: 'checkpoint', id: 'batch-gate', message: '{gate_message}', options: [{ id: 'go', label: 'Go', effect: { setVariable: { assumption_outcome: 'accepted' } } }] },
    {
      kind: 'loop', id: 'interview', loopType: 'forEach', variable: 'current_assumption', over: 'open_assumptions',
      steps: [
        { kind: 'checkpoint', id: 'decision#{current_assumption.id}', message: 'Decide using {decision_space}.', options: [{ id: 'ok', label: 'OK' }] },
      ],
    },
  ] as Step[],
});

describe('parseRoutineRef — one separator at most', () => {
  it('reads a bare name', () => {
    expect(parseRoutineRef('assumption-interview', 'ctx')).toEqual({ name: 'assumption-interview' });
  });

  it('reads a workflow-qualified name', () => {
    expect(parseRoutineRef('work-package::assumption-interview', 'ctx'))
      .toEqual({ workflowId: 'work-package', name: 'assumption-interview' });
  });

  it.each([
    ['a::b::c', 2],
    ['work-package::', 1],
    ['::name', 1],
  ])('refuses %s, naming the one-separator rule', (ref) => {
    expect(() => parseRoutineRef(ref, "Activity 'host'")).toThrow(RoutineResolutionError);
    expect(() => parseRoutineRef(ref, "Activity 'host'")).toThrow(/no group grammar/);
  });
});

describe('resolveRoutine — where a name resolves', () => {
  const local = routine({ id: 'shared-run', steps: [{ kind: 'action', id: 'a' }] as Step[] });
  const shared = routine({ id: 'meta-run', steps: [{ kind: 'action', id: 'a' }] as Step[] });
  const shadowed = routine({ id: 'shared-run', steps: [{ kind: 'action', id: 'shadowed' }] as Step[] });
  const LOOKUP = lookupFrom({ 'work-package': [local], meta: [shared, shadowed], other: [] });

  it('resolves a bare name in the referring workflow first', () => {
    expect(resolveRoutine(LOOKUP, 'work-package', 'shared-run', 'ctx').steps[0]!.id).toBe('a');
  });

  it('falls back to meta for a bare name the workflow does not declare', () => {
    expect(resolveRoutine(LOOKUP, 'work-package', 'meta-run', 'ctx').id).toBe('meta-run');
  });

  it('resolves a qualified name in that workflow ONLY, with no meta fallback', () => {
    expect(() => resolveRoutine(LOOKUP, 'work-package', 'other::meta-run', 'ctx'))
      .toThrow(/unresolved routine 'other::meta-run'.*'other'/s);
  });

  it('names the routine, the site and both homes searched when nothing resolves', () => {
    expect(() => resolveRoutine(LOOKUP, 'work-package', 'nonesuch', "Activity 'host'"))
      .toThrow(/Activity 'host'.*nonesuch.*'work-package' or 'meta'/s);
  });
});

describe('materialisation — the reference is gone and the steps are ordinary', () => {
  const LOOKUP = lookupFrom({ 'work-package': [INTERVIEW] });

  const materialise = (step: Partial<Step> & Record<string, unknown>): Activity => {
    const host = activity([{ kind: 'routine', id: 'review-residuals', routine: 'assumption-interview', ...step } as Step]);
    materializeActivityRoutines(host, LOOKUP, 'work-package');
    return host;
  };

  const base = {
    with: { gate_message: 'Open assumptions remain after research.' },
    outputs: { assumption_outcome: 'research_assumption_outcome' },
  };

  it('leaves no kind:routine step at any depth', () => {
    const host = materialise(base);
    const kinds = new Set<string>();
    const walk = (steps: Step[]): void => {
      for (const s of steps) { kinds.add(s.kind); if (s.kind === 'loop') walk(s.steps as Step[]); }
    };
    walk(host.steps!);
    expect(kinds.has('routine')).toBe(false);
    expect([...kinds].sort()).toEqual(['checkpoint', 'loop']);
  });

  it('prefixes every identifier from the reference step, composing through a loop body', () => {
    const host = materialise(base);
    expect(host.steps!.map((s) => s.id)).toEqual(['review-residuals.batch-gate', 'review-residuals.interview']);
    const loop = host.steps![1] as Extract<Step, { kind: 'loop' }>;
    expect((loop.steps as Step[])[0]!.id).toBe('review-residuals.interview.decision#{host_review_residuals_current_assumption.id}');
  });

  it('substitutes a literal argument unbraced and a reference argument braced', () => {
    const literal = materialise(base);
    expect((literal.steps![0] as Extract<Step, { kind: 'checkpoint' }>).message)
      .toBe('Open assumptions remain after research.');

    const referenced = materialise({ ...base, with: { gate_message: '{assumption_review_presentation}' } });
    expect((referenced.steps![0] as Extract<Step, { kind: 'checkpoint' }>).message)
      .toBe('{assumption_review_presentation}');
  });

  it('takes a declared default where the site binds nothing', () => {
    const host = materialise(base);
    const loop = host.steps![1] as Extract<Step, { kind: 'loop' }>;
    expect((loop.steps as Step[])[0] as Extract<Step, { kind: 'checkpoint' }>)
      .toMatchObject({ message: 'Decide using resolve-or-defer.' });
  });

  it('binds an output to the session variable the site names', () => {
    const host = materialise(base);
    const gate = host.steps![0] as Extract<Step, { kind: 'checkpoint' }>;
    expect(gate.options![0]!.effect!.setVariable).toEqual({ research_assumption_outcome: 'accepted' });
  });

  it('mangles an internal with the host activity AND the reference site', () => {
    const host = materialise(base);
    const loop = host.steps![1] as Extract<Step, { kind: 'loop' }>;
    expect(loop.variable).toBe('host_review_residuals_current_assumption');
    expect(loop.over).toBe('open_assumptions');
  });

  it('carries the reference site gate onto every step it stands for', () => {
    const host = materialise({ ...base, when: 'has_open_assumptions == true' });
    expect(host.steps!.map((s) => s.when)).toEqual(['has_open_assumptions == true', 'has_open_assumptions == true']);
  });

  /**
   * A body step with a gate of its own takes BOTH, conjoined. Taking only its own would run it in a
   * host that never asked for the run — and the result is still a well-formed expression, so nothing
   * downstream would notice.
   */
  it('conjoins the site gate with a body step that carries its own', () => {
    const gated = routine({
      id: 'gated-run',
      steps: [
        { kind: 'action', id: 'always', actions: [{ action: 'log', message: 'a' }] },
        { kind: 'action', id: 'sometimes', when: 'needs_individual_interview == true', actions: [{ action: 'log', message: 'b' }] },
      ] as Step[],
    });
    const host = activity([{
      kind: 'routine', id: 'run', routine: 'gated-run', when: 'has_open_assumptions == true',
    } as Step]);
    materializeActivityRoutines(host, lookupFrom({ wf: [gated] }), 'wf');
    expect(host.steps!.map((s) => s.when)).toEqual([
      'has_open_assumptions == true',
      // Each side parenthesised, because either may be a disjunction and the dialect requires it.
      '(has_open_assumptions == true) && (needs_individual_interview == true)',
    ]);
  });

  /**
   * A step id only has to be unique within its scope, so two loops in one activity may each hold a
   * step called `run` — but a variable name shares one flat namespace across the whole workflow, so
   * an internal named from the innermost reference id alone lands on both.
   */
  it('names an internal from the containers the reference sits in, not the reference alone', () => {
    const shared = routine({
      id: 'shared-run',
      internals: [{ id: 'current_item', description: 'the item in hand' }],
      steps: [{
        kind: 'action', id: 'note',
        actions: [
          { action: 'set', target: 'current_item', value: '1' },
          { action: 'log', message: '{current_item}' },
        ],
      }] as Step[],
    });
    const body = [{ kind: 'routine', id: 'run', routine: 'shared-run' }];
    const host = activity([
      { kind: 'loop', id: 'first-pass', loopType: 'forEach', variable: 'a_item', over: 'a_items', steps: body },
      { kind: 'loop', id: 'second-pass', loopType: 'forEach', variable: 'b_item', over: 'b_items', steps: body },
    ] as unknown as Step[]);
    materializeActivityRoutines(host, lookupFrom({ wf: [shared] }), 'wf');

    const internalOf = (index: number): string | undefined => {
      const loop = host.steps![index] as Extract<Step, { kind: 'loop' }>;
      return ((loop.steps as Step[])[0] as Extract<Step, { kind: 'action' }>).actions![0]!.target;
    };
    expect(internalOf(0)).toBe('host_first_pass_run_current_item');
    expect(internalOf(1)).toBe('host_second_pass_run_current_item');
  });

  it('keeps two references to one routine collision-free', () => {
    const host = activity([
      { kind: 'routine', id: 'review-research', routine: 'assumption-interview', ...base } as Step,
      { kind: 'routine', id: 'review-implementation', routine: 'assumption-interview', ...base } as Step,
    ]);
    materializeActivityRoutines(host, LOOKUP, 'work-package');
    expect(host.steps!.map((s) => s.id)).toEqual([
      'review-research.batch-gate', 'review-research.interview',
      'review-implementation.batch-gate', 'review-implementation.interview',
    ]);
  });
});

describe('a `when` expression names its variables bare, so the rewrite has to tell them apart', () => {
  const quoted = routine({
    id: 'quoted-run',
    internals: [{ id: 'current_assumption', description: 'the item in hand' }],
    steps: [
      {
        kind: 'action', id: 'compare',
        // Three shapes in one expression: a bag path to rename, a right-hand operand, and a quoted
        // string whose CONTENTS happen to spell a declared name.
        when: 'current_assumption == open && chosen_mode == "current_assumption"',
        actions: [{ action: 'set', target: 'current_assumption', value: '1' }],
      },
    ] as Step[],
  });

  it('renames a bag path, and leaves a right-hand operand and a quoted literal alone', () => {
    const host = activity([{ kind: 'routine', id: 'run', routine: 'quoted-run' } as Step]);
    materializeActivityRoutines(host, lookupFrom({ wf: [quoted] }), 'wf');
    expect(host.steps![0]!.when)
      .toBe('host_run_current_assumption == open && chosen_mode == "current_assumption"');
  });
});

describe('substitution is simultaneous', () => {
  it('renames each occurrence exactly once when a binding maps a to b and b to c', () => {
    // An iterative rewrite yields `c` for both and passes every other assertion in this file.
    const swap = routine({
      id: 'swap',
      inputs: [
        { id: 'first_name', description: 'first' },
        { id: 'second_name', description: 'second' },
      ],
      steps: [
        { kind: 'action', id: 'say', actions: [{ action: 'message', message: '{first_name} then {second_name}' }] },
      ] as Step[],
    });
    const host = activity([{
      kind: 'routine', id: 'run', routine: 'swap',
      with: { first_name: '{second_name}', second_name: '{third_name}' },
    } as Step]);
    materializeActivityRoutines(host, lookupFrom({ wf: [swap] }), 'wf');
    const step = host.steps![0] as Extract<Step, { kind: 'action' }>;
    expect(step.actions![0]!.message).toBe('{second_name} then {third_name}');
  });
});

describe('the refusals — every terminal but Checked fails', () => {
  const declared = routine({
    id: 'strict-run',
    inputs: [{ id: 'topic_name', description: 'the topic' }],
    outputs: [
      { id: 'run_verdict', type: 'string', description: 'the verdict' },
      { id: 'run_notes', type: 'string', description: 'notes', optional: true },
    ],
    steps: [
      { kind: 'checkpoint', id: 'gate', message: 'About {topic_name}', options: [{ id: 'y', label: 'Yes', effect: { setVariable: { run_verdict: 'ok', run_notes: 'seen' } } }] },
    ] as Step[],
  });
  const LOOKUP = lookupFrom({ wf: [declared] });
  const run = (step: Record<string, unknown>): void => {
    const host = activity([{ kind: 'routine', id: 'run', routine: 'strict-run', ...step } as Step]);
    materializeActivityRoutines(host, LOOKUP, 'wf');
  };

  it('refuses an argument naming no declared input, naming the declared list', () => {
    expect(() => run({ with: { nothing_declared: 'x' }, outputs: { run_verdict: 'v' } }))
      .toThrow(/'nothing_declared' names no input of routine 'strict-run'.*'topic_name'/s);
  });

  it('refuses an output binding naming no declared output', () => {
    expect(() => run({ outputs: { run_verdict: 'v', not_an_output: 'x' } }))
      .toThrow(/'not_an_output' names no output of routine 'strict-run'/);
  });

  it('refuses an unbound output whose declaration does not permit it', () => {
    expect(() => run({ outputs: {} })).toThrow(/output 'run_verdict'.*left unbound.*optional: true/s);
  });

  it('drops the bindings that write an unbound OPTIONAL output', () => {
    const host = activity([{ kind: 'routine', id: 'run', routine: 'strict-run', outputs: { run_verdict: 'v' } } as Step]);
    materializeActivityRoutines(host, LOOKUP, 'wf');
    const gate = host.steps![0] as Extract<Step, { kind: 'checkpoint' }>;
    expect(gate.options![0]!.effect!.setVariable).toEqual({ v: 'ok' });
  });

  it('refuses a reference cycle, naming the chain', () => {
    const alpha = routine({ id: 'alpha', steps: [{ kind: 'routine', id: 'to-beta', routine: 'beta' }] as Step[] });
    const beta = routine({ id: 'beta', steps: [{ kind: 'routine', id: 'to-alpha', routine: 'alpha' }] as Step[] });
    const host = activity([{ kind: 'routine', id: 'start', routine: 'alpha' } as Step]);
    expect(() => materializeActivityRoutines(host, lookupFrom({ wf: [alpha, beta] }), 'wf'))
      .toThrow(/cycle alpha -> beta -> alpha.*recursion is not/s);
  });

  it('refuses a routine that reaches itself', () => {
    const selfish = routine({ id: 'selfish', steps: [{ kind: 'routine', id: 'again', routine: 'selfish' }] as Step[] });
    const host = activity([{ kind: 'routine', id: 'start', routine: 'selfish' } as Step]);
    expect(() => materializeActivityRoutines(host, lookupFrom({ wf: [selfish] }), 'wf'))
      .toThrow(/cycle selfish -> selfish/);
  });
});

describe('nesting — a routine may refer to another', () => {
  const inner = routine({
    id: 'challenge-pass',
    inputs: [{ id: 'pass_topic', description: 'what the pass challenges' }],
    outputs: [{ id: 'pass_findings', type: 'string', description: 'what it found' }],
    steps: [{ kind: 'action', id: 'challenge', actions: [{ action: 'set', target: 'pass_findings', value: '{pass_topic}' }] }] as Step[],
  });
  const outer = routine({
    id: 'convergence',
    outputs: [{ id: 'convergence_findings', type: 'string', description: 'what converged' }],
    steps: [
      {
        kind: 'loop', id: 'iteration', loopType: 'while',
        continueWhile: { type: 'simple', variable: 'convergence_findings', operator: 'exists' },
        steps: [
          { kind: 'routine', id: 'pass', routine: 'challenge-pass', with: { pass_topic: 'assumptions' }, outputs: { pass_findings: 'convergence_findings' } },
        ],
      },
    ] as Step[],
  });

  it('composes the prefix through both references and the loop between them', () => {
    const host = activity([{ kind: 'routine', id: 'converge-assumptions', routine: 'convergence', outputs: { convergence_findings: 'assumption_findings' } } as Step]);
    materializeActivityRoutines(host, lookupFrom({ wf: [inner, outer] }), 'wf');
    const loop = host.steps![0] as Extract<Step, { kind: 'loop' }>;
    expect(loop.id).toBe('converge-assumptions.iteration');
    expect((loop.steps as Step[])[0]!.id).toBe('converge-assumptions.iteration.pass.challenge');
  });

  it('substitutes the outer scope through the inner reference maps before expanding it', () => {
    const host = activity([{ kind: 'routine', id: 'converge-assumptions', routine: 'convergence', outputs: { convergence_findings: 'assumption_findings' } } as Step]);
    materializeActivityRoutines(host, lookupFrom({ wf: [inner, outer] }), 'wf');
    const loop = host.steps![0] as Extract<Step, { kind: 'loop' }>;
    const action = (loop.steps as Step[])[0] as Extract<Step, { kind: 'action' }>;
    // The inner routine's output was bound to the outer's name, which the site bound to the host's.
    expect(action.actions![0]!.target).toBe('assumption_findings');
    expect(loop.continueWhile).toEqual({ type: 'simple', variable: 'assumption_findings', operator: 'exists' });
  });
});

describe('collectRoutineRefs', () => {
  it('finds a reference at top level and inside a loop body', () => {
    const host = activity([
      { kind: 'routine', id: 'a', routine: 'first-run' },
      { kind: 'loop', id: 'l', loopType: 'forEach', variable: 'item_name', over: 'item_names', steps: [{ kind: 'routine', id: 'b', routine: 'wf::second-run' }] },
    ] as Step[]);
    expect(collectRoutineRefs(host)).toEqual(['first-run', 'wf::second-run']);
  });
});
