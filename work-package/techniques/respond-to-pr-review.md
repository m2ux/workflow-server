---
metadata:
  version: 2.2.0
---

## Capability

Systematic response to PR review comments — analysis through posted replies.

## Inputs

### review_comments

Review comments fetched from PR

## Outputs

### review_analysis

PR review [analysis](../resources/pr-review-response.md#review-document-template) document

#### artifact

`{YYYY-MM-DD}-pr{pr_number}-review-analysis.md`

#### requires_replan

Whether the changes are significant enough to require substantial rework

## Protocol

### 1. Fetch Comments

- Take the response format and review-document shapes from the [pr-review-response templates](../resources/pr-review-response.md); the rules below govern response content
- Fetch the `{review_comments}` from the PR identified by `{pr_number}` using the `gh` API:
  ```bash
  gh api repos/<owner>/<repo>/pulls/{pr_number}/comments --paginate
  ```
  - If the `gh` API returns an error fetching comments, check authentication and PR access, then retry.
  - If no review comments are found, verify the PR has been reviewed and check comment visibility before proceeding.
- Filter to unresolved comments from the latest review round (avoid re-answering resolved threads): derive `{$latest_review_date}` from the review timeline, then keep only comments from reviewers (not the PR author) whose GitHub `` `updated_at` `` field is at or after `{$latest_review_date}`. Project each surviving comment to its `.id`, `.body`, `` `html_url` `` (as `url`), `.path`, and `.line`, and save the filtered set to `/tmp/unresolved.json`. Run the pipeline with the `` `updated_at` `` timestamp key and the `` `html_url` `` link key substituted for the bracketed placeholders:
  ```bash
  gh pr view {pr_number} --json reviews | jq '.reviews[] | {author: .author.login, state: .state, submittedAt: .submittedAt}' | tail -5
  gh api repos/<owner>/<repo>/pulls/{pr_number}/comments --paginate | jq --arg since "{$latest_review_date}" '.[] | select(.user.login != "<pr-author>" and .["<timestamp-key>"] >= $since) | {id, body, url: .["<link-key>"], path, line}' > /tmp/unresolved.json
  ```
- Identify question-type comments:
  ```bash
  jq -r '.body' /tmp/unresolved.json | grep -i "what\|how\|why\|which" | nl
  ```
- Before proceeding: total comment count confirmed; unresolved comments filtered to the latest review round; question-type comments identified; comments saved for analysis

### 2. Categorize

- For each of the `{review_comments}`, read its context (file path, line number, concern raised) and compare against the current code: does the comment still apply, or has it been addressed or obsoleted by later changes?
- Assign each comment a disposition: still applicable and needs response / already addressed in updates / no longer relevant due to changes / needs clarification or discussion
- Categorize each comment by type (required change, suggestion, question, nit)
- Identify actionable items vs discussion points
- Prioritize by reviewer authority and impact
- Compile a numbered response list of the applicable comments — brief description, `path:line`, and a link to the original GitHub discussion, e.g. `1. Clarify error handling - src/handler.rs:45 [Discussion](https://github.com/repo/pull/123#discussion_r1234567890)`

### 3. Address Comments

- For each review item with follow-up actions, emit the item and its candidate actions as structured bindable output for the binding activity to surface and collect selection (e.g., '1,3' or 'all' or 'none').
- Only implement actions explicitly selected via the activity response
- Commit fix changes per concern
- Document which comments require substantial rework vs inline fixes
- Group related fixes into logical commits, not one giant commit

### 4. Post Responses

- Draft each response per the [response format template](../resources/pr-review-response.md#response-format-template) and the response-crafting rules below
- Emit drafted PR responses as bindable output for the binding activity to approve before posting
- Post approved responses to the PR comment thread
- If disagreeing with a reviewer, explain reasoning explicitly

### 5. Update Pr

- Push all fix commits to the PR branch
- Post response summary to PR, finishing with a summary of all changes made

### 6. Assess Outcome

- After applying reviewer-requested changes, apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[detect-changes](../../meta/techniques/gitnexus-operations/detect-changes.md) to inform the 'minor fix' vs 'significant change' classification — small symbol/process deltas suggest minor; broad fan-out suggests significant.
- Determine if re-review is needed (significant changes) or minor fixes suffice
- Capture the categorized dispositions, changes made, and re-review decision as the `{review_analysis}` document


## Rules

### respond-to-all

Every review comment must receive a response — acknowledged, implemented, or discussed — and every response embeds its follow-up actions

### prioritize-required

Address required changes before suggestions and nits

### measured-response-language

Tone per [agent-conduct](../../meta/techniques/agent-conduct.md) `communication-*` rules. Address the specific concern with concrete examples and trade-offs where relevant.

### blockquote-paste-format

Format each response as a blockquote (`>`) so it pastes directly into the PR comment; include an "**Optional doc wording:**" block when proposing documentation text changes.

### acknowledge-then-act

Acknowledge the reviewer's point first, then state the actions taken explicitly; reference specific commits when relevant; be concise.

### response-patterns

Standard response shapes:

```
Action taken:             "[Change made]. [Brief rationale if needed]."
Question resolution:      "[Action taken] for [concern]. [Where it lands]."
Implementation confirmed: "Implemented as suggested. [Brief description] in [location]."
Technical explanation:    "[Direct answer]. [Implementation details] to resolve this."
```
### verify-reference-links

Verify every source-code reference link in responses and the review document resolves; cite technical details properly.
