# Compliance Review: prism

**Date:** 2026-07-01
**Workflow:** prism v2.0.0
**Session:** OYGFOT (workflow-design v1.5.0, activity `quality-review`, review mode)
**Target audited:** worktree copy at `/home/mike1/projects/work/workflow-server/2026-07-01-prism-lens-remediation/workflows/prism` (NOT the server's older copy)
**Files audited:** 110 (13 activities, 31 technique files, 63 resources, workflow.yaml, 2 READMEs, concept-lexicon)
**Focus of the landed remediation:** new `single-lens-analysis` technique + single-mode dispatch branch in `01-structural-pass`; `plan-analysis` matrix de-dup + `disjunction-tiebreak`/`model-gating` rules + per-unit `lens_name`; `smart-analysis::{select-mode,run-analysis}` goal routing; README / resources/README reachability notes.

## Executive Summary

| Severity | Count |
|----------|------:|
| Critical | 0 |
| High     | 2 |
| Medium   | 3 |
| Low      | 3 |
| Pass     | (schema-validation, ref-resolution, doc-parity all clean) |

**Headline:** No schema-invalid or structurally broken constructs. The dominant issue is a **naming split for one concept — `analysis_focus` vs `analytical_goal` — that produces a real binding gap** at the `plan` step (High). Everything else is convention/hygiene polish. `needs_audit_fixes` = true, `has_critical_finding` = false.

---

## Principle Compliance Findings

| # | Principle | Verdict | Notes |
|---|-----------|---------|-------|
| 1 | Internalize before producing | Pass | n/a in review |
| 4 | Maximize schema expressiveness | Pass | Dispatch branch expressed as step `condition` (structured OR/AND), not prose. Mode routing is `transitions[].condition`. |
| 5 | Convention over invention | **Partial** | `analytical_goal`/`analysis_focus` synonym drift (see H-1); one matrix entry hyperlinks its goal key while 60 siblings do not (L-1). |
| 6 | Never modify upward | Pass | All content conforms to schema; validator clean. |
| 9 | Modular over inline | Pass | New technique is its own file; no inline content in workflow.yaml. |
| 10 | Encode constraints as structure | **Partial** | Single-vs-L12 routing is a proper step `condition`. But six worker-behavioural rules sit in `rules.workflow` where workers never see them (H-2 / AP-71). |
| 13 | Format literacy | Pass | YAML valid against workflow/activity/technique schemas. |
| 14 | Complete documentation structure | Pass | README + resources/README present; orientation-only, diagrams kept. |

---

## Schema Validation Results

`npx tsx scripts/validate-workflow-yaml.ts <worktree>/prism` → **all 110 files PASS**; `techniques/` reports "no unanchored protocol references." workflow.yaml, all 13 activities, all technique files valid.

> **Caveat (scope of the deterministic guards).** `scripts/check-all-refs.ts` and `scripts/check-binding-fidelity.ts` read from the server's OWN `workflows/` ROOT, not the worktree — they audited the server's (older) prism copy plus its siblings, and reported 0 unresolved refs and 2 NEW binding-fidelity drifts unrelated to prism (both in `codebase-wiki/techniques/ingest.md`, `{page_slug}`). They did NOT validate the worktree remediation. The binding findings below (H-1) were therefore derived by manual trace of the worktree files, and would surface in `check-binding-fidelity.ts` once the worktree is the server tree.

---

## Anti-Pattern Findings

### H-1 (High) — AP-52 / AP-60(3) / AP-68 / generic-not-overfit — one concept, two names, causing a binding gap

The analytical-goal concept is carried under **two** ids:
- Workflow variable `analysis_focus` (workflow.yaml:53); read directly as `{analysis_focus}` by `structural-analysis`, `single-lens-analysis` (input `analysis_focus`), and `smart-analysis/select-mode.md:22` (which even glosses it "(the analytical goal)").
- Input `analytical_goal` on `plan-analysis` (line 20) and `portfolio-analysis` (line 20).

Consequences:
1. **Binding gap at `select-mode` `plan` step.** `activities/00-select-mode.yaml:6-8` binds `plan-analysis` as a bare string with NO input deviation, so its `analytical_goal` input resolves by implicit same-name binding to a bag variable `analytical_goal` — which does not exist (no variable, no upstream `set`). The value the author intends (`analysis_focus`) never reaches `plan-analysis`.
2. **Per-call rename bridging the split.** `activities/01-structural-pass.yaml:77` bridges with `analytical_goal: "{analysis_focus}"` on the `run-portfolio` step — the exact "canonical-rename-over-technique_args" smell: a per-caller rename papering over a naming mismatch that should be unified to one canonical id.

**Fix (generic-not-overfit — move the caller/producer side to the operation's canonical id):** pick ONE canonical id for the concept across the workflow. `analytical_goal` is the better generic name (head-noun-last, states what the value IS). Rename the workflow variable `analysis_focus → analytical_goal`, rename the base/`single-lens`/`structural` reads to `{analytical_goal}`, drop the `run-portfolio` rename deviation, and the `plan` step then binds implicitly with no gap. (If `analysis_focus` is kept instead, rename the `plan-analysis`/`portfolio-analysis` inputs to `analysis_focus`.) Either way: one concept, one name, zero rename deviations.

### H-2 (High) — AP-71 — worker rules filed in the orchestrator-only `rules.workflow` bucket

`workflow.yaml` `rules.workflow` (lines 15-20) holds four directives whose actor is the WORKER, not the orchestrator: `WORKER PERMISSIONS` (23), `NO PERMISSION QUESTIONS` (24), `BLOCKER SURFACING` (25), `ARTIFACT VERIFICATION` (26) are already correctly in `rules.activity` — good — but `rules.workflow` still carries `LENS HANDOFF` (20, an orchestrator handoff — correct) alongside `OPERATIONAL DIRECTIVES` (19) which prescribes what workers "must follow without deferral" (worker-facing content in the orchestrator bucket). The TECHNIQUE.md `write-immediately` rule (line 52) now duplicates the substance of the activity `WORKER PERMISSIONS`/`NO PERMISSION QUESTIONS`/`ARTIFACT VERIFICATION`/`BLOCKER SURFACING` cluster.

**Note:** the four worker rules being present in `rules.activity` (workflow.yaml:22-26) is the AP-71-correct placement (this appears to have been the prism remediation named in the AP-71 catalog entry). The residual finding is (a) `OPERATIONAL DIRECTIVES` (19) mixes a worker directive into `rules.workflow`; split its worker half into `rules.activity` or fold into TECHNIQUE.md, and (b) cross-level duplication (AP-27) now exists between `rules.activity` and `techniques/TECHNIQUE.md#write-immediately` — pick one authoritative home. Since TECHNIQUE.md is inherited by every technique and reaches workers, the technique-rule is the durable home; the four `rules.activity` copies are then candidates to drop.

### M-1 (Medium) — AP-45 — redundant label+link inside the `goal-mapping-matrix`

`plan-analysis.md:163`: the entry `[scarcity](../resources/scarcity.md) → scarcity (08)` hyperlinks its goal key while all ~60 sibling entries use a bare goal phrase (`Hidden assumptions → claim (07)`). The link display text `scarcity` duplicates the RHS lens name `scarcity (08)`, and the inconsistency makes one entry look special without reason.

**Fix:** drop the hyperlink, restore a bare goal-phrase key consistent with siblings (e.g. `Resource exhaustion → scarcity (08)`), or if a goal noun genuinely collides with the lens name, use a distinct goal phrase. Keep the matrix homogeneous.

### M-2 (Medium) — AP-42 / AP-60(3) — `#### artifact_path` sub-field on `single-lens-analysis` output

`single-lens-analysis.md:67-69` declares a `#### artifact_path` sub-field ("Full filesystem path to the written artifact"). This is a path-flavored proxy for the artifact the `#### artifact` (`{lens_name}-analysis.md`, line 65) already names; `portfolio-analysis` models the same thing as `#### artifact_paths` (a path list) which is arguably also representation-flavored. Per AP-42, the canonical output is the artifact identity, not its `-path` representation; the runtime path is a `{$local}`/derived value, not a declared output sub-field.

**Fix:** drop `#### artifact_path`; the `#### artifact` filename plus `{output_path}` locate it. (Low-confidence — the sibling `structural-analysis` does NOT declare an artifact_path sub-field, so this is also a within-family inconsistency; align `single-lens-analysis` to `structural-analysis`.)

### M-3 (Medium) — AP-60 name collision — `lens_name` as both a workflow variable and a per-unit spec field / technique input

`lens_name` names three things: the workflow variable (workflow.yaml:50, "portfolio lens currently being written"), the per-unit `analysis_units[].lens_name` spec field (plan-analysis output, the single-mode lens slug), and the `single-lens-analysis` input (line 15). The workflow-variable description ("portfolio lens whose artifact is currently being written") is now stale — post-remediation `lens_name` is primarily the single-mode lens slug per unit, and portfolio uses `{$lens_name}` as a protocol-local in `portfolio-analysis.md:54`. The three uses are compatible in binding terms (unit field is read as `current_unit.lens_name`; the input binds from that), but the variable DESCRIPTION mis-states the concept.

**Fix:** rewrite the `lens_name` variable description to "the single lens slug selected for the current single-mode / full-prism unit" (drop the portfolio-only framing, since portfolio uses a protocol-local). No id change needed.

### L-1 (Low) — AP-36 / AP-66 style — evolution narration in README/resources prose

`resources/README.md:23` ("Resources 03-05 … have been removed"), `README.md:236` ("Indices 03–05 are deprecated (upstream general L12 variants removed). Index 49 (severity-rubric) has been removed."). Per the engineering doc-voice rule (describe the system as it is; no "removed"/"deprecated"/"no longer"), these narrate evolution in system documentation. A reader who never saw the old catalog should notice nothing missing.

**Fix:** state the catalog as it is (00–02 are the L12 pipeline for all target types; simply omit 03–05 and 49 rather than announcing their removal). This is a doc-voice cleanup, not a prism-schema issue.

### L-2 (Low) — AP-47 residue — delivery-mechanism narration in a protocol step

`single-lens-analysis.md:27` and `structural-analysis.md`/base still phrase lens loading with "from the prism workflow resources (the orchestrator provides the resource index; the worker loads …)". The parenthetical narrates the handoff mechanism (who provides the index) rather than the action. The `LENS HANDOFF` / `LENS LOADING` rules already own this. Per AP-47, keep the imperative action + canonical resource hyperlink; drop the mechanism narration.

**Fix:** trim to "Load the lens prompt for `{lens_name}` → [reachability](../resources/reachability.md) (example)"; the handoff is a rule, not per-step prose. Low priority — this pattern predates the remediation and is workflow-wide.

### L-3 (Low) — AP-61 residue — activity-position reference in `smart-analysis/select-mode.md`

`smart-analysis/select-mode.md:18` says "compose subsystem mode (the calibrator assigns …) and skip to Record Steps" and step 2 references routing "do not restrict to L12". "skip to Record Steps" references another step of the SAME technique's own protocol by name — acceptable as intra-protocol control-flow — but "compose subsystem mode" names a `pipeline_mode` value, fine. No hard AP-61 violation (the reference is to the technique's own protocol step, not an activity construct). Flagged as watch-only; no fix required.

---

## Convention Conformance Findings

- **File naming / numbering:** `single-lens-analysis.md` follows the standalone `techniques/<slug>.md` convention with proper frontmatter (`ontology`, `kind`, `version`, `order: 6`). Pass.
- **Step purity (AP-64):** all changed steps (`run-single-lens`, `run-structural`, `run-portfolio`, smart-pass steps) are `kind` + `id` + `technique` + `condition`/`required` structural fields only — NO `description`, NO `name`. Pass. `required: false` used correctly on optional smart steps (`fill-knowledge`, `run-dispute`).
- **Bound-step condition expressiveness:** the single-vs-L12 dispatch uses a structured `condition` (OR of ANDs), not prose. Pass.
- **Snake/kebab (AP-55):** all symbol ids snake (`lens_name`, `analytical_goal`, `analysis_units`); technique/resource names kebab. Pass.
- **Activity `techniques[]` disjointness (AP-69):** `01-structural-pass` lists only `scatter-gather` (a cross-cutting strategy technique no step binds) — disjoint from step bindings. Pass. `variable-binding` correctly hoisted to `workflow.techniques.activity` (AP-75). Pass.
- **No authored `artifacts[]` (AP-65):** no activity declares an `artifacts[]` block. Pass.

## Rule Enforcement Findings

The `rules.workflow` ALL-CAPS directives (ISOLATION MODEL, ORCHESTRATION MODEL, OUTPUT FORWARDING, MINIMAL INTERACTION) are text-only invariants. ISOLATION/ORCHESTRATION/OUTPUT-FORWARDING are genuinely un-mechanizable orchestration contracts (spawn-agent vs continue-agent is a worker-dispatch choice the engine cannot gate) — acceptable as text. MINIMAL INTERACTION is partially structural (the single `confirm-mode` checkpoint has `condition: pipeline_mode notExists`, so it self-skips when mode is provided — good enforcement). No new rule-enforcement debt introduced by the remediation.

## Tool-Technique-Doc Consistency Findings

- README "Techniques" table (lines 190-205) lists `single-lens-analysis` with an accurate capability line and the file-structure tree includes it (line 318). Doc parity: Pass.
- README Prompt Guide (line 104) and Modes table (line 114) correctly describe single mode routing a concern-specific goal to the matching single lens — consistent with the new `run-single-lens` branch. Pass.
- Reachability notes (README:106, resources/README:175/187) for writer/strategist/pipeline-internal lenses are internally consistent with the `code-vs-general` and `goal-mapping-matrix` rules. Pass.
- No raw tool names (AP-48) or `::op {}`-brace invocations (AP-53) introduced. gitnexus references use canonical hyperlinks. Pass.

---

## Recommended Fixes (prioritized)

1. **[High] H-1** Unify `analysis_focus`/`analytical_goal` to one canonical id (recommend `analytical_goal`); rename the workflow variable + `structural`/`single-lens`/base reads; delete the `run-portfolio` rename deviation; the `plan` step then binds cleanly. Closes the binding gap.
2. **[High] H-2** Resolve the `rules.workflow` vs `rules.activity` vs `TECHNIQUE.md` worker-rule placement: split `OPERATIONAL DIRECTIVES` worker half out of `rules.workflow`; pick one authoritative home for write-immediately/verification (TECHNIQUE.md) and drop the `rules.activity` duplicates (AP-27/AP-71).
3. **[Medium] M-1** De-hyperlink the `scarcity` entry in the goal-mapping-matrix; make the key a bare goal phrase like its 60 siblings.
4. **[Medium] M-2** Drop `#### artifact_path` from `single-lens-analysis` outputs to match `structural-analysis` and AP-42.
5. **[Medium] M-3** Rewrite the `lens_name` workflow-variable description (drop stale portfolio-only framing).
6. **[Low] L-1** Doc-voice cleanup in README/resources/README: state the catalog as-is, drop "removed"/"deprecated" evolution narration.
7. **[Low] L-2 / L-3** Optional AP-47 mechanism-narration trim on lens-load steps; watch-only AP-61 phrasing in smart-analysis.

## Review variables

- `review_findings_count` = **10** (2 High, 3 Medium, 3 Low, + 2 watch-only)
- `has_critical_finding` = **false**
- `needs_audit_fixes` = **true** (fixable findings exist; user disposition pending)
