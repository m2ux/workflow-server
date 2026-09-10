# The fan smoke test — design

Grounded in `README.md` (2,297 lines) and `delivery-plan.md` at `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-09-09-parallel-activities/`, verified against the repo at `846c860d` / workflows at `c8aeac0d`.

---

## 0. Placement: when this lands, and why it cannot land earlier

The delivery plan settles this and it constrains everything below.

- **Stages 1–5 install a load gate** that "rejects any list or object destination outright". While it stands, a corpus fan cannot load at all.
- **Stages 1–5 each require zero corpus movement** — "17 workflows, 109 activities bound in graphs, 207 graph edges". *Any* new corpus workflow, fan or not, moves all four figures.

So the corpus workflow lands as **stage 6b**: after stage 6 deletes the gate and lands `dispatch-fan`, before stage 7 adopts `cicd-pipeline-security-audit`. It **replaces** stage 6's acceptance criterion "a smoke run drives a three-instance *fixture* fan" with a three-instance *corpus* fan, which is strictly stronger — the fixture version is invisible to all 33 corpus guards.

Everything stages 1–5 need is fixture-based. That is not a compromise; it is the only thing the plan's own criteria permit.

---

## 1. The corpus workflow

### 1.1 Identity and purpose

| | |
|---|---|
| **Directory** | `workflows/fan-conformance/` |
| **`id`** | `fan-conformance` (must equal the directory name — `resolveWorkflowPath` joins `workflowDir/<id>/workflow.yaml`) |
| **`version`** | `1.0.0` |
| **`title`** | Fan Conformance Sweep |

**Purpose statement (for the README and the `description` field):**

> Sweeps a repository's independent surfaces concurrently — documented surface, declared dependencies, and one probe per target — and combines them into one reconnaissance report. It is also the corpus's specimen of the graph's fan forms: every legal destination form the guards and the corpus-wide walk can audit appears once in its graph, so a change to the fan machinery is measured against a definition the sweep already reads.

The dual purpose is stated openly. Every other corpus workflow exists to do real work; this one does real work *and* is deliberately shaped to carry the forms. Hiding the second half is what a reviewer would catch, and it is also the honest answer to "why is the graph shaped like that?"

### 1.2 File inventory — 19 files, one edit

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
workflows/README.md                                   ← one new "Available Workflows" row
```

No `techniques/TECHNIQUE.md` root contract — omitting it takes the workflow out of `inherited-inputs`' scope entirely, and a bare-slug workflow-local technique resolves without one (measured). No `activities/README.md` (inert, and AP-40-bounded prose the coverage table does better). No `activities:` list — local activities are auto-discovered.

Estimated ~470 lines. The 800-line `prism-update` baseline is mostly README prose and Protocol sections; this workflow's techniques carry a Capability, a declared I/O contract (which is what the guards need) and a three-to-five-step Protocol each.

### 1.3 The graph block, verbatim

```yaml
initialActivity: scope-sweep
graph:
  # The fan sits on the initial activity's exit, and a sibling exit routes past it
  # for a scope that yielded nothing to probe.
  scope-sweep:
    nothing-to-sweep: __terminal__
    scoped:
      - survey
      - dependency-review
      - activity: probe-unit
        over: probe_targets
        variable: probe_unit

  survey:
    thin: combine-sweep
    thorough: combine-sweep

  dependency-review:
    reviewed: combine-sweep

  probe-unit:
    probed: combine-sweep

  combine-sweep:
    swept:
      # Tighter than the server's ceiling: a unit review reads a whole surface
      # document, and the report re-pays every review's payload to write once.
      activity: unit-review
      over: sweep_plan.units
      variable: review_unit
      maxInstances: 3

  unit-review:
    reviewed: reconcile-review

  reconcile-review:
    revisit: combine-sweep
    settled: __terminal__
```

Seven activities. Two fans. Two joins (`combine-sweep`, `reconcile-review`), and the first join is the second fan's source.

### 1.4 Why each activity exists

| Activity | Why it exists | Cannot be merged into |
|---|---|---|
| `scope-sweep` | The fan source, and the only writer of the fan-1 collection. Being `initialActivity` puts the fan between the first activity and the rest of the graph — `review-mode-gating`'s worst case (G11). | Nothing precedes it. |
| `survey` | A bare list member with a **single-word id** (branch-key totality, `survey_outputs`), **two exits both naming the join** (L7 ≠ "one exit per branch"), and an **internal `doWhile` loop** (L6's positive remedy). Also the self-consumed-write negative arm (G3). | Its three roles are all *branch* properties; a join cannot carry them. |
| `dependency-review` | The second bare list member. Makes the fan-1 branch set heterogeneous, so `combine-sweep` has two distinct branch keys to spell indexed reads against. | A one-bare-member list is not a list. |
| `probe-unit` | The instance-fan member of the mixed list. Declares the fan-1 parameter and the **slug-arm token artifact**. | The parameter is per-activity; a bare member has none. |
| `combine-sweep` | Join 1 (gathers the instance container **and** spells indexed reads for the two bare members — both join read forms in one activity), the single writer of `sweep-findings.md`, the fan-2 source, and the fan-2 collection's writer. | Splitting it would need a fourth non-fan activity to no gain. |
| `unit-review` | The fan-2 branch: **object-element** projection and the **dotted-projection arm** of the token artifact. | `probe-unit`'s elements are slugs; one activity cannot carry both element shapes because its artifact template has one form. |
| `reconcile-review` | Join 2, the one **checkpoint** (beyond both fans, for G11), the terminal exit, and the **alternative arrival** back at join 1. | The gate cannot live in a branch (L9), and the alternative arrival must be downstream of the fan or the join's reads go unreachable. |

### 1.5 The activities, with exits

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
    loopType: doWhile
    when: survey_depth == deep
    continueWhile:
      variable: survey_sufficient
      operator: equals
      value: false
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

`survey_depth` is set by step 1 and read by step 2's gate; `survey_sufficient` is written inside the loop and read by the loop's own condition. Both are the **self-consumed exemption's** corpus arm — the one G3 must not report on.

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
    - recon_scope
    - planning_folder_path
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

`probe_unit` appears in exactly two places — this `reads` list and the destination that supplies it. It is **not** in `workflow.yaml`'s `variables[]`, per the spec's explicit rule.

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
    - planning_folder_path
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
  - kind: technique
    id: persist-the-sweep
    technique: workflow-engine::commit-and-persist
exits:
  - id: swept
    isDefault: true
```

The two read forms sit side by side: an **indexed dotted read at slot zero** for each bare member, and the **container handed whole** to the gather with the fan's own collection as `expected_ids`. `persist-the-sweep` is the single persist at convergence (N4) — and it is legal here precisely because L14 forbids it in a branch.

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
    - planning_folder_path
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
    - planning_folder_path
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
    options:
      - id: accept-report
        label: Accept
        description: Take the report as composed
      - id: revisit-dependencies
        label: Revisit dependencies
        description: Read the dependency surface again before the report is taken
        effect:
          setVariable:
            revisit_dependencies: true
    defaultOption: accept-report
  - kind: technique
    id: persist-the-report
    technique: workflow-engine::commit-and-persist
exits:
  - id: revisit
    when: revisit_dependencies == true
  - id: settled
    isDefault: true
```

The checkpoint is step 3, not step 1 (`checkpoint-entry`). Its `defaultOption` carries **no** effect, so `review-mode-gating` passes with no acceptance entry on `main`. No earlier step is gated on `revisit_dependencies` (`decision-order`).

### 1.6 `workflow.yaml` head

```yaml
$schema: ../../schemas/workflow.schema.json
id: fan-conformance
version: 1.0.0
title: Fan Conformance Sweep
description: Sweeps a repository's independent surfaces concurrently and combines them into one reconnaissance report.
author: m2ux
tags:
  - reconnaissance
  - parallel
  - conformance
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
  - name: revisit_dependencies
    type: boolean
    description: Whether the dependency surface needs a second pass before the report is taken.
```

Four workflow variables, none with a `defaultValue` — so no existence gate on any of them can be constant (`variable-model`). `is_review_mode` has a real reader (`survey`'s `thin` exit), so it is not declared merely to enrol in a guard. The four branch containers — `survey_outputs`, `dependency_review_outputs`, `probe_unit_outputs`, `unit_review_outputs` — are **never authored**; stage 4's merge contributes them.

### 1.7 Techniques

Seven files, flat, kebab-case, canonical H2s only.

| File | Inputs (own) | Outputs | Artifact / audience |
|---|---|---|---|
| `enumerate-surfaces.md` | `recon_scope` | `probe_targets`, `has_probe_targets` | — |
| `survey-surfaces.md` | `recon_scope` | `survey_findings`, `survey_sufficient` | — |
| `review-dependencies.md` | `recon_scope` | `dependency_findings` | — |
| `probe-surface.md` | `probe_unit` | `probe_findings` | `{probe_unit}-probe-findings.json` · agent |
| `combine-surfaces.md` | `survey_findings`, `dependency_findings`, `probe_findings_set` | `sweep_document`, `sweep_plan` | `sweep-findings.md` · human |
| `assess-unit.md` | `review_unit`, `sweep_document` | `unit_verdict` | `{review_unit.id}-unit-verdict.json` · agent |
| `compose-recon-report.md` | `unit_verdicts`, `sweep_document` | `recon_report` | `recon-report.md` · human |

`{review_unit.id}` matches `ARTIFACT_NAME_PATTERN` — `/^(?:[A-Za-z0-9._-]|\{[A-Za-z0-9._$-]+\})+\.[A-Za-z0-9]+$/` admits `.` inside a token. Both agent-audience artifacts end `.json`. The **name-match chaining convention** closes `dead-output` for `survey_findings` and `dependency_findings` (same-named inputs on `combine-surfaces`), and the `#### artifact` block closes it for `probe_findings`, `unit_verdict`, `sweep_document` and `recon_report`. `survey_sufficient` is closed by being a loop condition variable; `has_probe_targets` by being an exit condition variable; `probe_targets` by being a step-binding value at `expected_ids`.

### 1.8 Resources

`resources/README.md` — one orienting sentence, then:

```markdown
## Planning artifact to guide map

| Artifact | Guide |
|---|---|
| `{probe_unit}-probe-findings.json` | [artifact-shapes.md#probe-findings](artifact-shapes.md#probe-findings) |
| `{review_unit.id}-unit-verdict.json` | [artifact-shapes.md#unit-verdict](artifact-shapes.md#unit-verdict) |
| `sweep-findings.md` | [artifact-shapes.md#sweep-document](artifact-shapes.md#sweep-document) |
| `recon-report.md` | [artifact-shapes.md#recon-report](artifact-shapes.md#recon-report) |
```

Token templates are spelled **verbatim**, because guide resolution matches by exact string after splitting on commas and stripping backticks.

`resources/artifact-shapes.md` — opens directly on `## Probe findings` with **no prose above the first heading**, so `section-framing` raises nothing even though four consumers cite it by anchor. It is cited by anchor only and never bare, so `citation-grain` raises no pair. Four headings, four resolving slugs.

---

## 2. Legal-form coverage — the audit table

24 forms in the corpus, 12 in fixtures, each with a stated reason.

| # | Form | Covered where | Which edge / activity |
|---|---|---|---|
| LF1 | One activity id | **corpus** | `unit-review.reviewed: reconcile-review` |
| LF2 | Terminal sentinel | **corpus** | `scope-sweep.nothing-to-sweep`, `reconcile-review.settled` |
| LF3 | Two bare ids | fixture `legal/pair-fan` | Its only distinguishing fact is an array with no instance-fan member — a `destinationTargets`/`instanceFans` helper path with no guard surface, and the paired `.min(2)` refusal (S2a) lives in the same test file |
| LF4 | Three bare ids | fixture `legal/triple-fan` | The corpus carries two bare members inside the mixed list, so every guard already sees a heterogeneous distinct-activity fan; the pure form is the walker and runner flagship |
| LF5 | Five bare ids, no ceiling | fixture `legal/wide-list` | Deliberately **not** corpus: a list's unbounded arity is an open question (§9 Q3). A corpus edge would bake in a possible missing refusal |
| LF6 | Instance fan, no `maxInstances` | **corpus** | the fan member of `scope-sweep.scoped` |
| LF7 | `maxInstances` tighter than the default | **corpus** | `combine-sweep.swept` (`maxInstances: 3`), with the reason in a comment |
| LF8 | `maxInstances` at its floor (2) | fixture `legal/instance-fan` | Paired with S3 (ceiling of 1) so the boundary is proved from both sides in one file |
| LF9 | Dotted `over` | **corpus** | `combine-sweep.swept` over `sweep_plan.units` |
| LF10 | Exempt bare-word collection | fixture `legal/naming-variants` | `over: submodules`. A pure `EXEMPT_DATA_IDS` fact; the corpus adds no guard |
| LF11 | Exempt bare-word `variable` | fixture `legal/naming-variants` | `variable: target`. Same reason, and paired with S4 |
| LF12 | Slug-string elements | **corpus**, run-time | `probe_targets: ['docs','tests','deps']` at the smoke run |
| LF13 | Id-carrying object elements | **corpus**, run-time | `sweep_plan.units: [{id,brief},…]` |
| LF14 | Mixed-element collection | fixture `legal/naming-variants`, seeded | A corpus collection with two element shapes is a definition smell; the derivation is per element, so a fixture proves it |
| LF15 | Run-time width of 1 | **corpus**, seeded | `tests/fan-enter-refusals.test.ts` legal arm: `probe_targets: ['docs']` |
| LF16 | Run-time width exactly the ceiling | **corpus**, seeded | `probe_targets` of length 4 against `DEFAULT_FAN_MAX_INSTANCES = 4` |
| LF17 | Mixed list (bare + fan) | **corpus** | `scope-sweep.scoped` — five workers with three probe targets |
| LF18 | List of instance fans only | fixture `legal/mixed-fan` | Two fanned activities plus a shared join = 3 extra corpus activities for a graph-shape fact |
| LF19 | Per-member ceilings | fixture `legal/mixed-fan` | Same edge as LF18 |
| LF20 | Predicated fan exit, sibling routes past | **corpus** | `scope-sweep`'s two exits; `nothing-to-sweep` gated first |
| LF21 | Multi-exit branch, all exits to the join | **corpus** | `survey.thin` and `survey.thorough` |
| LF22 | Branch with an internal retry loop | **corpus** | `survey.refine-until-sufficient` (`doWhile`) |
| LF23 | The join is itself a fan source | **corpus** | `combine-sweep` |
| LF24 | Join routes back to the fan's source | **corpus** | `reconcile-review.revisit: combine-sweep` — re-enters fan 2, so the container resets |
| LF25 | Join's own exit is the sentinel | **corpus** | `reconcile-review.settled: __terminal__` |
| LF26 | Fan on the initial activity's exit | **corpus** | `scope-sweep` is `initialActivity` |
| LF27 | Join with an alternative non-fan arrival | **corpus** | the same `revisit` edge — `combine-sweep` has the completed fan and `reconcile-review` as two arrivals |
| LF28 | Single-word branch id | **corpus** | `survey` → `survey_outputs` |
| LF29 | One activity fanned by two destinations | fixture `legal/chained-fan` | Needs a second source exit for no guard gain |
| LF30 | Branch also a plain destination | fixture `legal/routing-variants` | Its fact is a **write-path** fact (the wrap derives from the graph, not the arrival), asserted directly in `tests/fan-write-path.test.ts`. It also competes for the same graph edge as LF24+LF27, which are worth more |
| LF31 | Branch declares no artifact, join writes | **corpus** | `survey` and `dependency-review` declare none; `combine-sweep` writes `sweep-findings.md` |
| LF32 | Token-templated branch artifact | **corpus**, both arms | `probe-unit` (parameter itself) and `unit-review` (dotted projection onto `.id`) |
| LF33 | Instance-fan join gathers the container | **corpus** | `gather-probe-findings`, `gather-unit-verdicts` |
| LF34 | List-fan join spells indexed reads at slot 0 | **corpus** | `combine-surfaces` inputs |
| LF35 | Branch writes a working value and reads it back | **corpus** | `survey_depth`, `survey_sufficient` |
| LF36 | `maxInstances` at or above the default | fixture `legal/naming-variants` | It **loads** but violates the stated convention; putting a convention violation in the corpus is wrong, and §9 Q2 asks whether it should load at all |

---

## 3. Where the illegal forms go

61 test-grain cases, grouped by exercise site. The governing fact: **every corpus guard resolves its root through `scripts/workflows-root.ts` (`--root` > `WORKFLOWS_DIR` > default) and `tests/fixtures/` is neither**, so nothing under `tests/fixtures/` is ever swept.

### 3.1 Inline schema parse — 9 cases, no files

`tests/fan-destination-schema.test.ts`, `GraphSchema.safeParse` / `DestinationSchema.safeParse` on inline objects.

| Case | Authored | Asserted message |
|---|---|---|
| S1a | `{ a: { done: 42 } }` | the union error map |
| S1b | `{ a: { done: [['x','y'],'z'] } }` | the union error map, **plus** `FanMemberSchema` admits exactly `string \| InstanceFan` (type-level) and the generated `items` subschema carries no array branch |
| S1c | `{ a: { done: ['x', 42] } }` | the union error map |
| S1d | `{ a: { done: { activity:'x', over:'y' } } }` ×3, one per omitted field | the map, and it **names all three** required fields |
| S2a | `{ a: { done: ['x'] } }` | the **array member's own arity message**, not the map |
| S2b | `{ a: { done: [] } }` | the same message (distinct path to `.min(2)`) |
| S3 | `maxInstances: 1` | the **`maxInstances` field message** wins over the map |
| S4 | `variable: topic` | the qualified-name message from `VariableNameSchema` |
| S5 | `{ …, unit: 'q' }` | `Unrecognized key(s) in object: 'unit'`, **plus** `additionalProperties: false` in `schemas/workflow.schema.json` |

Chosen wording: the **schema block's** text (`a list of at least two members — each an activity id or an instance fan`), not the parse table's `at least two activity ids`. See §8.

### 3.2 Inline load rules — 22 cases, no files

`tests/fan-load-rules.test.ts`, extending the existing `validateExitBindings` idiom at `tests/workflow-loader.test.ts:329` — inline `Workflow` objects, `expect(errors.join(' ')).toContain(…)`, `expect(…).toEqual([])` for the pass arms.

```ts
const branch = (id: string, exits: unknown, extra: object = {}) =>
  ({ id, version: '1.0.0', name: id, required: true, exits, ...extra });
const wf = (graph: unknown, activities: unknown[]) =>
  ({ id: 'wf', version: '1.0.0', title: 'WF', graph, activities } as unknown as Workflow);
```

| Case | Fixture shape | Asserted |
|---|---|---|
| L1 ×3 | one unknown target, once per position — bare member, list-member fan's `activity`, whole-destination fan's `activity` | `to 'reserch', which this workflow does not contain` at each position (this is the one edit to standing code, so a per-target loop that misses a position must fail) |
| L2a | `done: [research, research]` | `fans 'plan-prepare.done' to 'research' twice` |
| L2b | `[web-research, {activity: web-research, …}]` | the same family **plus** the remedy clause `name it with the collection it runs over in a single member` |
| L2c | two instance-fan members over one activity, different collections | the same family |
| L3 | `done: [research, __terminal__]` | `fans … to '__terminal__'` — a **load** rule, since the sentinel is a legal string |
| L4 | branch activity with `exits` omitted | `binds no exit, so the fan has no destination to converge on` + `Give it an exit bound to the activity its siblings name` |
| L5a ×2 | a branch's exit bound to a list; to an object | `its exit 'done' fans to …` |
| L5b | `plan-prepare: { done: [plan-prepare, research] }` | **L5's message and no rule of its own** — the spec lists this among the three rules a reader may expect and that are absent |
| L6a | `research: { insufficient: research, done: assumptions-review }` | L6's message **present in the list** (the fixture also violates L7, and the fourteen rules run into one error list) |
| L6b | `s:{done:[x,y]}, x:{done:y}, y:{done:y}` | L6's message and no rule of its own |
| L7a | three branches, two agreeing | the message spells **all three** destinations, grouped by which branches named them |
| L7b | one branch, two exits to different destinations | same family — an implementation reading only the default exit passes L7a and lets this through |
| L7c | no branch names a resolvable single destination | the undefined-join failure, which is what every downstream reader's non-null assumption rests on |
| L8 | `done:[a,b]`, both `→ __terminal__` | `converges on '__terminal__'` — the sharpest boundary, paired with LF25 in the same `describe` |
| L9a | a branch with an inline checkpoint step | the list-form message ending `or take this activity out of the fan` |
| L9b | the gate-bearing branch is an instance fan's activity | the **variant** ending `there is no instance to take out of the fan` |
| L10a | branch id `2nd-pass` | `'2nd_pass_outputs' is not a legal variable name` + `carries an id beginning with a lowercase letter` |
| L10b | an activity declares `research_outputs` where `research` is a branch | the uniqueness arm — and the test **pins which of L10b and the merge's contradiction check fires** |
| L11 ×3 | parameter absent from `reads`; two fans of one activity naming different parameters (**both** must fail here, which is what proves no cross-fan rule is needed); the offending member inside a mixed list | `which 'challenge-pass' does not declare among the names it needs its workflow to supply` |
| L12 ×3 | bare unknown name; dotted `unknown_plan.steps`; the same inside a mixed list — plus a **legal** dotted head as the no-false-report arm | `which this workflow declares nowhere` |
| L13 ×3 | index 7 against a declared ceiling of 4; against the configured default; two members of one list at different ceilings — plus an in-range index beyond any plausible width producing **no** finding (the half that cannot be closed) | `admits 4 instances, so slot 7 is never filled` |
| L14 | a fanned activity binding `workflow-engine::commit-and-persist` | the message names the bound operation and the remedy |
| **LG** | a well-formed fan while the stage 1–5 gate stands | the gate's message names the stage that lands the runner; at stage 6, the same fixture loads |

### 3.3 Committed illegal fixture trees — 2 cases

Only where **fragment materialisation** is needed, because `validateExitBindings` runs after it and an inline object cannot express a `ref`.

```
tests/fixtures/parallel-activities/illegal/
  l9-fragment-gate/workflow.yaml          # fragments.checkpoints declares the gate
  l9-fragment-gate/activities/00-source.yaml
  l9-fragment-gate/activities/01-branch.yaml    # steps: [{kind: checkpoint, ref: …}]
  l9-fragment-gate/activities/02-join.yaml
  l14-fragment-commit/…                   # same shape, a fragment-referenced commit step
```

Loaded as `await loadWorkflow(ILLEGAL_ROOT, 'l9-fragment-gate')`, asserting `result.success === false` and the message. Committed rather than temp-built because the fragment plumbing is the thing under test and a diffable file is reviewable.

### 3.4 Wire-level load refusal — 2 assertions

`tests/fan-load-refusal-wire.test.ts`. A `mkdtempSync` corpus holding one illegal fan (L7a's shape), served by `createHarness({ workflowDir })`:

- `start_session` → `isError: true`, `content[0].text` contains `The fan at 'source.done' converges nowhere`. **No existing test asserts `start_session` refuses an illegal graph**; my probe of the analogous case confirmed it does.
- `list_workflows` → `ok`, and the workflow **is still listed** with no `load_errors` key. A broken graph is invisible to discovery, and that fact should be pinned rather than discovered later.

### 3.5 Seeded state — 6 cases

`tests/fan-enter-refusals.test.ts`, against the **real corpus** `fan-conformance` (the definition stays legal; what is malformed is the bag). Seeding is `next_activity { variables_changed: … }` on the transition that enters the fan — which accepts undeclared names and arbitrary JSON, type validation being warn-only.

| Case | Seed | Asserted |
|---|---|---|
| T1a | `probe_targets` of 5 entered through `combine-sweep.swept`'s `maxInstances: 3` destination (seeded onto `sweep_plan.units`) | the ceiling message naming the collection, its length, the bound, and that the bound is `the maxInstances this destination declares`; **no** truncation and **no** successive-waves alternative offered; and **nothing spent** — no frontier entries, no container, no dispatches |
| T1b | `probe_targets` of 5 through `scope-sweep.scoped`'s no-ceiling member | the message names the **configured default and says so**, and offers the declare-a-`maxInstances` / cap-upstream remedy |
| T1c | `probe_targets: []` | the empty-collection message, its reasoning, and its remedy — paired with LF20, the corpus edge that **takes** that remedy, and with LF15, where a width of one is legal |
| T1d | `probe_targets: 'docs'`; and a dotted case where `sweep_plan.units` is a scalar | `holds a string, not an array` |
| T1e | element 2 of `sweep_plan.units` is `{brief: '…'}` with no `id` | names the **element index** and the three things the id designates |
| T1f | elements 1 and 3 of `probe_targets` both `'docs'`; and the object-element derivation | names **both** indices and the id |

Legal-boundary arms in the same file: width 1 (LF15), width exactly 4 (LF16), a heterogeneous collection (LF14, on the fixture).

### 3.6 Live session, bad tool call — 10 cases

`tests/fan-transition-refusals.test.ts`. Legal workflow, legal session, bad call.

| Case | Session state | The call |
|---|---|---|
| T2 | on `scope-sweep`, whose `scoped` exit fans | `next_activity` with the destination and **no `exit`** → `binds exit 'scoped' to a fan, so 'exit' is required`. `scope-sweep` is the sharper fixture than a single-exit source because one of its two exits does not fan |
| T3a | three instances of `unit-review` in flight | `from_activity: 'unit-review'` (bare) → states the instance count, lists every entry in flight, instructs `activity and instance together`. Step 1 is an exact string comparison, so a bare name must match **nothing** |
| T3b | `unit-review#0` already retired | `from_activity: 'unit-review#4'`, then a repeat of the `#0` retirement → lists what **is** in flight; the repeat is refused as holding no open branch |
| T3c | five branches of `scope-sweep.scoped` in flight | `from_activity` **omitted** → the third message, naming the count and all five, and stating `the destination is entered once, when the last one does`. Legal converse in the same test: omitted with one entry resolves to the sole entry |
| T4a | one activity in flight | `get_activity { activity_id: <wrong> }` → names what the session is on and what was asked for; instructs reporting the mismatch **rather than retrying without `activity_id`**. Same membership test asserted for `get_technique` |
| T4b | three instances in flight | `get_activity` with no `activity_id` → the middle message **names every entry**. Accepted case in the same test: an instance's response reports the instance-qualified id **back** |
| T4c | fresh session | `get_activity` → `No activity in flight. Call next_activity first.` |
| T5 | five branches in flight | `yield_checkpoint { checkpoint_id: 'ad-hoc' }` → states the in-flight count, the one-outstanding-decision rule, and the two conforming alternatives. **Not** redundant with L9: the tool admits a decision no definition mentions |
| T6 | five branches in flight | `dispatch_child` → the message, and that it comes from the **same ambiguity helper** as T5 |
| T8 | retiring `survey` | `variables_changed: { survey_depth: 'exhaustive' }` → today's wording unchanged, `stored as written`. The load-bearing half: the fixture's branch declaration must **disagree with the workflow's merged map**, or the test cannot tell validation-against-own-writes from validation-against-the-merge |

### 3.7 Store — 1 case

`tests/fan-concurrency.test.ts` (or an added `describe` in `tests/session-concurrency.test.ts`). Against the **real corpus workflow** — the one refusal a correct fan reaches on a normal walk.

Five branch `get_activity` calls under five distinct identities in one `Promise.all`. Measured behaviour today: 1 admitted, N−1 refused. Assert:
- `STALE_WRITE`'s message opens `CALL THIS TOOL AGAIN with the same arguments` and states nothing was written;
- each repeat succeeds;
- the run is **ACCEPTED with the refusals present** — every branch served, every branch's outputs in its own slot, the barrier released once;
- and, explicitly, that `STALE_WRITE` is **not counted as a fan refusal** — the spec omits it from the fan's table deliberately, and stage 6's criterion says a repeat after `STALE_WRITE` does not fail it.

### 3.8 Guard runs — 12 cases

`tests/fan-activity-variables.test.ts` and `tests/fan-artifact-collision.test.ts`, calling the guard's exported collector with `--root`/`WORKFLOWS_DIR` pointed at a fixture root. `requireWorkflowsRoot` refuses a missing or empty root, so each root holds at least one real workflow directory plus a stub `meta`.

**Positive arms** — `tests/fixtures/parallel-activities/guard-findings/`, one workflow per family:

| Case | Fixture workflow | Asserted |
|---|---|---|
| G1 | `g1-bare-read` | `unwritten-read` — once the write side is re-keyed the bare member is written by nothing |
| G2 | `g2-wrong-member` | the verbatim member-grain text **including** the `it lands …` enumeration; the read test drops a leading all-digits segment **and then** a literal `result` segment, so the fixture uses an **indexed** read. A mistyped *key* is a separate fixture asserting `unused-declaration` instead |
| G3 | `g3-ungathered` | `unread-write` at member grain, verbatim |
| G4 | `g4-no-index` | `unwritten-read` **naming the instance form**; paired with LF34's corpus reads, which must produce nothing |
| G5b | `g5b-unwritten-in-branch` | `unreachable-read` **is** reported — the arm that proves the check is not merely *disabled* for branches |
| G6 | `g6-collection-unwritten-on-a-path` | the verbatim detail string, and the **three injections** (reachability map, unwritten-read loop, derived-reads set) — asserted by the absence of a spurious `unused-declaration` on the fanned activity |
| G7 | `g7-collection-never-written` | `unwritten-read` at fan grain from the same synthetic read; distinct from L12, which fails the **load** when the collection is declared nowhere |
| G8 | `g8-stray-parameter-read` | `unwritten-read` with the **fan-specific detail string** and no new family name; the fixture holds **both** a legal reader and a stray one, because a global ambient set would satisfy the stray silently |
| G9 | `g9-literal-collision` | `fan-artifact-collision`, distinct arm, verbatim. Needs technique files (composed signatures). A second fixture with two **templated** colliding names asserts **no** finding — recorded as a known blind spot, not a pass |
| G10 | `g10-untemplated-instance-artifact` | the instance arm, stating **both** legal remedies |

**Negative arms** — a separate root, `tests/fixtures/parallel-activities/guard-clean/`, plus the real corpus workflow. A root with findings cannot also prove zero findings, so the split is structural.

| Case | Where | Asserted |
|---|---|---|
| G5a | `guard-clean/g5a-arrival-union` (LF27's shape) **and** `fan-conformance` | **zero** findings. Plus the three ways to apply it and have it do nothing, each fixture-only: the branch removed from the join's plain predecessor index **including every duplicate entry**; the candidate seed from the first **arrival**; a branch head's own predecessor staying ordinary. An eleven-instance fan asserts termination and that the builder collapses it to **one** node |
| G3 neg | `guard-clean/g3-self-consumed` **and** `fan-conformance` (`survey`) | zero findings, and the count on a correct fan is **exactly** zero — without the exemption the family fires ~35 times |
| G6 neg | `guard-clean/g6-source-writes` **and** `fan-conformance` | a fan whose source writes the collection produces **no** finding — attributed to the source instead of the branch it reports falsely on the flagship shape |
| G8 neg | `fan-conformance` (`probe-unit`'s own read of `probe_unit`) | no finding, and `probe_unit` is **not** in the workflow file's variable list |
| G10 neg | `fan-conformance` (both token arms) | no finding |
| G9/G10 vacuous | `fan-conformance` (`survey`, `dependency-review`) | the collision family is **vacuous**, not failing open, when branches declare no artifact |

G5a and G5b are asserted **on the same fixture root**, so a change satisfying one by breaking the other cannot pass.

**G11** — `tests/review-mode-gating-guard.test.ts` (extend the existing file). `collectReviewGatingViolations(fixtureRoot)` against `tests/fixtures/parallel-activities/review-mode/gate-beyond-a-fan/` (raw YAML — the load rules cannot protect this guard). Assert the finding fires **and** assert the **contents of the reachability set**, because the failure mode without the flatten is a silent under-report, not a wrong answer. `fan-conformance` is the corpus arm: `is_review_mode` declared, one gate beyond both fans, effect-free `defaultOption`, zero findings.

### 3.9 The corpus smoke run — the flagship

`tests/e2e/fan-smoke-walk.test.ts`, hand-driven over the MCP wire (not the walker — the walker is graph-mode and executes no steps). `createHarness()` on the real corpus, `sessionOps(h, 'fan-conformance')`.

**Sequence, with the assertion at each step:**

1. `start_session { workflow_id: 'fan-conformance', agent_id: 'orchestrator', planning_folder, user_request }`.
2. `next_activity { activity_id: 'scope-sweep' }`, `get_activity`. Execute; report `probe_targets: ['docs','tests','deps']`, `has_probe_targets: true`.
3. `next_activity { from_activity: 'scope-sweep', exit: 'scoped', activity_id: ['survey','dependency-review',{activity:'probe-unit',over:'probe_targets',variable:'probe_unit'}], variables_changed: {…} }`
   - `_meta.fan.branches === ['survey','dependency-review','probe-unit#0','probe-unit#1','probe-unit#2']` — **five workers from one destination** (LF17, U1's flat set, one barrier).
   - `probe_unit_outputs` materialised as three slots, ids `docs`/`tests`/`deps`, `result: null`; **one** `variable_set` event with a write source naming a fan enter (D8's server-materialisation half).
   - `survey_outputs` / `dependency_review_outputs` materialised as one-slot objects.
4. Five `get_activity { activity_id: <branch>, agent_id: <own> }` under **five distinct identities** (N1).
   - the three `probe-unit#k` responses carry `fan_instance: { variable:'probe_unit', instance:k, value:<slug> }`;
   - `survey` and `dependency-review` carry **no** `fan_instance` block;
   - each response reports its **instance-qualified id back** (N5's effective arm).
5. Five `record_usage`, instance-qualified (N2).
6. Retire **out of order** — `probe-unit#1`, `survey`, `probe-unit#2`, `dependency-review`, `probe-unit#0` — each `next_activity { from_activity, exit, activity_id: 'combine-sweep', variables_changed }`.
   - `_meta.barrier.met === false` with a **shrinking** `pending` on the first four; `met === true`, `pending: []`, `destination: 'combine-sweep'` on the fifth (D1);
   - **exactly one** `activity_entered` event for `combine-sweep` in history (D1);
   - `probe_unit_outputs` dense and in **collection** order despite the retirement order (D6, D8);
   - each slot's `result` is its own instance's map and each `id` its own element's (D6);
   - the bare names `survey_findings`, `dependency_findings`, `probe_findings` are **absent** from the bag (D5 — assert bag *contents*, never warning absence).
7. `get_activity` for `combine-sweep`.
   - the gather reports `completeness: complete` with three rows;
   - the delivered `exit_destinations` renders `swept` as the fan **object**, not an interpolated string (stage 2's "no rendered message interpolates a destination").
8. `next_activity` off `combine-sweep` with the instance-fan destination and `sweep_plan` reported as three id-carrying objects.
   - three branches `unit-review#0..2`; each `fan_instance.value` is the element **whole** — an object (LF13).
9. Retire the three; `reconcile-review` entered once; `unit_review_outputs` dense in `sweep_plan.units` order.
10. `get_activity` reconcile-review; `yield_checkpoint` → `respond_checkpoint { option_id: 'accept-report' }` → `resume_checkpoint`; `next_activity { activity_id: '__terminal__', from_activity: 'reconcile-review', exit: 'settled' }`.
    - `session.json#status === 'completed'`; frontier empty.
11. **Artifact ledger:** `docs-probe-findings.json`, `tests-probe-findings.json`, `deps-probe-findings.json`, three `<unit-id>-unit-verdict.json`, one `sweep-findings.md`, one `recon-report.md`. **No numbered duplicates** (`*-1.json`) — that absence is the collision proof, and it is what G9/G10 exist to make structural.
12. **Usage:** eight figures, every one instance-qualified; the activities-without-usage diff empty (N2).
13. **Progress surface:** one commit naming the planning README before the spawn, one persist at convergence naming every branch (N3, N4) — asserted from the call sequence in history, not against a real remote.
14. **Asymmetry:** `inspect_session` renders the frontier; an instance re-reading the bag through it finds `probe_targets`, not its element.
15. A second `describe` drives the `nothing-to-sweep` route (LF20), asserting the run completes without the fan opening and with no container materialised.
16. A third `describe` drives the `revisit` cycle (LF24), asserting the second entry of fan 2 **assigns the container whole** — two slots after a two-unit second round, with **no residue** of round one (D9).

---

## 4. The unrepresentable properties — what is asserted instead

| # | Property | What is asserted, and where | Nothing is asserted about |
|---|---|---|---|
| D1 | The join is entered once, after the last branch returns | `fan-smoke-walk` steps 6 and 9: shrinking `pending`, `met` flipping once, **one** entry event for the join. Re-run with a different retirement order and assert the same single entry. `fan-frontier.test.ts` asserts the tool surface exposes **no** barrier-met and no join-enter parameter, and that reloading the session file mid-fan re-derives the same barrier with no extra state | — |
| D2 | Entering a fan retires its source exactly once | `fan-frontier.test.ts`: exactly one exit event for the source and one entry event per branch, all from **one** call. Backstop asserted, not the absence: a second advance off the retired source is refused by T3 | — |
| D3 | At most one fan is open | Session schema has **no fan-identity field** — an entry is one string. `legal/chained-fan` walk: frontier length returns to exactly 1 at the join before the second fan opens. The static half is L5a/L5b/L6/L7, asserted in §3.2, since D3 is their consequence | — |
| D4 | A branch cannot take a second activity | The fan-dispatch operation declares neither a worker result nor a worker identity, so the drive loop's continue gate evaluates false — asserted against the definition. Runtime backstop T4a | **The list-fan misroute.** A membership test admits every branch, so a worker whose prompt names a sibling's activity **is served that sibling's body** and nothing refuses it. The test asserts the worker rule exists and the id comes back; it cannot assert refusal |
| D5 | No branch writes a bare shared name | Two branches report the **same bare name** with different values; both are readable afterwards under their own keys and the bare name is **absent**. Tool surface carries no branch-key parameter. L9 and T5 close the other two write paths | — |
| D6 | No instance writes into another instance's slot | Out-of-order retirement (2,0,1): each slot's `result` is its own instance's, each `id` its own element's. The `variable_set` event names key, index **and** member. No tool parameter carries a slot index | — |
| D7 | An unfilled slot is legible as absent | `fan-container.test.ts` evaluates **both real dotted-path evaluators**: a not-exists gate true for the empty slot, true for a **member** of it, true for an **out-of-range** index; an exists gate true for a present member. Positive reading: the gather's manifest marks that unit `empty` | — |
| D8 | The container's order is the collection's order | Round-trip through the real write path with **eleven** instances — materialise, positional write, canonicalise, seal, persist, **reload** — asserting slot order. Eleven because the two rejected shapes fail visibly there (`0,1,10,2` for numeric keys; invalid JSON for a sparse array) | — |
| D9 | A second entry resets the container | The `revisit` cycle on the corpus workflow and on `legal/chained-fan`: three slots, then two, in the second collection's order, no residue. Consequence asserted too: a templated instance artifact **creates** rather than updates on the second entry | — |
| D10 | A fan's width is not bounded by the batch bound | `fan-write-path.test.ts`: open a fan wider than `DEFAULT_BATCH_MAX_ACTIVITIES`, assert every branch's **first** delivery is admitted and each retire call's batch reading reports one activity. Negative asserted: removing the fan ceiling leaves the width unbounded, so **T1a/T1b are the load-bearing tests for this property** | — |
| U1 | No nested barrier | Structural: `FanMemberSchema` admits exactly `string \| InstanceFan` (type test) and the generated `items` subschema carries no array branch. Behavioural: the mixed list produces a **flat frontier of five** and exactly **one** barrier release. And **the rule count is fourteen** — nesting is excluded by the member type, not by a fifteenth rule | The authored-nesting attempt is S1b, a parse refusal — not a "try to nest and see it refused" test |
| U2 | Combination happens only in the combine phase | Bag contents after a fan hold **only** container keys, no bare member names. The declaration merge **adds** the container without replacing members, so members keep declared types, value sets and starting values; the container carries **no** starting value. The container's declared type matches what it holds — object for a list fan, array for an instance fan. Guard half: G1 | — |
| N1–N8 | Actor obligations | Asserted by **observation** in `fan-smoke-walk`: five distinct identities in the delivery ledger, eight usage rows, one pre-spawn commit, one convergence persist, the instance-qualified id returned. **Never by provoking a refusal** — none of these is enforced | N6 (shared register, append-ordered log) is deliberately not mechanised and nothing is asserted about it. N5 is ineffective for a list fan (see D4) |

---

## 5. The test files that land

| Path | Contains | Stage |
|---|---|---|
| `tests/fan-destination-schema.test.ts` | S1a–d, S2a–b, S3, S4, S5; unit coverage of `destinationTargets`, `memberTargets`, `isFan`, `instanceFans`, `instanceFan`, `branchKey`; U1's type-level half; LF3/LF4/LF5 helper paths; LF28 branch-key totality | 1 |
| `tests/generated-schemas.test.ts` *(extend)* | the three-member `anyOf`, `minItems: 2`, non-empty `items`, `required: [activity, over, variable]`, `additionalProperties: false`, `minimum: 2`; U1's structural half | 1 |
| `tests/fan-load-rules.test.ts` | L1–L14 all arms inline; LG and its ordering; the two fragment arms via `loadWorkflow` | 1 |
| `tests/fan-instance-ids.test.ts` | `baseId` / `instanceIndex` over **both** populations (a loop-body checkpoint, a fan instance); the retired checkpoint base helper has **no surviving alias** | 1 |
| `tests/fan-load-refusal-wire.test.ts` | `start_session` refuses an illegal fan with the L-rule message; `list_workflows` still lists it | 1 |
| `tests/e2e/fan-walk.test.ts` | the walker over `legal/pair-fan`, `triple-fan`, `wide-list`, `instance-fan`, `mixed-fan`, `chained-fan`, `routing-variants`: a fan-bound exit yields the branch set, each branch entered then the join once, visit bookkeeping keyed on activity ids, an eleven-instance fan → **one** graph node; the checkpoint consequence, exit payload and immediate-exit message interpolate **no** destination; the two silent readers proved **live** | 2 |
| `tests/fan-activity-variables.test.ts` | G1–G8 positive arms on `guard-findings/`; negative arms on `guard-clean/` and `fan-conformance`; the three injections; the arrival split's duplicate removal; the eleven-instance fixed point | 3, 4 |
| `tests/fan-artifact-collision.test.ts` | G9, G10 both arms plus both recorded blind spots | 4 |
| `tests/review-mode-gating-guard.test.ts` *(extend)* | G11: the finding, **and** the reachability set's contents | 2 |
| `tests/fan-frontier.test.ts` | the frontier, `heldActivity`'s resolution table, the canonical key ordering, the legacy single-activity → one-entry-frontier migration and resume; D1, D2, D3 | 5 |
| `tests/fan-enter-refusals.test.ts` | T1a–T1f seeded; LF15/LF16 legal boundaries | 5 |
| `tests/fan-transition-refusals.test.ts` | T2, T3a–c, T4a–c, T5, T6, T8 | 5 |
| `tests/fan-container.test.ts` | D6, D7, D8, D9 | 5 |
| `tests/fan-write-path.test.ts` | D5, D10, LF30's write-path stress | 5 |
| `tests/fan-concurrency.test.ts` | T7, N8 | 5 |
| `tests/e2e/fan-smoke-walk.test.ts` | §3.9 in full — the corpus smoke run, N1–N5 by observation | **6b** |
| `tests/e2e/walked-workflows.ts` *(edit)* | `'fan-conformance'` added to `WALKED`, below `work-package` | 6b |
| `tests/fixtures/parallel-activities/**` | `legal/` (8 workflows + stub `meta`), `guard-findings/` (10 + meta), `guard-clean/` (5 + meta), `review-mode/` (1 + meta), `illegal/` (2) | 1–5 |

Naming follows the repo: `<subject>.test.ts` kebab-case, `-guard` for guard mirrors, `-walk` for walks under `tests/e2e/`, non-test helpers without `.test`.

---

## 6. Guard legality checklist

| Guard | What `fan-conformance` does | Exemption |
|---|---|---|
| `workflow-yaml` | Loads through the real loader; every activity validates; every filename's post-`NN-` segment **equals its own `id:` field** (the silent trap only a walk catches); no bare multi-word snake_case token in any Protocol body — every one is braced or backticked | none available |
| `activities` | Every step carries an explicit `id`, so no two derived ids collide across the two `gather-results` bindings | none |
| `refs` | Seven workflow-local bare-slug techniques plus two `meta` group ops (`orchestration-patterns::gather-results`, `workflow-engine::commit-and-persist`), all resolving | none |
| `activity-variables` | Every declared read has a writer and every declared write a reader — closed in §1.5/§1.7. Branch containers are **derived**, never authored. `probe_unit`/`review_unit` live in exactly two homes. `survey`'s two working values take the self-consumed exemption | **none exists** — hard zero, no ledger. This is the guard the design is shaped around |
| `binding-fidelity` | Every own input has a step-binding entry, a workflow variable or a same-named producer; every output is consumed by name downstream **or** carries an `#### artifact` block | ledger exists on `main`; **target: zero new entries.** Blocked on §9 Q1 |
| `audience` | Both agent-audience artifacts end `.json`; both human ones declare `human` | none |
| `artifact-guides` | Four guide-map rows in `resources/README.md`, token templates spelled **verbatim** | latent baseline; not used |
| `technique-template` | `metadata.version` only in frontmatter, no H1, canonical H2s in order, snake_case I/O ids, one-segment artifact names | none |
| `identifier-qualification` | Every I/O id is a two-word snake_case noun phrase — `probe_findings_set`, `unit_verdicts`, `survey_findings`. No new `EXEMPT_DATA_IDS` entry | exemption list not touched |
| `inherited-inputs` | **No `techniques/TECHNIQUE.md`** — out of scope by construction | n/a |
| `citation-grain` | `artifact-shapes.md` cited by anchor only, never bare | none |
| `section-framing` | `artifact-shapes.md` opens **directly on `## Probe findings`** — no prose above the first heading | `workflows/section-framing-triage.json` available corpus-side; not used |
| `resource-anchors` | Four anchors, four matching headings, slugs checked | none |
| `description-hygiene` | Every activity `description` is a bare WHAT clause; the one `set` description is one sentence. **No** occurrence of `run every`, `wait-all`, `wait until`, `for each unit`, `seed the`, `ordered gather`, `under that bound`, `concurrency bound`, `append the`, `then wait`, `first seed`, `after that`. The fan's procedure lives in technique Protocol | none |
| `checkpoint-entry` | The one checkpoint is step 3 of `reconcile-review` | none |
| `checkpoint-presentation` | No rule anywhere asserts whether a checkpoint reaches a person; gating is structural (`defaultOption`, no `autoAdvanceMs`) | none |
| `decision-order` | No step is gated on `revisit_dependencies`; the checkpoint precedes its only reader (the exit gate) | none |
| `set-action-values` | One `set`: `target: survey_depth`, `value: deep`, a literal inside the declared `values` set | none |
| `variable-model` | No `defaultValue` anywhere, so no `exists`-on-defaulted case; the one `setVariable` writes `true` to a workflow-declared boolean | none |
| `fragments` | No fragment refs, no inline rule or checkpoint body duplicating anything corpus-wide — every string written fresh | none |
| `when-expression` | Four inline gates, each a single comparison; no mixed `&&`/`\|\|` | none |
| `loop-shape` | One `doWhile` with `continueWhile`, no `over`, no `variable`, no `breakCondition` — and it never sits beside a fan's `over` in the same file | none |
| `branch-as-step` | No indented Protocol sub-bullet opens with `If`/`When`/`Never`/`Do not`; every branch is a `>` note | none |
| `activity-technique-overlap` | `techniques.activity: [variable-binding]` at workflow level only; no activity-level `techniques[]` overlapping a step binding | none |
| `self-provisioned-input` | The one `set` target is not interpolated into the same step's inputs | none |
| `self-composed-set` | No `set` builds its value from the variable it writes; container slots are the server's | none |
| `launched-workflows` | No `triggers[]`, no step binding `handle-sub-workflow`. A graph fan dispatches an **activity**, never a child workflow | none |
| `review-mode-gating` | `is_review_mode` **is** declared (opting in deliberately, for G11's corpus arm); the one gate's `defaultOption` carries no `setVariable` and no `exit` effect | `ACCEPTED_HEADLESS_AUTO_ADVANCE` not used |
| `pinned-corpus-paths` | No test embeds a `fan-conformance/...` path literal — every test drives by workflow **id** | none |
| `stealth-isolation` | Out of scope: the guard's `workflowId` defaults to `remediate-vuln` and the sweep passes no `--workflow` | not needed |
| `prism-lens-reachability` | Out of scope: root is hardcoded to `prism/` | not needed |
| `harness-adapter-set` | Out of scope: scope is `meta/techniques/harness-compat/` | not needed |
| `bootstrap-self-contained` | Out of scope: one hardcoded meta file | not needed |

**Authoring loop.** Iterate against a scratch corpus, never the live submodule:

```
cp -r workflows /tmp/fc-corpus && (author into /tmp/fc-corpus/fan-conformance)
npx tsx scripts/check-all.ts --root /tmp/fc-corpus --corpus-only     # ~3s, 33 guards
WORKFLOWS_DIR=/tmp/fc-corpus npx vitest run tests/e2e/all-workflows-walk.test.ts
```

Verify by **delta**, not by absolute green: a `main`-ahead-of-submodule sweep carries a pre-existing `work-packages/activities/07-implementation.yaml` `launched-workflows` failure that has nothing to do with this change.

---

## 7. What this costs

**Snapshots and baselines** (all in the pointer-bump commit, all on `main`):

| Artefact | Why it moves | Command |
|---|---|---|
| `tests/e2e/__snapshots__/corpus-sha.json` | the submodule pointer moves | `npm run baseline:stamp` |
| `tests/e2e/__snapshots__/snapshot.test.ts.snap` | the stamp check in front of it fails first, so the pair moves together | `npm run test:ci -- -u`, then re-stamp |
| `tests/e2e/walked-workflows.ts` | `coverage-roster.test.ts` runs in `test:ci` and fails on a corpus workflow named in neither list | add `'fan-conformance'` to `WALKED`, below `work-package` — the roster's wall clock is the slowest member, not the sum, so an addition below the top is free |
| `tests/e2e/option-coverage.json` | one checkpoint, two options; both reachable, so **target: no entries**. Any unreached option needs one | — |
| `WF_DRY_WALKS` (default 50) | a collection-seeded fan multiplies branch orderings; the coverage comment says the plateau is a property of the graph and must be re-measured | measure from 50 upward in the same commit |
| `scripts/fixtures/token-benchmark-baseline.json` | **not** by this workflow — but stage 6 edits `meta`, which `work-package` composes, so the 1% delivery gate moves at stage 6 | `npm run bench:token -- --label=rerecord --context-mode=fresh --no-compare` |
| `scripts/binding-fidelity-triage.json` `corpusSha` | informational only (`triageStampNote` prints drift without failing) | — |

**The coverage walk.** Because the fan work changes `src/`, `scripts/coverage-scope.ts` puts every PR in this line into **full-corpus mode** — ~21 minutes locally, ~38 on a shared runner, against `coverage.yml`'s 70-minute budget. On a corpus-only PR the coverage job does not run at all (the `workflows` branch carries only `verify-corpus.yml`).

**Cross-branch sequencing.** `verify-corpus.yml` hardcodes `ref: main` for its tooling and checks out the corpus PR's **branch tip**, then runs `check:all` — guards only, never the suite. So a corpus fan graded by an unwidened `GraphSchema` is reported unloadable by `workflow-yaml`, and `refs`, `audience`, `artifact-guides`, `stealth-isolation` and `activity-variables` all inherit that. Hence:

1. **Stages 1–5 merge to `main`**, fixtures carrying every new behaviour. Fixture corpora are invisible to every guard.
2. **Stage 6 merges to `main`** — `dispatch-fan.md`, the drive-loop bind site, the two delivery entries, and **the deletion of the load gate**. Also stage 2's walker widening, which is the one non-negotiable ordering: the walker precedes any corpus fan, or the corpus-wide walk throws.
3. **The `workflows`-branch PR opens** and adds `fan-conformance`. Because step 2 has merged, `main`'s tooling already understands the forms and the PR is green on first run. Opened before step 2 it is red for the whole interval, which is the trap the plan already names.
4. **The pointer-bump PR on `main`** carries: the gitlink, the `WALKED` entry, any `option-coverage.json` entries, any `binding-fidelity-triage.json` entries, `npm run test:ci -- -u`, `npm run baseline:stamp`, the re-measured dry-walk budget, and `tests/e2e/fan-smoke-walk.test.ts`. Note `.github/actions/workflows-corpus` fails a PR whose merge-tree gitlink differs from its branch-head gitlink, so if the base moves the submodule first: merge the base in, re-baseline and re-stamp in the same commit.
5. **Stage 7** adopts `cicd-pipeline-security-audit`, unchanged by any of this.

**What CI cannot verify, and how it is covered.** In the interval between steps 2 and 4 nothing on either side sees both halves. Verify locally: `npm run check:all -- --root <corpus-worktree>`, `npm run check:delta` (diffs a whole sweep against the merge-base with the submodule pinned to what that tree recorded), `npm run worktree:provision` for a fresh measurable worktree. Re-run the workflows-branch sweep by hand after step 2 merges — which is exactly what the plan's stage 7 already commits to.

---

## 8. Contradictions in the ground truth, and what I chose

1. **S1/S2's message text.** The parse table (README:1709–1710) says *"a list of at least two **activity ids**"*; the schema block (README:606, 613) says *"a list of at least two **members** — each an activity id or an instance fan"*, and the array member is `z.array(FanMemberSchema)`. A test asserting one fails against the other. **Chosen: the schema block's wording.** It matches the type, and L2's message already accounts for mixed lists. The parse-table rows are stale and should be corrected in the spec.
2. **T1's layer vs its exercise site.** The matrix marks T1a–T1f `layer: tool` and `exerciseSite: seeded-state`. That is not a contradiction — it is the point: they are tool-boundary refusals a **legal** corpus workflow reaches only over bad data. Kept as stated.
3. **"Forty-four invariants"** (README:1701) against 56 rows across the six tables. No subset yields 44. **Chosen: do not quote the figure anywhere in a test or a criterion.** Re-derive it in the spec before it is quoted again.
4. **"The guard registry stays at 36"** (README:1701, 1899) against a measured 37 — `check-launched-workflows` was registered at `dbd82286`, during the ground-truth investigation. **Chosen: 37, and the fan adds none.** The spec's figure is stale by one commit, not wrong in kind.
5. **Stage 6's smoke criterion says "fixture fan".** **Chosen: satisfy it with the corpus workflow instead**, which is strictly stronger, and keep the fixture three-instance fan for stage 5 (where no corpus fan can exist).
6. **The delivery plan's stage-1 criterion** — "a destination declaring one loads only where it is tighter than that default" — is not backed by any rule in the enforcement tables. See §9 Q2.

---

## 9. Open questions a human must decide

**Q1 — the blocking one. Stage 4 must teach `binding-fidelity` the fan's two new producers, not merely add it to the acceptance set.** The plan's stage 4 names `src/utils/activity-variables.ts` and `scripts/check-activity-variables.ts`, and says `binding-fidelity` "joins the acceptance set". That is not sufficient, and `fan-conformance` cannot be green without more:

- `orphan-input`: `probe-surface.md` declares own input `probe_unit`. It has no step-binding entry, no workflow variable, no step output and no default — because the fan parameter is deliberately **not** a workflow variable. Reported as an orphan input.
- read-resolution: `{probe_unit}` inside the artifact template `{probe_unit}-probe-findings.json`, and every `{survey_outputs.0.result.…}` token, must resolve to a producible bag name. The guard's producer model is "a `workflow.yaml` variable, an activity-produced var (set / setVariable / loop variable / binding remap target)". Neither the fan parameter nor the derived container is any of those.
- `dead-output`: a branch output gathered **whole** through a container has no same-named downstream input. My design sidesteps it by giving both instance-fanned branches token-templated artifacts (artifact outputs are exempt) — but that means **LF31 is unreachable for an instance fan** without either extending the exemption or a triage entry per site.

The minimum fix: `binding-fidelity`'s producer model gains (i) the branch container as a workflow-scope producible name, and (ii) the fan parameter as producible **for the fanned activity only**. Without it the corpus workflow needs three or more triage entries on `main`, which is a ledger recording a tooling gap rather than accepted debt.

**Q2 — does `maxInstances` above the configured default load?** Nothing enforces "tighter than the default": S3 enforces only `min(2)`, and no load rule compares the two. So LF36 (`maxInstances: 8` against a default of 4) parses, loads, and **widens** the server's bound. The stage-1 criterion is untestable as written. *Recommendation: restate the criterion as a convention nothing checks, and do not add a rule* — a rule "declared ≤ default" means lowering the default retroactively breaks every tighter declaration, which contradicts "the bound has one home and moves without editing a single destination."

**Q3 — is a list's arity unbounded above, deliberately?** `DEFAULT_FAN_MAX_INSTANCES` is declared as *instance-fan* width policy and `maxInstances` lives on `InstanceFanSchema` alone, so a twenty-member list opens twenty workers with no ceiling check anywhere. *Recommendation: yes, deliberately — a list's width is authored and reviewable where a collection's length is not — and say so in the graph field's description.* The alternative is a `DEFAULT_FAN_MAX_MEMBERS`, which would then need a second refusal message.

**Q4 — where does the stage 1–5 load gate sit relative to the fourteen rules?** As written it "rejects any list or object destination outright". Run **before** the rules it masks every L-rule message and makes stage 1's "one test per load rule" unsatisfiable through the load. *Recommendation: the gate appends **last** to the same error list, and the L-rule tests call `validateExitBindings` directly.* Decide before stage 1's tests are written, not after.

**Q5 — does a container-whole gather satisfy member-grain G3 for every member?** Stage 4's criterion says a correct fan with a gather-bound meeting point produces zero findings, which requires it. If instead each member needs its own named consumer, `combine-sweep` and `reconcile-review` must spell every member — impossible for an instance fan, whose width is a run-time value. Confirm the intended semantics before stage 4.

**Q6 — does a *specimen* workflow belong in `workflows/`?** All 17 existing corpus workflows do real work. `fan-conformance` does real work *and* is shaped for coverage, and its README says so. The alternative is `tests/fixtures/`, which forfeits the automatic 33-guard sweep and the auto-discovered walk — the entire prize. Maintainer's call, and it is the one question that changes the deliverable rather than a detail of it.

**Q7 — `WALKED` or `NOT_WALKED`?** *Recommendation: `WALKED`.* Seven activities and one two-option checkpoint; its wall clock sits far below `work-package`, so the roster cost is zero. On `NOT_WALKED` its two options become unreached options needing `option-coverage.json` entries, and — worse — `scripts/coverage-scope.ts` resolves a `NOT_WALKED` addition to an empty scope, so the pointer-bump PR prints `scope=none` and the workflow's options are first judged **after merge**, on the push-to-`main` full run.

**Q8 — the `revisit` cycle's exposure to the re-entry family.** `combine-sweep` reads four names none of which is written inside the cycle `combine-sweep → unit-review → reconcile-review → combine-sweep`. If `activity-variables`' `unreachable-read` `re-entry` arm fires on non-gate reads (its wording suggests gates only), the remedy is to drop the `revisit` edge and move LF24 and LF27 to `legal/chained-fan`. Settle it during authoring with `npx tsx scripts/check-activity-variables.ts --root /tmp/fc-corpus` before the corpus commit, not after.

**Q9 — LF30 is invisible to the arrival analysis.** An activity that is both a fan branch and a plain destination has two ways to arrive at the join, and the arrival split removes it from the plain predecessor index *entirely*. The union arrival is a superset, so there is no false finding — but the sequential arrival is unanalysed. Worth stating as a limitation in the spec's reachability section rather than discovering later.

**Q10 — how are N3 and N4 asserted?** The smoke test asserts the **call sequence** in session history plus the planning README's marks, not a real push to a real remote. If a stronger proof is wanted, that is a live-run acceptance item for stage 7, not a suite test.
