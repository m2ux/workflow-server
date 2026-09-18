import { describe, it, expect, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadTriage, expressionReads, collectViolations, consumerReaches, deadOutputSatisfier } from '../guards/check-binding-fidelity.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * Binding-fidelity gate. The corpus carries triaged debt, recorded per finding with a verdict and a
 * rationale in ledgers/binding-fidelity-triage.json. The `binding-fidelity` guard holds the two
 * states that must never ship — a finding nobody has judged, and a finding judged a live bug — and
 * reports an entry with no live finding behind it. What it reads past is a rationale key the triage
 * file never defines, which resolves to the key itself and reads as a reason.
 */
describe.skipIf(!loadTriage().corpusSha)('binding-fidelity gate', () => {
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
  it.skipIf(!liveCorpusRoot())('closes a dead output only from a workflow that can reach the declaring file', () => {
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

  it('reads a key as the namespace it names, however the tree above that namespace is arranged', () => {
    // A key carries the reference that reaches a namespace, so a workflow below a grouping folder
    // is named without it and a library whose name a second directory claims is named by its path.
    // The rule reads back what the citation wrote, or a consumer matches nothing across files.
    expect(consumerReaches(
      'prism/techniques/plan-analysis.md',
      'prism/techniques/generate-report.md',
    )).toBe(true);
    // Two libraries of one name are two namespaces, and a finding in one is not a finding in the
    // other — the whole point of keying a colliding pair on the path.
    expect(consumerReaches(
      'left/twin/techniques/op.md',
      'left/twin/techniques/other.md',
    )).toBe(true);
    expect(consumerReaches(
      'left/twin/techniques/op.md',
      'right/twin/techniques/op.md',
    )).toBe(false);
  });
});

/**
 * A library's runs, read from a tree built for the purpose.
 *
 * A run is where a library's operations are composed, so a value consumed only there is consumed
 * nowhere the sweep looks unless the sweep opens `routines/`. The membership tests that select a
 * namespace for the graph half — a `techniques/` directory, a definition with `activities/` beside
 * it — are each one a library can fail while holding runs, so the scan is driven by the directory
 * that holds them and this measures that it is.
 */
describe('a library\'s routines are read', () => {
  const OUTPUT_DECLARED = `---
metadata:
  version: 1.0.0
---

## Capability

Probe the target.

## Outputs

### probe_verdict

What the probe made of the target.

## Protocol

1. Probe the target and record it as \`{probe_verdict}\`.
`;

  const RUN_CONSUMING_IT = `id: shared-run
version: 1.0.0
name: shared-run
outputs:
  - id: run_verdict
    description: What the probe made of the target, under the name this run lands it by.
steps:
  - kind: technique
    id: probe
    technique:
      name: meta::probe
      outputs:
        probe_verdict: run_verdict
`;

  /** Build a corpus whose only consumer of meta's output is a run in a library, and sweep it. */
  async function deadOutputsIn(tree: Record<string, Record<string, string>>): Promise<string[]> {
    const root = mkdtempSync(join(tmpdir(), 'wf-bf-'));
    for (const [rel, files] of Object.entries(tree)) {
      for (const [name, content] of Object.entries(files)) {
        const file = join(root, rel, name);
        mkdirSync(join(file, '..'), { recursive: true });
        writeFileSync(file, content);
      }
    }
    const previous = process.env.WORKFLOWS_DIR;
    process.env.WORKFLOWS_DIR = root;
    try {
      vi.resetModules();
      const guard = await import('../guards/check-binding-fidelity.js');
      return guard.collectViolations()
        .filter((v) => v.check === 'dead-output')
        .map((v) => `${v.site}: ${v.detail}`);
    } finally {
      if (previous === undefined) delete process.env.WORKFLOWS_DIR; else process.env.WORKFLOWS_DIR = previous;
      rmSync(root, { recursive: true, force: true });
    }
  }

  it('credits a value a library\'s run consumes, the library holding techniques beside it', async () => {
    const dead = await deadOutputsIn({
      'meta/techniques': { 'probe.md': OUTPUT_DECLARED },
      'lib/techniques': { 'other.md': OUTPUT_DECLARED.split('probe_verdict').join('other_verdict') },
      'lib/routines': { 'shared-run.yaml': RUN_CONSUMING_IT },
    });
    expect(dead.filter((d) => d.includes('probe_verdict'))).toEqual([]);
  });

  it('credits it where the library holds runs and nothing else', async () => {
    const dead = await deadOutputsIn({
      'meta/techniques': { 'probe.md': OUTPUT_DECLARED },
      'lib/routines': { 'shared-run.yaml': RUN_CONSUMING_IT },
    });
    expect(dead.filter((d) => d.includes('probe_verdict'))).toEqual([]);
  });
});

/**
 * A read that addresses into a value, held against the members its producer declares.
 *
 * The resolution rules answer for a path's head and discard the tail, so a tail naming a member no
 * contract declares is a well-formed read of nothing: the loop iterates zero times, the step it
 * guards is skipped, and the walk reports success. Three of those shipped in one change, so what
 * makes this checkable is the `####` components an output declares — a statement of shape the
 * reader's claim can be held against.
 */
describe('a path names a member its producer declares', () => {
  const WITH_COMPONENTS = `---
metadata:
  version: 1.0.0
---

## Capability

Report what the diff reached.

## Outputs

### change_report

What the diff reached.

#### changed_symbols

The symbols the diff's hunks land in.

#### summary

The counts those add up to.

## Protocol

1. Report the diff as \`{change_report}\`.
`;

  const runReading = (path: string): string => `id: shared-run
version: 1.0.0
name: shared-run
internals:
  - id: change_report
    description: what the diff reached
  - id: changed_symbol
    description: the symbol the pass holds
steps:
  - kind: technique
    id: detect
    technique:
      name: meta::detect
      outputs:
        change_report: change_report
  - kind: loop
    id: symbol-cycle
    name: Symbol Cycle
    loopType: forEach
    variable: changed_symbol
    over: ${path}
    maxIterations: 10
    steps:
      - kind: action
        id: note
        actions:
          - action: log
            message: "held {changed_symbol}"
`;

  async function pathViolationsIn(routine: string, technique = WITH_COMPONENTS): Promise<string[]> {
    const root = mkdtempSync(join(tmpdir(), 'wf-path-'));
    for (const [rel, files] of Object.entries({
      'meta/techniques': { 'detect.md': technique },
      'lib/routines': { 'shared-run.yaml': routine },
    })) {
      for (const [name, content] of Object.entries(files)) {
        const file = join(root, rel, name);
        mkdirSync(join(file, '..'), { recursive: true });
        writeFileSync(file, content);
      }
    }
    const previous = process.env.WORKFLOWS_DIR;
    process.env.WORKFLOWS_DIR = root;
    try {
      vi.resetModules();
      const guard = await import('../guards/check-binding-fidelity.js');
      return guard.collectViolations()
        .filter((v) => v.check === 'output-path-undeclared')
        .map((v) => v.detail);
    } finally {
      if (previous === undefined) delete process.env.WORKFLOWS_DIR; else process.env.WORKFLOWS_DIR = previous;
      rmSync(root, { recursive: true, force: true });
    }
  }

  it('reports a member the declaring output does not state', async () => {
    const found = await pathViolationsIn(runReading('change_report.symbols'));
    expect(found).toHaveLength(1);
    expect(found[0]).toContain("no 'symbols'");
    expect(found[0]).toContain("'changed_symbols'");
  });

  it('passes a member the output declares', async () => {
    expect(await pathViolationsIn(runReading('change_report.changed_symbols'))).toEqual([]);
  });

  it('passes an index, which addresses a position rather than a member', async () => {
    expect(await pathViolationsIn(runReading('change_report.0'))).toEqual([]);
  });

  /**
   * An output declaring no components states nothing about its shape, so a reader addressing into it
   * reaches past the contract rather than contradicting it. Reporting those would report every
   * under-declared output in the corpus, which is a different finding and a far larger one.
   */
  it('passes any member where the output declares no components at all', async () => {
    const bare = WITH_COMPONENTS.replace(/#### changed_symbols[\s\S]*?## Protocol/, '## Protocol');
    expect(await pathViolationsIn(runReading('change_report.symbols'), bare)).toEqual([]);
  });
});

/**
 * entry-field-undeclared: a read off a loop's item, held against the fields the iterated component
 * declares for one entry.
 *
 * This is the level `output-path-undeclared` stops at. That check settles a read into a value
 * against the members its producer declares; where the member is a list, what one entry carries sat
 * in the sentence describing it and nothing could read it back. The defect it exists for ran to
 * completion reporting success: a run asked for a trace once per flow, addressed each request by an
 * empty string, received nothing every time, and finished normally.
 */
describe('binding fidelity — entry-field-undeclared', () => {
  const WITH_ENTRY_FIELDS = [
    '---', 'metadata:', '  version: 1.0.0', '---', '',
    '## Capability', '', 'Rank the flows a concept lands in.', '',
    '## Outputs', '',
    '### query_report', '', 'What the concept reached.', '',
    '#### processes', '', 'The execution flows the concept ranked into.', '',
    '##### summary', '', 'The name that identifies the flow end to end.', '',
    '##### priority', '', 'Its relevance.', '',
    '#### definitions', '', 'The symbols it reached outside any flow.', '',
    '## Protocol', '', '1. Report the ranking as {query_report}.', '',
  ].join('\n');

  const runIterating = (over: string, read: string): string => [
    'id: shared-run', 'version: 1.0.0', 'name: shared-run',
    'internals:',
    '  - id: query_report', '    description: what the concept reached',
    '  - id: ranked_flow', '    description: the flow the pass holds',
    'steps:',
    '  - kind: technique', '    id: rank', '    technique:', '      name: meta::rank',
    '      outputs:', '        query_report: query_report',
    '  - kind: loop', '    id: flow-cycle', '    name: Flow Cycle', '    loopType: forEach',
    '    variable: ranked_flow', `    over: ${over}`, '    maxIterations: 10',
    '    steps:',
    '      - kind: action', '        id: note', '        actions:',
    '          - action: log', `            message: "held {${read}}"`, '',
  ].join('\n');

  async function entryViolationsIn(routine: string, technique = WITH_ENTRY_FIELDS): Promise<string[]> {
    const root = mkdtempSync(join(tmpdir(), 'wf-entry-'));
    for (const [rel, files] of Object.entries({
      'meta/techniques': { 'rank.md': technique },
      'lib/routines': { 'shared-run.yaml': routine },
    })) {
      for (const [name, content] of Object.entries(files)) {
        const file = join(root, rel, name);
        mkdirSync(join(file, '..'), { recursive: true });
        writeFileSync(file, content);
      }
    }
    const previous = process.env.WORKFLOWS_DIR;
    process.env.WORKFLOWS_DIR = root;
    try {
      vi.resetModules();
      const guard = await import('../guards/check-binding-fidelity.js');
      return guard.collectViolations()
        .filter((v) => v.check === 'entry-field-undeclared')
        .map((v) => v.detail);
    } finally {
      if (previous === undefined) delete process.env.WORKFLOWS_DIR; else process.env.WORKFLOWS_DIR = previous;
      rmSync(root, { recursive: true, force: true });
    }
  }

  /** The defect that shipped: a flow named by a field the ranked answer does not carry. */
  it('reports a field one entry of the iterated component does not carry', async () => {
    const found = await entryViolationsIn(runIterating('query_report.processes', 'ranked_flow.name'));
    expect(found).toHaveLength(1);
    expect(found[0]).toContain("no 'name'");
    expect(found[0]).toContain("'summary'");
  });

  it('passes a field the entry declares', async () => {
    expect(await entryViolationsIn(runIterating('query_report.processes', 'ranked_flow.summary'))).toEqual([]);
  });

  /**
   * A component stating nothing about its entries is reached past rather than contradicted — the
   * carve-out `output-path-undeclared` makes one level up, for the same reason.
   */
  it('passes a read off an item whose component declares no entry fields', async () => {
    expect(await entryViolationsIn(runIterating('query_report.definitions', 'ranked_flow.name'))).toEqual([]);
  });

  it('passes an index, which addresses a position rather than a field', async () => {
    expect(await entryViolationsIn(runIterating('query_report.processes', 'ranked_flow.0'))).toEqual([]);
  });

  /** A loop over a whole value has no component to reach into, so there is nothing to measure. */
  it('passes a loop iterating a value with no component named', async () => {
    expect(await entryViolationsIn(runIterating('query_report', 'ranked_flow.name'))).toEqual([]);
  });
});
