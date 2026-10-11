---
name: pr-review-response
description: Response format and review-document templates for PR review responses.
metadata:
  version: 1.3.0
  order: 28
  legacy_id: 28
---

# PR Review Response Templates

## Response Format Template

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

## Review Document Template

The analysis of one review round. Each comment entry takes the [Response Format Template](#response-format-template) shape.

```markdown
# PR Review Analysis — PR #[number]

> [work package] · [date] · [N] comments · re-review [required / not required]

## Scope of This Round

[Which review round the comments come from, what was filtered out as already resolved, and what each disposition was compared against.]

## Comments and Responses

[One entry per applicable comment, in the Response Format Template shape, each carrying its category — required change / suggestion / question / nit — and its disposition.]

## Changes Made

- **[concern]** — [what the change makes true] ([commit](commit-url))

## Re-review Decision

[Required or not required, and what the classification turned on.]

## Sources

| Source | What it established |
|--------|---------------------|
| [thread](url) | [what it showed] |
```

## Rules

- **The header carries the round's shape.** Comment total and re-review outcome are header fields, so a reader has the outcome before the entries.
- **Each comment appears once,** its category, disposition and response together in one entry. A disposition table beside the entries states the same fact twice.
- **Changes name the concern and its commit.** The diff holds the file-level detail; a bullet naming a path restates it.
- **Line budget:** ~80 lines. One entry per comment responded to, each naming the change that answers it.
