# Technique Interface-Contract Reference Audit

**Date:** 2026-06-05
**Scope:** all techniques across all workflows (206 files)
**Tool:** [`scripts/analyze-io-protocol-refs.ts`](../../../../scripts/analyze-io-protocol-refs.ts)

## Premise

A technique's declared `## Inputs`, `## Output`, and `## Errors` entries are an **interface
contract** — what the technique is expected to touch. The `## Protocol` is the procedure that
satisfies that contract. If a declared designator (its `###` id/name) is **never referenced by name
in the protocol body**, an agent executing the protocol has no explicit textual anchor tying the
procedure to that contract item — inference is weak or absent.

This audit flags every declared input/output/error designator that does not appear in its technique's
protocol body.

## Method

Deterministic, not inferred. For each technique file: extract the top-level `###` designators under
`## Inputs` / `## Output(s)` / `## Errors` (composite `####` members are sub-members, not designators,
and are excluded), and test each against the `## Protocol` body with a word-bounded,
hyphen/underscore-insensitive match. Substring-absence is the signal: a designator that is absent is
definitively unanchored (no false positives); a coincidental common-word match is treated as "anchored"
(conservative — we under-flag rather than over-flag).

## Findings

- **206** techniques scanned; **140** have ≥1 unreferenced designator.
- Unreferenced totals — **inputs: 139, outputs: 99, errors: 191**.
- **0** techniques declare I/O with no protocol (every gap is a genuine declared-but-unnamed case).

The pattern: techniques authored with generic, decoupled I/O contracts (correct per the AP-41
agnosticism rule) tend to describe their procedure abstractly ("dispatch scanners", "interpret
results") without naming the contract identifiers, leaving the interface↔procedure link implicit.
`cargo-operations::run-suite` is a counter-example that threads its output (`Compose validation_results
= …`) and is therefore not flagged.

### Category 1 — Errors (191): systemic, DEFERRED pending policy review

Error designators are almost never named in protocol bodies (`stale_index`, `compile_error`,
`no_targets`, …). This is a convention question, not 140 individual defects: error names are
diagnostic labels and protocols describe the failure *condition* without naming the label. **No error
threading is performed in this remediation** — it requires a separate policy decision (accept that
errors are not protocol-anchored, vs. adopt a convention such as a recovery step that names the error).

### Category 2 — Inputs (139) / Outputs (99): remediation target (113 techniques)

These are the actionable contract-procedure gaps: a declared input the procedure never consumes by
name, or a declared output it never produces by name. Remediation threads the designator into the
protocol prose **where intuitive**; where threading is genuinely redundant or unnatural, the case is
**deferred for review** rather than forced.

#### Matcher caveat

`substrate-node-security-audit/techniques/write-report.md` reports a spurious designator
`Issue {number}: {title}` — a `### Issue {number}: {title}` template line inside the
`#### finding_block_format` component body, mis-read as a top-level output. Its real output
`audit-report` is genuinely unreferenced; ignore the template artifact.

#### Full input/output gap list (the remediation work-list)

| Technique | Unreferenced inputs / outputs |
|-----------|-------------------------------|
| cicd-pipeline-security-audit/techniques/dispatch-scanners.md | inputs[scanner-assignments, reconnaissance-data] outputs[dispatch-status] |
| cicd-pipeline-security-audit/techniques/execute-cicd-audit.md | inputs[target-submodules, planning-folder] outputs[audit-report] |
| cicd-pipeline-security-audit/techniques/execute-sub-agent.md | outputs[sub-agent-output] |
| cicd-pipeline-security-audit/techniques/inventory-workflows.md | inputs[target-submodules] outputs[workflow-inventory] |
| cicd-pipeline-security-audit/techniques/merge-scan-findings.md | inputs[scanner-outputs] |
| cicd-pipeline-security-audit/techniques/scan-injection-patterns.md | inputs[workflow-files, reconnaissance-data, ai-config-inventory] outputs[scan-results] |
| cicd-pipeline-security-audit/techniques/score-cicd-severity.md | outputs[scored-findings] |
| cicd-pipeline-security-audit/techniques/verify-scan-output.md | inputs[scanner-outputs, workflow-inventory, output-schema] |
| cicd-pipeline-security-audit/techniques/write-cicd-report.md | inputs[scored-findings, coverage-data] outputs[audit-report] |
| meta/techniques/atlassian-operations/create-jira-issue.md | outputs[issueKey] |
| meta/techniques/atlassian-operations/user-info.md | outputs[accountId] |
| meta/techniques/gitnexus-operations/context.md | outputs[context_report] |
| meta/techniques/gitnexus-operations/cypher.md | outputs[rows] |
| meta/techniques/gitnexus-operations/detect-changes.md | outputs[change_report] |
| meta/techniques/gitnexus-operations/impact.md | outputs[impact_report] |
| meta/techniques/gitnexus-operations/query.md | outputs[query_report] |
| meta/techniques/gitnexus-operations/rename.md | inputs[repo_name, old_name, new_name] outputs[changes] |
| meta/techniques/gitnexus-operations/verify-index.md | outputs[stats] |
| meta/techniques/knowledge-base-search/load-domain-index.md | outputs[index] |
| meta/techniques/version-control/identify-path-type.md | outputs[kind] |
| meta/techniques/version-control/list-submodules.md | outputs[submodules] |
| meta/techniques/workflow-engine/commit-and-persist.md | inputs[planning_folder_path] |
| meta/techniques/workflow-engine/compose-prompt.md | inputs[template_ref, substitutions] outputs[prompt] |
| meta/techniques/workflow-engine/dispatch-activity.md | outputs[worker_result] |
| meta/techniques/workflow-engine/evaluate-transition.md | inputs[state] outputs[next_activity_id] |
| meta/techniques/workflow-engine/finalize-activity.md | inputs[steps_completed, checkpoints_responded, artifacts_produced] outputs[result] |
| meta/techniques/workflow-engine/generate-summary.md | inputs[trace] outputs[summary_markdown] |
| meta/techniques/workflow-engine/list-workflows.md | outputs[catalog] |
| meta/techniques/workflow-engine/match-saved-session.md | inputs[candidates] outputs[match] |
| meta/techniques/workflow-engine/match-target-workflow.md | outputs[target_workflow_id] |
| meta/techniques/workflow-engine/present-checkpoint-to-user.md | outputs[selection] |
| meta/techniques/workflow-engine/scan-saved-sessions.md | outputs[candidates] |
| meta/techniques/workflow-engine/verify-outcomes.md | outputs[gaps] |
| meta/techniques/workflow-engine/yield-checkpoint.md | outputs[emitted] |
| prism-audit/techniques/compose-audit-prompt.md | inputs[output_path] outputs[audit-prompt, audit-scopes] |
| prism-evaluate/techniques/compose-evaluation-report.md | inputs[output_path, completed_analyses, evaluation_description] |
| prism-evaluate/techniques/plan-evaluation.md | inputs[output_path] outputs[evaluation-plan] |
| prism-evaluate/techniques/resolve-findings.md | inputs[evaluation-report, target_path, output_path, evaluation_description] outputs[modified-target] |
| prism-update/techniques/diff-upstream.md | outputs[change-set] |
| prism-update/techniques/sync-resources.md | outputs[import-result] |
| prism-update/techniques/update-prism-docs.md | inputs[changes] outputs[docs-result] |
| prism-update/techniques/update-skill-routing.md | inputs[changes] outputs[routing-result] |
| prism-update/techniques/verify-prism-consistency.md | outputs[verification-report] |
| prism/techniques/adaptive-analysis.md | inputs[target-content, target-type] outputs[adaptive-result] |
| prism/techniques/behavioral-pipeline.md | outputs[behavioral-artifact] |
| prism/techniques/dispute-analysis.md | inputs[target-content, target-type] outputs[dispute-result] |
| prism/techniques/full-prism.md | inputs[target-content, target-type] outputs[pass-artifact] |
| prism/techniques/orchestrate-prism.md | outputs[prism-result] |
| prism/techniques/plan-analysis.md | inputs[analytical-goal] |
| prism/techniques/portfolio-analysis.md | outputs[per-lens-artifacts] |
| prism/techniques/reflect-analysis.md | inputs[target-content, target-type] outputs[reflect-result] |
| prism/techniques/smart-analysis.md | inputs[target-content, target-type, output-path] outputs[smart-result] |
| prism/techniques/subsystem-analysis.md | inputs[target-content, target-type] outputs[subsystem-result] |
| prism/techniques/verified-analysis.md | inputs[target-type] outputs[verified-result] |
| substrate-node-security-audit/techniques/apply-checklist.md | inputs[checklist-source, item-set, scope-files] outputs[verdict-matrix] |
| substrate-node-security-audit/techniques/build-function-registry.md | inputs[source-files, include-subdirectories] outputs[function-registry] |
| substrate-node-security-audit/techniques/compare-finding-sets.md | inputs[primary-findings, reference-findings] outputs[comparison-report] |
| substrate-node-security-audit/techniques/decompose-safety-claims.md | inputs[pass-items, source-files] outputs[decomposition-results] |
| substrate-node-security-audit/techniques/dispatch-sub-agents.md | outputs[dispatch-results] |
| substrate-node-security-audit/techniques/execute-sub-agent.md | outputs[sub-agent-output] |
| substrate-node-security-audit/techniques/extract-invariants.md | inputs[function-registry, source-files] outputs[invariant-table] |
| substrate-node-security-audit/techniques/map-codebase.md | inputs[workspace-root, in-scope, out-of-scope] outputs[codebase-map] |
| substrate-node-security-audit/techniques/map-vulnerability-domains.md | inputs[interaction-model, privilege-map, candidate-points, emergent-domains, crate-map, target-profile] outputs[domain-map] |
| substrate-node-security-audit/techniques/merge-findings.md | inputs[finding-sources, existing-table, merge-strategy] outputs[merge-table] |
| substrate-node-security-audit/techniques/scan-storage-lifecycle.md | outputs[storage-lifecycle] |
| substrate-node-security-audit/techniques/search-pattern-catalog.md | inputs[resource-id, catalog-section, exclusions] outputs[pattern-results] |
| substrate-node-security-audit/techniques/setup-audit-target.md | inputs[user-request, workspace-root] outputs[audit-target] |
| substrate-node-security-audit/techniques/verify-sub-agent-output.md | inputs[agent-results, expected-outputs, file-inventory] outputs[verification-report] |
| substrate-node-security-audit/techniques/write-gap-analysis.md | outputs[gap-analysis] |
| substrate-node-security-audit/techniques/write-report.md | outputs[audit-report] (ignore template artifact `Issue {number}: {title}`) |
| work-package/techniques/analyze-implementation.md | inputs[target-submodule] |
| work-package/techniques/build-comprehension.md | inputs[target-path, project-type] outputs[comprehension-artifact] |
| work-package/techniques/cargo-operations/check.md | outputs[check_status] |
| work-package/techniques/cargo-operations/clippy.md | outputs[clippy_status, lint_diagnostics] |
| work-package/techniques/cargo-operations/fmt-check.md | outputs[fmt_status, fmt_diff_summary] |
| work-package/techniques/cargo-operations/run-suite.md | inputs[features] |
| work-package/techniques/cargo-operations/test.md | outputs[test_status, failures] |
| work-package/techniques/conduct-retrospective.md | inputs[planning-folder-path, pr-number] |
| work-package/techniques/create-adr.md | inputs[complexity, design-philosophy-doc, planning-folder-path] outputs[adr-document] |
| work-package/techniques/create-issue.md | inputs[target-submodule] outputs[created-issue] |
| work-package/techniques/create-test-plan.md | inputs[plan-tasks] |
| work-package/techniques/elicit-requirements.md | inputs[stakeholder-transcript, issue-number] |
| work-package/techniques/finalize-documentation.md | inputs[planning-folder-path, pr-number] |
| work-package/techniques/gitnexus-operations/complexity-signal.md | outputs[complexity_signal] |
| work-package/techniques/gitnexus-operations/diagram-source-select.md | inputs[diagram_type] outputs[diagram_source] |
| work-package/techniques/gitnexus-operations/orphan-scan.md | outputs[orphan_candidates] |
| work-package/techniques/gitnexus-operations/public-api-enum.md | outputs[public_api_symbols] |
| work-package/techniques/gitnexus-operations/reversibility-signal.md | inputs[name] outputs[reversibility] |
| work-package/techniques/gitnexus-operations/scope-discipline-check.md | outputs[scope_findings] |
| work-package/techniques/implement-task.md | inputs[current-task, test-plan] outputs[task-implementation] |
| work-package/techniques/manage-artifacts/create-readme.md | outputs[readme_path] |
| work-package/techniques/manage-artifacts/write-artifact.md | inputs[content] outputs[artifact_path] |
| work-package/techniques/manage-git/create-pr.md | inputs[branch_name, issue_platform] outputs[pr_number, pr_url] |
| work-package/techniques/manage-git/sync-branch.md | inputs[branch_name] |
| work-package/techniques/reconcile-assumptions.md | inputs[target-path, comprehension-artifact] outputs[reconciled-assumptions] |
| work-package/techniques/respond-to-pr-review.md | inputs[pr-number, review-comments] outputs[review-analysis] |
| work-package/techniques/review-assumptions.md | inputs[activity-context, existing-assumptions-log] outputs[updated-assumptions-log] |
| work-package/techniques/review-code.md | inputs[changed-files, project-type] |
| work-package/techniques/review-diff.md | inputs[branch-name, planning-folder-path] |
| work-package/techniques/review-strategy.md | inputs[branch-name, planning-folder-path] |
| work-package/techniques/review-test-suite.md | inputs[changed-files] |
| work-package/techniques/summarize-architecture.md | inputs[changed-files, planning-folder-path, design-philosophy-doc] |
| work-package/techniques/update-pr.md | inputs[pr-number, branch-name, planning-folder-path] outputs[updated-pr] |
| work-package/techniques/validate-build/aggregate-results.md | outputs[validation_results] |
| work-package/techniques/validate-build/analyze-failure.md | inputs[check_id, target_path] outputs[root_cause] |
| work-package/techniques/validate-build/apply-fix.md | inputs[check_id] |
| work-packages/techniques/assess-initiative-scope.md | inputs[user-initiative-description] outputs[scope-summary] |
| work-packages/techniques/document-roadmap.md | inputs[planning-folder, priority-order, package-plans] |
| work-packages/techniques/orchestrate-package-execution.md | outputs[implementation-status] |
| work-packages/techniques/plan-work-package-scope.md | inputs[current-package] |
| work-packages/techniques/prioritize-packages.md | inputs[package-plans, dependency-map] outputs[priority-order] |
| workflow-design/techniques/toon-authoring.md | inputs[schema-type, reference-file] outputs[toon-file] |
| workflow-design/techniques/workflow-design.md | inputs[user-description, target-workflow-id] outputs[workflow-file-set] |

## Remediation plan

1. **Thread input/output designators** into the protocol prose of each technique above, where
   intuitive — name the input where the procedure consumes it, name the output where the procedure
   produces it. Re-run the analysis to confirm the gap closes.
2. **Defer non-intuitive / genuinely-redundant cases** — where naming the designator would be
   awkward or add no clarity, leave the protocol and record the technique+designator here for a
   later review pass (do not force a reference).
3. **Errors: deferred entirely** pending the convention decision above.

## Remediation outcome (2026-06-05)

Threading pass complete (113 techniques): **234 input/output designators threaded** into protocol
bodies; **3 deferred** as genuinely redundant; the 1 remaining "gap" is the matcher artifact noted
above (not a real designator). Re-running the analyzer confirms no other input/output gaps remain.

### Deferred input/output cases — for later review

These were intentionally NOT threaded because naming the designator in a step would add no
procedural meaning (the value is ambient context or a precondition gate, never consumed/branched on
by a step). Revisit if the contract or procedure changes:

| Technique | Designator | Reason deferred |
|-----------|------------|-----------------|
| prism-evaluate/techniques/resolve-findings.md | `evaluation_description` (input) | Context-only; the procedure operates on `evaluation-report` and the target doc — naming this ambient context in a step adds nothing. |
| prism/techniques/full-prism.md | `target-type` (input) | No step branches on the code/general distinction; the pipeline is keyed on the lens resource index. |
| work-package/techniques/create-adr.md | `complexity` (input) | A precondition gate (whether the technique runs), already expressed by the complexity-gate rule and Capability; no step branches on it. |

### Errors — still deferred (policy)

The 191 unreferenced error designators are untouched, pending the convention decision (accept that
error names are diagnostic labels not anchored in protocol, vs. require a recovery step that names
the error).
