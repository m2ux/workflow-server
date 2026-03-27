# Tools Session Protocol - March 2026

**Created:** 2026-03-27
**Status:** Ready
**Type:** Bug-Fix

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Address 17 tool-layer findings from the quality and consistency audit that expose systematic gaps in the session protocol implementation. The tools layer independently interprets protocol requirements without a shared specification, producing silent failures, validation gaps, and protocol inconsistencies across `resource-tools.ts`, `state-tools.ts`, and `workflow-tools.ts`.

---

## Problem Overview

The workflow-server's tool handlers each implement their own interpretation of the session protocol, with no shared specification governing behavior. This means `get_skills` silently drops failed skill loads without surfacing errors, `save_state` crashes on malformed JSON input, state tools skip workflow consistency validation, and `start_session` returns the session token in a different location than documented. Hard-coded encryption keys, missing type guards, and redundant type casts further erode reliability.

These inconsistencies create operational risks: agents receive incomplete skill data without knowing something failed, malformed state payloads crash the server instead of returning meaningful errors, and the protocol documentation contradicts actual behavior. The cumulative effect is a session protocol layer that works in the happy path but degrades unpredictably under edge cases, making debugging difficult and protocol conformance impossible to verify.

---

## Solution Overview

The fix applies targeted changes to each of the three tool handler files to surface hidden failures, add missing validation, and align protocol behavior. In `resource-tools.ts`, skill-load failures are reported in the response, the `start_session` token moves to `_meta` to match all other tools, and resource deduplication logs dropped duplicates. In `state-tools.ts`, `JSON.parse` gets a try/catch wrapper, the hard-coded property key becomes a constant, decrypt failure provides key-rotation guidance, and both state tools gain workflow consistency validation.

In `workflow-tools.ts`, `get_trace` distinguishes tracing-disabled from empty-events, redundant casts and non-null assertions are removed, and the trace `act` field correctly reflects the new activity during transitions. All changes preserve backward compatibility for valid inputs — the only response shape change is `start_session` moving its token to `_meta`, which aligns it with the documented protocol.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 03 | [Comprehension artifact](03-codebase-comprehension.md) | Tool handler analysis | 20-45m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks and estimates | 20-45m | ✅ Complete |
| 05 | [Test plan](05-test-plan.md) | Test cases and coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | Code changes per plan | 1-2h | ⬚ Pending |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for review | 5-10m | ⬚ Pending |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#67](https://github.com/m2ux/workflow-server/issues/67) |
| PR | [#74](https://github.com/m2ux/workflow-server/pull/74) |
| Engineering | [Planning folder](https://github.com/m2ux/workflow-server/blob/engineering/.engineering/artifacts/planning/2026-03-27-tools-session-protocol/README.md) |

---

**Status:** Ready
