# Fix Work Package Transition Folder Defect - May 2026

**Created:** 2026-05-20
**Status:** Ready
**Type:** Bug-Fix

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

When `start_session({ workflow_id: "meta" })` mints a transient `transition-<uuid>` planning slug and a subsequent `dispatch_child({ workflow_id: "<client>" })` is called, the server (a) does not promote the folder from the transient slug to a dated planning slug derived from the client work-package, and (b) writes the child session at the top level of `session.json` with the meta parent demoted into `parentSession`. This is the inverse of the documented `workflow-engine::handle-sub-workflow` contract, which requires the child to be embedded under `parent.triggeredWorkflows[N].state`. The fix restores the documented invariant and corrects the folder naming.

---

## Problem Overview

When a user starts a new piece of work, the workflow server first opens a temporary "scratchpad" folder while the system decides which workflow actually applies. Once the system knows what kind of work this is — for example, a work package against the workflow-server itself — it is supposed to rename that scratchpad folder to a dated, descriptive name and slot the new work into the existing record of what the system is doing, keeping the original record at the top of the file. Today the server does neither of these things: the folder keeps its temporary name forever, and the new work is written as if it were the only thing happening, with the prior record demoted into a nested field underneath it.

The consequence is that the on-disk planning trail no longer matches what the documented contract says it should look like, which makes it harder for anyone — human or agent — to find an in-flight work package by reading the planning directory, and harder for follow-up tooling to find the parent meta-session as the authoritative head record. Over many sessions this also leaves the planning directory cluttered with `transition-<uuid>` folders that carry no human-readable hint of what they were for, slowing down debugging and audit reviews of past work.

---

## Solution Overview

The fix updates a single branch of the dispatch code so the on-disk record of a new work package looks the way the system's own documentation says it should look. When the user starts a new work package today, the temporary "scratchpad" record is incorrectly turned into the top record on disk, with the prior tracking record demoted underneath it, and the folder keeps its temporary name. After the fix, the prior tracking record stays at the top, the new work package is slotted underneath it as a child entry, and the folder is renamed to a stable, dated name (either the name the user supplied at session start, or a derived name of the form `YYYY-MM-DD-<workflow-id>` when none was supplied). The temporary folder is cleaned up immediately afterwards.

The change is small and contained: one branch in `dispatch_child` is rewritten to match the already-correct branch used for non-temporary parents, with the one extra step of promoting the folder name. Two existing tests that currently lock in the buggy behaviour are flipped to assert the documented contract; four other tests that already exercise the correct behaviour for non-temporary parents act as untouched regression coverage. There are no schema changes, no new helpers added to the session store, and no migration of pre-existing on-disk records — the fix governs forward behaviour only.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Design philosophy](01-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 02 | [Comprehension: dispatch_child transient-parent path](../../comprehension/dispatch-child-transient-parent.md) | Code path, helpers, contract, and tests for the defect site | 20-45m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | Code changes per plan | 1-4h | ✅ Complete |
| 06 | [Post-implementation review](06-post-impl-review.md) | Single-pass focused review (manual diff + code + tests combined; full prism skipped per user direction) | 15-30m | ✅ Complete |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| 10 | [Validation](10-validation.md) | Typecheck + test suite verification (322 passed, 4 skipped) | 15-30m | ✅ Complete |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | _Skipped at user request (issue-verification checkpoint)_ |
| PR | [#121](https://github.com/m2ux/workflow-server/pull/121) |

---

## 📝 Implementation Notes

- **Slug-derivation refinement (Task 1).** The plan specified the promoted slug as `lookupTransientSlugByFolder(parentFolder) ?? \`${YYYY-MM-DD}-${workflow_id}\``. In practice the registry is always populated — `start_session` mints a synthetic `transition-<uuid>` slug when `planning_slug` is omitted and registers it the same way as a user-supplied slug — so the bare `??` fallback never fired and the workspace folder was being named `transition-<uuid>` (the exact symptom Task 5 was meant to catch). The implementation treats slugs that start with `transition-` as "no slug supplied" and falls through to the dated form. This is a behaviour-preserving refinement of the plan's intent (Option B), not a scope expansion: the only paths affected are those the plan already intends to land in the fallback.

---

**Status:** Ready — plan & test plan approved; PR body updated with planning summary; assumptions review complete (no open items, no deferrals).
