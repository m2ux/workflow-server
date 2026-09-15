import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeLoadableWorkflowFixture, writeRoutineFixture } from './corpus-fixture.js';
import { collectFindings } from '../guards/check-checkpoint-entry.js';
import { UnreachableCorpusError } from '../guards/workflows-root.js';
import type { Finding } from '../guards/guard-protocol.js';

/**
 * Checkpoint-at-entry guard (#353 §1.4): no activity opens with a checkpoint.
 *
 * A first-step checkpoint means the worker is dispatched, paid full delivery, and yields before
 * doing any work — the whole first dispatch only asks a question. On the measured `work-package`
 * walk `11-validate` opened that way and cost 92,793 tokens over 2 dispatches for 18 tool calls.
 * Hard zero over the corpus; the fixtures pin both directions so a green corpus is evidence the
 * guard can still fire.
 *
 * The guard reads the MATERIALISED activities (#704), so every tree here has to LOAD — unlike a
 * fixture read raw, an activity the loader refuses is simply absent and the guard measures less.
 * That is what the routine arms below turn on: a reference in first position is a checkpoint at
 * entry only once the reference is expanded.
 */
describe('checkpoint-entry guard', () => {
  /** Write a one-workflow corpus and collect against it. `routines` is written beside `activities`. */
  async function findingsFor(
    activityYaml: string,
    routines: Record<string, string> = {},
  ): Promise<Finding[]> {
    const root = mkdtempSync(join(tmpdir(), 'wf-cpentry-'));
    try {
      writeLoadableWorkflowFixture(root, 'wf', ['thing']);
      mkdirSync(join(root, 'wf', 'activities'), { recursive: true });
      writeFileSync(join(root, 'wf', 'activities', '01-thing.yaml'), activityYaml);
      for (const [name, body] of Object.entries(routines)) writeRoutineFixture(root, 'wf', name, body);
      return await collectFindings(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const HEADER = 'id: thing\nversion: 1.0.0\nname: Thing\nsteps:\n';
  const CHECKPOINT = `  - kind: checkpoint
    id: ask-first
    message: Proceed?
    options:
      - id: yes-go
        label: Go
`;
  const TECHNIQUE = `  - kind: technique
    id: do-work
    technique: some::op
`;

  it('flags an activity whose first step is a checkpoint', async () => {
    const findings = await findingsFor(`${HEADER}${CHECKPOINT}${TECHNIQUE}`);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.check).toBe('checkpoint-at-entry');
    expect(findings[0]!.site).toBe('wf/activities/01-thing.yaml');
    expect(findings[0]!.detail).toContain("activity 'thing' opens with checkpoint 'ask-first'");
  });

  it('accepts the same checkpoint once real work precedes it', async () => {
    expect(await findingsFor(`${HEADER}${TECHNIQUE}${CHECKPOINT}`)).toEqual([]);
  });

  it('flags a gated first-step checkpoint — a gate that is usually true is the same wasted dispatch', async () => {
    const gated = `  - kind: checkpoint
    id: ask-first
    when: mode == 'interactive'
    message: Proceed?
    options:
      - id: yes-go
        label: Go
`;
    expect(await findingsFor(`${HEADER}${gated}${TECHNIQUE}`)).toHaveLength(1);
  });

  /**
   * The pair the column move exists for. Read as written, both arms are a `kind: routine` step and
   * the rule sees no checkpoint at all — so the negative arm would pass for the wrong reason and the
   * positive arm would not fire.
   */
  const REFERENCE = `  - kind: routine
    id: open-run
    routine: opening-run
`;

  it('flags a reference in first position to a routine that opens with a checkpoint', async () => {
    const findings = await findingsFor(`${HEADER}${REFERENCE}${TECHNIQUE}`, {
      'opening-run': `id: opening-run\nversion: 1.0.0\nname: Opening Run\nsteps:\n${CHECKPOINT}`,
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]!.check).toBe('checkpoint-at-entry');
    // The composed id, so the finding names the step the worker actually meets.
    expect(findings[0]!.detail).toContain("checkpoint 'open-run.ask-first'");
  });

  it('accepts a reference in first position to a routine that opens with work', async () => {
    expect(await findingsFor(`${HEADER}${REFERENCE}`, {
      'opening-run': `id: opening-run\nversion: 1.0.0\nname: Opening Run\nsteps:\n${TECHNIQUE}${CHECKPOINT}`,
    })).toEqual([]);
  });

  it('refuses to pass an empty corpus, so green-because-nothing-scanned is impossible', async () => {
    const root = mkdtempSync(join(tmpdir(), 'wf-cpentry-empty-'));
    try {
      await expect(collectFindings(root)).rejects.toThrow(UnreachableCorpusError);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
