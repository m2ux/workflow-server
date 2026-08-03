/**
 * check-bootstrap-self-contained — the pre-session bootstrap text sends nobody anywhere (#407).
 *
 * `discover` reads `meta/resources/bootstrap-protocol.md` raw and returns it verbatim, before the
 * caller has a session. That is the whole difficulty: with no `session_index` there is no
 * `get_resource` and no `get_activity`, so the agent reading this text cannot open a corpus file, and
 * a relative link or a dotted rule address is an instruction it has no way to follow. Everywhere else
 * in the corpus, citing the home rather than restating it is the right economy; on this one surface it
 * strands the reader.
 *
 * So two constructs are refused here and nowhere else:
 *
 *   corpus-link      a markdown link into the corpus. Nothing can follow it yet.
 *   dotted-rule      `<technique>.<rule-name>`, where `<technique>` is a real technique or operation
 *                    in the corpus. A rule address is unresolvable without the file that defines it.
 *
 * What stays legitimate, and why the checks are shaped to allow it: an MCP resource URI the text tells
 * the client to fetch directly (`workflow-server://schemas/workflow`), and a `group::operation` name
 * carried as a LABEL for the home a rule keeps once the operations bundle arrives — a name the text
 * says is for later and nothing depends on following now. Neither is a link, so neither check sees it.
 *
 * The dotted-rule check cannot strip inline code spans the way the anchor guard does, because the
 * construct it looks for would itself be backticked. It discriminates by corpus lookup instead: a
 * dotted pair is only a rule address when its left half names a technique that exists. That is what
 * keeps `session.json`, `AGENTS.md` and `repo.git` out of the findings while
 * `resolve-host-repo.prose-sources-are-fallback-only` lands in them.
 *
 * Hard zero, no baseline — the file is clean today and this guard is here to keep it that way. The
 * resource id is hard-coded because it is hard-coded in the server too: see the `discover` handler in
 * `src/tools/workflow-tools.ts`, which is the only caller that delivers a resource before a session.
 *
 * Run: npx tsx scripts/check-bootstrap-self-contained.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

/** The one resource `discover` delivers before a session exists. */
const PRE_SESSION_RESOURCE = join('meta', 'resources', 'bootstrap-protocol.md');

const LINK_RE = /\]\(([^)\s]+)\)/g;
const DOTTED_RE = /\b([a-z][a-z0-9-]{2,})\.([a-z][a-z0-9-]{2,})\b/g;

/**
 * Every technique and operation id in the corpus: the group directory names under `techniques/`, and
 * the basename of each operation file within them. The left half of a dotted address is a rule
 * address only when it names one of these.
 */
function techniqueIds(root: string): Set<string> {
  const ids = new Set<string>();
  for (const workflow of readdirSync(root).sort()) {
    const techniquesDir = join(root, workflow, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    for (const entry of readdirSync(techniquesDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        ids.add(entry.name);
        for (const op of readdirSync(join(techniquesDir, entry.name))) {
          if (op.endsWith('.md') && op !== 'TECHNIQUE.md') ids.add(op.slice(0, -3));
        }
      } else if (entry.name.endsWith('.md')) {
        ids.add(entry.name.slice(0, -3));
      }
    }
  }
  return ids;
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  const file = join(root, PRE_SESSION_RESOURCE);
  // A missing file must not read as clean: an absent guard target and a passing one look identical.
  assertScanned(existsSync(file) ? 1 : 0, `the pre-session resource ${PRE_SESSION_RESOURCE}`, root);

  const ids = techniqueIds(root);
  const raw = readFileSync(file, 'utf-8').split('\n');

  // Links are checked against rendered prose only — a fenced block or a code span quoting a link
  // form is illustration, not an instruction. The dotted check reads the raw line, because the
  // address it looks for is written in backticks.
  let inFence = false;
  raw.forEach((line, index) => {
    const site = `${PRE_SESSION_RESOURCE}:${index + 1}`;
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; return; }

    if (!inFence) {
      for (const [, target] of line.replace(/`[^`]*`/g, '').matchAll(LINK_RE)) {
        if (/^[a-z]+:\/\//i.test(target!)) continue;
        findings.push({
          check: 'corpus-link',
          site,
          detail: `links to '${target}' before a session exists, so nothing can follow it — `
            + 'inline the instruction and keep the name only as a label for later',
        });
      }
    }

    for (const [match, left, right] of line.matchAll(DOTTED_RE)) {
      if (!ids.has(left!)) continue;
      findings.push({
        check: 'dotted-rule',
        site,
        detail: `cites rule address '${match}' — '${left}' is a technique in the corpus, and its rule `
          + `'${right}' cannot be read without a session — state the rule's substance instead`,
      });
    }
  });

  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('bootstrap-self-contained', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'the pre-session bootstrap text sends the reader nowhere it cannot go',
    remedy: "inline the instruction's substance and keep the reference only as a label for after the bundle arrives",
  });
}
