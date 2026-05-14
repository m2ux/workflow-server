# Design Philosophy — Refresh Workflow-Server Docs

**Date:** 2026-05-14
**Work package:** `2026-05-14-refresh-workflow-server-docs`
**Activity:** design-philosophy (v1.4.0)

---

## Problem Statement

The workflow-server has evolved through several substantial feature additions — hierarchical dispatch, server-managed session state, operation-focused skills, expanded MCP tooling — but the project's documentation has not kept pace. Top-level files (`README.md`, `SETUP.md`, `AGENTS.md`, `CLAUDE.md`), the `docs/` reference set, and the schema documentation each predate one or more of these changes, and parts of them now describe behavior, tools, or schemas that have moved, been renamed, or no longer exist.

**Impact:** Newcomers and AI agents reading the docs receive a partially incorrect mental model. They may call deprecated tools, follow setup steps that no longer apply, or trust schema descriptions that no longer match the wire format.

**Success criteria:**
- Top-level docs (README, SETUP, AGENTS, CLAUDE) reflect current installation, run, and contribution flow.
- `docs/api-reference.md` matches the current MCP tool set, signatures, and return shapes.
- `docs/ide-setup.md` reflects current rule/discovery behavior.
- `schemas/README.md` matches current JSON Schemas and TOON schemas.
- Cross-references between docs are consistent and current.

**Constraints:**
- No source code (`src/`, `schemas/`) or workflow TOON changes — docs only.
- Work must be performed in the dedicated worktree.
- The PR (`#119`) is already open against `chore/refresh-workflow-server-docs`.

---

## Problem Classification

- **Problem type:** `inventive-goal` — this is a quality/improvement effort, not a defect with a known faulty system.
- **Complexity:** `simple` — well-defined scope (which files to touch), no architectural changes, no schema changes, no behavior changes.
- **Recognition signals:** doc-refresh, no new features, no source modifications, mechanical alignment against current implementation.

The user is the project author/maintainer and the implicit owner of the codebase mental model that the docs must align with. This further reduces classification ambiguity.

---

## Workflow Path Decision

**Path selected:** `skip-optional` (user-confirmed at `workflow-path-selected` checkpoint, 2026-05-14T16:30:12Z).

Effects applied by the checkpoint:
- `complexity = simple`
- `needs_elicitation = false`
- `needs_research = false`
- `skip_optional_activities = true`

**Rationale:**
- Elicitation skipped — requirements are clear: refresh docs to match current code.
- Research skipped — no novel patterns or external best-practice survey needed; the source of truth is the current source tree, not external references.
- Codebase comprehension is still mandatory per `design-philosophy`'s `determine-path` action (`needs_comprehension = true`) — but the existing comprehension portfolio under `.engineering/artifacts/comprehension/` already covers all relevant areas (see `01-comprehension-refresh.md`).

Transitions from `codebase-comprehension` will route to `plan-prepare` (because `skip_optional_activities == true`), skipping `requirements-elicitation`, `research`, and `implementation-analysis`.

---

## Workflow Path Map (forward)

```
design-philosophy (✅ this activity)
  → codebase-comprehension (existing portfolio sufficient)
    → plan-prepare (skip_optional_activities == true)
      → implement
        → code-review
          → strategic-review
            → close-work-package
```

---

## Inherited / Captured Variables

| Variable | Value | Source |
|---|---|---|
| `issue_skipped` | `true` | `start-work-package` (skip-issue) |
| `pr_skipped` | `false` | `start-work-package` (proceed) |
| `pr_number` | `119` | `start-work-package` |
| `branch_name` | `chore/refresh-workflow-server-docs` | `start-work-package` |
| `problem_type` | `inventive-goal` | this activity |
| `complexity` | `simple` | workflow-path-selected effect |
| `needs_elicitation` | `false` | workflow-path-selected effect |
| `needs_research` | `false` | workflow-path-selected effect |
| `skip_optional_activities` | `true` | workflow-path-selected effect |
| `needs_comprehension` | `true` | design-philosophy `determine-path` action |

---

## Outcome

Problem clearly defined and classified, complexity assessed, workflow path determined, design philosophy documented. Ready for `codebase-comprehension` (existing portfolio assessed) and onward to `plan-prepare`.
