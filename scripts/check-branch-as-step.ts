/**
 * check-branch-as-step — a conditional branch in a technique Protocol is a note, not a step.
 *
 * The protocol parser's step regex strips leading whitespace, so an indented sub-bullet becomes a
 * disconnected *peer* step rather than a qualification of the instruction above it. AP-59
 * constraint-as-blockquote names the shape; principle 31 Isolate Conditional Branches as Notes names
 * the form that avoids it — the unconditional instruction is the bullet, and each branch is its own
 * `>` note beneath it.
 *
 * This is the class the corpus kept regressing on. It was fixed in `ponytail` and reintroduced into
 * `prism-evaluate` one commit later, because nothing measured it: an audit that finds it by reading
 * finds it only when someone reads that file again.
 *
 * Scope is what AP-59 keys on and no more: a sub-bullet carrying a *conditional caveat, fallback,
 * error-path or prohibition*. Its Do-not-flag keeps genuine enumerations and ordered sub-actions,
 * which is most of what indentation is used for — a list of guards, each with what it proves, is not
 * a branch. Flagging indentation alone produced 75 findings over the corpus, nearly all of them that
 * carve-out.
 *
 * Mutually exclusive branches written as *top-level* peer bullets are the same defect, and are
 * deliberately not covered: separating them from a phase that legitimately handles several cases in
 * sequence needs judgement this guard cannot supply, and a guard that needs a large triage list on
 * the day it lands is bookkeeping rather than measurement.
 *
 * An indented *numbered* sub-item is likewise out of scope. The numbered form carries ordered
 * sub-actions and precedence ladders — `variable-binding` resolves a bind through four numbered
 * `If`/`Else if` branches under a step that declares them a precedence — which is the Do-not-flag
 * carve-out for genuine enumerations. The dash form is what qualifies rather than enumerates.
 *
 * Run: npx tsx scripts/check-branch-as-step.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

/** An indented list item — whitespace the step regex discards. */
const INDENTED_BULLET = /^\s+- \S/;
/**
 * A sub-bullet that qualifies the instruction above it rather than enumerating alongside its
 * siblings: a condition, a fallback, an error path, or a prohibition. `For each` is iteration.
 */
const QUALIFIER =
  /^\s+- (?:\*\*)?(?:If\b|When\b|Where\b|Unless\b|Otherwise\b|On failure\b|Fall(?:ing)? back\b|Never\b|Do not\b|Don't\b|Avoid\b|Skip\b(?!.*\bstep\b.*:)|For a\b|For the\b|At `?(?:lite|full|ultra)\b)/i;

/**
 * An arm of a mutually-exclusive selection written as a sub-bullet chain. A complete `If` / `Else if`
 * ladder is a branch table, which AP-59's Do-not-flag keeps: telling it apart from a caveat that
 * qualifies one instruction needs judgement beyond a line pattern, so the whole ladder stands.
 */
const LADDER_ARM = /^\s+- (?:\*\*)?(?:Else\b|Otherwise\b)/i;

/** The leading whitespace of a list item, so siblings are compared at one depth. */
function indentOf(text: string): number {
  return /^(\s*)/.exec(text)![1]!.length;
}

interface Phase { title: string; line: number; bullets: { line: number; text: string }[] }

/**
 * Every instruction-bearing block of a technique's `## Protocol`, fenced code excluded.
 *
 * A Protocol takes either shape: `### N. Title` phase headings, or a flat numbered sequence directly
 * under the `## Protocol` heading. Entering Protocol opens a block covering the flat shape, and each
 * `### ` closes it and opens the named phase, so a caveat is reached under both.
 */
function protocolPhases(body: string): Phase[] {
  const phases: Phase[] = [];
  let inProtocol = false;
  let fenced = false;
  let current: Phase | null = null;
  body.split('\n').forEach((line, i) => {
    if (/^```/.test(line)) { fenced = !fenced; return; }
    if (fenced) return;
    if (/^## /.test(line)) {
      if (current) { phases.push(current); current = null; }
      inProtocol = /^## Protocol\s*$/.test(line);
      if (inProtocol) current = { title: 'Protocol', line: i + 1, bullets: [] };
      return;
    }
    if (!inProtocol) return;
    if (/^### /.test(line)) {
      if (current) phases.push(current);
      current = { title: line.replace(/^###\s*/, ''), line: i + 1, bullets: [] };
      return;
    }
    if (current && (/^- \S/.test(line) || INDENTED_BULLET.test(line))) {
      current.bullets.push({ line: i + 1, text: line });
    }
  });
  if (current) phases.push(current);
  return phases;
}

/**
 * Whether the bullet at `i` belongs to a selection ladder — it is an `Else`/`Otherwise` arm, or the
 * head whose next sibling at the same depth is one.
 */
function inLadder(bullets: { text: string }[], i: number): boolean {
  if (LADDER_ARM.test(bullets[i]!.text)) return true;
  const depth = indentOf(bullets[i]!.text);
  for (let j = i + 1; j < bullets.length; j++) {
    const sibling = bullets[j]!.text;
    if (indentOf(sibling) > depth) continue;
    if (indentOf(sibling) < depth) return false;
    return LADDER_ARM.test(sibling);
  }
  return false;
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  for (const workflow of readdirSync(root).sort()) {
    const techniquesDir = join(root, workflow, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    for (const path of walk(techniquesDir)) {
      if (!path.endsWith('.md') || path.endsWith('README.md')) continue;
      scanned++;
      const rel = relative(root, path);
      for (const phase of protocolPhases(readFileSync(path, 'utf-8'))) {
        for (const [i, b] of phase.bullets.entries()) {
          if (!INDENTED_BULLET.test(b.text) || !QUALIFIER.test(b.text)) continue;
          if (inLadder(phase.bullets, i)) continue;
          findings.push({
            check: 'qualifier-as-sub-bullet',
            site: `${rel}:${b.line}`,
            detail: `phase '${phase.title}' qualifies its instruction with an indented sub-bullet, `
              + 'which the protocol step regex reads as a peer step once it strips the leading '
              + `whitespace: "${b.text.trim().slice(0, 70)}". Make it a \`>\` note under the `
              + 'instruction it qualifies.',
          });
        }
      }
    }
  }
  assertScanned(scanned, 'technique files', root);
  return findings;
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('branch-as-step', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'no protocol phase encodes a conditional branch as a step',
    remedy: 'keep the unconditional instruction as the bullet and give each branch its own `>` note',
  });
}
