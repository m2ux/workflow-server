---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Audit `rules[]` across the workflow, activities, and techniques for hygiene: protocol restatement, sibling contradictions, cross-level duplication (with the worker-visibility carve-out), flat prefix patterns, ambiguity, and single-step rules (AP-24 through AP-29).

## Protocol

### 1. Audit Rule Hygiene

- Protocol restatement (AP-24): does the rule verbatim copy a protocol phase in the same technique? If so, flag for removal
- Apparent contradictions (AP-25): do sibling rules within the same technique conflict?
- Cross-level duplication (AP-27): does the same rule appear at multiple levels (workflow / activity / technique)?
- Worker-visibility carve-out for AP-27: workers receive `get_activity` and `get_technique` responses but never `workflow.yaml`; behavioural rules workers must follow cannot be lifted to the workflow root. Per-technique duplication of worker-directed rules is correct, not a violation. Only flag cross-level duplication when the rule is orchestrator-only (variable management, transitions, commit policy, mode handling)
- Flat prefix patterns (AP-26): do rule keys share a common prefix (`foo-bar`, `foo-baz`)? Flag for grouped array refactoring
- Ambiguity (AP-25): could a rule be interpreted in contradictory ways without its group context?
- Single-step rules (AP-29): does the rule apply to only one protocol step? If so, fold into the step's description and delete the standalone rule

### 2. Present Findings

- Present the rule-hygiene-pass results to the user: restatements, contradictions, cross-level duplications, prefix patterns, and ambiguities, with file + rule-key citations and recommended actions
