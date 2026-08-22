import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings } from '../scripts/check-checkpoint-entry.js';
import { UnreachableCorpusError } from '../scripts/workflows-root.js';

/**
 * Checkpoint-at-entry guard (#353 §1.4): no activity opens with a checkpoint.
 *
 * A first-step checkpoint means the worker is dispatched, paid full delivery, and yields before
 * doing any work — the whole first dispatch only asks a question. On the measured `work-package`
 * walk `11-validate` opened that way and cost 92,793 tokens over 2 dispatches for 18 tool calls.
 * Hard zero over the corpus; the fixtures pin both directions so a green corpus is evidence the
 * guard can still fire.
 */
describe('checkpoint-entry guard', () => {
  /** Write a one-workflow corpus with a single activity file and collect against it. */
  function findingsFor(activityYaml: string): ReturnType<typeof collectFindings> {
    const root = mkdtempSync(join(tmpdir(), 'wf-cpentry-'));
    try {
      mkdirSync(join(root, 'wf', 'activities'), { recursive: true });
      writeFileSync(join(root, 'wf', 'activities', '01-thing.yaml'), activityYaml);
      return collectFindings(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const CHECKPOINT = `  - kind: checkpoint
    id: ask-first
    message: Proceed?
    blocking: true
    options:
      - id: yes-go
        label: Go
`;
  const TECHNIQUE = `  - kind: technique
    id: do-work
    technique: some::op
`;

  it('flags an activity whose first step is a checkpoint', () => {
    const findings = findingsFor(`id: thing\nsteps:\n${CHECKPOINT}${TECHNIQUE}`);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.check).toBe('checkpoint-at-entry');
    expect(findings[0]!.site).toBe('wf/activities/01-thing.yaml');
    expect(findings[0]!.detail).toContain("activity 'thing' opens with checkpoint 'ask-first'");
  });

  it('accepts the same checkpoint once real work precedes it', () => {
    expect(findingsFor(`id: thing\nsteps:\n${TECHNIQUE}${CHECKPOINT}`)).toEqual([]);
  });

  it('flags a gated first-step checkpoint — a gate that is usually true is the same wasted dispatch', () => {
    const gated = `  - kind: checkpoint
    id: ask-first
    when: mode == 'interactive'
    message: Proceed?
    options:
      - id: yes-go
        label: Go
`;
    expect(findingsFor(`id: thing\nsteps:\n${gated}${TECHNIQUE}`)).toHaveLength(1);
  });

  it('refuses to pass an empty corpus, so green-because-nothing-scanned is impossible', () => {
    const root = mkdtempSync(join(tmpdir(), 'wf-cpentry-empty-'));
    try {
      expect(() => collectFindings(root)).toThrow(UnreachableCorpusError);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
