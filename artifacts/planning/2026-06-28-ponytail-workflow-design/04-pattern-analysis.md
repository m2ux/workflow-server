# Pattern Analysis — ponytail Workflow

**Work Package:** ponytail Workflow Design
**Workflow:** workflow-design → pattern-analysis (create mode)
**Created:** 2026-06-28
**Status:** Patterns extracted; presented alongside the proposed `ponytail` structure for adoption decision

---

## Summary

Reference workflows surveyed (same model type — sequential spine + a gated branch): **prism** (string-mode-gated branching, scatter-gather forEach, single-source lens resources), **work-package** (canonical bound-step purity, the `review-assumptions` reusable group, audience-partitioned rules/techniques, over-engineering review precedent), **workflow-design** (activity numbering with gaps, README orientation), and **meta** (the cross-workflow technique library: `scatter-gather`, `variable-binding`, `version-control`). The proposed `ponytail` shape (from `03-assumptions-log.md`) aligns cleanly with these; almost every cross-cutting capability already exists and is referenced, not authored. The five `ponytail-operations` ops are the only genuinely new content.

---

## 1. Reusable cross-workflow techniques (reference directly — do NOT re-author)

| Need in ponytail | Reuse this existing ref | What for |
|---|---|---|
| forEach-over-findings, forEach-over-`ponytail:`-markers accumulate-then-combine | `scatter-gather` (`meta/techniques/scatter-gather.md`) | Declared activity-level strategy technique; its `accumulate-never-overwrite` + `one-gather-contract-two-scatter-modes` rules are exactly the per-iteration accumulation the review/audit/harvest loops need. Sequential mode (the `concurrency=1` case) is the default — no parallel fan-out required. Listed once at `workflow.techniques.activity`. |
| Land every op's outputs into the state bag by declared name | `variable-binding` (`meta/techniques/variable-binding.md`) | The universal binding strategy. Hoist to `workflow.techniques.activity` (per AP-75) so EVERY activity inherits it — never per-activity copies. |
| Commit the produced artifacts (if a commit step is wanted) | `version-control::commit-regular-files` (`meta/techniques/version-control/commit-regular-files.md`) | Stage/commit/push planning artifacts. NOTE: planning artifacts are gitignored — ponytail likely produces no commit step at all; a commit is a non-file side-effect and is NOT declared as an artifact. Cite only if a real commit is in scope. |
| Write/update an artifact in the planning folder | `manage-artifacts::write-artifact` (`work-package/techniques/manage-artifacts/write-artifact.md`) | Find-or-create keyed on bare filename; the canonical "one logical artifact per bare filename, update-in-place" mechanism. The `report-gain` tail appending to `debt-ledger.md` is exactly this op's update-in-place case. |
| README authoring/conformance for the new workflow's folders | `manage-artifacts::create-readme` + `verify-readme-conforms` (`work-package/techniques/manage-artifacts/`) — and `workflow-design`'s own `readme-authoring` is the in-workflow analog | The drafting activity (scope-and-draft, downstream) authors the 4 READMEs; not a ponytail-runtime op. Listed for completeness. |
| Trace the real end-to-end flow the change touches (intake "understand-first") | `gitnexus-operations::query` / `::context` / `::verify-index` (`meta/techniques/gitnexus-operations/`) | The intake `understand-the-change` work should bind/reference these for code tracing, mirroring how `review-assumptions::reconcile` uses them for code-resolvable analysis. Reference by canonical hyperlink in protocol (AP-48), never the raw `gitnexus_*` tool name. |

**Genuinely new (must author):** the five `ponytail-operations` ops — `apply-ladder`, `review-over-engineering`, `audit-repo`, `harvest-debt`, `report-gain`. No existing op climbs a lazy ladder, applies the 5-tag taxonomy, or harvests `ponytail:` markers. `work-package::strategic-review::document-findings` is the closest SHAPE precedent (it categorizes over-engineering / orphaned-infrastructure findings into a `strategic-review-{n}.md`) but its taxonomy and inputs differ — mirror its structure, do not bind it.

---

## 2. Structural patterns to mirror (with source)

| Pattern | Source (exact) | How ponytail applies it |
|---|---|---|
| **String mode-variable gating activity branches** (NOT a schema enum) | `prism/workflow.yaml` declares `pipeline_mode` as `type: string`; `prism/activities/01-structural-pass.yaml` `transitions[]` branch on it via `condition.type: simple` `operator: ==`. | `intensity` (lite/full/ultra) and `scope` (change/repo) are plain `type: string` variables. The repo-audit gate is a `transition` with `condition.type: or` over two `simple ==` conditions. (PA-5, PA-12 validated against this.) |
| **`condition.type: or` on a transition** | `prism/activities/01-structural-pass.yaml` uses `type: or` with nested `conditions[]`. | `over-engineering-review → repo-audit` when `intensity == ultra` OR `scope == repo`. |
| **One `isDefault: true` + gated branches** | Every reference activity: prism structural-pass has 3 transitions (2 conditional + 1 `isDefault: true` to `generate-report`); work-package research has a lone `isDefault: true`. | `over-engineering-review` has the gated `→ repo-audit` branch + `→ harvest-debt-and-report` as `isDefault: true`. `repo-audit → harvest-debt-and-report` is a lone `isDefault`. |
| **`kind: loop` forEach with accumulator `set`** | `prism/activities/01-structural-pass.yaml` `unit-cycle` loop over `analysis_units`, with `kind: action` steps `set`-ting `all_artifact_paths` (the scatter-gather GATHER). | The review/audit forEach over findings and the harvest forEach over `ponytail:` markers; per-iteration output accumulated into a plural collection via a `set` on a control step (AP-67 exclusion (a) — accumulator stays). |
| **Present-then-checkpoint** (technique step produces, next inline `kind: checkpoint` decides) | `work-package/activities/02-design-philosophy.yaml`: `classify-problem` technique step → `classification-confirmed` checkpoint; `research.yaml`: `synthesize` → `research-findings` checkpoint. | `apply-ladder`'s build step → `safety-floor-cleared` blocking checkpoint; intake's scope step → `intensity-and-scope-confirmed` checkpoint. Checkpoint is an INLINE step at its position, stable `id`, `message`/`options` inline (AP-64). |
| **Blocking checkpoint with `setVariable` effect backing a gate variable** | `02-design-philosophy.yaml` `workflow-path-selected` options carry `effect.setVariable`; intensity options `setVariable: intensity`. | `intensity-and-scope-confirmed` options `setVariable: intensity`; `safety-floor-cleared` sets `safety_floor_cleared: true`. (PA-3 — blocking, per design principle 10.) |
| **Technique-group dir layout** (base `TECHNIQUE.md` + one file per op) | `work-package/techniques/review-assumptions/` (`TECHNIQUE.md` + `collect.md`/`interview.md`/`reconcile.md`/`record.md`); prism `subsystem-analysis/`, `smart-analysis/`. | `ponytail-operations/TECHNIQUE.md` (shared Inputs/Outputs/Rules) + `apply-ladder.md`, `review-over-engineering.md`, `audit-repo.md`, `harvest-debt.md`, `report-gain.md`. (PA-7 — review-assumptions is the cited convention.) |
| **Base `TECHNIQUE.md` inheritance + Initial/Final wrap** | `workflow-design/techniques/TECHNIQUE.md`: Inputs/Outputs/Rules inherited by every descendant; `Initial`/`Final` protocol blocks wrap descendants. | Put workflow-wide shared inputs (`task_description`, `target_path`, `intensity`) ONCE on `ponytail-operations/TECHNIQUE.md`, inherited by all five ops (AP-52). |
| **Single-source resource referenced by many techniques** | prism: 58 lens resources, each referenced by `full-prism.md` / `structural-analysis.md` via `[lens](../resources/x.md)` — one resource, many consumer techniques; `prism/resources/README.md` is the catalog. work-package: `assumption-reconciliation.md#section` referenced by multiple review-assumptions ops. | `the-ladder.md` referenced by `apply-ladder` + `review-over-engineering` + `audit-repo`; `review-taxonomy.md` by review + audit; `honesty-boundary.md` by `report-gain`. Hyperlink the noun to the resource `#section` (AP-42), no "Format:…" verbiage. (PA-9 — modular-over-inline.) |
| **`#### artifact` discriminator-keyed / token-template output** | `prism/techniques/full-prism.md` `#### artifact`: `` `adversarial-analysis.md` (`{lens_name}` `adversarial`) / `synthesis.md` (`synthesis`) ``; `strategic-review/document-findings.md` `#### artifact` `strategic-review-{n}.md`. | Each ponytail op declares its `#### artifact` on its `## Outputs` (literal: `lean-change.md`, `review-findings.md`, etc.). The technique owns artifact identity (AP-43); the activity's artifact contract is SERVER-SYNTHESIZED (AP-65). |
| **Activity file numbering WITH GAPS** | `workflow-design/activities/`: `01,03,04,05,06,08,09,10,11` (gaps at 02,07); prism `00`-`12`. | ponytail uses `01-intake-and-scope`, `02-apply-ladder`, `03-over-engineering-review`, `04-repo-audit`, `05-harvest-debt-and-report` — contiguous is fine; gaps are tolerated, not required. |
| **Audience-partitioned rules** (`rules.workflow` orchestrator / `rules.activity` worker / `rules.universal` both) | `prism/workflow.yaml` (ISOLATION/ORCHESTRATION in `workflow`; LENS LOADING/WORKER PERMISSIONS in `activity`); `work-package/workflow.yaml` same split. | ponytail's safety-floor + understand-first invariants: classify each by actor. Honesty-boundary is worker-facing (it constrains report CONTENT) → `report-gain` technique rule, not workflow root (AP-71). |
| **Audience-partitioned techniques** (`techniques.activity` = inherited by every activity) | `prism` + `work-package` both: `techniques: { activity: [variable-binding] }` at workflow root. | `variable-binding` → `workflow.techniques.activity` (universal). `scatter-gather` → only on the activities that fan out (review/audit/harvest), in their activity `techniques[]` (AP-75 coverage discriminator). |
| **Checkpoint that AUTO-advances vs blocks** | `02-design-philosophy.yaml` `classification-confirmed`: `blocking: false`, `defaultOption`, `autoAdvanceMs: 30000`. | ponytail's two checkpoints are BLOCKING (`safety-floor-cleared` is the non-negotiable gate). No auto-advance — these are genuine decision gates. |

---

## 3. Anti-patterns / conventions to respect (authoritative — from the `anti-patterns` resource, applied to ponytail)

The authoritative list is `workflow-design/resources/anti-patterns.md` (197 lines, AP 1-76) + the 14 `design-principles`. The ones the draft MUST honor:

- **AP-43 (artifact identity in the technique):** each `ponytail-operations` op declares its artifact as a `#### artifact` on `## Outputs` (literal filename, or `{token}` template, or discriminator-keyed). Protocol references the canonical output id `{lean_change}` etc., never the literal filename in prose (AP-42).
- **AP-65 (no hand-authored `activity.artifacts[]`):** NONE of the five activities declares an `artifacts[]` block. The server synthesizes each activity's artifact contract from its steps' bound techniques' `## Outputs`. `report-gain` persists nothing durable → it declares NO `#### artifact` (its gain scoreboard appends to `debt-ledger.md`, which `harvest-debt` owns); a genuine non-file side-effect is simply not declared.
- **AP-60 (qualified noun-phrase ids, no bare single words):** outputs are `lean_change`, `review_findings`, `audit_findings`, `debt_ledger`, `gain_scoreboard` — qualified, head-noun-last, snake_case (AP-55). NOT bare `findings`/`change`/`scoreboard`. Booleans are affirmative predicates: `safety_floor_cleared`, `has_debt_markers` (already conformant — past-participle / `has_` result flags, not re-prefixed). `intensity`/`scope` are scalar nouns. No `_list`/`_flag`/`_status` suffixes.
- **AP-64 (bound-step purity):** every `kind: technique` step is `id` + `technique` + structural fields ONLY (`when`/`actions`/`required: false`) — NO `description`, NO `name`. Canonical reference: `work-package/activities/04-research.yaml`. The step's WHAT is the bound op's `## Capability`; the HOW is its `## Protocol`. (Mirror this exactly; the workflow-design `quality-review` activity has historically violated it — do not copy that.)
- **activity-group-shorthand:** inside the `harvest-debt-and-report` activity, steps whose ops live in a same-named group reference them BARE (`technique: harvest-debt`, `technique: report-gain` → resolve to `harvest-debt-and-report::harvest-debt`?). CAVEAT: shorthand resolves to `<activity>::op`, so the GROUP must be named after the activity for bare refs to work. The assumptions log names the group `ponytail-operations` (a capability name, NOT an activity name) — so bare shorthand will NOT resolve; ponytail ops are referenced QUALIFIED (`ponytail-operations::apply-ladder`) from every activity, exactly like `review-assumptions::collect` is always qualified in work-package. **This is a drafting correction to flag:** either name the group after an activity to earn shorthand, or accept qualified refs throughout (the latter is cleaner since ops are shared across `apply-ladder`/`over-engineering-review`/`repo-audit`/`harvest-debt-and-report` activities — a cross-activity capability group per AP-63, so it is correctly capability-named and correctly referenced qualified).
- **AP-63 (technique placement by reuse + shape-origin):** `ponytail-operations` is a **cross-consumer/intrinsic capability** group (its ops are consumed across multiple activities and are the lazy-coding capability itself, not one activity's seams) → lives at the **workflow root**, named for the capability, referenced qualified. Correct as planned.
- **generic-not-overfit (AP-41/55):** op inputs/outputs describe what the value IS, never naming a producer/consumer activity or step. `review-over-engineering`'s input is "the change/diff under review", not "the output of apply-ladder".
- **canonical-rename-over-args:** if `harvest-debt` produces `has_debt_markers` and a transition reads it, both use the one canonical name — no per-call `technique_args` rename. Align the caller's variable to the op's canonical output id.
- **AP-36/38/40/66 (description hygiene):** no rationale, no process narration, no activity-sequence prose, no role-rules in any `description`/`outcome`. Activity `outcome` names the VALUE delivered ("the diff's over-engineering is tagged and quantified for a cut decision"), never "review-findings.md written" (AP-66).
- **AP-61 (techniques are stage-agnostic):** no op protocol mentions "the review activity", "after the checkpoint", "the next step", or its own position. `report-gain`'s honesty rule is phrased as purpose ("never fabricate a per-repo number"), not "before the report checkpoint".
- **AP-62 (no activity-level prose `rules:`):** activities carry NO `rules:` block — constraints are `steps[]` order, `when`/`condition` gates, transitions, and the blocking checkpoint. The understand-first invariant is the activity-graph ordering (intake precedes apply-ladder), not a prose rule.
- **AP-19 / design-principle-10 (encode constraints as structure):** safety floor = blocking checkpoint + `safety_floor_cleared` gate variable, NOT rule text alone. Honesty boundary = a `report-gain` technique rule + the `honesty-boundary.md` resource.
- **modular-over-inline (principle 9):** the ladder/taxonomy/marker-convention/honesty-boundary live in resource files referenced by techniques — content in exactly one location. `workflow.yaml` holds metadata + references only.
- **AP-76 / principle-14 (READMEs orient, don't transcribe):** the 4 READMEs (root + activities/ + techniques/ + resources/) state purpose, at-a-glance activity sequence, value per activity, file structure, techniques overview, links — and KEEP flow diagrams. They do NOT enumerate steps/checkpoints/transitions/variables/rules. Style baseline: `prism` READMEs.
- **AP-59/49 (backtick + brace every code token / designator):** protocol references are `` `{input_id}` `` / `` `{output_id}.field` ``; CLI/grep commands (`grep -rn 'ponytail:'`) are backticked.
- **AP-26/60(4) (grouped, positively-named rules):** prefixed rule families use grouped arrays; rule slugs are positive invariants (`safety-floor-cleared-before-review`, not `do-not-review-before-floor`).

---

## 4. Drafting cheat-sheet (per ponytail element → pattern + reuse)

### Variables (`workflow.yaml`)
- `task_description` (string, required), `target_path` (string, default `.`), `intensity` (string, default `full`), `scope` (string, default `change`), `safety_floor_cleared` (bool, default false), `has_debt_markers` (bool, default false). Pattern: **prism `pipeline_mode`** string-variable model. NO enum construct. Affirmative-predicate booleans (AP-60(1)).

### Techniques (`workflow.yaml`)
- `techniques.activity: [variable-binding]` (inherited by all activities — AP-75).
- `scatter-gather` listed ONLY on the fan-out activities' own `techniques[]` (review/audit/harvest), not workflow-wide.

### Rules (`workflow.yaml`, audience-partitioned)
- `rules.workflow`: orchestrator-only (transitions, mode-gating cadence) — likely minimal.
- `rules.universal` / `rules.activity`: understand-first invariant if worker-facing. Honesty-boundary → `report-gain` technique rule (worker-facing, single authoritative home — AP-71). Output-discipline / take-higher-rung / root-cause → technique `rules`/protocol (PA-8: per-execution style, not cross-activity).

### Activities (one concern each; numbered `01`-`05`; AP-64 pure bound steps; NO `artifacts[]`, NO `rules:`)
| Activity | Pattern mirror | Bound op(s) |
|---|---|---|
| `01-intake-and-scope` | present-then-checkpoint (design-philosophy `classify`→`classification-confirmed`); gitnexus tracing (review-assumptions `reconcile`) | new intake op (capture task/target/intensity/scope + trace) → `intensity-and-scope-confirmed` blocking checkpoint (`setVariable: intensity`, scope). |
| `02-apply-ladder` | present-then-checkpoint; blocking safety gate | `ponytail-operations::apply-ladder` → `safety-floor-cleared` blocking checkpoint (`setVariable: safety_floor_cleared`); needs-work option loops within activity (a `when`-gated re-run, like research's `further-research`). |
| `03-over-engineering-review` | scatter-gather forEach over findings + `set` accumulator (prism `unit-cycle`); `strategic-review::document-findings` shape | `ponytail-operations::review-over-engineering`; `techniques: [scatter-gather]`. Transition: `→ repo-audit` (`condition.type: or`: `intensity==ultra` OR `scope==repo`) + `→ harvest-debt-and-report` `isDefault`. |
| `04-repo-audit` (gated, `required: false`) | reached only via the `or`-gated transition; no checkpoint (PA-4 read-only) | `ponytail-operations::audit-repo`; scatter-gather over repo findings; `→ harvest-debt-and-report` lone `isDefault`. |
| `05-harvest-debt-and-report` | scatter-gather forEach over `ponytail:` markers; `report-gain` tail appends to ledger (write-artifact update-in-place) | `ponytail-operations::harvest-debt` (sets `has_debt_markers`) → `ponytail-operations::report-gain` (no durable artifact; appends to `debt-ledger.md`). Terminal activity. |

### Technique group (`techniques/ponytail-operations/`, root-level — AP-63 capability-named)
- `TECHNIQUE.md` base: shared Inputs (`task_description`, `target_path`, `intensity`) + shared Rules (output-discipline), inherited by all five ops (AP-52). Mirror `review-assumptions/TECHNIQUE.md`.
- `apply-ladder.md`: capability = climb 7 rungs after understanding; protocol = rung sequence + safety-floor gate + mark `ponytail:` ceilings + leave one runnable check; output `lean_change` `#### artifact lean-change.md`. References `the-ladder.md#...`.
- `review-over-engineering.md`: diff-scoped; output `review_findings` `#### artifact review-findings.md` + `net: -N lines` scoreboard. References `review-taxonomy.md#...`. Shape from `strategic-review::document-findings`.
- `audit-repo.md`: repo-wide; output `audit_findings` `#### artifact audit-findings.md`. References `review-taxonomy.md#...`.
- `harvest-debt.md`: grep `ponytail:` markers; outputs `debt_ledger` `#### artifact debt-ledger.md` + `has_debt_markers`. References `ponytail-marker-convention.md#...`.
- `report-gain.md`: outputs `gain_scoreboard` (NO `#### artifact` — appends to ledger). Rule: honesty-boundary (benchmark medians, never per-repo fabrication). References `honesty-boundary.md#...`.

### Resources (`resources/`, single-source — prism lens model)
- `the-ladder.md` (7 rungs + safety floor + when-NOT-to-be-lazy) — referenced by apply-ladder/review/audit. NO back-reference to consuming techniques (AP-44).
- `review-taxonomy.md` (5 tags) — referenced by review + audit.
- `ponytail-marker-convention.md` (`ponytail: <ceiling>, <upgrade>` + `no-trigger`) — referenced by harvest-debt + apply-ladder.
- `honesty-boundary.md` (gain-reporting rule) — referenced by report-gain.

### READMEs (4: root + activities/ + techniques/ + resources/) — orient, keep diagrams, AP-76 style of `prism`.

---

## Proposed structure vs extracted patterns — alignment table (for the checkpoint)

| Dimension | Proposed (assumptions log) | Pattern source | Alignment |
|---|---|---|---|
| Mode variables | `intensity`/`scope` plain strings + `simple ==` | prism `pipeline_mode` | ✅ aligned |
| Branch gate | transition `condition.type: or` | prism structural-pass | ✅ aligned |
| Loops | within-activity forEach, no activity-graph loops | prism `unit-cycle` + scatter-gather | ✅ aligned |
| Checkpoints | 2 blocking, present-then-checkpoint | design-philosophy / research | ✅ aligned |
| Technique group | `ponytail-operations` base + 5 op files | review-assumptions group | ✅ aligned |
| Group naming/refs | capability-named, referenced QUALIFIED | AP-63 + review-assumptions | ⚠️ DIVERGENCE from activity-group-shorthand: ops are NOT bare-referenced (no same-named activity group). Qualified refs throughout — correct per AP-63 but worth confirming. |
| Artifact identity | per-op `#### artifact`, no activity `artifacts[]` | AP-43/65, full-prism, strategic-review | ✅ aligned |
| Reuse | scatter-gather + variable-binding reused; 5 ops new | meta library + AP-63 | ✅ aligned |
| Rules placement | safety/understand structural, rest technique-level | AP-62/71, work-package split | ✅ aligned |

**One flag for the user:** the `ponytail-operations` group is capability-named (correct per AP-63 for a cross-activity capability), which means its ops are referenced **qualified** (`ponytail-operations::apply-ladder`) everywhere, NOT via activity-group-shorthand. This is a deliberate, conformant choice — not a defect — but it diverges from the terser bare-op style some activities use, so it is surfaced for the adoption decision.
