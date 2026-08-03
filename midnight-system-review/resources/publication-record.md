---
name: publication-record
description: Creation guide for bare filename `publication-record.md` — the close-out record of what was posted, where, as which review type, under which verdict, with links back to the artifacts that produced it.
metadata:
  order: 7
---

# Publication Record Guide

Creation guide for bare filename `publication-record.md`. The record answers one question later: what did this review actually publish, and what can it be traced back to. It reflects what happened, including a post that failed.

## Template

```markdown
# Publication Record

| Field | Value |
|-------|-------|
| Posted | yes \| no |
| PR | #{n} |
| Review type | approve \| request-changes \| comment |
| Verdict | {merge-readiness verdict} |
| Posted at | {timestamp} |

**Traces to:** [review report](review-report.md) · [findings register](findings-register.md) · [evidence log](evidence-log.md)

{When the post failed: one line on the reason.}
```

## Rules

- **The record states the outcome, not the intent.** A failed post is recorded as a failed post with its reason. Whether to retry is decided elsewhere.
- **Three links, always.** The report, the register, and the evidence log are what the posted review rests on, so the record links all three.
- **No verdict rationale.** The verdict's reasoning lives in the review report; the record carries the value.
- **Line budget:** ~20 lines.
