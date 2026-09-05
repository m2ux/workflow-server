import { describe, it, expect } from 'vitest';
import { loadTriage, expressionReads, collectViolations, consumerReaches, deadOutputSatisfier } from '../scripts/check-binding-fidelity.js';

/**
 * Binding-fidelity gate. The corpus carries triaged debt, recorded per finding with a verdict and a
 * rationale in scripts/binding-fidelity-triage.json. The `binding-fidelity` guard holds the two
 * states that must never ship — a finding nobody has judged, and a finding judged a live bug — and
 * reports an entry with no live finding behind it. What it reads past is a rationale key the triage
 * file never defines, which resolves to the key itself and reads as a reason.
 */
describe('binding-fidelity gate', () => {
  it('names a rationale that the triage file defines for every entry', () => {
    const triage = loadTriage();
    const undefinedRationales = triage.entries
      .filter((e) => !(e.rationale in triage.rationales))
      .map((e) => `${e.site}: ${e.rationale}`);
    expect(undefinedRationales).toEqual([]);
  });
});

/**
 * Gate expressions became a resolution surface in #341, which makes this extractor load-bearing: a
 * name it invents is a finding nobody can fix, and a name it drops is a gate that can never fire.
 * Every case here is a shape the corpus actually carries.
 */
describe('gate-expression reads', () => {
  it('takes the left operand and never the right', () => {
    // An unquoted right operand is shaped exactly like an identifier, so harvesting every word in
    // the string would read `completion` as a bag name nothing can produce.
    expect(expressionReads('analysis_type == completion')).toEqual(['analysis_type']);
    expect(expressionReads("operation_type != 'review'")).toEqual(['operation_type']);
  });

  it('splits a conjunction into one read per clause', () => {
    expect(expressionReads("issue_platform == 'jira' && issue_skipped != true"))
      .toEqual(['issue_platform', 'issue_skipped']);
  });

  it('reduces a dotted path to its bag head', () => {
    expect(expressionReads('missing_prerequisites.length == 0')).toEqual(['missing_prerequisites']);
    expect(expressionReads('planning_folder_path.writable == true')).toEqual(['planning_folder_path']);
  });

  it('reads a bare clause for truthiness', () => {
    expect(expressionReads('agents_md_read')).toEqual(['agents_md_read']);
  });

  it('exempts namespaces that probe the environment rather than the bag', () => {
    // `gh.auth.status` asks the GitHub CLI. Dotted-ness cannot discriminate these, since
    // `planning_folder_path.writable` above is a real bag name carrying a probed field.
    expect(expressionReads('gh.auth.status == 0')).toEqual([]);
    expect(expressionReads('gpg.agent.reachable == true')).toEqual([]);
    expect(expressionReads('signing.configured == true')).toEqual([]);
  });

  it('reads nothing from an empty-collection comparison', () => {
    expect(expressionReads('broken_artifact_links == []')).toEqual(['broken_artifact_links']);
  });
});

/**
 * #342: a consumer in an unrelated workflow used to close a dead-output finding by bare name, and the
 * masking presented as a STALE entry — which reads like progress and forced real debt out of the
 * ledger.
 *
 * This asserts the RULE rather than pinning two corpus instances of it. Instances get paid down —
 * both original fixtures were legitimately closed by #336 — and a fixture that goes green on a real
 * fix tests the corpus, not the guard.
 */
describe('dead-output scoping', () => {
  it('closes a dead output only from a workflow that can reach the declaring file', () => {
    collectViolations();
    const unreachable: string[] = [];
    for (const [key, satisfier] of deadOutputSatisfier) {
      const declaringRel = key.split('\u0000')[0]!;
      if (!consumerReaches(satisfier, declaringRel)) unreachable.push(`${declaringRel} <- ${satisfier}`);
    }
    expect(unreachable, 'every closure comes from the declaring workflow, meta, a borrow, or a dispatch').toEqual([]);
  });

  it('does not let a bare same-named read in an unrelated workflow reach across', () => {
    // `codebase-wiki` neither binds a `prism` op nor dispatches it, and vice versa.
    expect(consumerReaches('prism/techniques/plan-analysis.md', 'codebase-wiki/techniques/query.md')).toBe(false);
    expect(consumerReaches('codebase-wiki/techniques/query.md', 'prism/techniques/plan-analysis.md')).toBe(false);
  });
});
