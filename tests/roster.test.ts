import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadRoster, rosterIds } from '../scripts/roster.js';

describe('loadRoster', () => {
  it('reads walked ids and not-walked entries with reasons', () => {
    const root = mkdtempSync(join(tmpdir(), 'roster-'));
    try {
      mkdirSync(join(root, 'walks'));
      writeFileSync(join(root, 'walks', 'roster.json'), JSON.stringify({
        walked: ['work-package', 'meta'],
        notWalked: [
          { id: 'remediate-vuln', reason: 'expensive and broken branches' },
          { id: 'fan-conformance' },
        ],
      }));
      const roster = loadRoster(root);
      expect(roster.walked).toEqual(['work-package', 'meta']);
      expect(roster.notWalked).toEqual([
        { id: 'remediate-vuln', reason: 'expensive and broken branches' },
        { id: 'fan-conformance' },
      ]);
      expect(rosterIds(roster)).toEqual(['work-package', 'meta', 'remediate-vuln', 'fan-conformance']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
