---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.1.0
  order: 18
  legacy_id: 18
---

# Update PR

## Capability

Update a PR with final implementation details and mark it ready for review, or post consolidated review comments when operating in review mode. Operations cover rendering the body from a template, verifying body conformance, pushing commits, and marking ready.

## Inputs

### branch_name

The feature branch whose commits and PR are being updated

### pr_number

The PR number being updated

### planning_folder_path

Path to the planning folder holding the implementation summary and artifacts the body draws from

### reference_path

Path to the reference checkout (the engineering / parent repo containing `.engineering/`), from which the engineering link URL is resolved

### target_path

Path to the target checkout (where the PR lives), from which the target repo URL is resolved

### is_review_mode

*(optional)* True when the PR is being annotated with a consolidated review comment rather than updated with implementation detail

### pr_template_variant

*(optional, enum: `initial` | `final`, default `final`)* Which PR body template to render — `initial` before implementation (ADR-only), `final` after implementation

## Outputs

### body_conforms

True once the rendered body passes every rule in `rules.pr-body-conformance`; false otherwise

### body_findings

List of `{ rule_id, detail }` entries, one per failed conformance rule; empty when the body conforms

## Rules

### template-selection

- review-mode-template: In review mode, use attached [review-mode](../../resources/review-mode.md) for the consolidated PR review comment template. The review comment structure (sections, tables, Finding Details dropdowns, linked headings, reviewer agents) is defined there.
- initial-template: When `{pr_template_variant}` is `initial` (creating a PR before implementation, ADR-only), use the Initial template from [pr-description](../../resources/pr-description.md). When `{pr_template_variant}` is `final` (updating after implementation), use the Final template.

### body-composition

- motivation-user-perspective: Motivation explains the problem from the user's perspective and the consequences of not addressing it; 1-2 paragraphs.
- link-not-inline: tickets, ADRs, test plans, and planning artifacts are linked, never inlined (manage-artifacts single-source-and-link); no process attribution and no vague language (manage-artifacts no-process-attribution, plain-technical-language).
- no-relocated-content: never include a commit list (git log / the PR Commits tab owns it) or line-by-line explanations (inline PR comments own them) — complements no-files-changed-list and no-code-in-changes below.
- todo-tracks-premerge: the TODO-before-merging section tracks remaining pre-merge items beyond "Ready for review" (e.g. address reviewer feedback, squash if needed); items are checked off as they complete.

### pr-body-conformance

- summary-max-two-sentences: Summary section is 1-2 sentences, leads with the outcome, and includes measurable impact when available.
- engineering-link-mandatory: Engineering link is present, resolved from the parent repo's `git remote get-url origin` and current `git branch --show-current`, and resolves to a committed file on the remote.
- issue-link-or-explicit-placeholder: Issue line is present. When `issue-skipped == true`, render `🐛 _Issue: skipped_` as an explicit placeholder rather than dropping the line or fabricating a number.
- no-commit-headings-in-changes: Changes section groups bullets by component (bold component name), not by Conventional Commits header or commit message.
- no-files-changed-list: Changes section does not enumerate file paths. File-level detail belongs in the PR's Files-changed tab.
- no-code-in-changes: Changes section is plain-language summary bullets describing what changed and why; no fenced code blocks, code snippets, or pasted signatures, and no inline code beyond unavoidable bare identifiers. The diff is the source of truth for code.

### draft-first

Create PRs as drafts initially. Convert to ready-for-review only when a later step directs it.

### tool-usage

Use the shell to push commits and manage the PR via the `gh` CLI.
