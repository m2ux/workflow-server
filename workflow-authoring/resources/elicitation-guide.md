---
name: elicitation-guide
description: Mode dimension sets and the per-dimension question bank for eliciting a workflow specification.
metadata:
  version: 1.0.0
  order: 20
---

# Elicitation Guide

Question bank and mode dimension sets for settling a workflow's design surface one dimension at a time.

## Mode Dimension Sets

| Mode | Dimensions (order) |
|------|--------------------|
| **Create** | purpose → activity list → activity model → checkpoints → artifacts → variables → techniques → rules |
| **Update** | purpose → activity list → checkpoints → artifacts → rules |

The update set omits activity model, variables and techniques — those are already established on the existing workflow and change only when the request says so.

## Dimensions

| Dimension | Capture (settle at least) | Anchor questions |
|-----------|---------------------------|------------------|
| **Purpose** | Workflow purpose, target domain, value proposition | What outcome does a run produce? Who triggers it, and when? What is the value over doing it ad hoc? |
| **Activity list** | Per-activity name, one-sentence purpose, user-interaction flag, expected artifacts | What are the phases from start to finish? What does each phase produce? Which are optional or mode-specific? |
| **Activity model** | Activities connected by transitions from an entry activity, with any branches or rework loops | Is the flow linear, or are there branches and rework loops? What is the entry activity? What are the terminal conditions? |
| **Checkpoints** | Per-activity decision points — question, options, and per-option recorded effect | Where must a human decide? What are the options, and what does each record or where does it route? Blocking or auto-advancing? |
| **Artifacts** | Output files each activity leaves behind, each named by its producing operation's declared artifact | What durable outputs does a run leave? Which one is a run's terminal record? |
| **Variables** | Run state: name, type, description, default | What state must persist across activities? What gates each branch? What is each default? |
| **Techniques** | Capability description and binding sites; reuse shared and cross-workflow operations before authoring a local one | What operations do steps perform? Does an existing shared operation already cover it? What is genuinely new? |
| **Rules** | Cross-activity invariants with their enforcement carrier — structural (gate, condition, transition) or guidance-only | What constraints must always hold? Which can be violated by ignoring text, and so need a structural carrier? |

## Minimum Viable Elicitation

For a small or well-understood workflow, settle at minimum purpose, the activity list, the checkpoints and the rules. Model, artifacts, variables and techniques can usually be derived from those four with one confirmation each.
