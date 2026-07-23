---
metadata:
  version: 1.5.0
---

## Capability

Consolidated review summary in the consolidated review format.

## Inputs

### consolidated_findings

The findings gathered and classified across code review, test review, validation, and strategic review — the content the summary renders.

### review_mode_resource

The attached [review-mode](../resources/review-mode.md) resource, whose [Consolidated Review Format](../resources/review-mode.md#consolidated-review-format) defines the summary structure.

### prior_feedback_triage

The triage of prior PR feedback — each prior comment dispositioned Confirmed / Refuted / Superseded — rendered as the summary's Prior Feedback Triage section.

### rating_cap

The ceiling the Overall Rating may not exceed, derived from the prior-feedback triage. When set to the request-changes tier (an unaddressed external blocker), the rendered Overall Rating is held at or below Request Changes unless the rating-cap carve-in lifts it.

### changed_files

The authored surface — the PR's changed-files set. Used to enforce the findings-constraint at consolidation.

### artifact_publish_ref

*(optional)* The git ref for engineering-artifact hyperlinks — commit SHA from `publish-review-artifacts` (preferred) or the current parent branch. When not supplied, resolve from `{reference_path}`: `git -C {reference_path} branch --show-current`. Never hardcode `main`.

### reference_path

Path to the parent repo containing `.engineering/` — used to resolve `{ENG_REPO_OWNER}`, `{ENG_REPO_NAME}`, and the fallback publish ref when `{artifact_publish_ref}` is not bound.

## Outputs

### review_summary

The structured consolidated review summary text, organized per the Consolidated Review Format — executive summary, per-category findings, action items, and severity definitions — verbatim source for the posting step.


## Protocol

### 1. Load the Format

- Read the [Consolidated Review Format](../resources/review-mode.md#consolidated-review-format) from the attached `{review_mode_resource}`.

### 2. Resolve the Publish Ref

- Bind `{ARTIFACT_PUBLISH_REF}` from `{artifact_publish_ref}` when supplied; otherwise resolve the current parent branch from `{reference_path}`. Use this ref in every `Plan` and `Reports` hyperlink — the same engineering-artifacts base URL documented in the format, with `{ARTIFACT_PUBLISH_REF}` in place of a fixed branch name.

### 3. Render the Summary

- Enforce the findings-constraint: every rendered finding names a file within the authored surface `{changed_files}`. Findings on files in `{changed_files}` render as the PR's findings; findings on other files render under a separate "pre-existing" grouping.
- Populate the template from `{consolidated_findings}`: executive summary, per-category findings (code, test, documentation, validation, branch hygiene), action items, and severity definitions.
- Reference, don't restate: each finding renders as its item designator, one-line title, `Source`, severity, and disposition only. The designator links to that finding's section in its associated report (the artifact named in the `Reports` header) when one exists, else it renders as plain text; the `Source` column links the pertinent file (with line or line range), test, document, CI run, or commit. Descriptions, evidence, and suggestions stay in the linked report artifacts per the format's reference-don't-restate rule.
- Render the header fields in order — `PR`, then `Plan` on its own line immediately after `PR` (linking the planning folder's `README.md`, the work package's canonical home, via the engineering-artifacts base URL with `{ARTIFACT_PUBLISH_REF}`), then `Reviewers`, `Reports`, and `Date`. Every `Plan`, `Reports`, and reviewer hyperlink is mandatory — the posting step posts them verbatim.
- Render the Reviewers field: list each contributing review *activity* once and hyperlink it to its section in the activities README, using the base URL from the Consolidated Review Format — never link a reviewer to a technique file or to an activity's raw `.yaml`, and never split one activity into per-technique entries. Post-Implementation Review → `activities/README.md#10-post-implementation-review` (covers both code review and test-suite review), Validate → `activities/README.md#11-validate`, Strategic Review → `activities/README.md#12-strategic-review`.
- Render the Prior Feedback Triage section from `{prior_feedback_triage}`: one row per prior comment with its Confirmed / Refuted / Superseded disposition, and carry each Confirmed blocker-class entry into the Action Items as a blocking item.
- Apply `{rating_cap}` to the Overall Rating per the rating-cap carve-in below.
- Render the attribution footer that closes the format template — resolving `{user}` and `{sha}` per the format's instruction — so `{review_summary}` carries it and the posted comment reaches the PR with it intact.
- Produce `{review_summary}` as the rendered text.
- Follow the loaded format exactly — do not invent a parallel structure; the review-mode resource is the authoritative owner of the format. `{review_summary}` is the verbatim source the posting step (`update-pr::post-review-comment`) emits — the bytes bound here are the bytes posted.

## Rules

### rating-cap-carve-in

When `{rating_cap}` is the request-changes tier because a prior blocker-class concern was dispositioned Confirmed during triage, but this review's own findings refute that concern (the consolidated analysis shows the mechanism does not fail as claimed, with evidence in `{consolidated_findings}` or a Refuted disposition backed by this review's independent analysis), lift the cap — the Overall Rating follows `{consolidated_findings}` only. When the cap is not lifted, hold the Overall Rating at or below Request Changes — never Approve or Comment Only — even if the review's own findings are light.
