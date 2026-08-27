/**
 * check-checkpoint-presentation — when a gate is presented is stated in one home (#400 W1).
 *
 * `meta/techniques/workflow-engine/present-checkpoint-to-user.md` owns the presentation contract:
 * a hard gate is always presented, a soft one is presented on an interactive run, and a soft
 * mid-flow gate on a headless run resolves to its default without presentation. That contract is
 * prose-enforced — the server cannot tell whether a question was ever shown — so a second rule
 * stating the same thing differently is not cosmetic. It decides what an agent does.
 *
 * A rule bucket restating it drifts from it. Four workflow rules once licensed skipping
 * presentation for a soft gate; the engine rule said never skip it; both were in force, and workers
 * followed the nearer one. Three of the four sat in `rules.activity`, delivered to workers — the
 * agents that cannot resolve a gate at all — so the licence reached an agent unable to act on it and
 * missed the orchestrator that could.
 *
 * The guard is a hard zero: any rule text outside the engine technique that asserts whether a
 * checkpoint is presented is a finding. There is no acceptance list, because the remedy is never to
 * justify a second home — it is to delete the restatement and let the one home speak. A workflow
 * still says which gates exist and what conditions open them; a gate that should not interrupt
 * declares `defaultOption` and `autoAdvanceMs`, and one that must declares neither. Both are
 * structure the guard suite can already see.
 *
 * Scope: `rules.workflow`, `rules.activity`, `rules.universal` and `fragments.rules` in every
 * `workflow.yaml`, activity `rules[]`, and the `## Rules` body of every technique. Prose outside a
 * rule — a description, a README, a checkpoint message — is orientation and is not scanned; a rule
 * is what an agent is handed as binding.
 *
 * This is `AP-117 no-engine-mechanics-as-rules` made mechanical for the one contract whose
 * restatement has already caused a live decision failure.
 *
 * Run: npx tsx scripts/check-checkpoint-presentation.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

/**
 * The homes that own the contract, by domain: the engine operations own when a gate is presented and
 * how it resolves, agent-conduct owns the role split and the obligations that follow from it, and
 * orchestrator-conduct owns the boundaries on the role that resolves a gate. Rule text here states
 * the contract; anywhere else restates it. These are the engine and conduct surfaces
 * `no-engine-mechanics-as-rules` carves out as the homes a leaf must defer to.
 */
const CONTRACT_HOMES = [
  join('meta', 'techniques', 'workflow-engine'),
  join('meta', 'techniques', 'agent-conduct.md'),
  join('meta', 'techniques', 'orchestrator-conduct.md'),
];

function isContractHome(rel: string): boolean {
  return CONTRACT_HOMES.some((home) => rel === home || rel.startsWith(home + '/'));
}

/**
 * Phrases that assert whether a checkpoint reaches a person. Each is a claim about presentation,
 * not about a gate's condition or its options — naming the tool, the act, or its absence.
 */
const PRESENTATION_CLAIMS: { pattern: RegExp; says: string }[] = [
  { pattern: /\bask[-_ ]?(?:user)?question\b/i, says: 'names the question-asking tool' },
  { pattern: /\bpresent_checkpoint\b/i, says: 'names the presentation tool' },
  { pattern: /\brespond_checkpoint\b/i, says: 'names the resolution tool' },
  { pattern: /\bauto[-_ ]?advance\b/i, says: 'asserts auto-advance behaviour' },
  { pattern: /\bauto[-_ ]?resolv/i, says: 'asserts a gate resolves itself' },
  { pattern: /\bwithout presentation\b/i, says: 'asserts a gate is not presented' },
  { pattern: /\bwithout (?:being )?present(?:ing|ed)\b/i, says: 'asserts a gate is not presented' },
  { pattern: /\bskip(?:s|ping)? (?:the )?(?:gate|checkpoint|presentation)\b/i, says: 'asserts a gate is skipped' },
  { pattern: /\bpresents? (?:the )?checkpoints?\b/i, says: 'asserts who presents a checkpoint' },
  { pattern: /\bcheckpoint_pending\b/i, says: 'names the yield envelope' },
  { pattern: /\byields? (?:a |the )?checkpoint\b/i, says: 'asserts how a worker reaches a gate' },
  // How a gate's answer travels is the bag's contract and agent-conduct's obligation, not a
  // workflow's. Three workflows once carried a phrasing of it and no home stated it.
  { pattern: /\bcorrected value\b/i, says: 'asserts how a gate answer propagates' },
  { pattern: /\b(?:later|subsequent) (?:gate|checkpoint)s?\b/i, says: 'asserts how a gate answer propagates' },
  { pattern: /\bcorrections? must persist\b/i, says: 'asserts how a gate answer propagates' },
];

function claimsIn(text: string): string[] {
  return PRESENTATION_CLAIMS.filter((c) => c.pattern.test(text)).map((c) => c.says);
}

/**
 * Rule text carried by a bucket or a fragment. A bucket is a list whose entries are strings or
 * `{ ref }` imports, which carry no text of their own. A fragment is either such a list or one bare
 * string — `remediate-vuln`'s orchestration-model fragment is a string, and reading only the list
 * form is how a whole rule stays unscanned.
 */
function ruleStrings(bucket: unknown): string[] {
  if (typeof bucket === 'string') return [bucket];
  if (!Array.isArray(bucket)) return [];
  return bucket.filter((e): e is string => typeof e === 'string');
}

function scanRulesObject(rules: unknown, site: string, findings: Finding[]): void {
  if (!rules || typeof rules !== 'object') return;
  for (const [bucket, entries] of Object.entries(rules as Record<string, unknown>)) {
    for (const entry of ruleStrings(entries)) {
      const says = claimsIn(entry);
      if (says.length === 0) continue;
      findings.push({
        check: 'presentation-rule-outside-its-home',
        site: `${site} rules.${bucket}`,
        detail: `rule ${says.join('; ')} — "${entry.slice(0, 110).replace(/\s+/g, ' ')}…". `
          + 'When a gate is presented is stated once, in meta workflow-engine::present-checkpoint-to-user. '
          + "Delete the restatement: a workflow says which gates exist and what opens them, and a gate's "
          + 'defaultOption plus autoAdvanceMs pair says whether it may resolve unattended.',
      });
    }
  }
}

/** The `## Rules` body of a technique markdown file, up to the next H2. */
function rulesSection(md: string): string {
  const m = /^##\s+Rules\s*$/m.exec(md);
  if (!m) return '';
  const rest = md.slice(m.index + m[0].length);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir).sort()) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;

  for (const workflow of readdirSync(root).sort()) {
    const wfDir = join(root, workflow);
    if (!existsSync(wfDir) || !statSync(wfDir).isDirectory()) continue;

    const wfFile = join(wfDir, 'workflow.yaml');
    if (existsSync(wfFile)) {
      const def = parse(readFileSync(wfFile, 'utf-8')) as Record<string, unknown> | null;
      scanned++;
      scanRulesObject(def?.['rules'], relative(root, wfFile), findings);
      const fragments = def?.['fragments'] as Record<string, unknown> | undefined;
      if (fragments?.['rules']) {
        // A rule fragment is imported by `ref` into a bucket, so its text binds the same agents.
        for (const [name, entries] of Object.entries(fragments['rules'] as Record<string, unknown>)) {
          for (const entry of ruleStrings(entries)) {
            const says = claimsIn(entry);
            if (says.length === 0) continue;
            findings.push({
              check: 'presentation-rule-outside-its-home',
              site: `${relative(root, wfFile)} fragments.rules.${name}`,
              detail: `rule fragment ${says.join('; ')} — "${entry.slice(0, 110).replace(/\s+/g, ' ')}…". `
                + 'When a gate is presented is stated once, in meta workflow-engine::present-checkpoint-to-user.',
            });
          }
        }
      }
    }

    const activitiesDir = join(wfDir, 'activities');
    if (existsSync(activitiesDir) && statSync(activitiesDir).isDirectory()) {
      for (const f of walkFiles(activitiesDir)) {
        if (!f.endsWith('.yaml') && !f.endsWith('.yml')) continue;
        const def = parse(readFileSync(f, 'utf-8')) as Record<string, unknown> | null;
        scanned++;
        for (const entry of ruleStrings(def?.['rules'])) {
          const says = claimsIn(entry);
          if (says.length === 0) continue;
          findings.push({
            check: 'presentation-rule-outside-its-home',
            site: `${relative(root, f)} rules[]`,
            detail: `activity rule ${says.join('; ')} — "${entry.slice(0, 110).replace(/\s+/g, ' ')}…". `
              + 'When a gate is presented is stated once, in meta workflow-engine::present-checkpoint-to-user.',
          });
        }
      }
    }

    const techniquesDir = join(wfDir, 'techniques');
    if (existsSync(techniquesDir) && statSync(techniquesDir).isDirectory()) {
      for (const f of walkFiles(techniquesDir)) {
        if (!f.endsWith('.md')) continue;
        const rel = relative(root, f);
        scanned++;
        if (isContractHome(rel)) continue;
        const says = claimsIn(rulesSection(readFileSync(f, 'utf-8')));
        if (says.length === 0) continue;
        findings.push({
          check: 'presentation-rule-outside-its-home',
          site: `${rel} ## Rules`,
          detail: `technique rule ${says.join('; ')}. `
            + 'When a gate is presented is stated once, in meta workflow-engine::present-checkpoint-to-user. '
            + 'A technique that reaches a gate yields it and stops; it does not restate who shows it.',
        });
      }
    }
  }

  assertScanned(scanned, 'rule-bearing files', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('checkpoint-presentation', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'when a gate is presented is stated only in the engine technique that owns it',
    remedy: 'delete the restatement; the engine rule already binds every workflow',
  });
}
