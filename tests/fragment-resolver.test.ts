import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import {
  FragmentResolutionError,
  type FragmentsLookup,
  injectCheckpointFragmentBodies,
  materializeCheckpointStep,
  parseFragmentRef,
  resolveCheckpointFragment,
  scanCheckpointRefLines,
} from '../src/loaders/fragment-resolver.js';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';
import type { CheckpointStep } from '../src/schema/activity.schema.js';
import { safeValidateWorkflow, type WorkflowFragments } from '../src/schema/workflow.schema.js';
import { corpusRoot } from './corpus-root.js';

/**
 * Shared fragments (B10, issue #166): a checkpoint body declared once under a workflow's
 * `fragments.checkpoints` and imported by `ref` on a kind:checkpoint step. Resolution mirrors the
 * technique convention (bare name: declaring workflow then meta; `workflow::name`: that workflow
 * only) and materializes at load, so agents and downstream readers only ever see full checkpoint
 * steps. Rule text is not shared this way — its home is a conduct technique (#519).
 */

const WORKFLOW_DIR = corpusRoot();

/**
 * The declared body of a checkpoint fragment, read from the corpus itself. Materialization
 * assertions compare against this rather than a transcribed sentence, so they prove the body
 * was inlined without breaking when the corpus rewords it.
 */
function fragmentCheckpointMessage(workflowId: string, fragmentName: string): string {
  const wf = parse(readFileSync(join(WORKFLOW_DIR, workflowId, 'workflow.yaml'), 'utf8')) as {
    fragments?: { checkpoints?: Record<string, { message?: string }> };
  };
  const message = wf.fragments?.checkpoints?.[fragmentName]?.message;
  if (!message) throw new Error(`No checkpoint fragment '${fragmentName}' in ${workflowId}/workflow.yaml`);
  return message;
}

const GATE_BODY = {
  message: 'Confirm the scope.',
  options: [
    { id: 'yes', label: 'Confirmed', effect: { setVariable: { scope_confirmed: true } } },
    { id: 'no', label: 'Revise' },
  ],
  defaultOption: 'yes',
  autoAdvanceMs: 30000,
};

const lookupFrom = (map: Record<string, WorkflowFragments>): FragmentsLookup => (id) => map[id];

const LOOKUP = lookupFrom({
  'current-wf': { checkpoints: { 'local-gate': GATE_BODY } },
  meta: { checkpoints: { 'meta-gate': GATE_BODY, 'local-gate': { ...GATE_BODY, message: 'Shadowed by current-wf' } } },
  'other-wf': { checkpoints: { 'other-gate': GATE_BODY } },
});

describe('parseFragmentRef', () => {
  it('splits bare and qualified refs, rejecting deeper nesting', () => {
    expect(parseFragmentRef('interaction-discipline')).toEqual({ name: 'interaction-discipline' });
    expect(parseFragmentRef('work-package::interaction-discipline')).toEqual({ workflowId: 'work-package', name: 'interaction-discipline' });
    expect(() => parseFragmentRef('a::b::c')).toThrow(FragmentResolutionError);
  });
});

describe('resolveCheckpointFragment addressing', () => {
  it('resolves a bare ref against the declaring workflow before meta', () => {
    expect(resolveCheckpointFragment(LOOKUP, 'current-wf', 'local-gate').message).toBe(GATE_BODY.message);
    expect(resolveCheckpointFragment(LOOKUP, 'current-wf', 'meta-gate').message).toBe(GATE_BODY.message);
  });

  it('resolves a qualified ref only in the named workflow — no meta fallback', () => {
    expect(resolveCheckpointFragment(LOOKUP, 'current-wf', 'other-wf::other-gate').message).toBe(GATE_BODY.message);
    expect(() => resolveCheckpointFragment(LOOKUP, 'current-wf', 'other-wf::meta-gate')).toThrow(/Unresolved checkpoint fragment/);
  });

  it('rejects a rules bucket carrying a reference — a rule has no fragment form', () => {
    const workflow = {
      id: 'ref-in-rules',
      version: '1.0.0',
      title: 'Rules ref',
      rules: { workflow: [{ ref: 'some-name' }] },
      activities: [{ id: 'a', version: '1.0.0', name: 'A', techniques: ['t'] }],
    };
    expect(safeValidateWorkflow(workflow).success).toBe(false);
  });
});

describe('materializeCheckpointStep', () => {
  const refStep = (extra: Partial<CheckpointStep> = {}): CheckpointStep =>
    ({ kind: 'checkpoint', id: 'the-gate', ref: 'local-gate', ...extra }) as CheckpointStep;

  it('copies the fragment body onto the step and drops the ref', () => {
    const step = refStep();
    materializeCheckpointStep(step, LOOKUP, 'current-wf', 'test');
    expect(step.ref).toBeUndefined();
    expect(step.message).toBe('Confirm the scope.');
    expect(step.defaultOption).toBe('yes');
    expect(step.autoAdvanceMs).toBe(30000);
    expect(step.options).toHaveLength(2);
    expect(step.options).not.toBe(GATE_BODY.options); // cloned, not shared across sites
  });

  it('keeps a site-local condition when the fragment declares none', () => {
    const condition = { type: 'simple' as const, variable: 'x_ready', operator: '==' as const, value: true };
    const step = refStep({ condition });
    materializeCheckpointStep(step, LOOKUP, 'current-wf', 'test');
    expect(step.condition).toEqual(condition);
  });

  it('rejects a ref step that carries body fields, and both-sides conditions', () => {
    expect(() => materializeCheckpointStep(refStep({ message: 'inline too' }), LOOKUP, 'current-wf', 'test'))
      .toThrow(/single home/);
    const conditionedLookup = lookupFrom({
      'current-wf': { checkpoints: { 'local-gate': { ...GATE_BODY, condition: { type: 'simple', variable: 'a_b', operator: '==', value: 1 } } } },
    });
    const step = refStep({ condition: { type: 'simple', variable: 'c_d', operator: '==', value: 2 } });
    expect(() => materializeCheckpointStep(step, conditionedLookup, 'current-wf', 'test')).toThrow(/exactly one place/);
  });

  it('rejects an inline checkpoint with neither ref nor body', () => {
    const step = { kind: 'checkpoint', id: 'empty' } as CheckpointStep;
    expect(() => materializeCheckpointStep(step, LOOKUP, 'current-wf', 'test')).toThrow(/neither a fragment ref nor a full body/);
  });

  // Softness is the defaultOption + autoAdvanceMs pair, so half a pair names either an answer the
  // server will never apply or a wait with nothing to take. A checkpoint step is a
  // discriminated-union member, which a Zod refinement cannot be, so the loader holds the invariant.
  describe('softness is declared as a pair', () => {
    const inlineStep = (extra: Partial<CheckpointStep>): CheckpointStep =>
      ({
        kind: 'checkpoint', id: 'the-gate', message: 'Proceed.',
        options: [{ id: 'go', label: 'Go' }, { id: 'stop', label: 'Stop' }],
        ...extra,
      }) as CheckpointStep;

    it('rejects an inline default with no interval', () => {
      expect(() => materializeCheckpointStep(inlineStep({ defaultOption: 'go' }), LOOKUP, 'current-wf', 'test'))
        .toThrow(/declares defaultOption without autoAdvanceMs/);
    });

    it('rejects an inline interval with no default', () => {
      expect(() => materializeCheckpointStep(inlineStep({ autoAdvanceMs: 30000 }), LOOKUP, 'current-wf', 'test'))
        .toThrow(/declares autoAdvanceMs without defaultOption/);
    });

    it('accepts both, and neither', () => {
      expect(() => materializeCheckpointStep(inlineStep({ defaultOption: 'go', autoAdvanceMs: 30000 }), LOOKUP, 'current-wf', 'test')).not.toThrow();
      expect(() => materializeCheckpointStep(inlineStep({}), LOOKUP, 'current-wf', 'test')).not.toThrow();
    });

    it('holds the same invariant on a fragment body a ref step materializes', () => {
      const halfPair = lookupFrom({
        'current-wf': { checkpoints: { 'local-gate': { message: 'Confirm.', options: GATE_BODY.options, defaultOption: 'yes' } } },
      });
      expect(() => materializeCheckpointStep(refStep(), halfPair, 'current-wf', 'test'))
        .toThrow(/declares defaultOption without autoAdvanceMs/);
    });
  });
});

describe('injectCheckpointFragmentBodies (raw-YAML delivery)', () => {
  const RAW = `id: sample
steps:
  - kind: loop
    id: review-loop
    loopType: while
    steps:
      - kind: checkpoint
        id: gate-site
        ref: local-gate
  - kind: technique
    id: unrelated
    technique:
      name: group::op
      inputs:
        ref: not-a-fragment-ref
`;

  it('replaces the ref line inside a checkpoint step, leaves other lines byte-identical', () => {
    const out = injectCheckpointFragmentBodies(RAW, (ref) => resolveCheckpointFragment(LOOKUP, 'current-wf', ref));
    expect(out).toContain('ref: not-a-fragment-ref'); // non-checkpoint ref untouched
    expect(out).not.toMatch(/ref: local-gate/);
    const parsed = parse(out) as { steps: Array<{ steps?: Array<Record<string, unknown>> }> };
    const gate = parsed.steps[0]!.steps![0]!;
    expect(gate['id']).toBe('gate-site');
    expect(gate['message']).toBe('Confirm the scope.');
    expect((gate['options'] as unknown[]).length).toBe(2);
    // Everything outside the replaced line is unchanged.
    expect(out.split('\n').slice(0, 8)).toEqual(RAW.split('\n').slice(0, 8));
  });

  it('pre-scan finds candidate ref lines without a parse', () => {
    expect(scanCheckpointRefLines(RAW)).toEqual(['local-gate', 'not-a-fragment-ref']);
    expect(scanCheckpointRefLines('id: x\nsteps: []\n')).toEqual([]);
  });
});

describe('loader materialization over the corpus', () => {
  it('delivers plain rule strings — no rules bucket in the corpus carries a reference', async () => {
    for (const workflowId of ['work-package', 'prism', 'remediate-vuln']) {
      const result = await loadWorkflow(WORKFLOW_DIR, workflowId);
      expect(result.success, workflowId).toBe(true);
      if (!result.success) continue;
      const buckets = [result.value.rules?.workflow, result.value.rules?.activity, result.value.rules?.universal];
      for (const bucket of buckets) {
        expect((bucket ?? []).every((r) => typeof r === 'string'), workflowId).toBe(true);
      }
    }
  });

  it('materializes the assumption-interview fragment at all three sites', async () => {
    const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
    expect(result.success).toBe(true);
    if (!result.success) return;
    const sites: Array<[string, string]> = [
      ['research', 'research-assumption-interview'],
      ['implementation-analysis', 'analysis-assumption-interview'],
      ['implement', 'implementation-assumption-interview'],
    ];
    const fragmentMessage = fragmentCheckpointMessage('work-package', 'assumption-interview');
    for (const [activityId, checkpointId] of sites) {
      const activity = result.value.activities?.find((a) => a.id === activityId);
      expect(activity, activityId).toBeDefined();
      const steps = JSON.stringify(activity);
      expect(steps).toContain(checkpointId);
      expect(steps, activityId).toContain(JSON.stringify(fragmentMessage).slice(1, -1));
      expect(steps).not.toContain('"ref"');
    }
  });

  it('resolves cross-workflow refs for a borrowing workflow (remediate-vuln)', async () => {
    const result = await loadWorkflow(WORKFLOW_DIR, 'remediate-vuln');
    expect(result.success).toBe(true);
    if (!result.success) return;
    // Borrowed work-package activity: its bare ref resolves against work-package, not the borrower.
    const research = result.value.activities?.find((a) => a.id === 'research');
    const fragmentMessage = fragmentCheckpointMessage('work-package', 'assumption-interview');
    expect(JSON.stringify(research)).toContain(JSON.stringify(fragmentMessage).slice(1, -1));
  });
});
