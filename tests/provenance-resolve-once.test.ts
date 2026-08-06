/**
 * Resolve work is paid once per delivery, not once per step (#404 W1).
 *
 * The producer scan reads every bound op in the workflow to learn its declared outputs. That answer
 * does not vary with the step being decorated — only the step's document-order position does — so a
 * delivery that inlines several steps builds one index and reads each position out of it. This test
 * counts the loader reads behind both shapes, which is the figure that regresses if the scan moves
 * back inside the per-step loop.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

/** Every `readTechnique` the scan makes, in order. Reset per test. */
const readCalls: string[] = [];

vi.mock('../src/loaders/technique-loader.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/loaders/technique-loader.js')>();
  return {
    ...actual,
    readTechnique: async (id: string, dir: string, wfId?: string) => {
      readCalls.push(id);
      return actual.readTechnique(id, dir, wfId);
    },
  };
});

const { buildProducerIndex, provenanceContextFor, buildProvenanceContext } =
  await import('../src/utils/binding-provenance.js');
type Workflow = import('../src/schema/workflow.schema.js').Workflow;

describe('provenance resolve work per delivery', () => {
  let workflowDir: string;

  beforeAll(() => {
    workflowDir = mkdtempSync(join(tmpdir(), 'wf-resolve-once-'));
    const tdir = join(workflowDir, 'testwf', 'techniques');
    mkdirSync(tdir, { recursive: true });
    const op = (capability: string, outputId: string): string =>
      `---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\n${capability}\n\n## Outputs\n\n### ${outputId}\n\nThe value.\n\n## Protocol\n\n### 1. Go\n\n- Do it.\n`;
    for (const [file, output] of [['alpha', 'alpha_out'], ['beta', 'beta_out'], ['gamma', 'gamma_out'], ['delta', 'delta_out']]) {
      writeFileSync(join(tdir, `${file}.md`), op(`Do ${file}.`, output!));
    }
  });

  afterAll(() => {
    try { rmSync(workflowDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  /** Two activities, four technique steps — three of them in the activity a delivery would inline. */
  const workflow = (): Workflow => ({
    id: 'testwf',
    version: '1.0.0',
    title: 'Test workflow',
    activities: [
      {
        id: 'first', version: '1.0.0', name: 'First', required: true,
        steps: [{ kind: 'technique', id: 'run-alpha', technique: 'alpha', required: true }],
      },
      {
        id: 'second', version: '1.0.0', name: 'Second', required: true,
        steps: [
          { kind: 'technique', id: 'run-beta', technique: 'beta', required: true },
          { kind: 'technique', id: 'run-gamma', technique: 'gamma', required: true },
          { kind: 'technique', id: 'run-delta', technique: 'delta', required: true },
        ],
      },
    ],
  });

  const STEPS = ['run-beta', 'run-gamma', 'run-delta'];

  it('resolves each unique technique at most once across every step of one delivery', async () => {
    readCalls.length = 0;
    const index = await buildProducerIndex({ workflow: workflow(), workflowDir });
    const afterScan = readCalls.length;

    // Every step of the delivered activity reads its position out of the one index.
    for (const stepId of STEPS) {
      expect(provenanceContextFor(index, 'second', stepId)).not.toBeNull();
    }
    expect(readCalls.length).toBe(afterScan);

    // Four bound ops in the workflow, each resolved once — the scan's own memo covers the repeat
    // attempts the activity-group shorthand makes for a bare ref.
    expect(index.resolvedTechniques).toBe(4);
    const distinct = new Set(readCalls);
    expect([...distinct].filter((id) => !id.includes('::')).sort()).toEqual(['alpha', 'beta', 'delta', 'gamma']);
    for (const id of distinct) {
      expect(readCalls.filter((seen) => seen === id).length).toBe(1);
    }
  });

  it('decorating three steps costs the same reads as decorating one', async () => {
    readCalls.length = 0;
    const index = await buildProducerIndex({ workflow: workflow(), workflowDir });
    for (const stepId of STEPS) provenanceContextFor(index, 'second', stepId);
    const oneIndexReads = readCalls.length;

    // The single-step helper is a scan apiece — what a per-step rebuild costs a delivery.
    readCalls.length = 0;
    for (const stepId of STEPS) {
      await buildProvenanceContext({ workflow: workflow(), workflowDir, currentActivityId: 'second', currentStepId: stepId });
    }
    expect(readCalls.length).toBe(oneIndexReads * STEPS.length);
  });

  it('places every step it can and reports the rest as unlocatable', async () => {
    const index = await buildProducerIndex({ workflow: workflow(), workflowDir });
    expect(provenanceContextFor(index, 'first', 'run-alpha')?.position).toBe(0);
    expect(provenanceContextFor(index, 'second', 'run-beta')?.position).toBe(1);
    expect(provenanceContextFor(index, 'second', 'run-delta')?.position).toBe(3);
    expect(provenanceContextFor(index, 'second', 'no-such-step')).toBeNull();
    // A step id that exists in another activity is not this activity's step.
    expect(provenanceContextFor(index, 'first', 'run-beta')).toBeNull();
  });

  it('one index and a per-step scan produce identical contexts', async () => {
    const index = await buildProducerIndex({ workflow: workflow(), workflowDir });
    for (const stepId of STEPS) {
      const fromIndex = provenanceContextFor(index, 'second', stepId)!;
      const perStep = (await buildProvenanceContext({
        workflow: workflow(), workflowDir, currentActivityId: 'second', currentStepId: stepId,
      }))!;
      expect(fromIndex.position).toBe(perStep.position);
      expect(fromIndex.producers).toEqual(perStep.producers);
      expect([...fromIndex.declaredVariables]).toEqual([...perStep.declaredVariables]);
    }
  });
});
