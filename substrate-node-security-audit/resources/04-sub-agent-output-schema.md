# Sub-Agent Structured Output Schema

## Overview

All sub-agents dispatched during the primary-audit phase must return their results in this structured format. The orchestrator uses this schema to mechanically validate completeness, perform the structured merge, and verify elevation.

## Schema

```json
{
  "agent_id": "<string: unique identifier, e.g. 'group-a-nto', 'group-b', 'group-d'>",
  "activity_followed": "<string: activity ID executed, e.g. 'sub-crate-review'>",
  "steps_completed": ["<string: step IDs in order of completion>"],
  "steps_skipped": [
    {
      "step_id": "<string>",
      "reason": "<string: why the step was skipped>"
    }
  ],
  "findings": [
    {
      "id": "<string: agent-local finding ID, e.g. 'F-1'>",
      "file": "<string: relative file path>",
      "line": "<number: line number>",
      "title": "<string: concise finding title>",
      "severity": "<string: Critical|High|Medium|Low|Informational>",
      "impact": "<number: 1-4>",
      "impact_reason": "<string: one-sentence justification>",
      "feasibility": "<number: 1-4>",
      "feasibility_reason": "<string: one-sentence justification>",
      "checklist_item": "<string: §3.X reference, e.g. '§3.2'>",
      "evidence": "<string: code citation or grep result>",
      "aggregated_from": ["<string: source hit IDs if this is an aggregated finding>"]
    }
  ],
  "checklist_coverage": {
    "§3.1": "<string: PASS/FAIL/NA with evidence>",
    "§3.2": "<string: PASS/FAIL/NA with evidence>",
    "§3.3": "<string: PASS/FAIL/NA with evidence or 'N/A — this crate has no event emission'>",
    "...": "..."
  },
  "mandatory_tables": {
    "per_field_trace": "<object|null: per-field event trace table from §3.3, or null with justification>",
    "struct_diff": "<object|null: event vs storage field diff table from §3.3>",
    "cross_layer_matrix": "<object|null: three-layer verification matrix from §3.2/§3.10>",
    "cross_function_invariants": "<object|null: StorageMap insert/remove pairing from step 6>",
    "storage_lifecycle_pairing": "<object|null: Group B only — insert/remove pairing table>",
    "zero_hit_patterns": "<object|null: Group B only — patterns with zero results>",
    "function_checklist_matrix": "<object|null: Group D only — function x checklist item matrix>",
    "coverage_attestation": "<object|null: Group D only — function coverage percentage>"
  },
  "reconnaissance_leads": [
    {
      "observation": "<string: what was observed>",
      "location": "<string: file:line>",
      "potential_severity": "<string: estimated severity if promoted>",
      "reason_not_finding": "<string: why this is a lead rather than a finding>"
    }
  ]
}
```

## Field Requirements by Agent Group

| Field | Group A (crate-review) | Group B (static-analysis) | Group D (toolkit-review) |
|-------|----------------------|--------------------------|--------------------------|
| `checklist_coverage` | Required — one entry per §3 item | Not applicable | Not applicable |
| `per_field_trace` | Required if crate has events with partial success | N/A | N/A |
| `struct_diff` | Required if crate has events + storage | N/A | N/A |
| `cross_layer_matrix` | Required if crate has pagination or cross-chain timestamps | N/A | N/A |
| `cross_function_invariants` | Required if crate has StorageMaps | N/A | N/A |
| `storage_lifecycle_pairing` | N/A | Required | N/A |
| `zero_hit_patterns` | N/A | Required | N/A |
| `function_checklist_matrix` | N/A | N/A | Required |
| `coverage_attestation` | N/A | N/A | Required |
| `reconnaissance_leads` | Optional | Optional | Optional |

## Orchestrator Validation Rules

The orchestrator validates each sub-agent's output before accepting it into the structured merge table:

1. **steps_completed** must match the activity definition's step IDs (no omissions)
2. **steps_skipped** must be empty or have explicit justifications
3. Every **FAIL** in `checklist_coverage` must have a corresponding entry in `findings`
4. Every entry in `mandatory_tables` must be populated or null with a justification string
5. Every **finding** must have all required fields (id, file, line, title, severity, impact, feasibility, checklist_item, evidence)
6. `reconnaissance_leads` entries without a corresponding finding are auto-promoted for orchestrator review

If validation fails, the orchestrator may re-dispatch the sub-agent with the specific validation error.
