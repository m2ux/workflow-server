---
name: elicitation-guide
description: Per-dimension question bank for the guided, one-dimension-at-a-time elicitation of a workflow specification.
metadata:
  order: 9
---

# Elicitation Guide

Question bank and mode dimension sets for eliciting a workflow specification — the workflow-design counterpart of the work-package [requirements-elicitation](../../work-package/resources/requirements-elicitation.md) guide.

## Mode Dimension Sets

| Mode | Dimensions (order) |
|------|--------------------|
| **Create** | purpose → activity list → activity model → checkpoints → artifacts → variables → techniques → rules |
| **Update** | purpose → activity list → checkpoints → artifacts → rules |

The update set omits activity model, variables, and techniques — those are already established on the existing workflow.

## Dimensions

| Dimension | Capture (settle at least) | Anchor questions |
|-----------|---------------------------|------------------|
| **Purpose** | Workflow purpose, target domain, value proposition | What outcome does a run produce? Who triggers it, and when? What's the value over doing it ad hoc? |
| **Activity list** | Per-activity name, one-sentence purpose, user-interaction flag, expected artifacts | What are the phases from start to finish? What does each phase produce? Which are optional or mode-specific? |
| **Activity model** | Activities connected by `transitions` from an `initialActivity`, with any branches or rework loops | Is the flow linear, or are there branches/rework loops? What's the entry activity? What are the terminal conditions? |
| **Checkpoints** | Per-activity decision points — question, options, and per-option effects (`setVariable`, `transitionTo`, `skipActivities`) | Where must a human decide? What are the options, and what does each set or where does it route? Blocking or auto-advance? |
| **Artifacts** | Output files each activity produces (each named by the producing technique's `#### artifact` output) | What durable outputs does each activity leave behind? Where do they live? |
| **Variables** | Workflow-level state: name, type, description, default, required | What state must persist across activities? What gates each branch? What's each variable's default? |
| **Techniques** | Capability description and binding sites; reuse meta / cross-workflow before authoring local | What operations do steps perform? Does an existing meta or other-workflow technique already cover it? What's genuinely new? |
| **Rules** | Cross-activity rules with enforcement classification — structural (checkpoint / condition / validate) or guidance-only | What constraints must always hold? Which can be violated by ignoring text, and so need structural backing? |

## Minimum Viable Elicitation

For a small or well-understood workflow, at minimum settle: purpose, the activity list, the checkpoints, and the rules. The model, artifacts, variables, and techniques can often be derived from those four with a single confirmation each.
