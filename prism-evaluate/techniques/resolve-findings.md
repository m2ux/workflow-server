---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Propose and apply finding-specific mitigations through structured one-by-one dialogue with the user

## Inputs

### evaluation-report

The consolidated [evaluation report](../resources/evaluation-report-template.md#evaluation-report-template) containing findings with IDs, severities, titles, descriptions, and referenced target sections

### target-path

Path to the original document, proposal, or artifact set that was evaluated

## Protocol

### 1. Load And Classify

- Read the {evaluation-report} and extract all findings with IDs, severities, titles, descriptions, and referenced target sections
- Read the target document at {target-path} and identify the specific text, sections, and claims referenced by each finding
  - If a finding references target text that cannot be located in the current target, report the finding as unlocatable and present it to the user with a note that the referenced text could not be found — the target may have been modified since the evaluation
- Classify each finding into a mitigation tier: T1 (direct correction — wrong numbers, terminology), T2 (reframing — claims needing qualification), T3 (novel mitigation — new mechanisms or content needed), T4 (structural/immovable — external constraints requiring acknowledgement)
- Order findings within each tier by severity (Critical first, then High, Medium, Low)
- Present the tier classification summary before beginning the dialogue

### 2. Propose Mitigation By Tier

- T1 (Direct Correction): Identify the incorrect text, provide the corrected replacement, and cite the source for the correction. These are simple text swaps.
- T2 (Reframing & Caveating): Identify the claim, explain why it needs qualification, and propose replacement text that preserves the claim's intent while adding honest scoping. Show the before/after in context.
- T3 (Novel Mitigation): Read the finding's critique deeply. Propose a novel mechanism, architectural addition, or content section that addresses the critique without requiring the claim to be struck. Explain how the proposed solution works, what it adds to the target, and why it resolves the finding. Show the proposed new text in full.
- T4 (Structural/Immovable): Explain why no mitigation can resolve this finding within the target itself. Propose acknowledgement language that honestly states the constraint and how the target relates to it.
- Findings where no mitigation can address the critique without removing the claim entirely are flagged as non-feasible with an explicit explanation.

### 3. Dialogue Protocol

- Present one finding at a time — never batch findings even within the same tier
- For each finding, present: (1) finding ID and severity, (2) the claim from the target with its location, (3) the evaluation's critique, (4) the proposed mitigation with replacement or new text
- Collect the user's decision: accept, modify, skip, or discuss
- If the user selects 'discuss', engage in clarifying dialogue. Incorporate the user's context into a revised proposal. Re-present and re-collect.
- If the user selects 'modify', record the user's modification as the accepted version
- Each finding is presented individually. The dialogue is sequential — present, propose, collect decision, advance. Never combine multiple findings.
- When the user provides context during discussion that changes the mitigation approach, incorporate that context. The user's domain knowledge takes precedence over generic mitigation strategies.

### 4. Compile Plan

- After all findings are presented, compile the {mitigation-plan} and write it to {output-path}
- Structure: Summary table (ID, severity, tier, user decision), detailed changes grouped by tier, implementation priority order
- Include the full proposed text for each accepted mitigation so the plan is self-contained
- Verify every finding from the report has a corresponding entry (accepted, modified, or skipped)

### 5. Apply Changes

- Apply accepted mitigations in priority order: T1 first, then T2, T3, T4
- For each change, verify the target text matches expectations before applying
  - If an earlier mitigation shifted text locations and a later mitigation no longer matches, search for the expected text elsewhere in the modified target; if found at a different location, apply there, and if not found, report the conflict and skip
- After all changes, verify each was applied correctly, producing the {modified-target} with all accepted mitigations in place

## Outputs

### mitigation-plan

Comprehensive [mitigation plan](../resources/mitigation-plan-template.md#mitigation-plan-template) with all finding dispositions

#### artifact

`MITIGATION-PLAN.md`

#### summary-table

Finding ID, severity, tier, decision for every finding

#### detailed-mitigations

Full change specifications grouped by tier

#### implementation-priority

Ordered list of changes for application

### modified-target

The target document with accepted mitigations applied

## Rules

### preserve-intent

Mitigations should preserve the author's intent and the claim's value. Propose novel solutions that address critiques while keeping claims, rather than striking claims.

### tier-ordering

Present findings in tier order (T1 → T2 → T3 → T4) and within each tier by severity (Critical → High → Medium → Low). This ensures the easiest changes are handled first.
