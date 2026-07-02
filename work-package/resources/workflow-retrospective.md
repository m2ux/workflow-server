---
name: workflow-retrospective
description: Methodology and section template for the workflow retrospective written into the COMPLETE.md close-out document.
metadata:
  version: 2.0.0
  order: 20
  legacy_id: 20
---


# Workflow Retrospective Guide

Analyze the session's **non-checkpoint** user interactions to surface workflow friction, then record the result as the `## Workflow Retrospective` section of [COMPLETE.md](complete-wp.md) — not a standalone document.

## Signals to Scan For

| Signal | Examples | Indicates |
|--------|----------|-----------|
| Clarification requests | "What do you mean by X?" | Unclear instructions or missing context |
| Corrections | "No, I meant…", "Actually…" | Ambiguous steps or wrong assumptions |
| Frustration | "Why are you doing X?", "I already said…" | Workflow friction |
| Process questions | "Should I do X first?" | Missing guidance or unclear sequencing |
| Feature requests | "Can you also…" | Missing capability |
| Skip requests | User asks to skip or abbreviate | Unnecessary ceremony |

Priority: **high** = repeated corrections, frustration, missing guidance that caused incorrect implementation, or workflow steps consistently skipped; **medium** = single clarifications or process questions; **low** = feature requests, skip requests, edge cases, and ideas.

## Output Section Template

```markdown
## Workflow Retrospective

[messages: N total, M non-checkpoint · session quality: Smooth / Minor friction / Significant issues]

### Observations

<!-- One line per signal, ONLY for categories that occurred. No empty-category tables.
     Also record checkpoint anomalies here: expected-vs-actual checkpoints triggered,
     checkpoints always answered with their default (merge/demote candidates per AP-81/82),
     and any workflow deviations. -->
- [correction] "[short quote]" — [activity/step] — [root cause]
- [clarification] "[short quote]" — [what was unclear]

### Recommendations

<!-- Prioritized, specific, actionable. State each once — not again in a summary. -->
1. **High:** [issue] → [specific workflow change] ([affected section])
2. **Medium:** [issue] → [change]

**Key takeaway:** [one sentence]
**Action required:** [yes — create issue #N / no]
```

## Rules

- **Workflow improvements, never user error:** users reveal workflow gaps — a signal is always analyzed as a defect in the workflow, not blamed on the user.
- **Exception-only:** include only signal categories with content; a smooth session's retrospective is the message counts, a takeaway, and "action required: no".
- **State each lesson once.** No Summary/Lessons/Takeaway triple-statement — the takeaway line is the recap.
- **Honest, specific, prioritized ruthlessly** — no generic positives, no recommendation lists longer than can be actioned.
- Skip entirely per conduct-retrospective's `skip-if-trivial` rule.
