# Walk D, third pass — anti-patterns overview, entry identity, Description Hygiene, Coupling

Home: `corpus/canon/resources/anti-patterns.md` on the residuals worktree (`workflow/canon-audit-residuals`, base `166718d6`). Surface: the 88 paths of `res-surface.txt` (72 touched, 16 closure). Origin is set against `166718d6`. `known — not fixed` names a finding from `walk-D.md` or `walk2-D.md` that still fires. Paths are relative to `corpus/`.

## Units

- Overview (Catalog preamble, Creation Rules preamble): walked. Each entry applied as its own Detect / Do not flag / Fix test.
- Entry identity: walked. One number-bearing citation remains (D1). The construct inventory now cites by kebab name (walk-D D31 closed). `workflow-design/README.md:154` "(AP-XX + name)" describes the catalogue format and cites no entry.
- AP-26. no-rationale-in-description: walked
- AP-27. validate-message-economy: walked (every validate message on the surface is cause, or cause plus fix)
- AP-28. no-sequence-in-description: walked
- AP-29. no-user-env-mutation: walked
- AP-30. role-rules-not-description: walked
- AP-31. no-hand-authored-artifacts: walked (no activity `artifacts[]`)
- AP-32. outcome-names-value: walked
- AP-33. no-set-of-technique-output: walked (the one bound-step `set`, `trace_tokens` in activity-loop.yaml:128, is a forEach accumulator, carve-out a)
- AP-34. no-valueless-control-set: walked
- AP-35. no-intra-step-input-set: walked (no `set` feeds its own step's inputs)
- AP-36. techniques-list-disjoint: walked
- AP-37. rule-audience-bucket: walked (workflow-design `rules.activity` holds a worker directive)
- AP-38. no-duplicate-technique-steps: walked
- AP-39. hoist-universal-techniques: walked
- AP-40. readme-orients-not-transcribes: walked
- AP-41. avoidance-voice-in-definitions: walked
- AP-42. io-agnostic-contract: walked
- AP-43. canonical-artifact-ids: walked
- AP-44. artifact-name-in-io: walked
- AP-45. no-opaque-artifact-path-array: walked
- AP-46. no-resource-caller-backlink: walked
- AP-47. no-redundant-link-label: walked
- AP-48. brace-output-references: walked
- AP-49. no-delivery-mechanism-narration: walked
- AP-50. no-tool-usage-prescription: walked
- AP-51. canonical-technique-reference: walked
- AP-52. brace-declared-ids: walked
- AP-53. dotted-rule-address: walked
- AP-54. anchored-protocol-references: walked
- AP-55. hoist-shared-inputs: walked
- AP-56. paren-invocation-args: walked
- AP-57. escape-literal-dollar: walked
- AP-58. snake-case-symbols: walked
- AP-59. constraint-as-blockquote: walked
- AP-60. local-rule-as-note: walked
- AP-61. factor-repeated-paths: walked
- AP-62. bind-protocol-locals: walked
- AP-63. backtick-code-tokens: walked
- AP-64. boolean-id-shape: walked
- AP-65. collection-id-shape: walked
- AP-66. io-id-shape: walked
- AP-67. rule-slug-shape: walked
- AP-68. technique-stage-agnostic: walked
- AP-69. no-activity-prose-rules: walked (no activity-level `rules:` on the surface)
- AP-70. capability-group-placement: walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| D1 | Hygiene | Low | Entry identity | workflow-design/techniques/reconcile-design-assumptions.md:39 (Protocol 1) | `([pass-orchestration-in-technique](/canon/resources/anti-patterns.md#ap-114-pass-orchestration-in-technique))`. The `#ap-114-…` anchor cites the number and breaks on renumbering. The branch rewrote this line (the schemas clause) and kept the anchor. It moved the construct inventory to the `[anti-patterns](./anti-patterns.md): \`name\`` form. | pre-existing (line touched by diff) | Write `[anti-patterns](/canon/resources/anti-patterns.md): \`pass-orchestration-in-technique\``. |
| D2 | Hygiene | Low | `bind-protocol-locals` (b) | meta/techniques/workflow-engine/yield-checkpoint.md:25 (Protocol 1) | :24 binds `{$checkpoint_id}`, and the next step reads it as "with `{$checkpoint_id}`". A read wears `$`. The branch replaced the declared input `checkpoint_id` with this local. | diff | Read it as `{checkpoint_id}`. |
| D3 | Hygiene | Low | `factor-repeated-paths` | workflow-design/techniques/yaml-authoring.md:34 and :38 (with :14 and :48) | The branch added `schemas/{schema_type}.schema.json` at :34. Protocol 3 already reads the same literal at :38. :14 and :48 list the same three files again. | diff | Keep the literal once (the `schema_type` description) and refer to "the schema for `{schema_type}`" elsewhere. Or drop the :38 parenthetical. |
| D4 | Hygiene | Low | `local-rule-as-note` | meta/techniques/workflow-engine/respond-checkpoint.md:36-38 (`verify-auto-advance-on-resolve`) | Only Protocol 1 (:26) cites it, and no other file does. It qualifies that one call. The branch demoted `no-option-hallucination` in this file by the same test. | pre-existing | Make it a `>` note under Protocol 1 and delete the rule. |
| D5 | Hygiene | Low | `brace-output-references` | meta/techniques/workflow-engine/continue-batch.md:60 (Protocol 5) | "return that identity with the replacement's envelope". The twin in resume-worker.md:43 was fixed (walk2 D23) and now reads "return `{worker_agent_id}` and the replacement's envelope as `{worker_result}`". | pre-existing (twin of walk2 D23) | Write "return `{worker_agent_id}` and the replacement's envelope as `{worker_result}`". |
| D6 | Hygiene | Low | `no-rationale-in-description` | compose-prompt.md:40; activity-worker.md:81, :85 | "which the server refuses to guess while several are in flight, so a branch worker that omits it is refused on its first call"; "omit it otherwise, because a fresh context needs the bytes"; "which is the whole of the remedy available from here"; "re-fetching it pays the round trip for content the response already delivered". Deleting each clause leaves the constraint intact. | known — not fixed (walk2 D12, compose-prompt 44 / activity-worker 77, 85) | Delete the clauses. |
| D7 | Hygiene | Low | `no-rationale-in-description` | fan/enter-fan.md:18, :26, :36; workflow-engine/continue-batch.md:26, :42, :70; variable-binding.md:47, :50, :59; compose-prompt.md:56 | I/O descriptions and rules explain why or name a consumer. Examples: "Passed through unread: the server expands it, so this technique never learns…"; "Required: an exit the graph fans has to say which destination it takes"; "The order every later pass over them follows"; "Feeds the server's step-completion and technique-fetch validation"; "the other two are named so a reader who meets them knows they are reading a different position"; "a paraphrase drifts from the artifact that records it". | pre-existing (files touched by the rename and hoist) | Delete the rationale and consumer clauses. |
| D8 | Hygiene | Low | `no-rationale-in-description` | workflow-design/workflow.yaml:19 (`rules.activity`) | "…carried forward as the run's own record, so a later activity reads the specification rather than re-deriving it". The so-clause is rationale inside a `rules.*` string. | pre-existing | Keep "elicited once and carried forward as the run's own record" and delete the rest. |
| D9 | Hygiene | Low | `readme-orients-not-transcribes` | substrate-node-security-audit/README.md:18 | "report generation is entered only when the dispatch, verification, and merge gates are set". This is the exit-condition clause the branch deleted from `activities/README.md:17` (walk2 D16). It survives in the root README, which the branch touched. | pre-existing (twin of walk2 D16) | Delete the clause. |
| D10 | Hygiene | Low | `readme-orients-not-transcribes` | ponytail/activities/README.md:31, :45; work-package/activities/README.md:219, :227; prism-audit/README.md:48; workflow-design/README.md:105, :160 | Exit `when` and step-gate transcription: "when `lazy_intensity == ultra` **or** `pass_scope == repo`"; "when none exist, the report tail is skipped"; "In stealth mode the fragment issue-reference check is skipped"; "In stealth mode the PR lifecycle is gated out entirely: … private-remote verification, a final isolation confirmation, and a commit-signature check"; "the `confirm-scope` checkpoint can loop back"; "(while-loop via `has_resolvable_assumptions`); open judgements batch into Gate 2"; "while-loop / Gate 2 handoff". Commit bcf31337 names these READMEs as leaving steps, checkpoints and loops to the YAML. | pre-existing | Delete the gate, exit-condition and loop transcription. Keep role and connections. |
| D11 | Hygiene | Low | `avoidance-voice-in-definitions` | substrate-node-security-audit/README.md:28, :228 | "(now) the `gitnexus` capability"; "this workflow does not build on prism by design"; "so benign-looking helpers can no longer be skimmed past". This is history voice that reads against a prior state. | pre-existing | Rewrite to current behaviour ("share … the `gitnexus` capability"; "reviews every helper function"). |
| D12 | Hygiene | Low | `avoidance-voice-in-definitions` | prism-audit/README.md:21, :22, :78; codebase-wiki/README.md:42; specimens/fan-conformance/activities/README.md:181, :255; meta/activities/patterns/README.md:59; prism-audit/techniques/README.md:5, :78; prism-evaluate/techniques/README.md:155 | "not a wall of raw analysis"; "instead of a one-size-fits-all security prompt"; "not assigned intuitively"; "Local-only — no branch, commit, or PR"; "structurally rather than stylistically"; "reported rather than resolved by preferring one"; "(not dynamic decomposition)"; "it does not restate protocols"; "not authored here". The branch fixed the twins of these lines: prism-audit/README.md:94 "rather than authored here", codebase-wiki/activities/README.md "no branch, commit, or pull-request techniques", and fan-conformance's "it is not duplicated here". | pre-existing (prism-audit README is walk-D D17's file) | Rewrite each to what holds. |
| D13 | Hygiene | Low | `avoidance-voice-in-definitions` | meta/activities/03-dispatch-client-workflow.yaml:46 (outcome); workflow-design/activities/01-intake-and-context.yaml:246 (outcome); 04-pattern-analysis.yaml:68 (outcome); 03-requirements-refinement.yaml:172 (message) | "rather than once an activity"; "instead of falling back to prose"; "instead of reinventing it"; "not interviewed mid-flow" | pre-existing | Rewrite to the delivered value. |
| D14 | Contract | Medium | `no-valueless-control-set` | workflow-design/activities/01-intake-and-context.yaml:77-79; 03-requirements-refinement.yaml:81-83; 06-scope-and-draft.yaml:335-346, :370-381; 08-quality-review.yaml:287-292, :328-333; workflow-authoring/activities/06-scope-and-draft.yaml:101-103; 09-validate-and-commit.yaml:162-164 | Control-step `set`s carry no `value:`, and their `message` holds the derivation. Examples: "Set true iff any of `principle_finding_count` or `anti_pattern_finding_count` is greater than 0"; "one higher than the round already answered"; "Server-resolved canonical absolute planning folder from the start_session / get_workflow summary". `needs_audit_fixes`, `has_critical_finding` and the round counters drive loops, exits and checkpoint ids. | pre-existing | Bind a technique whose outputs own each derivation, or give the `set` a `value:` expression. Delete the value-less sets. |
| D15 | Hygiene | Low | `no-sequence-in-description` | workflow-design/activities/03-requirements-refinement.yaml:4, 06-scope-and-draft.yaml:4, 09-validate-and-commit.yaml:4; workflow-authoring/activities/06-scope-and-draft.yaml:4, 09-validate-and-commit.yaml:4 | Each `description` enumerates its steps in order: "reconciled in a while-loop, and open judgements deferred to Gate 2"; "…, then planning-artifact conformance verify"; "Final validation, scope verification, and README generation/update, then Gate 2…"; "Prepare…, enumerate…, author…, and bring…"; "Re-derive…, persist…, take…, then re-verify…". The branch cut the same form from the three pattern activities (walk2 D14), and 03/04 meta activities carry purpose only. | pre-existing | Keep a purpose clause and delete the sequence. |
| D16 | Hygiene | Low | `outcome-names-value` | workflow-design/activities/01-intake-and-context.yaml:244 | "Derive-first intent lands gap flags and `{headless_mode}` (default true…); Gate 1 fires only when intent needs confirmation". It says variables were populated and restates a checkpoint condition. | pre-existing | Delete it, or rewrite it as the value, e.g. "The user is asked to confirm intent only when the request leaves it unclear". |
| D17 | Hygiene | Low | `anchored-protocol-references` | meta/techniques/fan/enter-fan.md:46 (Protocol 1) | `[sync-progress-status](./sync-progress-status.md)` points at a file that does not exist; the target is `../workflow-engine/sync-progress-status.md`. spawn-branches.md:34 links its engine op as `../workflow-engine/compose-prompt.md`. The unserved-operation ledger carries it as fix-later. | pre-existing | Change the link to `../workflow-engine/sync-progress-status.md`. |
| D18 | Hygiene | Low | `dotted-rule-address` | workflow-design/techniques/context-loading.md:40, :48; intake-classification.md:81 | Protocol steps cite a meta rule as a heading hyperlink: `[resource-loading-via-tool](/meta/techniques/workflow-engine/TECHNIQUE.md#resource-loading-via-tool)` and `[no-domain-work](/meta/techniques/orchestrator-conduct.md#no-domain-work)`. Both rules live in another library, and `orchestrator-conduct` is not a worker's bundle. | pre-existing | Use `workflow-engine.resource-loading-via-tool`. State the no-domain-work fact plainly ("workflow definitions arrive from the orchestrator"). |
| D19 | Hygiene | Low | `technique-stage-agnostic` | reconcile-design-assumptions.md:60, :74; synthesize-update-specification.md:32; workflow-authoring/techniques/workflow-definition/scope-definition.md:72 | "durable evidence for Gate 2 batch disposition"; "Quality-review audit steps remain activity-bound elsewhere"; "ready for persist and batch confirmation"; "so a file discovered mid-draft returns here". These name a gate, an activity or routing. | pre-existing | Delete the gate, stage and routing clauses. Keep the evidence the technique emits. |
| D20 | Hygiene | Low | `io-agnostic-contract` | workflow-design/techniques/persist-design-specification.md:14 (`accumulated_design`); meta/techniques/workflow-engine/continue-batch.md:26 and take-activity.md:22 (`step_manifest`) | "from the dimension capture on a create run or the update synthesis on an update run … Absent where … instead". Also "`steps_completed` from the `activity_complete` envelope the preceding dispatch or continuation returned" and "…the preceding entry returned". These name producer positions. | pre-existing | Describe the value only: its shape, and when it is unset. |
| D21 | Hygiene | Low | `io-id-shape` | workflow-design/techniques/context-loading.md:12, :24 (`format_conventions_path`, `applicable_constructs_path`); persist-design-specification.md:18 (`specification_path`) | These are representation-proxy `-path` output ids carrying `#### artifact`. The branch renamed four siblings in this library to content ids and moved the write to `write-artifact` (walk-D D22). These three remain. | pre-existing (same class as walk-D D22) | Output the content id (`format_conventions`, `applicable_constructs`, `design_specification`) and let the activity's write step bind the path. |
| D22 | Hygiene | Low | `collection-id-shape` | workflow-design/workflow.yaml:36; 06-scope-and-draft.yaml:88, :166; workflow-authoring/activities/06-scope-and-draft.yaml:43, :131 | `scope_manifest` is a singular id holding the collection `over: scope_manifest` iterates. | pre-existing | Rename it to the plural item noun at producer and loop, e.g. `manifest_entries`. |
| D23 | Hygiene | Low | `backtick-code-tokens` | canon/resources/schema-construct-inventory.md:23, :151, :201, :241, :299 (headings) | Bare `activity.schema.json`, `workflow.schema.json`, `routine.schema.json`, `technique.schema.json`, `condition.schema.json` | known — not fixed (walk-D D28) | Wrap each in a code span. The GitHub slug is unchanged. |
| D24 | Hygiene | Low | `backtick-code-tokens` | meta/techniques/workflow-engine/commit-and-persist.md:20 (Protocol 1) | `(*activity_id*={activity_id}, *planning_folder_path*={planning_folder_path}, …)`. These are bare designators outside a code span. dispatch-activity.md:46 wraps the same value. | pre-existing | Write `` `{activity_id}` `` and `` `{planning_folder_path}` ``. |
| D25 | Hygiene | Low | `bind-protocol-locals` (b) | workflow-design/techniques/intake-classification.md:98 (Protocol 7) | `{$design_intent}` is bound and never read. | pre-existing | Delete the vestigial bind (and the phase if nothing remains), or read it where it is needed. |
| D26 | Hygiene | Low | `brace-declared-ids` (c) | meta/techniques/workflow-engine/take-activity.md:39 (note) | "`from_activity`, `exit_id` and `step_manifest` are all unset together". These are declared inputs shown in backticks, and :14 of the same file writes `{exit_id}`. | pre-existing | Write `{from_activity}`, `{exit_id}` and `{step_manifest}`. |
| D27 | Hygiene | Low | `constraint-as-blockquote` | meta/techniques/workflow-engine/commit-and-persist.md:20 (last sentence), :41; finalize-activity.md:82 | "When `{mark_progress_na}` was true, set it false after the Apply."; "If push failed, retry once; if still failing, surface the error and do not advance…"; "Include `{selected_exit}` if a checkpoint effect named an exit." Each is a caveat or error path inside the step sentence. | pre-existing | Move each to a `>` note under its instruction. |
| D28 | Hygiene | Low | `capability-group-placement` | workflow-authoring/techniques/ (only `workflow-definition/` beside the root `TECHNIQUE.md`) | The group folder's ops are the workflow's whole technique set, so `workflow-definition::` only restates the workflow. | pre-existing | Flatten to standalone `techniques/<op>.md` and move the shared contract to the root `TECHNIQUE.md`. |

No finding was raised at High or in the Live band. D14 was weighed at High: the value-less sets gate loops and exits. It stays at Medium because the construct is pre-existing and the branch did not change it.

Walked and not flagged, as convention or carve-out:
- `hoist-shared-inputs` on workflow-engine. The container now declares `session_index`, `activity_id`, `variable_bag` and `checkpoint_reply`, and no leaf redeclares them (walk2 D1, D9, D10 closed). `checkpoint_reply` on respond-checkpoint's Outputs is the producer declaration the Fix prescribes. `session_index` survives only as an output (start-session, create-session) and in other groups (fan, harness-compat, orchestration-patterns). Workflow-design leaf inputs (`accumulated_design`, `structural_inventory`, `target_path`, `workflow_branch`, `workflow_id`) sit on two or three leaves each: carve-out.
- `io-id-shape` on `variable_bag`, `checkpoint_reply`, `branch_activities`: each names what the value is (walk2 D2, walk-D D21 closed). `collection-id-shape` on `branch_list` closed (walk-D D29).
- `techniques-list-disjoint` and `hoist-universal-techniques`: `scatter-gather` on a few activities, with no step binding it.
- `no-duplicate-technique-steps`: design 06 binds `yaml-authoring` and `assemble-file-approach` more than once, under mutually exclusive `when`s. Design 03 and 08 bind a reconcile or audit technique once before its loop and once inside it: distinct pipeline points.
- `paren-invocation-args` on backticked `name: value` arguments in engine techniques (dispatch-activity :46, :48; activity-worker :49): engine convention (walk2).
- `no-tool-usage-prescription` and `no-delivery-mechanism-narration` in workflow-engine techniques: engine carve-out. variable-binding's `get_technique` clause is gone (walk2 D21 closed).
- `no-resource-caller-backlink` on the design and authoring creation guides. The canonical-home map link is the named "see also" carve-out, and filenames in the Template bodies are the Template carve-out. The gate narration walk-D D19 and walk2 D18 cited is gone.
- `local-rule-as-note` on the yaml-authoring (authoring) step-binding rules. They qualify the drafting phase, and the workflow-design twin carries its drafting standards as `## Rules`, so this is convention.
- `rule-slug-shape` on the three new yaml-authoring rules: positive invariants.
- A scripted sweep of the surface markdown found no unescaped `$`, no redundant link label, and no bare `scheme://` URI. The only bare brace designators are D24.

Closed from the earlier passes: walk-D D1–D5, D7–D13, D15, D16, D18–D22, D24–D27, D29–D31; walk2 D1–D11, D13–D24. For walk-D D14 and D17, and walk2 D12, D16 and D17, the cited lines are fixed and sibling sites remain (D6, D7, D9, D10, D12).

Out-of-slice observations for the caller (not entries of this slice; each checked by hand):
- **Contract, diff.** workflow-design/techniques/impact-analysis.md:16 now declares and reads `structural_inventory`. 05-impact-analysis.yaml `variables.reads` does not list it, and 01-intake-and-context.yaml declares no write for it. `check-activity-variables` exempts a persisted production (intake-classification carries `#### artifact`), so the guard does not see the crossing.
- **Contract, diff.** The design 08 fix cycle re-runs `audit-rule-enforcement` (:322-324). The technique no longer persists its own findings, and the only write step (`persist-enforcement-findings`, :247-257) sits before the loop. A remediated pass's enforcement findings are never saved, and `enforcement_findings_path` keeps the first-pass file. The sibling audits in the same loop (expressiveness, conformance, rule-hygiene) still persist on every run.
- **Live, pre-existing (the step was touched).** Several design `write-artifact` steps take `artifact_content` that no technique outputs: `format_conventions` and `applicable_constructs` (01:196, :205), and `design_specification` (03:123). context-loading and persist-design-specification output only `*_path`. The branch added `when: operation_type != 'review'` to 01's format-conventions write, so it now runs in update mode. context-loading.md:60-61 and workflow-design/README.md:110 still say create only.
- **Contract, diff.** `scope_manifest` is typed `array` ("List of files…", workflow.yaml:36) and iterated per file (06:166). scope-definition.md:28 now composes it as the whole document, sections included. The authoring twin already had this shape.
- **Stale restatement, diff.** workflow-design/README.md:117 still says pattern-analysis "persist[s] the comparison". work-package/README.md:33 still promises "a flow diagram" per activity, and the branch removed those diagrams.

## Files

- canon/resources/design-principles.md: read
- canon/resources/schema-construct-inventory.md: read
- codebase-wiki/README.md: read
- codebase-wiki/activities/README.md: read
- meta/activities/03-dispatch-client-workflow.yaml: read
- meta/activities/04-end-workflow.yaml: read
- meta/activities/patterns/02-supervisor.yaml: read
- meta/activities/patterns/03-plan-and-execute.yaml: read
- meta/activities/patterns/05-lead-researcher.yaml: read
- meta/activities/patterns/README.md: read
- meta/resources/README.md: read
- meta/resources/workflow-canonical.md: read
- meta/routines/activity-loop.yaml: read
- meta/techniques/agent-conduct.md: read
- meta/techniques/fan/enter-fan.md: read
- meta/techniques/fan/spawn-branches.md: read
- meta/techniques/variable-binding.md: read
- meta/techniques/workflow-engine/TECHNIQUE.md: read
- meta/techniques/workflow-engine/activity-worker.md: read
- meta/techniques/workflow-engine/commit-and-persist.md: read
- meta/techniques/workflow-engine/compose-prompt.md: read
- meta/techniques/workflow-engine/continue-batch.md: read
- meta/techniques/workflow-engine/dispatch-activity.md: read
- meta/techniques/workflow-engine/evaluate-transition.md: read
- meta/techniques/workflow-engine/finalize-activity.md: read
- meta/techniques/workflow-engine/present-checkpoint-to-user.md: read
- meta/techniques/workflow-engine/respond-checkpoint.md: read
- meta/techniques/workflow-engine/resume-from-checkpoint.md: read
- meta/techniques/workflow-engine/resume-worker.md: read
- meta/techniques/workflow-engine/sync-progress-status.md: read
- meta/techniques/workflow-engine/take-activity.md: read
- meta/techniques/workflow-engine/workflow-orchestrator.md: read
- meta/techniques/workflow-engine/yield-checkpoint.md: read
- midnight-system-review/activities/README.md: read
- ponytail/activities/README.md: read
- prism-audit/README.md: read
- prism-update/activities/README.md: read
- specimens/fan-conformance/activities/README.md: read
- specimens/git-pin-conformance/activities/README.md: read
- specimens/routine-conformance/activities/README.md: read
- substrate-node-security-audit/README.md: read
- substrate-node-security-audit/activities/README.md: read
- work-package/README.md: read
- work-package/activities/README.md: read
- work-packages/README.md: read
- workflow-authoring/resources/impact-analysis.md: read
- workflow-authoring/resources/scope-manifest.md: read
- workflow-authoring/techniques/workflow-definition/impact-analysis.md: read
- workflow-authoring/techniques/workflow-definition/scope-definition.md: read
- workflow-authoring/techniques/workflow-definition/yaml-authoring.md: read
- workflow-design/README.md: read
- workflow-design/activities/01-intake-and-context.yaml: read
- workflow-design/activities/03-requirements-refinement.yaml: read
- workflow-design/activities/04-pattern-analysis.yaml: read
- workflow-design/activities/05-impact-analysis.yaml: read
- workflow-design/activities/06-scope-and-draft.yaml: read
- workflow-design/activities/08-quality-review.yaml: read
- workflow-design/activities/README.md: read
- workflow-design/resources/design-assumptions.md: read
- workflow-design/resources/format-conventions.md: read
- workflow-design/resources/impact-analysis.md: read
- workflow-design/resources/scope-manifest.md: read
- workflow-design/techniques/TECHNIQUE.md: read
- workflow-design/techniques/audit-rule-enforcement.md: read
- workflow-design/techniques/context-loading.md: read
- workflow-design/techniques/impact-analysis.md: read
- workflow-design/techniques/pattern-analysis.md: read
- workflow-design/techniques/reconcile-design-assumptions.md: read
- workflow-design/techniques/scope-definition.md: read
- workflow-design/techniques/yaml-authoring.md: read
- workflow-design/workflow.yaml: read
- ../ledgers/unserved-operation-ref-triage.json: read (note, the removed entries in the diff, and a verdict scan: all 355 entries fix-later)
- meta/techniques/README.md: read
- meta/workflow.yaml: read
- prism-audit/activities/02-execute-analysis.yaml: read
- prism-audit/techniques/README.md: read
- prism-evaluate/activities/02-execute-analysis.yaml: read
- prism-evaluate/techniques/README.md: read
- work-package/activities/10-post-impl-review.yaml: read
- workflow-authoring/activities/06-scope-and-draft.yaml: read
- workflow-authoring/activities/09-validate-and-commit.yaml: read
- workflow-authoring/techniques/workflow-definition/intake-classification.md: read
- workflow-authoring/techniques/workflow-definition/synthesize-change-brief.md: read
- workflow-design/activities/09-validate-and-commit.yaml: read
- workflow-design/techniques/capture-dimension.md: read
- workflow-design/techniques/intake-classification.md: read
- workflow-design/techniques/persist-design-specification.md: read
- workflow-design/techniques/synthesize-update-specification.md: read
