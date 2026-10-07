import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { MIN_BODY_LENGTH, MIN_TABLE_ROWS, collect, readableLines, sections, tables } from '../guards/check-resource-statement-home.js';

/**
 * resource-statement-home guard: a statement a resource makes has one home in the corpus. These
 * fixtures seed a statement at one site and at two, in both shapes the guard reads — a section
 * body and a table — and pin the verdict on each. The carve-outs matter as much as the catches:
 * a guard that flagged every repeated two-row table would make the corpus worse, so the fixtures
 * hold the short body, the small table and the two sections of one file that must stay silent.
 */
describe('resource-statement-home guard', () => {
  /** A body long enough to be a statement rather than a turn of phrase. */
  const BODY = 'A finding is Critical when any one of the three tests holds on the evidence that test admits, '
    + 'and establishing a second adds nothing to the classification it already carries.';

  function withCorpus(files: Record<string, string>, run: (root: string) => void): void {
    const root = mkdtempSync(join(tmpdir(), 'wf-statement-home-'));
    try {
      for (const [path, text] of Object.entries(files)) {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), text, 'utf-8');
      }
      run(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const resource = (heading: string, body: string): string => `# Title\n\n## ${heading}\n\n${body}\n`;

  const table = (rows: number): string =>
    ['| Severity | What it says |', '| --- | --- |']
      .concat(Array.from({ length: rows }, (_, i) => `| value-${i} | the thing it says number ${i} |`))
      .join('\n');

  it('reports one section body authored in two resources', () => {
    withCorpus({
      'corpus/alpha/resources/one.md': resource('Severities', BODY),
      'corpus/beta/resources/two.md': resource('Severities', BODY),
    }, (root) => {
      const { findings } = collect(root);
      expect(findings.map((f) => f.check)).toEqual(['duplicate-section']);
      expect(findings[0]!.detail).toContain('beta/resources/two.md');
    });
  });

  it('reports one table authored in two resources under different headings', () => {
    // The surrounding prose differs, so the section bodies do not match and the table is what is
    // left to catch — the shape a copy takes when it is restated under a heading of its own.
    withCorpus({
      'corpus/alpha/resources/one.md': resource('Severities', `${BODY}\n\n${table(MIN_TABLE_ROWS)}`),
      'corpus/beta/resources/two.md': resource('Something Else', `A quite different lead-in sentence stands above it here.\n\n${table(MIN_TABLE_ROWS)}`),
    }, (root) => {
      const { findings } = collect(root);
      expect(findings.map((f) => f.check)).toEqual(['duplicate-table']);
    });
  });

  it('holds a statement with one home clean', () => {
    withCorpus({
      'corpus/alpha/resources/one.md': resource('Severities', BODY),
      'corpus/beta/resources/two.md': resource('Severities', `${BODY} And this one differs at its end.`),
    }, (root) => {
      expect(collect(root).findings).toEqual([]);
    });
  });

  it('passes over a body too short to be a statement', () => {
    const short = 'Omit if none.';
    expect(short.length).toBeLessThan(MIN_BODY_LENGTH);
    withCorpus({
      'corpus/alpha/resources/one.md': resource('Notes', short),
      'corpus/beta/resources/two.md': resource('Notes', short),
    }, (root) => {
      expect(collect(root).findings).toEqual([]);
    });
  });

  it('passes over a table too small to be a statement', () => {
    // Distinct prose keeps the section bodies apart, so the small table is the only thing the two
    // resources share — the two-column key that repeats legitimately across a corpus.
    withCorpus({
      'corpus/alpha/resources/one.md': resource('Keys', `${BODY}\n\n${table(MIN_TABLE_ROWS - 1)}`),
      'corpus/beta/resources/two.md': resource('Keys', `Another lead-in entirely, written for this resource alone.\n\n${table(MIN_TABLE_ROWS - 1)}`),
    }, (root) => {
      expect(collect(root).findings).toEqual([]);
    });
  });

  it('passes over two sections of one resource, which is one home', () => {
    withCorpus({
      'corpus/alpha/resources/one.md': `# Title\n\n## First\n\n${BODY}\n\n## Second\n\n${BODY}\n`,
    }, (root) => {
      expect(collect(root).findings).toEqual([]);
    });
  });

  it('passes over a body that is only links', () => {
    const links = '- [One](./one.md#a)\n- [Two](./two.md#b)\n- [Three](./three.md#c)\n- [Four](./four.md#d)\n';
    withCorpus({
      'corpus/alpha/resources/one.md': resource('Index', links),
      'corpus/beta/resources/two.md': resource('Index', links),
    }, (root) => {
      expect(collect(root).findings).toEqual([]);
    });
  });

  it('passes over the same shape shown inside a fence', () => {
    const fenced = '```markdown\n' + table(MIN_TABLE_ROWS) + '\n```\n';
    withCorpus({
      'corpus/alpha/resources/one.md': resource('Template', fenced),
      'corpus/beta/resources/two.md': resource('Template', fenced),
    }, (root) => {
      expect(collect(root).findings).toEqual([]);
    });
  });

  it('suppresses a duplication the triage judges, keyed by the references that reach it', () => {
    withCorpus({
      'corpus/alpha/resources/one.md': resource('Severities', BODY),
      'corpus/beta/resources/two.md': resource('Severities', BODY),
      'ledgers/resource-statement-home-triage.json': JSON.stringify({
        rationales: { 'seed-population': 'Already held when the guard arrived.' },
        entries: [{
          site: 'alpha/resources/one.md + beta/resources/two.md',
          verdict: 'debt',
          rationale: 'seed-population',
        }],
      }),
    }, (root) => {
      expect(collect(root).findings).toEqual([]);
    });
  });

  it('reports a triage entry the corpus no longer holds', () => {
    withCorpus({
      'corpus/alpha/resources/one.md': resource('Severities', BODY),
      'ledgers/resource-statement-home-triage.json': JSON.stringify({
        rationales: { 'seed-population': 'Already held when the guard arrived.' },
        entries: [{
          site: 'alpha/resources/one.md + beta/resources/two.md',
          verdict: 'debt',
          rationale: 'seed-population',
        }],
      }),
    }, (root) => {
      const { findings } = collect(root);
      expect(findings.map((f) => f.check)).toEqual(['stale-triage']);
    });
  });

  it('reports a triage entry naming a rationale the ledger does not define', () => {
    withCorpus({
      'corpus/alpha/resources/one.md': resource('Severities', BODY),
      'corpus/beta/resources/two.md': resource('Severities', BODY),
      'ledgers/resource-statement-home-triage.json': JSON.stringify({
        rationales: { 'seed-population': 'Already held when the guard arrived.' },
        entries: [{
          site: 'alpha/resources/one.md + beta/resources/two.md',
          verdict: 'debt',
          rationale: 'no-such-rationale',
        }],
      }),
    }, (root) => {
      const { findings } = collect(root);
      expect(findings.map((f) => f.check)).toEqual(['unnamed-rationale']);
    });
  });

  it('counts the resources it read, so an empty corpus is not a pass', () => {
    withCorpus({ 'corpus/alpha/resources/one.md': resource('Severities', BODY) }, (root) => {
      expect(collect(root).scanned).toBe(1);
    });
    withCorpus({}, (root) => {
      expect(collect(root).scanned).toBe(0);
    });
  });

  describe('readers', () => {
    it('drops front matter and fenced blocks', () => {
      const lines = readableLines('---\nname: x\n---\n\n## A\n\ntext\n\n```\n## Not A Heading\n```\n');
      expect(sections(lines).map((s) => s.heading)).toEqual(['A']);
    });

    it('reads a table as its body rows, without the header or its delimiter', () => {
      expect(tables(readableLines(table(MIN_TABLE_ROWS)))).toEqual([
        Array.from({ length: MIN_TABLE_ROWS }, (_, i) => `| value-${i} | the thing it says number ${i} |`),
      ]);
    });
  });
});
