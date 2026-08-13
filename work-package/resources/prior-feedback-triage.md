---
name: prior-feedback-triage
description: Creation guide for bare filename `prior-feedback-triage.json` — the register of every prior comment and review on the PR under review, each with its disposition, author class, and blocker class.
metadata:
  order: 29
---

# Prior Feedback Triage Guide

Creation guide for bare filename `prior-feedback-triage.json`. Answers: what did earlier readers already say, which of it still stands, and does any of it cap the verdict. Author class and blocker class are fields of this register in particular, because the rating cap is derived from them.

## Template

One object per prior comment or review thread, plus the cap the register derives.

```json
{
  "pr": 412,
  "threads": 2,
  "confirmed": 1,
  "blocker_class_confirmed": 1,
  "rating_cap": "request-changes",
  "entries": [
    {
      "id": 1,
      "comment_url": "https://github.com/org/repo/pull/412#discussion_r1",
      "finding": "Storage record never cleared on close",
      "author": "reviewer",
      "author_class": "human",
      "blocker": true,
      "reasoning": "Clear missing on the governance-close path",
      "disposition": "Confirmed",
      "reported_failure": false
    },
    {
      "id": 2,
      "comment_url": "https://github.com/org/repo/pull/412#discussion_r2",
      "finding": "Naming nit on handler",
      "author": "bot",
      "author_class": "bot",
      "blocker": false,
      "reasoning": "Name follows the crate convention",
      "disposition": "Refuted",
      "reported_failure": false
    }
  ]
}
```

| Field | Type | Meaning |
|-------|------|---------|
| `pr` | number | The pull request under review |
| `threads` | number | Prior comment or review threads found |
| `confirmed` | number | Entries dispositioned `Confirmed` |
| `blocker_class_confirmed` | number | Confirmed entries whose `blocker` is true — what the cap turns on |
| `rating_cap` | string | `request-changes` when any blocker-class entry is confirmed, otherwise `unset` |
| `entries` | object[] | One entry per prior comment or review thread, human and bot alike |
| `entries[].id` | number | Stable index within this register, cited by the posted summary |
| `entries[].comment_url` | string | The thread the entry dispositions |
| `entries[].finding` | string | What the earlier reader said, in one line |
| `entries[].author` | string | Who said it |
| `entries[].author_class` | string | `human` or `bot` |
| `entries[].blocker` | boolean | Whether the concern is blocker-class |
| `entries[].reasoning` | string | Why the disposition holds |
| `entries[].disposition` | string | `Confirmed`, `Refuted`, or `Superseded` |
| `entries[].reported_failure` | boolean | True on the single entry that ingests a reported runtime error |

## Rules

- **Entry fields follow the shared table.** `finding`, `author`, `reasoning` and `disposition` carry the same content as [Prior Feedback Triage](./review-mode.md#prior-feedback-triage); this register adds `author_class` and `blocker`, which the cap is derived from.
- **Every thread is an entry.** Confirmed, Refuted, or Superseded, one per prior comment or review thread, human and bot alike. A thread with no entry is a thread nobody dispositioned.
- **The header states the cap.** `rating_cap` is a fact of this register, stated once here and never recomputed elsewhere.
- **A reported runtime error is tagged once.** Exactly one entry carries `reported_failure` true, and that entry is the single ingest point, which is what makes it traceable without re-reading the thread.
- **Line budget:** one object per thread, `reasoning` held to its one line. A thread whose reasoning needs a paragraph carries a link to the report section that holds it.
