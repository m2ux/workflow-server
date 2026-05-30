# Markdown Skills Migration Implementation - May 2026

**Created:** 2026-05-28  
**Status:** In Progress  
**Type:** Refactor

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Implement the markdown-skills migration designed in the 2026-05-22 planning artifact. Replace TOON-based per-workflow skills with markdown techniques and resources stored under each workflow folder, served by the workflow-server with workflow-local to `meta` precedence resolution and a TOON-projection delivery pass for techniques. This unifies the on-disk content shape and removes the duplicate skill source.

---

## Problem Overview

The workflow-server currently delivers per-workflow knowledge through a TOON-encoded skill format that lives alongside the workflow definitions. Authoring these files requires understanding the TOON projection rules in addition to the underlying intent, and the format is harder for humans to read and edit than plain markdown. The migration plan committed on 2026-05-22 documented the target shape — per-workflow `techniques/` and `resources/` folders containing markdown files, with `workflows/meta/` doubling as the cross-workflow shared layer — but the implementation was deferred.

Until the markdown layout is live, contributors cannot iterate on workflow knowledge in the same medium they iterate on every other artifact. The TOON skill source also remains duplicated against the planning-folder markdown that the design produced, so any drift between the two has to be reconciled by hand. Shipping this migration removes both frictions and makes the workflow-server's skill-resolution code easier to evolve.

---

## Solution Overview

Today, the workflow-server stores its workflow knowledge — the instructions and reference material that guide AI agents through each step of a workflow — in a specialised text format called TOON that is faster for machines to parse but harder for people to read and edit. Contributors who want to improve a workflow have to learn that format on top of understanding the change they want to make, which slows things down and discourages contributions. The migration replaces TOON storage with plain markdown files, organised in clear per-workflow folders, while keeping the on-the-wire format that agents see unchanged. After the change, anyone who can read a markdown file can read, review, and propose edits to the workflow knowledge, but every agent that talks to the workflow-server continues to receive exactly the same content it received before.

The change ships in two coordinated steps so nothing breaks during the transition. First, all the existing knowledge is rewritten into markdown files and placed into the new per-workflow folders on the content branch — this is the source-of-truth flip. Second, the workflow-server is updated to read those markdown files, with a built-in rule that lets each workflow override shared content when it needs to. As a final touch, the server projects each markdown file back into the original on-the-wire format before sending it to agents, so existing agents and tests continue to work without modification. A test suite captures the current on-the-wire output of every piece of knowledge before the change and pins the new code to produce byte-equivalent output, providing a strong guarantee that the migration preserves behaviour.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Design philosophy](01-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 02 | [Codebase comprehension](02-codebase-comprehension.md) | Skill/resource/workflow loaders + TOON-projection delivery deep-dive | 20-45m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | Code changes per plan | 2-4h | ✅ Complete |
| — | [Provenance log](provenance-log.md) | AI-assistance attribution per task | 10m | ✅ Complete |
| 06 | [Change block index](change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ✅ Complete |
| 06 | [Manual diff review](manual-diff-review-report.md) | User-attested rationale + finding F1 record | 10-20m | ✅ Complete |
| 06 | [Code review](code-review.md) | Automated code quality review | 10-20m | ✅ Complete |
| 06 | [Structural findings](structural-findings.md) | L12 single-pass structural analysis | 10-20m | ✅ Complete |
| 06 | [Test suite review](test-suite-review.md) | Test quality and coverage assessment | 10-20m | ✅ Complete |
| 06 | [Architecture summary](architecture-summary.md) | C4 context + package + sequence diagrams | 10-20m | ✅ Complete |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ✅ Complete |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#125](https://github.com/m2ux/workflow-server/issues/125) |
| Original Plan | [2026-05-22-claude-skills-migration](../2026-05-22-claude-skills-migration/) |
| PR (source) | [#126](https://github.com/m2ux/workflow-server/pull/126) — draft, `feat/125-markdown-skills-migration` ← `main` |
| PR (content) | _Pending_ — will track `feat/125-markdown-skills-content` ← `workflows` once content lands |

## 🌿 Branches & worktrees

This work-package touches BOTH the workflow-server source branch AND the workflows-data branch in parallel.

| Side | Branch | Base | Worktree | Scope |
|---|---|---|---|---|
| **workflow-server source** | `feat/125-markdown-skills-migration` | `origin/main` | `~/projects/work/workflow-server/2026-05-28-markdown-skills-impl/` | `src/`, `schemas/`, `dist/` — the markdown loader, precedence resolver, TOON-projection delivery pass |
| **workflows content** | `feat/125-markdown-skills-content` | `origin/workflows` | `~/projects/work/workflows/2026-05-28-markdown-skills-impl/` | New `workflows/<workflow>/{techniques,resources}/` content sourced from the planning-folder `legacy/{work-package,meta}/` trees |

Coordination: the two branches land via two PRs that merge in order — content side first to populate the new layout, then the source side to flip the loader. Implementation tasks must specify which worktree they operate against.

---

**Status:** Ready. Implementation plan and test plan authored. Plan covers Phase A (content placement on `feat/125-markdown-skills-content`), Phase B (source-side markdown loader, precedence resolver, projection function, resource-loader flip on `feat/125-markdown-skills-migration`), and Phase C (cutover — remove legacy TOON skills and the dual-mode safety fallback). Test plan covers 16 cases across markdown parsing, op-as-child-files assembly, precedence resolution, projection identity against captured TOON baselines, resource-loader format flip, and tool-layer preamble parity.
