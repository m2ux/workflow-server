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

/**
 * Which form of an activity a guard reads (#704).
 *
 * A routine reference is spliced away when definitions load, so the two forms answer different
 * questions and a guard aimed at the wrong one reports clean over ground it never read.
 *
 *   `authored`    — reads definition files as written. A guard auditing what an AUTHOR wrote wants
 *                   this: materialisation rewrites `when` expressions and `set` values, so a guard
 *                   routed through the loader would audit generated text. These gain `routines/` as
 *                   a second directory to walk.
 *   `materialised`— takes the loader's activities. A guard auditing what will RUN wants this: a
 *                   reference in first position evades a rule about first steps entirely against
 *                   unexpanded text.
 *   `none`        — reads no activity steps at all, so neither form applies.
 */
export type GuardForm = 'authored' | 'materialised' | 'none';

export interface GuardSpec {
  /** Stable id — also the label in `check:all` output and the key in a delta report. */
  id: string;
  /** Script path relative to the repo root. */
  script: string;
  /** `npm run <name>`, or null when the guard is reachable only through `check:all`. */
  npmScript: string | null;
  scope: GuardScope;
  /**
   * Whether a failure means the server cannot load, resolve or execute the definitions, as against
   * the corpus not meeting a convention.
   *
   * The two answer different questions of a corpus. A convention guard measures the corpus this
   * repository ships — it asks after a bootstrap protocol, a harness map, a canonical-home map —
   * and a corpus authored to exercise one construct holds none of those. Its verdict there reports
   * that the tree is not the shipped corpus, which was never in question, and says nothing about
   * whether a server can serve it. A serving guard asks only what the loader asks, so it reads the
   * same on a corpus of two workflows as on a corpus of eighteen.
   */
  gatesServing: boolean;
  /** Whether the script speaks the `--json` finding protocol (`guards/guard-protocol.ts`). */
  json: boolean;
  /** One line: what this guard proves. */
  proves: string;
  /**
   * Which form of an activity it reads. A field on the entry rather than a table in a planning
   * file, so a guard added without an answer is a compile error rather than a row nobody updated.
   */
  form: GuardForm;
}

export const GUARDS: GuardSpec[] = [
  {
    id: 'binding-fidelity',
    script: 'guards/check-binding-fidelity.ts',
    npmScript: 'check:binding',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'step bindings resolve, args conform, reads have producers, outputs have consumers, and a read into a value names a member its producer declares',
    form: 'authored',
  },
  {
    id: 'activity-variables',
    script: 'guards/check-activity-variables.ts',
    npmScript: 'check:activity-variables',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every activity declares the variables it reads and writes, and every read has a writer on every path',
    form: 'authored',
  },
  {
    id: 'artifact-status-once',
    script: 'guards/check-artifact-status-once.ts',
    npmScript: 'check:status-once',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: "no artifact template states the document's status in both its lean header and a closing field",
    form: 'none',
  },
  {
    id: 'canonical-home-map',
    script: 'guards/check-canonical-home-map.ts',
    npmScript: 'check:home-map',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every canonical-home row names an artifact some technique declares, so the conformance gate bound with the map resolves',
    form: 'authored',
  },
  {
    id: 'nested-output-home',
    script: 'guards/check-nested-output-home.ts',
    npmScript: 'check:nested-output-home',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every nested output component is declared in one place, so a container and its operation cannot drift into two descriptions of one value',
    form: 'none',
  },
  {
    id: 'inherited-inputs',
    script: 'guards/check-inherited-inputs.ts',
    npmScript: 'check:inherited-inputs',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'no technique redeclares an input a container contract already merges into it',
    form: 'none',
  },
  {
    id: 'section-framing',
    script: 'guards/check-section-framing.ts',
    npmScript: 'check:framing',
    scope: 'corpus',
    gatesServing: false,
    json: false,
    proves: 'no resource strands prose above its first section from a consumer that cites it by anchor',
    form: 'none',
  },
  {
    id: 'citation-grain',
    script: 'guards/check-citation-grain.ts',
    npmScript: 'check:citations',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'no technique cites one resource both bare and by anchor, so a file never arrives alongside its own sections',
    form: 'none',
  },
  {
    id: 'identifier-qualification',
    script: 'guards/check-identifier-qualification.ts',
    npmScript: 'check:identifiers',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every technique I/O id is a qualified noun phrase',
    form: 'none',
  },
  {
    id: 'review-mode-gating',
    script: 'guards/check-review-mode-gating.ts',
    npmScript: 'check:review-mode',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'no review-reachable checkpoint auto-advances into unapproved mutating work',
    form: 'authored',
  },
  {
    id: 'audience',
    script: 'guards/check-audience.ts',
    npmScript: 'check:audience',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every artifact declares who reads it, and every agent-audience artifact is JSON on disk',
    form: 'none',
  },
  {
    id: 'artifact-guides',
    script: 'guards/check-artifact-guides.ts',
    npmScript: 'check:artifact-guides',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every persisted artifact filename maps to a creation guide, or is triaged as owing one',
    form: 'none',
  },
  {
    id: 'repeated-runs',
    script: 'guards/check-repeated-runs.ts',
    npmScript: 'check:repeated-runs',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every run of steps two or more activity files carry is classified, and the differences between its copies are named',
    form: 'authored',
  },
  {
    id: 'description-hygiene',
    script: 'guards/check-description-hygiene.ts',
    npmScript: 'check:description-hygiene',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'activity YAML descriptions stay WHAT-only; bound technique steps carry no description/name',
    form: 'authored',
  },
  {
    id: 'checkpoint-entry',
    script: 'guards/check-checkpoint-entry.ts',
    npmScript: 'check:checkpoint-entry',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'no activity opens with a checkpoint, so no dispatch exists only to ask a question',
    form: 'materialised',
  },
  {
    id: 'workflow-identity',
    script: 'guards/check-workflow-identity.ts',
    npmScript: 'check:workflow-identity',
    scope: 'corpus',
    gatesServing: true,
    json: true,
    proves: 'every workflow declares the id its directory names, so the name it is referenced by and the name it publishes are one',
    form: 'none',
  },
  {
    id: 'namespace-collision',
    script: 'guards/check-namespace-collision.ts',
    npmScript: 'check:namespace-collision',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every directory name reaches the one directory that carries it, so no reference spelling a name resolves to nothing',
    form: 'none',
  },
  {
    id: 'checkpoint-presentation',
    script: 'guards/check-checkpoint-presentation.ts',
    npmScript: 'check:checkpoint-presentation',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'when a gate is presented is stated only in the engine technique that owns the contract',
    form: 'authored',
  },
  {
    id: 'decision-order',
    script: 'guards/check-decision-order.ts',
    npmScript: 'check:decision-order',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'no checkpoint decides a value a step before it is already gated on',
    form: 'authored',
  },
  {
    id: 'bootstrap-self-contained',
    script: 'guards/check-bootstrap-self-contained.ts',
    npmScript: 'check:bootstrap',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'the text delivered before a session exists sends the reader nowhere it cannot go',
    form: 'none',
  },
  {
    id: 'tool-call-shape',
    script: 'guards/check-tool-call-shape.ts',
    npmScript: 'check:tool-calls',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every tool call a definition describes names arguments that tool declares, and every whole signature names the required ones',
    form: 'none',
  },
  {
    id: 'rule-citation-form',
    script: 'guards/check-rule-citation-form.ts',
    npmScript: 'check:rule-citations',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every technique names the rules it cites, rather than linking to the file they are written in',
    form: 'none',
  },
  {
    id: 'set-action-values',
    script: 'guards/check-set-action-values.ts',
    npmScript: 'check:set-values',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every set action names where it writes, and braces a value that names a variable',
    form: 'authored',
  },
  {
    id: 'harness-adapter-set',
    script: 'guards/check-harness-adapter-set.ts',
    npmScript: 'check:harness-set',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every harness kind resolves to an adapter exposing exactly the operation kinds callers ask for',
    form: 'none',
  },
  {
    id: 'launched-workflows',
    script: 'guards/check-launched-workflows.ts',
    npmScript: 'check:launched-workflows',
    scope: 'corpus',
    gatesServing: false,
    json: false,
    proves: 'every declared launch is performed by a step, every launch is declared, and both name a workflow the corpus holds',
    form: 'authored',
  },
  {
    id: 'self-provisioned-input',
    script: 'guards/check-self-provisioned-input.ts',
    npmScript: 'check:self-input',
    scope: 'corpus',
    gatesServing: false,
    json: false,
    proves: 'no step interpolates its own set target into its technique inputs',
    form: 'authored',
  },
  {
    id: 'self-composed-set',
    script: 'guards/check-self-composed-set.ts',
    npmScript: 'check:self-composed-set',
    scope: 'corpus',
    gatesServing: false,
    json: false,
    proves: 'no set action builds its value out of the variable it writes',
    form: 'authored',
  },
  {
    id: 'branch-as-step',
    script: 'guards/check-branch-as-step.ts',
    npmScript: 'check:branch-as-step',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'no protocol phase encodes a conditional branch as a step',
    form: 'none',
  },
  {
    id: 'activity-technique-overlap',
    script: 'guards/check-activity-technique-overlap.ts',
    npmScript: 'check:activity-tech',
    scope: 'corpus',
    gatesServing: false,
    json: false,
    proves: 'activity techniques[] and step bindings stay disjoint',
    form: 'authored',
  },
  {
    id: 'prism-lens-reachability',
    script: 'guards/check-prism-lens-reachability.ts',
    npmScript: 'check:prism-lenses',
    scope: 'corpus',
    gatesServing: false,
    json: false,
    proves: 'every prism lens is goal-routable or pipeline-internal, and resolves',
    form: 'none',
  },
  {
    id: 'resource-anchors',
    script: 'guards/check-resource-anchors.ts',
    npmScript: 'check:anchors',
    scope: 'corpus',
    gatesServing: false,
    json: false,
    proves: 'every relative .md#anchor link resolves to a rendered heading, and every markdown fence closes',
    form: 'none',
  },
  {
    id: 'technique-template',
    script: 'guards/check-technique-template.ts',
    npmScript: 'check:technique-template',
    scope: 'corpus',
    gatesServing: false,
    json: false,
    proves: 'every technique file follows the normative template, artifact bodies included',
    form: 'none',
  },
  {
    id: 'variable-model',
    script: 'guards/check-variable-model.ts',
    npmScript: 'check:variable-model',
    scope: 'corpus',
    gatesServing: false,
    json: false,
    proves: 'defaults, gates and setVariable effects are coherent with the seeded variable model',
    form: 'authored',
  },
  {
    id: 'duplicate-bodies',
    script: 'guards/check-duplicate-bodies.ts',
    npmScript: 'check:duplicate-bodies',
    scope: 'corpus',
    gatesServing: false,
    json: false,
    proves: 'no rule text and no checkpoint body is authored inline at two sites',
    form: 'authored',
  },
  {
    id: 'stealth-isolation',
    script: 'guards/check-stealth-isolation.ts',
    npmScript: 'check:stealth',
    scope: 'corpus',
    gatesServing: false,
    json: false,
    proves: 'no static leakage path out of a stealth-mode workflow',
    form: 'materialised',
  },
  {
    id: 'when-expression',
    script: 'guards/check-when-expression.ts',
    npmScript: 'check:when',
    scope: 'corpus',
    gatesServing: true,
    json: false,
    proves: 'every when: gate parses under the reference dialect and parenthesizes mixed &&/||',
    form: 'authored',
  },
  {
    id: 'loop-shape',
    script: 'guards/check-loop-shape.ts',
    npmScript: 'check:loop-shape',
    scope: 'corpus',
    gatesServing: true,
    json: true,
    proves: 'an item loop declares its collection, item and early exit, a repeat-until loop its continuation test, and neither declares the other\'s',
    form: 'authored',
  },
  {
    id: 'refs',
    script: 'guards/check-all-refs.ts',
    npmScript: 'check:refs',
    scope: 'corpus',
    gatesServing: true,
    json: false,
    proves: 'every activity/workflow techniques[] reference resolves through the loader',
    form: 'materialised',
  },
  {
    id: 'activities',
    script: 'guards/validate-activities.ts',
    npmScript: 'check:activities',
    scope: 'corpus',
    gatesServing: true,
    json: false,
    proves: 'every activity file validates against the activity schema',
    form: 'authored',
  },
  {
    id: 'workflow-yaml',
    script: 'guards/validate-workflow-yaml.ts',
    npmScript: 'check:workflow-yaml',
    scope: 'corpus',
    gatesServing: true,
    json: false,
    proves: 'every workflow.yaml validates against the workflow schema',
    form: 'materialised',
  },
  {
    id: 'site-links',
    script: 'guards/check-site-links.ts',
    npmScript: 'check:site',
    scope: 'repo',
    gatesServing: false,
    json: false,
    proves: 'every internal site href/src and anchor resolves',
    form: 'none',
  },
  {
    id: 'svg-layout',
    script: 'guards/check-svg-layout.ts',
    npmScript: 'check:svg',
    scope: 'repo',
    gatesServing: false,
    json: false,
    proves: 'site SVG diagrams stay within their geometric bounds',
    form: 'none',
  },
  {
    id: 'source-encoding',
    script: 'guards/check-source-encoding.ts',
    npmScript: 'check:encoding',
    scope: 'repo',
    gatesServing: false,
    json: true,
    proves: 'no text source carries a literal control character, so grep and git diff stay honest',
    form: 'none',
  },
  {
    id: 'pinned-corpus-paths',
    script: 'guards/check-pinned-corpus-paths.ts',
    npmScript: 'check:pinned-paths',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every corpus path a TypeScript source resolves still exists in the pinned corpus',
    form: 'none',
  },
  {
    id: 'lockfile-denylist',
    script: 'guards/check-lockfile-denylist.ts',
    npmScript: 'check:lockfile',
    scope: 'repo',
    gatesServing: false,
    json: true,
    proves: 'no lockfile entry resolves to a version published with an install-time payload',
    form: 'none',
  },
  {
    id: 'routines',
    script: 'guards/check-routines.ts',
    npmScript: 'check:routines',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: "every routine's declared signature matches its own body, and every routine sits in the home its referrers compute or in a library whose operations it binds",
    form: 'materialised',
  },
  {
    id: 'generated-schemas',
    script: 'guards/check-generated-schemas.ts',
    npmScript: 'check:schemas',
    scope: 'repo',
    gatesServing: false,
    json: true,
    proves: 'every generated schema file matches the Zod source it is rendered from, and every schema on disk is accounted for',
    form: 'none',
  },
  {
    id: 'inventory-schema-agreement',
    script: 'guards/check-inventory-schema-agreement.ts',
    npmScript: 'check:inventory',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every field path the construct inventory names resolves in a schema, and every step kind has a row routing an author to it',
    form: 'none',
  },
  {
    id: 'guard-roster',
    script: 'guards/check-guard-roster.ts',
    npmScript: 'check:guard-roster',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'every guard program the corpus cites exists, and no definition file keeps a roster of them beside the registry',
    form: 'none',
  },
  {
    id: 'routine-signature-prose',
    script: 'guards/check-routine-signature-prose.ts',
    npmScript: 'check:routine-prose',
    scope: 'corpus',
    gatesServing: false,
    json: true,
    proves: 'no routine signature teaches a reference site what to bind, which the declaration and the schema already settle',
    form: 'none',
  },
];

export const CORPUS_GUARDS = GUARDS.filter((g) => g.scope === 'corpus');

export function guardById(id: string): GuardSpec | undefined {
  return GUARDS.find((g) => g.id === id);
}
