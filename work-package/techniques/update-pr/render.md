---
metadata:
  version: 1.0.0
---

## Capability

Render the PR body from the selected template and apply it to the `{pr_number}` PR description, drawing the implementation summary from the planning artifacts.

## Inputs

### template

Which PR body template to render — `initial` (ADR-only, before implementation) or `final` (after implementation).

### is_review_mode

True when the body is the consolidated review-mode comment rather than an implementation update; selects the [review-mode](../../resources/review-mode.md) template.

### planning_folder_path

Path to the planning folder holding the implementation summary and artifacts the body draws from.

### reference_path

Path to the reference checkout (the engineering / parent repo containing `.engineering/`), from which the engineering link URL is resolved.

### target_path

Path to the target checkout (where the PR lives), from which the target repo URL is resolved.

### pr_number

The PR number whose description is updated.

## Outputs

### rendered_pr_body

The PR description applied to the `{pr_number}` PR: the body composed from the selected template, with the implementation summary, test-coverage summary, and key decisions/trade-offs filled in, and the engineering and target link URLs resolved from git remotes. The op's effect is that the live `{pr_number}` PR description now holds this rendered body.

## Protocol

1. Select the template per [template-selection](./TECHNIQUE.md): the Initial template when `{template}` is `initial`, the Final template when `{template}` is `final` (from [pr-description](../../resources/pr-description.md)), or the [review-mode](../../resources/review-mode.md) template when `{is_review_mode}` is true.
2. Compose the body using the implementation summary drawn from `{planning_folder_path}`, including the test coverage summary and key decisions and trade-offs.
3. Resolve link URLs from git remotes — NEVER guess or infer repository URLs. The engineering repo URL comes from the PARENT repo (the repo containing `.engineering/`): run `git -C {reference_path} remote get-url origin` and strip the `.git` suffix. The target repo URL comes from the TARGET repo (where the PR lives): run `git -C {target_path} remote get-url origin`. These are different repositories — the engineering repo owner will differ from the target repo owner.
4. Update the `{pr_number}` PR description with the composed body. If the PR cannot be found because `{pr_number}` does not exist, verify the PR number and check `gh` auth before retrying.
