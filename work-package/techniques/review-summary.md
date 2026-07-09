---
metadata:
  version: 1.1.0
---

## Capability

Author a structured consolidated review summary from the consolidated review findings, following the [Consolidated Review Format](../resources/review-mode.md#consolidated-review-format) template defined in the review-mode resource, ready for confirmation and posting to the PR.

## Inputs

### consolidated_findings

The findings gathered and classified across code review, test review, validation, and strategic review — the content the summary renders.

### review_mode_resource

The attached [review-mode](../resources/review-mode.md) resource, whose [Consolidated Review Format](../resources/review-mode.md#consolidated-review-format) defines the summary structure.

### prior_feedback_triage

The triage of prior PR feedback — each prior comment dispositioned Confirmed / Refuted / Superseded — rendered as the summary's Prior Feedback Triage section.

### rating_cap

The ceiling the Overall Rating may not exceed, derived from the prior-feedback triage. When set to the request-changes tier (an unaddressed external blocker), the rendered Overall Rating is held at or below Request Changes.

## Outputs

### review_summary

The structured consolidated review summary text, organized per the Consolidated Review Format — executive summary, per-category findings, action items, and severity definitions — ready to present and post.

## Protocol

### 1. Load the Format

- Read the [Consolidated Review Format](../resources/review-mode.md#consolidated-review-format) from the attached `{review_mode_resource}`.

### 2. Render the Summary

- Populate the template from `{consolidated_findings}`: executive summary, per-category findings (code, test, documentation, validation, branch hygiene), action items, and severity definitions.
- Render the Prior Feedback Triage section from `{prior_feedback_triage}`: one row per prior comment with its Confirmed / Refuted / Superseded disposition, and carry each Confirmed blocker-class entry into the Action Items as a blocking item.
- Apply `{rating_cap}` to the Overall Rating: when the cap is the request-changes tier, the Overall Rating is held at or below Request Changes — never Approve or Comment Only — even if the review's own findings are light.
- Render the attribution footer that closes the format template — resolving `{user}` and `{sha}` per the format's instruction — so `{review_summary}` carries it and the posted comment reaches the PR with it intact.
- Produce `{review_summary}` as the rendered text.
- Follow the loaded format exactly — do not invent a parallel structure; the review-mode resource is the authoritative owner of the format. `{review_summary}` is the verbatim source the posting step (`update-pr::post-review-comment`) emits, so what is confirmed is exactly what reaches the PR.

### 3. Present for Confirmation

- Present the rendered `{review_summary}` verbatim (or a faithful excerpt when long) at the approval checkpoint — never a paraphrase or a re-described summary. The bytes shown are the bytes posted.
