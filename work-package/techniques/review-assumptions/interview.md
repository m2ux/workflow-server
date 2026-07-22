---
metadata:
  version: 1.2.0
---

## Capability

Judgement-augmentation context for residual stakeholder-dependent assumptions, ready for residual interview/batch presentation.

## Inputs

### open_assumptions

The residual open assumptions to assemble; empty when all assumptions were already resolved. In interview mode the current one is bound as `current_assumption`; in batch mode (default) the whole list is assembled together.

### assumptions_log

The assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) carrying each assumption's analyse/challenge history and technical context, linked into the presentation for full detail.

### assembly_mode

*(optional)* `batch` (default) or `interview`. Activities bind `interview` only for individual drill-down after a batch checkpoint selects that path.

## Outputs

### assumption_review_presentation

Structured judgement-augmentation context for decision, shaped like the [Open Assumptions](../../resources/assumptions-review.md#open-assumptions) entry fields (decision space, non-resolvability rationale, technical context, agent's position, reversibility) plus a link to the assumptions log.


## Protocol

### 1. Empty-Set Skip

- If `{open_assumptions}` is empty (or `{has_open_assumptions}` is false), emit a one-line summary that analyse-challenge resolved all assumptions and **do not** assemble judgement context — no user input needed

### 2. Format Judgement Context

- For each residual open assumption, assemble structured context: (1) the decision space — what alternatives exist, (2) trade-off analysis for each alternative, (3) why analyse-challenge could not resolve it, (4) relevant technical context from reconcile/challenge — code patterns, constraints, partial evidence, (5) which alternative the agent's current assumption favors and why
- Order the decision space (alternatives and trade-offs) before the agent's favored option to reduce anchoring bias
- Trade-off analysis should cover relevant dimensions from: implementation complexity, maintenance burden, consistency with existing patterns, risk of unintended side-effects, decision reversibility, alignment with stated requirements, and time/effort cost. Include only dimensions that meaningfully differentiate the alternatives
- If analyse/challenge produced partial evidence, include it so what is already known is clear
- Flag decision reversibility: easily-reversible or path-committing via [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[reversibility-signal](../../../meta/techniques/gitnexus-operations/reversibility-signal.md) when a symbol is known

### 3. Emit Presentation Output

- Default `{assembly_mode}` is `batch`: assemble all open assumptions together, ordered by decision impact; when 5 or more, group by theme
- `interview` mode: assemble the current assumption only (individual drill-down)
- Include a clickable markdown link to the assumptions-log for full details
- Frame as judgement augmentation on genuinely open questions — everything agent-resolvable is already resolved inside analyse-challenge
- Emit `{assumption_review_presentation}` for the binding activity to surface at the residual batch (or individual) checkpoint
