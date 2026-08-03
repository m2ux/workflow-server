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
 *   dotted-rule      `<technique>.<rule-name>`, where the corpus declares that rule on that technique.
 *                    A rule address is unresolvable without the file that defines it.
 *
 * What stays legitimate, and why the checks are shaped to allow it: an MCP resource URI the text tells
 * the client to fetch directly (`workflow-server://schemas/workflow`), and a `group::operation` name
 * carried as a LABEL for the home a rule keeps once the operations bundle arrives — a name the text
 * says is for later and nothing depends on following now. Neither is a link, so neither check sees it.
 *
 * The dotted-rule check cannot strip inline code spans the way the anchor guard does, because the
 * construct it looks for would itself be backticked. It discriminates by corpus lookup instead, on
 * the PAIR rather than the left half: around thirty techniques carry a single-word name, so a
 * left-half test reads `plan.json` and `context.yaml` as addresses. Requiring the corpus to declare
 * that rule on that technique keeps ordinary filenames out while
 * `resolve-host-repo.prose-sources-are-fallback-only` lands in the findings.
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
const FENCE_RE = /^\s*(```|~~~)/;
/** A scheme the reader's own client resolves, per RFC 3986: letter, then letters, digits, `+`, `-`, `.`. */
const SCHEME_RE = /^[a-z][a-z0-9+.-]*:\/\//i;

/**
 * Every `<technique>.<rule>` pair the corpus actually declares.
 *
 * A dotted pair is a rule address only when the corpus declares that rule on that technique — the
 * discriminator has to be the pair, not the left half alone. Around thirty techniques are named with a
 * single common word (`plan`, `test`, `context`, `query`, `record`), so a left-half test reads
 * `plan.json`, `context.yaml` and `test.each` as addresses. Requiring the right half to be a declared
 * rule name leaves those alone and still catches the real thing.
 *
 * Rule names are the `### ` headings under a technique's `## Rules`, which is how the corpus addresses
 * them everywhere else.
 */
function ruleAddresses(root: string): Set<string> {
  const pairs = new Set<string>();
  const addFile = (file: string, technique: string): void => {
    let inRules = false;
    for (const line of readFileSync(file, 'utf-8').split('\n')) {
      if (/^##\s/.test(line)) { inRules = /^##\s+Rules\s*$/.test(line); continue; }
      const heading = inRules ? /^###\s+([a-z][a-z0-9-]*)\s*$/.exec(line) : null;
      if (heading) pairs.add(`${technique}.${heading[1]}`);
    }
  };
  for (const workflow of readdirSync(root).sort()) {
    const techniquesDir = join(root, workflow, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    for (const entry of readdirSync(techniquesDir, { withFileTypes: true })) {
      const entryPath = join(techniquesDir, entry.name);
      if (entry.isDirectory()) {
        for (const op of readdirSync(entryPath)) {
          if (!op.endsWith('.md')) continue;
          // A group's own TECHNIQUE.md declares the group's rules, addressed by the group name.
          addFile(join(entryPath, op), op === 'TECHNIQUE.md' ? entry.name : op.slice(0, -3));
        }
      } else if (entry.name.endsWith('.md')) {
        addFile(entryPath, entry.name.slice(0, -3));
      }
    }
  }
  return pairs;
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  const file = join(root, PRE_SESSION_RESOURCE);
  // A missing file must not read as clean: an absent guard target and a passing one look identical.
  assertScanned(existsSync(file) ? 1 : 0, `pre-session resources (${PRE_SESSION_RESOURCE})`, root);

  const addresses = ruleAddresses(root);
  const raw = readFileSync(file, 'utf-8').split('\n');

  // An unbalanced fence is reported rather than tolerated. Tracking fences as a toggle means an odd
  // marker count leaves every later line looking fenced, which would take the link check out of
  // service with a green verdict — the one failure this guard must not have.
  const fences = raw.filter((line) => FENCE_RE.test(line)).length;
  const fencesBalanced = fences % 2 === 0;
  if (!fencesBalanced) {
    findings.push({
      check: 'unbalanced-fence',
      site: PRE_SESSION_RESOURCE,
      detail: `${fences} code-fence marker(s), so one block never closes — close it, because fence state `
        + 'is what tells illustration from instruction here',
    });
  }

  // Links are read from rendered prose only: a fenced block or a code span quoting a link form is
  // illustration, not an instruction. The dotted check reads the whole line, because the address it
  // looks for is written in backticks — but not inside a link target, where a path is a path.
  let inFence = false;
  raw.forEach((line, index) => {
    const site = `${PRE_SESSION_RESOURCE}:${index + 1}`;
    if (FENCE_RE.test(line)) inFence = !inFence;

    // With the markers unbalanced there is no telling which lines are fenced, so every line is read.
    // Erring toward more findings keeps an unclosed fence from hiding a link behind a green verdict.
    if (!inFence || !fencesBalanced) {
      for (const [, target] of line.replace(/`[^`]*`/g, '').matchAll(LINK_RE)) {
        const to = target!.replace(/^<|>$/g, '');
        // A scheme the client resolves itself, and a same-document anchor, are both already in hand.
        if (SCHEME_RE.test(to) || to.startsWith('#')) continue;
        findings.push({
          check: 'corpus-link',
          site,
          detail: `links to '${to}' before a session exists, so nothing can follow it — `
            + 'inline the instruction and keep the name only as a label for later',
        });
      }
    }

    // Link targets are paths; a dotted segment inside one is not a rule address.
    const prose = line.replace(LINK_RE, ']()');
    for (const [match, left, right] of prose.matchAll(DOTTED_RE)) {
      if (!addresses.has(`${left}.${right}`)) continue;
      findings.push({
        check: 'dotted-rule',
        site,
        detail: `cites rule address '${match}' — the corpus declares that rule on '${left}', and it `
          + 'cannot be read without a session — state the rule\'s substance instead',
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
