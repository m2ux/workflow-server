# Workflow Design: workflow-server (epic #189 cluster 1) — Complete

> Update · 2026-07-10

## Summary

Cluster 1 of epic [m2ux/workflow-server#189](https://github.com/m2ux/workflow-server/issues/189) began as a "guidance & docs" cluster — adopt `bundleTechniques` on a handful of high-traffic activities plus fix post-#166 doc drift — and, through iterative design refinement with the user, became a **breaking server behaviour change**: automatic, per-agent context-derived eager technique bundling. `context_tokens` is now a REQUIRED parameter on `get_activity`, the server derives a cumulative per-activity eager-delivery budget from it, and the two unchanged-marker dialects are unified into one wire shape. Delivered as two DRAFT PRs — server [#208](https://github.com/m2ux/workflow-server/pull/208) (BREAKING, v2.0.0) and workflows [#207](https://github.com/m2ux/workflow-server/pull/207).

## What Was Delivered

This is an update to the workflow-server codebase itself (server source, docs, schemas, tests/harness, and two `meta` corpus resources) — not a new or restructured workflow. No `workflow-design` activities, checkpoints, techniques, or variables were added or changed (RR-5).

- **Server source (modified):** `src/utils/session/params.ts` (new reusable `contextTokensParam` zod spread), `src/config.ts` (`SERVER_VERSION` 1.0.0 → 2.0.0; `bundleHeadroomFraction` 0.80 + `bundleCharsPerToken` 4 env-overridable constants), `src/tools/workflow-tools.ts` (`context_tokens` wiring + cumulative eager-budget derivation + stop-and-break inlining), `src/tools/resource-tools.ts` + `src/utils/delivery.ts` (unified `{ delivery: "unchanged", content_hash }` marker factory, shared `technique:<id>` ledger key preserved), `src/schema/activity.schema.ts` (`maxChars` relaxed `.positive()` → `.nonnegative()`, `0` opt-out; describe/comment reword).
- **Tests / harness (modified):** `tests/reference-delivery.test.ts`, `tests/hybrid-bundling.test.ts`, `tests/mcp-server.test.ts`, `tests/config.test.ts`, `tests/e2e/walker.ts`, `scripts/smoke/smoke-orchestrator.ts`, `scripts/smoke/worker-brief.md` — `context_tokens` added to every `get_activity` call site; unified-marker assertions; new missing-param → validation-error cases; the "no opt-in → no bundling" assertion inverted for corpus-wide auto-bundling.
- **Docs (modified):** `docs/api-reference.md` (required `context_tokens` + derived budget; Enforcement-Boundary reclassification of variable `defaultValue`/`type`; unified marker), `docs/ide-setup.md` (`context_mode: "persistent"` + canonical `agent_id` guidance; required `context_tokens`), `schemas/README.md` (two stale activity `artifacts` rows removed).
- **Meta resources (modified, PR #207):** `workflows/meta/resources/activity-worker-prompt.md` (carve inlined `step_techniques` out of the progressive-disclosure mandate; `▶ step <id>` begin-beat; resources never inlined), `workflows/meta/resources/bootstrap-protocol.md` (canonical `agent_id` steer for solo/persistent mode; `get_workflow` unchanged w.r.t. `context_tokens`).
- **Regenerated:** `schemas/activity.schema.json`, `schemas/workflow.schema.json`, `site/api/tools.html`.

## Design Decisions

Canonically recorded in the [assumptions log](03-assumptions-log.md) (RR-1 through RR-5) and the planning [README](README.md) Design Decisions section. Recorded here only because it was settled during drafting (at the `scope-and-structure-confirmed` / `preservation-confirmed` checkpoints) and nowhere else:

- **Context:** The user flagged that the ACT of a worker calling `get_technique` per step is itself semantically meaningful — it enforces deliberate, one-at-a-time intentional stepping. Eager bundling threatened to erase that semantic.
- **Decision:** Preserve intentional-stepping semantics inside the bundle via three mechanisms: (1) each inlined `step_techniques` entry leads with a `▼ STEP <step_id> · technique <name>` arrival marker; (2) the worker prompt prescribes deliberate in-order engagement and an emitted `▶ step <step_id>` begin-beat per bundled step; (3) that emitted beat doubles as the observability substitute for the per-step fetch event (no server ping per bundled step; delivery-time `technique_bundled` events record coverage).
- **Rationale:** Bundling saves round-trips without collapsing the sequential discipline that per-step fetching used to guarantee.
- **Alternatives rejected:** (a) per-activity `bundleTechniques` opt-in — rejected because it had ZERO corpus adoption (RR-1); (b) documenting the two marker dialects rather than unifying them — rejected as leaving avoidable wire-shape divergence (RR-2); (c) session-level `context_tokens` on `start_session`/`dispatch_child` — rejected because a shared session serves differently-sized agents, so a stored budget mis-sizes all but one.

## Scope Outcome

All manifest items delivered ([scope-and-draft](06-scope-and-draft.md) §A–D). No drift: every committed file maps to a manifest item or an As-Built-recorded justified addition (`tests/config.test.ts` added for the new config constants; `fetch-observability.test.ts` correctly untouched — no `get_activity` calls). The intake framing (docs-only) was deliberately superseded during requirements refinement into a server behaviour change, with user approval to pull the real server work forward from the epic's cluster 3.

## Known Limitations & Deferrals

<!-- Canonical home. Other artifacts link here; do not duplicate this list elsewhere. -->
- **Resources stay lazy (deferred to C2).** Bundling inlines step TECHNIQUE bodies only; inlined entries keep their `resources[]` refs and the worker still calls `get_resource` on demand. The budget measures technique body size, not resolved resource content. Shared-resource inlining / block-level dedup is deferred to the C2 block-level-ledger cluster.
- **Tuning constants unvalidated in production.** `bundleHeadroomFraction` (0.80) and `bundleCharsPerToken` (4) are informed defaults, not empirically tuned. They are env-overridable `ServerConfig` fields; future tuning against real delivery telemetry is a follow-up, not a blocker.
- **Parent-repo submodule-pointer bump outstanding.** After PR #207 merges to the `workflows` branch, the parent repo's `workflows` gitlink must be advanced to the merged tip in a separate `chore(workflows): bump submodule pointer` commit on `main`. Gated on #207 merge; NOT part of the initial pushes.
- **Both PRs remain DRAFT.** `gh pr ready` was intentionally not run. Merge order: #207 (workflows) → #208 (server) → the submodule-pointer bump.
- **GitNexus index is stale** relative to this server-source change set; re-run `npx gitnexus analyze` before relying on impact/context tools against the new bundling code.

## Lessons Learned

- The most valuable design move came from the user's observation that a mechanical round-trip (per-step `get_technique`) carried semantic weight. Naive optimisation would have silently dropped it; the `▼ STEP`/`▶ step` marker-and-beat solution kept the semantics while still capturing the token saving.
- Fixing a feature at its root (automatic, corpus-wide) beat adopting it activity-by-activity. The zero-adoption signal was the tell that the opt-in shape — not the corpus — was the problem.
- "Docs-only" intake framing is a starting hypothesis, not a constraint. Two of five assumptions corrected into genuine server changes; letting the design follow the root cause (rather than the intake label) produced the right scope.

## Workflow Retrospective

[messages: interaction recorded as 13 checkpoint gates, 13 responses (raw chat history is private and not persisted to the session store) · session quality: Minor friction]

### Observations

<!-- Signals drawn from the checkpoint trace and assumptions log; raw user-message text is private/not stored. -->
- [correction] `assumption-decision#RR-1` answered **reject** — the proposed per-activity `bundleTechniques` opt-in was rejected in favour of automatic, per-agent context-derived bundling. Root cause: the recommended technique-selection assumed opt-in adoption despite ZERO existing corpus adoption; the correct fix was at the mechanism, not the corpus.
- [correction] `assumption-decision#RR-2` answered **reject** — document-only reconciliation of the two unchanged-marker dialects was rejected in favour of unifying them into one wire shape. Root cause: the recommendation under-scoped a genuine divergence as a doc note.
- [clarification / design refinement] `preservation-confirmed` checkpoint — the user surfaced that per-step `get_technique` calls are themselves semantically meaningful (intentional stepping); the design had to be extended to preserve that inside the bundle. Not a defect in the workflow, but a domain subtlety the initial approach missed.
- [checkpoint anomaly] `design-context` answered `skip-context` — the design-context gathering step was skipped as unnecessary for a change already well-specified by the epic and source review; expected for a well-scoped update, not a workflow problem.
- [checkpoint completeness] All 13 checkpoints reached were answered (`confirmed`/`accept`/`attested`/`approved`), including both attestation gates (`draft-attestation`, `pre-commit-attestation`) and the terminal `post-update-disposition` (accept). The five `dimension-confirmed` gates were all answered with their default `confirmed` — a candidate merge/demotion smell (AP-81/82) if this pattern recurs across sessions, though here it reflects a genuinely uncontested dimension review.

### Recommendations

1. **Medium:** RR-1 and RR-2 both surfaced as "recommend X" assumptions that the user rejected toward a larger, more correct scope. The requirements-refinement `assumption-decision` gate worked exactly as intended (it caught both), but the initial recommendations under-scoped. → No workflow change; this is the checkpoint doing its job. Note it as evidence the assumption-decision gate earns its cost.
2. **Low:** The five sequential `dimension-confirmed` checkpoints all resolved to their default. → If this default-only pattern recurs across future sessions, evaluate collapsing them into a single multi-dimension confirmation (per AP-81/82). Insufficient evidence from one session to act now.

**Key takeaway:** The workflow's decision gates correctly caught two under-scoped recommendations and one domain subtlety, steering a "docs-only" cluster into the right breaking server change — the friction was productive, not process waste.
**Action required:** no — no new issue; follow-ups (submodule-pointer bump, GitNexus re-index, constant tuning, C2 resource inlining) are tracked in Known Limitations & Deferrals above and in epic #189.
