---
metadata:
  version: 1.0.0
---

## Capability

Present the open (stakeholder-dependent, non-code-resolvable) assumptions to the user as judgement-augmentation, framing the decision space and trade-offs so the user can resolve or defer each one.

## Inputs

### open_assumptions

The open (non-code-resolvable) assumptions to present for review. In interview mode the activity's forEach loop binds the current one as `current_assumption`; in batch mode the whole list is presented together.

### updated_assumptions_log

The assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) carrying each assumption's reconciliation history and technical context, linked into the presentation for full detail (inherited from the [review-assumptions](./TECHNIQUE.md) group root).

## Output

### assumption_review_presentation

A side-effect output: the structured judgement-augmentation context presented to the user for the `assumption-decision` checkpoint. For each open assumption it contains the decision space (alternatives + trade-offs), non-resolvability rationale, technical context, the agent's current position, a reversibility flag, and a link to the assumptions log. Produces no new stored variable — the user's decision is captured by the checkpoint and written back by [record](./record.md).

## Protocol

### 1. Format Judgement Context

- For each open (non-code-resolvable) assumption, assemble structured context: (1) the decision space — what alternatives exist, (2) trade-off analysis for each alternative, (3) why the agent could not resolve it through code analysis, (4) relevant technical context discovered during reconciliation — code patterns found, constraints identified, related implementation details, (5) which alternative the agent's current assumption favors and why
- Present the decision space (alternatives and trade-offs) before stating which option the agent's current assumption favors. This ordering reduces anchoring bias — the user encounters the options before being anchored to the agent's interpretation
- Trade-off analysis should cover relevant dimensions from: implementation complexity, maintenance burden, consistency with existing patterns, risk of unintended side-effects, decision reversibility (how hard to change course later), alignment with stated requirements, and time/effort cost. Include only dimensions that meaningfully differentiate the alternatives for each specific assumption
- If reconciliation produced partial evidence (e.g. validated one aspect but not another), include that evidence so the user understands what is already known
- If no open assumptions remain after reconciliation, skip the judgement augmentation format and present a summary confirming all assumptions were resolved through code analysis
- Focus trade-offs on measurable differences between alternatives, not uniform property lists. If two options are equivalent on a dimension, omit that dimension — it adds noise without aiding the decision
- Flag decision reversibility: mark each assumption as easily-reversible (low-cost to change later) or path-committing (high-cost to reverse). This helps the user calibrate how much deliberation to invest
- Apply [gitnexus-operations](../gitnexus-operations/TECHNIQUE.md)::[reversibility-signal](../gitnexus-operations/reversibility-signal.md)(name: `{$symbol}`) to set the flag — high caller fan-out and broad process participation → path-committing; isolated symbols → easily-reversible.

### 2. Present For Review

- This technique supports two presentation modes depending on the consuming activity's structure. Batch mode: present all open assumptions together as a structured list, ordered by decision impact. Interview mode: present assumptions one at a time via the activity's forEach loop and per-assumption checkpoint. The activity's steps, loops, and checkpoints determine which mode applies — follow the activity structure.
- In both modes, each assumption should contain the decision space, trade-offs, non-resolvability rationale, technical context, the agent's current position, and a reversibility flag as assembled by format-judgement-context. Order by decision impact: assumptions whose resolution most affects the implementation approach come first.
- Include a clickable markdown link to the assumptions-log for full details and reconciliation history
- Frame the review as judgement augmentation: the user is making informed decisions on genuinely open questions, not performing triage or rubber-stamping. The agent has already resolved everything it can.
- Do not present code-resolved assumptions for re-confirmation — they are already validated with evidence in the assumptions log
- When presenting 5 or more open assumptions in batch mode, group related assumptions by theme or domain to reduce cognitive load. Present the group heading before its assumptions so the user can orient before diving into details.
