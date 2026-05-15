# Refresh Workflow-Server Docs - May 2026

**Created:** 2026-05-14
**Status:** In Progress (implementation complete; pending code-review / strategic-review / submit-for-review)
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Refresh and update the workflow-server repository documentation (README, SETUP, AGENTS/CLAUDE guidance, `docs/`, schema docs, IDE setup) to reflect the current state of the project after recent feature work (hierarchical dispatch, server-managed session state, operation-focused skills). The goal is to bring user-facing and contributor-facing documentation back in sync with the implementation, schemas, and tools, so newcomers and AI agents land on accurate guidance.

---

## Problem Overview

The workflow-server has evolved through several substantial feature additions — hierarchical dispatch, server-managed session state, operation-focused skills, expanded MCP tooling — but the project's documentation has not kept pace. Top-level files (README, SETUP, AGENTS, CLAUDE), the `docs/` reference set, and the schema documentation each predate one or more of these changes, and parts of them now describe behavior, tools, or schemas that have moved, been renamed, or no longer exist.

The practical consequence is that anyone reading the docs — a new contributor, an AI agent invoking MCP tools, or an integrator setting up the server — receives a partially incorrect mental model. They may call deprecated tools, follow setup steps that no longer apply, or trust schema descriptions that no longer match the wire format. That friction shows up as wasted time, support questions, and quiet behavioral drift between what the docs say and what the server does.

---

## Solution Overview

We will walk through the workflow-server's user-facing documentation — the README, setup guide, agent-instruction files, the `docs/` reference set, and the schema docs — and update each file so it matches what the code actually does today. The project has gained several real capabilities over the last few months (hierarchical workflow dispatch, server-managed session state, operation-focused skills, additional MCP tools), and the docs have drifted out of step with those changes. The result of this work package is a coherent doc set that a new contributor or an AI agent can trust to describe the server they are actually running.

The fix is mechanical, not architectural: no source code or schema changes, just doc updates. We will first take a quick inventory of every registered MCP tool and every schema, then refresh each doc file against that inventory — fixing tool names, signatures, return shapes, setup commands, and cross-references. We also keep a short "tracked drift" appendix that lists the few places where the docs intentionally remain aligned with `main` until an in-flight feature branch (the `session_index` migration) lands, so the follow-up pass is obvious. Build and tests are run as a sanity check; they should continue to pass exactly as they do today.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Design philosophy](01-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 01 | [Comprehension refresh](01-comprehension-refresh.md) | Existing comprehension portfolio review | 10-20m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 05 | [Test plan](05-test-plan.md) | Verification suite + doc-specific checks | 15-25m | ✅ Complete |
| — | Implementation | Documentation updates per plan (4 commits on `chore/refresh-workflow-server-docs`) | 1-3h | ✅ Complete |
| 06 | [Tracked drift](06-tracked-drift.md) | Files needing a follow-up pass after `session_index` merge | 10m | ✅ Complete |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ✅ Complete |
| 06 | [Code review](06-code-review.md) | Automated doc quality review | 10-20m | ✅ Complete |
| 06 | [Structural findings](06-structural-findings.md) | Prism L12 single-pass structural analysis | 10-15m | ✅ Complete |
| 06 | [Test suite review](06-test-suite-review.md) | Test suite quality assessment (docs-only — N/A) | 5m | ✅ Complete |
| 06 | [Architecture summary](06-architecture-summary.md) | Architecture summary (skipped — docs-only) | 5m | ✅ Complete |
| 07 | [Validation](07-validation.md) | Typecheck + Vitest suite, commit signature scan, README conformance | 10-20m | ✅ Complete |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ✅ Complete |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | _None — direct user request (no associated GitHub/Jira issue)_ |
| PR | [#119](https://github.com/m2ux/workflow-server/pull/119) |
| Target Branch | `chore/refresh-workflow-server-docs` |
| Worktree | `~/projects/work/workflow-server/2026-05-14-refresh-workflow-server-docs/` |

---

**Status:** Implementation complete on `chore/refresh-workflow-server-docs`. Four commits land the refresh in the order planned: (1) `docs: refresh API and entry-point docs` (T1–T6); (2) `docs: refresh architecture and model docs` (T7–T9); (3) `docs: refresh schemas/README.md and schema-header.md` (T10–T11); plus the planning-folder updates here. `npm run typecheck` and `npm test -- --run` both pass (256 passed, 2 skipped, 0 failed) before and after edits. Tracked drift recorded in [06-tracked-drift.md](06-tracked-drift.md). Post-impl-review complete: code-review (06), structural-findings (06), test-suite-review (06), architecture-summary (06, skipped — docs-only). Validation complete: typecheck + tests green, commit-signature preflight flagged 4 unsigned commits. Strategic review complete: 4 unsigned commits re-signed via `git rebase --keep-empty --force-rebase -S 7dfca21` and force-with-lease pushed to `chore/refresh-workflow-server-docs` (new tip `7de8898`, all G); diff scope confirmed docs-only (+94/-33 across 12 files); no findings ≥ Minor. Proceeding to submit-for-review.
