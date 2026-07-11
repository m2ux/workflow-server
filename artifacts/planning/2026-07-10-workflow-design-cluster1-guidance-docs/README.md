# Cluster 1 (guidance & docs) — Design Session

**Created:** 2026-07-10  
**Mode:** Update  
**Status:** Planning

---

## 🎯 Executive Summary

Design and implement **cluster 1** of epic [m2ux/workflow-server#189](https://github.com/m2ux/workflow-server/issues/189) — the guidance & docs PR. It makes the #166 delivery optimisations reachable (C1: `context_mode: "persistent"` guidance, canonical `agent_id`, `bundleTechniques` corpus adoption, `get_technique` reference opt-in, one worker-prompt update) and fixes docs that drifted during #166 (C6: api-reference enforcement boundary, stale schema README rows, worker-prompt bundle shape, marker-dialect note). This is an **update** across the server repo (docs, meta resources) and the workflows corpus — not a greenfield workflow.

---

## Design Decisions

*Key design decisions and their rationale, captured as the session progresses. Left as placeholder until requirements refinement populates it.*

- **Classification: Update (not Create).** Confirmed at intake `mode-confirmation` checkpoint (`confirm-update`, `is_update_mode: true`). No single `target_workflow_id`; the change spans docs + meta resources + server code.
- **C1(c) — automatic, per-agent-context-derived bundling (RR-1, Corrected).** The per-activity `bundleTechniques` opt-in was rejected (root cause: opt-in with ZERO corpus adoption). Replaced by automatic bundling sized to the worker's own context. **`context_tokens` is a REQUIRED parameter on `get_activity` ONLY** — the worker declares it on its activity-fetch entry call. **`get_workflow` is NOT affected** because it does no technique bundling (it delivers only the small, fixed orchestrator operations bundle plus workflow metadata), so a context budget there is pointless. Omitting it on `get_activity` is a VALIDATION ERROR (call rejected); the server never guesses, never defaults, never falls back. There is NO session-level `context_tokens` (not on `start_session`, not on `dispatch_child`) and no fallback chain — a shared session serves differently-sized agents, so a session-stored budget would mis-size all but one. Server applies ~80% availability headroom + a token→char factor to derive the per-call ceiling; per-activity `bundleTechniques.maxChars` retained as an explicit override (`0` = opt out). **Corpus activity-YAML bundling edits are dropped.** This is a BREAKING API change (server version bump) and pulls real server changes forward from cluster 3 (user-approved).
- **R14 — UNIFY the marker dialects (RR-2, Corrected).** The two unchanged-marker shapes (`{ unchanged: true, content_hash }` in bundles vs `{ delivery: "unchanged", content_hash }` in `get_technique`) are unified into ONE shape emitted by both paths (server change), not merely documented.
- **C1(d) — docs-surfacing sufficient (RR-3, Confirmed).** The `get_technique { full: true }` / unchanged-reference opt-in already exists; surface it in docs, no new code.
- **Deferred to scope-and-draft (open implementation details):** exact auto-bundle derivation formula (token→char factor; per-technique cap vs cumulative per-activity budget); the canonical unified marker shape + back-compat stance.

---

## Compliance Findings

*Severity-rated findings from quality review / post-update review, populated when those activities run. "No findings" until then.*

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| Low | "document order until overflow" is skip-and-continue, not stop-and-break (comment/doc phrasing vs code; behaviour safe) | `src/tools/workflow-tools.ts` L524 | ✅ Fixed in validate-and-commit — `continue` → `break` (stop-and-break); comment reworded. Suite still 535/0. See [`09-validate-and-commit.md`](09-validate-and-commit.md) |

**Post-update review (prefix 10):** clean — 0 new compliance findings. All five audit passes (expressiveness, conformance/doc-voice, rule-to-structure, anti-patterns, schema validation) pass against the committed state; scope-discipline audit shows no drift (every committed file maps to a manifest item or an As-Built-recorded justified addition; documented no-ops correctly omitted). Guards on the committed tree: typecheck clean, `check-all-refs` 0 unresolved, `check-binding-fidelity` 263/263 baselined 0 NEW, `check-resource-anchors` OK. The committed update carries no new compliance debt. See [`10-post-update-review.md`](10-post-update-review.md).

---

## Scope Manifest

*Files to create, modify, or remove, confirmed during scope-and-draft. Below is the grounded intake inventory (verified against files); final selection and per-file edits are confirmed during drafting.*

**C1 — adoption guidance (removes R1, R3):**

- `docs/ide-setup.md` — add `context_mode: "persistent"` + canonical `agent_id` guidance for solo/inline (single-context) sessions.
- `workflows/meta/resources/bootstrap-protocol.md` — already documents `context_mode` (step 2); add/clarify canonical `agent_id` steer for solo mode.
- **Server code (`src/`)** — automatic per-agent context-derived bundling: `context_tokens` is a REQUIRED parameter on `get_activity` ONLY (the worker); `get_workflow` is NOT changed (it does no technique bundling). Omitting it on `get_activity` is a validation error (call rejected). NO session-level storage (not on `start_session`/`dispatch_child`), no default, no fallback. Derive the per-call bundle ceiling (~80% availability headroom + token→char factor) from the caller's declared value; keep `bundleTechniques.maxChars` as an explicit per-activity override. BREAKING API change → server version bump. *(Replaces the dropped per-activity corpus opt-in; corpus activity YAML is NOT edited for bundling.)*
- `docs/api-reference.md` / `docs/ide-setup.md` / `workflows/meta/resources/activity-worker-prompt.md` — document that `context_tokens` is REQUIRED on the worker's `get_activity` entry fetch. `workflows/meta/resources/bootstrap-protocol.md`'s `get_workflow` step is UNCHANGED w.r.t. `context_tokens`; it only gains the `context_mode`/`agent_id` adoption guidance (C1a/b).
- `docs/api-reference.md` / `schemas/README.md` — verify the existing `get_technique { full: true }` per-call reference opt-in is surfaced (mechanic already exists; docs-only check).
- `workflows/meta/resources/activity-worker-prompt.md` — one update: carve out bundled step-techniques from the "load progressively, one per step, never all at once" mandate (bundled `step_techniques` need no `get_technique` fetch).

**C6 — post-#166 doc-drift fixes (removes R9, R14):**

- `docs/api-reference.md` line 116 (Enforcement Boundary) — move "variable types and defaults" out of the agent-interpreted class; B7 made `defaultValue` server-seeded (`variables_seeded`) and `type` warn-only-validated.
- `schemas/README.md` lines 581 & 1208 — remove/correct the two stale activity `artifacts` rows (B4 removed authored activity `artifacts[]`).
- `workflows/meta/resources/activity-worker-prompt.md` — reconcile the bundle-shape wording with the real `step_techniques` delivery (shared with C1e).
- **Server code (`src/`)** — UNIFY the two unchanged-marker dialects (R14) into one shape emitted by both the bundle path and `get_technique`; update `docs/`/`schemas/README.md` to describe the single shape. *(Decision: unify, not document-only.)*

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ✅ Complete |
| 05 | Impact Analysis | Update | ✅ Complete |
| 06 | Scope and Draft | Create, Update | ✅ Complete |
| 08 | Quality Review | All | ✅ Complete |
| 09 | Validate and Commit | All | ✅ Complete (validated green; LOW-1 fixed; DRAFT PRs [#207](https://github.com/m2ux/workflow-server/pull/207) workflows + [#208](https://github.com/m2ux/workflow-server/pull/208) server) |
| 10 | Post-Update Review | Update | ✅ Complete (clean — 0 new findings; all 5 audit passes clean; no scope drift; guards green on committed state. See [`10-post-update-review.md`](10-post-update-review.md)) |
| 11 | Retrospective | All | ✅ Complete (close-out + retrospective — [`11-COMPLETE.md`](11-COMPLETE.md); terminal activity, workflow complete) |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Epic | [m2ux/workflow-server#189](https://github.com/m2ux/workflow-server/issues/189) |
| Assumptions log | [`03-assumptions-log.md`](03-assumptions-log.md) |
| Source review | `.engineering/artifacts/planning/2026-07-08-schema-technique-disclosure-review-repeat/` |
| Server docs in scope | `docs/api-reference.md`, `docs/ide-setup.md`, `schemas/README.md` |
| Meta resources in scope | `workflows/meta/resources/bootstrap-protocol.md`, `.../activity-worker-prompt.md` |
| Corpus in scope | `workflows/work-package/activities/` |

---

**Status:** **Workflow complete.** Terminal `retrospective` activity done — close-out and session retrospective recorded in [`11-COMPLETE.md`](11-COMPLETE.md). Both PRs remain DRAFT: workflows [#207](https://github.com/m2ux/workflow-server/pull/207) (base `workflows`, commit `1aa52e52`) and server [#208](https://github.com/m2ux/workflow-server/pull/208) (base `main`, commit `b8c4cfed`, BREAKING v2.0.0). Merge #207 first, then #208, then the follow-up submodule-pointer bump. Open follow-ups (tracked in `11-COMPLETE.md`): parent-repo submodule-pointer bump after #207 merges; stale GitNexus index; future tuning of the 0.80/4 bundle constants; C2 shared-resource inlining.
