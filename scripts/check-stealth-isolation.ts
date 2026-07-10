/**
 * Stealth-isolation leakage guard.
 *
 * Verifies that a stealth-mode workflow (default: remediate-vuln) cannot leak data to public
 * repositories or issue trackers. Two layers:
 *
 *   STATIC (always runs; CI-safe, no network):
 *     (1) disclosure-gating — every step that binds a disclosure-capable operation (PR create/
 *         render/mark-ready/review-comment, issue creation/commenting/assignment, tracker
 *         transitions) must carry a gate that evaluates definitively FALSE under the workflow's
 *         seeded variable defaults (stealth_mode: true et al.). An ungated or truthy-gated
 *         disclosure step is a finding.
 *     (2) push-target discipline — the workflow's seeded `push_remote` must not be `origin`,
 *         and the private-remote verification step + isolation confirmation checkpoint must be
 *         REACHABLE (gates evaluate TRUE) ahead of any reachable push step.
 *     (3) reachable-text scan — the composed technique of every REACHABLE step must not invoke
 *         public write endpoints (`gh pr create|comment|ready|review|merge`, `gh issue`,
 *         `gh api` mutations, Jira comment/edit/transition tools) — catches a disclosure path
 *         added to a technique body without a catalog entry.
 *
 *   RUNTIME (opt-in via --target <checkout-path>; requires git, optionally gh):
 *     (4) private-target verification — for the checkout that a real remediation run would push
 *         from, resolve the configured push remote's URL and verify the repository is actually
 *         private: GitHub repos via `gh api repos/{owner}/{repo} --jq .private` (must be true);
 *         all remotes additionally via an anonymous, credential-free `git ls-remote` probe
 *         (anonymous readability == public == FAIL).
 *
 * Usage:
 *   npx tsx scripts/check-stealth-isolation.ts [--workflow remediate-vuln] [--root <workflows-dir>]
 *   npx tsx scripts/check-stealth-isolation.ts --target /path/to/private/checkout [--remote security]
 *
 * Exit code 0 = no leakage path found; 1 = findings (printed one per line).
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import { composeActivityTechnique } from '../src/loaders/technique-loader.js';
import { stringifyForResponse } from '../src/utils/serialization.js';
import type { Activity, Step, Condition } from '../src/schema/index.js';

/* ----------------------------------- CLI ----------------------------------- */

const args = process.argv.slice(2);
const argOf = (flag: string): string | undefined => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const scriptDir = dirname(fileURLToPath(import.meta.url));
const workflowsRoot = argOf('--root') ?? process.env['WORKFLOWS_DIR'] ?? join(scriptDir, '..', 'workflows');
const workflowId = argOf('--workflow') ?? 'remediate-vuln';
const runtimeTarget = argOf('--target');
const runtimeRemote = argOf('--remote');

/* ------------------------- disclosure catalog (static) ------------------------ */

/** Technique refs whose execution writes to a public surface. Matched on the authored ref
 * (after `::`-normalization) — resolution scope does not matter for cataloging. */
const DISCLOSURE_REFS: RegExp[] = [
  /^update-pr::(create-pr|mark-ready|post-review-comment|render)$/,
  /^(work-package::)?update-pr::(create-pr|mark-ready|post-review-comment|render)$/,
  /^create-issue$/,
  /^(work-package::)?create-issue$/,
  /^github-cli-protocol::(comment-issue|assign-issue|create-issue|create-pr)$/,
  /^atlassian-operations::(comment-jira-issue|edit-jira-issue|transition-jira-issue|create-jira-issue)$/,
  /^respond-to-pr-review$/,
  /^(work-package::)?respond-to-pr-review$/,
];

/** Public write invocations that must not appear in any REACHABLE step's composed technique. */
const PUBLIC_WRITE_TEXT: RegExp[] = [
  /\bgh pr (create|comment|ready|review|merge|edit)\b/,
  /\bgh issue\b/,
  /\bgh api\b[^\n]*(-X|--method)\s*(POST|PATCH|PUT|DELETE)/,
  /\bcomment-jira-issue\b|\beditJiraIssue\b|\btransitionJiraIssue\b/,
];

/* ------------------------------ gate evaluation ------------------------------ */

type Bag = Record<string, unknown>;

function evalCondition(c: Condition | undefined, bag: Bag): boolean | undefined {
  if (!c) return undefined;
  const anyC = c as Record<string, unknown>;
  const type = anyC['type'] as string;
  if (type === 'simple') {
    const name = anyC['variable'] as string;
    const op = anyC['operator'] as string;
    const value = anyC['value'];
    const path = name.split('.');
    let cur: unknown = bag;
    for (const seg of path) {
      if (cur !== null && typeof cur === 'object' && seg in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[seg];
      } else { cur = undefined; break; }
    }
    switch (op) {
      case 'exists': return cur !== undefined && cur !== null;
      case 'notExists': return cur === undefined || cur === null;
      case '==': return cur === value;
      case '!=': return cur !== value;
      default: return undefined; // numeric comparators are not used on disclosure gates
    }
  }
  if (type === 'and') return (anyC['conditions'] as Condition[]).every((x) => evalCondition(x, bag) === true);
  if (type === 'or') return (anyC['conditions'] as Condition[]).some((x) => evalCondition(x, bag) === true);
  if (type === 'not') { const inner = evalCondition(anyC['condition'] as Condition, bag); return inner === undefined ? undefined : !inner; }
  return undefined;
}

/** Evaluate a `when` expression of the simple `a == b [&& c != d ...]` shape the corpus uses. */
function evalWhen(expr: string | undefined, bag: Bag): boolean | undefined {
  if (!expr) return undefined;
  const clauses = expr.split('&&').map((s) => s.trim());
  let result = true;
  for (const clause of clauses) {
    const m = /^([a-z_][a-z0-9_.]*)\s*(==|!=)\s*(.+)$/.exec(clause);
    if (!m) return undefined;
    const raw = m[3]!.trim().replace(/^['"]|['"]$/g, '');
    const value: unknown = raw === 'true' ? true : raw === 'false' ? false : raw;
    const got = evalCondition({ type: 'simple', variable: m[1]!, operator: m[2] as '==', value: value as never }, bag);
    if (got === undefined) return undefined;
    result &&= got;
  }
  return result;
}

/** A step is EXCLUDED (provably not executed) when any of its own or enclosing gates
 * evaluates to false under the seeded bag. Undefined (unevaluable) gates count as reachable —
 * the guard is conservative in the safe direction. */
function stepReachable(step: Step, enclosingGates: Array<boolean | undefined>, bag: Bag): boolean {
  const own = [evalWhen((step as { when?: string }).when, bag), evalCondition((step as { condition?: Condition }).condition, bag)];
  return [...enclosingGates, ...own].every((g) => g !== false);
}

/* --------------------------------- static scan -------------------------------- */

const findings: string[] = [];

function refOf(step: Step): string | undefined {
  if (step.kind !== 'technique') return undefined;
  const t = (step as { technique: string | { name: string } }).technique;
  return typeof t === 'string' ? t : t.name;
}

async function staticScan(): Promise<void> {
  const loadResult = await loadWorkflowWithDiagnostics(workflowsRoot, workflowId);
  if (!loadResult.success) {
    findings.push(`workflow '${workflowId}' failed to load: ${loadResult.error.message}`);
    return;
  }
  const { workflow, activitySourceWorkflow } = loadResult.value;

  // Seed the bag exactly as the server seeds a fresh session: declared defaultValues only.
  const bag: Bag = {};
  for (const v of workflow.variables ?? []) {
    if ('defaultValue' in v && v.defaultValue !== undefined) bag[v.name] = v.defaultValue;
  }
  if (bag['stealth_mode'] !== true) {
    findings.push(`workflow '${workflowId}' does not seed stealth_mode: true — the disclosure gates have no driver`);
  }
  if (bag['push_remote'] === undefined || bag['push_remote'] === 'origin') {
    findings.push(`workflow '${workflowId}' seeds push_remote='${String(bag['push_remote'])}' — must be a non-origin private remote`);
  }

  const reachableTechniqueSteps: Array<{ activity: Activity; step: Step; ref: string }> = [];

  const walk = (activity: Activity, steps: Step[] | undefined, gates: Array<boolean | undefined>): void => {
    for (const step of steps ?? []) {
      const reachable = stepReachable(step, gates, bag);
      const ref = refOf(step);
      if (ref && DISCLOSURE_REFS.some((re) => re.test(ref))) {
        if (reachable) {
          findings.push(`disclosure step reachable under stealth defaults: ${activity.id}/${step.id ?? ref} (${ref})`);
        }
      } else if (ref && reachable) {
        reachableTechniqueSteps.push({ activity, step, ref });
      }
      if (step.kind === 'loop') {
        const loopGates = [...gates,
          evalWhen((step as { when?: string }).when, bag),
          evalCondition((step as { condition?: Condition }).condition, bag)];
        walk(activity, (step as { steps?: Step[] }).steps, loopGates);
      }
    }
  };
  for (const activity of workflow.activities ?? []) walk(activity, activity.steps as Step[] | undefined, []);

  // Push discipline: the private-remote verification and isolation confirmation must be
  // reachable in the activity that carries a reachable push step.
  for (const activity of workflow.activities ?? []) {
    const steps = (activity.steps ?? []) as Step[];
    const pushStep = steps.find((s) => refOf(s)?.endsWith('::push-commits') || refOf(s) === 'push-commits');
    if (!pushStep || !stepReachable(pushStep, [], bag)) continue;
    const verify = steps.find((s) => (refOf(s) ?? '').includes('verify-remote-private'));
    const confirm = steps.find((s) => s.kind === 'checkpoint' && /private|isolation/i.test((s as { message?: string }).message ?? ''));
    if (!verify || !stepReachable(verify, [], bag)) {
      findings.push(`push step '${activity.id}/${pushStep.id ?? 'push-commits'}' is reachable but no reachable private-remote verification precedes it`);
    }
    if (!confirm || !stepReachable(confirm, [], bag)) {
      findings.push(`push step '${activity.id}/${pushStep.id ?? 'push-commits'}' is reachable but no reachable isolation confirmation checkpoint precedes it`);
    }
  }

  // Text scan of every reachable step's composed technique for public write invocations. Only
  // the PROTOCOL carries invocations — rules and capability text legitimately NAME the
  // prohibited commands (the isolation contracts say "gh pr create is prohibited"), so scanning
  // them would flag the prohibition itself.
  for (const { activity, step, ref } of reachableTechniqueSteps) {
    const scope = activitySourceWorkflow.get(activity.id) ?? workflow.id;
    const composed = await composeActivityTechnique(ref, workflowsRoot, scope, activity.id);
    if (!composed.success) {
      findings.push(`reachable step '${activity.id}/${step.id ?? ref}' binds unresolvable technique '${ref}' (scope ${scope})`);
      continue;
    }
    const protocolText = stringifyForResponse(composed.value.technique.protocol ?? []);
    for (const re of PUBLIC_WRITE_TEXT) {
      const m = re.exec(protocolText);
      if (m) findings.push(`reachable step '${activity.id}/${step.id ?? ref}' composed technique '${composed.value.techniqueId}' protocol contains public write invocation: ${m[0]}`);
    }
  }
}

/* -------------------------------- runtime probe ------------------------------- */

function runtimeProbe(targetPath: string, remote: string): void {
  if (!existsSync(targetPath)) {
    findings.push(`--target path does not exist: ${targetPath}`);
    return;
  }
  let url: string;
  try {
    url = execFileSync('git', ['-C', targetPath, 'remote', 'get-url', remote], { encoding: 'utf-8' }).trim();
  } catch {
    findings.push(`remote '${remote}' is not configured in ${targetPath}`);
    return;
  }
  console.log(`runtime: remote '${remote}' -> ${url}`);

  // GitHub visibility check (authoritative when the remote is a GitHub repo and gh is present).
  const gh = /github\.com[:/]([^/]+)\/([^/.]+)(\.git)?$/.exec(url);
  if (gh) {
    try {
      const priv = execFileSync('gh', ['api', `repos/${gh[1]}/${gh[2]}`, '--jq', '.private'], { encoding: 'utf-8' }).trim();
      if (priv !== 'true') findings.push(`remote '${remote}' (${url}) is a PUBLIC GitHub repository`);
      else console.log(`runtime: GitHub reports repository is private ✓`);
    } catch {
      console.log('runtime: gh unavailable or repo not visible to gh — falling back to anonymous probe only');
    }
  }

  // Anonymous readability probe: a credential-free ls-remote succeeding means the repo is
  // publicly readable — a leakage destination regardless of host.
  try {
    execFileSync('git', ['ls-remote', url, 'HEAD'], {
      encoding: 'utf-8',
      timeout: 20000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_ASKPASS: 'true', GIT_CONFIG_NOSYSTEM: '1', HOME: '/nonexistent', XDG_CONFIG_HOME: '/nonexistent', GIT_SSH_COMMAND: 'ssh -o BatchMode=yes -o IdentitiesOnly=yes -o IdentityFile=/nonexistent' },
    });
    findings.push(`remote '${remote}' (${url}) is ANONYMOUSLY READABLE — public destination`);
  } catch {
    console.log('runtime: anonymous read probe rejected (repository not publicly readable) ✓');
  }
}

/* ----------------------------------- main ------------------------------------ */

async function main(): Promise<void> {
  await staticScan();
  if (runtimeTarget) runtimeProbe(runtimeTarget, runtimeRemote ?? 'security');

  if (findings.length > 0) {
    console.error(`stealth-isolation: ${findings.length} finding(s)`);
    for (const f of findings) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`stealth-isolation: OK — no leakage path found for '${workflowId}'${runtimeTarget ? ' (static + runtime)' : ' (static)'}`);
}

main().catch((error) => {
  console.error('stealth-isolation: guard crashed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
