import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import {
  CORE_ORCHESTRATOR_TECHNIQUES,
  CORE_WORKER_TECHNIQUES,
  ORCHESTRATOR_CHECKPOINT_TECHNIQUES,
  WORKER_CHECKPOINT_TECHNIQUES,
  FAN_ONLY_RULES,
  LOOP_ONLY_RULES,
  contractOperations,
} from '../src/loaders/core-ops.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * What a delivery serves is what its caller can reach.
 *
 * Two cuts are made at delivery time — the checkpoint protocols, and the rules about how a fanned
 * branch lands its outputs — and both are decidable from definitions the server has already
 * loaded. These cases hold the lists apart and hold the by-id fetch path open, which is what makes
 * the cuts safe: a role that meets a gate it was not served the protocol for asks for it.
 */
describe('the checkpoint protocols are held out of the core lists', () => {
  it('keeps the worker pair out of the worker core', () => {
    for (const ref of WORKER_CHECKPOINT_TECHNIQUES) {
      expect(CORE_WORKER_TECHNIQUES, `${ref} rides the core list`).not.toContain(ref);
    }
  });

  it('keeps the orchestrator pair out of the orchestrator core', () => {
    for (const ref of ORCHESTRATOR_CHECKPOINT_TECHNIQUES) {
      expect(CORE_ORCHESTRATOR_TECHNIQUES, `${ref} rides the core list`).not.toContain(ref);
    }
  });

  /**
   * The cut is safe only because what it leaves out stays reachable. A worker may raise a decision
   * its activity never declared, and an orchestrator then has to present and resolve it — so both
   * protocols must be servable by id from any session.
   */
  it('leaves every held-back protocol servable by id', () => {
    const servable = contractOperations({});
    for (const ref of [...WORKER_CHECKPOINT_TECHNIQUES, ...ORCHESTRATOR_CHECKPOINT_TECHNIQUES]) {
      expect(servable, `${ref} is unreachable`).toContain(ref);
    }
  });
});

describe('the operations a by-id fetch admits', () => {
  it('admits both roles\' core operations, one session serving both', () => {
    const servable = contractOperations({});
    for (const ref of [...CORE_ORCHESTRATOR_TECHNIQUES, ...CORE_WORKER_TECHNIQUES]) {
      expect(servable).toContain(ref);
    }
  });

  /**
   * A ref in these lists is written in the server and named in no definition, so the guard that
   * resolves every `techniques[]` reference never sees one. Rename the corpus folder it names and
   * the loader returns `not-found`, which the bundle carries into every delivery of that role — the
   * orchestrator losing its commit protocols, say, with nothing red. That exact drift happened while
   * these operations were moving into namespaces of their own, and the only thing that caught it was
   * a walk incidentally counting unresolved refs. This asks the question directly.
   */
  it.skipIf(!liveCorpusRoot())('names only refs the corpus resolves', async () => {
    const { resolveTechniques } = await import('../src/loaders/technique-loader.js');
    const root = liveCorpusRoot()!;
    for (const refs of [CORE_ORCHESTRATOR_TECHNIQUES, CORE_WORKER_TECHNIQUES]) {
      const resolved = await resolveTechniques([...refs], root, 'meta');
      const dead = resolved.filter((entry) => entry.type === 'not-found').map((entry) => entry.ref);
      expect(dead, 'a core delivery ref the corpus no longer holds').toEqual([]);
    }
  });

  it('admits what the definitions name, and nothing else', () => {
    const servable = contractOperations({
      workflowTechniques: ['review-basis'],
      activityTechniques: ['variable-binding'],
      activityOwnTechniques: ['intake::classify'],
    });
    expect(servable).toContain('review-basis');
    expect(servable).toContain('variable-binding');
    expect(servable).toContain('intake::classify');
    expect(servable).not.toContain('some-other-workflow::secret');
  });
});

describe('the fan-only rules', () => {
  it('names the branch-landing rule by the ref the bundle resolves it under', () => {
    expect(FAN_ONLY_RULES).toContain('variable-binding::a-branch-lands-under-its-own-derived-key');
  });

  /**
   * A ref that has drifted from the corpus filters nothing and reports nothing, so the rule would
   * quietly return to every delivery. What the ref has to match is the ref an ordinary worker
   * bundle resolves the rule under — not the spelling an author would type.
   */
  it('names the refs a worker bundle resolves those rules under', async () => {
    const { resolveTechniques } = await import('../src/loaders/technique-loader.js');
    const { liveCorpusRoot } = await import('./corpus-root.js');
    const root = liveCorpusRoot();
    if (!root) return;
    const resolved = await resolveTechniques(
      ['variable-binding', ...CORE_WORKER_TECHNIQUES], root, 'meta',
    );
    const refs = resolved.filter((e) => e.type === 'rule').map((e) => e.ref);
    for (const ref of FAN_ONLY_RULES) {
      expect(refs, `${ref} is not a rule any worker bundle carries`).toContain(ref);
    }
  });
});

describe('the loop-only rules', () => {
  /**
   * A grouped technique resolves its rules under `<group>::<operation>::<rule>`, which is a
   * segment longer than the standalone form beside it in `FAN_ONLY_RULES`. A ref written to the
   * shorter spelling filters nothing and reports nothing, so the loop controls would ride to every
   * worker whose run holds no loop — the cost this cut exists to avoid.
   */
  it('names the refs a worker bundle resolves those rules under', async () => {
    const { resolveTechniques } = await import('../src/loaders/technique-loader.js');
    const { liveCorpusRoot } = await import('./corpus-root.js');
    const root = liveCorpusRoot();
    if (!root) return;
    const resolved = await resolveTechniques([...CORE_WORKER_TECHNIQUES], root, 'meta');
    const refs = resolved.filter((e) => e.type === 'rule').map((e) => e.ref);
    for (const ref of LOOP_ONLY_RULES) {
      expect(refs, `${ref} is not a rule any worker bundle carries`).toContain(ref);
    }
  });

  /**
   * The gate and condition rules are owed to every worker, so only the loop half is cut. A future
   * edit that adds a sibling to the list is asked to say why it is not universal.
   */
  it('cuts only the loop half of step-control', () => {
    expect(LOOP_ONLY_RULES).toEqual(['workflow-engine::step-control::loop-control']);
  });
});

describe('the benchmark fixture holds no gate', () => {
  /**
   * The delivery-cost baseline is recorded against a fixture whose activities declare no
   * checkpoint, so the gate prices the cut rather than the uncut delivery. An added gate is a
   * legitimate change to the fixture and a re-record; it is not a silent one.
   */
  it('declares no checkpoint step, which is what the recorded baseline prices', async () => {
    const { loadWorkflow } = await import('../src/loaders/workflow-loader.js');
    const { flattenActivitySteps } = await import('../src/schema/activity.schema.js');
    const fixture = resolve(import.meta.dirname, 'fixtures/token-bench');
    const loaded = await loadWorkflow(fixture, 'delivery-fixture');
    expect(loaded.success).toBe(true);
    if (!loaded.success) return;
    const gates = (loaded.value.activities ?? []).flatMap((a) =>
      flattenActivitySteps(a).filter((s) => s.kind === 'checkpoint').map((s) => `${a.id}.${s.id}`));
    expect(gates).toEqual([]);
  });
});
