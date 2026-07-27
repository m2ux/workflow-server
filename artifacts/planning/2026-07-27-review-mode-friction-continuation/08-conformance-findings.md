# Convention Conformance Findings — `work-package`

**Mode:** update · **Date:** 2026-07-27
**Pass:** conformance
**Target:** `work-package` v3.35.4

Checked the drafted content against its sibling conventions: the two-arm `{$eng_git_dir}` form, declare-once `{$name}` protocol locals, snake_case symbol ids, backticked code tokens, per-file version-bump convention, and the engineering-artifacts link shape. The `{$eng_git_dir}` / `{$eng_branch}` / `{$eng_publish_ref}` locals conform — each is declared once at its producing step and read bare thereafter (AP-62), reusing the established form verbatim from `techniques/update-pr/render.md:51` and `techniques/manage-git/artifact-commits.md:42`. Both findings concern the link shape and one input description.

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| F-1 | High | The base-URL template still carries the `.engineering/` path segment while this change re-aims `{ARTIFACT_PUBLISH_REF}` at the **engineering checkout's own** ref. Verified empirically: `.engineering` is its own checkout (branch `engineering`, remote `m2ux/workflow-server`) whose root tree holds `artifacts/` directly — so a blob URL of the form `/blob/<eng-ref>/.engineering/artifacts/planning/…` names a path absent from that ref's tree and 404s. The tree already states the correct two-arm rule at `techniques/update-pr/render.md:54`; this resource diverges from it. The draft attestation froze this block as "deliberate", but on [A-4](03-assumptions-log.md)'s grounds (do not promote the slots to technique inputs) — which does not reach the path prefix. | `resources/review-mode.md` § Header Fields · base-URL block and ref sentence | Make the shown path checkout-root-relative and state the two arms, mirroring `render.md:54`. No new slot, template stays resource-resident (**G-3** intact). **Applied.** |
| F-2 | Low | The new `repo_root` entry ("Product repo root that contains the `.engineering/` artifacts checkout") asserts a layout its own Protocol's *second* arm explicitly contradicts — the arm that falls back to `{repo_root}` when `.engineering` is **not** a checkout — and drifts from the canonical sibling phrasing at `manage-git/TECHNIQUE.md:14` and `update-pr/render.md:26` (AP-55's synonym-drift smell). | `techniques/review-summary.md` and `techniques/publish-review-artifacts.md` § Inputs · `repo_root` | State the repo-root shape without asserting the checkout status either arm may find. **Applied.** |

**Finding count:** 2

## Notes

- F-1 is the completion of goal **G-2**. The change correctly moved the *ref* and the *repo identity* to the engineering checkout but left the *path* assuming the artifacts sit one directory down inside the product checkout — so the re-target was two-thirds done, and the surviving third is the segment that decides whether the posted link resolves.
- Pre-existing and **not** this change's drift: `techniques/update-pr/TECHNIQUE.md:76` (`engineering-link-mandatory`) still resolves the Engineering link "from the parent repo's `git remote get-url origin`", contradicting its own group's `render.md:51-54`. Verified byte-identical to `origin/workflows`, so it is inherited, not branch drift — recorded as a follow-up candidate, not fixed (it would add a fifth file).
