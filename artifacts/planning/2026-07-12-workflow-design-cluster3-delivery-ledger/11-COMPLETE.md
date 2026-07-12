# Cluster 3 — Delivery Ledger — COMPLETE

> #189 · workflow-design session · 2026-07-12

## What this session delivered

A **server-feature design spec** for #189 cluster 3 (server-only), covering:

- **C2 — block-level delivery ledger** ([06-design-spec.md](06-design-spec.md) §2): extend B1 reference-delivery to the `inherited_inputs`/`inherited_outputs`/`rules` blocks inside composed `get_technique` payloads, content-keyed (`technique:<block>:<hash>`), layered under the whole-technique key, wired via a new `dedupTechniqueBlocks` helper into `get_technique` and get_activity's eager bundling. Delivery-time, no schema change.
- **C12 — get_workflow slimming** (§3): ledger the orchestrator ops bundle under `workflow_bundle:<hash>`, persistent-mode only.

Artifacts committed to `.engineering` (engineering branch, `51768097`): README, 03-assumptions-log, 05-impact-analysis, 06-design-spec, 08-quality-review, 10-post-update-review, 11-COMPLETE. Parent pointer bumped locally on `main` (`7f69b1bc`, unpushed).

## Key design decisions (and alternatives rejected)

- **Block set = contract + rules only**, not the technique-specific core. *Rejected:* decomposing `protocol`/`inputs`/`outputs` — per-technique, interleaved ancestor-wrap, low shared value.
- **Content-keyed** (`<block>:<hash>`), refining the eval report's id-keyed `contract:<workflowId>` sketch. *Reason:* auto-invalidates on contract change and per-step annotation variance; matches existing content-keyed blocks.
- **Layered under the whole-technique key** and applied at the projection layer so both delivery paths benefit from one helper.
- **C12 minimal** (single whole-bundle key, persistent-gated). *Rejected:* per-technique cross-channel reuse — breaks `delivery.ts`'s channel-isolation invariant.
- **Opt-in, no schema change, additive** — default/fresh sessions and dispatched workers unchanged.

## Known limitations / deferred

- **Implementation not done here** — ships as a separate server PR (semver minor). Sequence + test/doc surface in [06-design-spec.md](06-design-spec.md) §4–§7.
- **C12 empirical benefit unmeasured** — the win is resume-only; whether resume traffic exists to benefit is an open validation note, not a blocker (it's free when unused).
- **Suggested validation:** an instrumented persistent-mode work-package re-walk to confirm the projected ~+13% (C2) and quantify C12's resume delta.
- **Parent `main` pointer unpushed** — left for the user to push, coordinated with the pending `workflows` submodule change.

## Workflow Retrospective

Activities completed: 8/8 (create/update path; pattern-analysis skipped by mode). Substantive (non-checkpoint) interactions: 3 AskUserQuestion gates — framing/scope, design approval, commit disposition — all resolved cleanly on the recommended option; no corrections or frustration signals.

**Honest friction — medium priority (recurs for every server-only cluster):**

- **workflow-design's create/update/review scaffold and its back-half are YAML-authoring-shaped, so a server-only design fits awkwardly.** Concretely: intake's `intake-classification` forces one of create/update/review and wants a `target_workflow_id` that doesn't exist (classified "update" against the delivery *engine*, `target_workflow_id` = n/a); requirements-refinement elicits workflow *dimensions* (activity list, checkpoints, variables); quality-review runs YAML audits (expressiveness/conformance/rule-hygiene/rule-enforcement); validate-and-commit expects schema validation + a workflows-repo branch/PR. For this session all of these were N/A or reinterpreted, and roughly a third of the tail steps reported "N/A". The design activities that DID carry weight (impact-analysis, scope-and-draft producing the spec, the assumptions log) are general-purpose and worked well.
  - **Recommendation:** this is the third #189 cluster designed through workflow-design; cluster 1 fit (it touched workflow YAML too), clusters 2 & 3 are server-only and don't. Consider either (a) a lightweight "server/engine-design" mode branch in workflow-design that swaps the YAML-authoring dimensions/audits/commit-tail for server-design equivalents (module impact, design-spec drafting, no schema-validation/PR tail), or (b) accepting that these server designs are really `work-package`-shaped and routing server-only clusters there. Low-risk, improves fidelity and reduces N/A noise.

- **Minor:** the design-context and several audit checkpoints are 30s-auto-advance; in a solo/persistent run they add no value for a non-YAML deliverable (resolved internally under delegated authority).

**What worked:** solo/persistent delivery mode collapsed the bundle/technique/rules deliveries to unchanged-markers cleanly across all 8 activities (visible in each get_activity response); the impact-analysis → scope-and-draft → quality-review spine produced a code-accurate, implementation-ready spec; delegating internal checkpoints and surfacing only the three material gates kept interaction lean.
