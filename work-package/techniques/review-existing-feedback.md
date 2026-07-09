---
metadata:
  version: 1.1.0
---

## Capability

Ingest and triage every prior comment and review on the PR under review — human and bot, top-level and inline — before any independent analysis begins, so the verdict accounts for signal others have already raised. Each prior finding is dispositioned Confirmed, Refuted, or Superseded with reasoning, and an unaddressed external blocker-class comment caps the Overall Rating so the review cannot conclude "Comment Only / no blocker" while a blocker stands.

## Inputs

### review_pr_url

The URL of the PR under review, captured during PR-reference detection. Identifies the PR whose existing comments and reviews are ingested.

## Outputs

### prior_feedback_triage

The triage table: one row per prior comment or review thread, each marked Confirmed, Refuted, or Superseded with the reasoning for that disposition and the author and class (human or bot, blocker or non-blocker) of the original. A reported runtime error in a thread is captured here once, tagged as a reported failure, so downstream reported-failure triage consumes it rather than re-reading the thread.

#### artifact

`prior-feedback-triage.md`

### rating_cap

The ceiling the Overall Rating may not exceed, derived from the triage. When any prior comment is a blocker-class concern left unaddressed by the PR, the cap is the request-changes tier; otherwise the cap is unset and the rating is governed solely by the review's own findings. The summary applies this cap so an unaddressed external blocker cannot be rated away.

## Protocol

### 1. Ingest All Prior Feedback

- Read every top-level comment and review on `{review_pr_url}` with `gh pr view {pr_number} --json comments,reviews`.
- Read every inline review thread with `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments`, resolving `{owner}` and `{repo}` from `{review_pr_url}`.
- Include both human and bot authors — a bot finding is signal, not noise. Do this before any independent code, structural, or test analysis, so the existing signal frames the review rather than being reconciled after a verdict is formed.

### 2. Triage Each Prior Finding

- For each prior comment or thread, assign a disposition with reasoning:
  - **Confirmed** — the concern is valid and unaddressed by the PR as it stands.
  - **Refuted** — the concern does not hold; record why (the code does not do what the comment claims, the case is handled elsewhere, the premise is mistaken).
  - **Superseded** — the concern was valid but a later commit or a subsequent comment resolves it; record the resolving change.
- Tag each row with the author class (human / bot) and whether the original concern is blocker-class (it asserts a correctness, safety, data-loss, or runtime-failure defect) or non-blocker (style, preference, question).
- Tag any reported runtime error so it is traceable as a reported failure downstream — captured once here.

### 3. Derive the Rating Cap

- Set `{rating_cap}` to the request-changes tier when any blocker-class concern is dispositioned Confirmed (valid and unaddressed); leave it unset when every blocker-class concern is Refuted or Superseded.
- An unaddressed external blocker therefore prevents an "approve" or "comment only" verdict regardless of the review's own findings.

### 4. Create the Triage

- Create the `{prior_feedback_triage}` artifact in `{planning_folder_path}` so the consolidated summary renders the triage section and applies the cap.

## Rules

### ingest-before-analysis

Prior feedback is ingested and triaged before any independent analysis activity runs, so existing signal informs the review rather than being reconciled against a verdict already formed.

### every-prior-finding-dispositioned

Every prior comment and review thread receives an explicit Confirmed / Refuted / Superseded disposition with reasoning — none is silently dropped.

### unaddressed-blocker-caps-rating

An unaddressed blocker-class concern sets the rating cap; the Overall Rating may not exceed it. A blocker is never rated away by the review's own findings being light.

### single-ingest-of-reported-failures

A runtime error reported in a thread is captured here exactly once and tagged as a reported failure; downstream reported-failure triage consumes the tagged entry rather than re-reading the thread, so it is ingested once and traced once.
