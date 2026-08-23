import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { createInitialSessionFile, type SessionFile } from '../src/schema/session.schema.js';
import {
  contentHash,
  dedupTechniqueBlocks,
  deliveredHash,
  recordDeliveries,
  unchangedMarker,
} from '../src/utils/delivery.js';
import {
  canonicalTechniqueId,
  composeTechniqueWithSource,
  projectTechnique,
  projectTechniqueToYaml,
} from '../src/loaders/technique-loader.js';
import { decorateTechniqueProvenance, type ProvenanceContext } from '../src/utils/binding-provenance.js';

/**
 * A folded callee is keyed as a technique (SC-7a) and its call-site annotations are keyed apart from
 * its body (PR466-TC-17), so one operation reaching one agent context by two routes arrives once.
 */

const FM = ['---', 'metadata:', '  version: 1.0.0', '---', ''];

function session(): SessionFile {
  return createInitialSessionFile({
    sessionIndex: 'AAAAAA',
    workflowId: 'alpha',
    workflowVersion: '1.0.0',
    agentId: 'orchestrator',
  });
}

/** A provenance context with nothing in it — a call site binds no arguments. */
const emptyContext: ProvenanceContext = { declaredVariables: new Set(), producers: [], position: 0 };

describe('folded-callee delivery keying', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'delivery-'));
    const beta = join(dir, 'beta', 'techniques');
    await mkdir(join(beta, 'grp'), { recursive: true });
    await writeFile(
      join(beta, 'TECHNIQUE.md'),
      [...FM, '## Capability', '', 'Beta root.', '', '## Inputs', '', '### beta_input', '',
        'Declared by the root.', '', '## Rules', '', '### beta-root-rule', '',
        'The root obligation.', ''].join('\n'),
      'utf-8',
    );
    await writeFile(
      join(beta, 'grp', 'TECHNIQUE.md'),
      [...FM, '## Capability', '', 'Group.', '', '## Outputs', '', '### grp_output', '',
        'Declared by the group.', '', '## Rules', '', '### grp-rule', '',
        'The group obligation.', ''].join('\n'),
      'utf-8',
    );
    await writeFile(
      join(beta, 'grp', 'op.md'),
      [...FM, '## Capability', '', 'The operation.', '', '## Inputs', '', '### op_input', '',
        'Own input.', '', '## Protocol', '', '1. Do it.', '',
        '## Outputs', '', '### op_output', '', 'Own output.', ''].join('\n'),
      'utf-8',
    );
    // A second workflow, so one spelling can reach the operation across a tree boundary.
    await mkdir(join(dir, 'alpha', 'techniques'), { recursive: true });
    await writeFile(
      join(dir, 'alpha', 'techniques', 'TECHNIQUE.md'),
      [...FM, '## Capability', '', 'Alpha root.', ''].join('\n'),
      'utf-8',
    );
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('gives one operation one identity whichever spelling reaches it', async () => {
    // The spelling a folded call site yields, and the spelling a step inside beta binds.
    const asFolded = await composeTechniqueWithSource('beta::grp::op', dir, 'alpha');
    const asStep = await composeTechniqueWithSource('grp::op', dir, 'beta');
    expect(asFolded.success && asStep.success).toBe(true);
    if (asFolded.success && asStep.success) {
      expect(asFolded.value.canonicalId).toBe('beta::grp::op');
      expect(asStep.value.canonicalId).toBe(asFolded.value.canonicalId);
      expect(canonicalTechniqueId(asStep.value.sourceWorkflowId, ['grp', 'op'])).toBe('beta::grp::op');
    }
  });

  it('PR466-TC-16: the same operation arriving both ways in one context yields one body', async () => {
    const state = session();
    const scope = 'worker-1';

    const asStep = await composeTechniqueWithSource('grp::op', dir, 'beta');
    expect(asStep.success).toBe(true);
    if (!asStep.success) return;

    // First route: a step-bound delivery records the body against the operation's identity.
    const key = `technique:${asStep.value.canonicalId}`;
    const text = projectTechniqueToYaml(asStep.value.technique);
    recordDeliveries(state, scope, { [key]: contentHash(text) });

    // Second route: a folded call site names the same operation by a different spelling.
    const asFolded = await composeTechniqueWithSource('beta::grp::op', dir, 'alpha');
    expect(asFolded.success).toBe(true);
    if (!asFolded.success) return;

    const foldedKey = `technique:${asFolded.value.canonicalId}`;
    const foldedText = projectTechniqueToYaml(asFolded.value.technique);
    expect(foldedKey).toBe(key);
    // Byte-identical composition, so the ledger recognises it and one body has arrived, not two.
    expect(contentHash(foldedText)).toBe(contentHash(text));
    expect(deliveredHash(state, foldedKey, scope)).toBe(contentHash(foldedText));
  });

  it('keys a delivery per agent context, so one worker never receives another worker body marker', async () => {
    const state = session();
    const composed = await composeTechniqueWithSource('grp::op', dir, 'beta');
    expect(composed.success).toBe(true);
    if (!composed.success) return;

    const key = `technique:${composed.value.canonicalId}`;
    recordDeliveries(state, 'worker-1', { [key]: 'abc123' });
    expect(deliveredHash(state, key, 'worker-1')).toBe('abc123');
    expect(deliveredHash(state, key, 'worker-2')).toBeUndefined();
  });

  describe('PR466-TC-17: call-site annotations are keyed apart from the callee body', () => {
    it('leaves the callee body untouched and states the call scope on the inherited rules', async () => {
      const composed = await composeTechniqueWithSource('beta::grp::op', dir, 'alpha');
      expect(composed.success).toBe(true);
      if (!composed.success) return;
      const body = composed.value.technique;

      const { technique: decorated } = decorateTechniqueProvenance(
        body, emptyContext, { kind: 'call', caller: 'alpha::caller', line: 7 }, 'beta::grp::op',
      );

      // The body is what it was: the annotation adds scope, it does not rewrite the operation.
      expect(decorated.capability).toBe(body.capability);
      expect(decorated.protocol).toEqual(body.protocol);
      expect(decorated.inherited_rules?.items).toEqual(body.inherited_rules?.items);
      // The scope of the obligation is stated, and named to the call.
      expect(decorated.inherited_rules?.scoped_to).toContain('line 7');
      expect(decorated.inherited_rules?.scoped_to).toContain('alpha::caller');
      expect(decorated.inherited_rules?.note).toContain('not beyond it');
    });

    it('carries no call scope on a step-bound delivery, whose scope is the step', async () => {
      const composed = await composeTechniqueWithSource('grp::op', dir, 'beta');
      expect(composed.success).toBe(true);
      if (!composed.success) return;

      const { technique: decorated } = decorateTechniqueProvenance(
        composed.value.technique, emptyContext, { kind: 'step', stepId: 'run', binding: undefined }, 'grp::op',
      );
      expect(decorated.inherited_rules?.scoped_to).toBeUndefined();
      expect(decorated.inherited_rules?.items).toEqual(composed.value.technique.inherited_rules?.items);
    });

    it('collapses the inherited rule items across two call sites while each keeps its own scope', async () => {
      const state = session();
      const scope = 'worker-1';
      const composed = await composeTechniqueWithSource('beta::grp::op', dir, 'alpha');
      expect(composed.success).toBe(true);
      if (!composed.success) return;

      const atCallSite = (line: number): Record<string, unknown> => {
        const { technique } = decorateTechniqueProvenance(
          composed.value.technique, emptyContext, { kind: 'call', caller: 'alpha::caller', line }, 'beta::grp::op',
        );
        return projectTechnique(technique);
      };

      const newDeliveries: Record<string, string> = {};
      const first = dedupTechniqueBlocks(atCallSite(7), state, newDeliveries, scope, true);
      const second = dedupTechniqueBlocks(atCallSite(19), state, newDeliveries, scope, true);

      // The rule items are the same bytes at both sites, so the second delivery carries a marker.
      const firstBlock = first['inherited_rules'] as Record<string, unknown>;
      const secondBlock = second['inherited_rules'] as Record<string, unknown>;
      expect(firstBlock['items']).not.toEqual(expect.objectContaining({ delivery: 'unchanged' }));
      expect(secondBlock['items']).toEqual(expect.objectContaining({ delivery: 'unchanged' }));
      // The scope differs per site and is never collapsed away.
      expect(String(firstBlock['scoped_to'])).toContain('line 7');
      expect(String(secondBlock['scoped_to'])).toContain('line 19');
    });
  });

  it('records and reads an unchanged marker through the one canonical shape', () => {
    const state = session();
    recordDeliveries(state, 'w', { 'technique:beta::grp::op': 'deadbeefdeadbeef' });
    expect(deliveredHash(state, 'technique:beta::grp::op', 'w')).toBe('deadbeefdeadbeef');
    expect(unchangedMarker('deadbeefdeadbeef')).toEqual({ delivery: 'unchanged', content_hash: 'deadbeefdeadbeef' });
  });
});
