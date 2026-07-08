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
 * The current corpus carries benign instances (checkpoints whose consequential default is harmless in
 * review because the review-mode transition ignores the variable they set — e.g. strategic-review's
 * review-findings). Those are snapshotted in scripts/review-mode-gating-baseline.json; the guard fails
 * ONLY on violations absent from that baseline (NEW friction, or a reverted gate). Regenerate the
 * baseline after an intentional, reviewed change with:
 *   npx tsx scripts/check-review-mode-gating.ts --root <workflows-dir> --update-baseline
 *
 * Run: npx tsx scripts/check-review-mode-gating.ts [--root <workflows-dir>]
 */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { evaluateCondition, type Condition } from '../src/schema/condition.schema.js';
import { resolveWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolveWorkflowsRoot(resolve(join(DIR, '..', 'workflows')));
const BASELINE = join(DIR, 'review-mode-gating-baseline.json');
const REVIEW_BAG = { is_review_mode: true } as const;

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

export function collectReviewGatingViolations(root: string = ROOT): ReviewGatingViolation[] {
  const out: ReviewGatingViolation[] = [];
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
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

function loadBaseline(): Set<string> {
  if (!existsSync(BASELINE)) return new Set();
  try { return new Set(JSON.parse(readFileSync(BASELINE, 'utf-8')) as string[]); } catch { return new Set(); }
}

/** Violations not in the committed baseline (`added`) and baselined keys no longer present (`fixed`). */
export function diffBaseline(root: string = ROOT): { added: ReviewGatingViolation[]; fixed: string[] } {
  const all = collectReviewGatingViolations(root);
  const baseline = loadBaseline();
  return {
    added: all.filter(v => !baseline.has(v.key)),
    fixed: [...baseline].filter(k => !all.some(v => v.key === k)),
  };
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const all = collectReviewGatingViolations();
  if (process.argv.includes('--update-baseline')) {
    writeFileSync(BASELINE, JSON.stringify(all.map(v => v.key), null, 2) + '\n');
    process.stdout.write(`review-mode-gating: baseline updated with ${all.length} entr(ies) at ${relative(process.cwd(), BASELINE)}\n`);
    process.exit(0);
  }
  const baseline = loadBaseline();
  const fresh = all.filter(v => !baseline.has(v.key));
  const fixed = [...baseline].filter(k => !all.some(v => v.key === k));
  if (fresh.length === 0) {
    process.stdout.write(`review-mode-gating: OK — ${all.length} total, ${baseline.size} baselined, 0 NEW${fixed.length ? `, ${fixed.length} fixed` : ''}\n`);
    if (fixed.length) process.stdout.write(`  ${fixed.length} baselined entr(ies) no longer present — run --update-baseline to shrink the baseline\n`);
    process.exit(0);
  }
  process.stdout.write(`review-mode-gating: ${fresh.length} NEW violation(s) — a review-reachable checkpoint gained a silent create-mode default:\n`);
  for (const v of fresh) process.stdout.write(`  ${v.key} — ${v.detail}\n`);
  process.exit(1);
}
