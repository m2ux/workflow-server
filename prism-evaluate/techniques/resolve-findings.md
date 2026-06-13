---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 2
  legacy_id: 2
---

## Capability

Classify each evaluation finding by mitigation difficulty, propose a finding-specific mitigation through structured one-by-one dialogue, compile the dispositions into a mitigation plan, and apply the accepted changes to the target.

## Inputs

### evaluation_report

The consolidated [evaluation report](../resources/evaluation-report-template.md#evaluation-report-template) containing findings with IDs, severities, titles, descriptions, and referenced target sections.

### current_finding

The single finding under consideration, carrying its ID, severity, claim, critique, and tier.

## Outputs

### evaluation_findings

The findings extracted and tier-classified from `{evaluation_report}`, ordered for one-by-one presentation.

### accepted_mitigations

The collected per-finding decisions, each `{ finding_id, finding_severity, mitigation_type, mitigation_summary, user_decision }`.

### mitigation_plan

Comprehensive [mitigation plan](../resources/mitigation-plan-template.md#mitigation-plan-template) with every finding's disposition.

#### artifact

`MITIGATION-PLAN.md`

#### summary_table

Finding ID, severity, tier, and decision for every finding.

#### detailed_mitigations

Full change specifications grouped by tier.

#### implementation_priority

Ordered list of changes for application.

### modified_target

The target document with the accepted mitigations applied.

## Protocol

### 1. Load And Classify

- Read `{evaluation_report}` and extract `{evaluation_findings}` with IDs, severities, titles, descriptions, and referenced target sections.
- Read the target document at `{target_path}` and identify the specific text, sections, and claims each finding references.  
  > When a finding references target text that cannot be located in the current target, report it as unlocatable with a note that the referenced text could not be found — the target may have changed since the evaluation.
- Classify each finding into a mitigation tier: `T1` (direct correction — wrong numbers or terminology), `T2` (reframing — claims needing qualification), `T3` (novel mitigation — new mechanisms or content), `T4` (structural / immovable — external constraints requiring acknowledgement).
- Order findings within each tier by severity (Critical, then High, Medium, Low) and present the tier-classification summary.

### 2. Propose Mitigation By Tier

- `T1` (Direct Correction): identify the incorrect text, provide the corrected replacement, and cite the source for the correction.
- `T2` (Reframing & Caveating): identify the claim, explain why it needs qualification, and propose replacement text that preserves the claim's intent with honest scoping, shown before/after in context.
- `T3` (Novel Mitigation): read the finding's critique deeply, then propose a novel mechanism, architectural addition, or content section that addresses the critique without striking the claim — explaining how it works, what it adds, and why it resolves the finding, with the full proposed text.
- `T4` (Structural / Immovable): explain why no mitigation can resolve the finding within the target and propose acknowledgement language stating the constraint and how the target relates to it.

### 3. Present And Collect Per Finding

- Present `{current_finding}`: its ID and severity, the claim from the target with its location, the evaluation's critique, and the proposed mitigation with its replacement or new text.
- Collect the user's decision — accept, modify, skip, or discuss — and record it in `{accepted_mitigations}`.  
  > On `discuss`, engage in clarifying dialogue, incorporate the user's context into a revised proposal, then re-present and re-collect.  
  > On `modify`, record the user's modification as the accepted version.

### 4. Compile Plan

- Compile `{mitigation_plan}` into `{output_path}` using the [mitigation plan template](../resources/mitigation-plan-template.md#mitigation-plan-template): a `{mitigation_plan.summary_table}` (ID, severity, tier, decision), `{mitigation_plan.detailed_mitigations}` grouped by tier with the full proposed text for each accepted mitigation, and a `{mitigation_plan.implementation_priority}` order.
- Verify every finding in `{evaluation_report}` has a corresponding entry in `{mitigation_plan}` (accepted, modified, or skipped).

### 5. Apply Changes

- Apply the accepted mitigations in `{mitigation_plan.implementation_priority}` order (`T1`, then `T2`, `T3`, `T4`), producing `{modified_target}`.
- Before applying each change, verify the target text matches the expected current text.  
  > When an earlier mitigation shifted text locations and a later change no longer matches, search for the expected text elsewhere in `{modified_target}`; apply it at the new location if found, otherwise report the conflict and skip.
- After each change, verify the new text is present at the expected location; report any change that fails verification and continue with the remaining changes.

## Rules

### one-finding-at-a-time

Each finding is presented individually — findings are never batched, even within one tier. The dialogue is sequential: present the finding, propose a mitigation, collect a decision, then move to the next finding.

### novel-solutions-over-deletion

For `T3` findings, the default is to propose a novel mechanism that preserves the original claim while addressing the critique; striking a claim is a last resort, reserved for `T4` findings that are absolutely non-feasible.

### preserve-claim-intent

When proposing reframing (`T2`) or a novel mitigation (`T3`), the proposed change preserves the author's intent and the claim's value while addressing the specific criticism.

### non-feasible-flagged-explicitly

A finding whose claim no mitigation can address without removing it is flagged explicitly as non-feasible with acknowledgement language, never silently struck.

### user-context-takes-precedence

Context the user provides during a `discuss` decision is incorporated into a revised proposal — the user's domain knowledge takes precedence over generic mitigation strategies.

### tier-ordering

Findings are presented and applied in tier order (`T1` → `T2` → `T3` → `T4`) and within each tier by severity (Critical → High → Medium → Low).

### only-accepted-changes-applied

Only mitigations the user accepted or modified are applied to the target; a skipped finding is never applied.
