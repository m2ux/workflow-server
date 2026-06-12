---
metadata:
  version: 1.0.0
---

## Capability

Author a structured consolidated review summary from the consolidated review findings, following the [Consolidated Review Format](../resources/review-mode.md#consolidated-review-format) template defined in the review-mode resource, ready for confirmation and posting to the PR.

## Inputs

### consolidated_findings

The findings gathered and classified across code review, test review, validation, and strategic review — the content the summary renders.

### review_mode_resource

The attached [review-mode](../resources/review-mode.md) resource, whose [Consolidated Review Format](../resources/review-mode.md#consolidated-review-format) defines the summary structure.

## Outputs

### review_summary

The structured consolidated review summary text, organized per the Consolidated Review Format — executive summary, per-category findings, action items, and severity definitions — ready to present and post.

## Protocol

### 1. Load the Format

- Read the [Consolidated Review Format](../resources/review-mode.md#consolidated-review-format) from the attached `{review_mode_resource}`.

### 2. Render the Summary

- Populate the template from `{consolidated_findings}`: executive summary, per-category findings (code, test, documentation, validation, branch hygiene), action items, and severity definitions.
- Produce `{review_summary}` as the rendered text.

## Rules

### conform-to-the-template

The summary follows the review-mode resource's Consolidated Review Format. Do not invent a parallel structure — the resource is the authoritative owner of the format.
