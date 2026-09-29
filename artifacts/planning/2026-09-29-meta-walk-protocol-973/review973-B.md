# Review 973, canon slice B: anti-pattern families 8 to 13, and Creation Rules

Corpus PR #991: `/home/mike1/projects/dev/workflow-server/.worktrees/meta-walk-protocol`, head `f093a318`, base `03dfd4e2`.
Engine PR #978: `/home/mike1/projects/dev/workflow-server/.worktrees/fan-barrier-destination`, head `3807a6c2`, base `c9edbebe`. The engine was read as the consumer for claims about what `next_activity` returns.

## Checks run

- **Guards:** `guards/check-all.ts --root <meta-walk-protocol>`, run from the engine worktree. 56 of 56 pass, none fail, none unmeasured. Output is in `B973-guards.txt`.
- **Roster:** `walks/check-roster.sh`, run under sbx, exits 0. `exitless-end` is in `notWalked`, and its reason matches the siblings' wording ("Declares no checkpoint…").
- **Snapshot (`walks/snapshot.test.ts.snap`):** the diff accounts exactly for the new steps.
  - `declaredTotal` is 338 at the base and 341 at head, and `post-impl-review` goes from 51 to 54. The three new steps are `clear-checkpoint-reply` (#976), `spend-entered-activity` and `end-walk`.
  - `gatesReadUnbound` gains `clear-checkpoint-reply:checkpoint_reply`, `end-walk:worker_result` and `spend-entered-activity:post_impl_review_walk_prism_child_activity_entered`. These have the same shape as the sibling `fan_convergence_activity` and `worker_result` rows.
  - Only the work-package snapshot exists. It is the only snapshotted workflow that runs `activity-loop` (via `walk-prism-child`).
- **Option coverage (`walks/option-coverage.json`):**
  - This PR leaves the file unchanged. `design-intent-batch=wrong-review-target` stays on the "agent-produced value" list, and the `retarget` route does not change that.
  - `scope-and-structure-confirmed=revise` is not on the ratchet, so a coverage walk reaches it, now through `redraft`. I did not run the coverage walk itself (it needs the live walk harness).
- **Ledgers (`ledgers/`):**
  - `unserved-operation-ref-triage.json` has entries on `enter-fan.md`, `spawn-branches.md`, `continue-batch.md`, `dispatch-activity.md` and `take-activity.md`. Their line numbers are stale, but the guard keys on the path and op with the line number dropped (`check-unserved-operation-refs.ts:159-161`), so no entry goes stale. The diff adds no new technique link.
  - `repeated-run-baseline.json` cites the three `activity-loop` reference sites, and their `with:` signature (`enter_activity, initial_activity, planning_folder_path, session_index`) is unchanged.
  - No other ledger cites a site this PR moved or closed.

## Units

### Creation Rules

- Smell not stance — not-applicable — "An add or an edit lands only after Succinctness": #991 adds and edits no catalogue entry, and `anti-patterns.md` is untouched.
- Entry identity — not-applicable — same wording, no entry added or edited.
- Audit technique boundary — not-applicable — same wording, no entry added or edited.
- Entry intro — not-applicable — same wording, no entry added or edited.
- Detect triad — not-applicable — same wording, no entry added or edited.
- Keep audit signals — not-applicable — same wording, no entry added or edited.
- Resist over-fit — not-applicable — same wording, no entry added or edited.
- Succinctness — not-applicable — same wording, no entry added or edited.

### Tool-Technique-Doc Consistency

- AP-71. no-false-resource-delivery — walked
- AP-72. complete-bootstrap-path — walked
- AP-73. consistent-tool-names — walked
- AP-74. no-duplicated-guidance — walked
- AP-75. describe-tool-value — walked
- AP-76. no-redundant-tools — walked

### Execution

- AP-77. impl-before-confirmed-approach — not-applicable — "Authoring-session smells". Detect keys on "modifications begin before the user has confirmed", which session conduct shows and a definition does not.
- AP-78. follow-through-on-recommend — not-applicable — "Authoring-session smells". Detect keys on "the agent emits recommendations … and stops".
- AP-79. structure-backed-constraints — walked
- AP-80. preserve-readme-content — walked
- AP-81. verify-format-literacy — walked
- AP-82. work-through-activities — not-applicable — "Authoring-session smells". Detect keys on results "combined, advanced, or closed outside the workflow's defined activities" by an agent in session.
- AP-83. accept-correction — not-applicable — "Authoring-session smells". Detect keys on "the agent disputes a user correction".

### Output Economy

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

### Canon Hygiene

- AP-103. cited-home-owns-claim — walked
- AP-104. operative-criteria-need-a-home — walked
- AP-105. no-shadow-audit-pass — walked
- AP-106. canon-layer-cites-not-restates — walked
- AP-107. bind-site-is-orchestration-truth — walked

### Technique Protocol

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

### Draft Hygiene

- AP-126. cut-comment-jsdoc-verbosity — walked
- AP-127. no-dense-prose-after-config-examples — walked
- AP-128. worktree-root-placeholders — walked
- AP-129. no-parallel-runbook-when-setup-covers-it — walked
- AP-130. variable-description-one-line — walked
- AP-131. bag-value-as-literal — walked
- AP-132. unproduced-value-read — walked
- AP-133. stale-restatement-after-change — walked
- AP-134. artifact-name-is-filename — walked
- AP-135. resource-id-names-its-content — walked
- AP-136. deployment-path-in-capability — walked
- AP-137. overlapping-rule-scopes — walked
- AP-138. whole-resource-for-one-section — walked
- AP-139. tool-contract-restated-in-protocol — walked
- AP-140. phase-cited-by-ordinal — walked
- AP-141. unowned-harness-capability — walked
- AP-142. output-without-destination — walked
- AP-143. framing-outside-any-section — walked
- AP-144. declared-input-never-read — walked
- AP-145. apply-omits-declared-input — walked
- AP-146. branch-on-undeclared-threshold — walked
- AP-147. inherited-rules-re-enumerated — walked
- AP-148. reference-without-provenance — walked
- AP-149. pre-session-prose-defers-to-the-framework — walked
- AP-150. instruction-narrates-an-actor — walked
- AP-151. rule-binds-beyond-its-operation — walked
- AP-152. inherited-input-re-declared — walked
- AP-153. schema-semantics-restated — walked
- AP-154. engine-internals-narrated — walked
- AP-155. value-set-in-prose — walked
- AP-156. one-invariant-per-rule — walked
- AP-157. call-omits-conditionally-required-argument — walked
- AP-158. call-omits-required-argument — walked
- AP-159. call-names-an-undeclared-argument — walked
- AP-160. protocol-phase-as-list-item — walked
- AP-161. unreachable-operation-reference — walked
- AP-162. produce-path-without-a-reading — walked
- AP-163. construct-folder-without-a-readme — walked
- AP-164. relocation-without-a-preserved-outcome — walked
- AP-165. unproducible-declared-value — walked

**Totals:** 103 units. 91 walked, 12 not-applicable (8 Creation Rules and 4 Execution entries), none blocked.

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|---|---|---|---|---|---|---|---|
| B1 | Contract | Medium | AP-107 `bind-site-is-orchestration-truth` | `corpus/meta/techniques/workflow-engine/continue-batch.md:64`, `## Rules` › `one-advance-per-activity`, paragraph 2 | "the paths that reach `dispatch-activity` are the ones this technique made no advance on: the first activity of a walk, the activity after the orchestrator released a spent batch's identity (…), and the activity a fan's last branch retirement entered, which that dispatch carries without a second advance." This is a complete list of the loop states in which `activity-loop`'s `enter-activity` step binds `dispatch-activity`. The authoritative source is that step's `when` and its `activity_entered` bind (`activity-loop.yaml:80-93`, `:163-173`), and this PR had to extend the prose by hand when the bind changed, which is the entry's test. The added clause also fires `instruction-narrates-an-actor` and `rule-binds-beyond-its-operation`: it states dispatch-activity's behaviour on a path continue-batch never runs, since the loop gates continue-batch off fans. | diff (the enumeration was pre-existing; #991 changed it) | Delete the enumeration. Keep the invariant that a batch that cannot continue ends inside this technique, and point to `activity-loop`'s `enter-activity` step for where dispatch is reached. |
| B2 | Hygiene | Low | AP-120 `procedure-in-capability` | `corpus/meta/techniques/workflow-engine/dispatch-activity.md:8`, `## Capability` | "A target of `__terminal__` completes the session, and no worker is spawned." This is a mode branch in Capability. The branch already lives in Protocol phase 1's skip caveat and phase 2's "When `{activity_id}` is `__terminal__` … end here". take-activity carries the same behaviour and leaves its Capability unchanged. | diff | Delete the sentence from Capability. |
| B3 | Hygiene | Low | AP-98 `no-next-step-narration` | `corpus/workflow-design/activities/01-intake-and-context.yaml:119`, `design-intent-batch` › option `wrong-review-target` › `description` | "Rejects the review target set, and intake runs again to establish it from the request." The clause "intake runs again" narrates routing that `effect.exit: retarget` (:124) and `graph.intake-and-context.retarget: intake-and-context` (`workflow.yaml:47`) own. | diff | Cut the routing clause and keep "Rejects the review target set." |
| B4 | Hygiene | Low | AP-98 `no-next-step-narration` | `corpus/meta/activities/04-end-workflow.yaml:45`, `:48`; `corpus/workflow-design/activities/06-scope-and-draft.yaml:432` | The `confirm` option reads "Mark the session complete and exit". The `return` option reads "re-dispatch the orchestrator to address them". `pre-attestation-blocker` › `redraft` reads "Re-enter the drafting loop to correct the Critical finding before attestation." Each narrates the routing its `exit`/graph edge owns. | pre-existing | Delete the routing narration and keep what the answer means. |
| B5 | Contract | Low | AP-148 `reference-without-provenance` | `corpus/meta/techniques/workflow-engine/TECHNIQUE.md:28-30`, `## Inputs` › `variables_changed`. It merges into `yield-checkpoint.md:25`, `resume-from-checkpoint.md:25` and `finalize-activity.md:50`/`:82`. | The new container input reads "The bag writes of the activity an advance retires … Unset where the advance retires no activity." The engine delivers it to every workflow-engine technique as an inherited input. In the three techniques that make no advance, `variables_changed` now names two values: the inherited input, always unset there, and the value the Protocol means. For yield-checkpoint that value is "the values the steps before the gate produced", passed to `yield_checkpoint`. For resume-from-checkpoint it is the field the `resume_checkpoint` response returns. For finalize-activity it is the envelope field that technique populates. The container's own rule `variable-mutation-source` (:64) already separates the two senses, but the input does not. | diff | Name the supplier at each site where the name does not mean the inherited input, for example "the pre-gate values, not the inherited `variables_changed`". Or declare the input only on the techniques that advance: dispatch-activity, continue-batch and take-activity. |
| B6 | Contract | Medium | AP-109 `technique-outputs-declared` | `corpus/meta/techniques/fan/enter-fan.md:59`; `corpus/meta/techniques/workflow-engine/take-activity.md:34`; bind site `corpus/meta/routines/activity-loop.yaml:110-122` | Both techniques "capture `_meta.trace_token` per `dispatch-activity.accumulate-trace-per-advance`" and declare no `trace_tokens` output. dispatch-activity declares one (`dispatch-activity.md` `### trace_tokens`). The loop's `enter-fan` step binds no trace output and sets nothing, while `retire-branch` appends through an action (`:152-155`). The fan-opening call's token therefore has no destination. The cited rule says "a token dropped at any of those call sites is history no later reader can recover." | pre-existing | Declare `trace_tokens` under `## Outputs` on enter-fan and take-activity, as dispatch-activity does, and have the loop's `enter-fan` step append it. |
| B7 | Hygiene | Low | AP-119 `procedure-in-io-contract` | `corpus/meta/techniques/fan/enter-fan.md:48` (`### barrier_destination`); `corpus/meta/techniques/fan/retire-branch.md:26` (`### branch_envelopes`) | enter-fan: "— what the run continues from once every branch has been retired". This clause is kept unchanged from the base on a line #991 edited. retire-branch: "This call reads the one belonging to `{branch_activity}` and leaves the rest alone." Both state how the value is used, which is not what the value is. | pre-existing | Cut the use clauses. Protocol and `advance-past-fan` already carry them. |
| B8 | Hygiene | Low | AP-125 `technique-ref-in-io-contract` | `corpus/meta/techniques/workflow-engine/finalize-activity.md:64`, `#### next_activity_id` | "The `next_activity_id` output of [evaluate-transition](./evaluate-transition.md), carried unread." This is a technique hyperlink in an Output description. The `__terminal__`/no-exit contract it points at is the one #991 changed. | pre-existing | Describe the value (the destination the taken exit, or the absence of one, leads to) without the link. Protocol phase 2 already applies evaluate-transition. |
| B9 | Hygiene | Low | AP-115 `platform-semantics-in-capability` | `corpus/meta/techniques/workflow-engine/TECHNIQUE.md:8`, `## Capability` | "Every rule here is one both an orchestrator and a worker can act on; the boundaries a single role carries belong to that role's own technique." This is a placement lecture on a container Capability. | pre-existing | Delete the placement clause and keep the contribution statement. |
| B10 | Hygiene | Low | AP-128 `worktree-root-placeholders` | `defaultValue` in `corpus/specimens/gitnexus-api-surface-review-conformance/workflow.yaml:25`, `gitnexus-area-comprehension-conformance/workflow.yaml:39,43,51,55`, `gitnexus-doc-heading-lookup-conformance/workflow.yaml:28,36`, `gitnexus-doc-reference-surface-conformance/workflow.yaml:29,38`, `gitnexus-graph-for-tree-conformance/workflow.yaml:24`, `gitnexus-index-refresh-conformance/workflow.yaml:34`, `gitnexus-tool-surface-conformance/workflow.yaml:29,33` | The values are the literal machine roots `/home/mike1/projects/dev/workflow-server` and `/home/mike1/projects/dev/midnight-agent-eng/midnight-docs`. | pre-existing | Default these to a worktree-relative or seeded placeholder (for example `{host_repo_path}`), or require them at session start. |
| B11 | Hygiene | Low | AP-133 `stale-restatement-after-change` | `corpus/workflow-design/activities/README.md:65` | For 09 the README says "Terminal in create and review modes". The graph binds `validate-and-commit.create: retrospective`, and that default exit is taken in create and review, so 09 is not terminal in either mode. The same README says `retrospective` "is the terminal activity in every mode" (:5, :79). | pre-existing | Rewrite as "Leads to Retrospective (create, review) or Post-Update Review (update)". |

- **High and Live:** none raised, so none withdrawn.
- **Considered and not recorded:**
  - AP-74, for the near-identical `activity_entered` input and `__terminal__`/`activity_entered` caveats in dispatch-activity and take-activity. These are the two implementations of one `kind: technique` routine input, and the carve-out "A meta surface whose domain is tool usage" covers them.
  - AP-132, for `activity_entered` read by `when:`/bind before any producer. Routine internals admit no `defaultValue`, the reading technique declares unset as meaningful, and the sibling internals `fan_convergence_activity`, `worker_agent_id` and `checkpoint_reply` carry the same form, so it is convention. The snapshot's `gatesReadUnbound` records it alongside them.
  - AP-118, for the enter-fan and container `variables_changed` inputs naming their envelope source. The sibling `step_manifest` input carries the same form, so it is convention.

## Observations outside this slice (not findings)

- **03 at the iteration bound (Contract, pre-existing construct, behaviour changed by the diff):**
  - `meta/activities/03-dispatch-client-workflow.yaml` declares one exit, `"null"`, with `when: current_activity == null`, and no `isDefault`. It is the only activity in the corpus with exits and no default.
  - When `activity-cycle` stops at `maxIterations: 200`, no exit is taken. evaluate-transition's phase 5 ("Where no exit was taken — the activity declares none") now yields `__terminal__`, not null. The meta walk would therefore advance meta onto `__terminal__`, completing it without `end-workflow` or its closure checkpoint.
  - The outcome at :49 ("close-out can tell a completed run from one that stopped at the iteration bound") was already unreachable at the base, because the only exit requires a completed walk. Phase 5 also does not state what holds when exits are declared and none is taken.
- **Scope of routine outputs across uses (unverified):** prism-audit and prism-evaluate run `activity-loop` once per scope inside a `forEach`. If the routine output `from_activity` keeps the previous use's last activity, the next use's first take-activity names it as `from_activity` on a fresh child session. The engine refuses that: "Cannot exit '…': the session is not on it", `resolveRetiringActivity`, `workflow-tools.ts:1006-1021`. The routine schema says internals are "local to each use" and does not say how outputs are scoped, so I did not record it.
- **Engine source comment:** `workflow-tools.ts:1636-1637` states one reason (where the join comes from) and reads as a one-line why. AP-126 does not fire.

## Files

Touched by #991:
- `/home/mike1/projects/dev/workflow-server/.worktrees/meta-walk-protocol/corpus/meta/README.md` — read
- `…/corpus/meta/activities/03-dispatch-client-workflow.yaml` — read
- `…/corpus/meta/activities/04-end-workflow.yaml` — read
- `…/corpus/meta/activities/README.md` — read
- `…/corpus/meta/routines/activity-loop.yaml` — read
- `…/corpus/meta/techniques/fan/enter-fan.md` — read
- `…/corpus/meta/techniques/fan/retire-branch.md` — read
- `…/corpus/meta/techniques/fan/spawn-branches.md` — read
- `…/corpus/meta/techniques/workflow-engine/TECHNIQUE.md` — read
- `…/corpus/meta/techniques/workflow-engine/continue-batch.md` — read
- `…/corpus/meta/techniques/workflow-engine/dispatch-activity.md` — read
- `…/corpus/meta/techniques/workflow-engine/evaluate-transition.md` — read
- `…/corpus/meta/techniques/workflow-engine/take-activity.md` — read
- `…/corpus/prism-audit/activities/02-execute-analysis.yaml` — read
- `…/corpus/prism-evaluate/activities/02-execute-analysis.yaml` — read
- `…/corpus/specimens/README.md` — read
- `…/corpus/specimens/exitless-end/README.md` — read
- `…/corpus/specimens/exitless-end/activities/01-open.yaml` — read
- `…/corpus/specimens/exitless-end/activities/02-close.yaml` — read
- `…/corpus/specimens/exitless-end/workflow.yaml` — read
- `…/corpus/work-package/activities/10-post-impl-review.yaml` — read
- `…/corpus/workflow-design/activities/01-intake-and-context.yaml` — read
- `…/corpus/workflow-design/activities/06-scope-and-draft.yaml` — read
- `…/corpus/workflow-design/activities/README.md` — read
- `…/corpus/workflow-design/workflow.yaml` — read
- `…/walks/roster.json` — read
- `…/walks/snapshot.test.ts.snap` — read in part: the whole diff, and the `gatesReadUnbound` and `perActivity` blocks it touches. The rest of the 3.9k-line baseline was not read line by line.

Closure:
- `…/corpus/canon/resources/anti-patterns.md` — read in part: overview, Creation Rules, and AP-71 to AP-165. Families 1 to 7 belong to slice A.
- `…/corpus/canon/resources/schema-construct-inventory.md` — read
- `…/corpus/meta/techniques/workflow-engine/finalize-activity.md` — read
- `…/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md` — read
- `…/corpus/meta/techniques/workflow-engine/revise-session-metrics.md` — read
- `…/corpus/meta/techniques/workflow-engine/yield-checkpoint.md` — read
- `…/corpus/meta/workflow.yaml` — read
- `…/corpus/midnight-system-review/workflow.yaml` — read
- `…/corpus/plain-language/workflow.yaml` — read
- `…/corpus/ponytail/workflow.yaml` — read
- `…/corpus/prism-evaluate/activities/README.md` — read
- `…/corpus/prism-evaluate/workflow.yaml` — read
- `…/corpus/prism-update/workflow.yaml` — read
- `…/corpus/remediate-vuln/workflow.yaml` — read
- `…/corpus/requirements-refinement/workflow.yaml` — read
- `…/corpus/specimens/contract-composition/workflow.yaml` — read
- `…/corpus/specimens/fan-conformance/README.md` — read
- `…/corpus/specimens/fan-conformance/workflow.yaml` — read
- `…/corpus/specimens/git-pin-conformance/workflow.yaml` — read
- `…/corpus/specimens/github-library-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-api-change-gate-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-api-surface-review-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-area-comprehension-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-change-risk-assessment-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-diff-coverage-map-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-diff-taint-pass-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-doc-heading-lookup-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-doc-reference-surface-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-graph-for-tree-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-group-concept-search-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-group-refresh-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-guarded-rename-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-index-refresh-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-layer-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-narrow-to-changed-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-orphan-scan-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-package-diagram-source-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-pre-edit-impact-gate-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-public-api-enum-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-radius-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-restructure-surface-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-scope-discipline-check-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-sequence-diagram-source-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-symptom-trace-conformance/workflow.yaml` — read
- `…/corpus/specimens/gitnexus-tool-surface-conformance/workflow.yaml` — read
- `…/corpus/specimens/mvw/workflow.yaml` — read
- `…/corpus/specimens/namespace-conformance/workflow.yaml` — read
- `…/corpus/specimens/readme-links-conformance/workflow.yaml` — read
- `…/corpus/specimens/routine-conformance/workflow.yaml` — read
- `…/corpus/substrate-node-security-audit/workflow.yaml` — read
- `…/corpus/work-package/resources/workflow-retrospective.md` — read
- `…/corpus/work-package/workflow.yaml` — read
- `…/corpus/workflow-authoring/activities/01-intake-and-context.yaml` — read
- `…/corpus/workflow-authoring/techniques/impact-analysis.md` — read
- `…/corpus/workflow-authoring/workflow.yaml` — read
- `…/corpus/workflow-design/resources/format-conventions.md` — read
- `…/corpus/workflow-design/techniques/impact-analysis.md` — read

Also read, off the list:
- `walks/option-coverage.json`, the rows for the affected checkpoints.
- The `ledgers/*.json` entries for surface sites.
- `meta/techniques/fan/TECHNIQUE.md`.
- `meta/techniques/TECHNIQUE.md`, the Inputs section.
- The engine `src/tools/workflow-tools.ts` diff and `resolveRetiringActivity`.
- The engine `schemas/routine.schema.json` definition of internals.
