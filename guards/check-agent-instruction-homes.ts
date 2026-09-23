#!/usr/bin/env npx tsx
/**
 * One home for each body of agent instruction.
 *
 * `AGENTS.md` on this tree sends an agent to the workspace `AGENTS.md` first, so anything stated in
 * both is read twice and the repo copy is the one that loses. That is not hypothetical: the code
 * intelligence section stood in both, and the two copies had already drifted apart on the index
 * statistics they quote and on the skill roster they list, with the repo copy the stale and shorter
 * of the two.
 *
 * The section is injected by an external tool (`npx gitnexus analyze`), which nothing in this
 * repository configures. So the copy cannot be prevented at its source — it can only be refused
 * once it lands. This guard is that refusal: a regeneration that re-adds the block fails the sweep
 * rather than merging as an unreviewed 300-word duplicate.
 *
 * The markers are checked as well as the heading, because a formatter has already deleted the
 * closing marker once while leaving the block behind — so absence of a marker proves nothing about
 * absence of the content.
 */
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { report, type Finding } from './guard-protocol.js';

const ROOT = resolve(import.meta.dirname, '..');

/** A body of instruction that belongs to exactly one file, and the pattern that spots a second copy. */
interface Home {
  /** What the content is, for the finding text. */
  subject: string;
  /** Where it is authored. */
  home: string;
  /** Files that must not restate it. */
  mustNotRestate: string[];
  /** Any match means a copy is present. */
  signatures: RegExp[];
}

const HOMES: Home[] = [
  {
    subject: 'code intelligence guidance',
    home: 'the workspace AGENTS.md, which this repo defers to',
    mustNotRestate: ['AGENTS.md', 'CLAUDE.md'],
    signatures: [
      /<!--\s*gitnexus:(begin|end)\s*-->/,
      /^#{1,3}\s.*GitNexus/m,
      /This project is indexed by GitNexus/,
      /gitnexus:\/\/repo\//,
    ],
  },
];

function collect(): Finding[] {
  const findings: Finding[] = [];
  for (const home of HOMES) {
    // `CLAUDE.md` is a symlink to `AGENTS.md` here, so the same bytes answer to two names. Reporting
    // both would name one defect twice and send a reader to a file with nothing of its own to fix.
    const seen = new Set<string>();
    for (const rel of home.mustNotRestate) {
      const path = join(ROOT, rel);
      if (!existsSync(path)) continue;
      const real = realpathSync(path);
      if (seen.has(real)) continue;
      seen.add(real);
      const body = readFileSync(path, 'utf8');
      const hit = home.signatures.find(s => s.test(body));
      if (!hit) continue;
      findings.push({
        check: 'restated-instruction-home',
        site: rel,
        detail:
          `${home.subject} is authored in ${home.home}, and this file restates it — delete the section here. ` +
          `Re-added by a tool run rather than by hand? The tool is the thing to stop; the copy drifts from its home the moment either changes`,
      });
    }
  }
  return findings;
}

report('agent-instruction-homes', collect(), {
  okMessage: 'no agent instruction file restates a body of guidance authored elsewhere',
  root: ROOT,
  remedy: 'delete the restated section and link its home',
});
