import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collect } from '../guards/check-inventory-schema-agreement.js';

/**
 * inventory-schema-agreement guard: the construct inventory reads rows only under a heading of the
 * section form, so a heading written any other way would leave the field check reading nothing.
 * These fixtures pin that such an inventory fails rather than passing on an empty read.
 */
describe('inventory-schema-agreement guard', () => {
  function findingsFor(inventory: string): ReturnType<typeof collect> {
    const root = mkdtempSync(join(tmpdir(), 'wf-inventory-'));
    try {
      const dir = join(root, 'corpus', 'canon', 'resources');
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'schema-construct-inventory.md'), inventory, 'utf-8');
      return collect(root).filter((f) => f.check !== 'kind-without-row');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const row = '| Prose | Construct |\n|---|---|\n| a gate | `exits[].when` |\n';

  it('reads a section heading in plain parentheses', () => {
    expect(findingsFor(`# Inventory\n\n## Activity-Level Constructs (activity.schema.json)\n\n${row}`)).toEqual([]);
  });

  it('checks the rows under a section heading', () => {
    const findings = findingsFor('# Inventory\n\n## Activity-Level Constructs (activity.schema.json)\n\n'
      + '| Prose | Construct |\n|---|---|\n| a gate | `nosuchfield.when` |\n');
    expect(findings.map((f) => f.check)).toEqual(['unknown-field']);
  });

  it('reports a heading that names a schema outside the section form, and the empty read it leaves', () => {
    const findings = findingsFor('# Inventory\n\n## Activity-Level Constructs (`activity.schema.json`)\n\n'
      + '| Prose | Construct |\n|---|---|\n| a gate | `nosuchfield.when` |\n');
    expect(findings.map((f) => f.check)).toEqual(['section-unread', 'no-section']);
    expect(findings[0]!.site).toBe('corpus/canon/resources/schema-construct-inventory.md:3');
  });

  it('reports an inventory with no section heading', () => {
    expect(findingsFor(`# Inventory\n\n## Constructs\n\n${row}`).map((f) => f.check)).toEqual(['no-section']);
  });
});
