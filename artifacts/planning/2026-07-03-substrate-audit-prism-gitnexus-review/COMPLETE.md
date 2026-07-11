# Workflow Design: substrate-node-security-audit — Complete

> Review → remediation (gitnexus/prism focus) · 2026-07-03

## Summary

Focused `workflow-design` review of `substrate-node-security-audit` (v4.17.0) against three goals — (1) effective prism-technique reuse / no content duplication, (2) effective GitNexus use for codebase scan/analysis, (3) GitNexus preferred over grep where appropriate — followed by remediation to **v4.18.0**. Committed as `53a35cc1` + fix-pass `b2458d68` on branch `workflow/substrate-audit-gitnexus`, draft PR [#161](https://github.com/m2ux/workflow-server/pull/161) vs `workflows`. Separate from the completed 2026-07-02 general-compliance session (PR #159, merged).

## What Was Delivered

Against v4.17.0 (13-file diff, additive and gated — 0 files created, 0 removed):

- **Goal 1 — prism reuse: assessed a PASS, no rebuild.** A skeptical technique-by-technique comparison (independent agent) found the overlaps with the prism family are *structural/orchestration*, not content; the Substrate-specific payloads (§3 checklist, multi-agent roster A1–A7/B/D1/D2/V/M, calibrated Impact×Feasibility rubric, checklist-decomposition adversarial model) have no prism equivalent. `substrate-node-security-audit` and `prism-audit` are deliberately different-philosophy audits (bespoke deep multi-agent review vs. prompt-generator over the prism lens engine). No prism-family technique adopted; the divergence is now documented in the README.
- **Goals 2 & 3 — GitNexus adoption:** the workflow now reuses the meta `gitnexus-operations` group for its codebase analysis, gated on a new `gitnexus_available` variable:
  - `scope-setup`: `analyze` + gate (mirrors `prism-audit`'s scope-definition).
  - `map-codebase` / `analyze-architecture`: `read-cluster`/`query`/`read-process`/`cypher` (cross-community = trust boundaries) / `context` (fan-in) / `impact` (blast radius).
  - `build-function-registry`: `cypher`-seeded enumeration; `apply-checklist` prefers the exact graph count over `grep 'fn '`; `verify-sub-agent-output` takes the coverage denominator from the GitNexus inventory.
  - static-analysis structural checks (Ch1/3/5/15/16/17/29/31/32) + `scan-storage-lifecycle` pairing route through `context`/`impact`/`cypher`; `static-analysis-patterns` gained a grep↔GitNexus boundary preamble.
  - A `workflow.yaml` rule codifies graph-first structural analysis with grep/full-read fallback; `audit-prompt-template` gained a three-instruments stance line.

## Design Decisions

- **No prism rebuild (goal 1).** Rebuilding on prism would destroy the deep-review model that is the workflow's whole value; the deep multi-agent Substrate pipeline is not what prism packages. Recorded, not remediated.
- **Reuse-first (AP-64):** every codebase-analysis need binds an existing `gitnexus-operations` op; no new technique files authored.
- **Non-destructive (Principle 12):** every gitnexus path is a `{gitnexus_available}`-gated addition beside the retained grep/manual method; grep stays for pattern-presence, full-file reading + the >200-line coverage gate for pattern-absence.
- **`gitnexus_available` is ambient:** read directly as a workflow variable (like `target_path`), not re-declared as a per-technique input (avoids AP-52) — settled in the fix pass.
- **RA-5:** `analyze` binds `repo_path: target_submodule` (the audit's target-repo root and only apt workflow variable; `midnight-node` is indexed standalone).
- **Version:** minor bump 4.17.0 → 4.18.0 (additive, gated, no schema/contract/activity break).

## Scope Outcome

All 13 manifest items delivered ([06-scope-and-draft.md](06-scope-and-draft.md)); the post-update scope-audit confirmed no drift. Guards green throughout: `validate-workflow-yaml` PASS (14 activities, no unanchored refs), `check-binding-fidelity` 0 NEW (worktree-pointed), all `gitnexus-operations` hyperlink targets verified.

## Known Limitations & Deferrals

- **Guard worktree-friction repeated.** The ref/binding/schema guards hardcode the main checkout, so validating the worktree required a temporary `--root`-pointed copy of `check-binding-fidelity.ts`. This is issue [#160](https://github.com/m2ux/workflow-server/issues/160) item 1 (worktree-aware guards); **deferred to a separate chat** at the user's direction, along with #160's other three workflow-design follow-ups.
- **Parent-repo planning artifacts** (`.engineering/artifacts/planning/2026-07-03-…/`) are written but not yet committed (parent-repo commits stay explicit-request).
- **Server reload reads the stale main checkout.** `post-update-review`'s `reload-workflow` sees v4.17.0, not the worktree v4.18.0; the review targeted the worktree/PR directly.

## Workflow Retrospective

[messages: ~6 checkpoint responses (via AskUserQuestion) + several user directives across the session · session quality: Smooth, high user engagement]

### Observations

- [flow] The session ran review → fix-issues → update → committed PR → independent post-update review → fix pass, then a second review request and an issue-#160 request — a longer, more interactive arc than the prior session, with the user actively steering scope (separate-vs-extend, disposition, commit/PR, #160 scoping).
- [tooling-friction] The guard worktree-hardcoding (issue #160 item 1) bit again — a temp `--root` copy of `check-binding-fidelity.ts` was needed to validate the shipped worktree rather than the stale main checkout. This is now a *twice-observed* correctness hazard.
- [quality] Delegating the goal-1 prism-overlap verdict and the post-update review to independent adversarial agents materially improved integrity: goal 1 landed as an evidence-based *pass* (avoiding a manufactured-reuse over-fix), and the post-update review caught 3 real minor defects (value-less `set`, a dangling CHANGELOG op claim, an input-declaration inconsistency) a self-review would likely have rubber-stamped.
- [artifact] `gitnexus_available` was first drafted as a per-technique optional input on 4 techniques, then corrected to an ambient workflow-variable read — the review caught the AP-52-adjacent inconsistency.

### Recommendations

1. **High:** land issue #160 item 1 (worktree-aware guards) — the friction is now confirmed across two sessions. (workflow-server `scripts/`)
2. **Medium:** make independent adversarial verification a standard step for review-mode High-tier findings and for post-update review of a committed diff — it paid off here and matches #160 item 3. (workflow-design)
3. **Low:** the `map-codebase` `graph-first-when-indexed` and `analyze-architecture` `graph-first-when-indexed` rules share a slug across two technique files (legal — technique-local), but a future audit may want to confirm they are intentionally distinct.

**Key takeaway:** The three goals were met cleanly and honestly — goal 1 as a documented pass (no over-fix), goals 2–3 as reuse-first, non-destructive, precedented (prism-audit) gitnexus adoption. The only real friction is tooling (worktree-blind guards), already tracked in #160.

**Action required:** #160 follow-ups (incl. the guard fix) are deferred to a new chat per the user's instruction.
