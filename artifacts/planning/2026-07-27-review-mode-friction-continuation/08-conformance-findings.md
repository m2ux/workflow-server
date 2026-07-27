# Convention Conformance Findings — `work-package`

**Mode:** update · **Date:** 2026-07-27
**Pass:** conformance
**Target:** `work-package` v3.35.4

Post-commit re-check of the committed content (`dd1521ba`) against its sibling conventions per [convention-conformance](../../../../workflows/workflow-design/resources/convention-conformance.md): the two-arm `{$eng_git_dir}` form, declare-once `{$name}` protocol locals, snake_case symbol ids, backticked code tokens, per-file version-bump convention, and the engineering-artifacts link shape. The `{$eng_git_dir}` / `{$eng_branch}` / `{$eng_publish_ref}` locals conform — each declared once at its producing step and read bare thereafter (AP-62), reusing the established form verbatim from `techniques/update-pr/render.md:51` and `techniques/manage-git/artifact-commits.md:42`. Version bumps follow the branch convention (minor for contract-changing files, patch for prose-only). Both pre-commit findings are confirmed **Applied**. One new divergence remains.

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| F-1 | Low | Synonym drift for one concept. The committed line names the engineering checkout twice as "the artifacts checkout", against an established term used everywhere else in the tree: `workflow.yaml:341` and `techniques/publish-review-artifacts.md:24` — **both changed by this same commit** — plus the pre-existing `techniques/manage-git/artifact-commits.md:8`. Measured across the tree: "engineering checkout" 3 occurrences, "artifacts checkout" 1 (this line). Same AP-55 synonym-drift smell the prior pass's F-2 fixed on the `repo_root` entries, recurring one file over in that fix's own replacement text. | `resources/review-mode.md:42` (×2 in the sentence) | Use "engineering checkout", matching `workflow.yaml:341` and both techniques. Disposition: **bring into conformance** — no justification for a second term for one checkout. |

**Finding count:** 1

## Notes

- Definition prose *voice* is out of scope for this pass, per the technique.
- **Prior (pre-commit) pass — both findings verified Applied in `dd1521ba`,** retained because find-or-update keeps one instance per bare filename: **F-1** (High) the base-URL template carried the `.engineering/` path segment while the ref was re-aimed at the engineering checkout's own ref — verified empirically that `.engineering` is its own checkout (branch `engineering`, remote `m2ux/workflow-server`) holding `artifacts/` at its root, so the old form 404s → `resources/review-mode.md:39` is now checkout-root-relative and `:42` states both arms. **F-2** (Low) the `repo_root` entry asserted a layout its own Protocol's second arm contradicts → both techniques now read "Path to the product repo root (monorepo or standalone); the `.engineering/` artifacts directory sits under it."
- **Correction to the prior pass's note on `techniques/update-pr/TECHNIQUE.md:76`** (`engineering-link-mandatory`): the note said the file was "byte-identical to `origin/workflows`". The *file* is not — this branch changed 4 lines in it (version bump, two `#consolidated-review-format` → `#review-comment-template` anchor renames, and the `all-mandated-sections-present` rewrite). The *rule line itself* is unchanged context in that diff, so the substantive disposition stands: the stale "parent repo's `git remote get-url origin`" wording is inherited, not branch drift. Recorded so the evidence claim is accurate.
- Verified inherited (byte-identical to `origin/workflows`) and therefore **not** this change's drift — carried as follow-up candidates, not findings: `resources/pr-description.md:143` hardcodes `/.engineering/artifacts/planning/` in the PR-body Engineering link row; `techniques/manage-artifacts/TECHNIQUE.md:70-72` rule `committed-to-parent` requires the push "to the parent repo"; `meta/techniques/agent-conduct.md:98` places artifact commits "in the parent repo where that directory lives". Each states the single-layout model that `techniques/update-pr/render.md:54` and `techniques/manage-git/artifact-commits.md:42` already contradicted before this branch existed, so AP-129 does not attribute them to this change.
