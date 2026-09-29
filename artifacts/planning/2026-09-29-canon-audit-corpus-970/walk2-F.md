# Walk F (second pass): anti-patterns.md Overview, Entry identity, Canon Hygiene, Technique Protocol, Draft Hygiene

- **Canon home:** corpus/canon/resources/anti-patterns.md on the #970 worktree. Neither fix commit edits it.
- **Surface:** fix-surface.txt (37 files).
- **Fix commits:**
  - 1df70bd2 on #970, parent 0d56c951.
  - 4ef2c6d6 on #971, parent 8a7dc934.
- **Engine consumer checks:** src/tools/workflow-tools.ts at the schema-description-hygiene worktree. Checked there: the yield_checkpoint arguments and the empty `variables_changed` map, and the resume_checkpoint parameters and returns.

## Units

- Overview (catalogue overview: smells stated as Detect / Do not flag / Fix): walked
  - Its Creation Rules are not-applicable: "An add or an edit lands only after Succinctness". Neither fix commit adds to or edits anti-patterns.md.
- Entry identity: walked. No AP or MR number is cited anywhere on the 37 files.
- AP-103. cited-home-owns-claim: walked
  - Principle 43 now cites `schema-construct-inventory.md#compose-or-reuse-activities`, which states the reference form at line 47.
- AP-104. operative-criteria-need-a-home: walked
- AP-105. no-shadow-audit-pass: walked
  - audit-rule-enforcement's mechanism list has been replaced by a citation of `structure-backed-constraints`.
- AP-106. canon-layer-cites-not-restates: walked (principle 43 is now a stance plus a named citation)
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
- MR-1. cut-comment-jsdoc-verbosity: not-applicable — "Comments or JSDoc whose removal leaves the code equally clear". No surface file carries a code comment or JSDoc.
- MR-2. no-dense-prose-after-config-examples: walked
- MR-3. worktree-root-placeholders: walked
- MR-4. no-parallel-runbook-when-setup-covers-it: walked
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
- AP-139. framing-outside-any-section: walked
- AP-140. declared-input-never-read: walked
- AP-141. apply-omits-declared-input: walked
- AP-142. branch-on-undeclared-threshold: walked
- AP-143. inherited-rules-re-enumerated: walked
- AP-144. reference-without-provenance: walked
- AP-145. pre-session-prose-defers-to-the-framework: not-applicable — "On a surface delivered before a session exists — the `discover` bootstrap procedure". No fix-surface file is delivered before a session exists.
- AP-146. instruction-narrates-an-actor: walked
- AP-147. rule-binds-beyond-its-operation: walked
- AP-148. inherited-input-re-declared: walked
- AP-149. schema-semantics-restated: walked
- AP-150. engine-internals-narrated: walked
- AP-151. value-set-in-prose: walked
- AP-152. one-invariant-per-rule: walked
- AP-153. call-omits-conditionally-required-argument: walked
- AP-154. call-omits-required-argument: walked
- AP-155. call-names-an-undeclared-argument: walked
- AP-156. protocol-phase-as-list-item: walked
- AP-157. unreachable-operation-reference: walked
- AP-158. produce-path-without-a-reading: walked
- AP-159. construct-folder-without-a-readme: walked
- AP-160. relocation-without-a-preserved-outcome: walked
- AP-161. unproducible-declared-value: walked

## Findings

Paths are relative to corpus/ on the #970 worktree unless the row marks them (#971).

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| F1 | Hygiene | Low | AP-144 reference-without-provenance | workflow-design/README.md:93 (Review Mode) | "Pass inventory, severity disposition, and the fix loop's exits live in 08-quality-review.yaml". 08-quality-review holds two fix loops: the `audit-fix-cycle` loop step (:291) and the review-mode `fix-issues` route (:176–193, exit :338). A loop step declares no exits; the exits are the activity's (`has-blocker`, `done`, `fix-issues`) | diff (fix rewrote "fix transitions") | Name the supplier: "the `fix-issues` exit" |
| F2 | Hygiene | Low | AP-144 reference-without-provenance | (#971) specimens/schema-hygiene-conformance/techniques/hygiene-probe.md:26 — rule `local-marker` | "`{probe_recorded}` is set by the Record step alone". The same commit gave the probe activity step the id `record` (activities/01-probe.yaml:15), so the probe worker holds two "Record" steps: that activity step and the technique's `### 1. Record` phase. Read as the activity step, the rule is false in gate-exit, whose `numeric-flag` and `numeric-count` steps also set `probe_recorded` (02-gate-exit.yaml writes) | diff | Name the one meant: "set by this technique's Record phase alone" |
| F3 | Hygiene | Low | AP-120 procedure-in-capability | meta/techniques/workflow-engine/finalize-activity.md:8 — Capability (mirrored in workflow-engine/README.md:20) | "Compile the `activity_complete` result when the steps end, or a checkpoint's exit ends the activity". This is a trigger (sequencing and a branch) in Capability. The trigger's home is activity-worker `### 5. Finalize the activity` (:61), which now states the same condition | diff (the fix reworded it as first-pass F4 prescribed; the parent's Capability already carried a sequencing clause, "after all steps, checkpoints, and artifacts are done") | Capability names the product ("The `activity_complete` result envelope"), and the trigger stays in activity-worker step 5. Update the README row to match |
| F4 | Hygiene | Low | AP-129 stale-restatement-after-change | workflow-design/resources/scope-manifest.md:45 ("short transition note"); workflow-authoring/techniques/workflow-definition/scope-definition.md:57 ("wherever the transition topology changes"); workflow-authoring/resources/scope-manifest.md:43 ("a short transition note") | The fix rewrote workflow-design scope-definition.md:49 to "short note on changed graph bindings when topology changes". The Template that same phase fills (scope-manifest.md#template) and both workflow-authoring twins still say "transition" | pre-existing (unchanged text the fix's sweep left behind) | Rename all three to the graph-bindings wording in one edit, and bump the two resource versions |
| F5 | Hygiene | Low | AP-129 stale-restatement-after-change | meta/README.md:70, :127; prism-audit/README.md:112; meta/techniques/workflow-engine/commit-and-persist.md:53 ("before evaluating transitions to the next activity") | Survivors of the routing-as-transitions phrasing. None of these files is on the fix surface | known — F5 | Sweep the remaining occurrences to exits and the graph |
| F6 | Contract | Medium | AP-141 apply-omits-declared-input | meta/techniques/workflow-engine/activity-worker.md:61 (step 5); also :57 (step 4, yield-checkpoint) | Step 5 applies finalize-activity "passing … as `batch_may_continue`" only. finalize-activity requires `steps_completed`, `checkpoints_responded` and `artifacts_produced` (:12–22, with no optional marker and no default). activity-worker declares none of them, and the workflow-engine container TECHNIQUE.md declares no Inputs. Line :57 applies yield-checkpoint without its required `checkpoint_id`, which that technique's own phase 1 chooses. The fix edited :61 (the trigger clause) and left the omission | pre-existing | Name the three inputs at the step-5 Apply site. Either pass `checkpoint_id` at :57 or retire it as an input of yield-checkpoint |
| F7 | Hygiene | Low | AP-117 no-engine-mechanics-as-rules | meta/techniques/variable-binding.md:61–63 — rule `outputs-mutate-state-only-via-sanctioned-path` | "Outputs land in the bag through the `variables_changed` channel of the worker's `activity_complete` result — one of the sanctioned variable-mutation sources … This honours the engine's `variable-mutation-source` rule". This is the entry's own exemplar ("Declared outputs appear in the activity's `variables_changed`"). It adds nothing that workflow-engine/TECHNIQUE.md:38 does not already state. The fix respelled the line and kept it | pre-existing | Delete the rule and rely on `variable-mutation-source` |
| F8 | Hygiene | Low | AP-125 technique-ref-in-io-contract | meta/techniques/workflow-engine/finalize-activity.md:68 — `#### activity_exit` | "The exit id this activity took, from evaluate-transition, …". The description names another technique as the producer | pre-existing (file first read in this pass) | Keep the meaning ("the exit id this activity took, or `workflow_complete` where it declared none"). The producer relationship stays in Protocol `### 2. Read Routing Destination` |
| F9 | Hygiene | Low | AP-119 procedure-in-io-contract | finalize-activity.md:26 (input `batch_may_continue`), :60 (`#### next_activity_id`), :72 (`#### batch_may_continue`) | ":26 "The envelope is the only place this answer appears again, so it is read here and carried there unchanged"; :60 and :72 "Required on every successful `activity_complete`: … the envelope is the only report …". Each carries a duty and its rationale, not only what the value is | pre-existing | Keep each value's meaning, and move the carry-unchanged and must-not-omit duties into Protocol `### 1` and `### 2` (`### 2` already states "Do not omit these fields") |
| F10 | Hygiene | Low | AP-146 instruction-narrates-an-actor | finalize-activity.md:64 (`#### next_activity_fans`), :68 (`#### activity_exit`) | "The orchestrator dispatches a fan on it, so the reading belongs in the envelope"; "The orchestrator passes it to `next_activity` as `exit`". Both narrate a second actor, and each description is complete without the clause | pre-existing | Delete both clauses |
| F11 | Contract | Medium | AP-107 bind-site-is-orchestration-truth | workflow-design/README.md:28 — Quality Review row | "Expressiveness, conformance, rule-hygiene, and rule-enforcement audits, then a bounded fix-revalidate loop (max 3) with a critical-blocker gate …". A pass inventory not generated from 08-quality-review.yaml, while the same file (:93) says "do not restate that inventory here" | known — F18 | Cut the row to a one-line role and point at 08-quality-review.yaml |
| F12 | Contract | Medium | AP-107 bind-site-is-orchestration-truth | specimens/fan-conformance/activities/README.md:5 with the per-activity step diagrams at :29–183 | ":5 says the structured definition — "its steps, exits and technique bindings" — "is not duplicated here", beside a mermaid list of each activity's steps. This is the construct first-pass F18 named in work-package/activities/README.md, at a file the fix touched (:5) | pre-existing | Cut the step diagrams to one-line roles, or point at the YAML |
| F13 | Hygiene | Low | AP-157 unreachable-operation-reference | meta/techniques/workflow-engine/activity-worker.md:67 — rule `follow-bundled-rules` | "the orchestrator's boundaries live in [orchestrator-conduct](../orchestrator-conduct.md) and are not a worker's to read". A technique is linked and no work is invoked | known — F19 | State the fact without the technique link |
| F14 | Hygiene | Low | AP-146 instruction-narrates-an-actor | meta/techniques/workflow-engine/resume-from-checkpoint.md:30 — `### 1. Confirm Gate Cleared` | "it confirms the orchestrator's `respond_checkpoint` has cleared the active checkpoint before the paused worker proceeds" | known — F20 | "Call `resume_checkpoint { session_index }` before running the next step" |

**Highs:** none raised, so none withdrawn or downgraded.

**Medium spot-checks:**
- F6: finalize-activity.md:12–22 declares its three array inputs with no "(optional)" and no `#### default`. activity-worker.md Inputs are `session_index`, `workflow_id`, `activity_id`, `effects` and `agent_id`. workflow-engine/TECHNIQUE.md has only Capability and Rules.
- F11: workflow-design/README.md:28 re-read.
- F12: fan-conformance/activities/README.md:5 and :29–183 re-read.

**First-pass findings in this slice that the fix resolved:**
- F1: the four `effects` descriptions now carry the reply's shape.
- F2: the impact-analysis template names "Exits and graph".
- F3: finalize-activity now points at `variable-mutation-source`.
- F4: activity-worker step 5, the finalize Capability and the engine README widened.
- F6: `selected_exit` declared on resume-from-checkpoint (:22) and yield-checkpoint (:22) and referenced in Protocol.
- F7: the activity-worker note is cut to the Apply plus the envelope duty.
- F8: yield phase 1 drops the cardinality, the field names and the omit rule; the undeclared case is a note.
- F9: respond-checkpoint captures the reply by reference.
- F10: resume-from-checkpoint split into `### 2. Apply Effects` and `### 3. Continue Or Finalize`.
- F11: the `resume_checkpoint` response is named as the source.
- F12: the yield narration was dropped.
- F13: the clearing clause was dropped.
- F14: principle 43 cites the inventory.
- Off the fix surface and not re-walked: F15, F16, F17, F21.

**Considered and not raised:**
- **AP-160 on principle 43.** The fix dropped "No construct binds or includes one activity inside another; a run of steps several activities share is a routine". Principle 42 (:185, "the home for a sequence … that several sites share") and the inventory's "Several activities carry the same run of steps" (:111) already hold it, so the receiving-site carve-out applies.
- **AP-107 on principle 43's parenthetical list "(supervisor, plan-and-execute, lead-researcher)".** It is pre-existing. The patterns are library files no graph binds, so there is no bind site to disagree with.
- **AP-160 and AP-129 on the removed `confirm` checkpoint (#971).** The README, the roster reason and the workflow description all moved the declared-yield and status cases to `stop-here`, and no reference to `confirm` survives in the tree.
- **AP-133 on yield-checkpoint rule `replay-is-continue-not-error`.** It lost its ends_activity clause. "continue under the stored decision" still covers finalizing, the Protocol branch (:38) owns the case, and a rule and a Protocol step are not one bucket.
- **AP-146 and AP-119 on the yield-checkpoint `checkpoint_id` input (:14).** It reads "an id of the worker's choosing that says what it decides". Striking "of the worker's choosing" leaves the meaning complete, and the text states what the value is. Naming the producer is `io-agnostic-contract`, which is outside this slice.
- **AP-135 on yield-checkpoint :31 ("A declared gate is yielded by its id alone") and the :32 note.** These are the obligations first-pass F8's Fix said to keep. The note is the conditional obligation `call-omits-conditionally-required-argument` exempts. An empty `variables_changed` is accepted (workflow-tools.ts:122, `z.record(...).optional()`), so dropping "omit it when nothing" breaks no call.
- **AP-138 on the new `selected_exit` outputs.** They land at evaluate-transition's same-named input (:24), which finalize-activity reads (:78). These are also meta library ops.
- **Outside this slice.** finalize-activity :78 reads `{selected_exit}` with no declared input. AP-144's Do not flag defers that to `technique-inputs-declared`.
- **AP-126 on the specimen's `flag_on` description.** It is unchanged and sibling convention, as the first pass also found.
- **Ledger suppression.** Neither fix commit touches ledgers/ (`git diff 0d56c951 1df70bd2 -- ledgers` and `git show --stat 4ef2c6d6` both show no ledger files).

## Ledger re-affirmation (ledgers/binding-fidelity-triage.json, corpusSha 7062aa0a)

- **dead-output, `meta/techniques/workflow-engine/yield-checkpoint.md` (ledger :248). Output `yielded_checkpoint`, verdict harmless, rationale `shared-op-return-contract`. Re-affirmed.**
  - At head 1df70bd2, :18 still declares `### yielded_checkpoint`, and the `yielded` branch (:37) still emits `{yielded_checkpoint}`.
  - A corpus grep finds no reader outside the file.
  - It is still a meta shared-library operation whose return is read by an agent, not a bind site.
  - The fix added a second output, `selected_exit`. It is not dead: evaluate-transition.md:24 declares a same-named input. So no new ledger entry is owed, and none was added.
- **read-resolution, `meta/techniques/variable-binding.md:43`. `{current_task.crate}`, verdict harmless, rationale `documentation-notation`. Re-affirmed.**
  - At head, :43 is still the `binding-carries-only-deviations` rule, whose illustrative `inputs: { scope: '-p {current_task.crate}' }` is metasyntax, not a read.
  - The fix's edits to this file both sit below :43, so the line did not move:
    - the deletion of the `outputs-by-name-and-path` rule (old :55–58);
    - the respelling at old :67, now :63.

## Files

All read whole at the fix head.

- corpus/canon/resources/design-principles.md: read
- corpus/codebase-wiki/activities/README.md: read
- corpus/meta/activities/patterns/02-supervisor.yaml: read
- corpus/meta/activities/patterns/03-plan-and-execute.yaml: read
- corpus/meta/activities/patterns/05-lead-researcher.yaml: read
- corpus/meta/activities/patterns/README.md: read
- corpus/meta/techniques/variable-binding.md: read
- corpus/meta/techniques/workflow-engine/README.md: read
- corpus/meta/techniques/workflow-engine/TECHNIQUE.md: read
- corpus/meta/techniques/workflow-engine/activity-worker.md: read
- corpus/meta/techniques/workflow-engine/compose-prompt.md: read
- corpus/meta/techniques/workflow-engine/finalize-activity.md: read
- corpus/meta/techniques/workflow-engine/respond-checkpoint.md: read
- corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md: read
- corpus/meta/techniques/workflow-engine/resume-worker.md: read
- corpus/meta/techniques/workflow-engine/yield-checkpoint.md: read
- corpus/midnight-system-review/activities/README.md: read
- corpus/prism-evaluate/activities/README.md: read
- corpus/prism-update/activities/README.md: read
- corpus/specimens/fan-conformance/activities/README.md: read
- corpus/specimens/git-pin-conformance/activities/README.md: read
- corpus/specimens/gitnexus-radius-conformance/activities/README.md: read
- corpus/specimens/routine-conformance/activities/README.md: read
- corpus/substrate-node-security-audit/activities/README.md: read
- corpus/work-package/README.md: read
- corpus/work-packages/activities/README.md: read
- corpus/workflow-authoring/resources/impact-analysis.md: read
- corpus/workflow-design/README.md: read
- corpus/workflow-design/techniques/audit-rule-enforcement.md: read
- corpus/workflow-design/techniques/scope-definition.md: read
- corpus/meta/techniques/workflow-engine/evaluate-transition.md: read
- (#971) corpus/specimens/schema-hygiene-conformance/README.md: read
- (#971) corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml: read
- (#971) corpus/specimens/schema-hygiene-conformance/activities/02-gate-exit.yaml: read
- (#971) corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md: read
- (#971) corpus/specimens/schema-hygiene-conformance/workflow.yaml: read
- (#971) walks/roster.json: read
