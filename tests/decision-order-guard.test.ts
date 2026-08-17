import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings } from '../scripts/check-decision-order.js';
import { UnreachableCorpusError } from '../scripts/workflows-root.js';
import { corpusRoot } from './corpus-root.js';

/**
 * Decision-order guard (#469): no checkpoint decides a value a step before it is already gated on.
 *
 * On the walk this guard was written from, `start-work-package` read the issue platform at 14 of its
 * 52 steps and decided it at one — a checkpoint eleven steps after the first read and one step after
 * the issue was created. Hard zero over the corpus; the fixtures pin both directions, and one per
 * exemption, so a green corpus is evidence the guard can still fire.
 */
describe('decision-order guard', () => {
  /** Write a one-workflow corpus with the given declarations and one activity, and collect. */
  function findingsFor(steps: string, variables = ''): ReturnType<typeof collectFindings> {
    const root = mkdtempSync(join(tmpdir(), 'wf-dorder-'));
    try {
      mkdirSync(join(root, 'wf', 'activities'), { recursive: true });
      writeFileSync(join(root, 'wf', 'workflow.yaml'), `id: wf\nvariables:\n${variables}`);
      writeFileSync(join(root, 'wf', 'activities', '01-thing.yaml'), `id: thing\nsteps:\n${steps}`);
      return collectFindings(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const READER = `  - kind: technique
    id: use-platform
    technique: some::op
    when: platform == 'jira'
`;
  const DECIDER = `  - kind: checkpoint
    id: pick-platform
    message: Which platform?
    options:
      - id: jira
        label: Jira
        effect:
          setVariable:
            platform: jira
`;

  it('reports no violation over the real corpus', () => {
    expect(collectFindings(corpusRoot()).map(f => `${f.site}: ${f.detail}`)).toEqual([]);
  });

  it('flags a checkpoint that decides what an earlier step is gated on', () => {
    const findings = findingsFor(`${READER}${DECIDER}`);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.check).toBe('decides-after-use');
    expect(findings[0]!.site).toBe('wf/activities/01-thing.yaml::pick-platform');
    expect(findings[0]!.detail).toContain("decides 'platform', which step 'use-platform'");
  });

  it('accepts the same pair once the decision comes first', () => {
    expect(findingsFor(`${DECIDER}${READER}`)).toEqual([]);
  });

  it('exempts a declared default — the earlier read has the default to read', () => {
    const declared = '  - name: platform\n    type: string\n    defaultValue: github\n';
    expect(findingsFor(`${READER}${DECIDER}`, declared)).toEqual([]);
  });

  it('exempts a presence read, which answers on a missing variable', () => {
    const presenceReader = `  - kind: technique
    id: use-platform
    technique: some::op
    condition:
      type: simple
      variable: platform
      operator: exists
`;
    expect(findingsFor(`${presenceReader}${DECIDER}`)).toEqual([]);
  });

  it('exempts an announcement, which loses nothing by not firing', () => {
    const announce = `  - kind: action
    id: announce-platform
    when: platform == 'jira'
    actions:
      - action: message
        message: "Platform is {platform}."
`;
    expect(findingsFor(`${announce}${DECIDER}`)).toEqual([]);
  });

  it('exempts gates that no single run reaches both of', () => {
    const exclusiveReader = `  - kind: technique
    id: use-platform
    technique: some::op
    when: platform_known == true && platform == 'jira'
`;
    const exclusiveDecider = `  - kind: checkpoint
    id: pick-platform
    condition:
      type: simple
      variable: platform_known
      operator: "!="
      value: true
    message: Which platform?
    options:
      - id: jira
        label: Jira
        effect:
          setVariable:
            platform: jira
`;
    expect(findingsFor(`${exclusiveReader}${exclusiveDecider}`)).toEqual([]);
  });

  it('exempts an option that re-enters, since the next pass reads what it wrote', () => {
    const reentrant = `  - kind: checkpoint
    id: pick-platform
    message: Which platform?
    options:
      - id: jira
        label: Jira
        effect:
          setVariable:
            platform: jira
          transitionTo: thing
`;
    expect(findingsFor(`${READER}${reentrant}`)).toEqual([]);
  });

  it('refuses to pass an empty corpus, so green-because-nothing-scanned is impossible', () => {
    const root = mkdtempSync(join(tmpdir(), 'wf-dorder-empty-'));
    try {
      expect(() => collectFindings(root)).toThrow(UnreachableCorpusError);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
