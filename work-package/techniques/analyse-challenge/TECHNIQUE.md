---
metadata:
  version: 1.0.0
---

## Capability

Parameterized analyse–challenge–combine loop that drives agent-resolvable concerns to convergence; residue surfaces at activity level.

## Inputs

### concern_kind

Domain of the open set this binding addresses (e.g. `assumptions`, `open_questions`).

### analyse

Technique path invoked each iteration to deepen or resolve agent-resolvable items (e.g. `review-assumptions::reconcile`, `codebase-comprehension::deep-dive`).

### challenge_perspectives

List of adversarial perspectives (or lens names) for the parallel challenge pass.

### convergence_flag

Name of the boolean bag variable that drives the loop — true while another analyse/challenge iteration is needed.

### residue_flag

Name of the boolean bag variable that is true iff irreducible opens remain after convergence (gates residual interview outside this group).

### residue_collection

*(optional)* Name of the collection holding residual open items for batch/interview presentation.

## Outputs

### convergence_flag

Bound convergence variable after the loop — false when analyse-challenge has converged.

### residue_flag

Bound residue variable — true iff irreducible opens remain for activity-level residual UX.

### residue_collection

*(optional)* Residual open items after combine, when a collection name was supplied.


## Rules

### structure-enforces-convergence

Call-sites bind this group and gate residual interview on `{residue_flag}`. Do not re-implement the loop body per activity.

### parameterize-dont-fork

Stages differ by inputs (`analyse`, perspectives, flag names) — not by forked copies of the protocol.
