---
name: pr-review-response
description: Analyze GitHub PR review comments and craft responses — comment gathering, relevance analysis, response formulation, implementation of approved changes.
metadata:
  version: 1.1.0
  order: 28
  legacy_id: 28
---

# PR Review Analysis and Response Guide

Prerequisites: GitHub CLI (`gh`) installed and authenticated; access to the target repository; **a specific PR number must be provided**.

## Step 1: Gather PR Comments

Retrieve all PR comments:

```bash
gh api repos/[REPO_OWNER]/[REPO_NAME]/pulls/[PR_NUMBER]/comments --paginate
```

Filter to unresolved comments (avoid redundant work):

```bash
# Check latest review dates
gh pr view [PR_NUMBER] --json reviews | jq '.reviews[] | {author: .author.login, state: .state, submittedAt: .submittedAt}' | tail -5

# Filter to comments from latest review round
gh api repos/[REPO_OWNER]/[REPO_NAME]/pulls/[PR_NUMBER]/comments --paginate | jq '.[] | select(.user.login != "[PR_AUTHOR]" and .updated_at >= "[LATEST_REVIEW_DATE]") | {id: .id, body: .body, html_url: .html_url, path: .path, line: .line}' > /tmp/unresolved_comments.json
```

Identify question-type comments:

```bash
cat /tmp/unresolved_comments.json | jq -r '.body' | grep -i "what\|how\|why\|which" | nl
```

Before proceeding: total comment count confirmed; unresolved comments filtered to the latest review round; question-type comments identified; comments saved for analysis.

## Step 2: Analyze Comment Relevance

For each review comment:

1. Read the context: line numbers, file paths, concerns raised
2. Compare against current code: does the comment still apply?
3. Categorize: still applicable and needs response / already addressed in updates / no longer relevant due to changes / needs clarification or discussion

## Step 3: Create Response List

Numbered list of applicable comments — brief description, file path and line number, link to the original GitHub discussion:

```
1. Clarify error handling - src/handler.rs:45 [Discussion](https://github.com/repo/pull/123#discussion_r1234567890)
```

## Step 4: Craft Responses

- Measured technical language; no hyperbole or superlatives ("excellent", "amazing", "perfect")
- Address the specific concern; concrete examples and implementation details where relevant; consider trade-offs and alternatives
- Blockquotes (`>`) for responses so they paste directly into PR comments; include "Optional doc wording" when proposing text changes
- Acknowledge first, then state actions explicitly; reference specific commits when relevant; be concise

Response patterns:

```
Acknowledgment + action:  "Valid point. [Change made]. This [explains benefit]."
Question resolution:      "Correct about [concern]. [Action taken] to address this."
Implementation confirmed: "Implemented as suggested. [Brief description] in [location]."
Technical explanation:    "[Direct answer]. [Implementation details] to resolve this."
```

## Step 5: Response Format Template

```markdown
### [NUMBER]. [Brief Description] - [FILE_PATH:LINE_NUMBER]

**Comment:** ["exact comment text"](link)

**Response:**

> [Detailed explanation addressing the concern]
>
> **Optional doc wording:**
> "[Suggested documentation text]"

**Follow-up Actions:**
1. [Specific action item]
```

## Step 6: Create Review Document

Create a review analysis document with these sections:

1. Document Header with metadata
2. Executive Summary
3. Analysis Methodology
4. Review Comments and Responses (co-located Q&A) — categorized comment list with each comment's disposition (required change, suggestion, question, nit; and whether implemented, acknowledged, or discussed)
5. Changes Made — the changes implemented in response to the review
6. Conclusion
7. Sources and References

## Completion Rules

- All unresolved reviewer comments analyzed and addressed; every response embeds follow-up actions
- User approves which follow-up actions to implement, then approved actions are implemented
- User approves the drafted responses before they are posted to the PR
- Verify all source-code reference links; cite technical details properly
- Finish with a summary of all changes made
