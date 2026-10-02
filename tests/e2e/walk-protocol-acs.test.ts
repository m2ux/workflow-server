/**
 * AC14–AC26 of epic I00:E06, read off the corpus tree this suite is pointed at.
 *
 * The checks live with the definitions (`walks/check-walk-protocol-acs.py`), so a corpus
 * pull request runs them in its own gate. This suite runs the same file when the tree has
 * it. AC27, the engine refusal, is `tests/fan-unbound-refusal.test.ts`.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { liveCorpusRoot } from '../corpus-root.js';

const root = liveCorpusRoot();
const script = root === null ? '' : join(root, 'walks/check-walk-protocol-acs.py');

describe.skipIf(script === '' || !existsSync(script))('walk-protocol acceptance criteria AC14–AC26', () => {
  it('holds on the corpus tree', () => {
    const out = execFileSync('python3', [script], { encoding: 'utf8' });
    expect(out).toContain('AC14–AC26 hold');
  });

  it('fails AC14 when the opening clear is gone', () => {
    const out = execFileSync('python3', [script, '--self-test'], { encoding: 'utf8' });
    expect(out).toContain('fails AC14');
  });
});
