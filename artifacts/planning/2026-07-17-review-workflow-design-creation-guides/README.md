# Fix workflow-design compliance findings — July 2026

> Update · Created 2026-07-17 · **Status:** Reviewing

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Apply the two compliance findings from the prior review of `workflow-design` v1.24.3 (PR #254 worktree): declare the missing `pattern_analysis` technique Output, and normalize persist-guide cite anchors to `#template`. Scope stays technique-markdown only—no activity or resource structure changes.

## Problem Overview

`workflow-design` already ships the slim creation-guide structure on PR #254, but the compliance review left two open fixes before merge. The High issue is a binding gap: `pattern-analysis` assembles `{pattern_analysis}` without declaring that product as an Output, so agents and binding checks cannot treat it as a first-class result. The Low issue is cite-style drift—several persist steps link creation guides without the `#template` anchor that assemble steps already use—so readers and agents do not land on the same template home.

Closing both keeps the lean guide model intact while restoring Output fidelity and consistent guide citations across the techniques that write planning artifacts.

## Solution Overview

This update closes two compliance gaps on the Workflow Design definition without changing how the workflow runs. Agents will again see a declared product for the pattern-analysis comparison they assemble, and every step that writes a planning guide will point readers to the same template section of that guide.

The activity sequence, checkpoints, and creation-guide files stay as they are. After the seven technique files are updated and attested, a normal validate-and-commit pass can bump the workflow patch version and confirm the findings are closed.

## Design Decisions

- [Design specification](03-design-specification.md) — purpose + update dimension deltas for the two compliance fixes (confirmed)
- [Assumptions log](03-assumptions-log.md) — no open design judgements after confirmation

## Compliance Findings

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| High | Undeclared `{pattern_analysis}` | `techniques/pattern-analysis.md` | Declare Output |
| Low | Persist cite `#template` drift | several techniques | Align anchors |

Detail: [08-compliance-review.md](08-compliance-review.md)

## Scope Manifest

[06-scope-manifest.md](06-scope-manifest.md) — seven technique modifies (Output + `#template` cites); `workflow.yaml` bump deferred.

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| — | Session initialized | Child workflow-design session live | — | ✅ Complete |
| 01 | Structural inventory | Baseline counts for workflow-design v1.24.3 (PR #254 worktree) | — | ✅ Complete |
| 01 | Format conventions | YAML/project literacy for this update | — | ✅ Complete |
| 01 | Applicable constructs | Schema constructs for Output + cite fixes | — | ✅ Complete |
| 01 | Intake and context | Update seeded from review; change request from compliance findings | — | ✅ Complete |
| 08 | Principle findings | Stance score + creation-guide focus | — | ✅ Complete |
| 08 | Anti-pattern findings | Catalog walk vs PR worktree | — | ✅ Complete |
| 08 | Verified findings | Adversarial High re-derivation | — | ✅ Complete |
| 08 | Compliance review | Rolled-up decision surface | — | ✅ Complete |
| 08 | Quality review | Disposition: fix-issues → intake | — | ✅ Complete |
| 03 | Design specification | Purpose + dimension deltas for Output + cite fixes | — | ✅ Complete |
| 03 | Assumptions log | Null — scope locked at confirmed spec | — | ✅ Complete |
| 03 | Requirements refinement | Confirm update dimensions for the two findings | — | ✅ Complete |
| 04 | Pattern analysis | Reference alignment for the technique edits | — | ⬚ Pending |
| 05 | [Impact analysis](05-impact-analysis.md) | Blast radius for Output + cite changes | — | ✅ Complete |
| 06 | [Scope manifest](06-scope-manifest.md) | Seven technique modifies | — | ✅ Complete |
| 06 | [Drafting plan](06-drafting-plan.md) | Per-file deltas for Output + cite fixes | — | ✅ Complete |
| 06 | [File review note](06-file-review-note.md) | Per-file attestation; no removals | — | ✅ Complete |
| 06 | [Draft attestation](06-draft-attestation.md) | Block-indexed batch review | — | ✅ Complete |
| 06 | Scope and draft | Seven technique files drafted and attested | — | ✅ Complete |
| 08 | Quality review | Post-draft compliance pass | — | ⬚ Pending |
| 09 | Validate and commit | Validate and commit in edit tree | — | ⬚ Pending |
| 10 | Post-update review | Confirm findings closed | — | ⬚ Pending |
| 11 | Retrospective | Close-out | — | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/workflow-design/` (edit tree below) |
| PR #254 | https://github.com/mmeadows-dev/workflow-server/pull/254 |
| Worktree | `/home/mike1/projects/work/workflows/2026-07-17-workflow-design-slim-planning-artifacts/workflow-design` |
| Structural inventory | [01-structural-inventory.md](01-structural-inventory.md) |
| Format conventions | [01-format-conventions.md](01-format-conventions.md) |
| Applicable constructs | [01-applicable-constructs.md](01-applicable-constructs.md) |
| Compliance report | [08-compliance-review.md](08-compliance-review.md) |
