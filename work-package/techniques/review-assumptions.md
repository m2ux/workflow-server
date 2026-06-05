---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.0.0
  order: 13
  legacy_id: 13
---

## Capability

Collect, classify, and review assumptions made during workflow activities

## Inputs

### activity-context

Which activity is generating assumptions

### existing-assumptions-log

*(optional)* The existing assumptions [log](../resources/assumptions-review.md#assumptions-log-template), if one exists

## Protocol

### 1. Collect Assumptions

- Identify all implicit decisions and assumptions made
- Classify by category appropriate to the activity-context generating them

### 2. Write Assumptions

- Append collected assumptions to the existing-assumptions-log (or start a fresh log if none exists), recording type, statement, rationale, and alternatives for each
- The file is the record of truth — do not duplicate assumption content in checkpoint messages
- Each bold-label line (Status, Resolvability, Assumption, Evidence, Risk, etc.) MUST end with two trailing spaces to produce a line break in rendered markdown. Without trailing spaces, consecutive bold lines collapse into a single paragraph. Do NOT use bullet prefixes for this — use trailing spaces only. See [assumption-reconciliation](../resources/assumption-reconciliation.md) for correct vs incorrect examples.

### 3. Format Judgement Context

- For each open (non-code-resolvable) assumption, assemble structured context: (1) the decision space — what alternatives exist, (2) trade-off analysis for each alternative, (3) why the agent could not resolve it through code analysis, (4) relevant technical context discovered during reconciliation — code patterns found, constraints identified, related implementation details, (5) which alternative the agent's current assumption favors and why
- Present the decision space (alternatives and trade-offs) before stating which option the agent's current assumption favors. This ordering reduces anchoring bias — the user encounters the options before being anchored to the agent's interpretation
- Trade-off analysis should cover relevant dimensions from: implementation complexity, maintenance burden, consistency with existing patterns, risk of unintended side-effects, decision reversibility (how hard to change course later), alignment with stated requirements, and time/effort cost. Include only dimensions that meaningfully differentiate the alternatives for each specific assumption
- If reconciliation produced partial evidence (e.g. validated one aspect but not another), include that evidence so the user understands what is already known
- If no open assumptions remain after reconciliation, skip the judgement augmentation format and present a summary confirming all assumptions were resolved through code analysis
- Focus trade-offs on measurable differences between alternatives, not uniform property lists. If two options are equivalent on a dimension, omit that dimension — it adds noise without aiding the decision
- Flag decision reversibility: mark each assumption as easily-reversible (low-cost to change later) or path-committing (high-cost to reverse). This helps the user calibrate how much deliberation to invest
- Apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[reversibility-signal](./gitnexus-operations/reversibility-signal.md) `{name: <symbol>}` to set the flag — high caller fan-out and broad process participation → path-committing; isolated symbols → easily-reversible.

### 4. Present For Review

- This technique supports two presentation modes depending on the consuming activity's structure. Batch mode: present all open assumptions together as a structured list, ordered by decision impact. Interview mode: present assumptions one at a time via the activity's forEach loop and per-assumption checkpoint. The activity's steps, loops, and checkpoints determine which mode applies — follow the activity structure.
- In both modes, each assumption should contain the decision space, trade-offs, non-resolvability rationale, technical context, the agent's current position, and a reversibility flag as assembled by format-judgement-context. Order by decision impact: assumptions whose resolution most affects the implementation approach come first.
- Include a clickable markdown link to the assumptions-log for full details and reconciliation history
- Frame the review as judgement augmentation: the user is making informed decisions on genuinely open questions, not performing triage or rubber-stamping. The agent has already resolved everything it can.
- Do not present code-resolved assumptions for re-confirmation — they are already validated with evidence in the assumptions log
- When presenting 5 or more open assumptions in batch mode, group related assumptions by theme or domain to reduce cognitive load. Present the group heading before its assumptions so the user can orient before diving into details.

### 5. Record Outcomes

- Mark each as confirmed, corrected, or needs-discussion
- Write outcomes and user responses back into the log, producing the updated-assumptions-log
- Preserve all assumptions and their resolution status

## Outputs

### updated-assumptions-log

Assumptions [log](../resources/assumptions-review.md#assumptions-log-template) updated with review outcomes — grows across activities

#### artifact

`assumptions-log.md`

#### assumptions

All assumptions with type, statement, rationale, alternatives

#### outcomes

Per-assumption resolution: confirmed, corrected, or needs-discussion

## Rules

### elevate-implicit

Make implicit decisions explicit — assumptions should be elevated for validation

### categorize-per-activity

Use categories appropriate to the current activity phase

## Errors

### no_assumptions

**Cause:** No significant assumptions identified

**Recovery:** Explicitly confirm with user that no assumptions were made
