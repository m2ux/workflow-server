# The fan smoke test — an executable plan

> Investigation · 2026-09-09 · server at `dc43cb49`, `workflows` submodule at `54dd998d`

Verified against `workflow-server` at `dc43cb49` (main) and the corpus submodule at `54dd998d`. Measured figures cited below were re-run, not carried forward. Where I could not confirm something I say so.

---

## 1. The shape of the answer

The coverage cannot live in one place, and the reason is mechanical rather than aesthetic. I measured the corpus today: **17 workflows, 109 activities bound in graphs, 207 graph edges, 18 of them terminal, 0 list-valued, 0 object-valued** — exactly the figures the delivery plan pins as its stage-1 through stage-5 no-movement criterion. Stages 1–5 also install a load gate that "rejects any list or object destination outright". So for the whole window in which the fan machinery is being built and proved, **a corpus fan is doubly impossible**: the gate refuses it, and its mere existence moves four numbers three stages depend on. Meanwhile 32 of the 61 test-grain cases need a *malformed* definition, and `scripts/validate-workflow-yaml.ts` fails the corpus on any load error with five other guards inheriting that result — so those can never be corpus content at any stage.

That splits the work three ways, and the split is forced:

- **A committed, guard-swept, walked fixture corpus** carries every legal form, every guard-finding fixture, and the flagship end-to-end fan run. It lands with stages 1–5, which is what those stages' own acceptance criteria already demand ("fixtures carry the new behaviour", "Corpus output is byte-identical"). I measured that 28 of the 34 corpus-scoped guards already run clean against an alternative root, and the six that don't need three small fixes to guard scripts that are latent bugs anyway. So the fixture root is not a lesser thing that "the guards never see" — it is a second first-class corpus root, swept by one CI line and walked by a fifteen-line test.
- **Inline objects and two committed illegal trees** carry the 31 schema and load refusals. `validateExitBindings` is a pure function over an inline `Workflow`, and `tests/workflow-loader.test.ts:329` is already the home for graph legality — that is the cheapest and most diffable place for the fourteen rules. Only L9 and L14 need files, because both are stated over *flattened* steps and a fragment `ref` cannot be expressed inline.
- **A real corpus workflow** carries the forms that have guard surface, and lands at stage 7 — after `cicd-pipeline-security-audit` adopts a fan for real. Its job is not to be the smoke test. Its job is to be the **regression net inside the corpus-wide sweep**: a definition that the 34-guard sweep and the auto-discovered walk exercise on every pull request forever, with nothing to remember and no second root to maintain.

**On the liability critique's proposal to drop the corpus workflow entirely.** Its central measurement is right and I re-verified the mechanism: `verify-corpus.yml` on the `workflows` branch hardcodes `ref: main` for its tooling and grades the corpus branch *tip*, so after the pointer bump every unrelated corpus pull request is graded by `main`'s live fan implementation against a corpus containing the specimen. That is a permanent coupling, and it is a real cost. But the conclusion does not follow, for two reasons. First, stage 7 already puts a fan in the corpus — the coupling arrives with `cicd-pipeline-security-audit` whether or not a specimen exists, so the specimen adds forms, not exposure. Second, `cicd-pipeline-security-audit`'s adoption covers one instance fan and nothing else: no list fan, no mixed list, no multi-exit branch, no derived-key totality case, no chained fan. Those are exactly the shapes where the guard changes of stages 3 and 4 are silent when broken. A synthetic corpus workflow is the only way the corpus-wide sweep ever sees them.

What I *am* taking from that critique: the specimen gets smaller, it announces itself at the one surface `list_workflows` exposes, it carries no edge whose only justification is coverage the automatic walk never reaches, and it gets a deletion tripwire.

---

## 2. The corpus workflow

### 2.1 Identity

| | |
|---|---|
| Directory | `workflows/fan-conformance/` |
| `id` | `fan-conformance` — must equal the directory name; `resolveWorkflowPath` joins `workflowDir/<id>/workflow.yaml` |
| `version` | `1.0.0` |
| `title` | `Fan Conformance Specimen` |
| `tags` | `[specimen, parallel]` |
| `description` | `A conformance specimen for the graph's fan forms. It sweeps a repository's independent surfaces concurrently and combines them into one reconnaissance report; the sweep is real, and the graph is shaped so every fan form with guard surface appears once.` |

`list_workflows` returns id, title, version and tags (`src/tools/workflow-tools.ts:581`). Naming it a specimen in the title is what stops an agent asked to survey a repository from selecting an engine test harness. There is no `hidden` flag and no tag the server filters, so the title is the only surface that can carry it.

### 2.2 File inventory — 18 files, one edit

```
workflows/fan-conformance/README.md
workflows/fan-conformance/workflow.yaml
workflows/fan-conformance/activities/00-scope-sweep.yaml
workflows/fan-conformance/activities/01-survey.yaml
workflows/fan-conformance/activities/02-dependency-review.yaml
workflows/fan-conformance/activities/03-probe-unit.yaml
workflows/fan-conformance/activities/04-combine-sweep.yaml
workflows/fan-conformance/activities/05-unit-review.yaml
workflows/fan-conformance/activities/06-reconcile-review.yaml
workflows/fan-conformance/techniques/enumerate-surfaces.md
workflows/fan-conformance/techniques/survey-surfaces.md
workflows/fan-conformance/techniques/review-dependencies.md
workflows/fan-conformance/techniques/probe-surface.md
workflows/fan-conformance/techniques/combine-surfaces.md
workflows/fan-conformance/techniques/assess-unit.md
workflows/fan-conformance/techniques/compose-recon-report.md
workflows/fan-conformance/resources/README.md
workflows/fan-conformance/resources/artifact-shapes.md
workflows/README.md                                   ← one "Available Workflows" row
```

No `techniques/TECHNIQUE.md` — omitting it takes the workflow out of `inherited-inputs`' scope by construction, and a bare-slug workflow-local technique resolves without one. No `activities/README.md` (inert; files not matching `/^(\d+)-(.+)\.ya?ml$/` are skipped). No `activities:` list — local activities are auto-discovered by directory scan, as 16 of 17 corpus workflows do.

### 2.3 The graph block, verbatim

```yaml
initialActivity: scope-sweep
graph:
  # A mixed list: two activities that run once, and one that runs once per probe target.
  # The sibling exit routes past the fan for a scope with nothing to probe.
  scope-sweep:
    nothing-to-sweep: __terminal__
    scoped:
      - survey
      - dependency-review
      # Tighter than the server's ceiling: a probe reads a whole surface, and the activity that
      # combines the probes re-pays every probe's payload to write one document.
      - activity: probe-unit
        over: probe_targets
        variable: probe_unit
        maxInstances: 3

  survey:
    thin: combine-sweep
    thorough: combine-sweep

  dependency-review:
    reviewed: combine-sweep

  probe-unit:
    probed: combine-sweep

  # The meeting point of the first fan is the source of the second.
  combine-sweep:
    nothing-to-review: reconcile-review
    swept:
      activity: unit-review
      over: sweep_plan.units
      variable: review_unit

  unit-review:
    reviewed: reconcile-review

  reconcile-review:
    flagged: __terminal__
    settled: __terminal__
```

Seven activities, eleven edges, three of them terminal, one list-valued destination, one object-valued destination. Two fans, two meeting points, and the first meeting point is the second fan's source.

**Two deliberate departures from the proposed design, both measured.**

The declared ceiling moved from the whole-destination fan onto the *list member*, and the whole-destination fan now declares none. The two forms are reached through different helpers in the spec's own schema block — `instanceFans(destination)` for a member, `instanceFan(destination)` for a whole destination — so putting the declared ceiling on one and the configured default on the other is the only arrangement that exercises both ceiling sources through both helper paths. As proposed, both ceilings came through the member path and default-ceiling resolution through the whole-destination path was never touched.

The `revisit` cycle is gone. It cost three things and bought nothing measurable. It livelocked: `revisit_dependencies` was set by a checkpoint option and written back to false by nothing, so the exit gate stayed true forever. Its second pass was byte-identical to its first, because `dependency-review` sits *upstream* of the activity the cycle returned to and no step read the flag — so LF24's stated purpose, observing a container materialised afresh with a different collection, was unobservable. And `all-workflows-walk` never traverses it anyway: under `defaultPolicy` the gated `revisit` exit is on an unset variable, so `pickExit` takes `settled`, and under `autoAdvance` a visited destination is steered around. LF24, LF27 and LF29 move to the fixture root, where a dedicated test drives the cycle with a seeded narrowing and a round counter.

### 2.4 Why each activity exists

| Activity | Its job in the sweep | Its job as a specimen | Cannot merge into |
|---|---|---|---|
| `scope-sweep` | Names the surfaces and the probe targets | The fan source, the only writer of the first collection, and `initialActivity` — so the fan sits between the first activity and the rest of the graph, `review-mode-gating`'s worst case | nothing precedes it |
| `survey` | Reads the documented surface | Bare list member; **single-word id** (branch-key totality, `survey_outputs`); **two exits both naming the meeting point** (L7 is not "one exit per branch"); **internal `doWhile`** (L6's positive remedy); the self-consumed-write negative arm | all three are *branch* properties |
| `dependency-review` | Reads the declared dependency surface | The second bare member, so the first fan's branch set is heterogeneous and the meeting point has two distinct branch keys to spell indexed reads against | a one-member list is not a list |
| `probe-unit` | One probe target's findings | The instance-fan member of the mixed list; declares the first fan's parameter; carries the **slug-arm token artifact** | the parameter is per-activity |
| `combine-sweep` | Writes the sweep document and the review plan | Meeting point 1 — gathers the instance container whole **and** spells indexed reads at slot zero for the two bare members, both join read forms in one activity — plus the second fan's source and its collection's writer | splitting it needs a fourth non-fan activity to no gain |
| `unit-review` | One unit's verdict | The second fan's branch: **object-element** projection, and **declares no artifact**, so the artifact *rule* has an instance-fan arm and the collision family is provably vacuous for an instance fan | `probe-unit`'s elements are slugs; one activity's artifact template has one form |
| `reconcile-review` | Composes the reconnaissance report | Meeting point 2; the one **checkpoint**, beyond both fans; a checkpoint option choosing an exit; the terminal exit | a gate cannot live in a branch (L9) |

### 2.5 The activities

**`activities/00-scope-sweep.yaml`**

```yaml
id: scope-sweep
version: 1.0.0
name: Scope Sweep
description: The surfaces this run sweeps, and the probe targets it runs one probe over.
variables:
  reads:
    - recon_scope
  writes:
    - name: probe_targets
      type: array
      description: The probe targets this sweep covers, one per probe — each a slug id.
    - name: has_probe_targets
      type: boolean
      description: Whether this scope yielded any probe target.
required: true
steps:
  - kind: action
    id: announce-start
    actions:
      - action: log
        message: Scoping the sweep
  - kind: technique
    id: enumerate-surfaces
    technique: enumerate-surfaces
exits:
  - id: nothing-to-sweep
    when: has_probe_targets == false
  - id: scoped
    isDefault: true
outcome:
  - The probe targets are named, so the sweep's width is that collection's length
```

`has_probe_targets` needs no declared *read*: the exit `when` is evaluated at the activity boundary, after the technique step produced it, so `derive` records it as an internal read. I verified both halves of that — `derive` calls `routingRead` on every exit `when` (`src/utils/activity-variables.ts:476`) and `read()` routes a name already in `producedSoFar` into `internalReads` rather than `reads`. And it is not a dead output: `check-binding-fidelity.ts:336` collects every `when` string it meets in the YAML tree into `expressionConsumes`, which `collectConsumedSites` folds into the dead-output consumer map.

**`activities/01-survey.yaml`**

```yaml
id: survey
version: 1.0.0
name: Survey
description: The repository's documented surface, as this pass reads it.
variables:
  reads:
    - recon_scope
    - is_review_mode
    - survey_sufficient
  writes:
    - name: survey_depth
      type: string
      values:
        - shallow
        - deep
      description: The depth this pass reads at.
    - name: survey_sufficient
      type: boolean
      description: Whether this pass read enough of the documented surface.
      defaultValue: false
    - name: survey_findings
      type: array
      description: What the documented surface says about the scope.
required: true
steps:
  - kind: action
    id: set-survey-depth
    actions:
      - action: set
        target: survey_depth
        value: deep
        description: The depth this pass reads at.
  - kind: loop
    id: refine-until-sufficient
    name: Survey Refinement Loop
    loopType: doWhile
    when: survey_depth == deep
    continueWhile:
      type: simple
      variable: survey_sufficient
      operator: '=='
      value: false
    maxIterations: 5
    steps:
      - kind: technique
        id: read-documented-surface
        technique: survey-surfaces
exits:
  - id: thin
    when: is_review_mode == true
  - id: thorough
    isDefault: true
```

Three corrections against the proposed design, all schema-forced or guard-forced:

`continueWhile` is a `Condition`, so it needs `type: simple`, and `ComparisonOperatorSchema` is `['==','!=','>','<','>=','<=','exists','notExists']` — `operator: equals` is not a member. I read both at `src/schema/condition.schema.ts:3-20`. Without this the workflow fails `activities` and `workflow-yaml` outright.

`survey_sufficient` appears in **both** `reads` and `writes`, and its write declaration carries `defaultValue: false`. `flattenActivitySteps` yields the loop step before its body, so the `continueWhile` read is recorded before the body's technique produces the name — it lands in `reads`, not `internalReads`, and without the declaration the guard reports `undeclared-use`; without the default it reports `unreachable-read`, because `availableAtEntry` is seeded from workflow-owned names plus every merged declaration carrying a `defaultValue` (`scripts/check-activity-variables.ts:228-231`). This is the exact corpus idiom: `work-package/activities/06-plan-prepare.yaml` declares `has_resolvable_assumptions` under `reads` at line 11 and under `writes` at line 45 with `defaultValue: false`, and drives a `doWhile` off it at line 121. `survey_depth` alone is the self-consumed case, written by step 1 and read by step 2's gate.

`maxIterations` is present because every corpus repeat-until loop declares one; the schema makes it optional, so this is convention, not enforcement.

**`activities/02-dependency-review.yaml`**

```yaml
id: dependency-review
version: 1.0.0
name: Dependency Review
description: The declared dependency surface, and what it says about the scope.
variables:
  reads:
    - recon_scope
  writes:
    - name: dependency_findings
      type: array
      description: What the dependency manifests say about the scope.
required: true
steps:
  - kind: action
    id: announce-start
    actions:
      - action: log
        message: Reviewing the declared dependency surface
  - kind: technique
    id: review-dependencies
    technique: review-dependencies
exits:
  - id: reviewed
    isDefault: true
```

**`activities/03-probe-unit.yaml`**

```yaml
id: probe-unit
version: 1.0.0
name: Probe Unit
description: One probe target's surface findings.
variables:
  reads:
    - probe_unit
  writes:
    - name: probe_findings
      type: object
      description: What this probe found for its target, with the target's id carried through.
required: true
steps:
  - kind: technique
    id: probe-surface
    technique: probe-surface
exits:
  - id: probed
    isDefault: true
```

`probe_unit` lives in exactly two homes — this `reads` list and the destination that supplies it. It is deliberately **not** in `workflow.yaml`'s `variables[]`, because that list is what the guard treats as workflow-owned: skipped by the unwritten-read check and seeded into the availability lattice, so declaring it there would silently satisfy a read of the parameter anywhere in the workflow.

The proposed design also declared `recon_scope` and `planning_folder_path` here. Both are dropped. `AMBIENT_CONTEXT_IDS` is only `{target_symbol, impact_report, model_id}` (`src/utils/binding-provenance.ts:33`), so `planning_folder_path` is not ambient, and neither name is an input of `probe-surface`'s signature — so both would be reported as `unused-declaration` ("declares a read of 'x' that no step, gate, loop or transition consults"). The artifact contract is server-synthesised; a branch technique does not need the folder in its signature to write into it.

**`activities/04-combine-sweep.yaml`**

```yaml
id: combine-sweep
version: 1.0.0
name: Combine Sweep
description: One sweep document from the branch findings, and the plan the unit reviews run over.
variables:
  reads:
    - survey_outputs
    - dependency_review_outputs
    - probe_unit_outputs
    - probe_targets
  writes:
    - name: gathered_results
      type: object
      description: The ordered per-branch results and the dispatch manifest.
    - name: sweep_document
      type: string
      description: The combined sweep document.
    - name: sweep_plan
      type: object
      description: The plan the unit reviews run over — `units` is an ordered array of id-carrying records.
    - name: has_review_units
      type: boolean
      description: Whether the sweep yielded any unit to review.
required: true
steps:
  - kind: technique
    id: gather-probe-findings
    technique:
      name: orchestration-patterns::gather-results
      inputs:
        dispatched_results: probe_unit_outputs
        expected_ids: probe_targets
  - kind: technique
    id: combine-surfaces
    technique:
      name: combine-surfaces
      inputs:
        survey_findings: "{survey_outputs.0.result.survey_findings}"
        dependency_findings: "{dependency_review_outputs.0.result.dependency_findings}"
        probe_findings_set: "{gathered_results.items}"
exits:
  - id: nothing-to-review
    when: has_review_units == false
  - id: swept
    isDefault: true
```

Both join read forms sit side by side: an **indexed dotted read at slot zero** for each bare member, and the **container handed whole** to the gather with the fan's own collection as `expected_ids`.

The proposed design's third step, `persist-the-sweep` binding `workflow-engine::commit-and-persist`, is deleted. `commit-and-persist.md` declares `activity_id` under its own `## Inputs` (line 12), and the only bind site in the corpus is `meta/activities/03-dispatch-client-workflow.yaml:93`, which supplies `activity_id: current_activity` — meta's own variable. A client workflow binding it bare has no producer for that input, and `binding-fidelity`'s orphan-input family checks a bound op's *own* declared inputs. No client corpus workflow binds any commit or persist engine operation. The orchestrator's post-activity hook already runs it, which is where N4 must be asserted from — a point the design's own Q10 already conceded.

The `nothing-to-review` exit is new. The proposed design gave `combine-sweep` a single exit bound to the second fan, so a sweep finding nothing to review yielded `units: []`, the fan enter refused it (T1c), and there was no sibling exit to take — the run stuck at an activity whose only exit could not be taken. The spec's own prescribed remedy is a `when` predicate on the exit where there may be nothing to fan; the design applied it to the first fan and not the second. This also gives LF20 a second instance and gives T2 a sharper fixture, since here the fanning destination is a whole-destination object rather than a list.

**`activities/05-unit-review.yaml`**

```yaml
id: unit-review
version: 1.0.0
name: Unit Review
description: One unit's verdict against the sweep document.
variables:
  reads:
    - review_unit
    - sweep_document
  writes:
    - name: unit_verdict
      type: object
      description: This unit's verdict, with the unit's id carried through.
required: true
steps:
  - kind: technique
    id: assess-unit
    technique: assess-unit
exits:
  - id: reviewed
    isDefault: true
```

`assess-unit` declares **no artifact**. That is the change that puts the artifact *rule* — "a fan branch declares no artifact, and the activity the fan converges on writes the document" — in the corpus for an instance fan, not only for a list fan. It gives the collision family both arms on one workflow: provably vacuous for `unit-review`, provably non-vacuous for `probe-unit`. And it halves the tooling ask in §9's blocking question, from four token sites to two.

**`activities/06-reconcile-review.yaml`**

```yaml
id: reconcile-review
version: 1.0.0
name: Reconcile Review
description: One reconnaissance report from the unit verdicts and the sweep document.
variables:
  reads:
    - unit_review_outputs
    - sweep_plan
    - sweep_document
    - recon_scope
  writes:
    - name: gathered_results
      type: object
      description: The ordered per-branch results and the dispatch manifest.
    - name: recon_report
      type: string
      description: The reconnaissance report this run produces.
required: true
steps:
  - kind: technique
    id: gather-unit-verdicts
    technique:
      name: orchestration-patterns::gather-results
      inputs:
        dispatched_results: unit_review_outputs
        expected_ids: "{sweep_plan.units}"
  - kind: technique
    id: compose-recon-report
    technique:
      name: compose-recon-report
      inputs:
        unit_verdicts: "{gathered_results.items}"
  - kind: checkpoint
    id: confirm-report
    message: The reconnaissance report for {recon_scope} is composed.
    defaultOption: accept-report
    autoAdvanceMs: 30000
    options:
      - id: accept-report
        label: Accept
        description: Take the report as composed
      - id: flag-for-follow-up
        label: Flag for follow-up
        description: Take the report and mark it as owing a second look
        effect:
          exit: flagged
exits:
  - id: flagged
  - id: settled
    isDefault: true
```

The checkpoint is step 3, not step 1 (`checkpoint-entry` is mechanical over `steps[0].kind` and no gate exempts it).

`autoAdvanceMs` is mandatory here and the proposed design's §6 explicitly said the opposite. `assertSoftnessPaired` (`src/loaders/fragment-resolver.ts:78`) throws a `FragmentResolutionError` when exactly one of `defaultOption` and `autoAdvanceMs` is present: *"A soft gate declares both; a gate that waits for an explicit selection declares neither."* The loader then **excludes the activity** and logs at warn level, so the whole 34-guard sweep passes while `all-workflows-walk` — which runs in `test:ci` with no opt-out — dies with `Activity not found: reconcile-review`. That is a `test:ci` failure invisible to every guard. All 23 `defaultOption` occurrences in the corpus are paired with all 23 `autoAdvanceMs` occurrences; I counted both.

The second option carries `effect: { exit: flagged }` rather than a `setVariable`. That kills a whole chain of consequences: no variable to declare, no reader to invent for it, no `unread-write`, and `hasConsequentialDefault` in `scripts/check-review-mode-gating.ts:180` fires only when the *default* option carries an effect — so `accept-report` staying effect-free is what keeps `review-mode-gating` green without an `ACCEPTED_HEADLESS_AUTO_ADVANCE` entry on `main`. Both exits bind to `__terminal__`, and `validateExitBindings` requires an option's `effect.exit` to be an exit the activity declares, which it is.

### 2.6 `workflow.yaml` head

```yaml
$schema: ../../schemas/workflow.schema.json
id: fan-conformance
version: 1.0.0
title: Fan Conformance Specimen
description: >-
  A conformance specimen for the graph's fan forms. It sweeps a repository's independent surfaces
  concurrently and combines them into one reconnaissance report; the sweep is real, and the graph is
  shaped so every fan form with guard surface appears once.
author: m2ux
tags:
  - specimen
  - parallel
techniques:
  activity:
    - variable-binding
variables:
  - name: recon_scope
    type: string
    description: What this sweep covers — a repository path, a submodule name, or 'all'.
    required: true
  - name: planning_folder_path
    type: string
    description: "Absolute planning folder: .engineering/artifacts/planning/YYYY-MM-DD-fan-conformance"
  - name: is_review_mode
    type: boolean
    description: Whether this run reviews an earlier sweep rather than performing one.
```

Three workflow variables, none with a `defaultValue`, so no existence gate on any of them can be constant. `is_review_mode` is declared deliberately and has a real reader (`survey`'s `thin` exit) — without the declaration `collectReviewGatingViolations` short-circuits the whole workflow (`scripts/check-review-mode-gating.ts:191`, `if (!declaresReview) continue`) and the corpus arm of the review-mode check measures nothing. The four branch containers — `survey_outputs`, `dependency_review_outputs`, `probe_unit_outputs`, `unit_review_outputs` — are **never authored**; stage 4's merge contributes them.

### 2.7 Techniques

Seven files, flat, kebab-case, canonical H2s in order, `metadata.version` only in frontmatter, no H1.

| File | Own inputs | Outputs | Artifact · audience |
|---|---|---|---|
| `enumerate-surfaces.md` | `recon_scope` | `probe_targets`, `has_probe_targets` | — |
| `survey-surfaces.md` | `recon_scope` | `survey_findings`, `survey_sufficient` | — |
| `review-dependencies.md` | `recon_scope` | `dependency_findings` | — |
| `probe-surface.md` | `probe_unit` | `probe_findings` | `` `{probe_unit}-probe-findings.json` `` · agent |
| `combine-surfaces.md` | `survey_findings`, `dependency_findings`, `probe_findings_set` | `sweep_document`, `sweep_plan`, `has_review_units` | `` `sweep-findings.md` `` · human |
| `assess-unit.md` | `review_unit`, `sweep_document` | `unit_verdict` | — |
| `compose-recon-report.md` | `unit_verdicts`, `sweep_document` | `recon_report` | `` `recon-report.md` `` · human |

Both `orchestration-patterns::gather-results` bindings are safe on `orphan-input`. That operation's own inputs are `dispatched_results` and `expected_ids`, both bound at the step. The five inputs its group contract composes into it — `work_goal`, `dispatch_concurrency`, `isolation_mode`, `effort_cap`, `planning_folder_path` — are out of scope by design: the guard's own header states that "contract-inherited entries are ambient session context and out of scope" (`scripts/check-binding-fidelity.ts:27`).

How each output escapes `dead-output`:

- `survey_findings`, `dependency_findings` — a same-named declared input on `combine-surfaces` (the name-match chaining convention).
- `probe_findings`, `sweep_document`, `recon_report` — an `#### artifact` block.
- `unit_verdict` — **needs stage 4's member-grain read** to be consumed, because it is gathered whole through a container. Today `tokenReads` takes only the head of a dotted reference (`bagName` at `src/utils/activity-variables.ts:216-218` is `reference.split('.')[0]`), so a member read is invisible. This is stage 4's declared scope, and it is why the corpus workflow cannot be green before stage 4 lands.
- `probe_targets` — a bare step-binding value at `expected_ids`, which `collectConsumedSites` records (`BARE_NAME_RE.test(v)` at `check-binding-fidelity.ts:561`).
- `has_probe_targets`, `has_review_units` — an exit `when` expression, collected into `expressionConsumes`.
- `sweep_plan` — a `{sweep_plan.units}` interpolation in `reconcile-review`'s step binding, resolved at its head.
- `survey_sufficient` — a `continueWhile` condition variable.

`{probe_unit}` inside the artifact template is the one read with no producer today, and `probe_unit` as `probe-surface`'s own declared input is the one orphan input. Both are the subject of §9's blocking question.

### 2.8 Resources

`resources/README.md` — one orienting sentence, then:

```markdown
## Planning artifact to guide map

| Artifact | Guide |
|---|---|
| `{probe_unit}-probe-findings.json` | [artifact-shapes.md#probe-findings](artifact-shapes.md#probe-findings) |
| `sweep-findings.md` | [artifact-shapes.md#sweep-document](artifact-shapes.md#sweep-document) |
| `recon-report.md` | [artifact-shapes.md#recon-report](artifact-shapes.md#recon-report) |
```

Token templates spelled **verbatim** — `check-artifact-guides.ts` resolves a map row by splitting the guide cell on commas and stripping backticks, then matching the artifact name exactly, and it additionally requires the linked guide file to exist. `resources/artifact-shapes.md` opens directly on `## Probe findings` with **no prose above the first heading**, so `section-framing` raises nothing even though three consumers cite it by anchor; it is cited by anchor only and never bare, so `citation-grain` raises no pair. Three headings, three resolving GitHub slugs, and `ARTIFACT_NAME_PATTERN` (`src/schema/technique.schema.ts:54`) admits `{probe_unit}-probe-findings.json` — I checked that it also admits a dotted token, which the fixture root's `{review_unit.id}` form relies on.

### 2.9 Legal-form coverage

36 forms. 22 in the corpus, 14 in fixtures, each with a stated reason.

| # | Form | Where | Which edge, activity or seed |
|---|---|---|---|
| LF1 | One activity id | **corpus** | `unit-review.reviewed: reconcile-review` |
| LF2 | Terminal sentinel | **corpus** | `scope-sweep.nothing-to-sweep`, `reconcile-review.settled`, `reconcile-review.flagged` |
| LF3 | Two bare ids | fixture `corpus/pair-fan` | Its only distinguishing fact is an array with no fan member — a helper path with no guard surface; S2a lives in the same test file |
| LF4 | Three bare ids | fixture `corpus/triple-fan` | The corpus already carries two bare members inside a mixed list, so every guard sees a heterogeneous distinct-activity fan; the pure form is the walker and runner flagship |
| LF5 | Five bare ids, no ceiling | fixture `corpus/wide-list` | Deliberately not corpus: a list's unbounded arity is an open question (§9 Q3), and a corpus edge would bake in a possibly-missing refusal |
| LF6 | Instance fan, no `maxInstances`, **whole destination** | **corpus** | `combine-sweep.swept` — default-ceiling resolution through `instanceFan()` |
| LF7 | `maxInstances` tighter than the default, **list member** | **corpus** | the `probe-unit` member of `scope-sweep.scoped`, reason in a comment — through `instanceFans()` |
| LF8 | `maxInstances` at its floor (2) | fixture `corpus/instance-fan` | Paired with S3 so the boundary is proved from both sides in one file |
| LF9 | Dotted `over` | **corpus** | `combine-sweep.swept` over `sweep_plan.units` |
| LF10 | Exempt bare-word collection | fixture `corpus/instance-fan` | `over: submodules` — a pure `EXEMPT_DATA_IDS` fact |
| LF11 | Exempt bare-word `variable` | fixture `corpus/instance-fan` | `variable: target`, paired with S4 |
| LF12 | Slug-string elements | **corpus**, run-time | `probe_targets: [docs, tests, deps]` at the smoke run |
| LF13 | Id-carrying object elements | **corpus**, run-time | `sweep_plan.units: [{id, brief}, …]` |
| LF14 | Mixed-element collection | fixture `corpus/element-shapes`, seeded | Two element shapes in one corpus collection is a definition smell; the derivation is per element |
| LF15 | Run-time width 1 | **corpus**, seeded | `probe_targets: [docs]` |
| LF16 | Run-time width exactly the ceiling | **corpus**, seeded | `probe_targets` of 3 against the member's declared 3; `sweep_plan.units` of 4 against the configured default |
| LF17 | Mixed list (bare + fan) | **corpus** | `scope-sweep.scoped` — five workers with three probe targets |
| LF18 | List of instance fans only | fixture `corpus/mixed-fan` | Two fanned activities plus a shared meeting point is three extra activities for a graph-shape fact |
| LF19 | Per-member ceilings | fixture `corpus/mixed-fan` | Same edge |
| LF20 | Predicated fan exit, sibling routes past | **corpus** ×2 | `scope-sweep` (list destination) and `combine-sweep` (object destination) |
| LF21 | Multi-exit branch, all exits to the meeting point | **corpus** | `survey.thin`, `survey.thorough` |
| LF22 | Branch with an internal retry loop | **corpus** | `survey.refine-until-sufficient` |
| LF23 | The meeting point is itself a fan source | **corpus** | `combine-sweep` |
| LF24 | Meeting point routes back to the fan's source | fixture `corpus/chained-fan` | Moved out: the auto-walk never traverses a gated back-edge, so the corpus buys it nothing, and the cycle was what livelocked the workflow |
| LF25 | Meeting point's own exit is the sentinel | **corpus** | `reconcile-review.settled` |
| LF26 | Fan on the initial activity's exit | **corpus** | `scope-sweep` is `initialActivity` |
| LF27 | Meeting point with an alternative non-fan arrival | fixture `corpus/chained-fan` | Needs a second arrival; moved with LF24 |
| LF28 | Single-word branch id | **corpus** | `survey` → `survey_outputs` |
| LF29 | One activity fanned by two destinations | fixture `corpus/chained-fan` | Needs a second source exit; also the two-fan-arrivals case in §9 Q11 |
| LF30 | Branch also a plain destination | fixture `corpus/routing-variants` | Its fact is a write-path fact, asserted directly |
| LF31 | Branch declares no artifact, meeting point writes | **corpus**, **both arms** | list arm: `survey`, `dependency-review` → `sweep-findings.md`; instance arm: `unit-review` → `recon-report.md` |
| LF32 | Token-templated branch artifact | **corpus** (slug arm) + fixture `corpus/routing-variants` (dotted arm) | `probe-unit`'s `{probe_unit}-…`; `{review_unit.id}-…` in the fixture, so §9 Q1's tooling ask stays at the bare-parameter form |
| LF33 | Instance-fan meeting point gathers the container | **corpus** ×2 | `gather-probe-findings`, `gather-unit-verdicts` |
| LF34 | List-fan meeting point spells indexed reads at slot 0 | **corpus** | `combine-surfaces` inputs |
| LF35 | Branch writes a working value and reads it back | **corpus** | `survey_depth`, `survey_sufficient` |
| LF36 | `maxInstances` at or above the default | fixture `corpus/instance-fan` | It loads but violates the stated convention; §9 Q2 |

---

## 3. The illegal forms

Every rule identifier in the matrix appears here. **Exercise site** is one of: `inline` (an object handed to `safeParse` or `validateExitBindings`, no files), `illegal-tree` (a committed fixture workflow loaded through `loadWorkflow`), `wire` (a temp corpus served by `createHarness`), `seeded` (the real corpus workflow, a malformed bag), `call` (the real corpus workflow, a live session, a bad tool call), `guard` (a fixture root handed to a guard's exported collector).

### 3.1 Parse — 9 cases, `tests/fan-destination-schema.test.ts`, inline

| # | Trigger | Asserted |
|---|---|---|
| S1a | `{ a: { done: 42 } }` | the union error-map message |
| S1b | `{ a: { done: [['x','y'],'z'] } }` | the map, **plus** a type-level assertion that `FanMemberSchema` admits exactly `string \| InstanceFan`, **plus** that the generated `items` subschema carries no array branch |
| S1c | `{ a: { done: ['x', 42] } }` | the map |
| S1d | three cases, one per omitted required field | the map, and that it **names all three** of `activity`, `over`, `variable` |
| S2a | `{ a: { done: ['x'] } }` | the **array member's own arity message**, not the map |
| S2b | `{ a: { done: [] } }` | the same message — a distinct path to `.min(2)` |
| S3 | `maxInstances: 1` | the **`maxInstances` field message**, which wins because that member matched furthest |
| S4 | `variable: topic` | `VariableNameSchema`'s qualified-name message |
| S5 | `{ …, unit: 'q' }` | `Unrecognized key(s) in object: 'unit'`, **plus** `additionalProperties: false` in `schemas/workflow.schema.json` |

**Wording, decided.** Use the schema block's text — *"a list of at least two **members** — each an activity id or an instance fan"* — not the parse table's *"a list of at least two activity ids"*. I confirmed the two disagree in the spec (README:606/613 against README:1709/1710), and that the array member is `z.array(FanMemberSchema)`. The schema block matches the type and L2's message already accounts for mixed lists. The parse-table rows are the stale ones and should be corrected in the spec.

### 3.2 Load rules — 24 cases, `tests/fan-load-rules.test.ts`

Inline, extending the existing idiom at `tests/workflow-loader.test.ts:329` — `expect(errors.join(' ')).toContain(…)` for failures, `expect(…).toEqual([])` for pass arms.

| # | Trigger | Site | Asserted |
|---|---|---|---|
| L1 ×3 | one unknown target, once per position: bare member, list-member fan's `activity`, whole-destination fan's `activity` | inline | the per-target message at **each** position. This is the one edit to standing code — `validateExitBindings` currently checks a single string destination at `src/loaders/workflow-loader.ts:565` — so a per-target loop that misses a position must fail |
| L2a | `done: [research, research]` | inline | `fans 'plan-prepare.done' to 'research' twice` |
| L2b | `[web-research, {activity: web-research, …}]` | inline | the same family **plus** the remedy clause `name it with the collection it runs over in a single member` |
| L2c | two fan members over one activity, different collections | inline | the same family |
| L3 | `done: [research, __terminal__]` | inline | `fans … to '__terminal__'` — a **load** rule, the sentinel being a legal string |
| L4 | a branch activity with `exits` omitted | inline | `binds no exit` + `Give it an exit bound to the activity its siblings name` |
| L5a ×2 | a branch's exit bound to a list; to an object | inline | `its exit 'done' fans to …` |
| L5b | `plan-prepare: { done: [plan-prepare, research] }` | inline | **L5's message and no rule of its own** — the spec lists this among the rules a reader may expect that are absent because another rule covers the case |
| L6a | `research: { insufficient: research, done: assumptions-review }` | inline | L6's message **present in the list** (this fixture also violates L7; the rules run into one error list) |
| L6b | `s:{done:[x,y]}, x:{done:y}, y:{done:y}` | inline | L6's message and no rule of its own |
| L7a | three branches, two agreeing | inline | the message spells **all three** destinations, grouped by which branches named them |
| L7b | one branch, two exits to different destinations | inline | the same family — an implementation reading only the default exit passes L7a and lets this through |
| L7c | no branch names a resolvable single destination | inline | the undefined-join failure, on which every downstream reader's non-null assumption rests |
| L8 | `done:[a,b]`, both `→ __terminal__` | inline | `converges on '__terminal__'` — asserted in the same `describe` as LF25, which loads |
| L9a | a branch with an inline checkpoint step | inline | the list-form message ending `or take this activity out of the fan` |
| L9b | the gate-bearing branch is an instance fan's activity | inline | the **variant** ending `there is no instance to take out of the fan` |
| L9c | the checkpoint arrives through a `fragments.checkpoints` ref | **illegal-tree** `l9-fragment-gate` | the rule is over *flattened* steps and `validateExitBindings` runs after materialisation, so an inline object cannot express this |
| L10a | branch id `2nd-pass` | inline | `'2nd_pass_outputs' is not a legal variable name` + `carries an id beginning with a lowercase letter` |
| L10b | an activity declares `research_outputs` where `research` is a branch | inline | the uniqueness arm, **and which** of L10b and the merge's contradiction check fires |
| L11 ×3 | parameter absent from `reads`; two fans of one activity naming different parameters (**both** must fail here); the offending member inside a mixed list | inline | `which 'challenge-pass' does not declare among the names it needs its workflow to supply` |
| L12 ×3 +1 | bare unknown name; dotted `unknown_plan.steps`; inside a mixed list; **plus** a legal dotted head producing no error | inline | `which this workflow declares nowhere`, checked at the head |
| L13 ×3 +1 | index 7 against a declared ceiling of 4; against the configured default; two list members at different ceilings; **plus** an in-range index beyond any plausible width producing **no** finding | inline | `admits 4 instances, so slot 7 is never filled` |
| L14a | a fanned activity binding `workflow-engine::commit-and-persist` | inline | the message names the bound operation and the remedy |
| L14b | the same through a fragment-referenced step | **illegal-tree** `l14-fragment-commit` | flattened-steps arm |
| **LG** | a well-formed fan while the stage 1–5 gate stands | inline | the gate's message names the stage that lands the runner; at stage 6, the same object loads |

**LG's ordering, decided.** The gate appends **last** to the same error list, and the L-rule tests call `validateExitBindings` directly rather than through `loadWorkflow`. Run first, the gate masks every L-rule message and makes stage 1's "one test per load rule" unsatisfiable through the load. Decide this before stage 1's tests are written.

### 3.3 Wire-level load refusal — 2 assertions, `tests/fan-load-refusal-wire.test.ts`

A `mkdtempSync` corpus holding one illegal fan (L7a's shape), served by `createHarness({ workflowDir })`:

- `start_session` → `isError: true`, text contains `converges nowhere`. **No existing test asserts that `start_session` refuses an illegal graph**, and the loader path is `validateExitBindings` → `WorkflowValidationError` → `throw result.error` → `isError`.
- `list_workflows` → `ok`, and the workflow **is still listed** with no `load_errors` key. A broken graph is invisible to discovery; pin that rather than discover it later.

### 3.4 Fan-enter refusals — 8 cases, `tests/fan-enter-refusals.test.ts`, seeded

Against the **real corpus workflow**. The definition stays legal; what is malformed is the bag. Seeding is `next_activity { variables_changed }` on the transition entering the fan — which accepts undeclared names and arbitrary JSON, type validation being warn-only.

| # | Seed | Asserted |
|---|---|---|
| T1a | `probe_targets` of 4, entered through the member declaring `maxInstances: 3` | the ceiling message naming the collection, its length, the bound, and that the bound is `the maxInstances this destination declares`; **no** truncation and **no** successive-waves alternative; and **nothing spent** — no frontier entries, no container, no dispatches. **This is the discriminating case**: 4 exceeds the declared 3 and is at-or-under the configured default of 4, so an implementation that always reads `DEFAULT_FAN_MAX_INSTANCES` fails here and only here |
| T1a′ | `probe_targets` of 3 against the same declared 3 | the fan **enters** — inclusive at the declared bound |
| T1b | `sweep_plan.units` of 5, through the whole-destination fan declaring no ceiling | the message names the **configured default and says so**, and offers the declare-a-`maxInstances` / cap-upstream remedy |
| T1b′ | `sweep_plan.units` of 4 against the configured default of 4 | the fan **enters** — inclusive at the default |
| T1c | `probe_targets: []` | the empty-collection message, its reasoning and its remedy — paired with `scope-sweep`'s `nothing-to-sweep` exit, the corpus edge that **takes** that remedy, and with T1c′ below |
| T1c′ | `probe_targets: [docs]` | width 1 **enters** — only empty is refused, so `maxInstances`' floor of 2 bounds the declared ceiling and never the run-time width |
| T1d | `probe_targets: 'docs'`; and a dotted case where `sweep_plan.units` is a scalar | `holds a string, not an array` |
| T1e | element 2 of `sweep_plan.units` is `{brief: '…'}` with no `id` | names the **element index** and the three things the id designates |
| T1f | elements 1 and 3 of `probe_targets` both `docs`; and the object-element derivation | names **both** indices and the id |

### 3.5 Live session, bad tool call — 10 cases, `tests/fan-transition-refusals.test.ts`

| # | Session state | The call | Asserted |
|---|---|---|---|
| T2 | on `scope-sweep`, whose `scoped` exit fans | `next_activity` with the destination and **no `exit`** | `binds exit 'scoped' to a fan, so 'exit' is required`. `scope-sweep` and `combine-sweep` both have one fanning and one non-fanning exit, so both are sharper than a single-exit source; assert on both, since one destination is a list and one an object |
| T3a | three instances of `unit-review` in flight | `from_activity: 'unit-review'` | states the instance count, lists every entry in flight, instructs `activity and instance together`. Resolution step 1 is an exact string comparison, so a bare name must match **nothing** |
| T3b | `unit-review#0` already retired | `from_activity: 'unit-review#4'`, then a repeat of the `#0` retirement | lists what **is** in flight; the repeat is refused as holding no open branch |
| T3c | five branches of `scope-sweep.scoped` in flight | `from_activity` **omitted** | the third message, naming the count and all five, and stating `the destination is entered once, when the last one does`. Legal converse in the same test: omitted with one entry resolves to the sole entry |
| T4a | one activity in flight | `get_activity { activity_id: <wrong> }` | names what the session is on and what was asked for; instructs reporting the mismatch **rather than retrying without `activity_id`**. Same membership test asserted for `get_technique` |
| T4b | three instances in flight | `get_activity` with no `activity_id` | the middle message **names every entry**. Accepted case in the same test: an instance's response reports the instance-qualified id **back** |
| T4c | fresh session | `get_activity` | `No activity in flight. Call next_activity first.` |
| T5 | five branches in flight | `yield_checkpoint { checkpoint_id: 'ad-hoc' }` | the in-flight count, the one-outstanding-decision rule, and the two conforming alternatives. **Not** redundant with L9: the tool admits a decision no definition mentions |
| T6 | five branches in flight | `dispatch_child` | the message, and that it comes from the **same ambiguity helper** as T5 |
| T8 | retiring `survey` | `variables_changed: { survey_depth: 'exhaustive' }` | today's wording unchanged, `stored as written`. The load-bearing half is *which* declarations it validated against: the **retiring branch activity's own** declared writes. `survey_depth` declares `values: [shallow, deep]` and no workflow variable does, so this fixture distinguishes validation-against-own-writes from validation-against-the-merge |

### 3.6 Store — 2 cases, `tests/fan-concurrency.test.ts`

Against the **real corpus workflow**. T7 is the only refusal a correct fan reaches on a normal walk, and the spec is explicit that "a fan's acceptance does not require that no refusal appears in its log".

| # | Provocation | Asserted |
|---|---|---|
| T7a | five branch `get_activity` calls under five distinct identities in one `Promise.all` | `STALE_WRITE`'s message opens `CALL THIS TOOL AGAIN with the same arguments` and states nothing was written; each repeat succeeds; the run is **accepted with the refusals present** — every branch served, every branch's outputs in its own slot, the barrier released once; and that `STALE_WRITE` is **not counted as a fan refusal**, because the spec omits it from the fan's table deliberately |
| T7b | **the final two retirements in flight** — `Promise.all` over two `next_activity` calls, each naming its own `from_activity` | exactly **one** `activity_entered` event for the meeting point; one call admitted and one `STALE_WRITE`d; the retry **succeeds** rather than being refused as a duplicate |

T7b is new and it is the case the proposed design could not see, because its §3.7 put only `get_activity` calls in flight while its step 6 retired every branch sequentially. `next_activity` is the writer of the container and the frontier, so it is the concurrency that matters. The reasoning that makes T7b safe is worth writing into the test as a comment: each call removes only its own `from_activity`, so a refused write leaves the frontier untouched and the retry passes the membership test, while a *genuine* duplicate finds its entry already gone and is refused by T3. The two are distinguishable — but only if the membership test reads the same bytes the compare-and-swap compares, which is what T7b pins.

Add a **retirement-order sweep** in the same file: ten sampled orderings of the five-branch fan, each asserting one meeting-point entry and collection-ordered slots. D1's "order of return does not matter" is otherwise asserted by trying two orders.

### 3.7 Guard runs — 13 cases

`tests/fan-activity-variables.test.ts`, `tests/fan-artifact-collision.test.ts`, and an extension to `tests/review-mode-gating-guard.test.ts`, each calling the guard's exported collector with `--root` or `WORKFLOWS_DIR` pointed at a fixture root. `requireWorkflowsRoot` refuses a missing or empty root and `assertScanned` refuses a root that yielded nothing, so every root holds at least one real workflow directory plus a stub `meta`.

**One root per polarity, and exact finding sets.** The proposed design provisioned five roots on the reasoning that "a root with findings cannot also prove zero findings". That is not so: these collectors return a finding *list with sites*, so asserting the list equals exactly the expected set on one root is cheaper and strictly stronger — it catches over-reporting as well as under-reporting. Two roots: `guard-findings/` (exact expected set) and `corpus/` (empty set), plus `review-mode/` because `collectReviewGatingViolations` takes a different collector.

| # | Fixture | Asserted |
|---|---|---|
| G1 | `guard-findings/g1-bare-read` | `unwritten-read` — once the write side is re-keyed the bare member is written by nothing |
| G2 | `guard-findings/g2-wrong-member` | the verbatim member-grain text **including** the `it lands …` enumeration; the read test drops a leading all-digits segment **and then** a literal `result` segment, so the fixture uses an **indexed** read. A mistyped *key* is a separate fixture asserting `unused-declaration` |
| G3 | `guard-findings/g3-ungathered` | `unread-write` at member grain, verbatim |
| G4 | `guard-findings/g4-no-index` | `unwritten-read` **naming the instance form** |
| G5b | `guard-findings/g5b-unwritten-in-branch` | `unreachable-read` **is** reported — the arm proving the check is not merely *disabled* for branches |
| G6 | `guard-findings/g6-collection-unwritten-on-a-path` | the verbatim detail string, **and** the absence of a spurious `unused-declaration` on the fanned activity — which is how the third injection (the derived-reads set) is asserted rather than assumed |
| G7 | `guard-findings/g7-collection-never-written` | `unwritten-read` at fan grain from the same synthetic read; distinct from L12, which fails the *load* when the collection is declared nowhere |
| G8 | `guard-findings/g8-stray-parameter-read` | `unwritten-read` with the **fan-specific detail string** and no new family name. The fixture holds **both** a legal reader and a stray one, because a global ambient set would satisfy the stray silently |
| G9 | `guard-findings/g9-literal-collision` | `fan-artifact-collision`, distinct arm, verbatim. Needs technique files. A second fixture with two **templated** colliding names asserts **no** finding, recorded as a known blind spot |
| G10 | `guard-findings/g10-untemplated-instance-artifact` | the instance arm, stating **both** legal remedies |
| G5a | `corpus/chained-fan` (LF27's shape) **and** `fan-conformance` | **zero** findings. Plus the three ways to apply the arrival split and have it do nothing, each fixture-only: the branch removed from the meeting point's plain predecessor index **including every duplicate entry**; the candidate seed taken from the first **arrival**; a branch head's own predecessor staying ordinary. An eleven-instance fan asserts termination and that the graph builder collapses it to **one** node. G5a and G5b run against roots asserted in the same test, so a change satisfying one by breaking the other cannot pass |
| G11 | `review-mode/gate-beyond-a-fan` **and** `fan-conformance` | the finding fires on the fixture, **and** the **contents of the reachability set** are asserted — the failure mode without the flatten is a silent under-report, not a wrong answer. The fixture **must declare `is_review_mode` in its `workflow.yaml` `variables[]`**, or `collectReviewGatingViolations` skips the workflow at line 191 and the positive arm passes vacuously against an empty set |

The `corpus/` root also carries the negative arms the proposed design listed: G3's self-consumed exemption (a correct fan producing **exactly zero** findings, where without it the family fires on the order of thirty-five times), G6's source-writes case, G8's own-read case, and G9/G10's vacuity where branches declare no artifact.

### 3.8 The end-to-end fan run

`tests/e2e/fan-smoke-walk.test.ts`, hand-driven over the MCP wire — not the walker, which runs in graph mode and executes no steps. It runs against the **fixture** root from stage 5 and against the **corpus** workflow from stage 7b, from one parameterised body, because the sequence is identical and the fixture version is the only one that can exist before stage 6.

Sequence, with the assertion at each step, against `fan-conformance`:

1. `start_session { workflow_id: 'fan-conformance', agent_id: 'orchestrator', planning_folder, user_request }`.
2. `next_activity { activity_id: 'scope-sweep' }`, `get_activity`, report `probe_targets: ['docs','tests','deps']`, `has_probe_targets: true`.
3. `next_activity` off `scope-sweep` with `exit: 'scoped'` and the list destination.
   - `_meta.fan.branches === ['survey','dependency-review','probe-unit#0','probe-unit#1','probe-unit#2']` — **five workers from one destination**: a flat frontier and one barrier, which is U1's behavioural half.
   - `probe_unit_outputs` materialised as three slots with ids `docs`/`tests`/`deps` and `result: null`; **one** `variable_set` event with a write source naming a fan enter.
   - `survey_outputs` and `dependency_review_outputs` materialised as one-slot containers.
4. Five `get_activity` calls under **five distinct identities**. The three `probe-unit#k` responses carry `fan_instance: { variable: 'probe_unit', instance: k, value: <slug> }`; `survey` and `dependency-review` carry none; each reports its instance-qualified id **back**. Assert **zero** `activity_redelivered` events across the whole fan — the spec notes a detector keyed on a base id fires N−1 times on a *correct* fan and buries the one event that matters — and, in a sibling case, that two `get_activity` calls for `probe-unit#1` under two identities produce **exactly one**.
5. Five `record_usage`, instance-qualified.
6. Retire out of order — `probe-unit#1`, `survey`, `probe-unit#2`, `dependency-review`, `probe-unit#0`.
   - `_meta.barrier.met === false` with a **shrinking** `pending` on the first four; `met === true`, `pending: []`, `destination: 'combine-sweep'` on the fifth.
   - **exactly one** `activity_entered` for `combine-sweep`.
   - `probe_unit_outputs` dense and in **collection** order despite the retirement order; each slot's `result` its own instance's map, each `id` its own element's.
   - the bare names `survey_findings`, `dependency_findings`, `probe_findings` are **absent** from the bag. Assert bag *contents*, never warning absence — an unwrapped bare name from two branches clobbers warning-free, because the write path skips both the declared-type and value-set checks for a name with no declaration.
   - **The destination-disagreement pair** (see §8, hole 1): on retirement 1, name a destination other than `combine-sweep` and assert the call is refused, or record that it is silently discarded; on retirement 5, name `__terminal__` and assert either a refusal or that the frontier holds `['combine-sweep']` with status not `completed`.
7. `get_activity` for `combine-sweep`: the gather reports `completeness: complete` with three rows; the delivered `exit_destinations` renders `swept` as the fan **object**, not an interpolated string.
8. `next_activity` off `combine-sweep` with the object destination and `sweep_plan` reported as three id-carrying objects. Three branches `unit-review#0..2`; each `fan_instance.value` is the element **whole**.
9. Retire the three; `reconcile-review` entered once; `unit_review_outputs` dense in `sweep_plan.units` order.
10. `get_activity`, `yield_checkpoint` → `respond_checkpoint { option_id: 'accept-report' }` → `resume_checkpoint`, then `next_activity { activity_id: '__terminal__', from_activity: 'reconcile-review', exit: 'settled' }`. `session.json#status === 'completed'`; frontier empty. A sibling case answers `flag-for-follow-up` and asserts the option's `effect.exit` selects `flagged`, which also terminates.
11. **Artifact ledger:** `docs-probe-findings.json`, `tests-probe-findings.json`, `deps-probe-findings.json`, one `sweep-findings.md`, one `recon-report.md`, and **no numbered duplicates**. That absence is the collision proof.
12. **Usage:** **eleven** figures — `scope-sweep`, `survey`, `dependency-review`, three `probe-unit` instances, `combine-sweep`, three `unit-review` instances, `reconcile-review` — every one instance-qualified, with the activities-without-usage diff empty.
13. **Progress surface:** one commit naming the planning README before the spawn, one persist at convergence naming every branch — asserted from the orchestrator's call sequence in session history, not against a real remote, and **not** from a step inside the meeting point.
14. `inspect_session` renders the frontier; an instance re-reading the bag through it finds `probe_targets`, not its element.
15. A second `describe` drives `nothing-to-sweep`, asserting the run completes without the fan opening and with no container materialised. A third drives `nothing-to-review` off `combine-sweep`.
16. A fourth `describe`, against the fixture root only, drives `chained-fan`'s cycle: enter fan 2 with three elements, fill all three, route the meeting point back to the source with a **narrowed** collection, and assert the container holds exactly two slots in the second collection's order with **no residue** of round one, and that a templated instance artifact **creates** rather than updates on the second entry.

---

## 4. The unrepresentable properties

| # | Property | What is asserted, and where | What is *not* asserted |
|---|---|---|---|
| D1 | The meeting point is entered once, after the last branch returns | §3.8 steps 6 and 9; the retirement-order sweep in §3.6; `tests/fan-frontier.test.ts` asserts the tool surface exposes **no** barrier-met and no meeting-point-enter parameter, and that reloading the session file mid-fan re-derives the same barrier with no extra state — the frontier holding slot names rather than worker identities. **Plus** the destination-disagreement pair, because the resolution rule as specified enters `activity_id` without checking it against the derived meeting point | — |
| D2 | Entering a fan retires its source exactly once | `fan-frontier.test.ts`: exactly one exit event for the source and one entry event per branch, all from **one** call. Backstop asserted rather than the absence: a second advance off the retired source names an entry the frontier no longer holds and is refused by T3 | — |
| D3 | At most one fan is open, so the frontier needs no fan identity | The session schema has **no fan-identity field** — an entry is one string. `fan-conformance`'s own chained fan and `corpus/chained-fan`: frontier length returns to exactly 1 at the meeting point before the second fan opens. The static half is L5a/L5b/L6/L7, since D3 is their consequence | See §8, hole 4: a meeting point that **is** its own fan's source is refused by no rule |
| D4 | A branch cannot take a second activity | The fan-dispatch operation declares neither a worker result nor a worker identity, so the drive loop's continue gate evaluates false — asserted against the definition. Runtime backstop T4a. Redelivery silence asserted in §3.8 step 4 | **The list-fan misroute.** A membership test admits every branch, so a worker whose prompt names a sibling's activity **is served that sibling's body** and nothing refuses it |
| D5 | No branch writes a bare shared name | Two branches report the **same bare name** with different values; both readable afterwards under their own keys, the bare name **absent**. Tool surface carries no branch-key parameter. L9 and T5 close the other two write paths | — |
| D6 | No instance writes into another instance's slot | Out-of-order retirement, plus the **concurrent** final-two retirement of §3.6 T7b: each slot's `result` its own instance's, each `id` its own element's. The `variable_set` event names key, index **and** member. No tool parameter carries a slot index | — |
| D7 | An unfilled slot is legible as absent | `tests/fan-container.test.ts` evaluates **both real dotted-path evaluators**: a not-exists gate true for the empty slot, true for a **member** of it, true for an **out-of-range** index; an exists gate true for a present member. Positive reading: the gather's manifest marks that unit empty. **Provoked two ways** — one instance left unretired, and the spec's own path, a **replacement** taking the same frontier entry under a new identity and returning first while the original's late report is refused | — |
| D8 | The container's order is the collection's order | Round-trip through the real write path with **eleven** instances — materialise, positional write, canonicalise, seal, persist, **reload** — asserting slot order. Eleven because the two rejected shapes fail visibly there: numeric keys sort `0,1,10,2`, and a sparse array canonicalises to invalid JSON | — |
| D9 | A second entry resets the container | `corpus/chained-fan`, §3.8 step 16: three slots then two, in the second collection's order, no residue. Consequence asserted: a templated instance artifact creates rather than updates | — |
| D10 | A fan's width is not bounded by the batch bound | **Free on the corpus**: `DEFAULT_BATCH_MAX_ACTIVITIES = 3` (`src/config.ts:165`) and `scope-sweep.scoped` opens five. Assert every branch's **first** delivery is admitted and each retire call's batch reading reports one activity. Negative asserted: removing the fan ceiling leaves the width unbounded, so **T1a/T1b are the load-bearing tests for this property** | — |
| U1 | No nested barrier | Structural: `FanMemberSchema` admits exactly `string \| InstanceFan` (type test) and the generated `items` subschema carries no array branch. Behavioural: the mixed list produces a **flat frontier of five** and exactly **one** barrier release. The authored-nesting attempt is S1b | **Not** "the rule count is fourteen." Pinning a count is a second home that drifts silently, and §8's hole 3 may add a fifteenth rule. Assert the member *type*, which is the actual claim |
| U2 | Combination happens only in the combine phase | Bag contents after a fan hold **only** container keys, no bare member names. The declaration merge **adds** the container without replacing members, so members keep declared types, value sets and starting values; the container carries **no** starting value. The container's declared type is `array` for **both** forms — see §8, hole 2. Guard half: G1 | — |
| N1–N8 | Actor obligations | By **observation** in §3.8: five distinct identities in the delivery ledger, eleven usage rows, one pre-spawn commit, one convergence persist from the *orchestrator's* call sequence, the instance-qualified id returned, zero redeliveries on a correct fan. **Never by provoking a refusal** — none is enforced | N6 is deliberately not mechanised. N5 is ineffective for a list fan. N4's site is the orchestrator, not a step in the meeting point |

---

## 5. Guard legality

38 registered guards, 34 corpus-scoped — I counted `scripts/guards.ts` and the four repo-scoped ids `lockfile-denylist`, `site-links`, `source-encoding`, `svg-layout`, which `tests/guard-registry.test.ts:47` pins. The spec's "the registry stays at 36" is stale by two: `launched-workflows` and `canonical-home-map` were both registered during this planning window, the latter at `dc43cb49`. The fan adds no entry.

| Guard | What `fan-conformance` does | Exemption |
|---|---|---|
| `workflow-yaml` | Loads through the real loader; every activity validates; **every filename's post-`NN-` segment equals its own `id:` field** — a mismatch loads, validates and passes all 34 guards, then dies at the walk with `Activity not found`; no bare multi-word snake_case token in any Protocol body | none available |
| `activities` | Every step carries an explicit `id`, so the two `gather-results` bindings do not collide on a derived step id; `continueWhile` is a well-formed `Condition` with `type: simple` and `operator: '=='` | none |
| `refs` | Seven workflow-local bare-slug techniques plus one `meta` group op, all resolving | none |
| `activity-variables` | Every declared read has a writer and every declared write a reader, closed name by name in §2.5 and §2.7. Branch containers are **derived**, never authored. `probe_unit`/`review_unit` live in exactly two homes. `survey_sufficient` is declared on both sides with `defaultValue: false`; `survey_depth` takes the self-consumed exemption. No `planning_folder_path` read anywhere | **none exists** — hard zero, no ledger. Green only after stage 4 |
| `binding-fidelity` | Every own input has a step-binding entry, a workflow variable, a same-named producer, or an artifact block. Group-inherited inputs are out of scope by the guard's own header | ledger on `main`; **target: zero new entries**, contingent on §9 Q1 |
| `audience` | The one agent-audience artifact ends `.json` (a `{token}` name whose literal tail is `.json` passes); both human artifacts declare `human` | none |
| `artifact-guides` | Three guide-map rows in `resources/README.md`, token template verbatim, guide file present | latent baseline; not used |
| `technique-template` | `metadata.version` only in frontmatter, no H1, canonical H2s in order, snake_case I/O ids, one-segment artifact names | none |
| `identifier-qualification` | Every I/O id is a two-word snake_case noun phrase. No `EXEMPT_DATA_IDS` entry added | not touched |
| `inherited-inputs` | **No `techniques/TECHNIQUE.md`** — out of scope by construction | n/a |
| `citation-grain` | `artifact-shapes.md` cited by anchor only, never bare | none |
| `section-framing` | `artifact-shapes.md` opens directly on `## Probe findings` | `workflows/section-framing-triage.json` available corpus-side; not used |
| `resource-anchors` | Three anchors, three matching headings | none |
| `description-hygiene` | Every `description` is a bare WHAT clause; the one `set` description is one sentence. **No** occurrence of `run every`, `wait-all`, `wait until`, `for each unit`, `seed the`, `ordered gather`, `under that bound`, `concurrency bound`, `append the`, `then wait`, `first seed`, `after that`. The fan's procedure lives in technique Protocol | none |
| `checkpoint-entry` | The one checkpoint is step 3 | none |
| `checkpoint-presentation` | No rule asserts whether a checkpoint reaches a person | none |
| `decision-order` | No step is gated on anything the checkpoint decides; the option chooses an exit directly | none |
| `set-action-values` | One `set`: `target: survey_depth`, literal `deep`, inside the declared `values` set | none |
| `variable-model` | One `defaultValue` (`survey_sufficient: false`, type-matched) and no `exists`/`notExists` anywhere, so no `exists`-on-defaulted case; **no `setVariable` at all** | none |
| `fragments` | No fragment refs; no rule or checkpoint body duplicating anything corpus-wide — every string fresh | none |
| `when-expression` | Four inline gates, each a single comparison; no mixed `&&`/`\|\|` | none |
| `loop-shape` | One `doWhile` with `continueWhile`, no `over`, no `variable`, no `breakCondition`, and never in a file beside a fan's `over` | none |
| `branch-as-step` | No indented Protocol sub-bullet opens with `If`/`When`/`Never`/`Do not`; every branch is a `>` note | none |
| `activity-technique-overlap` | `techniques.activity: [variable-binding]` at workflow level only | none |
| `self-provisioned-input` | The one `set` target is not interpolated into that step's inputs | none |
| `self-composed-set` | No `set` builds its value from the variable it writes; container slots are the server's | none |
| `launched-workflows` | No `triggers[]`, no step binding `handle-sub-workflow` | none |
| `review-mode-gating` | `is_review_mode` **declared deliberately**, so the guard looks; the one gate's `defaultOption` carries no `setVariable` and no `exit` effect | `ACCEPTED_HEADLESS_AUTO_ADVANCE` not used |
| `canonical-home-map` | Binds no canonical-home map — out of scope | n/a |
| `pinned-corpus-paths` | No test embeds a `fan-conformance/...` path literal; every test drives by workflow **id** | none |
| `stealth-isolation` | Out of scope — `workflowId = argOf('--workflow') ?? 'remediate-vuln'` and the sweep passes no `--workflow` | not needed |
| `prism-lens-reachability` | Out of scope — root hardcoded to `prism/` | not needed |
| `harness-adapter-set` | Out of scope — scope is `meta/techniques/harness-compat/` | not needed |
| `bootstrap-self-contained` | Out of scope — one hardcoded meta file | not needed |

**The authoring loop.** Iterate against a scratch corpus, never the live submodule:

```
cp -r workflows /tmp/fc-corpus            # then author into /tmp/fc-corpus/fan-conformance
npx tsx scripts/check-all.ts --root /tmp/fc-corpus --corpus-only    # 34 guards, ~6s
npx tsx scripts/check-activity-variables.ts --root /tmp/fc-corpus
WORKFLOWS_DIR=/tmp/fc-corpus npx vitest run tests/e2e/all-workflows-walk.test.ts
```

Verify by **delta**, not by absolute green: a `main`-ahead-of-submodule sweep carries pre-existing findings unrelated to this change. And run the walk, not only the sweep — the checkpoint-pairing defect in §2.5 was invisible to all 34 guards and fatal to the walk.

---

## 6. The files that land

### On `main`

| Path | What is in it | Stage |
|---|---|---|
| `tests/fan-destination-schema.test.ts` | S1a–d, S2a–b, S3, S4, S5; unit coverage of `destinationTargets`, `memberTargets`, `isFan`, `instanceFans`, `instanceFan`, `branchKey`; U1's type half; LF3/LF4/LF5 helper paths; LF28 branch-key totality | 1 |
| `tests/generated-schemas.test.ts` *(extend)* | the three-member `anyOf`, `minItems: 2`, non-empty `items`, `required: [activity, over, variable]`, `additionalProperties: false`, `minimum: 2`; U1's structural half | 1 |
| `tests/fan-load-rules.test.ts` | L1–L14 all arms inline, LG and its ordering, the two fragment arms via `loadWorkflow` | 1 |
| `tests/fan-instance-ids.test.ts` | `baseId`/`instanceIndex` over **both** populations — the existing loop-body checkpoint discriminator is non-numeric (`assumption-decision#RE-1`) while a fan's is numeric — and that the retired checkpoint base helper has no surviving alias | 1 |
| `tests/fan-load-refusal-wire.test.ts` | `start_session` refuses; `list_workflows` still lists | 1 |
| `tests/e2e/fan-fixture-walk.test.ts` | ~15 lines: scan `tests/fixtures/parallel-activities/corpus/` for `workflow.yaml`, `walk(h, id, defaultPolicy, { mode: 'graph', autoAdvance: true })`, assert `path.length > 0`, empty `orchestratorUnresolved`, empty per-step `unresolved`, empty `loadErrors`. Verified feasible: `createHarness({ workflowDir })` serves any root and `tests/e2e/walker.ts` never touches `corpusRoot()` | 2 |
| `tests/e2e/fan-walk.test.ts` | the walker over each legal fixture: a fan-bound exit yields the branch set, each branch entered then the meeting point once, visit bookkeeping keyed on activity ids, an eleven-instance fan → **one** graph node; the checkpoint consequence, exit payload and immediate-exit message interpolate **no** destination; the two silent readers proved **live** | 2 |
| `tests/review-mode-gating-guard.test.ts` *(extend)* | G11: the finding **and** the reachability set's contents | 2 |
| `tests/fan-activity-variables.test.ts` | G1–G8 on `guard-findings/` as an **exact** finding set; empty set on `corpus/` and on `fan-conformance`; the three injections; the arrival split's duplicate removal; the eleven-instance fixed point | 3, 4 |
| `tests/fan-artifact-collision.test.ts` | G9, G10 both arms plus both recorded blind spots | 4 |
| `tests/fan-frontier.test.ts` | the frontier, `heldActivity`'s resolution table, canonical key ordering, the legacy single-activity → one-entry-frontier migration and resume; D1, D2, D3 | 5 |
| `tests/fan-enter-refusals.test.ts` | T1a–T1f plus the four legal boundary arms | 5 |
| `tests/fan-transition-refusals.test.ts` | T2, T3a–c, T4a–c, T5, T6, T8 | 5 |
| `tests/fan-container.test.ts` | D6, D7 (both provocations), D8, D9 | 5 |
| `tests/fan-write-path.test.ts` | D5, D10, LF30's write-path stress | 5 |
| `tests/fan-concurrency.test.ts` | T7a, T7b, N8, the retirement-order sweep | 5 |
| `tests/e2e/fan-smoke-walk.test.ts` | §3.8 in full, parameterised over the fixture root and (from 7b) the corpus workflow | 5, 7b |
| `tests/fan-conformance-shape.test.ts` | the deletion tripwire: `loadWorkflow(corpusRoot(), 'fan-conformance')` and assert the graph still carries a list destination, a fan member inside that list, a whole-destination fan, and a branch with two exits both naming one activity. Drives by id, so no `pinned-corpus-paths` literal | 7b |
| `scripts/check-prism-lens-reachability.ts` *(fix)* | exit 2 when `<root>/prism/resources` is absent, rather than an unhandled `ENOENT` from an unguarded `readdirSync` | 1 |
| `scripts/check-stealth-isolation.ts` *(fix)* | exit 2 when its target workflow is not in the root, rather than reporting a load failure as a finding | 1 |
| `scripts/check-binding-fidelity.ts` *(fix)* | suppress `stale-triage` when `resolveWorkflowsRootWithOrigin` reports an origin other than `'default'` — its `TRIAGE` path is `join(DIR, …)`, beside the guard, so off-root every entry reads as stale | 1 |
| `.github/workflows/verify.yml` *(edit)* | one step: `npm run check:all -- --root tests/fixtures/parallel-activities/corpus --corpus-only`. **Not** a new `check:*` package script — `tests/guard-registry.test.ts:59` requires every `check:*` script to have a registry entry, exempting only `check:all` and `check:delta` | 1 |
| `tests/e2e/walked-workflows.ts` *(edit)* | `'fan-conformance'` added to `WALKED`, below `work-package` | 7b |

### Fixture roots

```
tests/fixtures/parallel-activities/
  corpus/                          ← swept by all 34 guards, walked
    section-framing-triage.json    (empty entries — check-section-framing reads <root>/)
    meta/                          (stub workflow + the group ops the fixtures bind)
    pair-fan/                      LF3
    triple-fan/                    LF4
    wide-list/                     LF5
    instance-fan/                  LF8, LF10, LF11, LF36
    mixed-fan/                     LF18, LF19
    chained-fan/                   LF24, LF27, LF29, D9, G5a
    routing-variants/              LF30, LF32-dotted, two-fans-one-join (§8 hole 5)
    element-shapes/                LF14, T1e/T1f targets
  guard-findings/                  ← exact expected finding set; NOT swept
    meta/
    g1-bare-read/ … g10-untemplated-instance-artifact/
  review-mode/
    meta/
    gate-beyond-a-fan/             raw YAML, declares is_review_mode
  illegal/                         ← does not load; NOT swept
    l9-fragment-gate/
    l14-fragment-commit/
```

Each root needs a stub `meta` because technique resolution falls back to it, and `requireWorkflowsRoot` refuses a root holding no workflow. `corpus/` needs its own `section-framing-triage.json` because `check-section-framing.ts:44` resolves `TRIAGE_PATH` against the corpus root — the live corpus copy carries entries for workflows the fixture root does not hold and would be reported stale.

### On the `workflows` branch

The 18 files of §2.2 plus one `workflows/README.md` row. AP-40 bounds what the workflow README may say — no enumerations of steps, exits, graph, bindings, variables or counts — so it carries the purpose, a flow diagram and links to the YAML, and states that the graph is shaped as a specimen without listing which forms sit on which edge. §2.9's table is the actual coverage record; it lives in the planning artifact, and the tripwire test is what makes the coverage mechanical rather than documented.

---

## 7. Sequencing

The two branches are checked by two jobs with opposite tooling provenance, and that is what makes a corpus change and a server change mutually blocking. I read both jobs. `.github/workflows/verify-corpus.yml` on the `workflows` branch checks out `ref: main` for the tooling — hardcoded, not parameterised — then checks out the corpus pull request's **branch tip** at `path: workflows` and runs `npm run check:all`, guards only, never the suite. `.github/workflows/verify.yml` on `main` resolves the gitlink through `./.github/actions/workflows-corpus` and runs `typecheck`, `test:ci`, `check:all` and the delivery gate.

**Order of work.**

1. **Stage 1**, three commits. First the three guard root-portability fixes, on their own — each is a latent bug that would bite `check:delta`'s throwaway worktree or a half-provisioned submodule, and landing them separately keeps that visible. Then the schema, the derivations, the config ceiling, the fourteen rules and the load gate. Then the fixture `corpus/` root plus the `verify.yml` sweep step and the fifteen-line walk test. Zero corpus movement holds by construction: the gate refuses any fan, and the fixture root is not the corpus.
2. **Stage 2.** Every graph reader flattens. Non-negotiable ordering: this precedes any corpus fan, or `all-workflows-walk` sends a list where the tool's type requires a string and throws. `scripts/check-review-mode-gating.ts` is the load-bearing one — `reviewSuccessors` at line 139 does `const to = bound[exit.id]` and pushes it unconditionally, so an unflattened destination drops the whole subtree beyond a fan out of the reachability set silently.
3. **Stage 3**, then **stage 4**. Byte-identical corpus guard output; every new behaviour proved by the fixture roots. Stage 4 carries one obligation the delivery plan does not name — see §9 Q1 — and until it lands `fan-conformance` cannot be green.
4. **Stage 5.** The frontier, the fan enter, the container, the delivery. The end-to-end fan run lands here against the fixture root, satisfying the criterion "a three-instance fan executes end to end against real sessions under three distinct identities" with the same test body stage 7b re-points at the corpus.
5. **Stage 6.** `dispatch-fan.md`, the drive-loop bind site, the two delivery entries, the rule amendments, and **the deletion of the load gate**. The token-benchmark baseline moves here, not at 7b: this stage edits `meta`, which `work-package` composes, and `verify.yml` gates the delivery cost at 1%.
6. **Stage 7.** `cicd-pipeline-security-audit` adopts a fan for real, per the plan.
7. **Stage 7b**, a `workflows`-branch pull request adding `fan-conformance`, then a pointer-bump pull request on `main`. Because stage 6 has merged, `main`'s tooling already understands the forms and the corpus pull request is green on first run — opened earlier it is red for the entire interval, graded by an unwidened `GraphSchema`, with `refs`, `audience`, `artifact-guides` and `activity-variables` all inheriting the load failure.

**What the pointer-bump commit must carry, together.**

| Artefact | Why | Command |
|---|---|---|
| the gitlink | the corpus moved | — |
| `tests/e2e/__snapshots__/corpus-sha.json` | `tests/stamp-freshness.ts` asserts it equals the checkout's HEAD, and both `snapshot.test.ts` and the option-coverage test check it first | `npm run baseline:stamp` |
| `tests/e2e/__snapshots__/snapshot.test.ts.snap` | the stamp check in front of it fails first, so the pair moves together | `npm run test:ci -- -u`, then re-stamp |
| `tests/e2e/walked-workflows.ts` | `tests/e2e/coverage-roster.test.ts:22` runs in `test:ci` and fails on a corpus workflow in neither list | add to `WALKED`, below `work-package` — the roster walks at once, so its wall clock is the slowest member and an addition below the top is free |
| `tests/e2e/option-coverage.json` | one checkpoint, two options, both reachable — **target: no entries**. Any unreached option needs one, with a reason | — |
| the dry-walk budget | default 50; the comment states the plateau is a property of the graph and must be re-measured whenever it grows, and a fan multiplies branch orderings | measure upward from 50, in the same commit |
| `tests/fan-conformance-shape.test.ts`, `tests/e2e/fan-smoke-walk.test.ts` | the corpus arms | — |

`.github/actions/workflows-corpus` fails a pull request whose merge-tree gitlink differs from its branch-head gitlink. If the base moves the submodule first: merge the base in, re-baseline and re-stamp in the same commit.

**What CI cannot verify, and how it is covered.** In the interval between stage 6 merging and the pointer bump, neither side sees both halves. Verify locally with `npm run check:all -- --root <corpus-worktree>`, `npm run check:delta` (diffs a whole sweep against the merge-base with the submodule pinned to what that tree recorded), and `npm run worktree:provision` for a fresh measurable worktree. Re-run the workflows-branch sweep by hand after stage 6 merges.

**One permanent consequence to accept knowingly.** After the pointer bump, every corpus-branch pull request — including one fixing an unrelated `work-package` technique — is graded by `main`'s live fan tooling against a corpus containing `fan-conformance`, and the corpus author cannot pin older tooling. That is the price of the automatic sweep, and stage 7's adoption pays part of it regardless.

---

## 8. Known holes

What this smoke test will not catch, stated plainly. Three entries that stood here are closed by decisions since taken, and are kept in place, marked, because later sections cite them by number.

**1. The agent-led premise is never tested.** The feature's defining property is that an orchestrator emits several dispatches in one turn. The smoke run is a scripted sequence issued by a test process that already knows every branch id, every instance index and every identity. It asserts N1 by *supplying* distinct identities, N5 by passing the correct `activity_id`, N3 and N4 from the call sequence it made itself. So the server can be correct and the feature unusable — `dispatch-fan.md`'s Protocol unfollowable, `_meta.fan.branches` in a shape no orchestrator can act on, the barrier reading invisible in the rendered response — and this test is green. The only coverage for that is stage 7's live run, and it should be treated as a distinct acceptance item rather than as a stronger version of this one.

**2. The last branch's destination is unchecked. — Closed.** A branch return now names the meeting point the graph derives or is refused, checked on every return rather than only the one that empties the frontier, as [`T9`](../2026-09-09-parallel-activities/README.md) states and step 2 of the resolution rule performs. The test asserts the refusal on a mid-fan return and on the last, and asserts that a correct return is unaffected. What follows described the gap before that rule existed. The resolution rule's step 4 enters `activity_id` when the frontier empties; nothing compares `activity_id` against the derived meeting point. The only reader that looks at a destination today is `validateActivityTransition`, which returns a **warning string** (`src/utils/validation.ts:49`) landing in `_meta.validation.warnings`. So on the last retirement an orchestrator can pass `__terminal__` and complete the run with the meeting point never executed, and on retirements 1 through N−1 a wrong `activity_id` is silently discarded. §3.8 step 6 asserts the behaviour either way; **which** behaviour is a decision (§9 Q4).

**3. The list-fan misroute is unrefusable.** For a list fan a membership test admits every branch, so a worker whose prompt names a sibling's activity is served that sibling's body and nothing refuses it. In a five-worker fan with real agents this is the likeliest defect. Only the worker's own comparison stands against it.

**4. A meeting point that is its own fan's source is refused by no rule. — Closed.** [`L15`](../2026-09-09-parallel-activities/README.md) refuses it at load: such a graph opens the fan again on every convergence, so nothing bounds the run. The fixture asserts the load failure and its message. What follows described the gap before that rule existed. `scope-sweep: { scoped: [survey, dependency-review] }` with both branches routing back to `scope-sweep` satisfies L5 (no branch fans), L6 (no branch self-routes), L7 (both name one activity) and L8 (it is an activity). It re-enters the fan on every convergence. The spec forbids "a branch the activity the fan comes from" and "the meeting point one of its own branches" and never *join == source*. Add a fixture asserting the current behaviour whichever way it is decided (§9 Q5).

**5. A fan's width can never be chosen at a gate. — Recorded.** Now stated in the specification's account of what stays outside reach, so it reads as a property of the design rather than an omission. The negative assertion below stands as a test item. A checkpoint `setVariable` writes a scalar literal validated against the target's declared `values`, so no gate can produce an array. Combined with LF20, the only user-facing control over a fan is whether it opens, never how wide. Worth stating in the spec's "What no check reaches" section, and assertable negatively: a `setVariable` targeting a fan's collection is rejected by `variable-model`'s declared-type check.

**6. Two spec claims with no assertion.** The technique-fetch validator is said to scope a visit to the last entry event for the named activity and filter on identity, so one instance's fetches cannot credit another's manifest — three instances fetching the same technique is the case and nothing tests it. And the planning table's completion step is said to repoint an item's link at the delivered artifact, with instance artifacts getting no row — the smoke run writes three files and asserts only their existence, not the single row's link after convergence nor that the completion step runs once rather than per instance.

---

## 9. Decisions

Eight of these are settled and marked **Decided** where they stand, with the reasoning kept because it is what the decision was made against. The specification and its [delivery plan](../2026-09-09-parallel-activities/delivery-plan.md) carry all eight; nothing below is waiting on an edit to them. What remains open is the third shape under Q6, the coverage half of Q7, and Q10 through Q13 — of which **Q13 is the one that changes the deliverable**.

**Q1 — the blocking one. Stage 4 must teach `binding-fidelity` two new producers, not merely add it to the acceptance set.** **Decided: promoted to a stage-4 deliverable.** The guard is changed rather than merely left passing, gaining the fan parameter as producible for the fanned activity alone — which is the first time that guard reads the graph — and the branch container as producible at workflow scope, at member grain. Both land together. The delivery plan's stage 4 names `src/utils/activity-variables.ts` and `scripts/check-activity-variables.ts`. That is not sufficient, and I verified both halves:

- `orphan-input`: `probe-surface.md` declares own input `probe_unit`. It has no step-binding entry, no workflow variable, no step output, no default and no `(optional)` marking, *because the fan parameter is deliberately not a workflow variable*. The guard's own header confirms own inputs are in scope and only contract-inherited entries are out.
- read-resolution: `collectReads` scans the whole technique file with only fenced blocks blanked — inline code spans are deliberately left alone — so `` `{probe_unit}-probe-findings.json` `` inside the `#### artifact` body **is** collected as a read needing a producer. The producer model is a workflow variable, a `{$local}`, a declared id, or an activity-produced var (set / setVariable / loop variable / remap target). The fan parameter is none of them.

Minimum fix: `binding-fidelity`'s producer model gains the fan parameter as producible **for the fanned activity only**, and the branch container as a workflow-scope producible name. Without it the corpus workflow needs triage entries on `main` — a ledger recording a tooling gap rather than accepted debt, in the guard with the repo's largest ledger. **Promote this from an open question to a stage-4 deliverable.** Dropping `assess-unit`'s artifact keeps the ask at two sites rather than four, and keeps the dotted-projection form (`{review_unit.id}`) out of it entirely.

**Q2 — the container's declared type. — Decided: an array in both fan forms.** The contradiction is repaired at all four sites, and the delivery plan's criterion now asserts that a list fan's enter emits no declared-type warning rather than encoding the type that caused one. The spec says both that "the container is a dense array" with "the index uniform — always present, including slot zero for a fan of distinct activities" (README:747, 756, and LF34's `{survey_outputs.0.result.…}` read), and that the merge contributes "an object for a list fan, an array for an instance fan" (README:515, 1963, and stage 4's acceptance criterion). Both cannot hold: `array` and `object` are distinct values of the declared-type enum (`src/schema/variable.schema.ts:13`), the write path derives `'array'` for an array, and the write function warns on a disagreeing declared type. As written, **every list-fan enter emits a declared-type warning**, on the design's own flagship edge. *Recommendation: `array` for both forms.* The shape is a dense array in both cases, and the uniform index is what makes an activity borrowable into two workflows without different reads in each. Correct the spec and stage 4's criterion before writing U2's test, or the test will be written to match the declaration and thereby hide the warning.

**Q3 — is a list's arity unbounded above, and is a mixed list's total width unbounded? — Decided: the ceiling bounds the flattened branch count.** One number covers all three destination forms and the mixed total by construction, checked at the enter, which already computes that count to build the frontier. No second default was added. `DEFAULT_FAN_MAX_INSTANCES` is declared as *instance-fan* width policy and `maxInstances` lives on `InstanceFanSchema` alone, so a twenty-member list opens twenty workers with no ceiling check. Compounding it: a mixed list's total width is bare members plus the sum of its members' collection lengths, and only the fan members are bounded — `scope-sweep.scoped` at four probe targets already opens six. *Recommendation: yes, deliberately for a list — a list's width is authored and reviewable where a collection's length is not — and say so in the graph field's description. For the compound total, either accept it explicitly or add one refusal at the fan enter over the flattened branch count.* The alternative, a `DEFAULT_FAN_MAX_MEMBERS`, needs a second message.

**Q4 — must the last retirement name the derived meeting point? — Decided: yes, and on every return.** A disagreement is refused before anything is written, so a wrong name mid-fan is reported rather than discarded in silence. See §8 hole 2. *Recommendation: refuse a disagreeing `activity_id` on every retirement, not only the last.* A wrong id mid-fan is silently discarded today, which is a worse reading than a refusal. If the answer is "warn, as the graph does today", say so and the test asserts the warning.

**Q5 — does a container-whole gather satisfy member-grain G3 for every member? — Confirmed, no change needed.** The delivery plan's stage 4 already scopes the grain as a dotted segment after dropping a leading all-digits segment and then the literal result segment, which is the grain this question requires. Stage 4's criterion says a correct fan with a gather-bound meeting point produces zero findings, which requires it. Confirmed the mechanism it depends on: `tokenReads` today takes only the head of a dotted reference, so `{survey_outputs.0.result.survey_findings}` is invisible as a member read and `survey_findings` reads as `unread-write`. Stage 4's declared scope covers this ("the read collectors return the full dotted reference and the read function splits it") — but the grain must be a **dotted segment after dropping a leading all-digits segment and then a literal `result` segment**, not a head. Confirm before stage 4. If the answer were instead "each member needs its own named consumer", the meeting point would have to spell every member — impossible for an instance fan, whose width is a run-time value.

**Q6 — three shapes that are legal today and probably should not be.** Two are decided; the middle one is open, and is arguably not a fan question at all. Each still needs a fixture:

- **A fanned activity launching a child workflow. — Decided: folded into the existing rule.** The rule that already names the git, version-control and persist operations now names the child-workflow dispatch too, so one rule covers every operation a branch cannot execute, with each case carrying its own reason in the message. L14 covers the git and version-control groups and the persist operation. Nothing forbids `workflow-engine::handle-sub-workflow` in a branch, and T6 refuses `dispatch_child` whenever several activities are in flight — so such a definition loads clean through all fourteen rules *and* `launched-workflows`, and is unexecutable. Same class as the gate ban, "settled at load rather than left for a worker to discover". *Recommendation: an L15.* If taken, U1 must not assert a rule count (§4 already drops that assertion for an independent reason).
- **A branch whose only exit is `when`-gated.** `isDefault` is mandatory only with two or more exits, so a branch with one gated exit whose gate is false has no exit to report; its frontier entry never retires and the whole session stalls. *Note: this is a general graph defect — a sequential activity does the same, stalling one cursor instead of a fan — so it may belong outside the fan rules.*
- **A meeting point that is its own fan's source** (§8 hole 4). **Decided: refused at load**, as [`L15`](../2026-09-09-parallel-activities/README.md).

**Q7 — two distinct fans converging on one meeting point. — Half done.** The design consequence is now written into the specification beside the arrival-intersection rule: two completed fans are two arrivals, so such a node may declare only the reads both unions satisfy. The coverage half is still open — no fixture reaches the intersection of two union arrivals. Legal under all fourteen rules, and the arrival meet is specified for one union arrival. Two union arrivals intersect, so such a meeting point can only declare reads *both* fans satisfy; a read of one fan's container is reported by G5. That is a real design consequence nobody has written down, and the intersection-of-two-unions path is a code path no fixture in the proposed design reaches. Add `corpus/routing-variants` coverage and a sentence to the spec's reachability section.

**Q8 — a fan whose `over` names a previous fan's container. — Decided: the graph's own read is exempt.** The exemption is keyed on the single synthetic read the load contributes for a fan's collection, so chaining a fan onto a fan is legal and reports nothing, while an authored bare read of a container is still reported. `combine-sweep: { swept: { activity: unit-review, over: probe_unit_outputs, … } }` passes L12's head check, because the merge contributes the container to the merged variable set. Elements are `{id, result}` records, so T1e and T1f can never fire. But the synthetic collection read is attributed to the branch as a read of a **bare container name**, and the spec is explicit that "the container's presence in the merged set does not bless a bare read, because the read test resolves against members" — so a legal graph manufactures a G1/G2 finding inside a hard-zero guard. Decide whether to refuse it at load or exempt the synthetic read.

**Q9 — `variable` colliding with `over`, or with the fanned activity's own declared write. — Decided: one load rule with two arms.** [`L16`](../2026-09-09-parallel-activities/README.md) refuses a parameter equal to the collection and a parameter the fanned activity also declares among its writes, naming which arm fired. L11 requires only that the parameter be among the activity's reads. `variable: probe_targets` over `over: probe_targets` overlays the projection onto the bag the eager-bundling decision reads, so an instance's view of its own collection is replaced by its element. And an activity that both reads the parameter and declares a write at the same name lands `<container>.<name>` at a name it reads as a read-only projection, against "Nothing writes the parameter." Neither collision is checked or tested. Two cheap load rules, or two accepted holes.

**Q10 — both instance-id populations in one session.** The existing loop-body checkpoint discriminator is non-numeric (`assumption-decision#RE-1`, from `src/loaders/workflow-loader.ts:444`) while a fan's is numeric. `baseId` is shared; `instanceIndex` returns undefined for the checkpoint form; the wrap takes the slot index from the frontier entry. `fan-conformance` has no loop-body checkpoint, and L9 forbids one in a branch, so no corpus session ever holds both. `tests/fan-instance-ids.test.ts` covers the helpers over both populations in isolation, which is not the same thing. *Recommendation: one fixture whose meeting point wraps its checkpoint in a `forEach`, asserting the checkpoint resolves to its base definition and that nothing reads `#docs` as a slot index.*

**Q11 — is `expected_ids` bound two ways deliberately?** `combine-sweep` binds `expected_ids: probe_targets` (a bare rename); `reconcile-review` binds `expected_ids: "{sweep_plan.units}"` (a braced projection). `gather-results` documents the braced form; the spec's examples use the bare one. `binding-fidelity`'s consumer collection resolves a bare value through `BARE_NAME_RE` and an interpolation through `VALUE_TOKEN_RE` — different code paths. *Recommendation: keep both and say so in a comment*, so the two paths are exercised rather than accidentally inconsistent.

**Q12 — `WALKED` or `NOT_WALKED`?** *Recommendation: `WALKED`.* Seven activities and one two-option checkpoint; its wall clock sits far below `work-package`, and the roster's cost is the slowest member, not the sum. On `NOT_WALKED` its two options become unreached options needing `option-coverage.json` entries, and worse, `scripts/coverage-scope.ts` resolves a `NOT_WALKED` addition to an empty scope — the pointer-bump pull request prints `scope=none`, skips the walk, and the workflow's options are first judged after merge on the push-to-`main` full run. With the `revisit` cycle removed, the livelock that would otherwise have inflated the enumerator's plateau is gone.

**Q13 — the one question that changes the deliverable.** If the reason for wanting a corpus workflow is "the corpus-wide sweep and walk should cover a fan automatically", the fixture `corpus/` root of §6 delivers it — three guard fixes, one CI line, one fifteen-line test — and `fan-conformance` is optional. If the reason is "the corpus-wide sweep should cover *the forms a real workflow will not carry*", `fan-conformance` is the only answer and its costs in §7 are the price. If the reason is "corpus authors should have a fan to read and copy", stage 7's `cicd-pipeline-security-audit` is the better exemplar and `fan-conformance` should not be created. My reading is the second, which is why the plan builds it — but at stage 7b, smaller than proposed, announced in its own title, and with a tripwire so it cannot be tidied away silently.

---

## Investigation detail

Ground truth, each gathered by reading the repository rather than the design document:

| Artifact | What it establishes |
|---|---|
| [Corpus conventions](ground-truth/corpus-conventions.md) | The floor for a legal, guard-passing, walkable workflow, and whether any test-only workflow exists today |
| [Guard obligations](ground-truth/guard-obligations.md) | Every guard that fires on a new corpus workflow, what it demands, and whether an exemption surface exists |
| [Test harness](ground-truth/test-harness.md) | What the walker drives, how a test asserts a refusal or a load failure, whether the bag can be seeded, and whether concurrent workers can be simulated |
| [Permutation matrix](ground-truth/permutation-matrix.md) | Every legal form and every refusal, each classified by where a test can provoke it |

The draft this plan resolves, and the three adversarial critiques of it. Each critique built a scratch corpus and ran the real guard sweep and walker against it, so the verdicts are measurements rather than readings of the draft.

| Artifact | Verdict it returned |
|---|---|
| [Design draft](design-draft.md) | The workflow shape and test surface as first proposed |
| [Corpus liability](critiques/corpus-liability.md) | The engineering is sound and the placement decision is wrong: the justification for a synthetic workflow in production definitions was measured and found false |
| [Coverage completeness](critiques/coverage.md) | Three corpus attributions wrong or vacuous, four unrepresentable substitutes prove less than stated, eleven interaction permutations unexercised |
| [Guard legality](critiques/guard-legality.md) | The drafted workflow does not pass: three defects fail the load or the walk, and findings across two guards survive any authoring |
