import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  AMBIENT_CONTEXT_IDS,
  PROVENANCE_NOTE,
  INHERITED_SOURCE_POLICY,
  buildProvenanceContext,
  decorateTechniqueProvenance,
  resolveInputSource,
  resolveOutputDestination,
  type ProvenanceContext,
} from '../src/utils/binding-provenance.js';
import type { Technique } from '../src/schema/technique.schema.js';
import type { Workflow } from '../src/schema/workflow.schema.js';
import type { TechniqueBinding } from '../src/schema/activity.schema.js';

/** A context with one prior output, one checkpoint setter, and one later producer. */
function makeCtx(overrides?: Partial<ProvenanceContext>): ProvenanceContext {
  return {
    declaredVariables: new Set(['target_path', 'branch_name']),
    producers: [
      { name: 'analysis_report', via: 'output', stepId: 'gather', activityId: 'alpha', ordinal: 0 },
      { name: 'approved', via: 'checkpoint', stepId: 'confirm', activityId: 'alpha', ordinal: 1 },
      { name: 'late_value', via: 'output', stepId: 'later-step', activityId: 'gamma', ordinal: 9 },
    ],
    position: 5,
    ...(overrides ?? {}),
  };
}

const REQUIRED = { hasDefault: false, optional: false, inherited: false };

describe('resolveInputSource', () => {
  const ctx = makeCtx();

  it('resolves a declared workflow variable statically (no session-state claims)', () => {
    for (const name of ['target_path', 'branch_name']) {
      const r = resolveInputSource(name, ctx, undefined, REQUIRED);
      expect(r.source).toBe(`workflow variable '${name}' (declared)`);
      expect(r.unresolved).toBe(false);
      expect(r.kind).toBe('declared');
    }
  });

  it('resolves a prior step output', () => {
    const r = resolveInputSource('analysis_report', ctx, undefined, REQUIRED);
    expect(r.source).toBe("output of step 'gather' (activity 'alpha')");
    expect(r.kind).toBe('prior');
  });

  it('resolves a checkpoint-set variable', () => {
    const r = resolveInputSource('approved', ctx, undefined, REQUIRED);
    expect(r.source).toBe("set by checkpoint 'confirm' (activity 'alpha')");
    expect(r.kind).toBe('prior');
  });

  it('reports a producer positioned after the current step as not yet available', () => {
    const r = resolveInputSource('late_value', ctx, undefined, REQUIRED);
    expect(r.unresolved).toBe(false);
    expect(r.kind).toBe('later');
    expect(r.source).toContain('produced later in the workflow');
  });

  it('combines a declared variable with its later producer', () => {
    const declaredLater = makeCtx({ declaredVariables: new Set(['late_value']) });
    const r = resolveInputSource('late_value', declaredLater, undefined, REQUIRED);
    expect(r.kind).toBe('declared-later');
    expect(r.source).toContain("workflow variable 'late_value' (declared;");
    expect(r.source).toContain('produced later in the workflow');
  });

  it('flags a required own input with no source as UNRESOLVED', () => {
    const r = resolveInputSource('nonexistent', ctx, undefined, REQUIRED);
    expect(r.unresolved).toBe(true);
    expect(r.kind).toBe('unresolved');
    expect(r.source).toMatch(/^UNRESOLVED/);
  });

  it('falls back to a declared default without warning', () => {
    const r = resolveInputSource('nonexistent', ctx, undefined, { ...REQUIRED, hasDefault: true });
    expect(r.source).toBe('declared default on the input (no session producer)');
    expect(r.unresolved).toBe(false);
    expect(r.kind).toBe('default');
  });

  it('treats an "(optional)" input without producer as supplied from working context', () => {
    const r = resolveInputSource('nonexistent', ctx, undefined, { ...REQUIRED, optional: true });
    expect(r.unresolved).toBe(false);
    expect(r.kind).toBe('optional');
    expect(r.source).toContain('optional input');
  });

  it('treats an inherited input without producer as ambient session context', () => {
    const r = resolveInputSource('nonexistent', ctx, undefined, { ...REQUIRED, inherited: true });
    expect(r.unresolved).toBe(false);
    expect(r.kind).toBe('inherited-ambient');
    expect(r.source).toContain('ambient session context');
  });

  it('recognizes ambient runtime ids', () => {
    for (const id of AMBIENT_CONTEXT_IDS) {
      const r = resolveInputSource(id, ctx, undefined, REQUIRED);
      expect(r.unresolved).toBe(false);
      expect(r.kind).toBe('ambient');
      expect(r.source).toContain('ambient context');
    }
  });

  describe('step-binding entries', () => {
    it('reports a non-string value as a literal', () => {
      const binding: TechniqueBinding = { name: 'op', inputs: { count: 3, flag: true } };
      expect(resolveInputSource('count', ctx, binding, REQUIRED).source).toBe('step-binding literal 3');
      expect(resolveInputSource('flag', ctx, binding, REQUIRED).source).toBe('step-binding literal true');
      expect(resolveInputSource('count', ctx, binding, REQUIRED).kind).toBe('binding');
    });

    it('resolves an exact {token} through the bag', () => {
      const binding: TechniqueBinding = { name: 'op', inputs: { notes: '{analysis_report}' } };
      const r = resolveInputSource('notes', ctx, binding, REQUIRED);
      expect(r.source).toBe("step-binding: output of step 'gather' (activity 'alpha')");
      expect(r.unresolved).toBe(false);
      expect(r.kind).toBe('binding');
    });

    it('flags an exact {token} with no producer', () => {
      const binding: TechniqueBinding = { name: 'op', inputs: { notes: '{missing}' } };
      const r = resolveInputSource('notes', ctx, binding, REQUIRED);
      expect(r.unresolved).toBe(true);
      expect(r.source).toContain("no producer for 'missing'");
    });

    it('reports a template value and its unresolvable tokens', () => {
      const binding: TechniqueBinding = { name: 'op', inputs: { entity: 'a={target_path}; b={missing}' } };
      const r = resolveInputSource('entity', ctx, binding, REQUIRED);
      expect(r.unresolved).toBe(true);
      expect(r.source).toContain('step-binding template');
      expect(r.source).toContain("'{missing}'");
      expect(r.source).not.toContain("'{target_path}'");
    });

    it('resolves a bare value that names a bag entry as a rename', () => {
      const binding: TechniqueBinding = { name: 'op', inputs: { notes: 'analysis_report' } };
      const r = resolveInputSource('notes', ctx, binding, REQUIRED);
      expect(r.source).toBe("step-binding: output of step 'gather' (activity 'alpha')");
    });

    it('reports an unmatched bare value as the literal it most likely is', () => {
      const binding: TechniqueBinding = { name: 'op', inputs: { mode: 'server-only' } };
      const r = resolveInputSource('mode', ctx, binding, REQUIRED);
      expect(r.source).toBe('step-binding literal "server-only"');
      expect(r.unresolved).toBe(false);
    });
  });
});

describe('resolveOutputDestination', () => {
  it('names the remap target and stays silent for unremapped outputs', () => {
    const binding: TechniqueBinding = { name: 'op', outputs: { record_log: 'final_log' } };
    expect(resolveOutputDestination('record_log', binding)).toBe("lands as session variable 'final_log' (step-binding remap)");
    expect(resolveOutputDestination('other', binding)).toBeUndefined();
    expect(resolveOutputDestination('record_log', undefined)).toBeUndefined();
  });
});

describe('decorateTechniqueProvenance', () => {
  const technique: Technique = {
    id: 'record',
    version: '1.0.0',
    capability: 'Record analysis results.',
    inputs: [
      { id: 'analysis_report', description: 'The report to record.' },
      { id: 'missing_value', description: 'A value nothing produces.' },
      { id: 'spare_notes', description: '*(optional)* Extra notes.' },
    ],
    inherited_inputs: {
      note: 'shared contract',
      items: [
        { id: 'unproduced_contract_input', description: 'Ambient.' },
        { id: 'analysis_report', description: 'Settled prior producer.' },
        { id: 'late_value', description: 'Produced later.' },
      ],
    },
    outputs: [{ id: 'record_log', description: 'The log.' }, { id: 'record_summary' }],
  };
  const binding: TechniqueBinding = { name: 'record', outputs: { record_log: 'final_log' } };

  it('annotates own inputs always, inherited only where noteworthy, and warns only on own UNRESOLVED', () => {
    const ctx = makeCtx();
    const { technique: decorated, warnings } = decorateTechniqueProvenance(technique, ctx, binding, 'beta::record', 'record');

    expect(decorated.provenance_note).toBe(PROVENANCE_NOTE);
    expect(decorated.inputs?.[0]?.source).toBe("output of step 'gather' (activity 'alpha')");
    expect(decorated.inputs?.[1]?.source).toMatch(/^UNRESOLVED/);
    expect(decorated.inputs?.[2]?.source).toContain('optional input');
    // Inherited: ambient fallback and settled prior producer stay bare (the block note covers
    // them); only the later-produced entry says something the note does not.
    expect(decorated.inherited_inputs?.items[0]?.source).toBeUndefined();
    expect(decorated.inherited_inputs?.items[1]?.source).toBeUndefined();
    expect(decorated.inherited_inputs?.items[2]?.source).toContain('produced later in the workflow');
    // C5 (R6): the noteworthy-only policy is stated on the block note, so a bare inherited entry
    // reads as ordinary scope rather than a missing/ambiguous value.
    expect(decorated.inherited_inputs?.note).toBe(`shared contract ${INHERITED_SOURCE_POLICY}`);
    expect(decorated.outputs?.[0]?.destination).toBe("lands as session variable 'final_log' (step-binding remap)");
    expect(decorated.outputs?.[1]?.destination).toBeUndefined();

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("'missing_value'");
    expect(warnings[0]).toContain("'beta::record'");

    // The composed technique object is shared state on some paths — decoration must not mutate it.
    expect(technique.provenance_note).toBeUndefined();
    expect(technique.inputs?.[0]?.source).toBeUndefined();
    expect(technique.outputs?.[0]?.destination).toBeUndefined();
    expect(technique.inherited_inputs?.note).toBe('shared contract');
  });

  it('PROVENANCE_NOTE specifies the multi-output manifest encoding and a conditional destination (C4)', () => {
    // Multiple outputs → a JSON object keyed by output id; destination is cited only as a
    // remapped-output condition, never as an always-present field.
    expect(PROVENANCE_NOTE).toContain('JSON object keyed by output id');
    expect(PROVENANCE_NOTE).toContain('step-manifest `output`');
    expect(PROVENANCE_NOTE).toContain('shown only on a remapped output');
  });
});

describe('buildProvenanceContext', () => {
  let workflowDir: string;

  beforeAll(() => {
    workflowDir = mkdtempSync(join(tmpdir(), 'wf-provenance-test-'));
    const tdir = join(workflowDir, 'testwf', 'techniques');
    mkdirSync(join(tdir, 'intake'), { recursive: true });
    const op = (capability: string, body: string): string =>
      `---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\n${capability}\n\n${body}`;
    writeFileSync(join(tdir, 'gather.md'), op('Gather.', '## Outputs\n\n### analysis_report\n\nThe report.\n\n## Protocol\n\n### 1. Go\n\n- Gather it.\n'));
    writeFileSync(join(tdir, 'record.md'), op('Record.', '## Inputs\n\n### analysis_report\n\nThe report.\n\n## Outputs\n\n### record_log\n\nThe log.\n\n### record_summary\n\nThe summary.\n\n## Protocol\n\n### 1. Go\n\n- Record it.\n'));
    writeFileSync(join(tdir, 'intake', 'classify.md'), op('Classify.', '## Outputs\n\n### classified_intake\n\nThe classification.\n\n## Protocol\n\n### 1. Go\n\n- Classify it.\n'));
  });

  afterAll(() => {
    try { rmSync(workflowDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  const workflow = (): Workflow => ({
    id: 'testwf',
    version: '1.0.0',
    title: 'Test workflow',
    variables: [{ name: 'target_path', type: 'string', required: false }],
    activities: [
      {
        id: 'intake', version: '1.0.0', name: 'Intake', required: true,
        steps: [
          // Bare op ref resolving through the activity-group shorthand (`intake::classify`).
          { kind: 'technique', id: 'classify', technique: 'classify', required: true },
          {
            kind: 'checkpoint', id: 'confirm', message: 'Proceed?', required: true,
            options: [{ id: 'yes', label: 'Yes', effect: { setVariable: { approved: true } } }],
          },
        ],
      },
      {
        id: 'work', version: '1.0.0', name: 'Work', required: true,
        steps: [
          { kind: 'technique', id: 'gather', technique: 'gather', required: true },
          {
            kind: 'technique', id: 'record', required: true,
            technique: { name: 'record', inputs: { analysis_report: '{analysis_report}' }, outputs: { record_log: 'final_log' } },
          },
        ],
      },
    ],
  });

  it('collects producers in document order and locates the current step', async () => {
    const ctx = await buildProvenanceContext({
      workflow: workflow(),
      workflowDir,
      currentActivityId: 'work',
      currentStepId: 'record',
    });
    expect(ctx).not.toBeNull();
    expect(ctx!.position).toBe(3);
    expect(ctx!.declaredVariables.has('target_path')).toBe(true);

    const byName = new Map(ctx!.producers.map((p) => [p.name, p]));
    // Activity-group shorthand op contributes its own output.
    expect(byName.get('classified_intake')).toMatchObject({ via: 'output', stepId: 'classify', activityId: 'intake', ordinal: 0 });
    expect(byName.get('approved')).toMatchObject({ via: 'checkpoint', stepId: 'confirm', ordinal: 1 });
    expect(byName.get('analysis_report')).toMatchObject({ via: 'output', stepId: 'gather', activityId: 'work', ordinal: 2 });
    // The remapped output lands under the remap target; its original id is not produced.
    expect(byName.get('final_log')).toMatchObject({ via: 'remap', origOutputId: 'record_log', stepId: 'record', ordinal: 3 });
    expect(byName.has('record_log')).toBe(false);
    // Unremapped outputs of the same op are still produced.
    expect(byName.get('record_summary')).toMatchObject({ via: 'output', stepId: 'record', ordinal: 3 });
  });

  it('returns null when the step cannot be located', async () => {
    const ctx = await buildProvenanceContext({
      workflow: workflow(),
      workflowDir,
      currentActivityId: 'work',
      currentStepId: 'no-such-step',
    });
    expect(ctx).toBeNull();
  });

  it('end-to-end: a prior output feeds the bound input through the binding token', async () => {
    const ctx = await buildProvenanceContext({
      workflow: workflow(),
      workflowDir,
      currentActivityId: 'work',
      currentStepId: 'record',
    });
    const binding: TechniqueBinding = { name: 'record', inputs: { analysis_report: '{analysis_report}' } };
    const r = resolveInputSource('analysis_report', ctx!, binding, REQUIRED);
    expect(r.source).toBe("step-binding: output of step 'gather' (activity 'work')");
    expect(r.unresolved).toBe(false);
  });
});
