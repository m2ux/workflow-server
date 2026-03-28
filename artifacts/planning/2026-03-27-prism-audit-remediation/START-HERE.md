# Prism Audit Remediation — March 2026

**Date:** 2026-03-27
**Status:** Ready for Implementation
**Progress:** 1/3 packages complete

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## Executive Summary

Remediate 15 findings from a full-prism quality and consistency audit of the workflow-server codebase. Findings span schema alignment (6), validation enforcement (5), and behavioral/infrastructure fixes (4). One HIGH severity item, eight MEDIUM, and six LOW. The work is decomposed into 3 independently-deliverable work packages with one dependency chain (WP-01 → WP-02).

## Problem Overview

The workflow-server uses two parallel validation systems — Zod schemas (runtime TypeScript validation) and JSON Schema files (IDE tooling and documentation) — to describe the same data structures. Over time, these two definitions have drifted apart in six places: a required field is missing from the JSON Schema, a field that should accept a list only accepts a single item, a numeric cap prevents long-running workflows from saving state, and several fields have mismatched optionality or misleading descriptions. Because the two systems are not auto-synchronized, neither one catches the other's mistakes.

These divergences have practical consequences. The most urgent one (F-01, HIGH severity) means that any external tool validating saved state files against the JSON Schema will reject every valid file, because the Schema is missing a field the runtime always includes. The other five issues create subtler risks: workflows with many events silently break a numeric cap, triggers cannot be grouped as intended, and misleading descriptions could cause future developers to make incorrect assumptions. Left unfixed, these gaps erode trust in the project's validation layer and make it harder to safely extend the system.

## Solution Overview

The fix applies six targeted corrections to the schema files so that the Zod runtime definitions and the JSON Schema documentation definitions describe exactly the same data structures. Each correction is a small, self-contained edit — adding a missing property, changing a single-object type to an array, removing an incorrect numeric limit, making a field conditionally optional, and updating two pieces of misleading text. No new features are introduced and no behavior changes — the code already handles these data shapes correctly at runtime; the schemas are simply being updated to reflect reality.

After the fix, external validators will accept state save files that include the session token encryption flag, activity definitions will be able to declare multiple workflow triggers, and the state version counter will no longer silently conflict with a hard-coded upper limit. The Zod schema for `currentActivity` will match the JSON Schema's conditional requirement — required when a workflow is actively running but optional in terminal states. The stale description and comment are corrected so that future developers reading the schemas get accurate information about what each field means and how it relates to its counterpart.

---

## Work Packages

| # | Package | Status | Priority | Effort | Dependencies |
|---|---------|--------|----------|--------|-------------|
| 1 | [Schema Alignment](04-01-schema-alignment-plan.md) | ✅ Complete ([PR #80](https://github.com/m2ux/workflow-server/pull/80)) | 1st | 2–3h | None |
| 2 | [Validation Enforcement](04-02-validation-enforcement-plan.md) | Planned | 2nd | 3–4h | WP-01 |
| 3 | [Behavioral & Infrastructure Fixes](04-03-behavioral-infrastructure-plan.md) | Planned | 3rd | 2–3h | None |

## Timeline

| Phase | Duration | Running Total |
|-------|----------|---------------|
| WP-01: Schema Alignment | 2–3h agentic + review | 2–3h |
| WP-02: Validation Enforcement | 3–4h agentic + review | 5–7h |
| WP-03: Behavioral & Infrastructure Fixes | 2–3h agentic + review | 7–10h |

**Total:** 7–10 hours agentic development + ~2 hours human review across 3 PRs.

## Overall Success Criteria

- [ ] All 15 prism findings (F-01 through F-15) addressed
- [ ] `npm run typecheck` passes after all changes
- [ ] `npm test` passes after all changes
- [ ] No Zod/JSON Schema divergences remain for the 6 identified fields
- [ ] Skill loading enforces Zod validation
- [ ] Activity loading rejects invalid data (no fallthrough)
- [ ] Condition evaluation uses strict equality
- [ ] 3 PRs merged

## Links

| Resource | Link |
|----------|------|
| Source Audit | [Prism Analysis Report](../../prism-analysis/REPORT.md) — 15 findings (F-01 through F-15) |
| WP-01 PR | [#80](https://github.com/m2ux/workflow-server/pull/80) — Schema Alignment |

## Source

- [Prism Analysis Report](../../prism-analysis/REPORT.md) — 15 findings (F-01 through F-15)

## Documents

| # | Document | Purpose |
|---|----------|---------|
| — | [START-HERE.md](START-HERE.md) | Executive summary and status tracking |
| — | [README.md](README.md) | Navigation and document index |
| 03 | [Context Analysis](03-analysis.md) | Initiative context analysis |
| 04 | [WP-01 Plan](04-01-schema-alignment-plan.md) | Schema alignment scope and tasks |
| 04 | [WP-02 Plan](04-02-validation-enforcement-plan.md) | Validation enforcement scope and tasks |
| 04 | [WP-03 Plan](04-03-behavioral-infrastructure-plan.md) | Behavioral & infrastructure fixes scope and tasks |
| 05 | [Priority Ranking](05-priority-ranking.md) | Dependency graph and execution order |
