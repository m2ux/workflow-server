import { describe, it, expect } from 'vitest';
import {
  immediateExitCut,
  validateActivityTransition,
  validateWorkflowVersion,
  validateStepManifest,
  validateTechniqueFetches,
  buildValidation,
  type SessionView,
} from '../src/utils/validation.js';
import type { HistoryEntry } from '../src/schema/state.schema.js';
import { evaluateCondition } from '../src/schema/condition.schema.js';
import type { Condition } from '../src/schema/condition.schema.js';
import type { Workflow } from '../src/schema/workflow.schema.js';

function makeToken(overrides: Partial<SessionView> = {}): SessionView {
  return {
    wf: 'test-wf',
    act: '',
    v: '1.0.0',
    ...overrides,
  };
}

function makeWorkflow(overrides: Partial<Workflow> = {}): Workflow {
  return {
    id: 'test-wf',
    version: '1.0.0',
    title: 'Test Workflow',
    graph: {
      planning: { done: 'implementation' },
      implementation: { done: 'review' },
    },
    activities: [
      {
        id: 'planning',
        title: 'Planning',
        steps: [{ id: 'plan-step', title: 'Plan', instructions: 'Plan it' }],
        exits: [{ id: 'done', isDefault: true }],
      },
      {
        id: 'implementation',
        title: 'Implementation',
        steps: [{ id: 'impl-step', title: 'Implement', instructions: 'Do it' }],
        exits: [{ id: 'done', isDefault: true }],
      },
      {
        id: 'review',
        title: 'Review',
        steps: [{ id: 'review-step', title: 'Review', instructions: 'Review it' }],
      },
    ],
    ...overrides,
  };
}

describe('validation', () => {
  describe('BF-04: validateActivityTransition warning strings', () => {
    it('returns null when transition is valid', () => {
      const token = makeToken({ act: 'planning' });
      const workflow = makeWorkflow();
      const result = validateActivityTransition(token, workflow, 'implementation');
      expect(result).toBeNull();
    });

    it('returns null when staying on the same activity', () => {
      const token = makeToken({ act: 'planning' });
      const workflow = makeWorkflow();
      const result = validateActivityTransition(token, workflow, 'planning');
      expect(result).toBeNull();
    });

    it('returns descriptive warning when transition is invalid', () => {
      const token = makeToken({ act: 'planning' });
      const workflow = makeWorkflow();
      const result = validateActivityTransition(token, workflow, 'review');
      expect(result).not.toBeNull();
      expect(result).toBeTypeOf('string');
      expect(result).toContain('review');
      expect(result).toContain('planning');
      expect(result).toContain('The workflow graph sends its exits to');
    });

    it('returns null when the current activity declares no exits (terminal activity)', () => {
      const token = makeToken({ act: 'review' });
      const workflow = makeWorkflow();
      const result = validateActivityTransition(token, workflow, 'planning');
      expect(result).toBeNull();
    });

    it('returns null on first call (no current activity)', () => {
      const token = makeToken({ act: '' });
      const workflow = makeWorkflow();
      const result = validateActivityTransition(token, workflow, 'planning');
      expect(result).toBeNull();
    });

    it('lists the bound destinations in the warning message', () => {
      const workflow = makeWorkflow({
        graph: { hub: { 'a-chosen': 'branch-a', 'b-chosen': 'branch-b' } },
        activities: [
          {
            id: 'hub',
            title: 'Hub',
            steps: [{ id: 's1', title: 'Step', instructions: 'Do' }],
            exits: [{ id: 'a-chosen', when: 'wants_a == true' }, { id: 'b-chosen', isDefault: true }],
          },
          { id: 'branch-a', title: 'A', steps: [{ id: 'a1', title: 'A', instructions: 'A' }] },
          { id: 'branch-b', title: 'B', steps: [{ id: 'b1', title: 'B', instructions: 'B' }] },
          { id: 'branch-c', title: 'C', steps: [{ id: 'c1', title: 'C', instructions: 'C' }] },
        ],
      });
      const token = makeToken({ act: 'hub' });
      const result = validateActivityTransition(token, workflow, 'branch-c');
      expect(result).not.toBeNull();
      expect(result).toContain('branch-a');
      expect(result).toContain('branch-b');
    });
  });

  describe('BF-09: initialActivity enforcement', () => {
    it('returns null on first call when no initialActivity is set', () => {
      const token = makeToken({ act: '' });
      const workflow = makeWorkflow();
      const result = validateActivityTransition(token, workflow, 'review');
      expect(result).toBeNull();
    });

    it('returns null when first call targets the initialActivity', () => {
      const token = makeToken({ act: '' });
      const workflow = makeWorkflow({ initialActivity: 'planning' });
      const result = validateActivityTransition(token, workflow, 'planning');
      expect(result).toBeNull();
    });

    it('returns warning when first call skips the initialActivity', () => {
      const token = makeToken({ act: '' });
      const workflow = makeWorkflow({ initialActivity: 'planning' });
      const result = validateActivityTransition(token, workflow, 'implementation');
      expect(result).not.toBeNull();
      expect(result).toBeTypeOf('string');
      expect(result).toContain('planning');
      expect(result).toContain('implementation');
      expect(result).toContain('initialActivity');
    });

    it('does not enforce initialActivity after the first call', () => {
      const token = makeToken({ act: 'planning' });
      const workflow = makeWorkflow({ initialActivity: 'planning' });
      const result = validateActivityTransition(token, workflow, 'implementation');
      expect(result).toBeNull();
    });
  });

  describe('BF-13: toNumber coercion in condition evaluation', () => {
    it('coerces string variable to number for > comparison', () => {
      const condition: Condition = { type: 'simple', variable: 'count', operator: '>', value: 5 };
      expect(evaluateCondition(condition, { count: '10' })).toBe(true);
      expect(evaluateCondition(condition, { count: '3' })).toBe(false);
    });

    it('coerces string condition value to number for < comparison', () => {
      const condition: Condition = { type: 'simple', variable: 'score', operator: '<', value: '100' };
      expect(evaluateCondition(condition, { score: 50 })).toBe(true);
      expect(evaluateCondition(condition, { score: 150 })).toBe(false);
    });

    it('handles >= and <= with string-to-number coercion', () => {
      const gte: Condition = { type: 'simple', variable: 'x', operator: '>=', value: 10 };
      expect(evaluateCondition(gte, { x: '10' })).toBe(true);
      expect(evaluateCondition(gte, { x: '9' })).toBe(false);

      const lte: Condition = { type: 'simple', variable: 'x', operator: '<=', value: '5' };
      expect(evaluateCondition(lte, { x: 5 })).toBe(true);
      expect(evaluateCondition(lte, { x: 6 })).toBe(false);
    });

    it('returns false for non-numeric strings in numeric comparisons', () => {
      const condition: Condition = { type: 'simple', variable: 'val', operator: '>', value: 5 };
      expect(evaluateCondition(condition, { val: 'not-a-number' })).toBe(false);
    });

    it('returns false when variable is undefined in numeric comparisons', () => {
      const condition: Condition = { type: 'simple', variable: 'missing', operator: '>=', value: 0 };
      expect(evaluateCondition(condition, {})).toBe(false);
    });

    it('handles both sides as strings that are numeric', () => {
      const condition: Condition = { type: 'simple', variable: 'a', operator: '>', value: '5' };
      expect(evaluateCondition(condition, { a: '10' })).toBe(true);
      expect(evaluateCondition(condition, { a: '3' })).toBe(false);
    });

    it('uses strict equality for == (no coercion)', () => {
      const condition: Condition = { type: 'simple', variable: 'x', operator: '==', value: 5 };
      expect(evaluateCondition(condition, { x: 5 })).toBe(true);
      expect(evaluateCondition(condition, { x: '5' })).toBe(false);
    });

    it('handles exists/notExists without coercion', () => {
      const exists: Condition = { type: 'simple', variable: 'x', operator: 'exists' };
      expect(evaluateCondition(exists, { x: '0' })).toBe(true);
      expect(evaluateCondition(exists, {})).toBe(false);

      const notExists: Condition = { type: 'simple', variable: 'x', operator: 'notExists' };
      expect(evaluateCondition(notExists, {})).toBe(true);
      expect(evaluateCondition(notExists, { x: 0 })).toBe(false);
    });

    it('resolves dot-delimited variable paths for numeric comparison', () => {
      const condition: Condition = { type: 'simple', variable: 'metrics.score', operator: '>', value: 80 };
      expect(evaluateCondition(condition, { metrics: { score: '95' } })).toBe(true);
      expect(evaluateCondition(condition, { metrics: { score: '50' } })).toBe(false);
    });

    it('evaluates compound conditions with coerced numbers', () => {
      const condition: Condition = {
        type: 'and',
        conditions: [
          { type: 'simple', variable: 'min', operator: '>=', value: 1 },
          { type: 'simple', variable: 'max', operator: '<=', value: 100 },
        ],
      };
      expect(evaluateCondition(condition, { min: '5', max: '50' })).toBe(true);
      expect(evaluateCondition(condition, { min: '0', max: '50' })).toBe(false);
    });
  });

  describe('immediateExitCut: a sequence an immediate exit ended', () => {
    // An abort offered mid-sequence, and a second checkpoint inside a loop body — the two shapes
    // the cut has to read, since an immediate exit selected inside a loop ends the whole sequence.
    function makeAbortWorkflow(): Workflow {
      return {
        id: 'test-wf',
        version: '1.0.0',
        title: 'Test Workflow',
        graph: { work: { done: 'next', aborted: '__terminal__', 'give-up': '__terminal__' } },
        activities: [
          {
            id: 'work',
            version: '1.0.0',
            name: 'Work',
            exits: [
              { id: 'aborted', immediate: true },
              { id: 'give-up', immediate: true },
              { id: 'done', isDefault: true },
            ],
            steps: [
              { kind: 'technique', id: 'first-step', technique: 'grp::first-step' },
              {
                kind: 'checkpoint',
                id: 'keep-going',
                message: 'Continue?',
                options: [
                  { id: 'yes', label: 'Yes' },
                  { id: 'abort', label: 'Abort', effect: { exit: 'aborted' } },
                ],
              },
              {
                kind: 'loop',
                id: 'item-loop',
                loopType: 'forEach',
                variable: 'current_item',
                over: 'pending_items',
                steps: [
                  { kind: 'technique', id: 'process-item', technique: 'grp::process-item' },
                  { kind: 'checkpoint', id: 'still-worth-it', message: 'Still worth it?', options: [
                    { id: 'yes', label: 'Yes' },
                    { id: 'stop', label: 'Stop', effect: { exit: 'give-up' } },
                  ] },
                ],
              },
              { kind: 'technique', id: 'announce', technique: 'grp::announce' },
              { kind: 'technique', id: 'last-step', technique: 'grp::last-step' },
            ],
          },
        ],
      } as unknown as Workflow;
    }

    const responded = (checkpoint: string, optionId: string, exit: string) => ({
      [`work-${checkpoint}`]: { optionId, respondedAt: '2026-08-01T00:00:00.000Z', effects: { exit } },
    });

    it('is -1 when no immediate exit was selected', () => {
      expect(immediateExitCut(makeAbortWorkflow(), 'work', {})).toBe(-1);
      expect(immediateExitCut(makeAbortWorkflow(), 'work', responded('keep-going', 'yes', ''))).toBe(-1);
    });

    it('cuts at the checkpoint that selected the exit', () => {
      expect(immediateExitCut(makeAbortWorkflow(), 'work', responded('keep-going', 'abort', 'aborted'))).toBe(1);
    });

    it('cuts at the top-level step containing a loop-body checkpoint', () => {
      expect(immediateExitCut(makeAbortWorkflow(), 'work', responded('still-worth-it', 'stop', 'give-up'))).toBe(2);
    });

    it('reads a per-iteration instance id back to its checkpoint', () => {
      const responses = { 'work-still-worth-it#2': { optionId: 'stop', respondedAt: '2026-08-01T00:00:00.000Z', effects: { exit: 'give-up' } } };
      expect(immediateExitCut(makeAbortWorkflow(), 'work', responses)).toBe(2);
    });

    it('accounts for the steps the exit skipped instead of reporting them missing', () => {
      const manifest = [
        { step_id: 'first-step', output: 'done' },
        { step_id: 'keep-going', output: 'user aborted' },
      ];
      const workflow = makeAbortWorkflow();

      expect(validateStepManifest(manifest, workflow, 'work', responded('keep-going', 'abort', 'aborted'))).toEqual([]);
      // Without the exit the same manifest is a worker that stopped early for no stated reason.
      expect(validateStepManifest(manifest, workflow, 'work', {}).some(w => w.includes('Missing steps') && w.includes('announce'))).toBe(true);
    });

    it('still requires the steps before the cut', () => {
      const warnings = validateStepManifest(
        [{ step_id: 'keep-going', output: 'user aborted' }],
        makeAbortWorkflow(),
        'work',
        responded('keep-going', 'abort', 'aborted'),
      );
      expect(warnings.some(w => w.includes('Missing steps') && w.includes('first-step'))).toBe(true);
    });
  });

  describe('validateStepManifest: gated and loop-body steps', () => {
    function makeManifestWorkflow(): Workflow {
      return {
        id: 'test-wf',
        version: '1.0.0',
        title: 'Test Workflow',
        activities: [
          {
            id: 'work',
            version: '1.0.0',
            name: 'Work',
            steps: [
              { kind: 'technique', id: 'first-step', technique: 'grp::first-step' },
              { kind: 'technique', id: 'gated-step', technique: 'grp::gated-step', when: 'needs_gate == true' },
              {
                kind: 'checkpoint',
                id: 'conditional-gate',
                message: 'Proceed?',
                options: [{ id: 'proceed', label: 'Proceed' }],
                condition: { type: 'simple', variable: 'confirmation_needed', operator: '==', value: true },
              },
              {
                kind: 'loop',
                id: 'item-loop',
                loopType: 'forEach',
                variable: 'current_item',
                over: 'pending_items',
                steps: [
                  { kind: 'technique', id: 'process-item', technique: 'grp::process-item' },
                ],
              },
              { kind: 'technique', id: 'last-step', technique: 'grp::last-step' },
            ],
          },
        ],
      } as unknown as Workflow;
    }

    it('accepts a manifest that omits when-gated and condition-gated steps', () => {
      const warnings = validateStepManifest(
        [
          { step_id: 'first-step', output: 'done' },
          { step_id: 'item-loop', output: 'processed 3 items' },
          { step_id: 'last-step', output: 'done' },
        ],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings).toEqual([]);
    });

    it('still reports ungated steps as missing', () => {
      const warnings = validateStepManifest(
        [{ step_id: 'first-step', output: 'done' }],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings.some(w => w.includes('Missing steps') && w.includes('last-step'))).toBe(true);
      expect(warnings.some(w => w.includes('gated-step') || w.includes('conditional-gate'))).toBe(false);
    });

    it('accepts executed gated steps and loop-body step ids without warnings', () => {
      const warnings = validateStepManifest(
        [
          { step_id: 'first-step', output: 'done' },
          { step_id: 'gated-step', output: 'gate held, executed' },
          { step_id: 'conditional-gate', output: 'user chose proceed' },
          { step_id: 'item-loop', output: 'iterated' },
          { step_id: 'process-item', output: 'item 1' },
          { step_id: 'process-item', output: 'item 2' },
          { step_id: 'last-step', output: 'done' },
        ],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings).toEqual([]);
    });

    it('reports unknown step ids as unexpected', () => {
      const warnings = validateStepManifest(
        [
          { step_id: 'first-step', output: 'done' },
          { step_id: 'invented-step', output: 'done' },
          { step_id: 'item-loop', output: 'done' },
          { step_id: 'last-step', output: 'done' },
        ],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings.some(w => w.includes('Unexpected steps') && w.includes('invented-step'))).toBe(true);
    });

    it('does not report order mismatches when gated steps are skipped', () => {
      const warnings = validateStepManifest(
        [
          { step_id: 'first-step', output: 'done' },
          { step_id: 'item-loop', output: 'done' },
          { step_id: 'last-step', output: 'done' },
        ],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings.some(w => w.includes('order mismatch'))).toBe(false);
    });

    it('reports out-of-declaration-order top-level steps', () => {
      const warnings = validateStepManifest(
        [
          { step_id: 'last-step', output: 'done' },
          { step_id: 'first-step', output: 'done' },
          { step_id: 'item-loop', output: 'done' },
        ],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings.some(w => w.includes('order mismatch'))).toBe(true);
    });

    it('warns on empty step output', () => {
      const warnings = validateStepManifest(
        [
          { step_id: 'first-step', output: '  ' },
          { step_id: 'item-loop', output: 'done' },
          { step_id: 'last-step', output: 'done' },
        ],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings.some(w => w.includes("'first-step' has empty output"))).toBe(true);
    });
  });

  describe('validateTechniqueFetches (#166 B8 fidelity observability)', () => {
    function makeFetchWorkflow(): Workflow {
      return {
        id: 'test-wf',
        version: '1.0.0',
        title: 'Test Workflow',
        activities: [
          {
            id: 'work',
            version: '1.0.0',
            name: 'Work',
            steps: [
              { kind: 'technique', id: 'qualified-step', technique: 'grp::qualified-step' },
              { kind: 'technique', id: 'bare-step', technique: 'bare-step' },
              { kind: 'action', id: 'mark-progress', actions: [{ action: 'set', target: 'progress_flag', value: true }] },
              {
                kind: 'loop',
                id: 'item-loop',
                loopType: 'forEach',
                variable: 'current_item',
                over: 'pending_items',
                steps: [
                  { kind: 'technique', id: 'process-item', technique: 'grp::process-item' },
                ],
              },
            ],
          },
        ],
      } as unknown as Workflow;
    }

    const entered = (activity: string): HistoryEntry => ({
      timestamp: '2026-07-07T10:00:00.000Z',
      type: 'activity_entered',
      activity,
    });
    const fetched = (activity: string, data: { techniqueId: string; stepId?: string }): HistoryEntry => ({
      timestamp: '2026-07-07T10:01:00.000Z',
      type: 'technique_fetched',
      activity,
      data: { ...data, agentId: 'worker' },
    });
    const fullManifest = [
      { step_id: 'qualified-step', output: 'done' },
      { step_id: 'bare-step', output: 'done' },
      { step_id: 'mark-progress', output: 'done' },
      { step_id: 'item-loop', output: 'iterated' },
      { step_id: 'process-item', output: 'item 1' },
    ];

    it('warns for every manifested technique step when no fetches were recorded', () => {
      const warnings = validateTechniqueFetches(fullManifest, makeFetchWorkflow(), 'work', [entered('work')]);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('qualified-step');
      expect(warnings[0]).toContain('bare-step');
      expect(warnings[0]).toContain('process-item');
      // Action, loop, and checkpoint steps carry no technique — never flagged.
      expect(warnings[0]).not.toContain('mark-progress');
      expect(warnings[0]).not.toContain('item-loop');
    });

    it('passes when every technique step has a step-bound fetch', () => {
      const history = [
        entered('work'),
        fetched('work', { techniqueId: 'grp::qualified-step', stepId: 'qualified-step' }),
        fetched('work', { techniqueId: 'work::bare-step', stepId: 'bare-step' }),
        fetched('work', { techniqueId: 'grp::process-item', stepId: 'process-item' }),
      ];
      expect(validateTechniqueFetches(fullManifest, makeFetchWorkflow(), 'work', history)).toEqual([]);
    });

    it('credits an unbound fetch by resolved technique id, including the activity-group shorthand form', () => {
      const history = [
        entered('work'),
        // No stepId on either fetch: match must fall through to the technique id.
        fetched('work', { techniqueId: 'grp::qualified-step' }),
        // A bare authored ref resolves as `<activity>::<op>` under the group
        // shorthand — the recorded id is the resolved form.
        fetched('work', { techniqueId: 'work::bare-step' }),
        fetched('work', { techniqueId: 'grp::process-item' }),
      ];
      expect(validateTechniqueFetches(fullManifest, makeFetchWorkflow(), 'work', history)).toEqual([]);
    });

    it('checks only manifested steps', () => {
      const manifest = [{ step_id: 'qualified-step', output: 'done' }];
      const history = [
        entered('work'),
        fetched('work', { techniqueId: 'grp::qualified-step', stepId: 'qualified-step' }),
      ];
      expect(validateTechniqueFetches(manifest, makeFetchWorkflow(), 'work', history)).toEqual([]);
    });

    it('ignores fetches recorded for a different activity', () => {
      const manifest = [{ step_id: 'qualified-step', output: 'done' }];
      const history = [
        entered('work'),
        fetched('other-activity', { techniqueId: 'grp::qualified-step', stepId: 'qualified-step' }),
      ];
      const warnings = validateTechniqueFetches(manifest, makeFetchWorkflow(), 'work', history);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('qualified-step');
    });

    it('scopes fetches to the current visit — a loop-back revisit needs fresh fetches', () => {
      const manifest = [{ step_id: 'qualified-step', output: 'done' }];
      const history = [
        entered('work'),
        fetched('work', { techniqueId: 'grp::qualified-step', stepId: 'qualified-step' }),
        { timestamp: '2026-07-07T10:02:00.000Z', type: 'activity_exited', activity: 'work' } as HistoryEntry,
        entered('review'),
        entered('work'), // revisit — the earlier fetch is a previous visit's
      ];
      const warnings = validateTechniqueFetches(manifest, makeFetchWorkflow(), 'work', history);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('qualified-step');
    });

    it('returns no warning for an unknown activity or an empty manifest', () => {
      expect(validateTechniqueFetches(fullManifest, makeFetchWorkflow(), 'missing', [])).toEqual([]);
      expect(validateTechniqueFetches([], makeFetchWorkflow(), 'work', [entered('work')])).toEqual([]);
    });

    it('credits a technique_bundled delivery from a bundling activity (#166 B11)', () => {
      const bundled = (data: { techniqueId: string; stepId: string }): HistoryEntry => ({
        timestamp: '2026-07-07T10:01:00.000Z',
        type: 'technique_bundled',
        activity: 'work',
        data: { ...data, agentId: 'worker' },
      });
      const history = [
        entered('work'),
        bundled({ techniqueId: 'grp::qualified-step', stepId: 'qualified-step' }),
        bundled({ techniqueId: 'work::bare-step', stepId: 'bare-step' }),
        fetched('work', { techniqueId: 'grp::process-item', stepId: 'process-item' }),
      ];
      expect(validateTechniqueFetches(fullManifest, makeFetchWorkflow(), 'work', history)).toEqual([]);
    });

    it('PR366-TC-14: sibling agent fetch does not credit this agent (SC-11)', () => {
      const manifest = [{ step_id: 'qualified-step', output: 'done' }];
      const history = [
        entered('work'),
        {
          timestamp: '2026-07-07T10:01:00.000Z',
          type: 'technique_fetched' as const,
          activity: 'work',
          data: { techniqueId: 'grp::qualified-step', stepId: 'qualified-step', agentId: 'worker-a' },
        },
      ];
      // Without agent filter, sibling still credits (legacy).
      expect(validateTechniqueFetches(manifest, makeFetchWorkflow(), 'work', history)).toEqual([]);
      // With agent_id worker-b, worker-a's fetch does not cover.
      const warnings = validateTechniqueFetches(manifest, makeFetchWorkflow(), 'work', history, 'worker-b');
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('qualified-step');
      // Matching agent is credited.
      expect(validateTechniqueFetches(manifest, makeFetchWorkflow(), 'work', history, 'worker-a')).toEqual([]);
    });
  });

  describe('buildValidation', () => {
    it('builds valid result with no warnings', () => {
      const result = buildValidation(null, null);
      expect(result.status).toBe('valid');
      expect(result.warnings).toHaveLength(0);
    });

    it('builds warning result from non-null strings', () => {
      const result = buildValidation('problem 1', null, 'problem 2');
      expect(result.status).toBe('warning');
      expect(result.warnings).toEqual(['problem 1', 'problem 2']);
    });

  });
});
