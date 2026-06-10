---
metadata:
  version: 1.0.0
---

## Capability

Render the PR body from the selected template and apply it to the `{pr_number}` PR description, drawing the implementation summary from the planning artifacts.

## Protocol

1. Select the template per [template-selection](./TECHNIQUE.md): the Initial template when `{template}` is `initial`, the Final template when `{template}` is `final` (from [pr-description](../../resources/pr-description.md)), or the [review-mode](../../resources/review-mode.md) template when `{is_review_mode}` is true.
2. Compose the body using the implementation summary drawn from `{planning_folder_path}`, including the test coverage summary and key decisions and trade-offs.
3. Resolve link URLs from git remotes — NEVER guess or infer repository URLs. The engineering repo URL comes from the PARENT repo (the repo containing `.engineering/`): run `git -C {reference_path} remote get-url origin` and strip the `.git` suffix. The target repo URL comes from the TARGET repo (where the PR lives): run `git -C {target_path} remote get-url origin`. These are different repositories — the engineering repo owner will differ from the target repo owner.
4. Update the `{pr_number}` PR description with the composed body. If the PR cannot be found because `{pr_number}` does not exist, verify the PR number and check `gh` auth before retrying.
