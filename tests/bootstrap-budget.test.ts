/**
 * Bootstrap-time fixed content stays inside the budget the protocol states (#404 W4).
 *
 * Before an orchestrator makes any decision it reads a fixed block: the bootstrap text `discover`
 * returns, the session-start response, and the operations bundle `get_workflow` delivers. Those are
 * the same characters on every run, so their size is a property of the corpus and the server rather
 * than of a session.
 *
 * The budget lives here rather than in the bootstrap text. It bounds what the server and corpus
 * hand over, and an orchestrator can do nothing with the figure: it cannot shrink the bundle, refuse
 * part of it, or act differently for having read it. Bootstrap prose is executed by a reader holding
 * only a checkout and a tool surface, so a number that reader cannot spend does not belong there —
 * the enforcement point owns its own threshold instead.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { corpusRoot } from './corpus-root.js';
import { createHarness, rawText, isError, parseToolResponse } from './e2e/harness.js';

/**
 * Characters of fixed content an orchestrator reads before its first decision: the `discover` text,
 * the session-start response, and the operations bundle. Raise it deliberately — it grows only when
 * the corpus decides an orchestrator needs more before it can act.
 *
 * 113,000 since the checkpoint presentation contract took one home (#400 W1). When a gate is
 * presented, what makes a gate soft, and which gate may never be soft are stated once, in the two
 * workflow-engine operations that present and resolve a checkpoint — and those operations are in
 * this bundle, because the orchestrator reading it is the agent that resolves gates. The same text
 * previously sat in four workflow rule buckets, three of them delivered to workers who cannot
 * resolve a gate at all; those copies are gone, but they were never counted here.
 *
 * 112,000 since conduct took homes named by audience (#518 W5.2, #519). Two movements, and the
 * bundle came out smaller. Five conduct rules that were homed in two domain workflows, and so
 * never reached the agent that talks to the user, now arrive from the shared home and cost about
 * 1,200 characters. Against that, a technique declaring no interface and no procedure stopped
 * receiving the inherited bind contract it has nothing to bind, which took about 5,100 characters
 * out of this bundle — the conduct techniques and the harness adapters were each carrying it.
 */
const BUDGET = 112_000;

describe('bootstrap-time fixed content', () => {
  it('stays inside the budget this suite sets', async () => {
    const budget = BUDGET;
    const h = await createHarness();
    try {
      const discovered = await h.client.callTool({ name: 'discover', arguments: {} });
      expect(isError(discovered)).toBe(false);

      const started = await h.client.callTool({
        name: 'start_session',
        arguments: {
          workflow_id: 'meta',
          agent_id: 'orchestrator',
          planning_folder: join(h.workspaceDir, '.engineering/artifacts/planning', 'bootstrap-budget'),
        },
      });
      expect(isError(started)).toBe(false);
      const sessionIndex = parseToolResponse(started).session_index as string;

      const workflow = await h.client.callTool({ name: 'get_workflow', arguments: { session_index: sessionIndex } });
      expect(isError(workflow)).toBe(false);

      const parts = {
        discover: rawText(discovered).length,
        startSession: rawText(started).length,
        getWorkflow: rawText(workflow).length,
      };
      const total = parts.discover + parts.startSession + parts.getWorkflow;
      console.log(`[bootstrap-budget] ${total} of ${budget} chars — ${JSON.stringify(parts)}`);

      expect(
        total,
        `bootstrap-time fixed content is ${total} characters against a stated budget of ${budget}: `
        + `discover ${parts.discover}, start_session ${parts.startSession}, get_workflow ${parts.getWorkflow}. `
        + 'Either trim what the orchestrator receives before its first decision, or raise BUDGET here '
        + 'with the reason it moved.',
      ).toBeLessThanOrEqual(budget);
    } finally {
      await h.close();
    }
  });

  it('sends the orchestrator to read no definition schema before it decides', () => {
    const path = join(corpusRoot(), 'meta', 'resources', 'bootstrap-protocol.md');
    const text = readFileSync(path, 'utf8');
    // A definition schema is orders of magnitude larger than the part of it an orchestrator acts on,
    // so the read belongs to whichever context authors a definition.
    expect(text).not.toMatch(/workflow-server:\/\/schemas/);
  });
});
