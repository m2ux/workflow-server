import { describe, it, expect } from 'vitest';
import { applyTriage, loadTriage, expressionReads } from '../scripts/check-binding-fidelity.js';

/**
 * Binding-fidelity gate. The corpus carries triaged debt, recorded per finding with a verdict and a
 * rationale in scripts/binding-fidelity-triage.json; this asserts the two states that must never
 * ship: a finding nobody has judged, and a finding judged a live bug.
 *
 * There is no baseline and no re-snapshot command. A new finding is classified by hand — the act the
 * retired baseline let a `--update-baseline` skip, which is how two live defects reached a session
 * (#324 A1/A2). "Did MY change add this?" is `npm run check:delta`.
 */
describe('binding-fidelity gate', () => {
  const { findings, counts, total } = applyTriage();

  it('leaves no finding untriaged and no live bug unfixed', () => {
    expect(findings.map((v) => `[${v.check}] ${v.site} — ${v.detail}`)).toEqual([]);
  });

  it('accounts for every violation with a verdict', () => {
    expect(counts.harmless + counts['fix-later'] + counts['live-bug'] + counts.untriaged).toBe(total);
    expect(counts.untriaged).toBe(0);
  });

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
 * #342: a consumer in an unrelated workflow used to close a dead-output finding by bare name, and
 * the masking presented as a STALE entry — which reads like progress and forced real debt out of the
 * ledger. These two are the entries commit b41aaacc pruned for exactly that reason.
 */
describe('dead-output scoping', () => {
  it('keeps the seams that a same-named read in another workflow was masking', () => {
    const declared = loadTriage().entries.filter((e) => e.check === 'dead-output');
    const masked = [
      ['workflow-design/techniques/apply-audit-fixes.md', 'fixes_applied'],
      ['workflow-design/techniques/yaml-authoring.md', 'yaml_file'],
    ];
    for (const [site, output] of masked) {
      expect(declared.some((e) => e.site === site && e.detail.includes(`'${output}'`)),
        `${site} :: ${output} must stay in the ledger — workflow-authoring's same-named read cannot consume it`).toBe(true);
    }
  });
});
