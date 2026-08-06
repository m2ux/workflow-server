/**
 * The checkpoint protocols reach the activities that can reach a checkpoint (#404 W5).
 *
 * A yield requires a `kind: checkpoint` step and a resume follows a yield, so an activity holding no
 * checkpoint step reaches neither protocol. Delivering them there spends a worker's budget on content
 * its own role technique guards behind a branch that cannot be taken.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { CHECKPOINT_WORKER_TECHNIQUES, CORE_WORKER_TECHNIQUES } from '../src/loaders/core-ops.js';
import { loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import { flattenActivitySteps } from '../src/schema/activity.schema.js';
import { corpusRoot } from './corpus-root.js';
import { createHarness, rawText, isError, parseToolResponse, type Harness } from './e2e/harness.js';

/** Activities of the main workflow with and without a checkpoint step. */
const WITH_CHECKPOINT = 'implementation-analysis';
const WITHOUT_CHECKPOINT = 'validate';

describe('checkpoint protocols in the core worker set', () => {
  it('are members of the core set, so leaving them out is a subset rather than a substitution', () => {
    for (const ref of CHECKPOINT_WORKER_TECHNIQUES) {
      expect(CORE_WORKER_TECHNIQUES).toContain(ref);
    }
  });

  it('sees a checkpoint wherever the authored YAML has one, over the whole corpus', async () => {
    // The delivery decides from the LOADED activity; an author writes the raw file. A checkpoint the
    // loaded object does not show is one whose activity would lose the protocols it needs to yield —
    // silently, since nothing else reads that decision. So the two views are compared directly, over
    // every activity, rather than trusted to agree: a checkpoint step carries `kind: checkpoint`
    // whether its body is inline or arrives through a `ref:`, and this is what keeps that true.
    const root = corpusRoot();
    let scanned = 0;
    for (const workflow of readdirSync(root)) {
      const dir = join(root, workflow, 'activities');
      if (!existsSync(dir)) continue;
      const loaded = await loadWorkflowWithDiagnostics(root, workflow);
      if (!loaded.success) continue;
      for (const file of readdirSync(dir).filter((f) => f.endsWith('.yaml'))) {
        const raw = readFileSync(join(dir, file), 'utf8');
        const rawHas = /^\s*-?\s*kind:\s*checkpoint\s*$/m.test(raw);
        const id = /^id:\s*(\S+)/m.exec(raw)?.[1];
        const activity = loaded.value.workflow.activities?.find((a) => a.id === id);
        if (!activity) continue;
        scanned += 1;
        expect(
          flattenActivitySteps(activity).some((s) => s.kind === 'checkpoint'),
          `${workflow}/${file}: the loaded activity and the authored YAML disagree on whether it has a checkpoint`,
        ).toBe(rawHas);
      }
    }
    expect(scanned).toBeGreaterThan(50);
  });
});

describe('what an activity receives', () => {
  let h: Harness;
  let sessionIndex: string;

  beforeAll(async () => {
    h = await createHarness();
    const started = await h.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'work-package', agent_id: 'orchestrator',
        planning_folder: join(h.workspaceDir, '.engineering/artifacts/planning', 'checkpoint-reach'),
      },
    });
    if (isError(started)) throw new Error(rawText(started));
    sessionIndex = parseToolResponse(started).session_index as string;
  });

  afterAll(async () => { await h?.close(); });

  const take = async (activityId: string, agentId: string): Promise<string> => {
    const entered = await h.client.callTool({
      name: 'next_activity', arguments: { session_index: sessionIndex, activity_id: activityId },
    });
    if (isError(entered)) throw new Error(rawText(entered));
    const taken = await h.client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200000, agent_id: agentId },
    });
    if (isError(taken)) throw new Error(rawText(taken));
    return rawText(taken);
  };

  it('delivers both protocols to an activity that carries a gate', async () => {
    const text = await take(WITH_CHECKPOINT, 'gated-worker');
    expect(text).toContain('yield-checkpoint');
    expect(text).toContain('resume-from-checkpoint');
  });

  it('leaves them out of an activity that carries none, and delivers everything else', async () => {
    const text = await take(WITHOUT_CHECKPOINT, 'ungated-worker');
    // The bundle keys name what arrived; a technique left out has no entry of its own.
    expect(text).not.toMatch(/^ {2}workflow-engine::yield-checkpoint:/m);
    expect(text).not.toMatch(/^ {2}workflow-engine::resume-from-checkpoint:/m);
    // The rest of the core worker set still arrives — this is a subset, not a different bundle.
    expect(text).toContain('activity-worker');
    expect(text).toContain('finalize-activity');
    // And the activity itself is intact.
    expect(text).toContain(`id: ${WITHOUT_CHECKPOINT}`);
  });

  it('costs the gated activity more than the ungated one for the same core set', async () => {
    const gated = await take(WITH_CHECKPOINT, 'size-gated');
    const ungated = await take(WITHOUT_CHECKPOINT, 'size-ungated');
    // Not a like-for-like comparison of the two activities, which bind different steps — the figure
    // that matters is measured against the same activity with and without, recorded in the epic's
    // delivery record at 4,060 characters. What this asserts is that the ungated delivery is the
    // smaller of the two, which is the direction the change is for.
    expect(ungated.length).toBeLessThan(gated.length);
  });
});
