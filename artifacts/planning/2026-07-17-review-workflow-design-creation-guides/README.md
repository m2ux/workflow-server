# Fix workflow-design compliance findings — July 2026

> Update · Created 2026-07-17 · **Status:** Reviewing

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Apply the two compliance findings from the prior review of `workflow-design` v1.24.3 (PR #254 worktree): declare the missing `pattern_analysis` technique Output, and normalize persist-guide cite anchors to `#template`. On return-to-draft, also remove `quality-review`'s four per-pass disposition checkpoints so audit-fixable findings are fixed automatically instead of asking the user to elect a disposition on each pass. Scope is technique-markdown plus one activity YAML and its README blurb — no activity add/remove/reorder.

## Problem Overview

`workflow-design` already ships the slim creation-guide structure on PR #254, but the compliance review left two open fixes before merge. The High issue is a binding gap: `pattern-analysis` assembles `{pattern_analysis}` without declaring that product as an Output, so agents and binding checks cannot treat it as a first-class result. The Low issue is cite-style drift—several persist steps link creation guides without the `#template` anchor that assemble steps already use—so readers and agents do not land on the same template home.

At pre-commit, the user rejected the attestation and asked for a different behavior: the quality-review activity should fix findings automatically rather than pausing at a checkpoint after every audit pass. Each of the four audit passes (expressiveness, conformance, rule hygiene, rule enforcement) had its own confirmation checkpoint with a 30-second auto-advance — technically non-blocking, but still a presentation the user did not want for findings that were always going to be fixed anyway.

Closing all three keeps the lean guide model intact while restoring Output fidelity, consistent guide citations, and a quality-review pass that acts on its own findings without an intervening checkpoint.

## Solution Overview

This update closes two compliance gaps on the Workflow Design definition and changes one piece of how quality review behaves. Agents will again see a declared product for the pattern-analysis comparison they assemble, every step that writes a planning guide will point readers to the same template section of that guide, and the quality-review activity now fixes what it finds instead of asking the user to confirm each fix in turn.

The activity sequence and creation-guide files stay as they are — only `quality-review`'s internal steps change. Its four audit passes still report a clean message when there is nothing to fix, but now report a plain statement (not a checkpoint) when findings remain, since the fix cycle that follows always applies them. The critical-finding blocker gate is untouched: a Critical finding still sends the workflow back to drafting regardless of how the other findings were resolved. After the nine files are updated and attested, a normal validate-and-commit pass can confirm the findings are closed and commit.

## Design Decisions

- [Design specification](03-design-specification.md) — purpose + update dimension deltas for the two compliance fixes (confirmed)
- [Assumptions log](03-assumptions-log.md) — no open design judgements after confirmation

## Compliance Findings

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| High | Undeclared `{pattern_analysis}` | `techniques/pattern-analysis.md` | Declare Output |
| Low | Persist cite `#template` drift | several techniques | Align anchors |

Detail: [08-compliance-review.md](08-compliance-review.md)

**Return-to-draft addition (not a compliance finding):** the user rejected pre-commit and asked that `quality-review` fix findings automatically instead of presenting a checkpoint per audit pass. See [05-impact-analysis.md §4](05-impact-analysis.md#4-follow-on-change--quality-review-auto-fix-2026-07-17-return-to-draft) for the removal detail.

## Scope Manifest

[06-scope-manifest.md](06-scope-manifest.md) — seven technique modifies (Output + `#template` cites) plus `activities/08-quality-review.yaml` + `activities/README.md` (quality-review auto-fix); `workflow.yaml` bump already applied (v1.24.4). Return-to-draft binding-fidelity pass adds 20 more files (17 techniques, 3 activities, tracked separately) — see [06-scope-manifest.md §Return-to-draft](06-scope-manifest.md#return-to-draft-binding-fidelity-pass--2026-07-17).

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
| 08 | Expressiveness | Schema expressiveness — 0 findings | — | ✅ Complete |
| 08 | [Conformance findings](08-conformance-findings.md) | 2 bare `#template` cites — fix-all applied | — | ✅ Complete |
| 08 | Rule hygiene / enforcement | 0 findings each | — | ✅ Complete |
| 08 | [Verified findings](08-verified-findings.md) | Post-draft verified set; no criticals | — | ✅ Complete |
| 08 | Quality review | Post-draft audits + conformance fixes | — | ✅ Complete |
| 09 | Validate and commit | Validated; pre-commit returned to draft (no commit) | — | ↩ Returned to draft |
| 03 | [Design specification](03-design-specification.md) | Refreshed — added quality-review auto-fix scope alongside the two prior fixes | — | ✅ Complete |
| 05 | [Impact analysis](05-impact-analysis.md) | Refreshed §4 — 4 intentional checkpoint removals, no content-preservation gap | — | ✅ Complete |
| 06 | [Scope manifest](06-scope-manifest.md) | Refreshed — added `activities/08-quality-review.yaml` + `activities/README.md` (file_count 7 → 9) | — | ✅ Complete |
| 06 | [Draft attestation](06-draft-attestation.md) | Refreshed — 9 new blocks for the quality-review auto-fix change | — | ✅ Complete |
| 06 | Scope and draft (return-to-draft) | `activities/08-quality-review.yaml` (v1.12.2 → 1.12.3) + `activities/README.md` drafted, schema-validated, attested | — | ✅ Complete |
| 08 | [Expressiveness findings](08-expressiveness-findings.md) | 4 next-step-narration findings on the new flagged-findings messages — fix-all applied (v1.12.3 → 1.12.4) | — | ✅ Complete |
| 08 | Conformance / rule hygiene / enforcement | 0 findings each on the checkpoint-removal change; prior C-1/C-2 cite fixes unregressed | — | ✅ Complete |
| 08 | [Verified findings](08-verified-findings.md) | Post-return-to-draft verified set; no criticals | — | ✅ Complete |
| 08 | Quality review | Second pass — audited the checkpoint-removal change itself; fix cycle closed in 1 iteration | — | ✅ Complete |
| 09 | Validate and commit | Schema-validation step's `check-binding-fidelity.ts` found 21 NEW violations (20 dead-output, 1 orphan-input) — returned to draft (no commit) | — | ↩ Returned to draft |
| 03 | [Design specification](03-design-specification.md) | Refreshed — added the binding-fidelity dead-output/orphan-input fix scope | — | ✅ Complete |
| 06 | [Scope manifest](06-scope-manifest.md) | Refreshed — 20-file binding-fidelity fix pass (`file_count` this pass: 20) | — | ✅ Complete |
| 06 | [Draft attestation](06-draft-attestation.md) | Refreshed — 24 new blocks for the binding-fidelity fix pass | — | ✅ Complete |
| 06 | Scope and draft (return-to-draft #2) | 17 technique files + 3 activity files drafted, schema-validated (`validate-workflow-yaml.ts`, `check-all-refs.ts`), attested | — | ✅ Complete |
| 08 | [Expressiveness findings](08-expressiveness-findings.md) | Third quality-review pass, audits the binding-fidelity fix pass — 5 findings (3 `bind-protocol-locals` read-site defects, 2 artifact-placement gaps) — fix-all applied | — | ✅ Complete |
| 08 | Conformance / rule hygiene / enforcement | 0 findings each on the binding-fidelity fix pass; prior fixes unregressed | — | ✅ Complete |
| 08 | [Verified findings](08-verified-findings.md) | Post-binding-fidelity-fix verified set; no criticals; one candidate withdrawn (would have regressed a dead-output exemption) | — | ✅ Complete |
| 08 | Quality review | Third pass — audited commit `aad982cf` itself; fix cycle closed in 1 iteration; re-verified with `check-binding-fidelity.ts` (0 NEW, 4 baseline fixes), `check-all-refs.ts`, `validate-workflow-yaml.ts` | — | ✅ Complete |
| 09 | Validate and commit | `check-binding-fidelity.ts` re-run — 0 NEW, plus the 5 additional fixes from this pass | — | ⬚ Pending |
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
