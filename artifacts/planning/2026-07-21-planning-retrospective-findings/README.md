# Planning Retrospective Findings — July 2026

> Update · Created 2026-07-21 · **Status:** Reviewing

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Addresses retrospective findings extracted from the last 10 planning folders: recurring process defects and lessons-learned in the `workflow-design` and `work-package` workflows (broken `write-artifact` resource reference, transition-condition validation noise, checkpoint-default over-gating, block-interview loop discipline, and several smaller authoring-canon gaps). This session updates both workflows so the same defects stop recurring in future sessions.

## Problem Overview

See [design-specification.md](03-design-specification.md) for purpose and change goals; findings baseline in [structural-inventory.md](structural-inventory.md#update-scope).

## Solution Overview

See [design-specification.md](03-design-specification.md) for confirmed change goals; file-by-file scope in [scope-manifest.md](06-scope-manifest.md) (48 files).

## Design Decisions

- **Multi-target update** — `workflow-design` (primary) and `work-package` are both in scope; findings are grouped by target in [structural-inventory.md](structural-inventory.md#update-scope). `meta` has no standalone workflow entry in the catalog — shared techniques (e.g. `manage-artifacts::write-artifact`) are addressed via whichever target workflow currently references them.
- Gate 1 (`design-intent-batch`) did not fire: classification (`update`, clear change request) resolved without ambiguity per `intake-classification`'s own criteria; the multi-target scope is recorded here for visibility instead of via an interactive gate, consistent with several of the findings themselves (fewer confirmation gates, autonomous resolution then auto-proceed).
- **No activity-list changes** — every finding maps onto an existing activity, rule, technique, or resource in either workflow; see [design-specification.md § Activity list](03-design-specification.md#activity-list).
- **`write-artifact` binding defect confirmed structural** (not per-caller) via direct audit against both workflows' files — see [assumptions log A-1](03-assumptions-log.md#log).
- **Four open judgements batched into Gate 2** (`approve-to-commit`) and **confirmed as drafted** (`approved`): `switch-model-*` deprecation, `analysis-confirmed` removal, `project_type` seeding placement, and the `assumption_decisions` binding gap (A-11) — see [assumptions log](03-assumptions-log.md).

## Compliance Findings

Index of quality-review findings; detail in satellite artifacts. Remaining fixable count: **0** (`needs_audit_fixes: false`).

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| Critical | F-1 producer `condition` missing on audit/persist gates | `08-quality-review.yaml`, impact/completion persists | Restored conditions — [verified findings](08-verified-findings.md) |
| High | F-2 findings persist ungated | quality-review findings satellites | Gated with `*_finding_count > 0` — [verified findings](08-verified-findings.md) |
| High | F-3 incomplete `write-artifact` binds | WD activity `write-artifact` steps | All 24 binds carry required inputs — [verified findings](08-verified-findings.md) |
| High | C-1 duplicate compliance persist | `09-validate-and-commit.yaml` | Removed duplicate; kept `persist-report` — [conformance](08-conformance-findings.md) |
| Medium | C-2 procedural work as `action: message` | WP post-impl / WD validate-and-commit | Moved to technique protocol — [conformance](08-conformance-findings.md) |
| Medium | C-3 checkpoint message shape | `14-complete.yaml` `retrospective-confirm` | Statement-shaped message — [conformance](08-conformance-findings.md) |
| Medium | F-4 forEach interview producer | retrospective interview | Withdrawn — [verified findings](08-verified-findings.md) |

## Scope Manifest

See [06-scope-manifest.md](06-scope-manifest.md) — 48 files across `workflow-design` and `work-package`.

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Structural inventory](structural-inventory.md) | Baseline inventory for both targets + grouped findings | 15-30m | ✅ Complete |
| 01 | README | Session index (this file) | 5-10m | ✅ Complete |
| 03 | [Design specification](03-design-specification.md) | Confirmed dimension deltas (activity list, checkpoints, artifacts, rules) | 15-30m | ✅ Complete |
| 03 | [Assumptions log](03-assumptions-log.md) | Surfaced, audited, and open design assumptions | 15-30m | ✅ Complete |
| 03 | [Deferred items](deferred-items.md) | Out-of-scope items deferred from this update | 5-10m | ✅ Complete |
| 04 | Pattern analysis | Convention conformance across both targets | 15-30m | ⏭ Skipped (create-only) |
| 05 | [Impact analysis](05-impact-analysis.md) | Classify impact, integrity, removals (7 flagged) | 15-30m | ✅ Complete |
| 06 | [Scope manifest](06-scope-manifest.md) | File-by-file drafting per target | 1-3h | ✅ Complete |
| 06 | [Drafting plan](06-drafting-plan.md) | Per-file drafting deltas | — | ✅ Complete |
| 06 | [File review note](06-file-review-note.md) | Per-file review / removals | — | ✅ Complete |
| 06 | [Draft attestation](06-draft-attestation.md) | Block-indexed draft attestation | — | ✅ Complete |
| 08 | [Expressiveness findings](08-expressiveness-findings.md) | Schema expressiveness audit (pre-fix) | — | ✅ Complete |
| 08 | [Conformance findings](08-conformance-findings.md) | Convention conformance audit (pre-fix) | — | ✅ Complete |
| 08 | [Verified findings](08-verified-findings.md) | High-finding verification + fix-cycle outcome | 15-30m | ✅ Complete |
| 08 | Quality review | Anti-pattern / principle / expressiveness audit | 15-30m | ✅ Complete |
| 09 | Validate and commit | Schema validation, binding-fidelity, commit | 15-30m | ✅ Complete |
| 10 | Post-update review | Confirm delivered vs. scoped | 10-20m | ⬚ Pending |
| — | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables, design decisions, limitations | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow (primary) | `workflows/workflow-design/` |
| Target workflow (secondary) | `workflows/work-package/` |
| Source retrospectives | `.engineering/artifacts/planning/2026-07-20-phase-1-cloud-migration-update-agent-managed-worktree-architecture/deferred-items.md` and 9 other planning folders — see [structural-inventory.md](structural-inventory.md#update-scope) |
