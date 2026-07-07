---
metadata:
  version: 2.0.0
---

## Capability

Elicit a single design dimension of the workflow specification — posing the questions for `{current_dimension}` from the [elicitation-guide](../resources/elicitation-guide.md), recording the answers, and presenting the accumulated design so far.

## Inputs

### current_dimension

The design dimension to elicit this iteration — one of purpose, activity list, activity model, checkpoints, artifacts, variables, techniques, rules (see the [elicitation-guide](../resources/elicitation-guide.md)).

## Protocol

### 1. Elicit One Dimension

- Pose the questions for `{current_dimension}` from the [elicitation-guide](../resources/elicitation-guide.md), conversation-not-interrogation: ask what is needed to capture the dimension, skip follow-ups the user's answer already settles, probe deeper when the answer is ambiguous
- Capture the dimension at the depth the guide describes:
  - purpose: workflow purpose, target domain, value proposition
  - activity list: per-activity name, one-sentence purpose, user-interaction flag, expected artifacts
  - activity model: activities connected by `transitions` from an `initialActivity`, with any branches or rework loops
  - checkpoints: per-activity decision points — question, options, and per-option effects (`setVariable`, `transitionTo`, `skipActivities`)
  - artifacts: the output files each activity produces (each named by the producing technique's `#### artifact` output)
  - variables: workflow-level state-tracking name, type, description, default, required flag
  - techniques: capability description and binding sites, reusing a meta or cross-workflow technique before authoring a workflow-local one
  - rules: workflow-level cross-activity rules with their enforcement classification — structural (checkpoint / condition / validate) or guidance-only
- Present the accumulated design after the answer so the user can track progress before the dimension is confirmed
