/**
 * Decision policies — how the walker answers each checkpoint, which determines
 * the path taken through a workflow. Each named policy steers the walk down a
 * distinct branch so the matrix covers the workflow's real decision space.
 */
import type { Policy, PolicyContext } from './walker.js';

/** Pick the checkpoint's declared default option, else its first option. */
function defaultChoice(ctx: PolicyContext): string {
  const cp = ctx.checkpoint;
  if (cp.defaultOption && cp.options.some(o => o.id === cp.defaultOption)) return cp.defaultOption;
  return cp.options[0].id;
}

/**
 * Converged-agent simulation: the loop-exit / convergence variables a real
 * worker sets in step prose, keyed by activity. The deterministic walker has
 * no agent, so these stand in for "the agent completed this activity and its
 * loops successfully." Kept explicit so the assumed agent behaviour is
 * reviewable and diffable across the migration.
 */
export const baseSimulation: Record<string, Record<string, unknown>> = {
  'codebase-comprehension': { needs_comprehension: false, has_open_questions: false },
  'requirements-elicitation': { elicitation_complete: true },
  'assumptions-review': { needs_plan_revision: false, needs_further_discussion: false, has_deferred_assumptions: false },
};

export interface PolicySpec {
  name: string;
  initialVariables?: Record<string, unknown>;
  /** Overrides keyed by "activityId/checkpointId" or bare "checkpointId". */
  choices?: Record<string, string>;
  /** Per-activity agent-outcome variables, merged over baseSimulation. */
  simulate?: Record<string, Record<string, unknown>>;
}

/**
 * Build a policy that applies explicit per-checkpoint overrides and falls back
 * to the default-option choice for everything else.
 */
export function makePolicy(spec: PolicySpec): Policy {
  const simulation = { ...baseSimulation, ...(spec.simulate ?? {}) };
  return {
    name: spec.name,
    initialVariables: spec.initialVariables,
    choose(ctx: PolicyContext): string {
      const choices = spec.choices ?? {};
      const keyed = choices[`${ctx.activityId}/${ctx.checkpoint.id}`] ?? choices[ctx.checkpoint.id];
      if (keyed && ctx.checkpoint.options.some(o => o.id === keyed)) return keyed;
      return defaultChoice(ctx);
    },
    simulate(ctx) {
      return simulation[ctx.activityId];
    },
  };
}

/** Always take the declared default option — the auto-advance path. */
export const defaultPolicy: Policy = makePolicy({ name: 'default' });

/** Direct path: skip optional discovery activities (elicitation, research, analysis). */
export const skipOptionalPolicy: Policy = makePolicy({
  name: 'skip-optional',
  choices: { 'workflow-path-selected': 'skip-optional' },
});

/** Full path: requirements elicitation + research + implementation analysis. */
export const fullWorkflowPolicy: Policy = makePolicy({
  name: 'full-workflow',
  choices: { 'workflow-path-selected': 'full-workflow' },
});

/** Research-only path: skip elicitation, keep research. */
export const researchOnlyPolicy: Policy = makePolicy({
  name: 'research-only',
  choices: { 'workflow-path-selected': 'research-only' },
});

/** Elicitation-only path: keep elicitation, skip research. */
export const elicitationOnlyPolicy: Policy = makePolicy({
  name: 'elicitation-only',
  choices: { 'workflow-path-selected': 'elicitation-only' },
});

/** Review mode: review an existing PR rather than implement. */
export const reviewModePolicy: Policy = makePolicy({
  name: 'review-mode',
  initialVariables: { is_review_mode: true },
  choices: { 'workflow-path-selected': 'skip-optional' },
});
