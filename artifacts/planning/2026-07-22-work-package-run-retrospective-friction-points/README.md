# Work-Package Run Retrospective Friction Points — July 2026

> Update · Created 2026-07-22 · **Status:** Planning

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

This session designs updates to `work-package` (and coupled `meta` surfaces) so the still-open friction points from [issue #271](https://github.com/m2ux/workflow-server/issues/271) — a retrospective on a **review-mode** run of `work-package` against midnight-node PR #1900 — become first-class, supported paths. It reuses this planning folder's prior #272 pass groundwork; the goal is to close the review-mode-specific surface without redrafting what #272 already delivered (PR #273) or what companion issue #270 already owns.

## Problem Overview

A prior work-package session ran in review mode against an external pull request (midnight-node PR #1900) to audit it for merge readiness, rather than to implement a new feature. That review-mode path through work-package is used far less than the create/implement path, so it carries friction the team hadn't yet worked through: places where the workflow's checkpoints, activity routing, or reporting assume an implementation is being built rather than judged. Issue #271 is the retrospective record of what went wrong or felt awkward during that run.

Many of those friction points overlap with a separate, already-completed design pass (issue #272, delivered on PR #273) that fixed nine friction points from a different work-package run, and with a still-open companion issue (#270) that owns template, link, and commit-ordering friction specifically. Left unaddressed, the review-mode-specific surface of #271 would keep costing reviewers time on every future audit-style run, even though the underlying workflow has already moved since the issue was first filed.

## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## 📊 Progress

| # | @ | Item | Description | Estimate | Status |
|---|---|------|-------------|----------|--------|
| 1 | 01 | Intake and context | Target, mode, planning folder | 15-30m | ✅ |
| 2 | 01 | [Format conventions](format-conventions.md) | Authoring literacy notes | 5-10m | ⊘ |
| 3 | 03 | [Design specification](03-design-specification.md) | Change goals and constraints | 20-40m | ⬚ |
| 4 | 03 | [Assumptions log](03-assumptions-log.md) | Open and settled assumptions | 10-15m | ⬚ |
| 5 | 04 | Pattern analysis | Applicable patterns and practices | 20-40m | ⬚ |
| 6 | 05 | [Impact analysis](05-impact-analysis.md) | Blast radius and preservations | 20-40m | ⬚ |
| 7 | 06 | [Scope manifest](06-scope-manifest.md) | File-level change inventory | 15-30m | ⬚ |
| 8 | 06 | [Drafting plan](06-drafting-plan.md) | Draft order and blocks | 10-20m | ⬚ |
| 9 | 06 | [Draft attestation](06-draft-attestation.md) | Batch review attestation | 5-10m | ⬚ |
| 10 | 06 | [File review note](06-file-review-note.md) | Removals and draft highlights | 5-10m | ⬚ |
| 11 | 08 | Quality review | Principle and anti-pattern audits | 30-60m | ⬚ |
| 12 | 08 | Principle findings | Principles audit satellite | 10-20m | ⬚ |
| 13 | 08 | Anti-pattern findings | Anti-pattern audit satellite | 10-20m | ⬚ |
| 14 | 09 | Validate and commit | Schema check, commit, PR | 20-40m | ⬚ |
| 15 | 10 | Post-update review | Follow-up after merge path | 15-30m | ⬚ |
| 16 | 11 | Retrospective | Session close-out | 15-30m | ⬚ |
| 17 | 11 | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables and limitations | 10-20m | ⬚ |

**Status:** ⬚ pending · ◐ in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Primary target | `workflows/work-package/` |
| Coupled target | `workflows/meta/` |
| Issue (this pass) | [#271](https://github.com/m2ux/workflow-server/issues/271) |
| Companion issue (out of scope) | [#270](https://github.com/m2ux/workflow-server/issues/270) — template / links / commit-ordering |
| Prior completed pass (this folder) | [#272](https://github.com/m2ux/workflow-server/issues/272) → PR [#273](https://github.com/m2ux/workflow-server/pull/273); see [COMPLETE.md](COMPLETE.md) |
| Audited external PR (subject of the retrospective) | midnight-node PR #1900 |
