# Workflow Retrospective: Refresh Workflow-Server Docs

**Date:** 2026-05-15
**Work Package:** Refresh workflow-server repository documentation (no associated issue)
**PR:** [#119](https://github.com/m2ux/workflow-server/pull/119) (approved at `review-outcome`; awaiting merge)

---

## Session Analysis

This retrospective draws from observable artefacts: the `session.json` checkpoint map, the planning folder contents, commit history on `chore/refresh-workflow-server-docs` and on the engineering submodule, the strategic-review findings recorded in `07-strategic-review.md`, the validation report in `07-validation.md`, and the mid-flight observations captured in `13-retrospective-stager.md` (committed as `4913f0f` on the engineering branch).

**Checkpoint responses recorded in `session.json`:**

| Activity / step | Checkpoint | Resolution |
|-----------------|------------|------------|
| `start-work-package` | `issue-verification` | `skip-issue` |
| `start-work-package` | `pr-creation` | `proceed` |
| `design-philosophy` | `classification-confirmed` | `confirmed` |
| `design-philosophy` | `workflow-path-selected` | `skip-optional` (simple) |
| `plan-prepare` | `approach-confirmed` | `confirmed` |
| `plan-prepare` | `assumptions-review-assumption-decision` | `accept` |
| `implement` | `switch-model-pre-impl` | `continue-current` |
| `implement` | `switch-model-post-impl` | `continue-current` |
| `post-impl-review` | `file-index-table` | `no-issues` |
| `strategic-review` | `unsigned-commits-prompt` | `resign-all` |
| `strategic-review` | `review-findings` | `acceptable` |
| `submit-for-review` | `review-received` | `yes-review` |
| `submit-for-review` | `review-outcome` | `approved` |

**Workflow path chosen:** simple complexity, optional activities skipped (`needs_elicitation=false`, `needs_research=false`). Path: `start-work-package` → `design-philosophy` → `plan-prepare` → `implement` → `post-impl-review` → `validate` → `strategic-review` → `submit-for-review` → `complete`.

**Implementation:** 4 commits on `chore/refresh-workflow-server-docs` landed the refresh (`281a497` planning seed, `49b5b98` API/entry-point docs, `7d9836c` architecture and model docs, `7de8898` schemas docs). All four commits were initially unsigned and were re-signed via `git rebase --keep-empty --force-rebase -S` during `strategic-review`; the re-signed tip is `7de8898`.

**Review feedback items:** 3 — all related to PR-description structure (see "Review-time corrections" below). All addressed by an out-of-band PR-body rewrite before `review-outcome`.

**Strategic-review findings:** 0 critical / 0 major / 0 minor. Diff scope confirmed docs-only (+94/-33 across 12 files).

---

## Observations

### Review-time corrections (PR-description deviations)

The user caught three deviations of the PR #119 body from the canonical template at `workflows/work-package/resources/12-pr-description.md` when responding to the `review-received` checkpoint. The deviations were:

| # | What the workflow allowed | Reviewer's correction | Root cause |
|---|---------------------------|-----------------------|------------|
| 1 | The 🐛 Issue link was missing entirely — neither a real link nor a placeholder. | Template says "Always include" — at minimum a placeholder explaining the omission. | The work-package was started with `skip-issue` at `start-work-package-issue-verification`. The `update-pr` skill renders resource 12 without a code-path for `issue_skipped=true`, so the section silently disappeared. |
| 2 | Summary was a single paragraph with subordinate clauses (multi-sentence). | Template prescribes 1-2 sentences. | The Summary rule is prose inside resource 12 rather than a checked `rules:` entry on `update-pr`; nothing verified length after render. |
| 3 | Changes were organised under three commit-message-styled headings (`docs: refresh API and entry-point docs (T1–T6 + T14 baseline)`, etc.) with embedded `T1`–`T11` task IDs. | Template's "What NOT to Include" table forbids commit lists; Changes are meant to be grouped by component. | Same gate-shape as #2 — the anti-pattern lives in a markdown table inside resource 12 rather than as enforceable `rules:` on `update-pr`. The diff in `strategic-review` does not include the PR body, so that gate did not see the deviation either. |

The deviations were fixed inline via a PR-body rewrite before continuing past `review-outcome`. The pre-staged stager (`13-retrospective-stager.md`) captures root-cause analysis and a ranked set of workflow improvements (see "Improvement Recommendations" below).

### Activity-flow signals

| # | Signal | Source | Workflow observation |
|---|--------|--------|----------------------|
| 1 | All 4 commits on the feature branch were unsigned at validation time; re-signed during `strategic-review`. | `07-validation.md` commit-signature scan; `07-strategic-review.md` §6. | The detection happened *after* implementation and post-impl-review had already landed. Re-signing is straightforward (one `git rebase --keep-empty --force-rebase -S`), but it asks the user to authorise a rebase + force-push at the end of the work — late in the lifecycle. |
| 2 | Strategic-review found 0 findings ≥ Minor on the source diff itself. | `07-strategic-review.md` §2. | The implementation, post-impl-review, and validate activities caught everything functional. The friction in this work package was concentrated entirely in the PR-description gate, not in the code. |
| 3 | A20 (workflow worktree prerequisite) surfaced mid-implementation rather than at `plan-prepare`. | `01-assumptions-log.md`. | The implement worker had to run `git worktree add ./workflows workflows` before tests would pass. That prerequisite was not captured during `plan-prepare`, so the test-baseline step in `implement` first failed and then required an out-of-plan assumption to resolve. |
| 4 | A `discover-session` worker had to work around a tool restriction by reading `workflows/*/workflow.toon` directly. | Mid-flight observation in stager. | The meta activity prescribes `workflow-engine::list-workflows` (which calls the `list_workflows` MCP tool), but the worker-agent rules forbid that tool for workers. The mismatch between activity prescription and worker tool allow-list forced a workaround. |

### Process questions / friction points

| # | Observation | Workflow section | Potential improvement |
|---|-------------|------------------|----------------------|
| 1 | PR body was the gate that surfaced the only review feedback on this run, yet no skill verifies it. | `update-pr`; `strategic-review`. | Add a deterministic verifier to `update-pr` AND a checklist line item to `strategic-review` (see High-Priority recommendation #1). |
| 2 | The `skip-issue` checkpoint option and resource 12's "Always include Issue link" rule are inconsistent. | `start-work-package` / `update-pr`. | Resolve by either dropping `skip-issue` for non-trivial classes or adding a placeholder-rendering rule. |
| 3 | Environment prerequisites for the test baseline (workflows worktree) surfaced as a mid-implementation assumption. | `plan-prepare`. | Add a "verify environment prerequisites" step so the test-baseline action in `implement` is unambiguous. |

---

## Improvement Recommendations

The five recommendations below are folded in from the mid-flight stager (`13-retrospective-stager.md`) with priorities adjusted against the final session evidence. Item 1 (the strategic-review checklist line) is the single highest-leverage change — it would have caught all three deviations on this run.

### High Priority

| # | Issue | Recommendation | Affected Section |
|---|-------|----------------|------------------|
| 1 | PR-body deviations from canonical template were the only review feedback on this run, and `strategic-review` rated the work `acceptable` while the deviations stood. | Add an explicit reviewer checklist item to `strategic-review` ([12-review-strategy.toon](../../../../workflows/work-package/skills/12-review-strategy.toon)): "PR body conforms to canonical template (Summary length, no commit-grouped Changes, Issue link present or placeholder rendered)". The strategic-review skill is the gate that already passes/fails PRs, so the checklist line is the lowest-friction place to enforce the contract. | `strategic-review` skill (`12-review-strategy.toon`) |

### Medium Priority

| # | Issue | Recommendation | Affected Section |
|---|-------|----------------|------------------|
| 1 | `update-pr` renders the canonical PR-description template but does not verify the rendered body against the template's rules — anti-patterns in markdown tables are advisory only. | In `update-pr` ([18-update-pr.toon](../../../../workflows/work-package/skills/18-update-pr.toon)), extend the `update-description` protocol with a verify step that — after rendering and before `gh api PATCH` — checks deterministic rules against the rendered body: required sections present in correct order; Summary ≤ 2 sentences; Changes bullets prefixed with `**ComponentName**` and contain no commit-message-styled headings or task-ID references; Issue link present OR explicit `_No issue: …_` placeholder; engineering link resolves to a committed path on the configured engineering branch. Loop back to re-render on failure. | `update-pr` skill (`18-update-pr.toon`) |
| 2 | Commits arrived unsigned and needed re-signing during `strategic-review`, late in the lifecycle. | The `manage-git::commit` operation could detect missing `commit.gpgsign` and prompt at first-commit time rather than at review — or `start-work-package` could pre-check signing config and emit a one-time checkpoint. | `manage-git::commit`; `start-work-package` |

### Low Priority / Observations

| # | Issue / Observation | Recommendation / Consideration | Affected Section |
|---|----|----|----|
| 1 | Template anti-patterns live in a markdown "What NOT to Include" table inside resource 12. | Promote the strongest constraints to `rules:` on `update-pr` so they have the same status as `draft-first`: `no-commit-headings-in-changes`, `no-task-ids-in-changes`, `summary-max-two-sentences`, `engineering-link-mandatory`. Rules-as-code make them testable and let `strategic-review` reference them directly. | `update-pr` skill; resource 12 |
| 2 | The `skip-issue` checkpoint option and "Always include Issue link" rule are inconsistent. | Resolve by either removing `skip-issue` as a checkpoint option for non-trivial complexity classes, or adding a `pr-description-skip-issue-render` rule that requires a specific italic placeholder line so reviewers see the absence is intentional. | `start-work-package`; resource 12 |
| 3 | The rendered PR body is a transient artefact — it's neither persisted nor reviewable until after it lands on the remote. | Have `update-pr` write the rendered body to `08-pr-body-rendered.md` in the planning folder before pushing. Two benefits: the deviation becomes visible during `post-impl-review` (it is now in the diff), and the body becomes a reviewable artifact rather than a transient `/tmp` file. | `update-pr` skill |
| 4 | `discover-session` (meta) prescribes a tool the worker cannot call (`list_workflows`). | Either lift the restriction for this operation or rewrite the operation to use a worker-safe primitive. | `meta/discover-session` activity |
| 5 | Workflows-worktree prerequisite surfaced as A20 mid-implementation. | Add a "verify environment prerequisites" step to `plan-prepare` so the test-baseline action in `implement` is unambiguous. | `plan-prepare` activity |
| 6 | Unsigned-commit detection happens late (at `strategic-review`). | Move detection earlier — e.g., into `start-work-package` after the first commit, or into a pre-implement sanity check — so the user is not asked to authorise a rebase + force-push at the end of the work package. | `start-work-package`; `validate` activity |

---

## Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Activities completed | 9 (start-work-package, design-philosophy, plan-prepare, implement, post-impl-review, validate, strategic-review, submit-for-review, complete) | Simple-complexity path; `requirements-elicitation` and `research` skipped as `skip-optional` |
| Checkpoints triggered | 13 | Counts from `session.json#checkpointResponses` |
| Plan revisions | 0 | First-pass plan accepted at `plan-prepare-approach-confirmed` |
| Commits on feature branch | 4 | All re-signed during `strategic-review`; new tip `7de8898` |
| Tests delivered | 256 passed / 2 skipped / 0 failed | Docs-only work package — no new tests; existing suite confirmed green before and after edits |
| Strategic-review findings | 0 critical / 0 major / 0 minor / 0 informational on source diff | All friction concentrated in the PR-description gate (see Observations) |
| Review-feedback items | 3 — all resolved inline via out-of-band PR-body rewrite | All three concerned PR-description deviations from canonical template |
| Workflow deviations | None — every transition matched the expected `transition_condition` | |

---

## Summary

**Overall Session Quality:** Smooth on the source side; concentrated friction at the PR-description gate.

**Key Takeaway:** Every review-feedback item on this work package clustered around a single root cause — the `update-pr` skill renders the canonical PR-description template but no gate verifies the rendered body against the template's own rules. The template's strongest constraints live as prose inside a markdown "What NOT to Include" table rather than as enforceable `rules:` on the skill or as a checklist item on `strategic-review`. The result is that `strategic-review` rated the source diff `acceptable` while three template deviations stood in the PR body, and the user had to catch them at `review-received`. The single highest-leverage fix is the strategic-review checklist line — it is one TOON entry that closes the gap on the existing gate.

**Action Required:** Yes — recommend the following follow-up issues, in priority order:

1. **High** — Add a "PR body matches canonical template" line item to `strategic-review` ([12-review-strategy.toon](../../../../workflows/work-package/skills/12-review-strategy.toon)). One-line change, closes the gap that fired on this run.
2. **Medium** — Add a deterministic verifier step to `update-pr` ([18-update-pr.toon](../../../../workflows/work-package/skills/18-update-pr.toon)) that checks the rendered body against template rules and loops back to re-render on failure.
3. **Medium** — Make commit-signing a `start-work-package` precondition rather than a `strategic-review` post-hoc finding.
4. **Low** — Promote template anti-patterns from prose to `rules:` on `update-pr`; resolve the `skip-issue` / "Always include Issue link" inconsistency; persist rendered PR body as a planning artifact; lift or rewrite the `discover-session` tool restriction; add an environment-prerequisites step to `plan-prepare`.
