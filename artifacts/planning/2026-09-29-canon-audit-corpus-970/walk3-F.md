# Walk 3 F: anti-patterns.md (Overview, Entry identity, Canon Hygiene, Technique Protocol, Draft Hygiene)

- **Branch:** `workflow/canon-audit-residuals`, worktree /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals.
- **Base:** `166718d6`.
- **Canon home:** corpus/canon/resources/anti-patterns.md on that worktree. This branch does not touch it.
- **Engine consumer checks:** /home/mike1/projects/dev/workflow-server/.worktrees/schema-description-hygiene: src/tools/workflow-tools.ts, src/tools/resource-tools.ts, src/loaders/technique-loader.ts, src/schema/variable.schema.ts.

## Units

- Overview (catalogue overview and Creation Rules). Walked. This branch edits no catalogue entry. The one Creation Rule that reaches authored content is "Audit technique boundary". It was applied to the audit techniques on the surface: audit-rule-enforcement and reconcile-design-assumptions. Neither restates a Detect or a Fix.
- Entry identity: walked
- AP-103. cited-home-owns-claim: walked
- AP-104. operative-criteria-need-a-home: walked
- AP-105. no-shadow-audit-pass: walked
- AP-106. canon-layer-cites-not-restates: walked
- AP-107. bind-site-is-orchestration-truth: walked
- AP-108. numbered-protocol-phases: walked
- AP-109. technique-outputs-declared: walked
- AP-110. duplicate-shared-capability: walked
- AP-111. contract-not-procedure: walked
- AP-112. no-derived-state-shadow: walked
- AP-113. session-interaction-in-technique: walked
- AP-114. pass-orchestration-in-technique: walked
- AP-115. platform-semantics-in-capability: walked
- AP-116. no-template-creation-guide: walked
- AP-117. no-engine-mechanics-as-rules: walked
- AP-118. no-bind-mechanics-as-prose: walked
- AP-119. procedure-in-io-contract: walked
- AP-120. procedure-in-capability: walked
- AP-121. rule-as-protocol-step: walked
- AP-122. prompt-restates-owned-mechanics: walked
- AP-123. capability-as-op-inventory: walked
- AP-124. alternate-ops-as-protocol-sequence: walked
- AP-125. technique-ref-in-io-contract: walked
- MR-1. cut-comment-jsdoc-verbosity: walked. The YAML comments in activity-loop.yaml (:149–151, :195–197) and workflow-design/workflow.yaml (:22–26, :31–32) state non-local coupling, which the entry exempts.
- MR-2. no-dense-prose-after-config-examples: walked
- MR-3. worktree-root-placeholders: walked
- MR-4. no-parallel-runbook-when-setup-covers-it: not-applicable. The entry flags "Parallel runbooks that restate clone/install/build/start already in SETUP", and no surface file carries one.
- AP-126. variable-description-one-line: walked
- AP-127. bag-value-as-literal: walked
- AP-128. unproduced-value-read: walked
- AP-129. stale-restatement-after-change: walked
- AP-130. artifact-name-is-filename: walked
- AP-131. resource-id-names-its-content: walked
- AP-132. deployment-path-in-capability: walked
- AP-133. overlapping-rule-scopes: walked
- AP-134. whole-resource-for-one-section: walked
- AP-135. tool-contract-restated-in-protocol: walked
- AP-136. phase-cited-by-ordinal: walked
- AP-137. unowned-harness-capability: walked
- AP-138. output-without-destination: walked
- AP-139. framing-outside-any-section: walked. Every touched resource with anchored citers was checked: both impact-analysis guides, both scope-manifest guides, design-assumptions and format-conventions. Their H1 framing is orientation only, so the verdict is not raised.
- AP-140. declared-input-never-read: walked
- AP-141. apply-omits-declared-input: walked
- AP-142. branch-on-undeclared-threshold: walked
- AP-143. inherited-rules-re-enumerated: walked
- AP-144. reference-without-provenance: walked
- AP-145. pre-session-prose-defers-to-the-framework: not-applicable. The entry covers "a surface delivered before a session exists — the `discover` bootstrap procedure", and no bootstrap surface is on the change surface.
- AP-146. instruction-narrates-an-actor: walked
- AP-147. rule-binds-beyond-its-operation: walked
- AP-148. inherited-input-re-declared: walked
- AP-149. schema-semantics-restated: walked
- AP-150. engine-internals-narrated: walked
- AP-151. value-set-in-prose: walked
- AP-152. one-invariant-per-rule: walked
- AP-153. call-omits-conditionally-required-argument: walked. Each call signature on the touched engine techniques was checked against the handler parameters in workflow-tools.ts and resource-tools.ts.
- AP-154. call-omits-required-argument: walked
- AP-155. call-names-an-undeclared-argument: walked
- AP-156. protocol-phase-as-list-item: walked
- AP-157. unreachable-operation-reference: walked
- AP-158. produce-path-without-a-reading: walked
- AP-159. construct-folder-without-a-readme: walked
- AP-160. relocation-without-a-preserved-outcome: walked
- AP-161. unproducible-declared-value: walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| F1 | Live | High | AP-128 unproduced-value-read | workflow-design/activities/01-intake-and-context.yaml:191–198 `persist-format-conventions` `inputs.artifact_content: format_conventions`; :199–207 `persist-applicable-constructs` `inputs.artifact_content: applicable_constructs` | Nothing in the corpus produces or declares either name (`grep -rnw` finds only these two binds). context-loading.md declares only `format_conventions_path` and `applicable_constructs_path`, and persists both files itself in phases 6–7 (create only). Under variable-binding.md:24, a bare name that does not resolve in the bag is a literal. write-artifact therefore writes the string "format_conventions" into format-conventions.md: over the file context-loading wrote on create, and as a new file on update, where context-loading skips. applicable-constructs.md gets the same on create. The branch edited this step, adding `when: operation_type != 'review'` in b89a58f2, a commit whose subject is "write each report through its save step". It applied that model to 05, 04, 06 and 08, but not here. | pre-existing bind, in a step this branch edited | On context-loading, declare `### format_conventions` and `### applicable_constructs` (the content). Drop its self-persist phases and remap `written_artifact` to the two `*_path` variables, as done for 05. Gate the format-conventions save to create, matching the technique, or delete both save steps |
| F2 | Live | Medium | AP-128 unproduced-value-read | workflow-design/activities/03-requirements-refinement.yaml:117–124 `persist-design-specification-artifact` `inputs.artifact_content: design_specification` | No producer or declaration anywhere. persist-design-specification.md declares only `specification_path` and persists the file itself in phase 2. write-artifact then updates design-specification.md in place with the literal "design_specification". That is the file `spec-confirmed` (:127) and Gate 2 (09-validate-and-commit.yaml:170) link. It is the same defect as walk-F F17, which this branch fixed at 05, in a file this branch touched (it added the `accumulated_design` write). | pre-existing | Declare the specification content as an output of persist-design-specification, bind it here, and remap `written_artifact` to `specification_path`. Otherwise delete the redundant save step |
| F3 | Contract | Medium | AP-160 relocation-without-a-preserved-outcome | workflow-design/techniques/scope-definition.md:28 and :65–67 against 06-scope-and-draft.yaml:88–90, :127–135, :166, and workflow.yaml:36 | Persisting moved from the technique (base phase 6, "Persist {scope_manifest} together with {$structural_design} and {$drafting_order}") to the save step. To feed that step, `scope_manifest` now "Carries the structural design and drafting order sections alongside the table", folded "at the shape [scope-manifest] declares". The variable stays `type: array` ("List of files to create, modify, or remove"), and `file-drafting-loop` still iterates `over: scope_manifest` reading `{current_file.type}`. scope-verification and scope-audit also walk its items. Neither site states the file-list outcome those consumers still need. The workflow-authoring twin carries the same shape (pre-existing there). | diff | Keep `scope_manifest` as the file list the loop iterates, and give the save step a separate declared report output, or declare and iterate a distinct file-list value |
| F4 | Contract | Medium | AP-160 relocation-without-a-preserved-outcome | workflow-design/activities/08-quality-review.yaml:322–324 (`re-audit-rule-enforcement` in `audit-fix-cycle`); audit-rule-enforcement.md:42–45 | The base phase "3. Persist Findings" became "3. Assemble Findings". The only save is now `persist-enforcement-findings` (:247–257), outside the fix loop. Each re-audit inside the loop reassembles `{enforcement_findings}`, and nothing writes it, so enforcement-findings.md keeps the first pass. The three sibling re-audits (expressiveness, conformance, rule-hygiene) still self-persist, so their satellites are refreshed. | diff | Add a gated save of `enforcement_findings` inside `audit-fix-cycle` after the re-audit, or state at the step that the satellite records the first pass only |
| F5 | Contract | Low | AP-160 relocation-without-a-preserved-outcome | meta/techniques/variable-binding.md:41–43, :61–63 (base: prescriptive `binding-carries-only-deviations`, `generic-not-overfit`, the qualification sentence of `activity-group-shorthand`) → workflow-authoring/techniques/workflow-definition/yaml-authoring.md:71–81 | At base these standards reached every worker applying variable-binding. They now live only in workflow-authoring's yaml-authoring. workflow-design's own drafting technique, yaml-authoring.md, is bound at 06:213, :261, :301 and 08:306 and carries none of them. Neither site states that the audience narrowed. workflow-design is deprecated, but the branch still edits its drafting surface. | diff | State at the receiving rules that they bind workflow-authoring only, or add them to the workflow-design twin |
| F6 | Hygiene | Low | AP-119 procedure-in-io-contract (also `instruction-narrates-an-actor`) | meta/techniques/workflow-engine/evaluate-transition.md:36 `### activity_exit` | "The exit id taken, passed to `next_activity` as `exit`. Unset where the activity declares no exit, and the call then carries no `exit`." This is a consumer duty and a conditional duty on another actor's call. cc2462a1 wrote the second sentence. The finalize-activity twin (:72) was cut to "The exit id this activity took; unset where it declares none." | diff | Use the finalize wording |
| F7 | Hygiene | Low | AP-146 instruction-narrates-an-actor | meta/techniques/workflow-engine/TECHNIQUE.md:26 container `### checkpoint_reply` | "The reply the server returned on clearing a checkpoint this context yielded." The container merges into orchestrator-side techniques: compose-prompt reads it (:39), resume-worker passes it (:30), and respond-checkpoint produces it. For all three the checkpoint was yielded by the worker, not by "this context". The base compose-prompt entry was true for the orchestrator ("A resolved checkpoint's reply. Present only when the stub continues a worker past a gate"). | diff | "The reply the server returned on clearing a yielded checkpoint; present only on a continuation past that gate" |
| F8 | Hygiene | Low | AP-146 instruction-narrates-an-actor | meta/techniques/workflow-engine/activity-worker.md:55 rule `follow-bundled-rules` | "…the orchestrator's boundaries are not a worker's to read." The clause describes another actor's boundaries, which the worker is neither served nor able to act on. The instruction is complete without it. 26430409 rewrote it when it dropped the orchestrator-conduct link. | diff | Delete the clause |
| F9 | Hygiene | Low | AP-129 stale-restatement-after-change | workflow-design/README.md:117 (Techniques table, `pattern-analysis` row) | "Extract patterns from reference workflows and persist the comparison." b89a58f2 removed the technique's persist phase and its `pattern_analysis_path` output. The activity's write-artifact step now persists. | diff | "Extract patterns from reference workflows into the comparison" |
| F10 | Hygiene | Low | AP-129 stale-restatement-after-change | work-package/README.md:33 | "See activities/README.md for per-activity orientation (purpose, role, and a flow diagram)". bcf31337 removed every per-activity flow diagram from that README, which now has 0 mermaid blocks. | diff | Drop "and a flow diagram" |
| F11 | Hygiene | Low | AP-129 stale-restatement-after-change | meta/techniques/workflow-engine/commit-and-persist.md:50 rule `commit-after-activity` | "…MUST be committed and **pushed** before the exit to the next activity is evaluated." The worker evaluates the exit in finalize-activity phase 2 (evaluate-transition), before its envelope reaches the orchestrator that runs this technique. continue-batch.md:43 names the ordering that holds: `next_activity` "is the transition a commit has to precede". The branch's rewrite of "before evaluating transitions" made the stale ordering explicit. | diff | "…before the next `next_activity` call" |
| F12 | Hygiene | Low | AP-129 stale-restatement-after-change | prism-audit/README.md:112 ("The orchestrator manages transitions and triggers"); work-package/activities/README.md:21 ("Always transitions to codebase-comprehension"); meta/README.md:70, :127 (off surface) | Routing-as-transitions survivors. prism-audit/README.md was touched at :114. The work-package activities README was rewritten. | known — not fixed (walk2-F5 / walk-F F5) | Sweep to exits and the graph |
| F13 | Contract | Medium | AP-107 bind-site-is-orchestration-truth | work-packages/README.md:49 with the per-activity step and checkpoint diagrams at :55–180; substrate-node-security-audit/README.md:137–168 (sub-agent activity step flows) | :49 says "steps, checkpoints, loops, and exits live in the activity YAML" beside step lists not generated from `steps[]`. This is the construct the branch cut from fan-conformance and work-package. Both files were touched by bcf31337 (work-packages :69, :184–213; substrate :220). | pre-existing | Cut to one-line roles, or point at the YAML |
| F14 | Contract | Low | AP-107 bind-site-is-orchestration-truth | work-package/activities/README.md:13 (01), :117 (13), :125 (14) | The diagrams were cut, but these sections still enumerate each activity's ordered steps in prose. 01: "resolves … refreshes … verifies or creates … materializes … sets up … binds". 13: "Gates … then pushes … finalizes … hands off … marks … handles". 14: "creates an ADR … writes … conducts … verifies … removes … selects". | known — not fixed (walk-F F18; the diagrams are fixed, the step prose survives) | One-line role per activity |
| F15 | Hygiene | Low | AP-157 unreachable-operation-reference | workflow-design/techniques/TECHNIQUE.md:70 (`canonical-home-map`, a line this branch rewrote) and :91 (`line-budget`) | Both rules link [verify-artifact-conforms] and invoke no work. The site is ledgered `fix-later` (unserved-operation-ref-triage.json:2129). | known — not fixed (walk-F F19) | State the fact without the technique link |
| F16 | Hygiene | Low | Entry identity | workflow-design/techniques/reconcile-design-assumptions.md:39 | `[pass-orchestration-in-technique](/canon/resources/anti-patterns.md#ap-114-pass-orchestration-in-technique)` carries the entry number in its anchor ("Do not cite the number"), so a renumber breaks it. b89a58f2 rewrote this line. The inventory was moved to kebab-name citations in the same branch. | pre-existing | Cite `` `pass-orchestration-in-technique` `` in backticks, as the inventory now does |
| F17 | Hygiene | Low | AP-143 inherited-rules-re-enumerated | meta/techniques/workflow-engine/workflow-orchestrator.md:49 rule `orchestrator-worker-boundaries`; :53 rule `resolve-trace-at-close-out` | :49 lists seven dispatch-activity and continue-agent rules that the orchestrator already receives: sibling `follow-bundled-rules` (:41) commands the bundle, and dispatch-activity is a step of its run. The list omits others, such as `account-every-activity` and `say-what-a-dispatch-is-doing`. :53 reuses the cited rule's own name, so the short dotted address is ambiguous. | pre-existing (file touched) | Delete both entries |
| F18 | Contract | Medium | AP-141 apply-omits-declared-input | meta/techniques/workflow-engine/continue-batch.md:51 and resume-worker.md:34; continue-batch.md:60 | Both Apply continue-agent "with the composed prompt and `{session_index}`". Neither passes continue-agent's `agent_id` (continue-agent.md:12, the harness identifier of the agent to resume, with no optional marker). Neither applying technique declares it: both carry `worker_agent_id`, the server-side delivery identity. Separately, continue-batch :60 Applies compose-prompt with only `holds_prior_deliveries: false`, omitting the required `agent_technique` and `substitutions`, which resume-worker :43 names. | pre-existing | Name the omitted inputs at each Apply site. Declare the harness agent id where it has no home |
| F19 | Hygiene | Low | AP-150 engine-internals-narrated | meta/techniques/workflow-engine/resume-worker.md:45 (note moved from the deleted rule by 26430409); commit-and-persist.md:66 rule `session-files-ride-along` | "the stored answer, which is keyed by activity and checkpoint alone"; "`session.json` and `.session-token` are written by the server on every authenticated tool call". The orchestrator's calls are the same without either passage. | pre-existing text | Keep the invariants (the stored answer is reused and the steps before the gate re-run; both files are present and ride in the same commit). Drop the machinery |
| F20 | Hygiene | Low | AP-126 variable-description-one-line | workflow-design/activities/04-pattern-analysis.yaml:14 `pattern_adoption`; 03:33 `dimension_questions`, :37 `has_open_assumptions`, :41 `has_resolvable_assumptions`; 01:39 `intent_needs_confirmation`, :46 `operation_type_ambiguous`; 06:18, :82 and 08:24, :35, :43 "…from audit-X" | Examples: path wiring ("which is the whole of the update path — that route … never visits this activity"), producer tails ("(from prepare-dimension)", "from audit-rule-enforcement"), consumer and gate tails ("listed in the Gate 2 batch payload", "drives the … while-loop", "contributes to Gate 1"). These sit beside the 05 descriptions this branch trimmed (`preservation_required`, `removal_count` "…inventoried by impact-analysis" → "Count of inventoried content removals"). | pre-existing | One line naming the value, with the tails deleted |
| F21 | Hygiene | Low | AP-151 value-set-in-prose | workflow-design/activities/01-intake-and-context.yaml:41–43 and 08-quality-review.yaml:61–63 `operation_type` | "The classified operation for the request — create, update, or review", with no `values`. Every gate compares it against those three literals. | pre-existing | Declare `values: [create, update, review]` and cut the set from the prose |
| F22 | Hygiene | Low | AP-129 stale-restatement-after-change | workflow-design/resources/design-assumptions.md:19 (touched file); elicitation-guide.md:32 (off surface) | "structural (checkpoint / condition / validate)". bcf31337 widened principle 9 to "a checkpoint, a condition, a validate action, or an exit `when`", matching `structure-backed-constraints`. | pre-existing text | Add exit `when`, or cite principle 9 |
| F23 | Hygiene | Low | AP-120 procedure-in-capability | meta/techniques/workflow-engine/continue-batch.md:8 | "Reached only across an activity boundary; a gate answered by a user takes `resume-worker` instead." This puts sequencing and a mode branch, with a technique name, in Capability. The choice lives in activity-loop's step gates. | pre-existing (file touched) | Keep the product statement and delete the trigger clause |
| F24 | Hygiene | Low | AP-135 tool-contract-restated-in-protocol | meta/techniques/workflow-engine/compose-prompt.md:40 | "`context_tokens` is the agent's context window size and is **required**" restates the get_activity schema (its meaning and its required status). | pre-existing (file touched) | Drop the shape and keep the `activity_id` obligation |

**Highs:** F1 was re-derived from the files alone and holds:

- 01:196 and :205 bind the two names, and `grep -rnw format_conventions|applicable_constructs` over the whole corpus returns only those binds.
- context-loading.md:12 and :24 declare only the `*_path` outputs.
- variable-binding.md:24 makes an unresolved bare name a literal.
- write-artifact.md:49–50 updates an existing instance in place, or creates the file.
- workflow-design is deprecated and version-frozen, but the branch edits and ships this step, so the finding stays High.

No High was withdrawn or downgraded.

**Mediums spot-confirmed:**

- **F2:** `grep -rn design_specification corpus/workflow-design` returns the single bind at 03:123. persist-design-specification.md declares `specification_path` alone.
- **F3:** 06:88–90, :166 and :217, workflow.yaml:36–38, and scope-definition.md:28 and :67 were re-read.
- **F4:** `git diff 166718d6..HEAD` of audit-rule-enforcement.md shows the removed persist phase. 08:293–333 holds no save.
- **F13:** work-packages/README.md was read whole, and substrate README :135–168.
- **F18:** continue-agent.md:10–22 has no optional marker on `agent_id`. The continue-batch and resume-worker Inputs hold only `worker_agent_id` and the others.

**Considered and not raised:**

- **scope-definition.md:67 (outside this slice).** It reads `{structural_design}` and `{drafting_order}`, dropping the `$` of the locals phases 4–5 assemble, so the phase reads two undeclared ids. This is diff, and it touches this branch's contract Focus. `reference-without-provenance` excludes a target "declared but wears the wrong form" and defers it to `anchored-protocol-references` and `brace-declared-ids`. Route it there.
- **05 `revise` loop.**
  - The new `revise` exit re-enters impact-analysis.
  - Entering an activity clears earlier answers, and the technique re-runs on the same `accumulated_design` and `structural_inventory`.
  - Nothing carries what the reviewer wanted revised, so the loop can only reproduce the report.
  - No unit in this slice keys on it. It belongs to checkpoint and exit design.
- **05 `variables.reads` (outside this slice).** It gained `accumulated_design` but not `structural_inventory`, which the technique now also reads. `reads` is advisory (variable.schema.ts:50).
- **activity-loop enter-activity step.** On the take-activity path, which prism-audit 02, prism-evaluate 02 and work-package 10 use, it binds no `exit_id` or `step_manifest`. The server takes `activity_id` when `exit` is absent (workflow-tools.ts:1282), so nothing breaks. The routine is pre-existing and this branch only renamed its keys.
- **`workflow_complete` and old names.**
  - No `{state}`, `{effects}`, `branch_list`, `state: variables` or `workflow_complete` survives in any bind, read or placeholder in the corpus.
  - Every activity-loop bind resolves: `variable_bag`, `checkpoint_reply` and `activity_id` against the workflow-engine container, and `branch_activities` against enter-fan and spawn-branches.
- **`inherited-input-re-declared`.**
  - dispatch-activity and enter-fan redeclare `planning_folder_path` from the meta root TECHNIQUE.md, but mark it optional, and both skip a phase when it is unset. That is the "optionality the technique needs" carve-out.
  - No workflow-engine leaf redeclares a container input.
  - respond-checkpoint declares `checkpoint_reply` as an Output, which is not the redeclaration the entry flags.
- **`declared-input-never-read`.** `workflow_id` on activity-worker and workflow-orchestrator is an agent-entry identity binding, as in the prior walks.
- **`output-without-destination`.** context-loading's `*_path` outputs carry `#### artifact`, which counts as a destination.
- **`finalize-activity` `next_activity_id` "(or null when the workflow is complete)".** An exitless activity yields null, and activity-loop ends the walk on null, so the claim still holds.
- **`fan/enter-fan.md:46` link.** `[sync-progress-status](./sync-progress-status.md)` resolves to a file that does not exist under fan/. This is pre-existing, ledgered `fix-later`, and a link-form matter outside this slice.
- **Truncated descriptions.** 01:61 and 08:90 (`target_workflow_id` "…(bound per iteration when reviewing multiple."), 06:78 and 08:59 ("remedia") and 06:109 are cut mid-sentence. They are pre-existing and no entry in this slice keys on truncation.
- **`sync-progress-status.md:18` `artifact_prefix` bind prose.** "When unbound, resolve from `{activity_id}`" is `no-bind-mechanics-as-prose`. It is pre-existing and unchanged. The branch deleted the leaf `activity_id`, which had carried the same clause, and left this one.
- **`workflow-design/activities/README.md:65`.** "Terminal in create and review modes" is wrong against the graph (`create: retrospective`). The branch did not alter that routing, so the `stale-restatement-after-change` carve-out "A restatement the change did not affect" applies.

## Triage-ledger deletions (ledgers/unserved-operation-ref-triage.json)

26430409 deleted four entries. Each deleted reference is gone from its file, so no deletion hides a live reference:

- **`corpus/meta/techniques/agent-conduct.md:34`, ops `present-checkpoint-to-user`, `respond-checkpoint`, `yield-checkpoint`.**
  - The rule `checkpoint-discipline` (now :34) reads "Resolving a checkpoint — presenting it to the user, then sending back the selection — is the meta-orchestrator's. A worker reaching a gate pauses there by yielding it".
  - It carries no link and no `::` address.
  - The whole file's only remaining link is the resource `writing-register` (:22).
  - The dotted `workflow-engine.resource-loading-via-tool` (:42) is a rule address, not an operation link.
- **`corpus/meta/techniques/workflow-engine/activity-worker.md:67`, op `orchestrator-conduct`.**
  - The rule `follow-bundled-rules` (now :55) no longer links orchestrator-conduct.
  - No link or `::` to it appears anywhere in the file.
  - The sentence that held the link is now F8, a hygiene finding, not a suppression.
- **Stale line numbers in the kept entries.** The surviving activity-worker entries still cite :48, :55, :57, :61 and :67. After the 12-line Inputs deletion those references sit at :36, :43, :45, :49 and :55/:61. The guard keys on file and op, so matching is unaffected, and the guard passes. This is ledger hygiene only.

## Ledger re-affirmation (ledgers/binding-fidelity-triage.json, corpusSha 7062aa0a)

Six entries name a site this branch touched. Each was re-checked at HEAD bcf31337 and re-affirmed:

- **dead-output, `meta/techniques/workflow-engine/finalize-activity.md` (ledger :206). Output `activity_result`, `harmless`, rationale `shared-op-return-contract`.**
  - Still declared at :34 and returned at :90.
  - A corpus `grep -rnw activity_result` finds no reader outside the file.
  - It is still a meta library return.
- **dead-output, `meta/techniques/workflow-engine/yield-checkpoint.md` (ledger :248). Output `yielded_checkpoint`, `harmless`, rationale `shared-op-return-contract`.**
  - Still declared at :12 and emitted at :31. The Inputs deletion moved it up, and the entry carries no line.
  - No outside reader exists.
  - The other output, `selected_exit`, is read by finalize-activity.md:24, so no new entry is owed.
- **dead-output, `workflow-design/techniques/TECHNIQUE.md` (ledger :255). Output `workflow_files`, `harmless`, rationale `container-contract-shape`.**
  - Still declared at :26, with the same five `####` components.
  - The branch changed only :70.
  - Same-named ids under cicd-pipeline-security-audit belong to another workflow.
- **orphan-input, `workflow-design :: git::commit-regular-files` (ledger :346, :353, :360). Inputs `branch`, `commit_message` and `paths`, `harmless`, rationale `shared-op-caller-argument`.**
  - The bare binds at 09-validate-and-commit.yaml:80 and :187 and 10-post-update-review.yaml:219 are unchanged.
  - The branch added no workflow-design variable of those names, so the findings still fire and the entries are not stale.
- **read-resolution, `meta/techniques/variable-binding.md:43`. `{current_task.crate}`, `harmless`, rationale `documentation-notation`.**
  - :43 is still `binding-carries-only-deviations`.
  - The branch reworded the rule, and the illustrative `inputs: { scope: '-p {current_task.crate}' }` still sits on that line as metasyntax.
  - The deletions below it (`outputs-mutate-state-only-via-sanctioned-path`, `generic-not-overfit`) did not move it.

## Files

- corpus/canon/resources/design-principles.md: read
- corpus/canon/resources/schema-construct-inventory.md: read
- corpus/codebase-wiki/README.md: read
- corpus/codebase-wiki/activities/README.md: read
- corpus/meta/activities/03-dispatch-client-workflow.yaml: read
- corpus/meta/activities/04-end-workflow.yaml: read
- corpus/meta/activities/patterns/02-supervisor.yaml: read
- corpus/meta/activities/patterns/03-plan-and-execute.yaml: read
- corpus/meta/activities/patterns/05-lead-researcher.yaml: read
- corpus/meta/activities/patterns/README.md: read
- corpus/meta/resources/README.md: read
- corpus/meta/resources/workflow-canonical.md: read
- corpus/meta/routines/activity-loop.yaml: read
- corpus/meta/techniques/agent-conduct.md: read
- corpus/meta/techniques/fan/enter-fan.md: read
- corpus/meta/techniques/fan/spawn-branches.md: read
- corpus/meta/techniques/variable-binding.md: read
- corpus/meta/techniques/workflow-engine/TECHNIQUE.md: read
- corpus/meta/techniques/workflow-engine/activity-worker.md: read
- corpus/meta/techniques/workflow-engine/commit-and-persist.md: read
- corpus/meta/techniques/workflow-engine/compose-prompt.md: read
- corpus/meta/techniques/workflow-engine/continue-batch.md: read
- corpus/meta/techniques/workflow-engine/dispatch-activity.md: read
- corpus/meta/techniques/workflow-engine/evaluate-transition.md: read
- corpus/meta/techniques/workflow-engine/finalize-activity.md: read
- corpus/meta/techniques/workflow-engine/present-checkpoint-to-user.md: read
- corpus/meta/techniques/workflow-engine/respond-checkpoint.md: read
- corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md: read
- corpus/meta/techniques/workflow-engine/resume-worker.md: read
- corpus/meta/techniques/workflow-engine/sync-progress-status.md: read
- corpus/meta/techniques/workflow-engine/take-activity.md: read
- corpus/meta/techniques/workflow-engine/workflow-orchestrator.md: read
- corpus/meta/techniques/workflow-engine/yield-checkpoint.md: read
- corpus/midnight-system-review/activities/README.md: read
- corpus/ponytail/activities/README.md: read
- corpus/prism-audit/README.md: read
- corpus/prism-update/activities/README.md: read
- corpus/specimens/fan-conformance/activities/README.md: read
- corpus/specimens/git-pin-conformance/activities/README.md: read
- corpus/specimens/routine-conformance/activities/README.md: read
- corpus/substrate-node-security-audit/README.md: read
- corpus/substrate-node-security-audit/activities/README.md: read
- corpus/work-package/README.md: read
- corpus/work-package/activities/README.md: read
- corpus/work-packages/README.md: read
- corpus/workflow-authoring/resources/impact-analysis.md: read
- corpus/workflow-authoring/resources/scope-manifest.md: read
- corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md: read
- corpus/workflow-authoring/techniques/workflow-definition/scope-definition.md: read
- corpus/workflow-authoring/techniques/workflow-definition/yaml-authoring.md: read
- corpus/workflow-design/README.md: read
- corpus/workflow-design/activities/01-intake-and-context.yaml: read
- corpus/workflow-design/activities/03-requirements-refinement.yaml: read
- corpus/workflow-design/activities/04-pattern-analysis.yaml: read
- corpus/workflow-design/activities/05-impact-analysis.yaml: read
- corpus/workflow-design/activities/06-scope-and-draft.yaml: read
- corpus/workflow-design/activities/08-quality-review.yaml: read
- corpus/workflow-design/activities/README.md: read
- corpus/workflow-design/resources/design-assumptions.md: read
- corpus/workflow-design/resources/format-conventions.md: read
- corpus/workflow-design/resources/impact-analysis.md: read
- corpus/workflow-design/resources/scope-manifest.md: read
- corpus/workflow-design/techniques/TECHNIQUE.md: read
- corpus/workflow-design/techniques/audit-rule-enforcement.md: read
- corpus/workflow-design/techniques/context-loading.md: read
- corpus/workflow-design/techniques/impact-analysis.md: read
- corpus/workflow-design/techniques/pattern-analysis.md: read
- corpus/workflow-design/techniques/reconcile-design-assumptions.md: read
- corpus/workflow-design/techniques/scope-definition.md: read
- corpus/workflow-design/techniques/yaml-authoring.md: read
- corpus/workflow-design/workflow.yaml: read
- ledgers/unserved-operation-ref-triage.json: read (diff whole, and the entries for every touched site)
- (closure) corpus/meta/techniques/README.md: read
- (closure) corpus/meta/workflow.yaml: read
- (closure) corpus/prism-audit/activities/02-execute-analysis.yaml: read
- (closure) corpus/prism-audit/techniques/README.md: read
- (closure) corpus/prism-evaluate/activities/02-execute-analysis.yaml: read
- (closure) corpus/prism-evaluate/techniques/README.md: read
- (closure) corpus/work-package/activities/10-post-impl-review.yaml: read
- (closure) corpus/workflow-authoring/activities/06-scope-and-draft.yaml: read
- (closure) corpus/workflow-authoring/activities/09-validate-and-commit.yaml: read
- (closure) corpus/workflow-authoring/techniques/workflow-definition/intake-classification.md: read
- (closure) corpus/workflow-authoring/techniques/workflow-definition/synthesize-change-brief.md: read
- (closure) corpus/workflow-design/activities/09-validate-and-commit.yaml: read
- (closure) corpus/workflow-design/techniques/capture-dimension.md: read
- (closure) corpus/workflow-design/techniques/intake-classification.md: read
- (closure) corpus/workflow-design/techniques/persist-design-specification.md: read
- (closure) corpus/workflow-design/techniques/synthesize-update-specification.md: read
