---
name: update-pr
description: Finalize the PR for review, or post consolidated review comments in review mode.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 18
  legacy_id: 18
---

# Update Pr

## Capability

Update PR with final implementation details and mark ready for review

## Inputs

### pr-number

PR number to update

### branch-name

Branch name for push operations

### planning-folder-path

Path to planning folder for implementation summary context

## Protocol

### 1. Push Commits

- Push all local commits to remote branch
- Verify push succeeded
- Do not update PR until push completes

### 2. Update Description

- Use attached [pr-description](legacy/work-package/resources/pr-description/SKILL.md) for template and structure
- Update PR description with implementation summary
- Include test coverage summary
- Document key decisions and trade-offs
- NEVER guess or infer repository URLs for PR description links. ALWAYS resolve them from git remotes. The engineering repo URL is obtained from the PARENT repo (the repo containing .engineering/): run 'git -C <parent-repo-path> remote get-url origin' and strip the .git suffix. The target repo URL is obtained from the TARGET repo (where the PR lives): run 'git -C <target-path> remote get-url origin'. These are different repositories — the engineering repo owner will differ from the target repo owner.

### 3. Verify Body

- Render the Final-template body to /tmp/pr-body.md.
- Evaluate each rule in rules.pr-body-conformance against the rendered text. For each failure append { rule_id, detail } to body_findings.
- Set body_conforms=true when body_findings is empty after all rules are evaluated; false otherwise.

### 4. Mark Ready

- Mark PR ready for review using gh pr ready
- Ensure description is finalized before marking ready

## Outputs

### updated-pr

PR updated and marked ready for review

- **pr_url**: URL to the PR
- **pr_status**: Status after update (e.g., ready for review)

## Rules

### template-selection

- review-mode-template: In review mode, use attached [review-mode](legacy/work-package/resources/review-mode/SKILL.md) for the consolidated PR review comment template. The review comment structure (sections, tables, Finding Details dropdowns, linked headings, reviewer agents) is defined there.
- initial-template: When creating a PR before implementation (ADR-only), use the Initial template from [pr-description](legacy/work-package/resources/pr-description/SKILL.md). When updating after implementation, use the Final template.

### pr-body-conformance

- summary-max-two-sentences: Summary section is 1-2 sentences, leads with the outcome, and includes measurable impact when available.
- engineering-link-mandatory: Engineering link is present, resolved from the parent repo's `git remote get-url origin` and current `git branch --show-current`, and resolves to a committed file on the remote.
- issue-link-or-explicit-placeholder: Issue line is present. When `issue_skipped == true`, render `🐛 _Issue: skipped_` as an explicit placeholder rather than dropping the line or fabricating a number.
- no-commit-headings-in-changes: Changes section groups bullets by component (bold component name), not by Conventional Commits header or commit message.
- no-files-changed-list: Changes section does not enumerate file paths. File-level detail belongs in the PR's Files-changed tab.

### draft-first

Create PRs as drafts initially. Convert to ready-for-review only at submit-for-review activity.

### tool-usage

use shell to push commits and manage PR via gh CLI

## Errors

### push_failed

**Cause:** Remote branch has diverged

**Recovery:** Pull and rebase before pushing

### pr_not_found

**Cause:** PR number does not exist

**Recovery:** Verify PR number and check gh auth
