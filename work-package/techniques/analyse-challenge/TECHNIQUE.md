---
metadata:
  version: 1.2.0
---

## Capability

Parameterized analyse–challenge–combine loop that drives agent-resolvable concerns to convergence; residue surfaces at activity level.

## Inputs

### concern_kind

Domain of the open set this binding addresses (e.g. `assumptions`, `open_questions`).

### analyse_technique

Technique path invoked each iteration to deepen or resolve agent-resolvable items (e.g. `review-assumptions::reconcile`, `codebase-comprehension::deep-dive`).

### challenge_perspectives

List of adversarial perspectives (or lens names) for the challenge pass.

### concern_document

*(optional)* The document holding the concern set for this `{concern_kind}` — the log or table this binding maintains.

### concerns_agent_resolvable

True while another analyse/challenge iteration is needed; false once no open item is agent-resolvable.

### residual_opens_remain

True iff irreducible opens remain after convergence; false for an empty open set.

### residual_opens

*(optional)* The residual open items for this `{concern_kind}`; empty or unset when none remain.

## Rules

### structure-enforces-convergence

Call-sites bind this group and gate residual interview on `{residual_opens_remain}`. Do not re-implement the loop body per activity.

### parameterize-dont-fork

Stages differ by inputs — the concern kind, the analyse operation, the perspectives — not by forked copies of the protocol.
