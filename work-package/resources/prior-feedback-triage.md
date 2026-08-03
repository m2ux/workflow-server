---
name: prior-feedback-triage
description: Creation guide for bare filename `prior-feedback-triage.md` — the register of every prior comment and review on the PR under review, each with its disposition, author class, and blocker class.
metadata:
  order: 29
---

# Prior Feedback Triage Guide

Creation guide for bare filename `prior-feedback-triage.md`. Answers: what did earlier readers already say, which of it still stands, and does any of it cap the verdict. Author class and blocker class are columns of this register in particular, because the rating cap is derived from them.

## Template

```markdown
# Prior Feedback Triage — PR #{n}

**Threads:** {n} · **Confirmed:** {n} · **Blocker-class confirmed:** {n} · **Rating cap:** request-changes | unset

| # | Finding | Author | Class | Blocker | Reasoning | Disposition |
|---|---------|--------|-------|---------|-----------|-------------|
| [1](pr-comment-url) | Storage record never cleared on close | reviewer | human | yes | Clear missing on the governance-close path | Confirmed |
| [2](pr-comment-url) | Naming nit on handler | bot | bot | no | Name follows the crate convention | Refuted |
```

## Rules

- **Row shape follows the shared table.** Finding, Author, Reasoning and Disposition carry the same content as [Prior Feedback Triage](./review-mode.md#prior-feedback-triage); this register adds the Class and Blocker columns the cap is derived from.
- **Every thread is a row.** Confirmed, Refuted, or Superseded, one per prior comment or review thread, human and bot alike. A thread with no row is a thread nobody dispositioned.
- **The header states the cap.** The cap is a fact of this register, stated once here and never recomputed elsewhere.
- **A reported runtime error is tagged once.** The row carrying it is the single ingest point, and the tag is what makes it traceable without re-reading the thread.
- **Line budget:** ~40 lines. A thread whose reasoning needs a paragraph gets a link to the report section that holds it.
