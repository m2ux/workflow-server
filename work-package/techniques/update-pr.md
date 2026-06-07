---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 18
  legacy_id: 18
---

## Capability

Update PR with final implementation details and mark ready for review, or post consolidated review comments when operating in review mode

## Protocol

### 1. Push Commits

- Push all local commits to the remote `{branch_name}`
- Verify push succeeded
- If the push is rejected because the remote branch has diverged, pull and rebase before pushing again
- Do not update the `{pr_number}` PR until push completes

### 2. Update Description

- Use attached [pr-description](../resources/pr-description.md) for template and structure
- Update the `{pr_number}` PR description with the implementation summary drawn from `{planning_folder_path}`
- If the PR cannot be found because `{pr_number}` does not exist, verify the PR number and check gh auth before retrying
- Include test coverage summary
- Document key decisions and trade-offs
- NEVER guess or infer repository URLs for PR description links. ALWAYS resolve them from git remotes. The engineering repo URL is obtained from the PARENT repo (the repo containing .engineering/): run 'git -C <parent-repo-path> remote get-url origin' and strip the .git suffix. The target repo URL is obtained from the TARGET repo (where the PR lives): run 'git -C `{target_path}` remote get-url origin'. These are different repositories — the engineering repo owner will differ from the target repo owner.

### 3. Verify Body

- Render the Final-template body to /tmp/pr-body.md.
- Evaluate each rule in `rules.pr-body-conformance` against the rendered text. For each failure append { rule_id, detail } to body-findings.
- Set body-conforms=true when body-findings is empty after all rules are evaluated; false otherwise.

### 4. Mark Ready

- Ensure description is finalized before marking ready
- Mark the PR ready for review using gh pr ready, yielding `{updated_pr}` with its URL and status

## Outputs

### updated_pr

PR updated and marked ready for review

#### pr_url

URL to the PR

#### pr_status

Status after update (e.g., ready for review)

## Rules

### template-selection

- review-mode-template: In review mode, use attached [review-mode](../resources/review-mode.md) for the consolidated PR review comment template. The review comment structure (sections, tables, Finding Details dropdowns, linked headings, reviewer agents) is defined there.
- initial-template: When creating a PR before implementation (ADR-only), use the Initial template from [pr-description](../resources/pr-description.md). When updating after implementation, use the Final template.

### pr-body-conformance

- summary-max-two-sentences: Summary section is 1-2 sentences, leads with the outcome, and includes measurable impact when available.
- engineering-link-mandatory: Engineering link is present, resolved from the parent repo's `git remote get-url origin` and current `git branch --show-current`, and resolves to a committed file on the remote.
- issue-link-or-explicit-placeholder: Issue line is present. When `issue-skipped == true`, render `🐛 _Issue: skipped_` as an explicit placeholder rather than dropping the line or fabricating a number.
- no-commit-headings-in-changes: Changes section groups bullets by component (bold component name), not by Conventional Commits header or commit message.
- no-files-changed-list: Changes section does not enumerate file paths. File-level detail belongs in the PR's Files-changed tab.

### draft-first

Create PRs as drafts initially. Convert to ready-for-review only at submit-for-review activity.

### tool-usage

use shell to push commits and manage PR via gh CLI
