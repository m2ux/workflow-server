---
name: workflow-retrospective
description: Methodology and section template for the workflow retrospective written into the COMPLETE.md close-out document.
metadata:
  version: 2.1.0
  order: 20
  legacy_id: 20
---


# Workflow Retrospective Guide

Analyze the session's **non-checkpoint** user interactions and, when a resolved session trace is available, its **mechanical** friction to surface workflow defects — then record the result as the `## Workflow Retrospective` section of [COMPLETE.md](complete-wp.md). Complementary lean detail lives in `session-trace.md` when produced; join the planning-folder `token-usage.md` by link when present.

## Signals to Scan For

| Signal | Examples | Indicates |
|--------|----------|-----------|
| Clarification requests | "What do you mean by X?" | Unclear instructions or missing context |
| Corrections | "No, I meant…", "Actually…" | Ambiguous steps or wrong assumptions |
| Frustration | "Why are you doing X?", "I already said…" | Workflow friction |
| Process questions | "Should I do X first?" | Missing guidance or unclear sequencing |
| Feature requests | "Can you also…" | Missing capability |
| Skip requests | User asks to skip or abbreviate | Unnecessary ceremony |

### Mechanical classes (from resolved `get_trace`)

| Class | Examples | Indicates |
|-------|----------|-----------|
| `[trace-warning]` | Repeated `vw` on `step_manifest` gaps/order/empty outputs; technique-fetch fidelity failures; illegal or paraphrased transitions / `transition_condition` mismatches | Instruction or fidelity defect in technique/activity text |
| `[trace-retry]` | Tool `s: error` clusters; continue/re-dispatch storms on the same activity | Missing recovery guidance or brittle handoff protocol |
| `[trace-redundancy]` | Repeated identical `get_technique` / `get_resource` / `get_activity` storms without new content | Bundle/delivery guidance gap or over-fetch habit encoded in instructions |

Priority: **high** = repeated corrections, frustration, missing guidance that caused incorrect implementation, workflow steps consistently skipped, or repeated mechanical classes across activities; **medium** = single clarifications, process questions, or isolated `vw`/error bursts; **low** = feature requests, skip requests, edge cases, and ideas.

**Friction → fix:** every mechanical observation maps to a prioritized recommendation that names the canonical technique, resource, or activity prose to change — never agent blame.

## Output Section Template

```markdown
## Workflow Retrospective

[messages: N total, M non-checkpoint · session quality: Smooth / Minor friction / Significant issues]
[trace: link session-trace.md when written · join token-usage.md when present]

### Observations

<!-- One line per signal, ONLY for categories that occurred. No empty-category tables.
     Also record checkpoint anomalies here: expected-vs-actual checkpoints triggered,
     checkpoints always answered with their default (merge/demote candidates per AP-81/82),
     and any workflow deviations.
     Mechanical lines use [trace-warning] / [trace-retry] / [trace-redundancy]. -->
- [correction] "[short quote]" — [activity/step] — [root cause]
- [clarification] "[short quote]" — [what was unclear]
- [trace-warning] [vw cluster summary] — [activity] — [canonical text to fix]

### Recommendations

<!-- Prioritized, specific, actionable. State each once — not again in a summary.
     Mechanical fixes name technique/resource/activity paths. -->
1. **High:** [issue] → [specific workflow change] ([affected section])
2. **Medium:** [issue] → [change]

**Key takeaway:** [one sentence]
**Action required:** [yes — create issue #N / no]
```

## Rules

- **Workflow improvements, never user or agent error:** users and mechanical traces reveal workflow gaps — analyze as defects in instructions, not blame.
- **Exception-only:** include only signal categories with content; a smooth session's retrospective is the message counts, a takeaway, and "action required: no".
- **State each lesson once.** No Summary/Lessons/Takeaway triple-statement — the takeaway line is the recap.
- **Honest, specific, prioritized ruthlessly** — no generic positives, no recommendation lists longer than can be actioned.
- **Join, don't duplicate cost** — session-trace never estimates cost; link `token-usage.md` when present.
- Skip entirely per conduct-retrospective's `skip-if-trivial` rule (including its mechanical-friction carve-in).
