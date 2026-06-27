---
name: elicitation-guide
description: Per-dimension question bank for the guided, one-dimension-at-a-time elicitation of a workflow specification.
metadata:
  order: 9
---

# Elicitation Guide

**Purpose:** A question bank for the guided, one-dimension-at-a-time elicitation in requirements-refinement — the workflow-design counterpart of the work-package [requirements-elicitation](../../work-package/resources/requirements-elicitation.md) guide. The `elicitation` technique poses questions from the dimension currently being elicited; the activity confirms each dimension before moving to the next.

Conversation, not interrogation: ask what you need to capture the dimension, skip follow-ups the user's answer already settles, and present the accumulated design after each answer.

---

## Dimensions

| Dimension | Goal | Anchor questions |
|-----------|------|------------------|
| **Purpose** | The problem the workflow solves and who runs it | What outcome does a run produce? Who triggers it, and when? What's the value over doing it ad hoc? |
| **Activity list** | The ordered activities, each with a one-line purpose and expected artifacts | What are the phases from start to finish? What does each phase produce? Which are optional or mode-specific? |
| **Activity model** | How activities connect — sequential transitions from an initial activity, with any branches/loops | Is the flow linear, or are there branches/rework loops? What's the entry activity? What are the terminal conditions? |
| **Checkpoints** | The user decision points per activity — question, options, per-option effects | Where must a human decide? What are the options, and what does each set or where does it route? Blocking or auto-advance? |
| **Artifacts** | The output files each activity produces (named by the producing technique's output) | What durable outputs does each activity leave behind? Where do they live? |
| **Variables** | Workflow-level state: name, type, description, default, required | What state must persist across activities? What gates each branch? What's each variable's default? |
| **Techniques** | The capabilities steps bind — reuse (meta / cross-workflow) before authoring local | What operations do steps perform? Does an existing meta or other-workflow technique already cover it? What's genuinely new? |
| **Rules** | Cross-activity rules and their enforcement — structural (checkpoint/condition/validate) vs guidance-only | What constraints must always hold? Which can be violated by ignoring text, and so need structural backing? |

---

## Minimum Viable Elicitation

For a small or well-understood workflow, at minimum settle: purpose, the activity list, the checkpoints, and the rules. The model, artifacts, variables, and techniques can often be derived from those four with a single confirmation each.

---

## Related Guides

- [Requirements Elicitation (work-package)](../../work-package/resources/requirements-elicitation.md) — the work-package counterpart
- [Design Principles](design-principles.md)
