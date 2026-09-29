# Walk F — anti-patterns.md: Overview, Entry identity, Canon Hygiene, Technique Protocol, Draft Hygiene

Canon home: /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/canon/resources/anti-patterns.md (head 0d56c951). Engine consumer checks at /home/mike1/projects/dev/workflow-server/.worktrees/schema-description-hygiene (src/tools/workflow-tools.ts, schemas/, src/loaders/workflow-loader.ts, docs/).

## Units

- Overview (catalogue overview and Creation Rules, applied to the PR's edits of anti-patterns.md: AP-11, AP-69, AP-79, AP-114) — walked
- Entry identity — walked
- AP-103. cited-home-owns-claim — walked
- AP-104. operative-criteria-need-a-home — walked
- AP-105. no-shadow-audit-pass — walked
- AP-106. canon-layer-cites-not-restates — walked
- AP-107. bind-site-is-orchestration-truth — walked
- AP-108. numbered-protocol-phases — walked
- AP-109. technique-outputs-declared — walked
- AP-110. duplicate-shared-capability — walked
- AP-111. contract-not-procedure — walked
- AP-112. no-derived-state-shadow — walked
- AP-113. session-interaction-in-technique — walked
- AP-114. pass-orchestration-in-technique — walked
- AP-115. platform-semantics-in-capability — walked
- AP-116. no-template-creation-guide — walked
- AP-117. no-engine-mechanics-as-rules — walked
- AP-118. no-bind-mechanics-as-prose — walked
- AP-119. procedure-in-io-contract — walked
- AP-120. procedure-in-capability — walked
- AP-121. rule-as-protocol-step — walked
- AP-122. prompt-restates-owned-mechanics — walked
- AP-123. capability-as-op-inventory — walked
- AP-124. alternate-ops-as-protocol-sequence — walked
- AP-125. technique-ref-in-io-contract — walked
- MR-1. cut-comment-jsdoc-verbosity — walked
- MR-2. no-dense-prose-after-config-examples — walked
- MR-3. worktree-root-placeholders — walked
- MR-4. no-parallel-runbook-when-setup-covers-it — walked
- AP-126. variable-description-one-line — walked
- AP-127. bag-value-as-literal — walked
- AP-128. unproduced-value-read — walked
- AP-129. stale-restatement-after-change — walked
- AP-130. artifact-name-is-filename — walked
- AP-131. resource-id-names-its-content — walked
- AP-132. deployment-path-in-capability — walked
- AP-133. overlapping-rule-scopes — walked
- AP-134. whole-resource-for-one-section — walked
- AP-135. tool-contract-restated-in-protocol — walked
- AP-136. phase-cited-by-ordinal — walked
- AP-137. unowned-harness-capability — walked
- AP-138. output-without-destination — walked
- AP-139. framing-outside-any-section — walked
- AP-140. declared-input-never-read — walked
- AP-141. apply-omits-declared-input — walked
- AP-142. branch-on-undeclared-threshold — walked
- AP-143. inherited-rules-re-enumerated — walked
- AP-144. reference-without-provenance — walked
- AP-145. pre-session-prose-defers-to-the-framework — not-applicable — "On a surface delivered before a session exists — the `discover` bootstrap procedure" (no surface file is delivered pre-session; bootstrap-protocol.md is not on the surface)
- AP-146. instruction-narrates-an-actor — walked
- AP-147. rule-binds-beyond-its-operation — walked
- AP-148. inherited-input-re-declared — walked
- AP-149. schema-semantics-restated — walked
- AP-150. engine-internals-narrated — walked
- AP-151. value-set-in-prose — walked
- AP-152. one-invariant-per-rule — walked
- AP-153. call-omits-conditionally-required-argument — walked
- AP-154. call-omits-required-argument — walked
- AP-155. call-names-an-undeclared-argument — walked
- AP-156. protocol-phase-as-list-item — walked
- AP-157. unreachable-operation-reference — walked
- AP-158. produce-path-without-a-reading — walked
- AP-159. construct-folder-without-a-readme — walked
- AP-160. relocation-without-a-preserved-outcome — walked
- AP-161. unproducible-declared-value — walked

## Findings

Paths are relative to corpus/ on the #970 worktree unless stated.

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| F1 | Contract | Medium | AP-129 stale-restatement-after-change | meta/techniques/workflow-engine/resume-from-checkpoint.md:18, activity-worker.md:26, resume-worker.md:26, compose-prompt.md:22 — `### effects` input descriptions | All four still say "Variable updates carried by the resolved checkpoint". #970 redefined the producer's output (respond-checkpoint.md:24) as the whole reply: `resolved_option`, `effect`, `exit` with `next_activity`/`ends_activity`, `dismissed`. activity-loop.yaml:182 binds that same bag slot straight into resume-worker, which hands it to compose-prompt and then to activity-worker/resume-from-checkpoint | diff (a changed I/O contract left its consumers' descriptions behind) | Update all four input descriptions in one edit to the reply's shape, or state the value once and point the rest at respond-checkpoint's `effects` |
| F2 | Hygiene | Low | AP-129 stale-restatement-after-change | workflow-authoring/resources/impact-analysis.md:58 — Template integrity row | Row still reads "Transitions, entry activity, reachability". #970 renamed the citing technique's phase to `### 3. Check Exit Integrity` (workflow-authoring/techniques/workflow-definition/impact-analysis.md:52; it cites this `#template` at :32 and :78). #970 did update the workflow-design twin (workflow-design/resources/impact-analysis.md:58 "Exits and graph …") | diff | Rename the row to "Exits and graph, entry activity, reachability" and bump the resource version, matching the twin |
| F3 | Hygiene | Low | AP-129 stale-restatement-after-change | meta/techniques/workflow-engine/finalize-activity.md:48 — `#### variables_changed` | "one of the two sanctioned state-mutation sources". #970 changed `variable-mutation-source` to three sources (workflow-engine/TECHNIQUE.md:38) and reworded the variable-binding copy (variable-binding.md:67). This third copy was missed | diff | Reword to "one of the sanctioned sources", as variable-binding.md:67 does |
| F4 | Hygiene | Low | AP-129 stale-restatement-after-change | activity-worker.md:61 (`### 5. Finalize the activity`: "When the last step completes, apply finalize-activity"); finalize-activity.md:8 Capability and workflow-engine/README.md:20 ("after all steps, checkpoints, and artifacts are done") | #970 added a finalize at the gate when `exit.ends_activity` holds (resume-from-checkpoint.md:30, yield-checkpoint.md:33, activity-worker.md:48). The phase trigger and the Capability still say finalize runs only after the last step | diff | Widen the step-5 trigger and the Capability to "when the steps end, or a checkpoint's exit ends the activity" |
| F5 | Hygiene | Low | AP-129 stale-restatement-after-change | Survivors of the phrasing #970 swept. In touched files: meta/README.md:70,127; prism-audit/README.md:112; substrate-node-security-audit/activities/README.md:5 ("transition graph"); workflow-design/README.md:93 ("fix transitions live in 08-quality-review.yaml"); codebase-wiki/activities/README.md:43 ("## Transition map"). In untouched siblings of the swept sentence "authoritative definition … transitions": midnight-system-review/activities/README.md:7, prism-evaluate/activities/README.md:9, prism-update/activities/README.md:5, work-packages/activities/README.md:3 (its parent README.md:49 was swept), work-package/README.md:9, specimens/{routine,gitnexus-radius,git-pin,fan}-conformance/activities/README.md:5. Also meta/techniques/workflow-engine/commit-and-persist.md:53 ("before evaluating transitions") | The same routing-as-transitions sentence #970 rewrote in eight sibling READMEs survives in 15+ places, and the manifest names none of them | pre-existing (unchanged text; left behind by #970's own sweep) | Sweep every occurrence in one edit, "transitions" → "exits" (and "the graph") |
| F6 | Contract | Medium | AP-109 technique-outputs-declared | resume-from-checkpoint.md:30 (the file has no `## Outputs`); yield-checkpoint.md:33 (`## Outputs` declares only `yielded_checkpoint`) | New Protocol text derives a gateable value: "hold `exit.id` as the activity's `selected_exit`" and "finalize … with `exit.id` as its `selected_exit`". Its consumer cites it: finalize-activity.md:78 "Include `{selected_exit}` if a checkpoint effect named an exit". Nothing declares it | diff | Declare `### selected_exit` under `## Outputs` on both techniques and reference `{selected_exit}` where Protocol derives it |
| F7 | Contract | Medium | AP-122 prompt-restates-owned-mechanics | activity-worker.md:48 — `>` note under `### 3. Take the walk position` | The agent-entry note restates resume-from-checkpoint's branching, which that technique's `### 2. Apply Effects` owns: "carry on from the paused step instead, or finalize there where the answer's exit ends the activity … so are the remaining steps unless that exit ends the activity at the gate". #970 introduced this second home | diff | Keep "apply [resume-from-checkpoint]" and the envelope duty (`final-message-is-an-envelope`), and drop the continue-or-finalize restatement |
| F8 | Hygiene | Low | AP-135 tool-contract-restated-in-protocol | yield-checkpoint.md:26–27 — `### 1. Yield Gate` bullets | Restates tool-schema shape: "omit it when those steps produced nothing" (omit-versus-empty; the schema says "Omit when no step before the gate produced anything", workflow-tools.ts:127); "sending either is refused" (the `message`/`options` descriptions already say "Forbidden on a declared checkpoint"); "at least two `options`, each with an `id` and a `label`" (`options` is `.min(2)` of `{id,label}`) | diff | Keep the obligations (yield a declared gate by id; pass the pre-gate values so the message renders; give an undeclared decision its own question and answers). Drop the cardinality, field names and omit rule |
| F9 | Hygiene | Low | AP-111 contract-not-procedure | respond-checkpoint.md:34 — `### 2. Clear Active Gate` | "returns `resolved_option`, `effect`, `exit` and `dismissed` as they apply. Capture them as `{effects}`". This restates the composition the `### effects` Output (line 24) now fully defines | diff | Emit by reference: "returns the reply; capture it as `{effects}`" |
| F10 | Hygiene | Low | AP-108 numbered-protocol-phases | resume-from-checkpoint.md:27–31 — `### 2. Apply Effects` | One phase holds two sequential outcomes: apply effects and response variables to local state, then route (hold `selected_exit`, finalize on `ends_activity`, otherwise continue). The heading names only the first | diff | Split into `### 2. Apply Effects` and `### 3. Continue or Finalize`, keeping the branches under the second |
| F11 | Hygiene | Low | AP-144 reference-without-provenance | resume-from-checkpoint.md:29–30 | "the `variables_changed` the response returns" / "Where the response carries `exit`". The context holds two replies that carry `exit`: `{effects}` (respond_checkpoint's reply, per its new description) and resume_checkpoint's response from phase 1 | diff | Name the supplier: "the `resume_checkpoint` response" |
| F12 | Hygiene | Low | AP-146 instruction-narrates-an-actor | yield-checkpoint.md:32 — `yielded` branch | "(no payload — the active checkpoint is server-resident and is read with `present_checkpoint` by the agent that presents it)". The clause narrates a second actor's call; the instruction stays complete without it. #970 rewrote this clause | diff | Delete the narration and keep "Emit the `{yielded_checkpoint}` block with no payload" |
| F13 | Hygiene | Low | AP-150 engine-internals-narrated | yield-checkpoint.md:33 — `replayed` branch | "entering an activity clears the answers an earlier visit recorded". This names a server persistence step. The worker's calls are the same with or without it, because it branches on `status` either way | diff | Delete the clause. If the scope matters, keep only "a response recorded in this visit of the activity" |
| F14 | Hygiene | Low | AP-149 schema-semantics-restated | canon/resources/design-principles.md:189 — principle 43 | "listing it under `activities:` as `<workflow>/[activities/]…/NN-<id>.yaml`" restates the item pattern `schemas/workflow.schema.json` declares (line 293) and the construct inventory (line 47) already carries. A schema edit to the borrow path would force an edit here | diff | Keep the stance ("A workflow borrows another workflow's activity file") and cite the inventory/schema for the path form |
| F15 | Contract | Medium | AP-103 cited-home-owns-claim | canon/resources/schema-construct-inventory.md:15 ("Field tables, required properties, and examples live in `schemas/README.md`") and every "Fields: `schemas/README.md#…`" citation (lines 17–21, 31, 37, 97, 103, 109, 115, 121, 127, 139, 145, 157, 173, 191, 197, 203, 209, 215, 289, 295, 323–347); workflow-design/resources/format-conventions.md:59 ("the schema README stays the deep home") | `schemas/README.md` does not exist at the engine head. It moved to docs/schemas.md at 94fc4712 (merged), and that file holds only Overview / Enforcement Model / Generation, with no field tables and no anchors such as `#exits-and-the-graph`. #970 edited this inventory (lines 47–79) around these citations | pre-existing | Repoint the citations at the schema files, or at a home that holds the field tables, or drop the "Fields:" claims |
| F16 | Hygiene | Low | Entry identity | canon/resources/schema-construct-inventory.md link texts, e.g. :37 `[AP-15. procedure-in-protocol]`, also :43, :103, :109, :133, :139, :151, :179, :185, :191, :271, :277, :283, :289, :295, :301, :313 | The rule reads "Cite the kebab name in backticks. Do not cite the number". These citations carry the AP number in the link text and anchor, so renumbering breaks them | pre-existing | Cite as `` `procedure-in-protocol` `` (the kebab name) |
| F17 | Live | Medium | AP-128 unproduced-value-read | workflow-design/activities/05-impact-analysis.yaml:37 — `persist-impact-analysis` step `inputs.artifact_content: impact_analysis` | Nothing in workflow-design produces or declares `impact_analysis`: the bound `impact-analysis` technique declares only `removal_count` and `impact_analysis_path`, and no variable or default exists. Under variable-binding's rule (variable-binding.md:24), a bare name that does not resolve in the bag is a literal, so write-artifact writes the string "impact_analysis" into `impact-analysis.md`, over the report the technique persisted at its step 7 | pre-existing (in a file #970 touched) | Declare `### impact_analysis` (the report body) on the technique's Outputs and bind it, or delete the redundant persist step, since the technique already persists the artifact |
| F18 | Contract | Medium | AP-107 bind-site-is-orchestration-truth | workflow-design/activities/README.md:55 and :71 (pass inventories: "expressiveness, conformance, rule-hygiene, and rule-enforcement audit passes … reload, principles, anti-patterns, schema validation, verify-high-findings, compile-report"); workflow-design/README.md:28; work-package/activities/README.md:5 ("it is not duplicated here") beside per-activity step and checkpoint flow diagrams (e.g. :17–54) | These are ordered step/pass lists outside the YAML, not generated from `steps[]` | pre-existing | Replace the pass lists with pointers to 08-/10- YAML, and cut the per-activity step diagrams to one-line roles |
| F19 | Hygiene | Low | AP-157 unreachable-operation-reference | meta/techniques/agent-conduct.md:34 (rule links present-checkpoint-to-user, respond-checkpoint, yield-checkpoint without invoking); workflow-engine/activity-worker.md:67 (links orchestrator-conduct, "not a worker's to read"); workflow-design/techniques/TECHNIQUE.md:70, :91 (link verify-artifact-conforms in rules) | Rules name techniques by link with no work invoked | pre-existing | State the fact without the technique link |
| F20 | Hygiene | Low | AP-146 instruction-narrates-an-actor | resume-from-checkpoint.md:24 | "it confirms the orchestrator's `respond_checkpoint` has cleared the active checkpoint before the paused worker proceeds". This narrates the orchestrator and names the reader in the third person | pre-existing | "Call `resume_checkpoint { session_index }` before running the next step" |
| F21 | Hygiene | Low | AP-126 variable-description-one-line | workflow-design/activities/05-impact-analysis.yaml:19 — `preservation_required` description | Two sentences with a consumer tail ("so drafting frames each file to keep it") and path wiring ("the whole of the create path — that route reaches drafting without visiting this activity") | pre-existing | One line naming the value |

No High was raised, so none was withdrawn or downgraded. Every Medium was spot-confirmed:
- F1: grep of the four input lines against respond-checkpoint.md:24 and activity-loop.yaml:182.
- F6: finalize-activity.md:78 reads `{selected_exit}`, and neither technique declares it.
- F7: activity-worker.md:48 against resume-from-checkpoint.md:30–31.
- F15: `schemas/` at engine head holds no README.md, and docs/schemas.md headings were checked.
- F17: `grep impact_analysis` across workflow-design gives the single hit, plus write-artifact's `artifact_content` input and variable-binding.md:24.
- F18: re-read.

Considered and not raised:
- AP-105 on audit-rule-enforcement.md:14 (mechanism list copied from AP-79): the copy sits in the same walker, not another.
- AP-126 on the specimen `flag_on`/`unit_count` descriptions: sibling specimens carry the same per-case descriptions, so this is convention.
- AP-159 on the specimen's activities/ and techniques/: the specimen carve-out applies.
- AP-146 on workflow-engine/TECHNIQUE.md:38 "a worker passes": striking it leaves the source list incomplete.

## Files

The same #970 file can be read at two refs. All paths below are read at the worktree head.

- corpus/README.md — read
- corpus/canon/resources/anti-patterns.md — read
- corpus/canon/resources/design-principles.md — read
- corpus/canon/resources/schema-construct-inventory.md — read
- corpus/codebase-wiki/activities/README.md — read
- corpus/meta/README.md — read
- corpus/meta/activities/README.md — read
- corpus/meta/activities/patterns/README.md — read
- corpus/meta/resources/README.md — read
- corpus/meta/resources/workflow-canonical.md — read
- corpus/meta/techniques/variable-binding.md — read
- corpus/meta/techniques/workflow-engine/TECHNIQUE.md — read
- corpus/meta/techniques/workflow-engine/activity-worker.md — read
- corpus/meta/techniques/workflow-engine/respond-checkpoint.md — read
- corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md — read
- corpus/meta/techniques/workflow-engine/take-activity.md — read
- corpus/meta/techniques/workflow-engine/yield-checkpoint.md — read
- corpus/ponytail/activities/README.md — read
- corpus/prism-audit/README.md — read
- corpus/prism-audit/activities/README.md — read
- corpus/substrate-node-security-audit/activities/README.md — read
- corpus/work-package/activities/README.md — read
- corpus/work-packages/README.md — read
- corpus/workflow-authoring/resources/elicitation-guide.md — read
- corpus/workflow-authoring/resources/update-mode-guide.md — read
- corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md — read
- corpus/workflow-design/README.md — read
- corpus/workflow-design/activities/05-impact-analysis.yaml — read
- corpus/workflow-design/activities/README.md — read
- corpus/workflow-design/resources/design-assumptions.md — read
- corpus/workflow-design/resources/elicitation-guide.md — read
- corpus/workflow-design/resources/format-conventions.md — read
- corpus/workflow-design/resources/impact-analysis.md — read
- corpus/workflow-design/resources/pattern-analysis.md — read
- corpus/workflow-design/resources/structural-inventory.md — read
- corpus/workflow-design/resources/update-mode-guide.md — read
- corpus/workflow-design/techniques/TECHNIQUE.md — read
- corpus/workflow-design/techniques/audit-rule-enforcement.md — read
- corpus/workflow-design/techniques/impact-analysis.md — read
- corpus/workflow-design/techniques/pattern-analysis.md — read
- corpus/workflow-design/techniques/scope-definition.md — read
- docs/README.md — read
- corpus/meta/routines/activity-loop.yaml — read
- corpus/meta/techniques/workflow-engine/resume-worker.md — read
- corpus/meta/techniques/workflow-engine/compose-prompt.md — read
- corpus/meta/techniques/workflow-engine/present-checkpoint-to-user.md — read
- corpus/meta/techniques/agent-conduct.md — read
- corpus/meta/techniques/workflow-engine/README.md — read
- (#971) corpus/specimens/schema-hygiene-conformance/README.md — read
- (#971) corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml — read
- (#971) corpus/specimens/schema-hygiene-conformance/activities/02-gate-exit.yaml — read
- (#971) corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md — read
- (#971) corpus/specimens/schema-hygiene-conformance/workflow.yaml — read
- (#971) walks/roster.json — read

## Ledger re-affirmation

The ledger is ledgers/binding-fidelity-triage.json, stamped corpusSha 7062aa0a. It holds three entries whose site is one of the three #970-touched files. Each was checked against head 0d56c951.

- **dead-output, `meta/techniques/workflow-engine/yield-checkpoint.md` (ledger line 248). Output `yielded_checkpoint`, verdict harmless, rationale `shared-op-return-contract`. Re-affirmed.**
  - The entry's site carries no line number.
  - At head, yield-checkpoint.md:18 still declares `### yielded_checkpoint`. The `yielded` branch (:32) still emits it.
  - No file outside yield-checkpoint.md names it (corpus grep).
  - It is still a meta/ shared library operation, so "no consumer inside the corpus is the expected state" still holds.
  - #970 reworded only the parenthetical on line 32.
- **dead-output, `workflow-design/techniques/TECHNIQUE.md` (ledger line 255). Output `workflow_files`, verdict harmless, rationale `container-contract-shape`. Re-affirmed.**
  - At head, TECHNIQUE.md:26 still declares `### workflow_files` on the workflow-root container. Its `####` components are unchanged in kind.
  - #970 changed only the `#### activity_files` wording, "transitions" → "exits" (:36).
  - It is still a group-shape output no single bind site consumes.
- **read-resolution, `meta/techniques/variable-binding.md:43`. `{current_task.crate}`, verdict harmless, rationale `documentation-notation`. Re-affirmed. The cited line holds the construct at head.**
  - Line 43 is the `binding-carries-only-deviations` rule, whose illustrative `inputs: { scope: '-p {current_task.crate}' }` is metasyntax, not a read.
  - At the stamp commit 7062aa0a the construct sat at line 32. The ledger already carries the corrected :43, which matches both the #970 base and head.
  - #970's edits to this file are same-length line replacements at lines 3, 33, 57 and 67. None moved line 43.
