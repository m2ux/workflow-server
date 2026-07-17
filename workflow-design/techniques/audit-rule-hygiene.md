---
metadata:
  version: 1.0.0
---

## Capability

Audit `rules[]` across the workflow, activities, and techniques for hygiene: protocol restatement, sibling contradictions, cross-level duplication (with the worker-visibility carve-out), flat prefix patterns, ambiguity, and single-step rules (`no-rule-protocol-restatement`–`no-one-step-rules`).

## Outputs

### rule_hygiene_finding_count

Count of rule-hygiene findings — each a flagged rule with its file, rule key, the hygiene class (restatement, contradiction, cross-level duplication, prefix pattern, ambiguity, single-step), and the recommended action. Interpolated into the rule-hygiene-confirmed checkpoint message.

## Protocol

### 1. Audit Rule Hygiene

- Protocol restatement (`no-rule-protocol-restatement`): does the rule verbatim copy a protocol phase in the same technique? If so, flag for removal
- Apparent contradictions (`rule-group-disambiguation`): do sibling rules within the same technique conflict?
- Cross-level duplication (`single-rule-authority`): does the same rule appear at multiple levels (workflow / activity / technique)?
- Worker-visibility carve-out for `single-rule-authority`: workers receive `get_activity` and `get_technique` responses but never `workflow.yaml`; behavioural rules workers must follow cannot be lifted to the workflow root. Per-technique duplication of worker-directed rules is correct, not a violation. Only flag cross-level duplication when the rule is orchestrator-only (variable management, transitions, commit policy, mode handling)
- Flat prefix patterns (`grouped-rule-keys`): do rule keys share a common prefix (`foo-bar`, `foo-baz`)? Flag for grouped array refactoring
- Ambiguity (`rule-group-disambiguation`): could a rule be interpreted in contradictory ways without its group context?
- Single-step rules (`no-one-step-rules`): does the rule apply to only one protocol step? If so, fold into the step's description and delete the standalone rule

### 2. Present Findings

- Present the rule-hygiene-pass results to the user: restatements, contradictions, cross-level duplications, prefix patterns, and ambiguities, with file + rule-key citations and recommended actions
