---
metadata:
  version: 1.0.0
---

## Capability

Analyze the reviewer comments received on a pull request and recommend a review outcome — approved, minor changes addressable inline, or significant changes requiring re-planning — producing the recommended outcome and a concise comments summary for the review-outcome checkpoint.

## Inputs

### review_comments

The reviewer comments and feedback received on the PR — the signal source for the outcome recommendation.

## Output(s)

### recommended_outcome

The recommended review-outcome checkpoint option based on the comments: `approved` when no changes are required, `minor-changes` when fixes can be addressed inline, or `significant-changes` when the feedback requires returning to planning.

### review_comments_summary

A concise multi-line summary of the reviewer comments — one line per comment, each a severity tag plus a one-line description. Interpolated into the review-outcome checkpoint message so the user sees the comments alongside the options without an extra round-trip.

## Protocol

### 1. Assess the Comments

- Read the reviewer comments in `{review_comments}`.
- Judge whether the feedback requires no changes, changes addressable inline, or changes significant enough to return to the planning stage.

### 2. Recommend an Outcome

- Set `{recommended_outcome}` to `approved` when no changes are required.
- Set `{recommended_outcome}` to `minor-changes` when fixes can be addressed inline without re-planning.
- Set `{recommended_outcome}` to `significant-changes` when the feedback requires returning to planning.

### 3. Summarize the Comments

- Build `{review_comments_summary}` as a multi-line block — a severity tag and a one-line description per comment.

## Rules

### significant-feedback-routes-to-planning

Only feedback that cannot be addressed inline recommends `significant-changes`. Inline-addressable fixes recommend `minor-changes`; feedback requiring no action recommends `approved`.

### summary-feeds-the-checkpoint

The summary exists to render the reviewer comments inline in the review-outcome checkpoint message. Keep it concise — one severity-tagged line per comment — so the user decides without a follow-up question.
