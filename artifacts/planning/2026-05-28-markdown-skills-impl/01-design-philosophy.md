# Design Philosophy — Markdown Skills Migration Implementation

**Work Package:** markdown-skills-impl
**Date:** 2026-05-28
**Issue:** [#125](https://github.com/m2ux/workflow-server/issues/125)
**Branches:**
- Source: `feat/125-markdown-skills-migration` (base `origin/main`)
- Content: `feat/125-markdown-skills-content` (base `origin/workflows`)

---

## Problem Statement

Implement the markdown-skills migration designed in `.engineering/artifacts/planning/2026-05-22-claude-skills-migration/`. Replace TOON-based per-workflow skills with markdown techniques and resources at `workflows/<workflow>/{techniques,resources}/`, served by the workflow-server with workflow-local → `workflows/meta/` precedence resolution and a TOON-projection delivery pass for techniques (simplified markdown for resources).

### System Understanding

Today the workflow-server delivers per-workflow knowledge through a TOON-encoded skill format that lives alongside the workflow definitions. Authoring those files requires understanding the TOON projection rules in addition to the underlying intent, and the format is harder for humans to read and edit than plain markdown. The migration plan committed on 2026-05-22 documented the target shape — per-workflow `techniques/` and `resources/` folders containing markdown files, with `workflows/meta/` doubling as the cross-workflow shared layer — but the implementation was deferred.

The migration touches two distinct surfaces:

1. **Content (workflows-data submodule):** new `workflows/<workflow>/{techniques,resources}/` trees, sourced from the planning-folder `legacy/{work-package,meta}/{techniques,resources}/` trees.
2. **Source (workflow-server):** new markdown loader, precedence resolver (workflow-local → `meta`), TOON-projection delivery pass for `get_skill`, and simplified-markdown delivery for `get_resource`.

### Success Criteria

- Every `get_workflow` / `get_activity` / `get_skill` / `get_resource` call returns content equivalent to the pre-migration state (same fields, same semantics, same delivery shape for techniques; simplified markdown for resources).
- All 14 work-package activities continue to resolve their skill and resource references correctly across both workflow-local and `meta` precedence.
- Legacy TOON skills + resources are removed at the end of the migration — single source of truth.
- Existing tests pass on both branches; new tests cover the precedence resolver and the TOON-projection delivery pass.

### Constraints

- Must not change the MCP contract surface (`discover`, `list_workflows`, `start_session`, `get_workflow`, `get_activity`, `get_skill`, `get_resource`, `next_activity`, `present_checkpoint`, `respond_checkpoint`, `yield_checkpoint`, `resume_checkpoint`, `dispatch_child`, `resolve_operations`, etc.).
- Content branch must land before source branch — there is no window where the server expects markdown but finds none, OR where content exists but the loader still reads TOON.
- The 10 workflow folders under `workflows/` retain their existing `workflow.toon` + `activities/` unchanged; the migration adds sibling `techniques/` and `resources/` folders without disturbing them.

---

## Problem Classification

**Type:** `task` — technical migration; no user-facing surface change.

**Complexity:** `complex` — multi-branch, multi-worktree, ~150+ files, server-source + content + 14 work-package activities; coordination required across two PRs.

The orchestrator has pre-resolved `problem_type=task` and `complexity=complex` via the `classification-confirmed` checkpoint.

---

## Approach

Two coordinated feature branches:

1. **Content side** (`feat/125-markdown-skills-content` ← `workflows`, worktree at `~/projects/work/workflows/2026-05-28-markdown-skills-impl/`) — place new `techniques/`/`resources/` content under each workflow folder. Sourced from `.engineering/artifacts/planning/2026-05-22-claude-skills-migration/legacy/{work-package,meta}/{techniques,resources}/`. Lands first.
2. **Source side** (`feat/125-markdown-skills-migration` ← `main`, worktree at `~/projects/work/workflow-server/2026-05-28-markdown-skills-impl/`) — update the workflow-server source so `get_skill` loads markdown techniques and resources from the new per-workflow locations with workflow-local → `workflows/meta/` precedence resolution and a TOON-projection delivery pass. Lands second, after content is in place.

Two-PR coordination eliminates the failure window in either direction: the loader-flip PR cannot merge until the content it depends on exists on `workflows`.

---

## Design Rationale

### Principle: Markdown as Source of Truth, Projection on Delivery

Markdown is the authoring medium contributors already use for every other artifact. The workflow-server projects each markdown skill into a token-efficient form on delivery — TOON for governed techniques (per their fixed schema) and simplified markdown for freeform resources. Source-of-truth and wire form are decoupled, so the projection layer can evolve without changing what authors edit.

### Principle: Workflow-Local with Meta-Workflow as Shared Layer

Resolution is workflow-local first, then `workflows/meta/`. The `meta` workflow's `techniques/`/`resources/` folders carry double duty — they are both the local content for the `meta` workflow itself AND the cross-workflow shared layer for all other workflows. This removes the need for a separate `shared/` root or a `skills` orphan branch, and makes the shared layer discoverable from the same place contributors look for any other workflow's content.

### Principle: Operations-as-Child-Files for Flat Op Libraries

For techniques whose body is a flat library of named callable operations (`*-operations` techniques), each operation lives in its own sibling `<op>.md` file inside the skill folder (no frontmatter). The parent `SKILL.md` is the index. Applied to: `cargo-operations`, `gitnexus-operations`, `validate-build`, `dco-provenance`, `manage-artifacts`, `manage-git`.

This shape mirrors how callers actually use these libraries — they invoke one named operation at a time, not the whole technique. Child files let callers load exactly the operation they need without paying for the rest of the library, and let authors edit one operation without touching the others.

### Principle: `agent-conduct` as Rules-Only Technique

`agent-conduct` bends the "Procedure always present" rule because it has no procedure — its body is `Capability + Rules` only (21 named rules). The technique is a pure rules library that other techniques opt into via global-rules inclusion. This is the only such exception; it is called out explicitly so the loader can validate it.

### Principle: Canonical Section Set for Op Child Files

Op child files use a fixed canonical section set: no `## Tools`, no extension sections (Harness implementations, Schema reference, Notes, etc.). Variant logic — for example "when input X is present, do Y; otherwise Z" — is encoded as branching on declared inputs inside the procedure, not as separate variant sections. This keeps the projection rules narrow and the diff surface predictable.

---

## Architectural Decisions Worthy of ADRs

Each of the following will become its own ADR under `.engineering/artifacts/adr/`. They are listed here as forward references; the ADRs themselves will be authored as the implementation surfaces each decision.

1. **No orphan branch — meta workflow doubles as shared layer (2026-05-28)** — content lives under each workflow folder; `meta` workflow's `techniques/`/`resources/` are also the cross-workflow shared layer. Resolves the earlier `skills` orphan branch + `legacy/` wrapper + `shared/` root direction from the 2026-05-22 plan.
2. **Operations-as-child-files pattern** — for techniques whose body is a flat library of named callable operations, each operation lives in its own `<op>.md` sibling file (no frontmatter). Parent `SKILL.md` is the index.
3. **TOON-projection delivery (techniques) + simplified-markdown delivery (resources)** — markdown is source-of-truth; the server projects each into a token-efficient form on delivery (TOON for governed techniques per their fixed schema; simplified markdown for freeform resources).
4. **`agent-conduct` as rules-only technique** — bends "Procedure always present"; body is `Capability + Rules` (21 named rules).
5. **Canonical section set for op child files** — no `## Tools`, no extension sections; variant logic encoded as branching on declared inputs.

---

## Out of Scope (Deferred to Phase 2 / `workflow-canonical-plan.md`)

- The richer composing-technique restructuring (decomposing each migrated technique into composing body + nested techniques).
- Pulling cross-cutting protocol phases into shared techniques.
- Subsuming resources into technique bodies.

These deferrals are deliberate. This work package implements the on-disk shape change and the loader flip only; semantic restructuring of the techniques themselves is a follow-on tracked in the 2026-05-22 planning folder's `workflow-canonical-plan.md`.

---

## Complexity Assessment

**Complex.** The change spans two repos (workflow-server source + workflows-data submodule), two coordinated PRs, ~150+ files across 10 workflow folders, and 14 work-package activities whose skill references must resolve identically after the flip. The full elicitation/research path is not needed — the design is concrete and the prior planning artifact (`2026-05-22-claude-skills-migration/`) is the requirements document — but codebase comprehension, plan preparation, and full review are all warranted given the surface area.

### Risk Concentration

The single highest-risk surface is the precedence resolver and the TOON-projection delivery pass. If precedence resolves wrong, an activity can silently pick up the wrong technique (a `meta` fallback when it expected a workflow-local override, or vice versa). If the projection layer drifts from the existing TOON shape, every consumer of `get_skill` sees a different on-wire body. Both must be covered by tests against the pre-migration baseline.

### Stakeholder Assumptions

See `01-assumptions-log.md` for the full assumption set. All five initial assumptions are open as of this activity; codebase comprehension (next activity) will reconcile the code-analyzable ones (A-001, A-002, A-003).

---

## Workflow Path

**Skip-optional path** — `complexity = complex`, `path_gating_complexity = simple`, `skip_optional_activities = true`, `needs_elicitation = false`, `needs_research = false`, `needs_comprehension = true`.

### Rationale for skip-optional on a complex problem

The `complexity` classification (`complex`) records the genuine surface area of the change — two repos, ~150+ files, 14 activities — and that classification remains accurate. The path-gating choice (`skip-optional`) is a separate decision: it answers "given the design is already concrete, do we still need elicitation and research?" rather than "how big is the change?"

For this work package the answer is no, and the path-gating variable is set to `simple` to express that:

- **Requirements are pre-resolved.** The `.engineering/artifacts/planning/2026-05-22-claude-skills-migration/` planning folder is the requirements document. Target layout, precedence rules, projection responsibilities, and the no-orphan-branch decision are all settled there. Re-running `requirements-elicitation` would re-derive what already exists.
- **No research questions remain.** Markdown as source, TOON projection on delivery, workflow-local → `meta` precedence, and op-as-child-file are all design decisions already made — not open prior-art questions. `research` activity would have no question to investigate.
- **Implementation analysis is unnecessary.** The implementation surface is mechanical (file placement on content side; loader swap on source side). `implementation-analysis` would not surface decisions beyond what plan-prepare will already enumerate.

The path-gating decision narrows the activity list — it does NOT lower the complexity flag, downgrade review rigor, or shrink the test plan.

### Activities expected to run after this one

The skip-optional path runs ten activities total (this one + nine more):

1. `codebase-comprehension` — map the existing TOON loader, the skill resolver, the `get_skill` / `get_resource` delivery pass, and the 14 work-package activities' skill references. (Mandatory regardless of skip-optional.)
2. `plan-prepare` — formalize implementation tasks across both branches, including content-first / source-second ordering and the test plan for the precedence resolver + projection layer.
3. `assumptions-review` — verify the assumptions log against codebase-comprehension and plan-prepare findings.
4. `implement` — content placement, then loader flip.
5. Review activities (`code-review`, `test-suite-review`, `strategic-review`) — full review rigor; the complex classification still gates these.
6. `validate` — build, typecheck, test.
7. `submit-for-review` — both PRs (content first, source second).
8. `complete` — completion summary and retrospective.

Activities skipped on this path: `requirements-elicitation`, `research`, `implementation-analysis`.
