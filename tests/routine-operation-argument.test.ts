import { describe, it, expect } from 'vitest';
import {
  RoutineResolutionError,
  type RoutineLookup,
  bodyWithOperations,
  materializeActivityRoutines,
} from '../src/loaders/routine-resolver.js';
import { type Activity, type Step, type TechniqueStep, techniqueName } from '../src/schema/activity.schema.js';
import { type Routine, RoutineSchema, operationInputs, safeValidateRoutine } from '../src/schema/routine.schema.js';

/**
 * An operation as an argument (#739 W01): an input declared `kind: technique` takes an operation
 * reference rather than a value, and the reference stands in a body step's technique position until
 * a site says which operation. Substitution happens at materialisation, which is before the contract
 * derives — so a derived contract never meets a placeholder.
 *
 * The cases here are about the two namespaces staying apart. A value moves through bag names, tokens
 * and expressions; an operation moves into exactly one field.
 */

const routine = (partial: Partial<Routine> & { id: string; steps: Step[] }): Routine =>
  RoutineSchema.parse({ version: '1.0.0', name: partial.id, ...partial });

const lookupFrom = (declared: Routine[]): RoutineLookup =>
  (workflowId) => (workflowId === 'wf' ? new Map(declared.map((r) => [r.id, r])) : undefined);

const activity = (steps: Step[], id = 'host'): Activity =>
  ({ id, version: '1.0.0', name: id, required: true, steps } as Activity);

/** The per-unit pass the prism family converges on, trimmed to what each case needs. */
const PER_UNIT_PASS = routine({
  id: 'per-unit-pass',
  inputs: [
    { id: 'pass_operation', kind: 'technique', description: 'The lens each unit is run through.' },
    { id: 'prior_artifact_paths', description: 'Artifacts earlier passes produced.' },
    { id: 'unit_pipeline_mode', description: 'Which pipeline a unit belongs to.' },
  ],
  internals: [
    { id: 'current_unit', description: 'The unit under analysis.' },
  ],
  steps: [
    {
      kind: 'loop', id: 'unit-cycle', loopType: 'forEach', variable: 'current_unit', over: 'analysis_units',
      steps: [
        {
          kind: 'technique',
          id: 'run-pass',
          technique: { name: 'pass_operation', inputs: { target_content: '{current_unit.target}', prior_artifact_paths: 'prior_artifact_paths' } },
          when: "current_unit.pipeline_mode == unit_pipeline_mode",
        },
      ],
    },
  ] as Step[],
});

/** The one technique step a materialised per-unit pass holds, wherever the loop put it. */
const passStep = (host: Activity): TechniqueStep => {
  const loop = host.steps![0] as Step & { kind: 'loop' };
  return loop.steps[0] as TechniqueStep;
};

describe('an operation reaches the technique position', () => {
  it('substitutes the site\'s argument where the body names the parameter', () => {
    const host = activity([
      { kind: 'routine', id: 'adversarial', routine: 'per-unit-pass', with: { pass_operation: 'full-prism::adversarial' } },
    ] as Step[]);
    materializeActivityRoutines(host, lookupFrom([PER_UNIT_PASS]), 'wf');
    expect(techniqueName(passStep(host).technique)).toBe('full-prism::adversarial');
  });

  it('gives two sites two operations from one body', () => {
    const adversarial = activity([
      { kind: 'routine', id: 'adversarial', routine: 'per-unit-pass', with: { pass_operation: 'full-prism::adversarial' } },
    ] as Step[], 'adversarial-pass');
    const behavioral = activity([
      { kind: 'routine', id: 'behavioral', routine: 'per-unit-pass', with: { pass_operation: 'behavioral-pipeline::synthesis' } },
    ] as Step[], 'behavioral-pass');
    materializeActivityRoutines(adversarial, lookupFrom([PER_UNIT_PASS]), 'wf');
    materializeActivityRoutines(behavioral, lookupFrom([PER_UNIT_PASS]), 'wf');
    expect(techniqueName(passStep(adversarial).technique)).toBe('full-prism::adversarial');
    expect(techniqueName(passStep(behavioral).technique)).toBe('behavioral-pipeline::synthesis');
  });

  it('takes a declared default where the site binds nothing', () => {
    const defaulted = routine({
      ...PER_UNIT_PASS,
      id: 'defaulted-pass',
      inputs: [
        { id: 'pass_operation', kind: 'technique', description: 'The lens each unit is run through.', default: 'full-prism::synthesis' },
        { id: 'prior_artifact_paths', description: 'Artifacts earlier passes produced.' },
        { id: 'unit_pipeline_mode', description: 'Which pipeline a unit belongs to.' },
      ],
    });
    const host = activity([{ kind: 'routine', id: 'pass', routine: 'defaulted-pass' }] as Step[]);
    materializeActivityRoutines(host, lookupFrom([defaulted]), 'wf');
    expect(techniqueName(passStep(host).technique)).toBe('full-prism::synthesis');
  });

  it('substitutes a bare-string technique position as well as a structured one', () => {
    const bare = routine({
      id: 'bare-pass',
      inputs: [{ id: 'pass_operation', kind: 'technique', description: 'The lens.' }],
      steps: [{ kind: 'technique', id: 'run-pass', technique: 'pass_operation' }] as Step[],
    });
    const host = activity([
      { kind: 'routine', id: 'pass', routine: 'bare-pass', with: { pass_operation: 'full-prism::adversarial' } },
    ] as Step[]);
    materializeActivityRoutines(host, lookupFrom([bare]), 'wf');
    expect((host.steps![0] as TechniqueStep).technique).toBe('full-prism::adversarial');
  });
});

describe('the two namespaces stay apart', () => {
  it('leaves the value substitution untouched by the operation argument', () => {
    const host = activity([
      {
        kind: 'routine', id: 'adversarial', routine: 'per-unit-pass',
        with: { pass_operation: 'full-prism::adversarial', prior_artifact_paths: '{all_artifact_paths}', unit_pipeline_mode: 'full-prism' },
      },
    ] as Step[]);
    materializeActivityRoutines(host, lookupFrom([PER_UNIT_PASS]), 'wf');
    const step = passStep(host);
    expect((step.technique as { inputs: Record<string, unknown> }).inputs['prior_artifact_paths']).toBe('all_artifact_paths');
    expect(step.when).toBe("host_adversarial_current_unit.pipeline_mode == 'full-prism'");
  });

  it('does not rewrite a value position that happens to spell the parameter', () => {
    const spelled = routine({
      id: 'spelled-pass',
      inputs: [{ id: 'pass_operation', kind: 'technique', description: 'The lens.' }],
      steps: [
        { kind: 'technique', id: 'run-pass', technique: { name: 'pass_operation', inputs: { note: 'pass_operation' } } },
      ] as Step[],
    });
    const host = activity([
      { kind: 'routine', id: 'pass', routine: 'spelled-pass', with: { pass_operation: 'full-prism::adversarial' } },
    ] as Step[]);
    materializeActivityRoutines(host, lookupFrom([spelled]), 'wf');
    const binding = (host.steps![0] as TechniqueStep).technique as { name: string; inputs: Record<string, unknown> };
    expect(binding.name).toBe('full-prism::adversarial');
    expect(binding.inputs['note']).toBe('pass_operation');
  });
});

describe('what a site may not supply', () => {
  const materialise = (step: Record<string, unknown>): void => {
    materializeActivityRoutines(activity([step as unknown as Step]), lookupFrom([PER_UNIT_PASS]), 'wf');
  };

  it('refuses an unbound operation parameter, there being no host value to fall through to', () => {
    expect(() => materialise({ kind: 'routine', id: 'pass', routine: 'per-unit-pass' }))
      .toThrow(/declares 'kind: technique' and this site binds no argument/);
  });

  it('refuses an argument carrying a token, which has no value when definitions load', () => {
    expect(() => materialise({ kind: 'routine', id: 'pass', routine: 'per-unit-pass', with: { pass_operation: '{chosen_lens}' } }))
      .toThrow(/takes a literal reference/);
  });

  it('refuses a non-string argument', () => {
    expect(() => materialise({ kind: 'routine', id: 'pass', routine: 'per-unit-pass', with: { pass_operation: 4 } }))
      .toThrow(RoutineResolutionError);
  });
});

describe('a parameter standing to the right of a comparison', () => {
  const gated = (when: string): Routine => routine({
    id: 'gated-pass',
    inputs: [{ id: 'unit_pipeline_mode', description: 'Which pipeline a unit belongs to.' }],
    steps: [{ kind: 'action', id: 'note', when, actions: [{ action: 'message', message: 'noted' }] }] as Step[],
  });

  const gateAfter = (when: string, argument: string | number | boolean): string => {
    const host = activity([
      { kind: 'routine', id: 'pass', routine: 'gated-pass', with: { unit_pipeline_mode: argument } },
    ] as Step[]);
    materializeActivityRoutines(host, lookupFrom([gated(when)]), 'wf');
    return host.steps![0]!.when!;
  };

  it('takes the site\'s literal, quoted, so a hyphenated value survives the tokeniser', () => {
    expect(gateAfter('analysis_mode == unit_pipeline_mode', 'full-prism'))
      .toBe("analysis_mode == 'full-prism'");
  });

  it('emits a boolean bare, the dialect reading true as a keyword rather than characters', () => {
    expect(gateAfter('analysis_mode == unit_pipeline_mode', true)).toBe('analysis_mode == true');
  });

  it('leaves an operand the routine does not declare exactly as written', () => {
    expect(gateAfter('analysis_mode == completion', 'full-prism')).toBe('analysis_mode == completion');
  });

  it('leaves a dotted operand alone, its whole text being the value compared against', () => {
    expect(gateAfter('analysis_mode == unit_pipeline_mode.tail', 'full-prism'))
      .toBe('analysis_mode == unit_pipeline_mode.tail');
  });

  it('refuses a site binding a variable there, the dialect taking a value and never a name', () => {
    expect(() => gateAfter('analysis_mode == unit_pipeline_mode', '{chosen_mode}'))
      .toThrow(/stands to the right of a comparison/);
  });

  it('refuses a value carrying a quote, which the dialect has no escape for', () => {
    expect(() => gateAfter('analysis_mode == unit_pipeline_mode', "it's"))
      .toThrow(/carries a quote/);
  });

  it('still rewrites the left side, which is a bag path', () => {
    expect(gateAfter('unit_pipeline_mode == completion', 'full-prism')).toBe('full-prism == completion');
  });
});

describe('a step binding an operation parameter declares its own id', () => {
  const withStep = (step: Record<string, unknown>): unknown => ({
    id: 'unnamed-pass', version: '1.0.0', name: 'unnamed-pass',
    inputs: [{ id: 'pass_operation', kind: 'technique', description: 'The lens.' }],
    steps: [step],
  });

  it('refuses one that omits it, the derived id being the parameter at every site', () => {
    const result = safeValidateRoutine(withStep({ kind: 'technique', technique: { name: 'pass_operation' } }));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("binds the operation parameter 'pass_operation'");
  });

  it('refuses one nested in a loop body', () => {
    const result = safeValidateRoutine(withStep({
      kind: 'loop', id: 'cycle', loopType: 'forEach', variable: 'current_unit', over: 'analysis_units',
      steps: [{ kind: 'technique', technique: 'pass_operation' }],
    }));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['steps', 0, 'steps', 0, 'id']);
  });

  it('admits a step binding an ordinary operation with no id, which derives one', () => {
    expect(safeValidateRoutine(withStep({ kind: 'technique', technique: 'full-prism::adversarial' })).success).toBe(true);
  });
});

describe('the declaration says which parameters are operations', () => {
  it('names them, so a caller can tell a per-site routine from a per-definition one', () => {
    expect(operationInputs(PER_UNIT_PASS)).toEqual(['pass_operation']);
    expect(operationInputs(routine({ id: 'plain', steps: [{ kind: 'action', id: 'note', actions: [] }] as Step[] }))).toEqual([]);
  });

  it('puts one site\'s operations into a body without touching the declaration', () => {
    const body = bodyWithOperations(PER_UNIT_PASS.steps, new Map([['pass_operation', 'full-prism::synthesis']]));
    const substituted = (body[0] as Step & { kind: 'loop' }).steps[0] as TechniqueStep;
    expect(techniqueName(substituted.technique)).toBe('full-prism::synthesis');
    const authored = (PER_UNIT_PASS.steps[0] as Step & { kind: 'loop' }).steps[0] as TechniqueStep;
    expect(techniqueName(authored.technique)).toBe('pass_operation');
  });
});
