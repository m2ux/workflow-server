# Walk 4 F: anti-patterns.md (Overview, Entry identity, Canon Hygiene, Technique Protocol, Draft Hygiene)

- **Worktree:** /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals, branch `workflow/canon-audit-residuals`, HEAD c1ae16f8.
- **Base:** bcf31337. Commits walked: 83d6f046, 0e764ad3, c1ae16f8.
- **Engine consumer checks:** /home/mike1/projects/dev/workflow-server/.worktrees/schema-description-hygiene — src/tools/workflow-tools.ts (respond_checkpoint :2763–2771, resume_checkpoint :2636, exitReport :766–780, next_activity :1223–1349), schemas/activity.schema.json (exit `immediate` :579, action `set` :245–280, checkpoint options :357–390), src/loaders/schema-loader.ts:16, src/loaders/technique-ref.ts, src/loaders/technique-loader.ts:97–125, guards/check-inventory-schema-agreement.ts:37–38.

## Units

- Overview (catalogue overview and Creation Rules: Smell not stance, Audit technique boundary, Entry intro, Detect triad, Keep audit signals, Resist over-fit, Succinctness): walked. Applied to the two catalogue edits (c1ae16f8: AP-63, AP-100) and, for Audit technique boundary, to the audit techniques on the surface (audit-rule-enforcement, reconcile-design-assumptions). No finding.
- Entry identity: walked. No AP/MR number is cited outside the catalogue's own headings anywhere in the corpus; reconcile-design-assumptions.md:39 now cites `pass-orchestration-in-technique` by kebab name (walk3-F16 closed). Numbering is contiguous.
- AP-103. cited-home-owns-claim: walked (including the AP-63 and AP-100 edits)
- AP-104. operative-criteria-need-a-home: walked (including the AP-63 and AP-100 edits)
- AP-105. no-shadow-audit-pass: walked (including the AP-63 and AP-100 edits)
- AP-106. canon-layer-cites-not-restates: walked (including the AP-63 and AP-100 edits)
- AP-107. bind-site-is-orchestration-truth: walked (including the AP-63 and AP-100 edits)
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
- MR-1. cut-comment-jsdoc-verbosity: walked. The one new YAML comment (activity-loop.yaml:188) states non-local coupling, which the entry exempts.
- MR-2. no-dense-prose-after-config-examples: walked
- MR-3. worktree-root-placeholders: walked. The only literal home path on the surface is the entry's own exemplar (anti-patterns.md:1632).
- MR-4. no-parallel-runbook-when-setup-covers-it: not-applicable — "Parallel runbooks that restate clone/install/build/start already in SETUP"; no surface file carries one.
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
- AP-138. output-without-destination: walked. Every output the round added (format_conventions, applicable_constructs, design_specification, scope_manifest_report in both twins, reviewed_blocks) is written by a save step.
- AP-139. framing-outside-any-section: walked. The touched resources with anchored citers (applicable-constructs, draft-attestation, impact-analysis) carry orientation-only H1 framing, so the verdict is not raised.
- AP-140. declared-input-never-read: walked
- AP-141. apply-omits-declared-input: walked
- AP-142. branch-on-undeclared-threshold: walked
- AP-143. inherited-rules-re-enumerated: walked
- AP-144. reference-without-provenance: walked
- AP-145. pre-session-prose-defers-to-the-framework: not-applicable — "On a surface delivered before a session exists — the `discover` bootstrap procedure"; no bootstrap surface is on the change surface.
- AP-146. instruction-narrates-an-actor: walked
- AP-147. rule-binds-beyond-its-operation: walked
- AP-148. inherited-input-re-declared: walked. No workflow-engine leaf redeclares the new container `exit_id` or `step_manifest`; the three `checkpoint_reply` declarations are leaf-only now that the container carries none.
- AP-149. schema-semantics-restated: walked
- AP-150. engine-internals-narrated: walked
- AP-151. value-set-in-prose: walked
- AP-152. one-invariant-per-rule: walked
- AP-153. call-omits-conditionally-required-argument: walked. Each call signature on the touched engine techniques was checked against the handler parameters.
- AP-154. call-omits-required-argument: walked
- AP-155. call-names-an-undeclared-argument: walked
- AP-156. protocol-phase-as-list-item: walked
- AP-157. unreachable-operation-reference: walked
- AP-158. produce-path-without-a-reading: walked
- AP-159. construct-folder-without-a-readme: walked
- AP-160. relocation-without-a-preserved-outcome: walked. Each persist phase the round removed was matched to its receiving save step (filename, mode gate, bind site).
- AP-161. unproducible-declared-value: walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| F1 | Live | High | AP-144 reference-without-provenance | workflow-design/activities/05-impact-analysis.yaml:86–95 `record-impact-correction` (`set target: impact_correction`, message "The correction the reader's reply to the impact review carries…"); :73–79 option `revise-impact` ("the reply carries the correction"); :18–20 | The worker runs this step after it is resumed. Nothing it receives carries correction text. `respond_checkpoint` takes only `option_id`, `auto_advance` or `condition_not_met` (workflow-tools.ts:2763–2771). `resume_checkpoint` returns the resolved option, `variables_changed` and `exit` (:2636). A checkpoint option can carry only `setVariable` and `exit` (activity.schema.json:357–390). compose-prompt's `context-travels-as-state` bars putting it in the stub. So the worker improvises `impact_correction`, and the re-run's impact-analysis.md:51 applies whatever it wrote. The round's own claim, "revise-impact records the user's correction in impact_correction", does not hold. The same unsupplied "reply carries" form is already in 03:77–83 `record-design-context` and in work-package 10:150–155 and residual-assumption-interview (all pre-existing). | diff (0e764ad3) | Give the correction a supplier the worker receives, such as a value the resolving call lands in the bag. Otherwise delete the record step, the `impact_correction` input and the "reply carries" wording |
| F2 | Contract | Medium | AP-160 relocation-without-a-preserved-outcome | workflow-design/activities/06-scope-and-draft.yaml:210–213 `revise-file-approach`; :177–186 `persist-drafting-plan`; assemble-file-approach.md (base phase "2. Persist Drafting Plan", removed) | At base, the revise re-bind persisted the revised plan through assemble-file-approach's own phase 2 ("updated in place each file iteration"). The persist now lives only in `persist-drafting-plan`, which runs before `file-approach-confirmed`. After a `revise` answer the revised `{drafting_plan}` lands in the bag, but nothing writes drafting-plan.md or refreshes `drafting_plan_path`, so the file keeps the approach the reader rejected. Neither site states this. | diff (0e764ad3) | Add a save of `drafting_plan` after `revise-file-approach` (`when: file_approach_disposition == 'revise'`), as `refresh-enforcement-findings` does in 08 |
| F3 | Hygiene | Medium | AP-108 numbered-protocol-phases | workflow-design/techniques/review-draft-yaml.md:41–44 `### 2. Record Draft Attestation` | Bullet 1 closes `{reviewed_blocks}` with the attestation line. Bullet 2 is a separate binding-fidelity pass that must "Flag gaps for revision before attestation closes", yet it is listed after the close. The two bullets have different outcomes, and the second must finish before the first. | pre-existing (base phase 3 held both bullets; the round renumbered it and rewrote bullet 1) | Split into `### 2. Check Binding Fidelity` and then `### 3. Record Draft Attestation` |
| F4 | Hygiene | Low | AP-136 phase-cited-by-ordinal | meta/techniques/variable-binding.md:45, rule `an-argument-position-sets-its-own-default` | "is what Phase 2's disambiguation rule governs". This ordinal sits in `## Rules`, outside the Protocol that owns the numbering. 83d6f046 wrote it in place of the deleted rule's name. | diff (83d6f046) | Anchor the heading (`[Bind the Inputs](#2-bind-the-inputs)`) or say "the disambiguation rule" without the ordinal |
| F5 | Hygiene | Low | AP-129 stale-restatement-after-change | workflow-design/techniques/persist-design-specification.md:8 `## Capability`; 03-requirements-refinement.yaml:115 step `persist-specification` | Capability still reads "Durable planning-folder review surface for the accumulated design specification". Since 0e764ad3 the technique assembles `{design_specification}` and writes no file: the 03 save step does. The README row (:115) was updated to "Assemble…", but the Capability was not. | diff (0e764ad3) | Restate the Capability as the product, e.g. "The design specification for linked review" |
| F6 | Hygiene | Low | AP-126 variable-description-one-line | workflow-design/activities/05-impact-analysis.yaml:20 `impact_correction`; :23 `impact_revision_requested` | :20 is two sentences with a producer tail: "…, from each `revise-impact` reply in order. Absent until the reader revises the scope." :23 is lifecycle wiring: "True between the reader asking to revise … and that reply's correction landing in `impact_correction`." | diff (0e764ad3) | One line naming the value, e.g. "The reader's corrections to the impact scope" and "Whether a requested impact revision is not yet recorded" |
| F7 | Hygiene | Low | AP-118 no-bind-mechanics-as-prose | workflow-design/activities/05-impact-analysis.yaml:92, action message | "…so the next impact pass reads it from the bag". The clause only explains how the value reaches impact-analysis's input, which is the same-name bind. The 03:83 sibling ("so dimension elicitation reads them from the bag rather than from the exchange") is pre-existing. | diff (0e764ad3) | Delete the clause |
| F8 | Hygiene | Low | AP-151 value-set-in-prose | workflow-design/techniques/context-loading.md:14, input `operation_type` | "The classified operation — `create`, `update` or `review`." The declarations at 01:33–35 and 08:61–63 carry no `values`. This is a new site of walk3-F21. | diff (0e764ad3) | Declare `values: [create, update, review]` on the variable, and cut the set here |
| F9 | Hygiene | Low | AP-129 stale-restatement-after-change | workflow-design/techniques/context-loading.md:46 | "Load all five JSON schema definitions from `workflow-server://schemas` (workflow, activity, technique, condition, state)". The server serves workflow, activity, condition, technique and session-file (schema-loader.ts:16), and no `state` schema exists. The file was touched this round. | pre-existing | Name `session-file` in place of `state`, or cite the inventory's statement of what the URI serves |
| F10 | Contract | Low | AP-107 bind-site-is-orchestration-truth | prism-update/activities/README.md:37 ("across resources, skill routing, and documentation, in that order"), :41 (the check list); work-package/activities/README.md:77 ("implement-test-commit-log-self-review cycle"), :85 ("tags … harvests … records"), :93 ("through manual diff review, code review, structural analysis and test-suite review") | These are ordered step lists and pass inventories that are not generated from `steps[]`. c1ae16f8 cut the sibling sections in both files to one-line roles, and edited :85 itself, but left these. | pre-existing (files and lines touched) | One-line role per activity |
| F11 | Contract | Medium | AP-107 bind-site-is-orchestration-truth | substrate-node-security-audit/README.md:135–168 (sub-agent activity step flows) | Step-by-step mermaid flows for sub-crate-review, sub-static-analysis and sub-toolkit-review, not generated from `steps[]`. c1ae16f8 touched :220 of this file. The work-packages half of walk3-F13 is fixed. | known — not fixed (walk3-F13) | Cut to roles, or point at the YAML |
| F12 | Contract | Medium | AP-141 apply-omits-declared-input | meta/techniques/workflow-engine/continue-batch.md:43 and resume-worker.md:38 (continue-agent without `agent_id`); continue-batch.md:52 (compose-prompt with only `holds_prior_deliveries: false`) | Unchanged by the round, although both files were edited. | known — not fixed (walk3-F18) | Name the omitted inputs at each Apply site |
| F13 | Hygiene | Low | AP-150 engine-internals-narrated | resume-worker.md:49; commit-and-persist.md:66 | "the stored answer, which is keyed by activity and checkpoint alone"; "`session.json` and `.session-token` are written by the server on every authenticated tool call". | known — not fixed (walk3-F19) | Keep the invariant, drop the machinery |
| F14 | Hygiene | Low | AP-126 variable-description-one-line | workflow-design 01:31, :38; 03:33, :37, :41; 06:18, :82; 08:24, :35 | Producer, consumer and gate tails still present ("from prepare-dimension", "drives the … while-loop", "contributes to Gate 1", "from audit-X"). | known — not fixed (walk3-F20) | One line naming the value |
| F15 | Hygiene | Low | AP-151 value-set-in-prose | workflow-design 01:33–35, 08:61–63 `operation_type` | Still "— create, update, or review" with no `values`. | known — not fixed (walk3-F21) | Declare `values` and cut the set from the prose |
| F16 | Hygiene | Low | AP-120 procedure-in-capability | continue-batch.md:8 | "Reached only across an activity boundary; a gate answered by a user takes `resume-worker` instead." | known — not fixed (walk3-F23) | Keep the product statement and delete the trigger clause |
| F17 | Hygiene | Low | AP-135 tool-contract-restated-in-protocol | compose-prompt.md:44 | "`context_tokens` is the agent's context window size and is **required**". The round trimmed the same bullet but kept this. | known — not fixed (walk3-F24) | Drop the shape and keep the `activity_id` obligation |

**Highs:** F1 was re-derived from the files and the entry alone, and it holds:

- The step is a worker step in 05. Its only source is "the reader's reply".
- No worker-facing return carries reply text: respond_checkpoint's zod parameters (:2767–2771), resume_checkpoint's description (:2636), and the option schema's `effect` (setVariable and exit only).
- Orchestrator-side writes do not reach the worker either. present-checkpoint-to-user `a-correction-lands-in-the-bag` writes the orchestrator's bag. compose-prompt phase 1 emits only the identity bindings, and `context-travels-as-state` forbids prose in the stub.
- The revise exit now continues past the gate (the `immediate` flag was removed; activity.schema.json:579), so the step does run and is reached.

No High was withdrawn or downgraded.

**Mediums spot-confirmed:**

- **F2:** base 06:170–213 (via `git show bcf31337:`) binds `revise-file-approach` to assemble-file-approach, whose base phase 2 persisted. HEAD has no save after :213.
- **F3:** base review-draft-yaml phase 3 held the same two bullets.
- **F11 and F12:** the lines were re-read at HEAD.

**Third-pass findings closed by the round:** walk3-F1 to F11, F15 and F16; F12 on the surface sites; the work-packages half of F13; and F14 at the three sections it named.

**Considered and not raised:**

- **workflow-design/techniques/scope-definition.md:71 (outside this slice; flag for the Coupling slice).**
  - 0e764ad3 changed the phase-6 reads to `{$structural_design}` and `{$drafting_order}`. It followed walk3-F's "considered" note, and that note was wrong.
  - Under `bind-protocol-locals`, `{$name}` appears only at the producing phase (4 and 5), and reads are bare `{name}`. The locals now have no bare read, which is a dead binding.
  - yield-checkpoint.md:25 went the other way in the same round (`{$checkpoint_id}` bind, bare `{checkpoint_id}` read), which is the correct form.
  - Route to `bind-protocol-locals`, and revert the phase-6 reads to bare braces.
- **fan/enter-fan.md:28 `step_manifest`.** 83d6f046 declared it optional. activity-loop's enter-fan step (:87–97) binds no `step_manifest`, and the bag holds none, so the call never carries one; the server only warns. This is the family #973 tracks for dispatch.
- **08 `refresh-enforcement-findings` (`when: enforcement_finding_count > 0`).** When a re-audit reaches 0, the satellite keeps the last non-zero findings. This matches the sibling satellites and findings-satellite.md's "Write only when count > 0".
- **01 Gate 1 mode flip (pre-existing).**
  - `confirm-update` (01:105–112) can move a create-classified run to update after intake-classification skipped the inventory (intake-classification.md:85–86).
  - `persist-structural-inventory` (01:128–136) then writes an unproduced `structural_inventory`, and 05 reads it.
  - AP-128 keys on a producer gated by `when` or `condition`, and here the gate is inside the technique's Protocol, so the entry's letter does not fire. It is a real flow gap worth a look.
- **Commit subject accuracy.** "Write every workflow-design report through its save step" does not hold for audit-principles, audit-anti-patterns, audit-expressiveness, audit-conformance, audit-rule-hygiene (off surface) or create-completion-doc (closure, phase 4), which still self-persist. In the 08 review loop, principle and anti-pattern findings are written twice, under different names. No unit in this slice keys on it.
- **Catalogue edits (Canon Hygiene).**
  - The AP-63 carve-out is grounded in the consumer: guards/check-inventory-schema-agreement.ts:38 matches `(\w[\w-]*\.schema\.json)` bare in `##` headings.
  - The AP-100 carve-out conflicts with no principle; design-principles has no runtime-rules stance.
  - Neither edit cites a home, restates a sibling Detect, or breaks Entry intro, Resist over-fit or Succinctness.
- **Inventory :14 (c1ae16f8).** It lists four served schemas, while the server also serves session-file. The routine claim is true, and the sentence does not claim to be exhaustive. Route to `no-false-resource-delivery` if completeness is wanted.
- **Entry identity against `whole-resource-for-one-section`.** An anchored citation of one entry (`#ap-114-…`) necessarily carries the number, which Entry identity forbids. The canon's own form, `[anti-patterns](…): \`name\``, is the convention. reconcile-design-assumptions:39 follows it, so it is not flagged.
- **compose-prompt.md:43.** "carrying the `checkpoint_reply` substitution" names the value in a form other than its declared input `{checkpoint_reply}`. `reference-without-provenance` excludes wrong-form targets, so route to `anchored-protocol-references`.
- **present-checkpoint-to-user.md:26.** "phase 2 … phase 5" are ordinals inside the Protocol that owns them, which the entry's carve-out covers.
- **workflow-authoring/techniques/workflow-definition/verify-high-findings.md:55.** Its link to audit-canon's phase is `unreachable-operation-reference`, but it is pre-existing and ledgered fix-later (unserved-operation-ref-triage.json:2051).
- **substrate README dispatch claims (:9, :17, :79, :122).** They conflict with activities/README.md:5 on who opens A/B/D. This is walk3-B18, principle 40, in slice B.
- **workflow-authoring/techniques/TECHNIQUE.md:36.** It still links verify-artifact-conforms from `canonical-home-map`, which is the twin of the site the round fixed. It is off surface and ledgered fix-later (:2015).
- **Focus checks with no finding.**
  - `checkpoint_reply` is declared only on activity-worker, compose-prompt and resume-worker, is produced by respond-checkpoint, and is cleared by `clear-checkpoint-reply`. The gate `when: checkpoint_reply` is a bare-name truthiness test, which step-control.md defines.
  - `continue-batched-worker` binds `exit_id` and `step_manifest` explicitly. The dispatch and take paths remain the #973 family.
  - Every save step the Focus names binds the path its gate links: 03 `specification_path`, and 06 `drafting_plan_path`, `file_review_note_path` and `draft_attestation_path`. 09's Gate 2 links resolve.
  - `scope_manifest_report` is produced and written in both twins. The drafting loop, scope-verification, scope-audit, compose-publication, create-completion-doc and readme-authoring still read `scope_manifest` as the file list.

## Triage-ledger edits

- **83d6f046, ledgers/binding-fidelity-triage.json:367 (`meta/techniques/variable-binding.md:43` → `:24`, `{current_task.crate}`, harmless, documentation-notation).** This matches the file. variable-binding.md:24 is the Phase 2 disambiguation bullet, which now carries `(inputs: { scope: '-p {current_task.crate}' })` as metasyntax. The old :43 rule `binding-carries-only-deviations` was deleted. The matcher keys on the site without its line, so this is a correctness-only change.
- **0e764ad3, ledgers/unserved-operation-ref-triage.json (entry `corpus/workflow-design/techniques/TECHNIQUE.md:70`, op `verify-artifact-conforms`, deleted).** This matches the file, and the deletion hides no live reference.
  - TECHNIQUE.md:70 (`canonical-home-map`) and :91 (`line-budget`) now read "the planning-artifact conformance check", with no link.
  - The file holds no link or `::` to any technique.
  - Base carried one entry for the file and op, and none is left.
  - The only remaining `verify-artifact-conforms` mentions in workflow-design are the bare backticked example in yaml-authoring.md:219, which is neither a link nor `::`, and the README tables (orientation surfaces).
- **Ledger hygiene only.** Round 3 shifted lines in files with kept unserved-ref entries: context-loading (+6), activity-worker (+4), compose-prompt (+4), continue-batch (−8), resume-worker (+4). Kept entries such as context-loading.md:40/:50/:54 now sit at :46/:54/:58. That ledger has no line-correction convention, and the guard passes.

## Files

- corpus/canon/resources/anti-patterns.md: read
- corpus/canon/resources/schema-construct-inventory.md: read
- corpus/meta/activities/03-dispatch-client-workflow.yaml: read
- corpus/meta/activities/04-end-workflow.yaml: read
- corpus/meta/routines/activity-loop.yaml: read
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
- corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md: read
- corpus/meta/techniques/workflow-engine/resume-worker.md: read
- corpus/meta/techniques/workflow-engine/take-activity.md: read
- corpus/meta/techniques/workflow-engine/yield-checkpoint.md: read
- corpus/prism-audit/README.md: read
- corpus/prism-audit/techniques/README.md: read
- corpus/prism-update/activities/README.md: read
- corpus/substrate-node-security-audit/README.md: read
- corpus/work-package/README.md: read
- corpus/work-package/activities/README.md: read
- corpus/work-packages/README.md: read
- corpus/workflow-authoring/activities/06-scope-and-draft.yaml: read
- corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md: read
- corpus/workflow-authoring/techniques/workflow-definition/scope-definition.md: read
- corpus/workflow-authoring/techniques/workflow-definition/yaml-authoring.md: read
- corpus/workflow-design/README.md: read
- corpus/workflow-design/activities/01-intake-and-context.yaml: read
- corpus/workflow-design/activities/03-requirements-refinement.yaml: read
- corpus/workflow-design/activities/05-impact-analysis.yaml: read
- corpus/workflow-design/activities/06-scope-and-draft.yaml: read
- corpus/workflow-design/activities/08-quality-review.yaml: read
- corpus/workflow-design/resources/applicable-constructs.md: read
- corpus/workflow-design/resources/draft-attestation.md: read
- corpus/workflow-design/resources/impact-analysis.md: read
- corpus/workflow-design/techniques/TECHNIQUE.md: read
- corpus/workflow-design/techniques/assemble-file-approach.md: read
- corpus/workflow-design/techniques/audit-rule-enforcement.md: read
- corpus/workflow-design/techniques/context-loading.md: read
- corpus/workflow-design/techniques/impact-analysis.md: read
- corpus/workflow-design/techniques/intake-classification.md: read
- corpus/workflow-design/techniques/persist-design-specification.md: read
- corpus/workflow-design/techniques/reconcile-design-assumptions.md: read
- corpus/workflow-design/techniques/review-draft-yaml.md: read
- corpus/workflow-design/techniques/review-drafted-file.md: read
- corpus/workflow-design/techniques/scope-definition.md: read
- corpus/workflow-design/techniques/verify-high-findings.md: read
- corpus/workflow-design/techniques/yaml-authoring.md: read
- ledgers/binding-fidelity-triage.json: read (the round's diff whole, the note, and the entries for every touched site)
- ledgers/unserved-operation-ref-triage.json: read (the round's diff whole, the note, and the entries for every touched site)
- (closure) corpus/meta/techniques/fan/retire-branch.md: read
- (closure) corpus/meta/techniques/workflow-engine/respond-checkpoint.md: read
- (closure) corpus/prism-audit/activities/02-execute-analysis.yaml: read
- (closure) corpus/prism-evaluate/activities/02-execute-analysis.yaml: read
- (closure) corpus/work-package/activities/10-post-impl-review.yaml: read
- (closure) corpus/work-package/resources/workflow-retrospective.md: read
- (closure) corpus/workflow-authoring/activities/08-quality-review.yaml: read
- (closure) corpus/workflow-authoring/activities/09-validate-and-commit.yaml: read
- (closure) corpus/workflow-authoring/techniques/workflow-definition/compile-report.md: read
- (closure) corpus/workflow-authoring/techniques/workflow-definition/compose-publication.md: read
- (closure) corpus/workflow-authoring/techniques/workflow-definition/create-completion-doc.md: read
- (closure) corpus/workflow-authoring/techniques/workflow-definition/readme-authoring.md: read
- (closure) corpus/workflow-authoring/techniques/workflow-definition/scope-verification.md: read
- (closure) corpus/workflow-authoring/techniques/workflow-definition/verify-high-findings.md: read
- (closure) corpus/workflow-authoring/workflow.yaml: read
- (closure) corpus/workflow-design/activities/09-validate-and-commit.yaml: read
- (closure) corpus/workflow-design/activities/10-post-update-review.yaml: read
- (closure) corpus/workflow-design/activities/11-retrospective.yaml: read
- (closure) corpus/workflow-design/techniques/apply-audit-fixes.md: read
- (closure) corpus/workflow-design/techniques/create-completion-doc.md: read
- (closure) corpus/workflow-design/techniques/publish-workflow-pr.md: read
- (closure) corpus/workflow-design/techniques/scope-audit.md: read
- (closure) corpus/workflow-design/techniques/scope-verification.md: read
- (closure) corpus/workflow-design/workflow.yaml: read
