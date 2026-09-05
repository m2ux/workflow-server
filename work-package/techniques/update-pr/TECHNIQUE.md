---
metadata:
  version: 2.7.0
---

## Capability

PR finalization for review — body update and ready mark, or consolidated review-mode commentary.

## Inputs

### branch_name

The feature branch whose commits and PR are being updated

### pr_number

The PR number being updated

### planning_folder_path

Path to the planning folder holding the implementation summary and artifacts the body draws from

### host_repo_path

Path to the repo root; used with `.engineering/` (in-tree or submodule) to resolve the engineering link URL

### target_path

Path to the target checkout (where the PR lives), from which the target repo URL is resolved

### is_review_mode

*(optional)* True when the PR is being annotated with a consolidated review comment rather than updated with implementation detail

### pr_template_variant

*(optional, enum: `initial` | `final`, default `final`)* Which PR body template to render

## Outputs

### body_conforms

True once the rendered body passes every rule in `rules.pr-body-conformance`; false otherwise

### body_findings

List of `{ rule_id, detail }` entries, one per failed conformance rule; empty when the body conforms

## Protocol

### template-selection

Callers bind `{pr_template_variant}` at the step. Selection for [render](./render.md):

1. If `{is_review_mode}` → [Review Comment Template](../../resources/review-mode.md#review-comment-template)
2. If `{pr_template_variant}` is `initial` → [Template (Initial)](../../resources/pr-description.md#template-initial)
3. If `{pr_template_variant}` is `final` → [Template (Final)](../../resources/pr-description.md#template-final); apply [lifecycle tense](../../resources/pr-description.md#lifecycle-tense)

Typical binds: `plan-prepare` → `initial`; `strategic-review` and `submit-for-review` → `final`.


## Rules

### body-composition

- motivation-user-perspective: Motivation explains the problem from the user's perspective and the consequences of not addressing it; 1-2 paragraphs.
- link-not-inline: tickets, ADRs, test plans, and planning artifacts are linked, never inlined (manage-artifacts single-source-and-link); no process attribution and no vague language (manage-artifacts no-process-attribution, plain-technical-language).
- no-relocated-content: never include a commit list (git log / the PR Commits tab owns it) or line-by-line explanations (inline PR comments own them) — complements no-files-changed-list and no-code-in-changes below.
- todo-tracks-premerge: the TODO-before-merging section tracks remaining pre-merge items beyond "Ready for review" (e.g. address reviewer feedback, squash if needed); items are checked off as they complete.

### pr-body-conformance

A rendered body satisfies every criterion in [Rules](../../resources/pr-description.md#rules), which is their home — the guide that lays out the body owns what a conforming body looks like. Each failure is one finding named by the criterion it breaks.

### draft-first

Create PRs as drafts initially. Convert to ready-for-review only when a later step directs it.

### posting

- review-comment-verbatim: The `post-review-comment` op posts the confirmed `{review_summary}` to the PR byte-for-byte via [post-pr-review](../../../meta/techniques/github-cli-protocol/post-pr-review.md) — never re-rendering, paraphrasing, or summarizing it. The summary is authored to [review-mode](../../resources/review-mode.md#review-comment-template); posting is a transport step, not a re-authoring one. This is distinct from `render`, which updates the PR description body from a template.

### pr-operations-run-through-gh

Use the shell to push commits and manage the PR via the `gh` CLI.
