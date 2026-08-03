---
name: prior-feedback-triage
description: Creation guide for bare filename `prior-feedback-triage.md` — the register of every prior comment and review on the PR under review, each with its disposition, author class, and blocker class.
metadata:
  order: 29
---

# Prior Feedback Triage Guide

Creation guide for bare filename `prior-feedback-triage.md`. Answers: what did earlier readers already say, which of it still stands, and does any of it cap the verdict. The register carries two columns the posted summary section drops — author class and blocker class — because the rating cap is derived from them.

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

- **Row shape follows the posted section.** Finding, Author, Reasoning and Disposition carry the same content as [Prior Feedback Triage](./review-mode.md#prior-feedback-triage) in the review comment; this register adds the Class and Blocker columns the cap is computed from.
- **Every thread is a row.** Confirmed, Refuted, or Superseded, one per prior comment or review thread, human and bot alike. A thread with no row is a thread nobody dispositioned.
- **The header states the cap.** The cap is a fact of this register, so it is stated once here and read by the summary rather than recomputed.
- **A reported runtime error is tagged once.** The row carrying it is the single ingest point; later reported-failure triage reads the tag.
- **Line budget:** ~40 lines. A thread whose reasoning needs a paragraph gets a link to the report section that holds it.
