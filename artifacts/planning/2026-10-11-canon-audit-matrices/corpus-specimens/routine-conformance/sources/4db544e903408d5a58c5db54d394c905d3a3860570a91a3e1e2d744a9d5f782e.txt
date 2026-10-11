---
name: run-status
description: Creation-guide for the run status a completed activity emits to the user.
metadata:
  version: 1.0.0
---


# Run Status Guide

What a completed activity delivered, and where the run now stands.

## Template

```markdown
[13 Assumptions review](https://github.com/owner/repo/blob/session-branch/planning-folder/07-assumptions-log.md)

One line summarising what it delivered.

- [x] [13 Assumptions review](https://github.com/owner/repo/blob/session-branch/planning-folder/07-assumptions-log.md)
- [ ] [14 Implementation](…)
```

## Rules

- **Three parts, in this order** — a link to the artifact the completed activity produced, one line summarising it, then the activity checklist.
- **Checklist items name Progress rows** — each item's text is the row number and name from the planning README's [Progress table](./planning-readme.md#progress-table), never an artifact filename, whose numeric prefixes repeat across rows and which several rows do not carry. That text **is** the hyperlink, targeting the artifact's remote URL on the session branch.
- **The list is complete on every emission** — every activity, run and unrun alike. The unrun tail stays itemised rather than rolled into one summarising item.
- **Enumerations are bullet lists** — any other enumeration in the emission is a bullet list rather than a semicolon run-on.
- **Workflow mechanics stay out** — which activity is dispatched to whom, worker resumes and identities, how much room a batch has left, usage recording, commit bookkeeping. None of it is actionable, and the checklist already carries where the run stands.
- **What the user needs in order to decide stays in**, at whatever length it takes: a gate's substance, an option's trade-off, what a finding turns on. The distinction is the decision, not the length.
- **The artifact is the authority** — a multi-paragraph restatement of what an artifact already records drifts from it, and a reader has no way to tell which of the two governs.
