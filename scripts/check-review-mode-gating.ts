/**
 * check-review-mode-gating — review-mode checkpoint-friction guard (work-package review-mode
 * optimisation follow-up, R5).
 *
 * Review mode in a workflow (e.g. work-package) is driven by an `is_review_mode` boolean: activities,
 * steps, and checkpoints branch on it. The failure this guards against is the class the review-mode
 * optimisation fixed: a checkpoint that is REACHABLE while `is_review_mode == true`, is NOT itself
 * mode-aware (its own gate never mentions `is_review_mode`), and auto-advances to a CONSEQUENTIAL
 * default — a `defaultOption` whose option carries an `effect` (setVariable / transitionTo /
 * skipActivities). In review mode that default is applied silently on the autoAdvance timer even
 * though the mode may make it the wrong (create/mutating) action — exactly the spurious "skip this
 * create step" prompt the optimisation removed (pr-creation defaulting to "Create branch and PR",
 * review-outcome defaulting to "approved", etc.).
 *
 * Reachability respects transition ORDER: a transition provably-true under `is_review_mode == true`
 * (e.g. `is_review_mode == true`) fires first, so later default edges behind it (assumptions-review's
 * default edge into `implement`) are correctly treated as unreachable in review mode.
 *
 * A workflow may declare headless auto-advance as its review-mode design (work-package's
 * `review-mode-headless-auto-advance` rule does). Under that design a default that merely RECORDS an
 * assessment is the intended outcome, while a default that authorises CREATING or PUBLISHING
 * something is the defect this guard exists to catch. The guard cannot tell those apart
 * structurally, so the few accepted instances are enumerated in `ACCEPTED_HEADLESS_AUTO_ADVANCE`
 * below — each with the reason it is safe.
 *
 * That list replaces the retired `review-mode-gating-baseline.json` (issue #327 R5). A baseline was
 * regenerable (`--update-baseline`) and carried no reasons, so it absorbed real defects silently:
 * two of its six entries auto-created GitHub/Jira issues in a headless review run. An acceptance
 * entry is hand-written, carries its justification, and is reviewed in the diff.
 *
 * Run: npx tsx scripts/check-review-mode-gating.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { evaluateCondition, type Condition } from '../src/schema/condition.schema.js';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));
const REVIEW_BAG = { is_review_mode: true } as const;

/**
 * Review-reachable checkpoints whose auto-advanced default is accepted, keyed
 * `<workflow>::<activity>::<checkpoint>`. An entry belongs here only when the default RECORDS an
 * assessment the run can stand behind headlessly. A default that creates, publishes, pushes, or
 * approves anything does not qualify — gate it on `is_review_mode` instead.
 */
export const ACCEPTED_HEADLESS_AUTO_ADVANCE: Record<string, string> = {
  'work-package::codebase-comprehension::comprehension-sufficient':
    'default accepts the remaining open questions and clears the comprehension loop; it records a '
    + 'sufficiency judgement and mutates nothing outside the run.',
  'work-package::requirements-elicitation::elicitation-complete':
    'default closes elicitation once every question domain is covered; it records completion and '
    + 'mutates nothing outside the run.',
  'work-package::research::context-scope-declaration':
    'checkpoint fires only when run evidence could not derive the scope, and the default is the '
    + 'declared repo-only fallback; it records a provenance value and mutates nothing outside the run.',
};

export interface ReviewGatingViolation {
  /** `<workflow>::<activity>::<checkpoint>` — stable key for the baseline. */
  key: string;
  detail: string;
}

interface CheckpointOption {
  id: string;
  effect?: { setVariable?: Record<string, unknown>; transitionTo?: string; skipActivities?: string[] };
}
interface StepDef {
  kind?: string;
  id?: string;
  when?: string;
  condition?: Condition;
  // checkpoint fields
  options?: CheckpointOption[];
  defaultOption?: string;
  // loop body
  steps?: StepDef[];
}
interface ActivityDef { id: string; steps?: StepDef[]; transitions?: Array<{ to: string; condition?: Condition; isDefault?: boolean }>; }

/** A condition provably FALSE under is_review_mode == true, whatever the other variables are. */
function reviewExcluded(cond?: Condition): boolean {
  if (!cond) return false;
  const c = cond as { type?: string; variable?: string; conditions?: Condition[]; condition?: Condition };
  if (c.type === 'simple') return c.variable === 'is_review_mode' && !evaluateCondition(cond, REVIEW_BAG);
  if (c.type === 'and') return (c.conditions ?? []).some(reviewExcluded);
  if (c.type === 'or') return (c.conditions ?? []).length > 0 && (c.conditions ?? []).every(reviewExcluded);
  if (c.type === 'not') return reviewProvablyTrue(c.condition);
  return false;
}

/** A condition provably TRUE under is_review_mode == true, whatever the other variables are. */
function reviewProvablyTrue(cond?: Condition): boolean {
  if (!cond) return true; // an unconditional transition always fires
  const c = cond as { type?: string; variable?: string; conditions?: Condition[]; condition?: Condition };
  if (c.type === 'simple') return c.variable === 'is_review_mode' && evaluateCondition(cond, REVIEW_BAG);
  if (c.type === 'and') return (c.conditions ?? []).length > 0 && (c.conditions ?? []).every(reviewProvablyTrue);
  if (c.type === 'or') return (c.conditions ?? []).some(reviewProvablyTrue);
  if (c.type === 'not') return reviewExcluded(c.condition);
  return false;
}

/** Parse `is_review_mode (==|!=) (true|false)` in a step `when`; true iff provably false in review. */
function whenExcludesReview(when?: string): boolean {
  if (!when) return false;
  const m = when.match(/\bis_review_mode\s*(==|!=)\s*(true|false)\b/);
  if (!m) return false;
  const truth = m[2] === 'true';
  return m[1] === '==' ? !truth : truth; // is_review_mode==false / !=true → excluded in review
}

function mentionsReview(step: StepDef): boolean {
  if (step.when && /\bis_review_mode\b/.test(step.when)) return true;
  return step.condition ? JSON.stringify(step.condition).includes('is_review_mode') : false;
}

/** Successor activities reachable in review mode, honouring first-provably-true-transition-wins order. */
function reviewSuccessors(act: ActivityDef): string[] {
  const out: string[] = [];
  for (const t of act.transitions ?? []) {
    if (reviewExcluded(t.condition)) continue; // cannot be taken in review
    out.push(t.to);
    if (reviewProvablyTrue(t.condition)) break; // definitely taken → later edges unreachable in review
  }
  return out;
}

function reachableInReview(initial: string, activities: Map<string, ActivityDef>): Set<string> {
  const seen = new Set<string>();
  const queue = [initial];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const act = activities.get(id);
    if (act) for (const s of reviewSuccessors(act)) if (!seen.has(s)) queue.push(s);
  }
  return seen;
}

/** Walk an activity's steps (recursing loop bodies); yield checkpoints reachable in review mode. */
function reviewReachableCheckpoints(act: ActivityDef): StepDef[] {
  const out: StepDef[] = [];
  const walk = (steps: StepDef[] | undefined, gatedOut: boolean): void => {
    for (const s of steps ?? []) {
      const excluded = gatedOut || reviewExcluded(s.condition) || whenExcludesReview(s.when);
      if (s.kind === 'checkpoint' && !excluded) out.push(s);
      if (s.steps) walk(s.steps, excluded);
    }
  };
  walk(act.steps, false);
  return out;
}

/** A checkpoint auto-advances to a consequential default: its defaultOption carries an effect. */
function hasConsequentialDefault(cp: StepDef): boolean {
  if (!cp.defaultOption) return false;
  const opt = (cp.options ?? []).find(o => o.id === cp.defaultOption);
  const e = opt?.effect;
  return Boolean(e && (e.setVariable || e.transitionTo || e.skipActivities));
}

export function collectReviewGatingViolations(root: string = DEFAULT_ROOT): ReviewGatingViolation[] {
  const out: ReviewGatingViolation[] = [];
  let scanned = 0;
  for (const workflow of readdirSync(root).sort()) {
    const workflowYamlPath = join(root, workflow, 'workflow.yaml');
    if (!existsSync(workflowYamlPath)) continue;
    const wf = parse(readFileSync(workflowYamlPath, 'utf-8')) as { variables?: Array<{ name?: string }>; initialActivity?: string };
    const declaresReview = (wf.variables ?? []).some(v => v?.name === 'is_review_mode');
    if (!declaresReview) continue; // guard applies only to workflows with a review mode

    const activitiesDir = join(root, workflow, 'activities');
    if (!existsSync(activitiesDir) || !statSync(activitiesDir).isDirectory()) continue;
    const activities = new Map<string, ActivityDef>();
    for (const entry of readdirSync(activitiesDir).sort()) {
      if (!entry.endsWith('.yaml') && !entry.endsWith('.yml')) continue;
      const def = parse(readFileSync(join(activitiesDir, entry), 'utf-8')) as ActivityDef;
      if (def?.id) activities.set(def.id, def);
      scanned++;
    }
    const initial = wf.initialActivity ?? [...activities.keys()][0];
    if (!initial) continue;
    const reachable = reachableInReview(initial, activities);

    for (const actId of reachable) {
      const act = activities.get(actId);
      if (!act) continue;
      for (const cp of reviewReachableCheckpoints(act)) {
        if (mentionsReview(cp)) continue; // mode-aware: intentionally review-conditioned
        if (!hasConsequentialDefault(cp)) continue; // no silent stateful auto-advance
        out.push({
          key: `${workflow}::${actId}::${cp.id ?? '?'}`,
          detail: `checkpoint reachable while is_review_mode == true is not mode-aware and auto-advances to default option '${cp.defaultOption}', which applies an effect the user did not choose — gate it on is_review_mode or drop the consequential default`,
        });
      }
    }
  }
  assertScanned(scanned, 'activity files', root);
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Violations minus the reasoned acceptances. An acceptance key that no longer matches any violation
 * is itself reported: a stale entry means the corpus changed under it, and silently ignoring it is
 * how the retired baseline drifted.
 */
export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const all = collectReviewGatingViolations(root);
  const findings: Finding[] = all
    .filter((v) => !(v.key in ACCEPTED_HEADLESS_AUTO_ADVANCE))
    .map((v) => ({ check: 'review-reachable-mutating-default', site: v.key, detail: v.detail }));
  for (const key of Object.keys(ACCEPTED_HEADLESS_AUTO_ADVANCE)) {
    if (all.some((v) => v.key === key)) continue;
    findings.push({
      check: 'stale-acceptance',
      site: key,
      detail: 'accepted headless auto-advance no longer matches any checkpoint — delete the entry from '
        + 'ACCEPTED_HEADLESS_AUTO_ADVANCE in scripts/check-review-mode-gating.ts',
    });
  }
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('review-mode-gating', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'no review-reachable checkpoint auto-advances into unapproved mutating work',
    remedy: 'gate the checkpoint on is_review_mode, or accept it with a reason in ACCEPTED_HEADLESS_AUTO_ADVANCE',
  });
}
