/**
 * The guard registry — one enumeration of everything that verifies this repo.
 *
 * `check:all` and `check:delta` walk this list instead of a hand-chained shell pipeline, so a new
 * guard is enforced by adding one entry rather than by being remembered (issue #327 S1/R2). Three
 * scripts that existed on disk but were never invoked by `package.json` — `check-all-refs`,
 * `validate-activities`, `validate-workflow-yaml` — are registered here.
 *
 * `scope` says what a guard reads, which decides whether the merge-base delta runner must re-run it
 * against the base tree's corpus (`corpus`) or only against the base tree's own files (`repo`).
 */
export type GuardScope = 'corpus' | 'repo';

export interface GuardSpec {
  /** Stable id — also the label in `check:all` output and the key in a delta report. */
  id: string;
  /** Script path relative to the repo root. */
  script: string;
  /** `npm run <name>`, or null when the guard is reachable only through `check:all`. */
  npmScript: string | null;
  scope: GuardScope;
  /** Whether the script speaks the `--json` finding protocol (`scripts/guard-protocol.ts`). */
  json: boolean;
  /** One line: what this guard proves. */
  proves: string;
}

export const GUARDS: GuardSpec[] = [
  {
    id: 'binding-fidelity',
    script: 'scripts/check-binding-fidelity.ts',
    npmScript: 'check:binding',
    scope: 'corpus',
    json: true,
    proves: 'step bindings resolve, args conform, reads have producers, outputs have consumers',
  },
  {
    id: 'identifier-qualification',
    script: 'scripts/check-identifier-qualification.ts',
    npmScript: 'check:identifiers',
    scope: 'corpus',
    json: true,
    proves: 'every technique I/O id is a qualified noun phrase',
  },
  {
    id: 'review-mode-gating',
    script: 'scripts/check-review-mode-gating.ts',
    npmScript: 'check:review-mode',
    scope: 'corpus',
    json: true,
    proves: 'no review-reachable checkpoint auto-advances into unapproved mutating work',
  },
  {
    id: 'audience',
    script: 'scripts/check-audience.ts',
    npmScript: 'check:audience',
    scope: 'corpus',
    json: true,
    proves: 'every agent-audience artifact is JSON on disk',
  },
  {
    id: 'self-provisioned-input',
    script: 'scripts/check-self-provisioned-input.ts',
    npmScript: 'check:self-input',
    scope: 'corpus',
    json: false,
    proves: 'no step interpolates its own set target into its technique inputs',
  },
  {
    id: 'activity-technique-overlap',
    script: 'scripts/check-activity-technique-overlap.ts',
    npmScript: 'check:activity-tech',
    scope: 'corpus',
    json: false,
    proves: 'activity techniques[] and step bindings stay disjoint',
  },
  {
    id: 'prism-lens-reachability',
    script: 'scripts/check-prism-lens-reachability.ts',
    npmScript: 'check:prism-lenses',
    scope: 'corpus',
    json: false,
    proves: 'every prism lens is goal-routable or pipeline-internal, and resolves',
  },
  {
    id: 'resource-anchors',
    script: 'scripts/check-resource-anchors.ts',
    npmScript: 'check:anchors',
    scope: 'corpus',
    json: false,
    proves: 'every relative .md#anchor link resolves to a rendered heading',
  },
  {
    id: 'technique-template',
    script: 'scripts/check-technique-template.ts',
    npmScript: 'check:technique-template',
    scope: 'corpus',
    json: false,
    proves: 'every technique file follows the normative template, artifact bodies included',
  },
  {
    id: 'variable-model',
    script: 'scripts/check-variable-model.ts',
    npmScript: 'check:variable-model',
    scope: 'corpus',
    json: false,
    proves: 'defaults, gates and setVariable effects are coherent with the seeded variable model',
  },
  {
    id: 'fragments',
    script: 'scripts/check-fragments.ts',
    npmScript: 'check:fragments',
    scope: 'corpus',
    json: false,
    proves: 'every checkpoint fragment ref resolves, is used, and is not inlined twice',
  },
  {
    id: 'stealth-isolation',
    script: 'scripts/check-stealth-isolation.ts',
    npmScript: 'check:stealth',
    scope: 'corpus',
    json: false,
    proves: 'no static leakage path out of a stealth-mode workflow',
  },
  {
    id: 'refs',
    script: 'scripts/check-all-refs.ts',
    npmScript: 'check:refs',
    scope: 'corpus',
    json: false,
    proves: 'every activity/workflow techniques[] reference resolves through the loader',
  },
  {
    id: 'activities',
    script: 'scripts/validate-activities.ts',
    npmScript: 'check:activities',
    scope: 'corpus',
    json: false,
    proves: 'every activity file validates against the activity schema',
  },
  {
    id: 'workflow-yaml',
    script: 'scripts/validate-workflow-yaml.ts',
    npmScript: 'check:workflow-yaml',
    scope: 'corpus',
    json: false,
    proves: 'every workflow.yaml validates against the workflow schema',
  },
  {
    id: 'site-links',
    script: 'scripts/check-site-links.ts',
    npmScript: 'check:site',
    scope: 'repo',
    json: false,
    proves: 'every internal site href/src and anchor resolves',
  },
  {
    id: 'svg-layout',
    script: 'scripts/check-svg-layout.ts',
    npmScript: 'check:svg',
    scope: 'repo',
    json: false,
    proves: 'site SVG diagrams stay within their geometric bounds',
  },
];

export const CORPUS_GUARDS = GUARDS.filter((g) => g.scope === 'corpus');

export function guardById(id: string): GuardSpec | undefined {
  return GUARDS.find((g) => g.id === id);
}
