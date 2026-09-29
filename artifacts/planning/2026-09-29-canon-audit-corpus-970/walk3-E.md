# Walk E (third pass, residuals branch): anti-patterns overview, entry identity, Tool-Technique-Doc Consistency, Execution, Output Economy

Canon home: `corpus/canon/resources/anti-patterns.md` on the residuals worktree (`workflow/canon-audit-residuals`, base `166718d6`). Tool authority: `src/tools/workflow-tools.ts` on schema-description-hygiene (`next_activity` 1223-1694, including destination binding 1282-1285, terminal handling 1540-1555, `_meta.fan` 1645; `get_activity` batch block 2347/2408; checkpoint tools 2413-2935; `get_workflow_status` 3004-3063), plus `src/tools/resource-tools.ts` (`get_technique` 796-800), `src/resources/schema-resources.ts` and `src/loaders/schema-loader.ts:16` where a claim is settled there. Surface: the 88 paths in res-surface.txt.

## Units

- Overview — walked
- Entry identity — walked
- AP-71. no-false-resource-delivery — walked
- AP-72. complete-bootstrap-path — walked
- AP-73. consistent-tool-names — walked (every tool name on the surface exists on the harness: discover, list_workflows, start_session, get_workflow, next_activity, get_activity, get_technique, get_resource, yield_checkpoint, resume_checkpoint, present_checkpoint, respond_checkpoint, record_usage, get_trace, get_workflow_status, inspect_session, health_check, dispatch_child)
- AP-74. no-duplicated-guidance — walked
- AP-75. describe-tool-value — walked
- AP-76. no-redundant-tools — walked
- AP-77. impl-before-confirmed-approach — not-applicable — "Authoring-session smells"; Detect: "File/workflow modifications begin before the user has confirmed the proposed approach". The surface is definition files, with no session record to test.
- AP-78. follow-through-on-recommend — not-applicable — "Authoring-session smells"; Detect: "The agent emits recommendations/analysis as the deliverable and stops". No session output is on the surface.
- AP-79. structure-backed-constraints — walked
- AP-80. preserve-readme-content — walked (the README reductions — work-package activities −320, fan-conformance −88, meta resources "Removed" table — are listed in the body of bcf31337; what they drop is step, checkpoint and loop transcription whose home is the YAML)
- AP-81. verify-format-literacy — walked (56 of 56 guards pass on the head)
- AP-82. work-through-activities — walked
- AP-83. accept-correction — not-applicable — "Authoring-session smells"; Detect: "The agent disputes a user correction". No session exchange is on the surface.
- AP-84. single-closeout-artifact — walked
- AP-85. link-dont-copy-sections — walked
- AP-86. exception-only-verdict-tables — walked
- AP-87. omit-null-sections — walked
- AP-88. one-decision-one-checkpoint — walked
- AP-89. checkpoint-requires-decision — walked
- AP-90. no-guide-wrapper-ceremony — walked
- AP-91. lifecycle-row-update — walked
- AP-92. resource-fills-not-does — walked
- AP-93. canonical-fact-home — walked
- AP-94. link-only-input-slots — walked
- AP-95. enforce-output-discipline — walked
- AP-96. artifact-audience-declared — walked
- AP-97. link-named-artifacts — walked
- AP-98. no-next-step-narration — walked
- AP-99. statement-not-question — walked
- AP-100. runtime-rules-only — walked
- AP-101. no-caption-only-message — walked
- AP-102. no-technique-resource-dual-home — walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| E1 | Live | High | AP-71 `no-false-resource-delivery` | `meta/techniques/workflow-engine/finalize-activity.md:64` `#### next_activity_id`; `take-activity.md:58` rule `no-session-left-running`; consumers `meta/routines/activity-loop.yaml:58-62` (`continueWhile current_activity != null`), `:202-207`, `meta/activities/03-dispatch-client-workflow.yaml:35-43` | finalize says `next_activity_id` is "null when the workflow is complete". The engine completes a session only when `next_activity` enters `complete` or `__terminal__` (`workflow-tools.ts:1540-1543`). A terminal exit arrives in `exit_destinations` as `__terminal__` (`:1702`), and evaluate-transition copies that through unread (`evaluate-transition.md:28,54`). Null comes only from an exitless activity (`evaluate-transition.md:58`), and after one no `next_activity` is issued, so the session stays `active` (`:3020`). On a `__terminal__` graph (meta, work-package, workflow-authoring) the loop does not stop. It advances onto `__terminal__`, which completes the session, then composes a stub for `__terminal__`, and that worker's `get_activity` is refused with "No activity in flight" (`:1725`). On an exitless-terminal graph (prism `deliver-result`, workflow-design `retrospective`, codebase-wiki `publish`) the loop stops, but `get_workflow_status` never reports `completed`, which take-activity says it waits for. | pre-existing (this branch edited the line and kept the parenthetical; the loop condition is unchanged) | Align the claim with the tool: `next_activity_id` is `__terminal__` where the run ends, and null only off an exitless activity. End the walk on the advance that enters `__terminal__`, and state what an exitless terminal leaves on the session. |
| E2 | Live | High | AP-71 `no-false-resource-delivery` | `meta/techniques/fan/enter-fan.md:36,51` (output `branch_activities`, Protocol §2); `fan/spawn-branches.md:14,34`; consumers `activity-loop.yaml:104,114,137`, `retire-branch` `from_activity: current_branch` | §2 reads "`_meta.fan` as `{branch_activities}`", and the output is described as "The branches the destination opened". The handler sets `meta['fan'] = fanEnter.report` (`:1645`), which is `Array<{activity, variable?, over?, branches: string[]}>`: one entry per destination member (`:1074,1099,1160`). The e2e test flattens it (`tests/e2e/fan-walk.test.ts:96-97`). spawn-branches adds "that entry as `activity_id`", which is an object and not a frontier id. An instance fan is one entry holding N branches, so one worker would be spawned where N are due. Each retirement then names an object as `from_activity`, which `resolveRetiringActivity` refuses (`:1006-1021`). | pre-existing (this branch renamed `branch_list` to `branch_activities` on the same line) | Read the branch ids the tool actually lists: the flattened `_meta.fan[].branches`, or the response's `outstanding` / `_meta.barrier.pending`. |
| E3 | Contract | Medium | AP-71 `no-false-resource-delivery` | `meta/activities/03-dispatch-client-workflow.yaml:15`, `04-end-workflow.yaml:16` `client_workflow_completed.description` | The new text is "Whether the dispatched client workflow's session reports completed." Its producer is `record-client-completion` (`03…:35-40`), which sets it true when `current_activity == null`, and it reads no session status. Per E1, the loop reaches null only off an exitless activity, where `get_workflow_status` still reports `active`. On a `__terminal__` graph the value is never set. `end-workflow` gates `revise-session-metrics` on it (`04…:26`). | diff (33134bdd…bcf31337 changed the description from "reached workflow_complete") | Describe what the producer sets (the client walk ended with no activity routed), or set it from `get_workflow_status` `status == completed`. |
| E4 | Contract | Medium | AP-71 `no-false-resource-delivery` | `meta/resources/workflow-canonical.md:83-84` `## Base-contract inheritance` | "`get_technique` returns the **fully composed** technique; agents do not assemble it by hand." `get_technique` returns "own interface, own rules, and `inherits` naming the scopes whose contracts ride beside it under `contracts`" (`resource-tools.ts:797`). `docs/delivery.md:681` adds that what an agent is sent "does not copy that merge onto every body". This branch deleted the same claim from `variable-binding.md` §1, and moved `session_index` / `activity_id` / `variable_bag` / `checkpoint_reply` into the workflow-engine container. A reader who trusts this line never reads them off `contracts`. | pre-existing (file touched, line unchanged) | State the real return: the technique's own body plus the named contracts under `contracts`, which the reader reads together. |
| E5 | Contract | Low | AP-71 `no-false-resource-delivery` | `workflow-design/techniques/context-loading.md:40` Protocol §1 | "Load all five JSON schema definitions from `workflow-server://schemas` (workflow, activity, technique, condition, state) … Delivery: resource-loading-via-tool". The URI is an MCP resource (`schema-resources.ts:45-47`), not a `get_resource` id, and the rule it cites sends the reader to `get_resource`. The five ids served are workflow, activity, condition, technique and session-file (`schema-loader.ts:16`). There is no `state`. | pre-existing (this branch deleted the adjacent `schemas/README.md` line) | Name the ids the URI serves, and say it is read as an MCP resource, not via `resource-loading-via-tool`. |
| E6 | Hygiene | Low | AP-71 `no-false-resource-delivery` | `canon/resources/schema-construct-inventory.md:15,21` `## Universal obligation` | "Field tables and required properties live in the JSON schemas below, which the URI `workflow-server://schemas` aggregates", and the list includes `Routine — schemas/routine.schema.json`. The aggregate serves workflow, activity, condition, technique and session-file (`schema-loader.ts:16`, `schema-resources.ts:49`). The routine schema is not served. | diff (sentence rewritten in 837aebd7) | Say the URI serves the four definition schemas, and point the Routine line at its repo path only. |
| E7 | Hygiene | Low | AP-97 `link-named-artifacts` | `workflow-design/activities/09-validate-and-commit.yaml:170` `approve-to-commit.message` | "`[assumptions log]({assumptions_log})`" interpolates `assumptions_log`, which is the log object (`workflow.yaml:39-41`, type `object`), not a path. No path output exists for `assumptions-log.md`. | pre-existing (closure file) | Declare a path output on the technique that writes `assumptions-log.md`, and interpolate that path. |
| E8 | Hygiene | Low | AP-98 `no-next-step-narration` | `workflow-design/activities/01-intake-and-context.yaml:150`; `03-requirements-refinement.yaml:127,143,172` | "— proceeding without Gate 1."; "Stakeholder attestation at Gate 2."; "Open judgements after reconcile batch into Gate 2."; "batched into Gate 2 (`approve-to-commit`), not interviewed mid-flow." Each narrates routing that the conditions and the `approve-to-commit` gate already own. | pre-existing | Delete the narration and keep the factual clause. |
| E9 | Hygiene | Low | AP-99 `statement-not-question` | `meta/activities/04-end-workflow.yaml:41` `completion-confirmed.message`; `workflow-design/activities/09-validate-and-commit.yaml:170` `approve-to-commit.message` | "Confirm closure or return to the workflow to address remaining items." opens with "confirm". "Approve commit for workflow '{workflow_id}' (…)" is the same imperative ask. | pre-existing | Rewrite each message as a statement of its subject, and leave the decision in `options[]` labels. |
| E10 | Hygiene | Low | AP-101 `no-caption-only-message` | `meta/activities/04-end-workflow.yaml:41` | "Session summary presented above." captions the prior `generate-summary` step (present-only, so no artifact to link) and states no decision-relevant fact. | pre-existing | Reduce the message to the subject the options decide, for example the outcome verdict `verify-outcomes` produced. |
| E11 | Hygiene | Low | AP-100 `runtime-rules-only` | `workflow-authoring/techniques/workflow-definition/yaml-authoring.md:71-81` rules `a-step-binds-only-its-deviations`, `a-name-mismatch-is-closed-at-the-caller`, `a-foreign-technique-is-qualified` | These are authoring standards for step-binding shape, and each would apply in any unrelated authoring session. They are moved from variable-binding (walk2-E3 / walk-E9) into another technique's `## Rules` rather than into the canon that entry's Fix names. | diff (b89a58f2) | Migrate them into the design-time canon (construct inventory or a covering entry) and enforce them in the authoring audit. |
| E12 | Hygiene | Low | AP-100 `runtime-rules-only` | `workflow-design/techniques/yaml-authoring.md:62-88` rules `block-style-arrays`, `block-style-mappings`, `scalar-quoting`, `multi-line-scalars`, `version-format`, `field-ordering`, `schema-reference` | These are YAML style standards filed as technique rules. The workflow-authoring twin homes the same standards in a resource (`yaml-style.md`). | pre-existing | Move them to the canon or a style resource, as the twin does. |
| E13 | Contract | Low | AP-102 `no-technique-resource-dual-home` | `workflow-authoring/techniques/workflow-definition/impact-analysis.md:73,79,85` vs `workflow-authoring/resources/impact-analysis.md:86,88`; `workflow-authoring/techniques/workflow-definition/scope-definition.md:66` vs `resources/scope-manifest.md:60`; `workflow-design/techniques/scope-definition.md:68` vs `workflow-design/resources/scope-manifest.md:64` | Each technique cites its template and also restates the template's fill rules. Removed-versus-preserved rows: "a reduction that no inventory row names as unapproved" / "A reduction no row names is unapproved". Own facts only: "link … rather than restating". This branch fixed the workflow-design impact-analysis copy (walk-E11) and left the authoring twin and both scope-definition copies. | pre-existing | Keep the fill rules in the resource. Each technique keeps the assemble step and the template citation. |
| E14 | Hygiene | Low | Entry identity | `workflow-design/techniques/reconcile-design-assumptions.md:39` | `[pass-orchestration-in-technique](/canon/resources/anti-patterns.md#ap-114-pass-orchestration-in-technique)`: the citation carries the entry number in its anchor, which breaks on renumbering. It is the only numbered anti-pattern citation left on the surface (the inventory's were fixed per walk-E14). This branch edited the line. | pre-existing | Cite it as the backticked kebab name `pass-orchestration-in-technique`. |

Both Highs were re-derived from the cited files and the handler alone, and both reproduce; none was withdrawn or downgraded.
- E1: finalize §2 applies evaluate-transition, which passes `__terminal__` through. `advance-activity` then sets `current_activity` to it, and `continueWhile != null` keeps looping. `continue-batch` or `dispatch-activity` then calls `next_activity` onto `__terminal__`, which completes the session at `:1540`. The stub's `get_activity` hits `servedActivity` on an empty frontier and throws at `:1725`.
- E2: `fanEnter.report` is the member list (`:1099,:1160`), and `from_activity` must be a frontier string (`:1006-1021`).

Mediums spot-confirmed:
- E3: against `03-dispatch-client-workflow.yaml:35-40` and `:3020`.
- E4: against `resource-tools.ts:797` and `docs/delivery.md:681`.

Earlier findings in this slice, re-checked:
- No longer firing:
  - walk-E3 (present-checkpoint return): `present-checkpoint-to-user.md:26` now names the rendered text and `consequence`.
  - walk-E4 and walk2-E4 (all-pass integrity tables): both impact templates carry a one-line all-pass form plus a divergence table.
  - walk-E5 (empty removals table): `[Omit if none …]`.
  - walk-E6 (persisted scorecard): the `## Summary` table is deleted.
  - walk-E7 (format-conventions mode gate): the rule is deleted, and `01…:198` carries `when: operation_type != 'review'`.
  - walk-E11 (workflow-design impact-analysis dual home).
  - walk-E14 (inventory numbered cites).
  - walk2-E1 (batch block position): `activity-worker.md:26,89` say "closing" / "closes with".
  - walk2-E2 / walk-E9 and walk2-E3 (authoring clauses in variable-binding): removed there, and re-homed per E11 above.
- Still firing: none of the listed findings fires in the form it was listed.

Considered and not recorded:
- AP-74: the ends-activity instruction is duplicated across `yield-checkpoint.md:32`, `resume-from-checkpoint.md:31` and `activity-worker.md:49`, and the stub and resume-from-checkpoint both call `resume_checkpoint`. Every copy is a meta engine surface "whose domain is tool usage" (Do not flag).
- AP-79: `activity-worker` `worker-control-plane-ban` has no definition-level construct that could back it. `commit-after-activity` is backed by the routine's step order (commit before `advance-activity`).
- AP-92: both impact templates carry a `## Decision ask` section. It is template content (Do not flag: "Artifact templates").
- AP-89: `10-post-impl-review.yaml` `block-interview`: `critical-blocker` sets a variable, so the gate decides.
- AP-94: the `scope-manifest.md:22` removal count sits beside a link to impact §3, which is a one-line pointer.

Out of slice, for the owning walker:
- Live, pre-existing, `call-omits-conditionally-required-argument`: `next_activity` never carries the worker's `variables_changed` in `dispatch-activity.md:52`, `continue-batch.md:42`, `take-activity.md:38` or `enter-fan.md:51`; only `retire-branch.md:32` passes it. The engine lands a retiring activity's outputs in the bag only from that argument (`:1425-1450`). It opens an instance fan over `bag ∪ variables_changed` of the same call (`:1363-1373`). A collection the source activity wrote is therefore absent, and the fan is refused with "'…' is not in the variable bag" (`:1105-1108`). fan-conformance's `plan-conformance` writes the collection its own exit fans over. TECHNIQUE.md `variable-mutation-source` names the envelope as a mutation source that never reaches the server.
- `unproduced-value-read` / one home, workflow-design:
  - `03-requirements-refinement.yaml:118-124` writes `artifact_content: design_specification`, which nothing produces: `persist-design-specification` outputs only `specification_path` and persists the file itself.
  - `01-intake-and-context.yaml:141-142,195-196,204-205` writes `structural_inventory`, `format_conventions` and `applicable_constructs`. `context-loading` outputs only paths and persists both files itself (§6-7); `intake-classification` §5 persists the inventory itself. That is two writers per file.
  - `06-scope-and-draft.yaml:178-184,222-228,308-315` duplicates the persists that `assemble-file-approach`, `review-drafted-file` and `review-draft-yaml` already make.
- `call-names-an-undeclared-argument`: `activity-loop.yaml:172` binds `checkpoint_resolution: user_selection`, whose shape is `{ option_id, effects }` (`present-checkpoint-to-user.md:20`). `respond_checkpoint { …checkpoint_resolution }` therefore passes `effects`, which the tool does not declare (`:2767-2771`).
- `workflow-design/activities/README.md:65` says validate-and-commit is "Terminal in create and review modes". The graph binds `create: retrospective` (`workflow.yaml:65`), and the review path takes the default `create` exit.

## Files

- canon-audit-residuals/corpus/canon/resources/design-principles.md — read
- canon-audit-residuals/corpus/canon/resources/schema-construct-inventory.md — read
- canon-audit-residuals/corpus/codebase-wiki/README.md — read
- canon-audit-residuals/corpus/codebase-wiki/activities/README.md — read
- canon-audit-residuals/corpus/meta/activities/03-dispatch-client-workflow.yaml — read
- canon-audit-residuals/corpus/meta/activities/04-end-workflow.yaml — read
- canon-audit-residuals/corpus/meta/activities/patterns/02-supervisor.yaml — read
- canon-audit-residuals/corpus/meta/activities/patterns/03-plan-and-execute.yaml — read
- canon-audit-residuals/corpus/meta/activities/patterns/05-lead-researcher.yaml — read
- canon-audit-residuals/corpus/meta/activities/patterns/README.md — read
- canon-audit-residuals/corpus/meta/resources/README.md — read
- canon-audit-residuals/corpus/meta/resources/workflow-canonical.md — read
- canon-audit-residuals/corpus/meta/routines/activity-loop.yaml — read
- canon-audit-residuals/corpus/meta/techniques/agent-conduct.md — read
- canon-audit-residuals/corpus/meta/techniques/fan/enter-fan.md — read
- canon-audit-residuals/corpus/meta/techniques/fan/spawn-branches.md — read
- canon-audit-residuals/corpus/meta/techniques/variable-binding.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/TECHNIQUE.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/activity-worker.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/commit-and-persist.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/compose-prompt.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/continue-batch.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/dispatch-activity.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/evaluate-transition.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/finalize-activity.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/present-checkpoint-to-user.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/respond-checkpoint.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/resume-worker.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/sync-progress-status.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/take-activity.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/workflow-orchestrator.md — read
- canon-audit-residuals/corpus/meta/techniques/workflow-engine/yield-checkpoint.md — read
- canon-audit-residuals/corpus/midnight-system-review/activities/README.md — read
- canon-audit-residuals/corpus/ponytail/activities/README.md — read
- canon-audit-residuals/corpus/prism-audit/README.md — read
- canon-audit-residuals/corpus/prism-update/activities/README.md — read
- canon-audit-residuals/corpus/specimens/fan-conformance/activities/README.md — read
- canon-audit-residuals/corpus/specimens/git-pin-conformance/activities/README.md — read
- canon-audit-residuals/corpus/specimens/routine-conformance/activities/README.md — read
- canon-audit-residuals/corpus/substrate-node-security-audit/README.md — read
- canon-audit-residuals/corpus/substrate-node-security-audit/activities/README.md — read
- canon-audit-residuals/corpus/work-package/README.md — read
- canon-audit-residuals/corpus/work-package/activities/README.md — read
- canon-audit-residuals/corpus/work-packages/README.md — read
- canon-audit-residuals/corpus/workflow-authoring/resources/impact-analysis.md — read
- canon-audit-residuals/corpus/workflow-authoring/resources/scope-manifest.md — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/scope-definition.md — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/yaml-authoring.md — read
- canon-audit-residuals/corpus/workflow-design/README.md — read
- canon-audit-residuals/corpus/workflow-design/activities/01-intake-and-context.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/03-requirements-refinement.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/04-pattern-analysis.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/05-impact-analysis.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/06-scope-and-draft.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/08-quality-review.yaml — read
- canon-audit-residuals/corpus/workflow-design/activities/README.md — read
- canon-audit-residuals/corpus/workflow-design/resources/design-assumptions.md — read
- canon-audit-residuals/corpus/workflow-design/resources/format-conventions.md — read
- canon-audit-residuals/corpus/workflow-design/resources/impact-analysis.md — read
- canon-audit-residuals/corpus/workflow-design/resources/scope-manifest.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/TECHNIQUE.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/audit-rule-enforcement.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/context-loading.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/impact-analysis.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/pattern-analysis.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/reconcile-design-assumptions.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/scope-definition.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/yaml-authoring.md — read
- canon-audit-residuals/corpus/workflow-design/workflow.yaml — read
- canon-audit-residuals/ledgers/unserved-operation-ref-triage.json — read (355 uniform entries, diff checked)
- canon-audit-residuals/corpus/meta/techniques/README.md — read
- canon-audit-residuals/corpus/meta/workflow.yaml — read
- canon-audit-residuals/corpus/prism-audit/activities/02-execute-analysis.yaml — read
- canon-audit-residuals/corpus/prism-audit/techniques/README.md — read
- canon-audit-residuals/corpus/prism-evaluate/activities/02-execute-analysis.yaml — read
- canon-audit-residuals/corpus/prism-evaluate/techniques/README.md — read
- canon-audit-residuals/corpus/work-package/activities/10-post-impl-review.yaml — read
- canon-audit-residuals/corpus/workflow-authoring/activities/06-scope-and-draft.yaml — read
- canon-audit-residuals/corpus/workflow-authoring/activities/09-validate-and-commit.yaml — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/intake-classification.md — read
- canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/synthesize-change-brief.md — read
- canon-audit-residuals/corpus/workflow-design/activities/09-validate-and-commit.yaml — read
- canon-audit-residuals/corpus/workflow-design/techniques/capture-dimension.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/intake-classification.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/persist-design-specification.md — read
- canon-audit-residuals/corpus/workflow-design/techniques/synthesize-update-specification.md — read
