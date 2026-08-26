import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings } from '../scripts/check-checkpoint-presentation.js';
import { UnreachableCorpusError } from '../scripts/workflows-root.js';

/**
 * Checkpoint-presentation guard (#400 W1): when a gate is presented is stated in one home.
 *
 * The contract lives in meta/techniques/workflow-engine/present-checkpoint-to-user.md. It is
 * prose-enforced — the server cannot tell whether a question was shown — so a rule bucket restating
 * it decides what an agent does. Four workflow rules once licensed skipping presentation for a soft
 * gate while the engine rule forbade it; workers followed the nearer rule. Hard zero: the fixtures
 * pin both directions, so a green corpus is evidence the guard can still fire.
 */
describe('checkpoint-presentation guard', () => {
  /** Write a corpus of one workflow, optionally with an activity and a technique, and collect. */
  function findingsFor(files: Record<string, string>): ReturnType<typeof collectFindings> {
    const root = mkdtempSync(join(tmpdir(), 'wf-cppres-'));
    try {
      for (const [rel, body] of Object.entries(files)) {
        const full = join(root, rel);
        mkdirSync(join(full, '..'), { recursive: true });
        writeFileSync(full, body);
      }
      return collectFindings(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  // A domain invariant with no engine mechanics in it — the shape a workflow rule is allowed to be.
  const CLEAN_WF = 'id: wf\nrules:\n  activity:\n    - Every finding carries the evidence it was derived from.\n';

  it('flags a workflow rule licensing a gate to resolve without presentation', () => {
    const findings = findingsFor({
      'wf/workflow.yaml':
        'id: wf\nrules:\n  activity:\n    - When {headless_mode} is true, a checkpoint declaring both resolves to its defaultOption without presentation.\n',
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]!.check).toBe('presentation-rule-outside-its-home');
    expect(findings[0]!.site).toBe('wf/workflow.yaml rules.activity');
    expect(findings[0]!.detail).toContain('asserts a gate is not presented');
  });

  it('flags a rule naming the question-asking tool', () => {
    const findings = findingsFor({
      'wf/workflow.yaml': 'id: wf\nrules:\n  workflow:\n    - Surface the outcome as a plain message — never as an AskUserQuestion dialog.\n',
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]!.detail).toContain('names the question-asking tool');
  });

  it('flags a rule fragment, which binds the same agents once imported by ref', () => {
    const findings = findingsFor({
      'wf/workflow.yaml':
        'id: wf\nfragments:\n  rules:\n    shared:\n      - Soft mid-flow checkpoints auto-resolve without AskQuestion.\n',
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]!.site).toBe('wf/workflow.yaml fragments.rules.shared');
  });

  it('flags an activity rule and a technique Rules section', () => {
    const findings = findingsFor({
      'wf/workflow.yaml': CLEAN_WF,
      'wf/activities/01-thing.yaml': 'id: thing\nrules:\n  - The orchestrator presents the checkpoint to the user.\n',
      'wf/techniques/do-thing.md': '## Capability\n\nDo a thing.\n\n## Rules\n\n### skip-it\n\nCall respond_checkpoint with auto_advance true.\n',
    });
    expect(findings).toHaveLength(2);
    expect(findings.map((f) => f.site).sort()).toEqual([
      'wf/activities/01-thing.yaml rules[]',
      'wf/techniques/do-thing.md ## Rules',
    ]);
  });

  it('exempts the engine technique that owns the contract', () => {
    expect(findingsFor({
      'meta/workflow.yaml': 'id: meta\n',
      'meta/techniques/workflow-engine/present-checkpoint-to-user.md':
        '## Rules\n\n### present-before-any-resolution\n\nEvery resolution is preceded by an AskQuestion, except a soft mid-flow gate under headless mode, which resolves without presentation.\n',
    })).toEqual([]);
  });

  it('accepts a rule about a gate condition, which is not a presentation claim', () => {
    expect(findingsFor({
      'wf/workflow.yaml': CLEAN_WF,
      'wf/activities/01-thing.yaml': 'id: thing\nrules:\n  - A gate opens only where the run holds an open judgement.\n',
    })).toEqual([]);
  });

  it('does not scan prose outside a rule — a description states the mode without binding an agent', () => {
    expect(findingsFor({
      'wf/workflow.yaml':
        'id: wf\nvariables:\n  - name: headless_mode\n    type: boolean\n    description: Whether the run resolves a soft gate without presentation.\n',
    })).toEqual([]);
  });

  it('refuses to pass an empty corpus, so green-because-nothing-scanned is impossible', () => {
    const root = mkdtempSync(join(tmpdir(), 'wf-cppres-empty-'));
    try {
      expect(() => collectFindings(root)).toThrow(UnreachableCorpusError);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
