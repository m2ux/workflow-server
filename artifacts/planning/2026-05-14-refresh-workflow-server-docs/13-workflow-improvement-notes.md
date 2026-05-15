# Workflow Improvement Notes

Observations and improvement recommendations captured mid-flight, to be folded into the final retrospective at the `complete` activity.

---

## PR Description Deviations from Canonical Template

**Context.** During `submit-for-review`, the PR #119 body deviated from the canonical template at `workflows/work-package/resources/12-pr-description.md` in three ways:

1. **Missing 🐛 Issue link** — template says "Always include"; rendering silently failed because the work-package was started with `skip-issue`. No placeholder was emitted.
2. **Multi-paragraph Summary** — template prescribes 1-2 sentences; body had a single paragraph with subordinate clauses.
3. **Changes organized by commit, not component** — template's "What NOT to Include" table explicitly forbids commit lists; PR body grouped changes under three commit-message headings (`docs: refresh API and entry-point docs (T1–T6 + T14 baseline)`, etc.) with task IDs embedded.

The user caught all three at the `review-received` checkpoint; the deviations were fixed by an out-of-band PR-body rewrite before continuing.

**Why the workflow didn't catch them.** The `update-pr` skill ([18-update-pr.toon](../../../../workflows/work-package/skills/18-update-pr.toon)) instructs the worker to *use* resource 12 for structure but provides no verification gate. The template documents anti-patterns in a markdown table rather than as enforceable rules. The `strategic-review` skill ([12-review-strategy.toon](../../../../workflows/work-package/skills/12-review-strategy.toon)) reviews the source diff but the PR body is not part of the diff, so the deviation escaped that gate too.

## Recommended Workflow Improvements

Ordered by leverage. Item 4 is the single highest-value change — it's the gate that would have caught all three deviations on this run.

### 1. Add a structural verifier to `update-pr` (Medium)

In skill [18-update-pr.toon](../../../../workflows/work-package/skills/18-update-pr.toon), extend the `update-description` protocol with a verify step that — after rendering and before `gh api PATCH` — checks deterministic rules against the rendered body:

- Required sections present in correct order
- Summary ≤ 2 sentences
- Changes bullets prefixed with `**ComponentName**` and contain no commit-message-styled headings or task-ID references (`T1`, `T2`, …)
- Issue link present OR explicit `_No issue: …_` placeholder
- Engineering link resolves to a committed path on the configured engineering branch

Loop back to re-render on failure. Persist a rendered preview as a planning artifact (see #5) so failures are inspectable.

### 2. Promote template anti-patterns from prose to `rules:` (Low)

Resource 12 currently states "don't organize Changes by commit" only inside a markdown "What NOT to Include" table. Promote the strongest constraints to `rules:` on `update-pr` so they have the same status as `draft-first`:

- `no-commit-headings-in-changes`
- `no-task-ids-in-changes`
- `summary-max-two-sentences`
- `engineering-link-mandatory`

Rules-as-code make them testable and let `strategic-review` reference them directly.

### 3. Handle the `issue_skipped` path explicitly (Low)

The `skip-issue` option in `start-work-package` and the "Always include Issue link" rule in resource 12 are inconsistent. Resolve by either:

- removing `skip-issue` as a checkpoint option for non-trivial complexity classes, or
- adding a `pr-description-skip-issue-render` rule that requires a specific italic placeholder line so reviewers see the absence is intentional.

### 4. Add a "PR body matches canonical" line item to `strategic-review` (HIGH)

The strategic-review skill ([12-review-strategy.toon](../../../../workflows/work-package/skills/12-review-strategy.toon)) is the gate that already passes/fails PRs. Add an explicit reviewer checklist item: "PR body conforms to canonical template (Summary length, no commit-grouped Changes, Issue link present or placeholder rendered)". This is the single highest-leverage change — the strategic review on this run rated the work `acceptable` while the deviations stood.

### 5. Self-render and persist the PR body as a planning artifact (Low)

Have `update-pr` write the rendered body to `08-pr-body-rendered.md` in the planning folder before pushing. Two benefits: the deviation becomes visible during `post-impl-review` (it's now in the diff), and the body becomes a reviewable artifact rather than a transient `/tmp` file.

---

## Other Mid-Flight Observations

### Worker tool restrictions vs. activity prescriptions (Low)

In `discover-session` (meta), the activity's `workflow-engine::list-workflows` operation prescribes calling the `list_workflows` MCP tool, but the worker-agent rules forbid that tool for workers. The worker worked around it by reading `workflows/*/workflow.toon` directly. Either lift the restriction for this operation or rewrite the operation to use a worker-safe primitive.

### Worker A20 install gap (Low)

The implement worker had to add a missing prerequisite (`git worktree add ./workflows workflows`) before tests would pass — this surfaced as assumption A20 mid-implementation rather than being captured during plan-prepare. Consider adding a "verify environment prerequisites" step to plan-prepare so the test-baseline action in implement is unambiguous.

### Unsigned-commit detection happens late (Low)

The strategic-review activity is the first place that surfaced the unsigned-commits issue, after the implementation and post-impl-review had already landed. Detection could move earlier — e.g., into `start-work-package` after the first commit, or into a pre-implement sanity check — so the user is not asked to authorize a rebase + force-push after the body of the work has been completed.
