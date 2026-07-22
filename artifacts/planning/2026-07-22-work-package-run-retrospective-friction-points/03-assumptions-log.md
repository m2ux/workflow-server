# Design Assumptions Log

**Workflow:** work-package (primary) · meta / ponytail (coupled)
**Mode:** Update
**Created:** 2026-07-22
**Last Updated:** 2026-07-22 (requirements-refinement — #271 review-mode pass; supersedes this file's #272-era rows)

---

## Summary

| Category | Surfaced | Audit-resolved | Confirmed | Corrected | Deferred |
|----------|----------|----------------|-----------|-----------|----------|
| Activity Boundaries | 2 | 0 | 0 | 0 | 0 |
| Checkpoint Necessity | 0 | 0 | 0 | 0 | 0 |
| Technique Selection | 2 | 2 | 0 | 0 | 0 |
| Rule Scope | 2 | 2 | 0 | 0 | 0 |
| Variable State | 2 | 1 | 0 | 0 | 0 |
| Schema Construct Choice | 0 | 0 | 0 | 0 | 0 |
| **Total** | **8** | **5** | **0** | **0** | **0** |

Three open judgements (A-2, A-3, A-5) batch into Gate 2. Five audit-settled (A-1, A-4, A-6, A-7, A-8), each validated against the current committed tip rather than left as a mid-flow interview.

---

## Log

| ID | Category | Risk | Resolvability | Assumption | Rationale | Outcome | Changes |
|----|----------|------|---------------|------------|-----------|---------|---------|
| A-1 | Technique Selection | M | audit | Fixing #271 item 3 (`get_resource` miss on `review-taxonomy` / `the-ladder` / `ponytail-marker-convention`) means qualifying the cross-workflow id at the ponytail technique markdown link sites (or a meta dispatch-time rule), not adding a new loader mechanism. | `ponytail/resources/README.md` already documents the correct form (`get_resource({ resource_id: "ponytail/the-ladder" })`, `#section` narrows further); `work-package/activities/09-lean-coding-audit.yaml` already qualifies its *technique* binds (`ponytail/review-over-engineering`, `ponytail/harvest-debt`, `ponytail/report-gain`) but the ponytail technique files' own resource links (`../resources/review-taxonomy.md#tags`) are bare relative paths, not `ponytail/`-qualified — the pattern to align to already exists in the same directory. | ✅ Validated — align resource links to the already-documented `ponytail/<id>` form; no new mechanism needed. | Spec Artifacts / Activity list |
| A-2 | Variable State | H | open | Bag-mirroring resilience (#271 items 7–11) is fixed by an explicit reconcile step in `dispatch-activity` / `commit-and-persist` (envelope-and-planning-folder governs over a stale `inspect_session` read), not by a server-side persistence fix, which is out of this workflow-design pass's reach. | Reproduced live in this very session: `inspect_session { view: variables }` returned `structural_inventory_path: ""`, `format_literacy_confirmed: false`, `target_path: ""` immediately after `intake-and-context` completed and after the orchestrator's own dispatch prompt supplied the correct populated values — the same class of staleness #271 items 7–10 describe, and the same coping pattern #272's own retrospective already named ("path reconstruction from planning folder") but never made structural. Decision space: (1) reconcile step in `dispatch-activity`/`commit-and-persist` (assumed); (2) accept as a known limitation and only document it; (3) defer entirely to a server-side fix (`src/`) outside this pass's boundary. | Open — batched to Gate 2 | — |
| A-3 | Activity Boundaries | M | open | `conduct-retrospective::retrospective`'s review-mode fit (#271 item 15) is fixed by making the technique write its own minimal review-mode close-out section (instead of requiring a pre-existing `COMPLETE.md`) and by scoping "Update Status" to this work package's own PR — not by removing the retrospective step from review mode entirely. | `work-package/activities/14-complete.yaml` already gates `create-complete-doc` on `is_review_mode != true`, but `conduct-retrospective::retrospective`'s Protocol still writes `## Workflow Retrospective` as an update-in-place section of `COMPLETE.md` unconditionally, and its "Update Status" step ("Once the PR identified by `{pr_number}` has merged...") assumes an authored PR under this work package's control — exactly the manufactured-`14-COMPLETE.md` friction #271 item 15 describes, still present on current tip. Decision space: (1) review-mode-native minimal close-out section (assumed); (2) skip the retrospective's `COMPLETE.md` coupling entirely in review mode and rely on the review-mode `README.md` / consolidated review as the close-out record; (3) always pre-create a stub `COMPLETE.md` ahead of the retrospective step regardless of mode. | Open — batched to Gate 2 | — |
| A-4 | Variable State | M | audit | `verify-outcomes` needs a review-mode-aware outcome set (#271 item 16) expressed the same way other mode-conditioned constructs already are in this workflow (`is_review_mode`-gated steps/checkpoints/transitions), not a new schema construct. | `work-package/workflow.yaml` carries no root-level `outcome:` array (per AP-66, outcomes are stated per-activity); `work-package/activities/14-complete.yaml`'s own `outcome:` list ("key design decision is durably recorded", "project documentation reflects the delivered change") is unconditional prose even though the steps that produce those outcomes (`create-adr`, `ensure-docs`) are already `is_review_mode != true`-gated — so `verify-outcomes` would report them as unmet gaps in review mode though correctly skipped. Precedent for a mode-aware fix already exists throughout the workflow (every other #271-item-15/16-adjacent construct is `is_review_mode`-conditioned); exact outcome-list wording is a drafting detail, not a stakeholder judgement. | ✅ Validated — mirror the existing `is_review_mode`-conditioning convention on the affected `outcome:` entries / `target_workflow_outcomes` derivation. | Spec Activity list / Artifacts |
| A-5 | Technique Selection | M | open | Discovery disambiguation (#271 item 19) is fixed by a combination of catalog-tag adjustment and `match-target-workflow` scoring guidance, not by scoring logic alone. | `midnight-system-review/workflow.yaml` carries tags `[review, merge-readiness, evidence-driven]`; `work-package/workflow.yaml` carries `[implementation, engineering, planning]` — no disambiguating tag at all for "review an existing PR/implementation" requests, confirming item 19 is still live on current tip. `match-target-workflow.md`'s Protocol is generic ("Score each catalog entry... by title, description keywords, and tags") with no tie-breaker for a request naming a specific actionable PR vs a broad audit ask. Decision space: (1) add a `review` tag to `work-package` (risks flipping ambiguity the other way for genuine merge-readiness-audit requests); (2) add scoring guidance in `match-target-workflow.md` that favors an actionable-target signal (a parseable PR/issue reference) over tag overlap; (3) both. | Open — batched to Gate 2 | — |
| A-6 | Rule Scope | L | audit | Checkpoint-capability verification (#271 item 25) is a discipline addition to the existing `present-checkpoint-to-user` / `respond-checkpoint` call flow, not a new construct — consistent with the existing `present-before-any-resolution` discipline these techniques already carry for a different concern (never fabricating an `option_id`). | `checkpoint-discipline-explicit-user-decision` already establishes the precedent (never fabricate a resolution without presenting first); extending the same presentation-layer source-of-truth stance to `defaultOption` / `autoAdvanceMs` claims is the same class of fix, not a new mechanism. | ✅ Validated — extend the existing verify-before-resolve discipline to auto-advance capability claims. | Spec Activity list / Rules |
| A-7 | Rule Scope | L | audit | Commit-rule scoping (#271 item 27) is a one-line documentation cross-reference, not a rule redesign. | `commit-after-activity` (`meta/techniques/workflow-engine/commit-and-persist.md`) is already scoped explicitly to the orchestrator's post-activity hook ("After every completed activity... MUST be committed and pushed before evaluating transitions"); `explicit-commit` (`meta/techniques/version-control/TECHNIQUE.md`) is already scoped explicitly to ad-hoc action ("NEVER commit changes unless the user explicitly asks"). The two rules do not in fact overlap in scope on current tip — the residual gap is that neither cross-references the other, so a reader has to infer the non-overlap rather than see it stated. | ✅ Validated — add a one-line mutual cross-reference; no rule-text change beyond that. | Spec Artifacts |
| A-8 | Variable State | L | audit | #271 item 18 (`workflow_completed` fired before `complete`'s own steps ran) has no workflow-content fix available this pass — `client_workflow_completed` is never set `true` by any workflow YAML `setVariable` effect (only ever set `false`, in `end-workflow`'s `return` option), so the premature-completion signal item 18 describes is emitted by the session-status layer itself, not by a workflow construct this pass can edit. | Confirmed by inspection: `client_workflow_completed` (meta/workflow.yaml) has no producing `setVariable` anywhere in the workflow tree. Item 18 itself characterizes the effect as "harmless but had to be caveated" — low severity. | ✅ Validated — no in-scope fix; recorded for a separate engineering ticket, not this pass's change goals. | Spec Purpose (Out of scope) |

---

## Open Assumptions

### A-2: Bag-mirroring reconciliation mechanism
**Assumption:** Fix #271 items 7–11 with an explicit reconcile step in `dispatch-activity` / `commit-and-persist` — the worker's `activity_complete` envelope (and, when still uncertain, planning-folder evidence) governs over a disagreeing `inspect_session` read, with the discrepancy logged.  
**Decision space:** (1) reconcile step in `dispatch-activity`/`commit-and-persist` (assumed); (2) document as a known limitation only, no structural change; (3) defer entirely to a server-side (`src/`) fix, out of this pass's boundary.
**Evidence:** Reproduced live in this session — see Log row A-2.

### A-3: Review-mode retrospective / close-out shape
**Assumption:** `conduct-retrospective::retrospective` gains a review-mode-native minimal close-out section (not requiring a pre-existing `COMPLETE.md`), and its "Update Status" step scopes to this work package's own PR, never the audited third-party PR.  
**Decision space:** (1) review-mode-native minimal close-out section (assumed); (2) drop the `COMPLETE.md` coupling entirely in review mode, relying on the review-mode README / consolidated review as the close-out record; (3) always pre-create a stub `COMPLETE.md` ahead of the retrospective step regardless of mode.
**Evidence:** See Log row A-3.

### A-5: Discovery disambiguation approach
**Assumption:** Combine a catalog-tag adjustment on `work-package` with scoring guidance in `match-target-workflow.md` that favors an actionable-target signal (parseable PR/issue reference) over tag overlap alone.  
**Decision space:** (1) tag-only; (2) scoring-guidance-only; (3) both (assumed) — risk of tag-only is flipping ambiguity toward `work-package` for requests that are genuinely a broad merge-readiness audit rather than a PR-specific review.
**Evidence:** See Log row A-5.

---

## Deferred / Out-of-Scope Register (for later activities)

Not this activity's artifact to finalize (see [design-specification.md](03-design-specification.md) Purpose → Out of scope for the full classification and citations); recorded here so scope-manifest / follow-ups can pick them up without re-deriving:

- **Already delivered, no redraft:** items 14, 21, 26.
- **Server/tool-layer (`src/`), not workflow content:** items 1, 2, 4, 5, 6.
- **Environment/harness context, not workflow-server-owned:** items 20, 22, 23, 24.
- **Owned by #270:** items 12, 13, 17.
- **Recorded for completeness, no separate action:** item 28.
