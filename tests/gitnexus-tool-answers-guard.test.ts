import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { NAMESPACE, RESOURCE_ONLY_READINGS, collect, sectionOf } from '../guards/check-gitnexus-tool-answers.js';

/**
 * gitnexus-tool-answers guard: every reading the GitNexus library gives is taken through a tool, so
 * a client holding those tools and no resource reader gets an answer rather than a silence.
 *
 * The fixtures pin both halves. A protocol that addresses a resource is the catch; a protocol that
 * calls the tool is the clean case; and the carve-outs decide whether the guard is usable at all —
 * a resource named in a capability or a rule describes, and the two group readings GitNexus
 * publishes through a resource alone are excused by name rather than left unwritten.
 */
describe('gitnexus-tool-answers guard', () => {
  function withCorpus(files: Record<string, string>, run: (root: string) => void): void {
    const root = mkdtempSync(join(tmpdir(), 'wf-gitnexus-answers-'));
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

  const at = (name: string): string => join(NAMESPACE, name);

  const technique = (protocol: string, extra = ''): string =>
    `---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nRead a thing.\n${extra}\n## Outputs\n\n### thing\n\nThe thing.\n\n## Protocol\n\n### 1. Take It\n\n${protocol}\n`;

  it('reports a protocol that settles its answer on a resource', () => {
    withCorpus({
      [at('read-process.md')]: technique('- Read the MCP resource `gitnexus://repo/{repo_name}/process/{process_name}` and record the `{thing}`.'),
    }, (root) => {
      const { findings, checked } = collect(root);
      expect(findings.map((f) => f.check)).toEqual(['resource-answer']);
      expect(findings[0]!.site).toContain('read-process.md:');
      expect(checked).toBe(1);
    });
  });

  it('reports an output whose identifier points a reader at a resource', () => {
    withCorpus({
      [at('read-processes.md')]: `---\nmetadata:\n  version: 1.0.0\n---\n\n## Outputs\n\n### inventory\n\nEach entry takes the identifier \`gitnexus://repo/{repo_name}/process/{name}\`.\n\n## Protocol\n\n### 1. Take It\n\n- Call \`gitnexus_cypher { statement: "MATCH (p:Process) RETURN p.label", repo: repo_name }\`.\n`,
    }, (root) => {
      expect(collect(root).findings.map((f) => f.check)).toEqual(['resource-answer']);
    });
  });

  it('holds a protocol composed over a tool clean', () => {
    withCorpus({
      [at('read-process.md')]: technique('- Call `gitnexus_cypher { statement: "MATCH (s)-[r:CodeRelation]->(p:Process) RETURN r.step", repo: repo_name }` and record the `{thing}`.'),
    }, (root) => {
      expect(collect(root).findings).toEqual([]);
    });
  });

  /**
   * A resource named outside the two answering sections describes what the endpoint is rather than
   * taking a reading from it, and flagging that would push the namespace into never naming the
   * surface it is deliberately not using.
   */
  it('does not flag a resource named outside Protocol and Outputs', () => {
    withCorpus({
      [at('TECHNIQUE.md')]: `---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nThe graph.\n\n## Rules\n\n### reads-go-through-tools\n\nA reading addressed at \`gitnexus://repo/{repo_name}/context\` reaches a client that holds no resource reader.\n`,
    }, (root) => {
      expect(collect(root).findings).toEqual([]);
    });
  });

  it('excuses by name the readings GitNexus publishes through a resource alone', () => {
    const files: Record<string, string> = {};
    for (const name of RESOURCE_ONLY_READINGS.keys()) {
      files[at(name)] = technique('- Read the MCP resource `gitnexus://group/{group_name}/status` and record the `{thing}`.');
    }
    withCorpus(files, (root) => {
      const { findings, checked, excused } = collect(root);
      expect(findings).toEqual([]);
      expect(excused).toBe(RESOURCE_ONLY_READINGS.size);
      expect(checked).toBe(0);
    });
    for (const reason of RESOURCE_ONLY_READINGS.values()) expect(reason.length).toBeGreaterThan(0);
  });

  it('reads no technique outside the namespace', () => {
    withCorpus({
      'prism/techniques/structural-analysis.md': technique('- Read the MCP resource `gitnexus://repo/{repo_name}/context` and record the `{thing}`.'),
    }, (root) => {
      const { findings, checked } = collect(root);
      expect(findings).toEqual([]);
      expect(checked).toBe(0);
    });
  });

  it('attributes each line to the heading it sits under', () => {
    const lines = ['# Title', 'intro', '## Outputs', 'a', '## Protocol', 'b'];
    expect(sectionOf(lines)).toEqual([null, null, 'Outputs', 'Outputs', 'Protocol', 'Protocol']);
  });
});
