# Review-Mode Hardening: Config-Change & Interaction Defects - June 2026

**Created:** 2026-06-30  
**Status:** Delivered — work-package `complete` activity done (close-out written, worktree removed, main checkout clean); PR [#147](https://github.com/m2ux/workflow-server/pull/147) OPEN, awaiting merge; deferred coordinated baseline regeneration tracked  
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Harden the `work-package` workflow's review-mode path so it catches a class of defect that slipped through a real review: a one-line config change that is locally correct but globally harmful (unbounded orphan-storage growth on every routine governance close). Implements five augmentations — ingest-and-rebut existing PR feedback, a config-change blast-radius check, a lifecycle/conservation ledger in the structural pass, impact-based severity axes, and a reported-failure triage plus multi-instance coverage gate.

---

## Problem Overview

When the workflow reviews someone else's pull request, it reads the proposed change in isolation and judges whether the new lines of code are correct. In a recent real review this was not enough. A single-line configuration change was correct on its own, but it quietly changed how unrelated, untouched parts of the system behaved — causing the system to accumulate permanent leftover records every time a routine action ran. The review rated the change as safe to merge, even though another automated reviewer had already flagged the exact problem on the same pull request nineteen days earlier. The warning was simply never read, the side-effect had no place in the severity scale used to rate findings, and the part of the code that actually failed in the field had never been tested.

This work package closes that gap by teaching the review process five new habits: read and respond to every comment already on the pull request before forming a verdict; when a configuration or type setting changes, trace its effect through all the code that depends on it — not just the changed lines; prove that anything created always has a matching cleanup on every path, not only the one in the diff; recognise that code can be technically correct yet still harmful (for example, by causing unbounded growth) and rate it accordingly; and treat reported runtime errors and untested code variants as findings that must be explained, not quietly downgraded. The result is a review process that judges the whole system a change touches, rather than only the change itself.

---

## Solution Overview

The review-mode path of the `work-package` workflow learns five new habits so the class of defect that recently slipped through cannot pass un-flagged again:

1. **Read existing PR feedback first.** Before forming a verdict, ingest every comment already on the pull request (including other automated reviewers) and explicitly rebut or absorb each one — no prior warning goes unread.
2. **Trace config/type changes through their blast radius.** When a configuration or type setting changes, follow its effect through all dependent code, not just the changed lines.
3. **Prove conservation.** For anything created (records, allocations, handles), prove there is a matching cleanup on *every* path — not only the one shown in the diff.
4. **Score correct-but-harmful code.** Add an impact-based severity axis so a change that is technically correct yet harmful (e.g. unbounded growth) is rated accordingly rather than waved through.
5. **Triage reported failures and untested variants.** Treat reported runtime errors and untested code variants as findings that must be explained, never silently downgraded.

These are delivered as one new technique (ingest-and-rebut existing feedback) plus edits to four existing techniques, one resource, and two activity definitions — definition-layer only, no server source changes. See [the implementation plan](06-work-package-plan.md) for tasks and the [test plan](06-test-plan.md) for the verification strategy.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | E2E walk / lint / smoke coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | Technique + activity definition changes | 1-4h | ✅ Complete |
| 09 | [Lean-coding audit](09-review-findings.md) · [Debt ledger](09-debt-ledger.md) | Over-engineering review + ponytail ledger | 15-30m | ✅ Complete |
| 10 | [Change block index](10-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ✅ Complete |
| 10 | [Code review](10-code-review.md) | Automated definition-quality review | 10-20m | ✅ Complete |
| 10 | [Structural analysis](10-structural-analysis.md) | Conservation-law / lifecycle structural pass | 10-20m | ✅ Complete |
| 10 | [Test suite review](10-test-suite-review.md) | Harness coverage assessment | 10-20m | ✅ Complete |
| 10 | [Findings classification](10-findings-classification.md) | Severity classification + fix-cycle routing | 5-10m | ✅ Complete |
| — | [Comprehension artifact](../../comprehension/review-mode-path.md) | Review-mode path: branching, techniques, severity model, augmentation binding points (+ portfolio pedagogy/rejected-paths lenses & synthesis) | 20-45m | ✅ Complete |
| 11 | [Validation](11-validation.md) | E2E harness (lint / walk / snapshot) + typecheck verification | 15-30m | ✅ Complete |
| 12 | [Strategic review](12-strategic-review-1.md) | Scope-vs-issue fit; per-augmentation acceptance + motivating-defect trace | 15-30m | ✅ Complete |
| — | [Architecture summary](architecture-summary.md) | Review-mode path structure, five augmentations, key decisions | 10-15m | ✅ Complete |
| — | PR review | External review feedback cycle | 30-60m | ⏳ Awaiting merge (PR #147 open) |
| 06 | [Test plan (finalized)](06-test-plan.md) | Source-linked cases + in-branch verification results | — | ✅ Complete |
| 14 | [Completion summary](14-COMPLETE.md) | Deliverables, decisions, lessons learned, deferred items | 10-20m | ✅ Complete |
| 14 | [Workflow retrospective](14-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ✅ Complete |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | [#145](https://github.com/m2ux/workflow-server/issues/145) |
| PR | [#147](https://github.com/m2ux/workflow-server/pull/147) (open, base `workflows`) |

---

**Status:** Delivered — the `work-package` workflow `complete` activity is done: [completion summary](14-COMPLETE.md) and [retrospective](14-workflow-retrospective.md) written, [test plan finalized](06-test-plan.md) with source links + in-branch verification, dedicated worktree removed (branch fully pushed; nothing lost), reference monorepo left untouched (`workflows` submodule on branch `workflows` @ `6199ca91`). PR [#147](https://github.com/m2ux/workflow-server/pull/147) is OPEN and not yet merged. **Deferred (tracked, not silent):** after #147 merges into `workflows`, a coordinated server-repo change must bump the `workflows` submodule pointer to the merged commit AND regenerate the `[review-mode]` E2E baseline (`tests/e2e/__snapshots__/snapshot.test.ts.snap` + robot manifest) together. In-branch validation confirmed definition-lint clean (`BASELINE_UNRESOLVED = []`) and all 6 `workflow-e2e` policies reaching `complete`.
