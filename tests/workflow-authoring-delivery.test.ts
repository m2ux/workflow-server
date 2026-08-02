import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { loadResourceDelivery } from '../src/utils/resource-delivery.js';
import { resolveWorkflowsRoot } from '../scripts/workflows-root.js';
import { join, resolve } from 'node:path';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { parse } from 'yaml';

/**
 * Delivery regression guard for `workflow-authoring`'s criteria bundle.
 *
 * `workflow-authoring` cites its four criteria homes cross-workflow into `workflow-design`
 * rather than copying them, so the corpus holds one physical copy of a 154 KB canon. That makes
 * the citation a live dependency between two trees, and the failure mode is silent: an
 * unresolvable resource is skipped in the eager loop with a bare `continue` and no warning
 * (`src/tools/workflow-tools.ts`), and `check-resource-anchors` cannot see a reference in
 * already-projected form because its pattern requires a `.md#` target. So deleting or moving
 * `workflow-design/resources/` empties the bundle with every guard still green.
 *
 * This test is the detector. It asserts, over the MCP wire against the served corpus, that:
 *
 *   1. `quality-review` delivers exactly the eager-eligible step techniques. `collectUngated`
 *      skips on `when`/`condition` before recursing into a loop and pushes only `kind: technique`
 *      steps carrying an `id`, so the set is a structural consequence of the authored gates —
 *      adding a gate to a swept step silently drops it from the bundle.
 *   2. Every criteria home reaches the worker as a resource reference, each anti-pattern unit
 *      carrying its `#section` anchor. `anti-patterns.md` is larger than the per-resource eager
 *      cap, so a whole-file reference can never be bundled and would be skipped without warning;
 *      per-section anchors are what keep each unit reachable at all.
 *   3. Every delivered reference resolves. This is the assertion that fails the moment
 *      `workflow-design`'s resources move, which is what makes it safe to retire that tree.
 *
 * The suite is conditional on `workflow-authoring` being present in the resolved workflows root,
 * because the tree lands on the `workflows` branch before the submodule pointer moves. Point it
 * at the branch with `WORKFLOWS_DIR` in that window; once the submodule carries the tree the
 * suite runs unconditionally. The condition is on presence of the tree, never on the assertions:
 * a present tree with a broken bundle fails.
 */

const WORKFLOWS_ROOT = resolveWorkflowsRoot(resolve(join(import.meta.dirname, '..', 'workflows')));
const TREE_PRESENT = existsSync(join(WORKFLOWS_ROOT, 'workflow-authoring', 'workflow.yaml'));

/**
 * The eager-eligible step ids of `quality-review`, in document order. Every one is a
 * `kind: technique` step carrying an `id` and no `when`/`condition`, at top level or inside the
 * ungated sweep loop. The two remediation steps are gated and the loop container is recursed
 * into rather than pushed, so neither appears.
 */
const EAGER_STEP_IDS = [
  'load-known-findings',
  'survey-reference-workflows',
  'rebind-target-baseline',
  'resolve-consumer-surface',
  'inventory-prose-fields',
  'sweep-canon',
  'validate-schema',
];

/**
 * Every `##` section of the anti-pattern home, which is that home in full. Four entries sit
 * outside the family sections, so a walk that matches titles by pattern drops them — the walking
 * operation enumerates this list for the same reason, and this is the assertion that the
 * enumeration survives delivery.
 */
const ANTI_PATTERN_SECTIONS = [
  'creation-rules',
  'structural-anti-patterns',
  'interaction-anti-patterns',
  'schema-expressiveness-anti-patterns',
  'rule-hygiene-anti-patterns',
  'description-hygiene-anti-patterns',
  'coupling-anti-patterns',
  'tool-technique-doc-consistency-anti-patterns',
  'execution-anti-patterns',
  'output-economy-anti-patterns',
  'canon-hygiene-anti-patterns',
  'technique-protocol-anti-patterns',
  'authoring-guidance-mr',
];

/** The criteria references `quality-review` must deliver, in the qualified form get_resource takes. */
const CRITERIA_IDS = [
  ...ANTI_PATTERN_SECTIONS.map(s => `workflow-design/anti-patterns#${s}`),
  'workflow-design/design-principles',
  'workflow-design/schema-construct-inventory',
  'workflow-design/convention-conformance',
];

describe.skipIf(!TREE_PRESENT)(`workflow-authoring criteria delivery (workflows root: ${WORKFLOWS_ROOT})`, () => {
  let client: Client;
  let closeTransport: () => Promise<void>;
  let workspaceDir: string;
  let sessionIndex: string;
  let ops: Record<string, unknown>;
  let meta: Record<string, unknown>;

  beforeAll(async () => {
    workspaceDir = mkdtempSync(join(tmpdir(), 'wf-authoring-delivery-'));
    const server = createServer({
      workflowDir: WORKFLOWS_ROOT,
      schemasDir: join(import.meta.dirname, '../schemas'),
      workspaceDir,
      serverName: 'test-workflow-server',
      serverVersion: '1.0.0',
      minCheckpointResponseSeconds: 0,
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'test-client', version: '1.0.0' }, {});
    await client.connect(clientTransport);
    closeTransport = async () => { await client.close(); await server.close(); };

    const started = await client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'workflow-authoring',
        agent_id: 'orchestrator',
        planning_folder: join(workspaceDir, '.engineering/artifacts/planning/delivery-probe'),
      },
    }) as { isError?: boolean; content?: Array<{ text: string }> };
    expect(started.isError).toBeFalsy();
    sessionIndex = (JSON.parse(started.content![0]!.text) as { session_index: string }).session_index;

    const entered = await client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: 'quality-review' },
    }) as { isError?: boolean };
    expect(entered.isError).toBeFalsy();

    const delivered = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200_000 },
    }) as { isError?: boolean; content?: Array<{ text: string }>; _meta?: Record<string, unknown> };
    expect(delivered.isError).toBeFalsy();
    ops = parse(delivered.content![0]!.text.split('\n\n---\n\n')[0]!) as Record<string, unknown>;
    meta = delivered._meta ?? {};
  });

  afterAll(async () => {
    await closeTransport?.();
    try { rmSync(workspaceDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it('delivers exactly the eager-eligible step techniques', () => {
    const stepTechniques = ops['step_techniques'] as Record<string, unknown> | undefined;
    expect(stepTechniques).toBeDefined();
    expect(Object.keys(stepTechniques!).sort()).toEqual([...EAGER_STEP_IDS].sort());
  });

  it('delivers every criteria home as a resource reference', () => {
    // A fresh worker runs in full delivery mode, which ships resource ids and no bodies. The
    // ids are the contract: the worker fetches the units it reads with get_resource.
    const refs = (meta['resource_refs'] as string[] | undefined) ?? [];
    expect(refs.length).toBeGreaterThan(0);
    expect(CRITERIA_IDS.filter(id => !refs.includes(id))).toEqual([]);
  });

  it('addresses every anti-pattern unit by section, never as a whole file', () => {
    const refs = (meta['resource_refs'] as string[] | undefined) ?? [];
    const antiPatternRefs = refs.filter(r => r.startsWith('workflow-design/anti-patterns'));
    expect(antiPatternRefs.length).toBeGreaterThan(0);
    expect(antiPatternRefs.filter(r => !r.includes('#'))).toEqual([]);
  });

  it('resolves every delivered reference, so no criteria unit is silently absent', async () => {
    const refs = (meta['resource_refs'] as string[] | undefined) ?? [];
    const unresolved: string[] = [];
    for (const id of refs) {
      const loaded = await loadResourceDelivery(WORKFLOWS_ROOT, 'workflow-authoring', id, sessionIndex);
      if (!loaded.success) unresolved.push(`${id} — ${loaded.error.message}`);
    }
    expect(unresolved).toEqual([]);
  });

  it('keeps every criteria unit inside the per-resource eager cap', async () => {
    // The whole anti-pattern file exceeds the cap, so an oversized unit would be skipped in the
    // eager loop with no warning. Fetching by section is what keeps each unit deliverable.
    const oversized: string[] = [];
    for (const id of CRITERIA_IDS) {
      const loaded = await loadResourceDelivery(WORKFLOWS_ROOT, 'workflow-authoring', id, sessionIndex);
      if (loaded.success && loaded.value.content.length > 80_000) {
        oversized.push(`${id} — ${loaded.value.content.length} chars`);
      }
    }
    expect(oversized).toEqual([]);
  });
});
