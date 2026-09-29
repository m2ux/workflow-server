# Walk D, fourth pass — anti-patterns overview, entry identity, Description Hygiene, Coupling

Home: `corpus/canon/resources/anti-patterns.md` on the residuals worktree (`workflow/canon-audit-residuals`, head `c1ae16f8`, base `bcf31337`). Surface: the 80 paths of `r4-surface.txt` (56 touched, 24 closure). Origin is set against `bcf31337`. `known — not fixed` names a `walk3-D.md` finding that still fires. Paths are relative to `corpus/` unless they start `ledgers/`.

## Units

- Overview (Catalog preamble, Creation Rules preamble): walked. Each entry applied as its own Detect / Do not flag / Fix test.
- Entry identity: walked. Every AP citation on the surface uses the kebab name (walk3 D1 closed: reconcile-design-assumptions.md:39 now reads `[anti-patterns](…): \`pass-orchestration-in-technique\``). The only AP numbers are in titles. AP-01…AP-161 run in file order with no gap. Four titles break the `### AP-XX. name` form (D9).
- AP-26. no-rationale-in-description: walked
- AP-27. validate-message-economy: walked (every validate message on the surface is cause, or cause plus fix)
- AP-28. no-sequence-in-description: walked
- AP-29. no-user-env-mutation: walked (no direction to mutate user-owned state)
- AP-30. role-rules-not-description: walked
- AP-31. no-hand-authored-artifacts: walked (no activity `artifacts[]`)
- AP-32. outcome-names-value: walked
- AP-33. no-set-of-technique-output: walked (the bound-step sets are forEach accumulators: activity-loop.yaml:128, authoring 08-quality-review.yaml:133, carve-out a)
- AP-34. no-valueless-control-set: walked
- AP-35. no-intra-step-input-set: walked (no set feeds its own step's inputs)
- AP-36. techniques-list-disjoint: walked (`scatter-gather` on activities where no step binds it)
- AP-37. rule-audience-bucket: walked (workflow-design `rules.activity` holds a worker directive: correct bucket)
- AP-38. no-duplicate-technique-steps: walked (design 08 binds `audit-rule-enforcement` and the `enforcement-findings.md` write before the fix loop and inside it: distinct pipeline points)
- AP-39. hoist-universal-techniques: walked
- AP-40. readme-orients-not-transcribes: walked
- AP-41. avoidance-voice-in-definitions: walked
- AP-42. io-agnostic-contract: walked
- AP-43. canonical-artifact-ids: walked
- AP-44. artifact-name-in-io: walked
- AP-45. no-opaque-artifact-path-array: walked (no technique input is a `*-paths` array)
- AP-46. no-resource-caller-backlink: walked
- AP-47. no-redundant-link-label: walked (scripted sweep plus reading: none)
- AP-48. brace-output-references: walked
- AP-49. no-delivery-mechanism-narration: walked (engine carve-out on workflow-engine techniques)
- AP-50. no-tool-usage-prescription: walked (engine carve-out; no non-engine tool recipe)
- AP-51. canonical-technique-reference: walked
- AP-52. brace-declared-ids: walked
- AP-53. dotted-rule-address: walked
- AP-54. anchored-protocol-references: walked
- AP-55. hoist-shared-inputs: walked
- AP-56. paren-invocation-args: walked (backticked `name: value` in engine techniques is engine convention)
- AP-57. escape-literal-dollar: walked (scripted sweep: no unescaped `$`)
- AP-58. snake-case-symbols: walked
- AP-59. constraint-as-blockquote: walked
- AP-60. local-rule-as-note: walked
- AP-61. factor-repeated-paths: walked (walk3 D3 closed: yaml-authoring reads the schema from `workflow-server://schemas` once)
- AP-62. bind-protocol-locals: walked
- AP-63. backtick-code-tokens: walked (walk3 D23 now falls under the new heading carve-out; only bare designators are D32)
- AP-64. boolean-id-shape: walked (`impact_revision_requested` is an affirmative predicate)
- AP-65. collection-id-shape: walked
- AP-66. io-id-shape: walked (walk3 D21 closed: `format_conventions`, `applicable_constructs`, `design_specification`; `scope_manifest_report` is head-noun-last)
- AP-67. rule-slug-shape: walked (new rules `a-step-binds-only-its-deviations`, `a-name-mismatch-is-closed-at-the-caller`, `content-preservation` are positive invariants)
- AP-68. technique-stage-agnostic: walked
- AP-69. no-activity-prose-rules: walked (no activity-level `rules:` on the surface)
- AP-70. capability-group-placement: walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| D1 | Contract | High | AP-34 `no-valueless-control-set` | workflow-design/activities/05-impact-analysis.yaml:86-92 (`record-impact-correction`, first `set`) | A control step (`kind: action`, no technique) sets `target: impact_correction` with no `value:`. Its `message` carries the derivation: "The correction the reader's reply to the impact review carries, appended to any earlier correction…". impact-analysis.md:20-22 and :51 read `{impact_correction}` on the `revise` re-run, so the value propagates. The sibling convention in work-package (10-post-impl-review.yaml:150-159) binds a technique after a "reply carries" option. | diff | Bind a technique whose output is `impact_correction` and whose Protocol owns the append, or give the `set` a `value:`. Delete the value-less set. |
| D2 | Hygiene | Low | AP-26 `no-rationale-in-description` | 05-impact-analysis.yaml:92 (action `message`) | "…, so the next impact pass reads it from the bag." Names the consumer. Deleting the clause leaves the set's content intact. | diff | Delete the so-clause. |
| D3 | Hygiene | Low | AP-52 `brace-declared-ids` (c) | 05-impact-analysis.yaml:23 (`impact_revision_requested` description) | "…that reply's correction landing in \`impact_correction\`": a declared variable in backticks, not braces. 01-intake-and-context.yaml:16 braces the same kind of reference (`{user_description}`). | diff | Write `{impact_correction}`. |
| D4 | Contract | Medium | AP-48 `brace-output-references` | workflow-authoring/techniques/workflow-definition/scope-definition.md:62-65 (Protocol 2) | Phase 2 enumerates the files and says "Set `{file_count}` to the number of entries". No phase produces `{scope_manifest}` by name. Phase 5 (:77) reads it ("Render the file table from `{scope_manifest}`"), and the drafting loop iterates it. The branch moved the only producing line ("Fold … into `{scope_manifest}`") into the report render. The design twin (scope-definition.md:59) reads "capture as `{scope_manifest}`". | diff | Write "…; capture the entries as `{scope_manifest}`" and "the number of entries in `{scope_manifest}`". |
| D5 | Contract | Medium | AP-48 `brace-output-references` | workflow-design/techniques/verify-high-findings.md:26-37 (Protocol 1-3) | The Protocol no longer names `{verified_findings}`. The branch deleted Phase 4, the only line that did. Phases 1-3 say "Record the re-derivation evidence for each High", "Withdraw…", "spot-confirm…". The output feeds 08's `persist-verified-findings` (:271-278), `classify-audit-findings` and `apply-audit-fixes`. The authoring twin's Phase 4 reads "Emit `{verified_findings}` …". | diff | Add a closing bullet: "Assemble `{verified_findings}` from the recalibrated Highs and confirmed Mediums." |
| D6 | Hygiene | Low | AP-62 `bind-protocol-locals` (b) | workflow-design/techniques/scope-definition.md:71 (Protocol 6) | "Render … with `{$structural_design}` and `{$drafting_order}`". The reads wear `$`. At the base the same bullet read `{structural_design}` and `{drafting_order}`. Now the binds at :63 and :67 are never read in bare form. | diff | Read them as `{structural_design}` and `{drafting_order}`. |
| D7 | Hygiene | Low | AP-26 `no-rationale-in-description` | meta/techniques/workflow-engine/present-checkpoint-to-user.md:26 (Protocol 1) | "…for the active checkpoint, whose softness phase 2 reads and whose message and options phase 5 puts to the user." The clause names what consumes the payload and restates the phase order. | diff | Keep "Call `present_checkpoint { session_index }` for the active checkpoint". |
| D8 | Contract | Medium | AP-55 `hoist-shared-inputs` | workflow-design/techniques/context-loading.md:12 (added) plus assemble-file-approach.md:16, create-completion-doc.md:12, review-drafted-file.md:16, review-draft-yaml.md:16, and off-surface derive-design-dimensions, synthesize-update-specification, prepare-workflow-branch, readme-authoring. Authoring: `operation_type` on review-drafted-file, derive-workflow-branch, create-completion-doc, readme-authoring, and `scope_manifest` on compose-publication:12, create-completion-doc:16, readme-authoring:16, scope-verification:12 | Nine workflow-design leaves declare the input `operation_type`. The branch added the ninth, on context-loading. The container `techniques/TECHNIQUE.md` declares none. In workflow-authoring, four leaves declare each of `operation_type` and `scope_manifest`, and the root `TECHNIQUE.md` declares neither. The two-or-three-leaf carve-out does not reach either count. The descriptions drift ("The classified technique" / "The classified operation"). | diff (context-loading) / pre-existing (rest) | Declare each input once on the library's `TECHNIQUE.md` and delete the leaf declarations. The producers (intake-classification, scope-definition) keep their Outputs. |
| D9 | Hygiene | Low | Entry identity | canon/resources/anti-patterns.md:1606, :1618, :1630, :1642 | `### MR-1. cut-comment-jsdoc-verbosity` … `### MR-4. no-parallel-runbook-when-setup-covers-it`. The title form is `### AP-XX. name` in file order. | pre-existing | Retitle them as AP entries in file order and renumber what follows. The entry names are what gets cited, so no citation changes. |
| D10 | Hygiene | Low | AP-26 `no-rationale-in-description` | meta/techniques/fan/retire-branch.md:26, :33; fan/spawn-branches.md:34, :38, :42; fan/enter-fan.md:55; workflow-engine/present-checkpoint-to-user.md:35, :47; workflow-engine/activity-worker.md:45; workflow-design/techniques/intake-classification.md:86; workflow-authoring/…/compile-report.md:40, compose-publication.md:56, create-completion-doc.md:74, :78, scope-verification.md:46, readme-authoring.md:46, verify-high-findings.md:67 | Why- and consumer-clauses in I/O descriptions, procedure bullets and Rules. Examples: "selecting that branch's return is work the caller cannot express at the bind site"; "Retiring a branch against another branch's return is the failure this selection exists to prevent…"; "so entering a fan cannot half-happen"; "This stops a dead link being published; it does not make an artifact available sooner"; "there being no existing definition to snapshot"; "Read by later steps of the same run as much as by a person, so…"; "because a re-derivation that has read the argument…". activity-worker:45 "the dispatch stub carries identity bindings only" is also untrue: the continuation stub carries `{checkpoint_reply}` (compose-prompt:43). | pre-existing | Delete each clause. Keep the constraint it qualifies. |
| D11 | Hygiene | Low | AP-42 `io-agnostic-contract` | workflow-design/techniques/assemble-file-approach.md:22, :26; review-drafted-file.md:36 | "Whether the reader asked at impact analysis…, so the decision is honoured at drafting rather than raised again once a removal is detected"; "`none` where no pattern analysis ran, which is the update path"; "not already inventoried during impact analysis". Each names an activity or a path position. | pre-existing | Describe the value: "Whether flagged content must survive the change"; "`none` where no pattern comparison exists"; "not already in the removals inventory". |
| D12 | Hygiene | Low | AP-68 `technique-stage-agnostic` | workflow-design/techniques/verify-high-findings.md:8 (Capability), :45-47 (`verify-before-remediation`) | "…verification before remediation"; "Verification precedes remediation." These name a position in the flow. | pre-existing | Delete the ordering. Keep "Only findings that survive this pass are eligible to drive fixes". |
| D13 | Hygiene | Low | AP-62 `bind-protocol-locals` (b) | workflow-design/techniques/review-drafted-file.md:43 (Protocol 1) | `{$removal_inventory}` is bound and never read. `{has_unflagged_removals}` is set from the comparison directly. | pre-existing | Drop the bind, or read `{removal_inventory}` in the `has_unflagged_removals` clause. |
| D14 | Hygiene | Low | AP-52 `brace-declared-ids` (c) | meta/techniques/workflow-engine/compose-prompt.md:43 (Protocol 2) | "…carrying the \`checkpoint_reply\` substitution". `checkpoint_reply` is now this leaf's own declared input (:24), not a member of `{substitutions}`, and resume-worker.md:34 passes it as `{checkpoint_reply}`. | pre-existing (line); the diff made it a leaf input | Write "carrying `{checkpoint_reply}`". |
| D15 | Hygiene | Low | AP-34 `no-valueless-control-set` | workflow-design/activities/10-post-update-review.yaml:136-141, :148-153, :197-199, :252-254 | Value-less sets whose `message` states the value and the derivation: "Set false — this pass's audit is already clean…"; "Set true when review_findings_count is greater than 0…". This is the walk3 D14 class in a closure file D14 did not list. | pre-existing | Give each set a `value:` (or a technique output). Delete the prose. |
| D16 | Hygiene | Low | AP-30 `role-rules-not-description`; AP-41 `avoidance-voice-in-definitions` | 10-post-update-review.yaml:4 (description), :264-266 (outcome) | "(never asks accept/iterate/revert)" prescribes worker behaviour in a description. "findings never wait on an accept/iterate/revert choice"; "rather than a second pass over the whole definition tree"; "was checked, not assumed". | pre-existing | Move the no-ask constraint to structure. It already holds: the activity has no checkpoint. Rewrite the outcomes to the value delivered. |
| D17 | Hygiene | Low | AP-46 `no-resource-caller-backlink` | workflow-design/resources/draft-attestation.md:10, :32; applicable-constructs.md:10; work-package/resources/workflow-retrospective.md:42, :86 | "Batch review surface before quality-review / commit"; "if review-drafted-file found any"; "short enough for a gate skim"; "reviewed as a whole at the close-out gate — there is no per-item interview, because…". These give the host position, a producer and gate topology. | pre-existing | State what the resource is. Drop the caller, stage and gate clauses. |
| D18 | Hygiene | Low | AP-44 `artifact-name-in-io` | workflow-design/techniques/create-completion-doc.md:38 (Protocol 2) | "…do not restate design-decision / alternatives essays in COMPLETE.md". A filename literal in Protocol. `COMPLETE.md` lives on the `#### artifact` of `{completion_document}`. | pre-existing | Write "in `{completion_document}`". |
| D19 | Hygiene | Low | AP-40 `readme-orients-not-transcribes` | work-packages/README.md:85; substrate-node-security-audit/README.md:174, :290; prism-audit/techniques/README.md:41 | "Three are **technique groups**…" is an inventory count. "synthesized by `get_activity`" and "Resources are addressed by bare slug via `get_resource` (e.g. `resource_id: …`)" are loader HOW. "(gates the no-security-characteristics checkpoint)" transcribes a gate. | pre-existing | Delete the count, the loader HOW and the gate note. |
| D20 | Hygiene | Low | AP-54 `anchored-protocol-references` | workflow-authoring/techniques/workflow-definition/scope-definition.md:69, :73 (Protocol 3, 4) | "the structural-design section the guide declares", "the drafting-order section the guide declares". The resource is named without its hyperlink in the step. The design twin links [scope-manifest](…#template) in each. | pre-existing | Link [Template](../../resources/scope-manifest.md#template) in each step. |
| D21 | Hygiene | Low | AP-32 `outcome-names-value` | workflow-design/activities/11-retrospective.yaml:51 | "A completion summary records what the session delivered, the key design decisions and alternatives rejected, and known limitations". It re-lists the file's contents. | pre-existing | Rewrite as the value, e.g. "A later reader learns what the session delivered and what it left open without replaying it". |
| D22 | Hygiene | Low | AP-60 `local-rule-as-note` | meta/techniques/workflow-engine/respond-checkpoint.md:36-38 | `verify-auto-advance-on-resolve`: only Protocol 1 cites it. | known — not fixed (walk3 D4) | Demote it to a `>` note under Protocol 1. |
| D23 | Hygiene | Low | AP-48 `brace-output-references` | meta/techniques/workflow-engine/continue-batch.md:52 | "return that identity with the replacement's envelope" | known — not fixed (walk3 D5) | "return `{worker_agent_id}` and the replacement's envelope as `{worker_result}`". |
| D24 | Hygiene | Low | AP-26 `no-rationale-in-description` | fan/enter-fan.md:18, :26, :40; workflow-engine/continue-batch.md:34, :62; variable-binding.md:43, :49; workflow-engine/compose-prompt.md:60 | "Passed through unread: the server expands it, so…"; "Required: an exit the graph fans has to say…"; "The order every later pass over them follows"; "one identity covers several activities, and an unattributed manifest credits any agent"; "the other two are named so a reader who meets them…"; "a paraphrase drifts from the artifact that records it". continue-batch's `step_manifest` clause is gone with the input. | known — not fixed (walk3 D7) | Delete the clauses. |
| D25 | Hygiene | Low | AP-26 | workflow-design/workflow.yaml:19 | "…so a later activity reads the specification rather than re-deriving it" | known — not fixed (walk3 D8) | Delete the so-clause. |
| D26 | Hygiene | Low | AP-40 | substrate-node-security-audit/README.md:18; work-package/activities/README.md:85, :93, :101, :109; prism-audit/README.md:48; workflow-design/README.md:105, :160 | "report generation is entered only when the dispatch, verification, and merge gates are set"; "the apply path is gated out"; "When no critical blocker is found it closes by settling…"; "When it cannot, … the suite is skipped"; "In stealth mode the fragment issue-reference check is skipped"; "the `confirm-scope` checkpoint can loop back"; "(while-loop via `has_resolvable_assumptions`); open judgements batch into Gate 2". The branch fixed "the PR lifecycle is gated out entirely". | known — not fixed (walk3 D9, D10) | Delete the gate and loop transcription. Keep role and connections. |
| D27 | Hygiene | Low | AP-41 | substrate-node-security-audit/README.md:28, :228; prism-audit/README.md:21, :22, :78; prism-audit/techniques/README.md:5, :78; meta/activities/03-dispatch-client-workflow.yaml:46; workflow-design/activities/01-intake-and-context.yaml:238; 03-requirements-refinement.yaml:174 | "(now) the `gitnexus` capability"; "does not build on prism by design"; "can no longer be skimmed past"; "not a wall of raw analysis"; "instead of a one-size-fits-all…"; "not assigned intuitively"; "it does not restate protocols"; "not authored here"; "rather than once an activity"; "instead of falling back to prose"; "not interviewed mid-flow" | known — not fixed (walk3 D11, D12, D13) | Rewrite each to what holds. |
| D28 | Contract | Medium | AP-34 | workflow-design/activities/01-intake-and-context.yaml:69-71; 03-requirements-refinement.yaml:81-83; 06-scope-and-draft.yaml:340-352, :376-387; 08-quality-review.yaml:283-288, :335-340; workflow-authoring/activities/06-scope-and-draft.yaml:101-103; 09-validate-and-commit.yaml:162-164 | Value-less control sets carrying their derivation in `message` | known — not fixed (walk3 D14) | Bind an owning technique or give a `value:`. |
| D29 | Hygiene | Low | AP-28 `no-sequence-in-description` | workflow-design/activities/03:4, 06:4, 09:4; workflow-authoring/activities/06:4, 09:4 | Step sequences in `description` | known — not fixed (walk3 D15) | Keep a purpose clause. |
| D30 | Hygiene | Low | AP-32 | workflow-design/activities/01-intake-and-context.yaml:236 | "Derive-first intent lands gap flags and `{headless_mode}`…; Gate 1 fires only when…" | known — not fixed (walk3 D16) | Rewrite as the value. |
| D31 | Hygiene | Low | AP-54 | meta/techniques/fan/enter-fan.md:50 | `[sync-progress-status](./sync-progress-status.md)`: no such file under `fan/` | known — not fixed (walk3 D17) | Link `../workflow-engine/sync-progress-status.md`. |
| D32 | Hygiene | Low | AP-63 `backtick-code-tokens` | meta/techniques/workflow-engine/commit-and-persist.md:20 | `(*activity_id*={activity_id}, *planning_folder_path*={planning_folder_path}, …)` | known — not fixed (walk3 D24) | Wrap the designators in code spans. |
| D33 | Hygiene | Low | AP-53 `dotted-rule-address` | workflow-design/techniques/context-loading.md:46, :54; intake-classification.md:81 | Heading hyperlinks to `resource-loading-via-tool` and `no-domain-work` | known — not fixed (walk3 D18) | `workflow-engine.resource-loading-via-tool`. State the no-domain-work fact plainly. |
| D34 | Hygiene | Low | AP-68 | workflow-design/techniques/reconcile-design-assumptions.md:60, :74; workflow-authoring/…/scope-definition.md:84 | "durable evidence for Gate 2 batch disposition"; "remain activity-bound elsewhere"; "so a file discovered mid-draft returns here" | known — not fixed (walk3 D19) | Delete the gate, stage and routing clauses. |
| D35 | Hygiene | Low | AP-42 | workflow-design/techniques/persist-design-specification.md:14, :34 | "from the dimension capture on a create run or the update synthesis on an update run"; "(create elicitation or update synthesis)". The `step_manifest` sites of walk3 D20 are fixed. | known — not fixed (walk3 D20) | Describe the value only. |
| D36 | Hygiene | Low | AP-65 `collection-id-shape` | workflow-design/workflow.yaml:36; 06:88, :166; workflow-authoring/workflow.yaml:28; 06:43, :131 | `scope_manifest` is a singular id for the collection the drafting loop iterates | known — not fixed (walk3 D22) | Rename to a plural item noun. |
| D37 | Hygiene | Low | AP-62 (b) | workflow-design/techniques/intake-classification.md:94 | `{$design_intent}` is bound and never read | known — not fixed (walk3 D25) | Drop the bind or read it. |
| D38 | Hygiene | Low | AP-52 (c) | meta/techniques/workflow-engine/take-activity.md:31 (note) | "`from_activity`, `exit_id` and `step_manifest` are all unset together" | known — not fixed (walk3 D26) | Brace all three. |
| D39 | Hygiene | Low | AP-59 `constraint-as-blockquote` | commit-and-persist.md:20 (last sentence), :41; finalize-activity.md:82 | Caveats and error paths inside the step sentence | known — not fixed (walk3 D27) | Move each to a `>` note. |
| D40 | Hygiene | Low | AP-70 `capability-group-placement` | workflow-authoring/techniques/ | `workflow-definition/` is the workflow's whole technique set | known — not fixed (walk3 D28) | Flatten, with the contract on the root `TECHNIQUE.md`. |

High findings checked against the cited files and entries:
- D1 reproduced. 05:86-92 is a `kind: action` step with a `set` of `impact_correction` that has `target` and `message` and no `value:`. The message states how the value is sourced. The value is a domain payload that impact-analysis.md reads on the re-run. Kept at High because the construct is new and its value propagates.
- D4 and D5 were weighed at High and kept at Medium. The Outputs declaration still names each value, so a worker can land it. The defect stays in the Protocol construct.
- None withdrawn.

Closed since walk3: D1, D2, D3, D6, D21 and D23 (D23 by the new AP-63 carve-out). Also closed: walk3 D7's continue-batch `step_manifest` clause, walk3 D10's "PR lifecycle is gated out entirely", and walk3 D20's `step_manifest` sites on continue-batch and take-activity.

Focus contracts checked by hand, not flagged in this slice:
- `checkpoint_reply`. Three leaves declare it: activity-worker, compose-prompt and resume-worker. That is within the `hoist-shared-inputs` carve-out, and respond-checkpoint outputs it. activity-loop.yaml:184-191 clears it after `resume-yielded-worker` in the same iteration, so no later dispatch in that walk sees it.
- `exit_id` and `step_manifest` are on the workflow-engine container. dispatch-activity, continue-batch and take-activity no longer redeclare them. enter-fan (in the `fan` group, whose `TECHNIQUE.md` declares no inputs) declares both, which is lawful.
- `written_artifact` binds. Design 03 `specification_path`, design 06 `drafting_plan_path`, `file_review_note_path` and `draft_attestation_path`, and 08 `enforcement_findings_path` in the fix cycle are each bound on the save step before any gate message links them. `format_conventions_path`, `applicable_constructs_path` and `verified_findings_path` have no remaining reader.
- `scope_manifest_report` is output by both scope-definition twins, carries `#### artifact scope-manifest.md`, and is written by both 06 save steps.
- The removed rule `binding-carries-only-deviations` is cited nowhere.

Out-of-slice observations for the caller (each checked by hand; none is an entry of this slice):
- **Live, pre-existing.** workflow-authoring/activities/09-validate-and-commit.yaml:145-164. The `remediate` option exits `remediation-selected`, which is `immediate: true` (:271-273). The engine sets `ends_activity` from `binding.immediate` (src/tools/workflow-tools.ts:778), so `bump-remediation-round` (:158-164) never runs. As a result `remediation_round` stays 0, 08's `when: remediation_round > 0` steps never author a fix, and the `remediation_round < 3` bound never trips. The design 05 fix in this round (removing `immediate` from `revise`) is the pattern to apply here.
- **Contract, systemic.** `respond_checkpoint` accepts only `option_id` / `auto_advance` / `condition_not_met` (workflow-tools.ts:2763-2771), and `checkpoint_reply` carries no free text. No declared path takes a correction's text to the worker running D1's step. The corpus-wide "the reply carries …" option convention (work-package 03, 10, 13, residual-assumption-interview) relies on the same undeclared channel.
- **Live, pre-existing.** workflow-design/activities/11-retrospective.yaml:27-45 writes `completion_document` and `retrospective_document` to the same `completion.md`. create-completion-doc declares `COMPLETE.md`.
- **Stale restatement, diff.** persist-design-specification keeps the name `persist-` and the Capability "Durable planning-folder review surface", but it now only assembles `{design_specification}`.
- **Pre-existing.** context-loading.md:46 says the URI serves "five … (workflow, activity, technique, condition, state)". The server serves session-file, not state, and the construct inventory (:15) now names four.
- **Ledger, pre-existing.** Several unserved-operation-ref site line numbers no longer match their files. For example, `corpus/workflow-design/techniques/assemble-file-approach.md:52` points into a 48-line file, and `enter-fan.md:46` names the link that is now at :50.
- **Diff.** work-packages/README.md lost its per-activity Mermaid diagrams. `readme-orients-not-transcribes` exempts diagrams, so their removal is a `preserve-readme-content` question.
- **Minor, diff.** design 08 `refresh-enforcement-findings` runs only when the count is above 0. A re-audit that clears to 0 leaves `enforcement_findings_path` pointing at the earlier file.

## Files

- canon/resources/anti-patterns.md: read
- canon/resources/schema-construct-inventory.md: read
- meta/activities/03-dispatch-client-workflow.yaml: read
- meta/activities/04-end-workflow.yaml: read
- meta/routines/activity-loop.yaml: read
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
- meta/techniques/workflow-engine/resume-from-checkpoint.md: read
- meta/techniques/workflow-engine/resume-worker.md: read
- meta/techniques/workflow-engine/take-activity.md: read
- meta/techniques/workflow-engine/yield-checkpoint.md: read
- prism-audit/README.md: read
- prism-audit/techniques/README.md: read
- prism-update/activities/README.md: read
- substrate-node-security-audit/README.md: read
- work-package/README.md: read
- work-package/activities/README.md: read
- work-packages/README.md: read
- workflow-authoring/activities/06-scope-and-draft.yaml: read
- workflow-authoring/techniques/workflow-definition/impact-analysis.md: read
- workflow-authoring/techniques/workflow-definition/scope-definition.md: read
- workflow-authoring/techniques/workflow-definition/yaml-authoring.md: read
- workflow-design/README.md: read
- workflow-design/activities/01-intake-and-context.yaml: read
- workflow-design/activities/03-requirements-refinement.yaml: read
- workflow-design/activities/05-impact-analysis.yaml: read
- workflow-design/activities/06-scope-and-draft.yaml: read
- workflow-design/activities/08-quality-review.yaml: read
- workflow-design/resources/applicable-constructs.md: read
- workflow-design/resources/draft-attestation.md: read
- workflow-design/resources/impact-analysis.md: read
- workflow-design/techniques/TECHNIQUE.md: read
- workflow-design/techniques/assemble-file-approach.md: read
- workflow-design/techniques/audit-rule-enforcement.md: read
- workflow-design/techniques/context-loading.md: read
- workflow-design/techniques/impact-analysis.md: read
- workflow-design/techniques/intake-classification.md: read
- workflow-design/techniques/persist-design-specification.md: read
- workflow-design/techniques/reconcile-design-assumptions.md: read
- workflow-design/techniques/review-draft-yaml.md: read
- workflow-design/techniques/review-drafted-file.md: read
- workflow-design/techniques/scope-definition.md: read
- workflow-design/techniques/verify-high-findings.md: read
- workflow-design/techniques/yaml-authoring.md: read
- ledgers/binding-fidelity-triage.json: read (note, rationales, the changed entry, and every entry whose site is a surface file)
- ledgers/unserved-operation-ref-triage.json: read (note, the removed entry, and every entry whose site is a surface file)
- meta/techniques/fan/retire-branch.md: read
- meta/techniques/workflow-engine/respond-checkpoint.md: read
- prism-audit/activities/02-execute-analysis.yaml: read
- prism-evaluate/activities/02-execute-analysis.yaml: read
- work-package/activities/10-post-impl-review.yaml: read
- work-package/resources/workflow-retrospective.md: read
- workflow-authoring/activities/08-quality-review.yaml: read
- workflow-authoring/activities/09-validate-and-commit.yaml: read
- workflow-authoring/techniques/workflow-definition/compile-report.md: read
- workflow-authoring/techniques/workflow-definition/compose-publication.md: read
- workflow-authoring/techniques/workflow-definition/create-completion-doc.md: read
- workflow-authoring/techniques/workflow-definition/readme-authoring.md: read
- workflow-authoring/techniques/workflow-definition/scope-verification.md: read
- workflow-authoring/techniques/workflow-definition/verify-high-findings.md: read
- workflow-authoring/workflow.yaml: read
- workflow-design/activities/09-validate-and-commit.yaml: read
- workflow-design/activities/10-post-update-review.yaml: read
- workflow-design/activities/11-retrospective.yaml: read
- workflow-design/techniques/apply-audit-fixes.md: read
- workflow-design/techniques/create-completion-doc.md: read
- workflow-design/techniques/publish-workflow-pr.md: read
- workflow-design/techniques/scope-audit.md: read
- workflow-design/techniques/scope-verification.md: read
- workflow-design/workflow.yaml: read
