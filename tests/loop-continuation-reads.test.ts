import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deriveActivityContract } from '../src/utils/activity-variables.js';
import type { Activity } from '../src/schema/activity.schema.js';

/**
 * When a loop's continuation test is read. A `while` takes it before the first pass, so it reads
 * the value the activity was entered with. A `doWhile` takes it after a pass, so a value its body
 * writes is the activity's own production and not something the host must supply.
 */

const FLAG_TEST = { type: 'simple', variable: 'more_to_do', operator: '==', value: true };

const setFlag = { kind: 'action', id: 'settle', actions: [{ action: 'set', target: 'more_to_do', value: false }] };
const note = { kind: 'action', id: 'note', actions: [{ action: 'log', message: 'pass' }] };

async function contractOf(loop: Record<string, unknown>): Promise<{ reads: string[]; internalReads: string[] }> {
  const root = mkdtempSync(join(tmpdir(), 'wf-loop-test-'));
  try {
    const activity = {
      id: 'host', version: '1.0.0', name: 'Host', required: true,
      steps: [{ kind: 'loop', id: 'rounds', name: 'Rounds', continueWhile: FLAG_TEST, maxIterations: 3, ...loop }],
    } as unknown as Activity;
    const derived = await deriveActivityContract({
      activity, workflowDir: root, scopeWorkflowId: 'wf',
      namespace: new Set(['more_to_do']), routines: () => undefined,
    });
    return { reads: [...derived.reads].sort(), internalReads: [...derived.internalReads].sort() };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe('a loop continuation test', () => {
  it('in a doWhile reads what the body wrote as the activity\'s own value', async () => {
    const contract = await contractOf({ loopType: 'doWhile', steps: [note, setFlag] });
    expect(contract.reads).toEqual([]);
    expect(contract.internalReads).toEqual(['more_to_do']);
  });

  it('in a doWhile whose last body step is a nested loop is read after that loop\'s body', async () => {
    const inner = { kind: 'loop', id: 'inner', name: 'Inner', loopType: 'forEach', over: 'work_items', variable: 'current_item', steps: [setFlag] };
    const contract = await contractOf({ loopType: 'doWhile', steps: [note, inner] });
    expect(contract.reads).toEqual([]);
    expect(contract.internalReads).toEqual(['more_to_do']);
  });

  it('in a doWhile whose body does not write the value is a read of the host', async () => {
    const contract = await contractOf({ loopType: 'doWhile', steps: [note] });
    expect(contract.reads).toEqual(['more_to_do']);
  });

  it('in a while is read before the first pass', async () => {
    const contract = await contractOf({ loopType: 'while', steps: [note, setFlag] });
    expect(contract.reads).toEqual(['more_to_do']);
  });
});
