---
metadata:
  version: 1.3.0
---

## Capability

PR description body from the selected template, sourced from planning artifacts.

## Inputs

### pr_template_variant

Which PR body template to render — `initial` or `final`.

### is_review_mode

True when the body is the consolidated review-mode comment rather than an implementation update; selects the [Review Comment Template](../../resources/review-mode.md#review-comment-template).

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

The rendered PR description body now live on the `{pr_number}` PR — composed from the selected template, including the implementation summary, test-coverage summary, key decisions/trade-offs, and the engineering/target link URLs.


## Protocol

1. Select the template:
   - If `{is_review_mode}` is true → [Review Comment Template](../../resources/review-mode.md#review-comment-template)
   - Else if `{pr_template_variant}` is `initial` → [Template (Initial)](../../resources/pr-description.md#template-initial)
   - Else if `{pr_template_variant}` is `final` → [Template (Final)](../../resources/pr-description.md#template-final); apply [lifecycle tense](../../resources/pr-description.md#lifecycle-tense) so lingering Initial “coming next” / future-tense checklist wording is replaced
2. Compose the body using the implementation summary drawn from `{planning_folder_path}`, including the test coverage summary and key decisions and trade-offs.
3. Resolve link URLs from git remotes — NEVER guess or infer repository URLs, issue numbers, or branch names:
   - `{$target_repo_url}`: `git -C {target_path} remote get-url origin`, strip the `.git` suffix, convert SSH form to HTTPS (`git@github.com:org/repo.git` → `https://github.com/org/repo`).
   - `{$eng_repo_url}`: same commands against `{reference_path}` — the PARENT repo containing `.engineering/`. These are different repositories with different owners.
   - `{$eng_branch}`: `git -C {reference_path} branch --show-current` — do NOT assume `main`; planning artifacts may live on another branch. The Engineering link is `{$eng_repo_url}/blob/{$eng_branch}/.engineering/artifacts/planning/<planning-folder>/README.md` and must resolve to a committed file on the remote (manage-artifacts push-before-linking).
4. Compose the link row per the [link-row forms](../../resources/pr-description.md#link-row-forms): the Issue link always present, pointing at the GitHub issue in the target repo via the `github_issue_number` variable — never the Jira key, never a guessed number; when `issue_skipped` is true, render the literal `🐛 _Issue: skipped_` placeholder per `rules.pr-body-conformance.issue-link-or-explicit-placeholder`. The Engineering link is always present on the same line. When `issue_platform` is `jira` and a `jira_issue_key` was captured, append the Jira ticket as the secondary reference line. Add ADR and test-plan links when those artifacts exist.
5. Update the `{pr_number}` PR description via the GitHub REST API — write the body to a file and `gh api repos/<owner>/<repo>/pulls/<n> -X PATCH -F body=@<file>`; do NOT use `gh pr edit`, whose GraphQL query fails on the Projects Classic deprecation. If the PR cannot be found because `{pr_number}` does not exist, verify the PR number and check `gh` auth before retrying.
