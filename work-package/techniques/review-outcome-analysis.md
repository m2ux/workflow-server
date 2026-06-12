---
metadata:
  version: 1.0.0
---

## Capability

Analyze the reviewer comments received on a pull request and recommend a review outcome — approved, minor changes addressable inline, or significant changes — producing the recommended outcome and a concise comments summary.

## Inputs

### review_comments

The reviewer comments and feedback received on the PR — the signal source for the outcome recommendation.

## Outputs

### recommended_outcome

The recommended outcome based on the comments: `approved` when no changes are required, `minor-changes` when fixes can be addressed inline, or `significant-changes` when the feedback requires substantial changes beyond inline fixes.

### review_comments_summary

A concise multi-line summary of the reviewer comments — one line per comment, each a severity tag plus a one-line description.

## Protocol

### 1. Assess the Comments

- Read the reviewer comments in `{review_comments}`.
- Judge the severity of the feedback: no changes required, changes addressable inline, or changes substantial enough to exceed inline fixes.

### 2. Recommend an Outcome

- Set `{recommended_outcome}` to `approved` when no changes are required.
- Set `{recommended_outcome}` to `minor-changes` when fixes can be addressed inline.
- Set `{recommended_outcome}` to `significant-changes` when the feedback requires substantial changes beyond inline fixes.

### 3. Summarize the Comments

- Build `{review_comments_summary}` as a multi-line block — a severity tag and a one-line description per comment.
- Keep `{review_comments_summary}` concise — one severity-tagged line per comment.

## Rules

### significant-feedback-needs-rework

Only feedback that cannot be addressed inline recommends `significant-changes`. Inline-addressable fixes recommend `minor-changes`; feedback requiring no action recommends `approved`.
