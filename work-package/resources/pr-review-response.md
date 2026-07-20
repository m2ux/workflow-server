---
name: pr-review-response
description: Response format and review-document templates for PR review responses.
metadata:
  version: 1.2.1
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

Create a review analysis document with these sections:

1. Document Header with metadata
2. Executive Summary
3. Analysis Methodology
4. Review Comments and Responses (co-located Q&A) — categorized comment list with each comment's disposition (required change, suggestion, question, nit; and whether implemented, acknowledged, or discussed)
5. Changes Made — the changes implemented in response to the review
6. Conclusion
7. Sources and References
