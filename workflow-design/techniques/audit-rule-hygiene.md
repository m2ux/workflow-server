---
metadata:
  version: 1.0.0
---

## Capability

Audit `rules[]` across the workflow, activities, and techniques for hygiene: protocol restatement, sibling contradictions, cross-level duplication, worker-rule reach, flat prefix patterns, ambiguity, and single-step rules (`no-rule-protocol-restatement`–`no-one-step-rules`, including `worker-rule-reach`).

## Outputs

### rule_hygiene_finding_count

Count of rule-hygiene findings — each a flagged rule with its file, rule key, the hygiene class (restatement, contradiction, cross-level duplication, prefix pattern, ambiguity, single-step), and the recommended action. Interpolated into the rule-hygiene-confirmed checkpoint message.

## Protocol

### 1. Audit Rule Hygiene

- Protocol restatement (`no-rule-protocol-restatement`): does the rule verbatim copy a protocol phase in the same technique? If so, flag for removal
- Apparent contradictions (`rule-group-disambiguation`): do sibling rules within the same technique conflict?
- Cross-level duplication (`single-rule-authority`): does the same orchestrator-only / single-home rule appear at multiple levels (workflow / activity / technique)?
- Worker reach (`worker-rule-reach`): apply the catalog entry — do not restate its Detect/Do not flag here
- Flat prefix patterns (`grouped-rule-keys`): do rule keys share a common prefix (`foo-bar`, `foo-baz`)? Flag for grouped array refactoring
- Ambiguity (`rule-group-disambiguation`): could a rule be interpreted in contradictory ways without its group context?
- Single-step rules (`no-one-step-rules`): does the rule apply to only one protocol step? If so, fold into the step's description and delete the standalone rule

### 2. Present Findings

- Present the rule-hygiene-pass results to the user: restatements, contradictions, cross-level duplications, prefix patterns, and ambiguities, with file + rule-key citations and recommended actions
