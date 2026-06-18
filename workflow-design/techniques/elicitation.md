---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Refine the user's free-form description into a complete workflow specification through guided, one-dimension-at-a-time elicitation: purpose, activity list, activity model, checkpoints, artifacts, variables, techniques, and rules — presenting accumulated design after each answer.

## Protocol

### 1. Elicit One Dimension

- Elicit one design dimension at a time and present the accumulated design after each answer so the user can track progress
- Capture, per dimension:
  - purpose: workflow purpose, target domain, value proposition — what problem it solves and who uses it
  - activity list: per-activity name, one-sentence purpose, user-interaction flag, expected artifacts
  - activity model: activities connected by `transitions` from an `initialActivity`
  - checkpoints: per-activity decision points — question, options, and per-option effects (`setVariable`, `transitionTo`, `skipActivities`)
  - artifacts: the output files each activity produces (each named by the producing technique's `#### artifact` output; the activity's artifact contract is synthesized from its techniques)
  - variables: workflow-level state-tracking name, type, description, default, required flag
  - techniques: capability description, which steps bind each technique, required tools / protocol phases / rules per technique
  - rules: workflow-level cross-activity rules with their enforcement classification — structural (via checkpoint/condition/validate) or guidance-only
