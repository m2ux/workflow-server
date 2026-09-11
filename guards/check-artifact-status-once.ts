/**
 * check-artifact-status-once — no artifact template states the document's status twice.
 *
 * A creation-guide template opens its artifact with a lean header: one context line carrying the
 * work package, the date, and the document's lifecycle value. Several templates also closed with a
 * `**Status:**` field carrying that same lifecycle value, so a conforming artifact stated one fact
 * in two places and a later pass could update either. `manage-artifacts.state-once-per-artifact`
 * asks that each fact appear once within an artifact, and a template carrying both guarantees the
 * breach before a worker writes a line.
 *
 * The guard reads every resource's fenced template blocks, finds the ones whose blockquote header
 * carries a lifecycle value, and reports any that also carry a `**Status:**` line.
 *
 * Why a check rather than a sweep: the hand-search that first found this reported two instances and
 * there were three. It intersected files on the literal token `Draft/Complete`, and the third
 * template spells its lifecycle `[Planning/Ready/In Progress/Complete]`. A vocabulary this open is
 * where a grep written from the instances in front of you stops matching the ones that are not.
 *
 * Run: npx tsx guards/check-artifact-status-once.ts [--root <workflows-dir>] [--json]
 */
import { readdirSync, existsSync, statSync, readFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, requireWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/**
 * Lifecycle vocabulary, deliberately open.
 *
 * Templates spell their status with whatever words the artifact's own lifecycle uses — Draft,
 * Planning, Proposed, Ready. Enumerating the spellings seen so far is what made the hand-search
 * miss one, so the set covers the vocabulary rather than the observed instances.
 */
const LIFECYCLE = /\b(draft|complete|planning|ready|in progress|proposed|accepted|pending|final)\b/i;

/** A blockquote line inside a template — the lean header. */
const HEADER = /^\s*>\s+\S/;

/** A closing status field. */
const STATUS = /^\s*\*\*Status:?\*\*/i;

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    if (name === '.git') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (name.endsWith('.md')) out.push(path);
  }
  return out;
}

/** The fenced blocks of one file, each as its own line array. */
function fencedBlocks(body: string): string[][] {
  const out: string[][] = [];
  let current: string[] | null = null;
  for (const line of body.split('\n')) {
    if (/^\s*```/.test(line)) {
      if (current) {
        out.push(current);
        current = null;
      } else {
        current = [];
      }
      continue;
    }
    if (current) current.push(line);
  }
  return out;
}

export async function collectFindings(root: string = DEFAULT_ROOT): Promise<Finding[]> {
  const out: Finding[] = [];
  const files = walk(root);
  assertScanned(files.length, 'definition file(s)', root);
  for (const file of files) {
    const site = relative(root, file);
    for (const block of fencedBlocks(readFileSync(file, 'utf-8'))) {
      const header = block.find((l) => HEADER.test(l) && LIFECYCLE.test(l));
      if (!header) continue;
      const status = block.find((l) => STATUS.test(l));
      if (!status) continue;
      out.push({
        check: 'artifact-status-stated-once',
        site,
        detail:
          `template header '${header.trim().slice(0, 60)}' carries the document's lifecycle value and `
          + `the template also carries '${status.trim().slice(0, 40)}' — a conforming artifact states its `
          + `status twice, and a later pass can update either. The header is the home; drop the field`,
      });
    }
  }
  return out.sort((a, b) => a.site.localeCompare(b.site));
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('artifact-status-once', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'no artifact template states the document status in both its header and a closing field',
  });
}
