# Strategic Review — DCO Policy Compatibility

**Work Package:** DCO Policy Compatibility
**PR:** [#109](https://github.com/m2ux/workflow-server/pull/109)
**Branch:** `dco-update-2026-05-18` (head `2d93abc`, was `5369ef9` before fix-findings pass, `1d490c8` before initial cleanup)
**Base:** `workflows`
**Date:** 2026-05-19 (initial pass); 2026-05-20 (fix-findings pass)
**Reviewer:** strategic-review worker

---

## Summary

PR #109 contains 14 files changed (+235/-107) across the work-package workflow surface, plus two strategic-review cleanup commits applied here. Changes are minimal, on-topic, and aligned with the DCO-Safe Agentic Coding Policy. One Minor orphan-reference finding was identified and fixed in-place (S1); one Informational finding (S2: stale activities/README.md) was initially deferred and then resolved in a fix-findings pass after the user opted to address it before submit-for-review.

**Outcome:** `acceptable` — no findings ≥ Major remain; both S1 and S2 resolved in-PR.

---

## Scope Assessment

### Files touched (14)

| File | Change shape |
|------|--------------|
| `work-package/workflow.toon` | Variable surface: +`rationale_confirmed`, +`squash_merge_available`, +`context_scope`; –`unsigned_commits_in_pr`, –`resign_unsigned_commits_requested`, –`unsigned_commit_list_summary`. Version 3.11.0 → 3.12.1. |
| `work-package/README.md` | Skill count 24 → 26. |
| `work-package/skills/README.md` | Skill count 25 → 26; updated skill-15 capability description; +skill-25 row. |
| `work-package/activities/01-start-work-package.toon` | +`detect-merge-strategy` step; +`squash_merge_available` in context_to_preserve. |
| `work-package/activities/04-research.toon` | +`declare-context-scope` step; +`context-scope-declaration` checkpoint; +`dco-provenance` supporting skill. |
| `work-package/activities/08-implement.toon` | +`provenance-log.md` artifact; +`log-provenance` step in task-cycle; +`dco-provenance` supporting skill. |
| `work-package/activities/09-post-impl-review.toon` | `file-index-table` checkpoint reworked to record rationale confirmation; +`rationale-amendment` checkpoint; C1 fix (rationale_confirmed gate). 1.9.0 → 1.11.0. |
| `work-package/activities/10-validate.toon` | –`scan-commit-signatures-for-strategic` step; cleaned context_to_preserve. 3.0.0 → 3.1.0. |
| `work-package/activities/11-strategic-review.toon` | –`unsigned-commits-prompt` checkpoint; –`resign-unsigned-pr-commits` step. 2.5.1 → 2.6.0. |
| `work-package/activities/12-submit-for-review.toon` | –`verify-commit-signatures` step; +`dco-sign-off` step+checkpoint (blocking); +`instruct-merge-strategy` step; +`merge-strategy-reminder` checkpoint. 1.3.0 → 1.4.0. |
| `work-package/activities/13-complete.toon` | Skills list alphabetized; –`resign-artifact-commits` step (already removed in earlier history). 1.5.0 → 1.6.0. |
| `work-package/resources/12-pr-description.md` | +`## AI Assistance` section template. |
| `work-package/skills/15-manage-git.toon` | +`code-commits`, +`detect-merge-strategy`, +`squash-merge-instruction` protocols; –`gpg-resign-range` protocol; relaxed `artifact-commits` (no longer mandates `--no-gpg-sign`). |
| `work-package/skills/25-dco-provenance.toon` (new) | New skill: provenance-log schema, attestation recording, context-scope classification. |
| `work-package/skills/12-review-strategy.toon` (cleanup commit) | –orphan `commit-signatures` protocol block. 1.3.0 → 1.4.0. |

### Verdict

Diff is **minimal and focused**. Every change is traceable to one of four shifts the PR is built around:

1. Detect merge strategy up-front (`01`, `15-manage-git`)
2. Capture provenance during research and implementation (`04`, `08`, `25-dco-provenance`, `12-pr-description.md`)
3. Strengthen per-block rationale confirmation (`09`)
4. Gate PR submission on human DCO sign-off (`12`)

Plus three cleanup vectors aligned with the same theme: drop the resign infrastructure (`10`, `11`, `13`), drop the per-commit signing mandate (`15-manage-git`), and update inventory counts (`README.md`, `skills/README.md`, `workflow.toon`).

**No scope creep detected.** The cargo-operations alphabetical reorder in `13-complete.toon` and the inventory-count updates are cosmetic but justified by the surface change.

---

## Investigation Artifacts / Over-engineering / Orphans

| # | Severity | Type | Finding | Action |
|---|----------|------|---------|--------|
| S1 | Minor | Orphan reference | `work-package/skills/12-review-strategy.toon` `commit-signatures` protocol block referenced `resign-unsigned-pr-commits` (removed step) and `unsigned_commits_in_pr` (removed variable). No consumer called this protocol. | **Fixed**: removed block; bumped skill 1.3.0 → 1.4.0. Commit `5369ef9`. |
| S2 | Informational | Stale documentation | `work-package/activities/README.md` (hand-maintained doc) had stale lines referencing `scan-commit-signatures-for-strategic`, `resign-unsigned-pr-commits`, `unsigned-commits-prompt`, the unsigned-commits mermaid node, and missed the new DCO surface (dco-sign-off, merge-strategy-reminder, declare-context-scope, provenance-log, rationale-amendment). | **Resolved**: refreshed activities README to match current TOON state for activities 04, 08, 09, 10, 11, 12. Commit `2d93abc`. Scoped to PR #109's changes; pre-existing doc rot in unrelated sections left untouched. |

No over-engineering identified. No investigation/debug artifacts. No commented-out code introduced. No duplicate functionality. The new `dco-provenance` skill carries exactly the surface the activities reference; no speculative interface.

---

## README Conformance (planning folder)

Hand-authored on rebase; checked against sibling planning READMEs (`2026-05-13-server-managed-session-state`).

| Section | Present | Notes |
|---------|---------|-------|
| H1 title | ✅ | `# DCO Policy Compatibility - April 2026` |
| Status (header block) | ✅ | Bolded fields at top: Created / Status / Type |
| Executive Summary | ✅ | `## 🎯 Executive Summary` |
| Problem Overview | ✅ | `## Problem Overview` |
| Solution Overview | ✅ | `## Solution Overview` |
| Progress | ✅ | `## 📊 Progress` (table with 17 rows) |
| Links | ✅ | `## 🔗 Links` |
| Footer status | ✅ | Trailing status statement |

**Conformance:** matches template + sibling convention. No drift.

---

## changes/ Fragment

Target repo root has no `changes/` directory. The workflow-server is not a Towncrier project. `ensure-changes-folder-entry` and `verify-change-fragment` are no-ops. `fragment_references_issue` set to `null`.

---

## PR Body Conformance

Not re-run in this pass — the PR description was last updated at submit-for-review and contains the `## AI Assistance` block defined in `resources/12-pr-description.md`. Any update-pr findings would be raised by `update-pr::verify-body` at submit time.

---

## Findings Summary

```
[Minor]         S1: orphan commit-signatures protocol block in skill 12 — RESOLVED in commit 5369ef9
[Informational] S2: stale references in activities/README.md (hand-maintained) — RESOLVED in commit 2d93abc (fix-findings pass)
```

- Critical: 0
- Major: 0
- Minor: 1 (resolved in this activity)
- Informational: 1 (resolved in fix-findings pass)

---

## Variable Outputs

| Variable | Value |
|----------|-------|
| `review_passed` | `true` |
| `needs_strategic_fixes` | `false` (resolved via fix-findings pass; S1 + S2 both addressed) |
| `needs_cleanup` | `false` (cleanup applied inline; nothing left) |
| `recommended_strategic_option` | `acceptable` |
| `fragment_references_issue` | `null` |
| `strategic_findings_summary` | `[Minor] S1: orphan commit-signatures protocol — RESOLVED (5369ef9). [Informational] S2: stale activities/README.md — RESOLVED (2d93abc).` |
