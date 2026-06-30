# work-package — Design Assumptions Log

**Mode:** Update
**Target workflow:** `work-package`
**Change:** Insert a post-implementation `lean-coding-audit` activity (slot 09) that binds the standalone `ponytail` workflow's techniques cross-workflow.
**Source dimensions:** captured + confirmed in [03-requirements.md](03-requirements.md).

This log surfaces the implicit design decisions the requirements specification rests on, classifies each by category, then reconciles them: audit-resolvable assumptions are settled autonomously by the workflow-design audit passes (schema-validation / conformance / consistency / principles); genuine design judgements are left **Open** for judgement-augmentation interview.

---

## Reconciliation scorecard

```
Total: 10 | Validated: 5 | Invalidated: 0 | Partially Validated: 0 | Open: 0
Convergence iterations: 1 | Newly surfaced: 0
Interview outcomes: Accepted: 5 | Corrected: 0 | Deferred: 0
```

5 assumptions were settled autonomously by audit passes against the captured spec + the existing `work-package` / `ponytail` definitions. The remaining 5 genuine design judgements were presented for judgement-augmentation interview and each was **accepted** at its captured default — no corrections, none deferred. All 10 assumptions are now resolved.

---

## Resolved by reconciliation (audit-settled — not presented for re-confirmation)

### A-WD-01: Slot-09 insertion + downstream renumber is schema-valid
**Status:** Validated
**Resolvability:** Audit-resolvable (audit-schema-validation + audit-consistency)
**Category:** Schema Construct Choice
**Assumption:** Inserting `lean-coding-audit` at slot 09 and shifting `post-impl-review`→10 … `codebase-comprehension`→15 produces a well-formed activity graph: every transition target resolves, no orphaned/dangling edges, and the inbound (`implement`→`lean-coding-audit`) / outbound (`lean-coding-audit`→`post-impl-review`) rewire is consistent.
**Evidence:** The transition wiring in 03-requirements §2.3 is a single-edge redirect plus one new node; `implement`'s existing outbound edge is repointed and the new activity's default edge takes `implement`'s former target. This is structurally identical to existing linear pipeline transitions in `work-package`. No fan-in/fan-out change.
**Risk if wrong:** A broken transition would strand the pipeline after `implement`; settled structurally, so low residual risk.

### A-WD-02: Reusing the ponytail techniques' native artifact names is convention-conformant
**Status:** Validated
**Resolvability:** Audit-resolvable (audit-conformance)
**Category:** Technique Selection
**Assumption:** Landing the ponytail techniques' own declared `#### artifact` outputs (`review-findings.md`, `debt-ledger.md`) under the work-package planning folder — server-prefixed for slot 09 — is the generic-not-overfit, convention-conformant default, versus inventing new work-package-local artifact names.
**Evidence:** The `generic-not-overfit` and cross-workflow-reuse conventions hold that a bound technique owns its artifact name; the consumer reuses it rather than renaming at the call site. 03-requirements §4.2 records this as the grounded default. (Whether to *consolidate* the two files is a separate design judgement — see A-WD-08, Open.)
**Risk if wrong:** Overfitting the names would erode cross-workflow reuse; settled by convention.

### A-WD-03: `simplification-apply-cycle` mirroring `review-fix-cycle` is convention-conformant
**Status:** Validated
**Resolvability:** Audit-resolvable (audit-conformance)
**Category:** Checkpoint Necessity
**Assumption:** Modelling the bounded apply loop as a `doWhile` with `maxIterations: 3`, gated on a `needs_simplification` flag set by the primary checkpoint, mirrors `post-impl-review`'s established `review-fix-cycle` and is the conformant loop shape.
**Evidence:** 03-requirements §3.2 explicitly mirrors the existing `post-impl-review` (09) `review-fix-cycle`; same loopType, same bound, same flag-driven gating. Reuses an in-library pattern rather than introducing a new loop idiom.
**Risk if wrong:** A divergent loop shape would be a conformance smell; settled against the existing pattern.

### A-WD-04: Cross-workflow `ponytail::` technique references resolve and are consistent
**Status:** Validated
**Resolvability:** Audit-resolvable (audit-consistency)
**Category:** Technique Selection
**Assumption:** The cross-workflow refs the new activity binds — `ponytail::review-over-engineering`, `ponytail::harvest-debt`, `ponytail::report-gain` — resolve to existing ponytail operations whose declared outputs (`review_findings`, `debt_ledger`, gain scoreboard) match what the activity consumes.
**Evidence:** 03-requirements §4.1 names each bound technique and its declared output; the artifact table maps each output to its consuming artifact. References use the qualified `<workflow>::<op>` form required for foreign-group operations. The repo-wide `audit-repo` op is deliberately NOT bound (§4.3), keeping the stage change-scoped.
**Risk if wrong:** A dangling technique ref would fail binding; settled by consistency audit against ponytail's declared ops.

### A-WD-05: The three structural rules have valid structural backing (principles-conformant)
**Status:** Validated
**Resolvability:** Audit-resolvable (audit-principles)
**Category:** Rule Scope
**Assumption:** Classifying `safety-floor-never-simplified`, `report-before-apply`, and `audit-after-implement-before-review` as **structural** (backed respectively by a validate/condition guard + `safety_floor_cleared` gate; the blocking `audit-findings-confirmed` checkpoint preceding the loop; and the activity-graph transition order) honours the "encode critical constraints as structure, not just text" design principle — while `leanness-reported-honestly` and `complementary-not-duplicative-with-strategic-review` are correctly left guidance-only as they cannot be mechanically violated.
**Evidence:** 03-requirements §5 classification summary maps each structural rule to a concrete checkpoint / condition / transition; the two guidance norms have no mechanical violation surface. Matches the activity rule "Encode critical constraints as structure, not just text — back rules with checkpoints, conditions, and validate actions."
**Risk if wrong:** Under-backed critical constraint; settled by principles audit against the rule-classification.

---

## Resolved by interview — genuine design judgements (judgement-augmentation outcomes)

> Reconciliation could not settle these via any audit: they are choices about ordering, policy, default option, artifact shape, and persistence convention. Each was presented to the user for judgement-augmentation; the user **accepted** each at its captured default. Decisions recorded below.

### A-WD-06: Insertion point — slot 09 (before `post-impl-review`) vs after it / after `validate`
**Status:** Resolved — Accepted (default)
**Decision:** Slot 09, immediately after `implement` (08) and before `post-impl-review`. Downstream renumbers: post-impl-review→10, validate→11, strategic-review→12, submit-for-review→13, complete→14, codebase-comprehension→15.
**Decided by:** User (orchestrator-delegated), 2026-06-30.
**Prior status:** Open
**Resolvability:** Not audit-resolvable — genuine design judgement (activity ordering)
**Category:** Activity Boundaries
**Assumption:** The lean-coding audit belongs at slot 09, immediately after `implement` and **before** `post-impl-review`, so the leaned diff is what downstream code-quality review reasons about and the scoreboard + debt ledger are available as inputs to those later reviews.
**Decision space:** (a) slot 09, before `post-impl-review` (current default); (b) after `post-impl-review`, before `validate`; (c) after `validate`, adjacent to `strategic-review`.
**Why no audit settles it:** Every placement is schema-valid (A-WD-01 confirms wiring works at any slot). The choice is about *what state the diff is in* when each stage sees it — a design judgement, not a well-formedness question.
**What would resolve it:** The user's intent for whether downstream review should see the pre- or post-lean diff.
**Reversibility:** Path-committing — re-ordering later forces re-numbering of every downstream artifact prefix and re-wiring multiple transitions; high fan-out across the pipeline tail.

### A-WD-07: Run policy — `required: true` (every work package) vs gated / opt-in
**Status:** Resolved — Accepted (default)
**Decision:** `required: true` — the stage runs automatically on every work package; no diff-size gate or opt-in flag.
**Decided by:** User (orchestrator-delegated), 2026-06-30.
**Prior status:** Open
**Resolvability:** Not audit-resolvable — genuine design judgement (run-always vs conditional)
**Category:** Activity Boundaries
**Assumption:** The stage is `required: true` and runs automatically for every work package, not conditionally (e.g. only when the diff exceeds a size threshold) or on opt-in.
**Decision space:** (a) always-run / `required: true` (current default); (b) conditional on a gate variable (diff size, file count, an opt-in flag); (c) opt-in only.
**Why no audit settles it:** Both required and conditional activities are schema-valid and convention-conformant. Whether leanness review is worth a mandatory pipeline stage for trivial changes is a policy judgement.
**Reversibility:** Easily-reversible — flipping `required` or adding a `when` gate is a localized edit to one activity node.

### A-WD-08: Artifact shape — two native files vs one consolidated `lean-coding-audit.md`
**Status:** Resolved — Accepted (default)
**Decision:** Two native files — `review-findings.md` + `debt-ledger.md` — each server-prefixed for slot 09, reusing the ponytail techniques' own declared outputs. NOT consolidated into a single `lean-coding-audit.md`.
**Decided by:** User (orchestrator-delegated), 2026-06-30.
**Prior status:** Open
**Resolvability:** Not audit-resolvable — genuine design judgement (artifact granularity)
**Category:** Schema Construct Choice
**Assumption:** Keep the ponytail techniques' two native artifacts separate (`review-findings.md` + `debt-ledger.md`, each slot-09-prefixed) rather than folding both into a single `lean-coding-audit.md` activity artifact.
**Decision space:** (a) two separate files, technique-native names (current default — preserves generic-not-overfit reuse per A-WD-02); (b) one consolidated `lean-coding-audit.md` holding findings + scoreboard + ledger + safety-floor record.
**Why no audit settles it:** Both are convention-valid (A-WD-02 confirms either naming conforms). 03-requirements §4.2 explicitly flags consolidation as a noted alternative. The trade-off is reuse-fidelity (two files) vs one-artifact-per-activity tidiness (consolidated) — a judgement.
**Reversibility:** Easily-reversible — artifact naming is a technique-output remap, changeable without touching transitions.

### A-WD-09: Primary gate mode — blocking always vs auto-advancing on net-negative + no floor risk
**Status:** Resolved — Accepted (default)
**Decision:** The primary `audit-findings-confirmed` checkpoint is **blocking** on every pass (mirrors `post-impl-review`). The non-blocking auto-advance variant is NOT adopted.
**Decided by:** User (orchestrator-delegated), 2026-06-30.
**Prior status:** Open
**Resolvability:** Not audit-resolvable — genuine design judgement (checkpoint blocking policy / default option)
**Category:** Checkpoint Necessity
**Assumption:** The `audit-findings-confirmed` gate is **blocking** with no auto-advance, on every pass — consistent with "a reviewed, recorded gate." The noted non-blocking variant (auto-accept after Ns when the scoreboard is net-negative and the safety floor is clear) is NOT the default.
**Decision space:** (a) always blocking (current default); (b) non-blocking auto-advance when net-negative lines + `safety_floor_cleared`, blocking otherwise.
**Why no audit settles it:** Both blocking and auto-advancing checkpoints are schema-valid; `post-impl-review`'s gate is blocking, but a "clean lean result needs no human gate" argument is reasonable. Whether the recorded-gate value justifies always blocking is a judgement.
**Reversibility:** Easily-reversible — adding `blocking: false` + `autoAdvanceMs` + a `when` condition to the checkpoint is a localized edit.

### A-WD-10: Debt-ledger persistence — planning-folder artifact vs repo-local `PONYTAIL-DEBT.md`
**Status:** Resolved — Accepted (default)
**Decision:** Per-work-package planning-folder artifact — `debt-ledger.md` under `planning_folder_path`. NOT a repo-local `PONYTAIL-DEBT.md`.
**Decided by:** User (orchestrator-delegated), 2026-06-30.
**Prior status:** Open
**Resolvability:** Not audit-resolvable — genuine design judgement (persistence convention)
**Category:** Variable State
**Assumption:** The harvested debt ledger lives as a planning-folder artifact (`debt-ledger.md` under `planning_folder_path`), the workflow's artifact form of ponytail's optional persisted repo-local `PONYTAIL-DEBT.md` — NOT written into the target repo.
**Decision space:** (a) planning-folder artifact only (current default); (b) also/instead persist a repo-local `PONYTAIL-DEBT.md` so the ledger travels with the code; (c) both — planning artifact for this package + repo-local for longevity.
**Why no audit settles it:** Both locations are convention-valid; the artifact-location rule mandates planning-folder placement for *planning* artifacts, but whether the debt ledger should ALSO live in the repo (where future contributors see it without the planning folder) is an operational/convention judgement outside the schema.
**Reversibility:** Path-committing-ish — once contributors rely on a repo-local ledger, removing it breaks an external expectation; adding it later is cheaper than removing it.

---

## Decision summary (interview loop drained)

All 10 assumptions are resolved. The 5 audit-settled assumptions (A-WD-01..A-WD-05) were validated during reconciliation; the 5 design judgements (A-WD-06..A-WD-10) were each **accepted at their captured default** through the judgement-augmentation interview. No assumption was corrected; none was deferred.

| ID | Category | Resolution | Outcome |
|----|----------|------------|---------|
| A-WD-01 | Schema Construct Choice | Audit (validation + consistency) | Validated |
| A-WD-02 | Technique Selection | Audit (conformance) | Validated |
| A-WD-03 | Checkpoint Necessity | Audit (conformance) | Validated |
| A-WD-04 | Technique Selection | Audit (consistency) | Validated |
| A-WD-05 | Rule Scope | Audit (principles) | Validated |
| A-WD-06 | Activity Boundaries | Interview | Accepted — slot 09, before `post-impl-review` |
| A-WD-07 | Activity Boundaries | Interview | Accepted — `required: true` |
| A-WD-08 | Schema Construct Choice | Interview | Accepted — two native files |
| A-WD-09 | Checkpoint Necessity | Interview | Accepted — blocking gate |
| A-WD-10 | Variable State | Interview | Accepted — planning-folder artifact |

**Gates:** `has_open_assumptions = false` · `has_deferred_assumptions = false` · `requirements_confirmed = true`.
