# Plain language capability — August 2026

> Capability · Created 2026-08-05 · **Status:** Complete (definitions on PR; main-repo submodule pointer not bumped)

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

A step that says "write it plainly" leaves an agent to invent what plain means. This work adds a self-contained `plain-language` workflow — author, rewrite, or audit a document against the four principles of ISO 24495-1 (relevant, findable, understandable, usable), with an optional ASD-STE100 controlled-language overlay for technical documentation. The ISO criteria live in one section-delivered resource that techniques cite rather than restate; the five atomic operations bind cross-workflow as `plain-language::<op>` so other workflows can reuse a single capability without copying it.

## Problem Overview

Today the corpus has no reusable plain-language capability. Agents drafting issues, PRs, docs, or other prose apply house-style guidance ad hoc, or invent their own reading of "plain." The related [artifact-audience](../2026-08-02-artifact-audience-and-plain-language/README.md) work governs *who* an artifact is for (human vs agent) and how planning artifacts should read; it does not encode a general document-authoring, rewrite, or audit procedure grounded in an external standard.

Without a shared criteria home, each run re-derives principles, duplicates guidance across techniques, and has no evaluate–revise loop that matches how ISO 24495-1 actually works — the four principles are interdependent, and only evaluation confirms a document is usable.

## Solution Overview

A new workflow family under `workflows/plain-language/` (23 files, +1,364 lines) on branch `workflow/plain-language-generation`, opened as [PR #431](https://github.com/m2ux/workflow-server/pull/431) against the `workflows` base. One `operation_type` (`author` / `rewrite` / `audit`) gates the graph; `{controlled_language}` independently layers ASD-STE100. Intake settles a reader profile; rewrite and audit run a source analysis; author and rewrite draft, evaluate in a loop, complete the Annex B checklist, and deliver. Techniques cite `plain-language/resources/plain-language-standard.md` and `plain-language/resources/asd-ste100.md` by section; they do not restate the guidelines.

## 📄 Documents

| # | Document | Contents |
|---|----------|----------|
| 1 | [01-design-decisions.md](01-design-decisions.md) | Settled design choices from the clarifying interview, alternatives weighed, and packaging for reuse |
| 2 | [02-sources.md](02-sources.md) | Primary and complementary sources (ISO 24495-1, ASD-STE100, Digital.gov / plain-language guidance) and how each maps into the capability |
| 3 | [03-deliverable-inventory.md](03-deliverable-inventory.md) | File tree, activity topology, technique bind addresses, artifact map, and verification status |
| 4 | [deferred-items.md](deferred-items.md) | Explicit non-goals and follow-ups left out of this change |

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Clarifying interview | Scope, modes, STE, artifacts, evaluation | 30-45m | ✅ |
| 2 | [Design decisions](01-design-decisions.md) | Topology and packaging choices | 20-30m | ✅ |
| 3 | [Sources](02-sources.md) | ISO distill + STE overlay + web research | 45-60m | ✅ |
| 4 | Workflow family draft | `workflow.yaml`, activities, techniques, resources | 2-3h | ✅ |
| 5 | Guard fix pass | Bare I/O ids, duplicate rule fragments | 20-30m | ✅ |
| 6 | [Deliverable inventory](03-deliverable-inventory.md) | File and contract record | 15-20m | ✅ |
| 7 | Submodule commit | Definitions on `workflow/plain-language-generation` | 10m | ✅ |
| 8 | [PR #431](https://github.com/m2ux/workflow-server/pull/431) | Against `workflows` base | 15-20m | ✅ |
| 9 | Main-repo gitlink bump | Point main at new workflows tip | — | ⊘ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Pull request | [#431](https://github.com/m2ux/workflow-server/pull/431) |
| Head branch | `workflow/plain-language-generation` |
| Base branch | `workflows` |
| Definition commit | [`6036456c`](https://github.com/m2ux/workflow-server/commit/6036456c) |
| Worktree | `.worktrees/workflow/plain-language-generation` |
| Primary source | `/home/mike1/Incoming/ISO_24495-1_2023_en.md` |
| Related (audience, not this capability) | [2026-08-02-artifact-audience-and-plain-language](../2026-08-02-artifact-audience-and-plain-language/README.md) |
| Canon reference used while drafting | `workflows/workflow-design/resources/` (design principles, schema construct inventory, anti-patterns) |
