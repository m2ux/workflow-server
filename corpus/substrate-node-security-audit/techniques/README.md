# Security Audit Techniques

> Part of the [Security Audit Workflow](../README.md)

The technique library for the substrate-node-security-audit workflow. Each operation is one capability an activity step binds via `step.technique`; the authoritative protocol, inputs, outputs, and rules live in each operation's `.md` file and are served by `get_technique`. This file orients — it does not restate protocols.

[`TECHNIQUE.md`](TECHNIQUE.md) holds shared Inputs for every technique here — notably `planning_folder_path`.

---

## Orchestrator Techniques

| Technique | Kind | Capability |
|-----------|------|------------|
| [`dispatch-sub-agents`](dispatch-sub-agents/TECHNIQUE.md) | group | Assign the roster, route leads, compose domain briefs, project gathered results, verify output files — concurrent dispatch/gather bind meta `orchestration-patterns` |
| [`score-severity`](score-severity.md) | standalone | Impact × Feasibility severity scoring with the calibration benchmark crosscheck |
| [`verify-sub-agent-output`](verify-sub-agent-output.md) | standalone | Validate structural completeness, file coverage, and mandatory output tables |
| [`merge-findings`](merge-findings.md) | standalone | Concatenate finding lists, deduplicate by root cause, assign finding numbers, reconcile counts |
| [`write-report`](write-report.md) | standalone | Structure and format the final audit report |
| [`write-gap-analysis`](write-gap-analysis.md) | standalone | Structure and format the gap-analysis report |
| [`map-vulnerability-domains`](map-vulnerability-domains.md) | standalone | Bind the architectural analysis to §3 verification procedures, partitioned by crate |
| [`execute-ensemble-pass`](execute-ensemble-pass.md) | standalone | Scope and run a second-model audit pass with blind-spot verification |

### dispatch-sub-agents operations

| Operation | Capability |
|-----------|------------|
| [`assign-roster`](dispatch-sub-agents/assign-roster.md) | Assign each in-scope crate to a sub-agent group and identify its supplementary files |
| [`route-leads`](dispatch-sub-agents/route-leads.md) | Route every reconnaissance lead to a specific agent designator |
| [`compose-roster-briefs`](dispatch-sub-agents/compose-roster-briefs.md) | Compose each agent's bootstrap prompt into `{worker_briefs}` (dispatch is a separate meta step) |
| [`collect-results`](dispatch-sub-agents/collect-results.md) | Project meta `gathered_results` into the audit `{dispatch_results}` shape |
| [`verify-output-files`](dispatch-sub-agents/verify-output-files.md) | Confirm every expected output file persisted, re-dispatching for any missing file |

---

## Analysis Techniques

| Technique | Capability |
|-----------|------------|
| [`apply-checklist`](apply-checklist.md) | Iterate items against checklist entries, produce a verdict matrix with the §3 PASS/FAIL decision criteria |
| [`build-function-registry`](build-function-registry.md) | Enumerate functions by type and priority |
| [`extract-invariants`](extract-invariants.md) | Enumerate pre/post conditions and cross-function invariants |
| [`scan-storage-lifecycle`](scan-storage-lifecycle.md) | Find storage map insert/remove sites, verify pairing |
| [`decompose-safety-claims`](decompose-safety-claims.md) | Decompose PASS verdicts into independently verifiable properties |
| [`map-codebase`](map-codebase.md) | Build a structured architectural map from the component inventory |
| [`analyze-architecture`](analyze-architecture.md) | Security-oriented architectural decomposition: interaction model, privilege map, candidate points, emergent domains |
| [`setup-audit-target`](setup-audit-target.md) | Validate the target codebase, run dependency scanning, build the file inventory |
| [`search-pattern-catalog`](search-pattern-catalog.md) | Execute catalog patterns against a codebase scope, triage results |

---

## Sub-Agent Techniques

| Technique | Capability |
|-----------|------------|
| [`execute-sub-agent`](execute-sub-agent.md) | Bootstrap workflow-server, load the assigned activity, follow its steps, return structured output |

---

## Cross-Workflow Techniques

| Reference | Used for |
|-----------|----------|
| [`variable-binding`](../../meta/techniques/variable-binding.md) | Declared once at the workflow level (`techniques.activity`) and inherited by every activity — binds each step's operation to the workflow-scoped variable bag |
| [`orchestration-patterns::dispatch-workers`](../../meta/techniques/orchestration-patterns/dispatch-workers.md) / [`gather-results`](../../meta/techniques/orchestration-patterns/gather-results.md) | Bound from reconnaissance / primary-audit after domain brief composition |
| [`harness-compat::spawn-agent`](../../meta/techniques/harness-compat/spawn-agent.md) / [`spawn-concurrent`](../../meta/techniques/harness-compat/spawn-concurrent.md) | Invoked inside meta `orchestration-patterns::dispatch-workers` |

For the full technique-to-activity picture with capability summaries, see the [workflow README](../README.md#techniques).
