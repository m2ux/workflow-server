import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import {
  FragmentResolutionError,
  type FragmentsLookup,
  injectCheckpointFragmentBodies,
  materializeCheckpointStep,
  materializeRuleEntries,
  parseFragmentRef,
  resolveCheckpointFragment,
  resolveRuleFragment,
  scanCheckpointRefLines,
} from '../src/loaders/fragment-resolver.js';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';
import type { CheckpointStep } from '../src/schema/activity.schema.js';
import type { WorkflowFragments } from '../src/schema/workflow.schema.js';

/**
 * Shared fragments (B10, issue #166): rule texts and checkpoint bodies declared once under a
 * workflow's `fragments` and imported by reference — `{ ref }` entries in the rules partitions,
 * `ref` on kind:checkpoint steps. Resolution mirrors the technique convention (bare name:
 * declaring workflow then meta; `workflow::name`: that workflow only) and materializes at load,
 * so agents and downstream readers only ever see plain rules and full checkpoint steps.
 */

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');

const GATE_BODY = {
  message: 'Confirm the scope.',
  options: [
    { id: 'yes', label: 'Confirmed', effect: { setVariable: { scope_confirmed: true } } },
    { id: 'no', label: 'Revise' },
  ],
  blocking: true,
};

const lookupFrom = (map: Record<string, WorkflowFragments>): FragmentsLookup => (id) => map[id];

const LOOKUP = lookupFrom({
  'current-wf': { rules: { 'local-rule': 'Local rule text' }, checkpoints: { 'local-gate': GATE_BODY } },
  meta: { rules: { 'meta-rule': 'Meta rule text', 'local-rule': 'Shadowed by current-wf' } },
  'other-wf': { rules: { 'other-rule': ['First shared rule', 'Second shared rule'] } },
});

describe('parseFragmentRef', () => {
  it('splits bare and qualified refs, rejecting deeper nesting', () => {
    expect(parseFragmentRef('interaction-discipline')).toEqual({ name: 'interaction-discipline' });
    expect(parseFragmentRef('work-package::interaction-discipline')).toEqual({ workflowId: 'work-package', name: 'interaction-discipline' });
    expect(() => parseFragmentRef('a::b::c')).toThrow(FragmentResolutionError);
  });
});

describe('resolveRuleFragment', () => {
  it('resolves a bare ref against the declaring workflow before meta', () => {
    expect(resolveRuleFragment(LOOKUP, 'current-wf', 'local-rule')).toEqual(['Local rule text']);
    expect(resolveRuleFragment(LOOKUP, 'current-wf', 'meta-rule')).toEqual(['Meta rule text']);
  });

  it('resolves a qualified ref only in the named workflow — no meta fallback', () => {
    expect(resolveRuleFragment(LOOKUP, 'current-wf', 'other-wf::other-rule')).toEqual(['First shared rule', 'Second shared rule']);
    expect(() => resolveRuleFragment(LOOKUP, 'current-wf', 'other-wf::meta-rule')).toThrow(/Unresolved rule fragment/);
  });

  it('splices refs in place among inline rules', () => {
    expect(materializeRuleEntries(['Inline first', { ref: 'other-wf::other-rule' }, 'Inline last'], LOOKUP, 'current-wf'))
      .toEqual(['Inline first', 'First shared rule', 'Second shared rule', 'Inline last']);
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
    expect(step.blocking).toBe(true);
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
  it('work-package rules splice the interaction-discipline fragment in place', async () => {
    const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
    expect(result.success).toBe(true);
    if (!result.success) return;
    const rules = result.value.rules?.workflow ?? [];
    expect(rules.slice(0, 3)).toEqual([
      "Ask, don't assume - Clarify requirements before acting",
      'Summarize, then proceed - Provide brief status before asking to continue',
      'One task at a time - Complete current work before starting new work',
    ]);
    expect(rules.every((r) => typeof r === 'string')).toBe(true);
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
    for (const [activityId, checkpointId] of sites) {
      const activity = result.value.activities?.find((a) => a.id === activityId);
      expect(activity, activityId).toBeDefined();
      const steps = JSON.stringify(activity);
      expect(steps).toContain(checkpointId);
      expect(steps).toContain('Can you resolve this, or defer to stakeholders?');
      expect(steps).not.toContain('"ref"');
    }
  });

  it('resolves cross-workflow refs for a borrowing workflow (remediate-vuln)', async () => {
    const result = await loadWorkflow(WORKFLOW_DIR, 'remediate-vuln');
    expect(result.success).toBe(true);
    if (!result.success) return;
    const rules = result.value.rules?.workflow ?? [];
    expect(rules).toContain("Ask, don't assume - Clarify requirements before acting");
    // Borrowed work-package activity: its bare ref resolves against work-package, not the borrower.
    const research = result.value.activities?.find((a) => a.id === 'research');
    expect(JSON.stringify(research)).toContain('Can you resolve this, or defer to stakeholders?');
  });
});
