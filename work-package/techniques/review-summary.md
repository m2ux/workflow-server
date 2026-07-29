---
metadata:
  version: 1.8.0
---

## Capability

Consolidated review summary in the consolidated review format.

## Inputs

### consolidated_findings

The findings gathered and classified across code review, test review, validation, and strategic review — the content the summary renders.

### review_mode_resource

The attached [review-mode](../resources/review-mode.md) resource. Read the whole-document skeleton from [Review Comment Template](../resources/review-mode.md#review-comment-template) and each category's findings fragment from that category's own section (e.g. [#code-review](../resources/review-mode.md#code-review), [#test-review](../resources/review-mode.md#test-review)).

### prior_feedback_triage

The triage of prior PR feedback — each prior comment dispositioned Confirmed / Refuted / Superseded — rendered as the summary's Prior Feedback Triage section.

### rating_cap

The ceiling the Overall Rating may not exceed, derived from the prior-feedback triage. When set to the request-changes tier (an unaddressed external blocker), the rendered Overall Rating is held at or below Request Changes unless the rating-cap carve-in lifts it.

### changed_files

The authored surface — the PR's changed-files set. Used to enforce the findings-constraint at consolidation.

### artifact_publish_ref

*(optional)* The git ref engineering-artifact hyperlinks resolve against — a publish commit SHA from `publish-review-artifacts`, or a branch name; empty when no publish ref has been produced.

### host_repo_path

Path to the product repo root (monorepo or standalone); the `.engineering/` artifacts directory sits under it.

## Outputs

### review_summary

The structured consolidated review summary text, organized per the Review Comment Template — executive summary, per-category findings, action items, and severity definitions — verbatim source for the posting step.


## Protocol

### 1. Load the Format

- Read the whole-document skeleton from [Review Comment Template](../resources/review-mode.md#review-comment-template) in the attached `{review_mode_resource}`. Read each category's findings fragment from that category's own section as it is populated (e.g. [#prior-feedback-triage](../resources/review-mode.md#prior-feedback-triage), [#code-review](../resources/review-mode.md#code-review), [#test-review](../resources/review-mode.md#test-review), [#documentation-review](../resources/review-mode.md#documentation-review), [#validation](../resources/review-mode.md#validation), [#branch-hygiene](../resources/review-mode.md#branch-hygiene)).

### 2. Resolve the Publish Ref

- Resolve `{$eng_git_dir}`: `{host_repo_path}/.engineering` when that path is a git checkout (submodule or nested clone); otherwise `{host_repo_path}`.
- Resolve `{$eng_publish_ref}`: `{artifact_publish_ref}` when it is non-empty; otherwise `git -C {eng_git_dir} branch --show-current` — never hardcode `main`.
- Use `{eng_publish_ref}` as the ref in every `Plan` and `Reports` hyperlink, built from the engineering-artifacts base URL defined in [Header Fields](../resources/review-mode.md#header-fields) — that section owns the URL and its slots; this step supplies only the ref.

### 3. Render the Summary

- Enforce the findings-constraint: every rendered finding names a file within the authored surface `{changed_files}`. Findings on files in `{changed_files}` render as the PR's findings; findings on other files render under a separate "pre-existing" grouping.
- Populate the template from `{consolidated_findings}`: executive summary, per-category findings (code, test, documentation, validation, branch hygiene), action items, and severity definitions.
- Reference, don't restate: each finding renders as its item designator, one-line title, `Source`, severity, and disposition only. The designator links to that finding's section in its associated report (the artifact named in the `Reports` header) when one exists, else it renders as plain text; the `Source` column links the pertinent file (with line or line range), test, document, CI run, or commit. Descriptions, evidence, and suggestions stay in the linked report artifacts per the format's reference-don't-restate rule.
- Render the header fields in order — `PR`, then `Plan` on its own line immediately after `PR` (linking the planning folder's `README.md`, the work package's canonical home, via the engineering-artifacts base URL with `{eng_publish_ref}`), then `Reviewers`, `Reports`, and `Date`. Every `Plan`, `Reports`, and reviewer hyperlink is mandatory — the posting step posts them verbatim.
- Render the `Reports` field — one hyperlinked entry per report this run produced, each linking the report name to its artifact under the engineering-artifacts base URL with `{eng_publish_ref}`. Include an entry only for a report actually produced this run; omit categories with no report. Each report's concrete artifact filename and content are owned by the technique that produced it — this step iterates over whatever reports were produced, it does not enumerate them.
- Render the Reviewers field: list each contributing review *activity* once and hyperlink it to its section in the activities README, using the base URL from the [Header Fields](../resources/review-mode.md#header-fields) sub-section of the Review Comment Template — never link a reviewer to a technique file or to an activity's raw `.yaml`, and never split one activity into per-technique entries. The activity-to-anchor mapping is supplied by the rendering step at runtime (e.g. Post-Implementation Review → `#10-post-implementation-review`, Validate → `#11-validate`, Strategic Review → `#12-strategic-review`).
- Render the Prior Feedback Triage section from `{prior_feedback_triage}`: one row per prior comment with its Confirmed / Refuted / Superseded disposition, and carry each Confirmed blocker-class entry into the Action Items as a blocking item.
- Apply `{rating_cap}` to the Overall Rating per the rating-cap carve-in below.
- Render the attribution footer that closes the format template — resolving `{user}` and `{sha}` per the format's instruction — so `{review_summary}` carries it and the posted comment reaches the PR with it intact.
- Produce `{review_summary}` as the rendered text.
- Follow the loaded format exactly — do not invent a parallel structure; the review-mode resource is the authoritative owner of the format. `{review_summary}` is the verbatim source the posting step (`update-pr::post-review-comment`) emits — the bytes bound here are the bytes posted.

## Rules

### rating-cap-carve-in

When `{rating_cap}` is the request-changes tier because a prior blocker-class concern was dispositioned Confirmed during triage, but this review's own findings refute that concern (the consolidated analysis shows the mechanism does not fail as claimed, with evidence in `{consolidated_findings}` or a Refuted disposition backed by this review's independent analysis), lift the cap — the Overall Rating follows `{consolidated_findings}` only. When the cap is not lifted, hold the Overall Rating at or below Request Changes — never Approve or Comment Only — even if the review's own findings are light.
