# Impact Analysis — Requirements-Refinement Canon Conformance

**Workflow:** `requirements-refinement` v1.1.0
**Mode:** Update
**Date:** 2026-07-27
**Change source:** [design specification](03-design-specification.md)
**Baseline:** [structural inventory](01-structural-inventory.md)

---

## Summary

Conformance-only edit reaching 15 of 21 files: gate and message shapes, technique I/O contracts, and the correction-cycle wiring. Activity membership, ids, and the transition graph are untouched, so topology is intact — the one routing defect sits inside an existing arm rather than in a missing or dangling edge. Variable integrity fails: 4 of 14 declared variables have no structural reader, and removing two of them strands the sole effect on a gate option that G2 requires to carry one.

**removal_count:** 15

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `workflow.yaml` | G5 drops `max_correction_iterations`; three further variable removals pend A-3; G7 version bump |
| `activities/01-intake-and-analyze.yaml` | G2 both gates become linked statements with effect-bearing options; G3 the sole arm stops carrying a condition and `isDefault` together; G4 two announcements |
| `activities/03-update-specification.yaml` | G4 the announcement names and links `03-working-spec-{correction_iteration}.md` |
| `activities/04-validate-specification.yaml` | G4 gains the missing announcement for the validation report; its `correction_iteration < 3` literal becomes the cap's sole home |
| `activities/05-finalize-specification.yaml` | G2 gate becomes a linked statement; `revise` gains a destination or is withdrawn (A-7); G4 announcement |
| `activities/06-report-failure.yaml` | G2 single-option gate resolved per A-5; G4 announcement |
| `techniques/TECHNIQUE.md` | G5 drops the shared `max_correction_iterations` input |
| `techniques/intake-sources.md` | G6 declares the inputs its Protocol reads; A-8 exposes an artifact path |
| `techniques/analyze-source.md` | A-8 exposes an artifact path |
| `techniques/update-specification.md` | G1 declares the counter as an output; G6 moves loop bookkeeping out of Protocol and adds `## Rules`; A-8 path |
| `techniques/validate-specification.md` | G6 the four Outputs descriptions state meaning rather than restating Protocol 5; A-8 path |
| `techniques/finalize-specification.md` | G6 drops the presentation step; A-8 exposes two artifact paths |
| `techniques/report-failure.md` | G6 drops the presentation step; G5 drops the removed-variable read; A-8 path |
| `README.md` | G7 the `max_correction_iterations` bound, the `workflow.yaml` artifact-location claim, and the version banner |
| `techniques/README.md` | G7 the inherited-input list names the removed variable |

### Possibly touched (draft-time)

| File | Why |
|------|-----|
| `activities/README.md` | Its Produces column names bare filenames; touch only if G4's prefixed naming makes that column read as the user-visible name |

### Unaffected (summary)

Five files — the four resource templates (`specification-protocol`, `requirements-analysis-report`, `validation-rubric`, `change-summary`) and `resources/README.md`. Rubric criteria are out of scope and no change goal reaches template content.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions / `initialActivity` / reachability | Pass — no activity is added, removed, or reordered; `initialActivity` and all 5 `transitions[].to` resolve; every activity has an incoming edge; `05` and `06` terminate by omitting the block (A-10). Defect inside an arm: `01`'s sole transition carries both a `condition` and `isDefault: true`, so its `revise` option cannot hold the route |
| Technique / resource references | Pass — the 6 step `technique:` ids resolve to the 6 leaf files; `techniques.activity: [variable-binding]` resolves to `workflows/meta/techniques/variable-binding.md`; all 4 resource files and all 6 `#section` anchors resolve |
| Variables / `setVariable` / step conditions | Fail — `max_correction_iterations`, `sources_confirmed`, `finalization_confirmed`, and `source_coverage_complete` have no structural reader (4 of 14). All 3 `setVariable` keys resolve, but 2 target variables slated for removal, stranding the sole effect on `01`'s `confirmed` and `05`'s `accepted`. No step-level `condition` / `when` and no `kind: loop` steps exist |

---

## 3. Removals inventory

Rows 1–9 follow from the specification's goals. Rows 10–15 are candidates whose approval belongs to the Gate 2 batch ([assumptions log](03-assumptions-log.md)); none is applied here.

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `workflow.yaml:72-75` | `max_correction_iterations` declaration | The cap itself, as the `correction_iteration < 3` literal in `04`'s transition — its only enforceable home (A-1) |
| 2 | `techniques/TECHNIQUE.md:32-38` | The shared `max_correction_iterations` input and its default | The `correction_iteration` input and its `0` default |
| 3 | `techniques/report-failure.md:30` | The `of {max_correction_iterations}` phrase | The recorded attempt count `{correction_iteration}` and the full critical-issue record |
| 4 | `techniques/README.md:7` | `max_correction_iterations` from the inherited-input list | The other four names and the sentence around them |
| 5 | `README.md:58` | The variable reference in the bounded-loop sentence | The bounded-loop statement, with the cap stated as its literal value |
| 6 | `README.md:64` | The artifact-location clause — `workflow.yaml` declares none | The rest of the Structure bullet; artifacts stay declared on technique outputs |
| 7 | `techniques/finalize-specification.md:48-50` | Protocol 3 "Present for Promotion" | The `promotion-is-the-users-action` rule states the same invariant, and `05`'s gate owns the presentation |
| 8 | `techniques/report-failure.md:40-42` | Protocol 4 "Present Failure Report" | The `promotion-withheld-on-failure` rule, and `06`'s gate owns the presentation |
| 9 | `techniques/update-specification.md:36-38` | Protocol 1 "Register Correction Pass" prose increment | The increment itself, re-expressed as a declared `correction_iteration` output (A-2) |
| 10 | `workflow.yaml:48-51` | `sources_confirmed` declaration — A-3 | The `sources-confirmed` gate; its `confirmed` option needs a replacement effect or G2 restrands it |
| 11 | `workflow.yaml:76-79` | `finalization_confirmed` declaration — A-3 | The `finalization-confirmed` gate; its `accepted` option needs a replacement effect on the same terms |
| 12 | `workflow.yaml:80-83` | `source_coverage_complete` declaration — extends A-3 beyond its original three | `validate-specification`'s coverage derivation, the same-named technique output feeding `validation_passed`, and workflow activity rule 5 |
| 13 | `activities/01-intake-and-analyze.yaml:49-54` | Either the `condition` block or `isDefault: true` — G3, with the shape set by A-7 | The arm to `update-specification`; exactly one of the two constructs stays |
| 14 | `activities/01-intake-and-analyze.yaml:24-26` and `activities/05-finalize-specification.yaml:24-26` | The two `revise` options, only where no destination is expressible — A-7 | Both gates and their approving options; A-7's self-back-edge alternative keeps the options and gives each an effect |
| 15 | `activities/06-report-failure.yaml:13-20` | The `failure-acknowledged` checkpoint, only under A-5's plain-announcement alternative | The failure-report announcement and both activity outcomes |

---

## Decision ask

Confirm the impact scope and that rows 1–9 are intentional, with rows 10–15 carried to Gate 2 — or revise the scope, or preserve flagged content.
