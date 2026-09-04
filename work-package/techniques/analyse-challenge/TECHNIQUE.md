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

### convergence_flag

Name of the boolean bag variable that drives the loop — true while another analyse/challenge iteration is needed.

### residue_flag

Name of the boolean bag variable that is true iff irreducible opens remain after convergence (gates residual interview outside this group).

### residue_collection

*(optional)* Name of the collection holding residual open items for batch/interview presentation.

## Rules

### structure-enforces-convergence

Call-sites bind this group and gate residual interview on `{residue_flag}`. Do not re-implement the loop body per activity.

### parameterize-dont-fork

Stages differ by inputs (`analyse`, perspectives, flag names) — not by forked copies of the protocol.
