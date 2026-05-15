# Codebase Comprehension — Address Docs-Refresh Retrospective Issues

**Date:** 2026-05-15
**Activity:** `codebase-comprehension`
**Driving input:** [`01-design-philosophy.md`](01-design-philosophy.md), [`01-assumptions-log.md`](01-assumptions-log.md)
**Persistent artifact:** [`/.engineering/artifacts/comprehension/work-package-workflow-content.md`](../../comprehension/work-package-workflow-content.md) — the full comprehension write-up (architecture survey, key abstractions, design rationale, domain mapping, initial deep-dive, portfolio-lens pass) lives in the persistent knowledge-base location and was augmented for this work package.

This file in the planning folder is a pointer + the touch-site summary that the next activity (`plan-prepare`) needs in hand. It captures only the work-package-local context; the methodology and exhaustive analysis live in the persistent artifact.

---

## What this activity produced

- **New persistent artifact** at `.engineering/artifacts/comprehension/work-package-workflow-content.md` (created — no existing artifact covered work-package TOON content; existing artifacts cover server source).
- **All ten initial open questions resolved** through targeted code analysis in the persistent artifact's "Initial Deep-Dive" section (§A–§J).
- **Portfolio-lens pass complete** (pedagogy + rejected-paths) — convergent findings highlight DR-W1 (resource-as-prose-template) and DR-W3 (worker tool allowlist) as the two highest-leverage targets.
- **`has_open_questions = false`**, `needs_comprehension = false`. Comprehension-sufficiency checkpoint will not fire.

## Touch-site summary (for `plan-prepare` sequencing)

| # | File | Edit class | Drives |
|---|------|------------|--------|
| 1 | `workflows/work-package/skills/18-update-pr.toon` | Add 5 rules + new `verify-body` protocol phase | DR-W1, DR-W4 |
| 2 | `workflows/work-package/skills/12-review-strategy.toon` | Add reviewer-checklist phase mirroring the 5 rules | DR-W5 (defence-in-depth) |
| 3 | `workflows/work-package/resources/12-pr-description.md` | Add Issue-skipped placeholder variant; no other content change | DR-W4 |
| 4 | `workflows/work-package/activities/01-start-work-package.toon` | Add `verify-signing-precondition` step | DR-W2 |
| 5 | `workflows/work-package/activities/06-plan-prepare.toon` | Add `env-prerequisites` step (6 inline `validate` actions) + activity-level `loops[]` for the verify-rerender pattern if the initial render is here (otherwise only `submit-for-review` needs the loop) | Retrospective Medium |
| 6 | `workflows/work-package/activities/12-submit-for-review.toon` (NOT in original touch list — surfaced during comprehension) | Add activity-level `loops[]` with `maxIterations: 2` + new `body-non-conformant` checkpoint | DR-W1 verify loop |
| 7 | `workflows/meta/skills/00-workflow-engine.toon` | Rewrite `list-workflows` operation body to use harness `Read`+`Glob`; remove the `workflow-server.list_workflows` tool ref | DR-W3 |
| 8 | (conditional, §4.2 scope decision) `workflows/meta/skills/07-harness-compat.toon` + `workflows/meta/skills/00-workflow-engine.toon::dispatch-activity` | Document depth-1 constraint; add inline-fallback procedure for dispatch-activity when already a sub-agent | §4.2 |

Touch-site #6 was surfaced during comprehension — the original design philosophy mentioned only `update-pr` and `strategic-review` skills, but the verify-rerender loop is structurally an activity-level construct (per schemas/activity.schema.json L250), so the parent activity `submit-for-review` needs editing too. Flag for `plan-prepare`.

Touch-site #7 differs from the design philosophy's "rewrite the operation" framing: the activity's `operations[]` ref stays the same string (`workflow-engine::list-workflows`); only the operation's `procedure[]` and `tools` shrink. No activity TOON change.

## Five proposed rule strings (anchored in resource 12)

These are the canonical wording targets for the defence-in-depth pair (`update-pr.rules.pr-body-conformance.*` + `strategic-review.protocol.<new-phase>[]`). Final wording goes in `plan-prepare`'s `work-package-plan.md`; this list is the input.

| Rule id | Source anchor | One-line wording (draft) |
|---|---|---|
| `summary-max-two-sentences` | resource 12 lines 209–212 | "Summary section must be 1-2 sentences, lead with the outcome, and contain measurable impact when available." |
| `engineering-link-mandatory` | resource 12 lines 226–271, 491 | "Engineering link must be present, resolved from the parent repo's `git remote get-url origin` and current `git branch --show-current`, and must resolve to a committed file on the remote." |
| `issue-link-or-explicit-placeholder` | DR-W4 (no existing anchor in resource 12 yet) | "Issue line must be present. When `issue_skipped == true`, render `🐛 _Issue: skipped_` as an explicit placeholder rather than dropping the line or fabricating a number." |
| `no-commit-headings-in-changes` | resource 12 lines 302–319, 326–336 | "Changes section must group bullets by component (bold component name), not by Conventional Commits header or commit message." |
| `no-files-changed-list` | resource 12 lines 326–336 | "Changes section must not enumerate file paths. File-level detail belongs in the PR's Files-changed tab." |

## Variables changed by this activity

- `comprehension_artifact_path` → `/.engineering/artifacts/comprehension/work-package-workflow-content.md`
- `has_open_questions` → `false`
- `needs_comprehension` → `false`

## Carried-forward state confirmed unchanged

- `target_path`, `planning_folder_path`, `branch_name`, `component_name`, `project_type`, `complexity` (session-level `simple`, substantive `moderate`), `needs_elicitation = false`, `needs_research = false`, `skip_optional_activities = true`, `issue_skipped = true`, `pr_skipped = false`, `has_resolvable_assumptions = false`, `has_open_assumptions = true`, `pr_number = 120`, `pr_url = https://github.com/m2ux/workflow-server/pull/120`.

## Handoff

Next activity per the transition table: `plan-prepare` (because `skip_optional_activities == true`).

`plan-prepare` will:
1. Apply the design framework (resource 09) — likely just confirms the retrospective's "highest leverage first" sequencing.
2. Create `work-package-plan.md` — sequencing the eight touch sites, choosing scope for §4.1–§4.3 (A-DP-09), wording the five rules verbatim, deciding initial-render-also-verifies vs. only-final-verifies.
3. Create `test-plan.md` — how to test workflow-content edits (validator script `npx workflow-validator`, schema validation, smoke-run of `update-pr` against PR #120's body).
4. Reconcile any planning-phase assumptions; surface the two open work-package-level assumptions to `assumptions-review`.
