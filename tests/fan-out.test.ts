import { describe, it, expect } from 'vitest';
import type { Technique } from '../src/schema/technique.schema.js';
import { measureOperation, fanOutRatios, fanOutLines } from '../src/utils/fan-out.js';

/** Minimal composed operation: one container rule that names it, one inherited input it templates. */
function sample(): Technique {
  return {
    id: 'group::sample-op',
    version: '1.0.0',
    capability: 'A sample operation.',
    rules: {
      'sample-op-rule': 'sample-op must name the file it writes.',
      'cross-cutting': 'Every operation in the group follows the container contract.',
    },
    inherited_inputs: {
      note: 'Shared by the group.',
      items: [
        { id: 'planning_folder_path', description: 'The session planning folder.' },
        { id: 'unused_input', description: 'Declared on the container, unused here.' },
      ],
    },
    protocol: [{ steps: ['Write the artifact under {planning_folder_path}.'] }],
  };
}

describe('fan-out pair', () => {
  it('reports container-rule reach and inherited I/O templating, and no other ratio', () => {
    const m = measureOperation(sample());
    const ratios = fanOutRatios(m);
    expect(Object.keys(ratios)).toEqual(['ruleReachPct', 'inheritedIoReachPct']);
    expect(m.ruleEntries).toBe(2);
    expect(m.ruleEntriesNamingTheirOperation).toBe(1);
    expect(ratios.ruleReachPct).toBe(50);
    expect(m.inheritedIoItems).toBe(2);
    expect(m.inheritedIoItemsTemplated).toBe(1);
    expect(ratios.inheritedIoReachPct).toBe(50);

    const lines = fanOutLines(m);
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('container rules');
    expect(lines[2]).toContain('inherited I/O');
    expect(lines.join('\n')).not.toMatch(/no tool|unused content|dead content/i);
  });
});
