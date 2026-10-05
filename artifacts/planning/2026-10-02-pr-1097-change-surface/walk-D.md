# Walk D — work-package techniques (plan, assumptions, contract tests, PR update)

Slice of the PR 1097 canon walk. Base `b57da76ae3b8b9947799860944c1a6055c062cfe`. Tree `i10-integrate`. Corpus files were not edited.

Kind: technique markdown, including `TECHNIQUE.md`, is `technique`. `plan-prepare/README.md` is `readme`.

Ancestor contracts were opened only to apply merge and relocation tests (`technique.inputs` on the workflow-root `TECHNIQUE.md`; `converge-assumptions.yaml` and `settle-assumptions.yaml` for `relocation-without-a-preserved-outcome`). They are not slice paths and are not in the read count.

## Files read

21.

- `corpus/work-package/techniques/plan-prepare/README.md`
- `corpus/work-package/techniques/plan-prepare/TECHNIQUE.md`
- `corpus/work-package/techniques/plan-prepare/create-todos.md`
- `corpus/work-package/techniques/plan-prepare/plan.md`
- `corpus/work-package/techniques/raise-deferred-items/record.md`
- `corpus/work-package/techniques/record-change-scope.md`
- `corpus/work-package/techniques/resolve-artifact-publish.md`
- `corpus/work-package/techniques/review-assumptions/TECHNIQUE.md`
- `corpus/work-package/techniques/review-assumptions/assemble-one.md`
- `corpus/work-package/techniques/review-assumptions/assemble-open-set.md`
- `corpus/work-package/techniques/review-assumptions/collect.md`
- `corpus/work-package/techniques/review-assumptions/reconcile.md`
- `corpus/work-package/techniques/review-assumptions/record.md`
- `corpus/work-package/techniques/review-existing-feedback.md`
- `corpus/work-package/techniques/run-contract-tests.md`
- `corpus/work-package/techniques/strategic-review/verify-fragment.md`
- `corpus/work-package/techniques/surface-assumptions.md`
- `corpus/work-package/techniques/update-pr/TECHNIQUE.md`
- `corpus/work-package/techniques/update-pr/post-review-comment.md`
- `corpus/work-package/techniques/verify-contract-tests-fail.md`
- `corpus/work-package/techniques/write-contract-tests.md`

## Unread

0. No slice path left unread.

## Not applicable

Excluded because the Fires-on line does not meet `technique`, `readme`, or `*`.

- P33. Pre-Session Prose Stands Alone — **Fires on:** `resource`
- P43. A Workflow Borrows Activities — **Fires on:** `workflow.activities`
- P44. A Resource Splits for Section Delivery — **Fires on:** `resource`
- AP-05. atomic-checkpoints — **Fires on:** `activity.steps`
- AP-11. decision-not-prose — **Fires on:** `activity.description`, `activity.exits`, `workflow.graph`
- AP-13. variable-for-approval — **Fires on:** `activity.description`, `activity.steps`, `activity.variables`, `workflow.variables`
- AP-15. procedure-in-protocol — **Fires on:** `activity.steps`
- AP-17. bound-step-no-description — **Fires on:** `activity.steps`
- AP-18. no-monolith-masking-steps — **Fires on:** `activity.steps`
- AP-27. validate-message-economy — **Fires on:** `activity.steps[].actions[].message`
- AP-32. outcome-names-value — **Fires on:** `activity.outcome`
- AP-34. no-valueless-control-set — **Fires on:** `activity.steps[].actions`
- AP-35. no-intra-step-input-set — **Fires on:** `activity.steps[].technique.inputs`, `activity.steps[].actions`
- AP-36. techniques-list-disjoint — **Fires on:** `activity.techniques`, `activity.steps[].technique`
- AP-37. rule-audience-bucket — **Fires on:** `workflow.rules.workflow`, `workflow.rules.activity`, `workflow.rules.universal`
- AP-38. no-duplicate-technique-steps — **Fires on:** `activity.steps[].technique`
- AP-39. hoist-universal-techniques — **Fires on:** `activity.techniques`, `workflow.techniques.activity`
- AP-46. no-resource-caller-backlink — **Fires on:** `resource`
- AP-69. no-activity-prose-rules — **Fires on:** `activity.rules`
- AP-82. work-through-activities — **Fires on:** `workflow.activities`, `workflow.graph`
- AP-85. link-dont-copy-sections — **Fires on:** `resource`
- AP-86. exception-only-verdict-tables — **Fires on:** `resource`
- AP-87. omit-null-sections — **Fires on:** `resource`, `activity.steps`
- AP-88. one-decision-one-checkpoint — **Fires on:** `activity.steps`
- AP-89. checkpoint-requires-decision — **Fires on:** `activity.steps`
- AP-90. no-guide-wrapper-ceremony — **Fires on:** `resource`
- AP-91. lifecycle-row-update — **Fires on:** `resource`
- AP-92. resource-fills-not-does — **Fires on:** `resource`
- AP-93. canonical-fact-home — **Fires on:** `resource`
- AP-94. link-only-input-slots — **Fires on:** `resource`
- AP-97. link-named-artifacts — **Fires on:** `activity.steps[].message`, `activity.steps[].actions[].message`
- AP-98. no-next-step-narration — **Fires on:** `activity.steps[].message`, `activity.steps[].actions[].message`, `activity.steps[].options[].description`
- AP-99. statement-not-question — **Fires on:** `activity.steps[].message`
- AP-101. no-caption-only-message — **Fires on:** `activity.steps[].message`
- AP-112. no-derived-state-shadow — **Fires on:** `workflow.variables`
- AP-130. variable-description-one-line — **Fires on:** `workflow.variables`
- AP-132. unproduced-value-read — **Fires on:** `activity.steps`
- AP-135. resource-id-names-its-content — **Fires on:** `resource`
- AP-143. framing-outside-any-section — **Fires on:** `resource`
- AP-149. pre-session-prose-defers-to-the-framework — **Fires on:** `resource`

## Evidence

Paths below are under `corpus/work-package/techniques/`. Status is `clean` or `finding`. A quoted string is the construct inspected. `field absent` means that file has no such section.

Highs D1–D3 were re-derived from the cited file and the entry. Both Live reads stay: `{live_review_body}` is not an input and the base `{$live_review_body}` bind is gone; the surface-assumptions note names findings no input, phase, or link supplies.

### Units with a finding

#### P6. One Authoritative Home — **Fires on:** `*`

- `plan-prepare/README.md` | body | clean | "The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md)"
- `plan-prepare/TECHNIQUE.md` | rules | clean | "the forbidden shapes are listed under [Rules](../../resources/plan-guide.md#rules)"
- `plan-prepare/create-todos.md` | protocol | clean | "a TODO adds tracking, not a second breakdown"
- `plan-prepare/plan.md` | protocol | clean | "write its Contract per the [plan guide](/work-package/resources/plan-guide.md#rules)"
- `raise-deferred-items/record.md` | protocol | clean | "in the shape the [register template](../../resources/deferred-items-guide.md#template) gives that field"
- `record-change-scope.md` | protocol | clean | "The result is `{task_implementation}`."
- `resolve-artifact-publish.md` | rules | clean | one home for the branch-not-SHA invariant
- `review-assumptions/TECHNIQUE.md` | rules | clean | category, position, and status live in the assumptions log
- `review-assumptions/assemble-one.md` | protocol | clean | one build sentence
- `review-assumptions/assemble-open-set.md` | protocol | clean | build sentence is the open-set copy; the duplicate home is the pair, recorded under `no-duplicated-guidance`
- `review-assumptions/collect.md` | protocol | clean | cites the log template
- `review-assumptions/reconcile.md` | protocol | clean | cites Resolvability Classification
- `review-assumptions/record.md` | protocol | clean | cites `manage-artifacts.state-once-per-artifact`
- `review-existing-feedback.md` | protocol | clean | rating-cap text also sits on the output; recorded under `contract-not-procedure`
- `run-contract-tests.md` | protocol | clean | "Emit `{contract_tests_passed}` and `{contract_test_failures}`"
- `strategic-review/verify-fragment.md` | protocol | clean | one locate step plus one verify step
- `surface-assumptions.md` | protocol | clean | one surface step
- `update-pr/TECHNIQUE.md` | rules | clean | "which is their home — the guide that lays out the body"
- `update-pr/post-review-comment.md` | protocol | finding | phase 3 note and phase 4 both: "compare `{live_review_body}` with/against `{review_summary}`"
- `verify-contract-tests-fail.md` | protocol | clean | one run step
- `write-contract-tests.md` | protocol | clean | cites the plan guide for the Contract

#### P20. Keep Orchestration in Structure — **Fires on:** `technique.capability`, `technique.protocol`, `technique.rules`

Stage sentences are recorded under `technique-stage-agnostic`. Other files:

- `plan-prepare/TECHNIQUE.md` | capability | clean | "Implementation planning — design approach, work-package plan with a contract per task, and actionable TODO tasks."
- `plan-prepare/create-todos.md` | protocol | clean | "Register one TODO per task in `{plan_document.tasks}`"
- `plan-prepare/plan.md` | protocol | clean | no activity, checkpoint, or exit named
- `raise-deferred-items/record.md` | protocol | clean | "Set the `issue` of `{current_deferred_item}`"
- `record-change-scope.md` | protocol | clean | "Add the symbols and flows in `{change_report}`"
- `resolve-artifact-publish.md` | rules | finding | "Re-resolving on a later activity refreshes the branch tip"
- `review-assumptions/TECHNIQUE.md` | rules | clean | no stage named
- `review-assumptions/assemble-one.md` | capability | clean | "as an individual drill-down"
- `review-assumptions/assemble-open-set.md` | capability | finding | "ordered so a stakeholder settles the highest-impact decision first" — recorded under `instruction-narrates-an-actor`
- `review-assumptions/collect.md` | protocol | finding | "Use the categories supplied for the current phase."
- `review-assumptions/reconcile.md` | rules | clean | "Reconciliation runs autonomously, without user interaction." — forbids a gate; does not name one
- `review-assumptions/record.md` | protocol | clean | outcome notes are `>` under the mark step
- `review-existing-feedback.md` | protocol | finding | "Do this before any independent code, structural, or test analysis"
- `run-contract-tests.md` | protocol | clean | "In `{target_path}`, run the project's test command"
- `strategic-review/verify-fragment.md` | protocol | clean | no stage named
- `surface-assumptions.md` | protocol | clean | no stage named
- `update-pr/TECHNIQUE.md` | rules | clean | no activity flow named
- `update-pr/post-review-comment.md` | protocol | finding | "the rating already honours the Prior Feedback Triage rating cap"; "The posting step sends a pull-request review."
- `verify-contract-tests-fail.md` | protocol | clean | "In `{contract_tests_path}`, ensure HEAD carries only the contract-test files"
- `write-contract-tests.md` | protocol | clean | no stage named
- `plan-prepare/README.md` | — | clean | fires-on does not include `readme`

#### P31. Isolate Conditional Branches as Notes — **Fires on:** `technique.protocol`

- `plan-prepare/plan.md` | protocol | clean | "`> When `{strategic_fix_selection}` is bound`"
- `review-assumptions/collect.md` | protocol | finding | "If no significant assumptions are identified, record a single null row"
- `review-assumptions/assemble-open-set.md` | protocol | clean | "`> At five or more entries`"
- `review-assumptions/reconcile.md` | protocol | clean | "`> When no `{comprehension_artifact}` was provided, skip this phase`"
- `review-assumptions/record.md` | protocol | clean | "`> - Where `{assumption_outcome}` is empty`"
- `surface-assumptions.md` | protocol | clean | "`> Where `{assumption_source}` is absent`"
- `strategic-review/verify-fragment.md` | protocol | clean | "`> When `{changes_fragment}` is present, that body is the fragment."
- `update-pr/post-review-comment.md` | protocol | clean | "When `{review_type}` is unset … When it is set" is one If/Else ladder over whether the input is set (`constraint-as-blockquote` Do not flag)
- `plan-prepare/TECHNIQUE.md` | protocol | clean | field absent
- `review-assumptions/TECHNIQUE.md` | protocol | clean | field absent
- `update-pr/TECHNIQUE.md` | protocol | clean | field absent
- remaining technique protocols (`create-todos`, `raise-deferred-items/record`, `record-change-scope`, `resolve-artifact-publish`, `assemble-one`, `review-existing-feedback`, `run-contract-tests`, `verify-contract-tests-fail`, `write-contract-tests`) | protocol | clean | no if/when/otherwise inside a step sentence

#### P39. A Phase Heading Names the Outcome — **Fires on:** `technique.protocol`

- `review-assumptions/collect.md` | protocol | finding | "### 4. Append Them to the Log"
- `review-assumptions/record.md` | protocol | finding | "### 2. Write the Outcomes Into the Log"
- `resolve-artifact-publish.md` | protocol | finding | "### 1. Resolve the Checkout and Branch"
- `plan-prepare/create-todos.md` | protocol | clean | "### 1. Create Todos"
- `plan-prepare/plan.md` | protocol | clean | "### 1. Verify Inputs" / "### 4. Write Plan"
- `raise-deferred-items/record.md` | protocol | clean | "### 1. Link Entry to Issue"
- `record-change-scope.md` | protocol | clean | "### 1. Record the Scope"
- `review-assumptions/assemble-one.md` | protocol | clean | "### 1. Build the Entry"
- `review-assumptions/assemble-open-set.md` | protocol | clean | "### 2. Order the Set"
- `review-assumptions/reconcile.md` | protocol | clean | "### 2. Targeted Analysis"
- `review-existing-feedback.md` | protocol | clean | "### 3. Derive the Rating Cap" (four words)
- `run-contract-tests.md` | protocol | clean | "### 1. Run"
- `strategic-review/verify-fragment.md` | protocol | clean | "### 1. Locate Fragment"
- `surface-assumptions.md` | protocol | clean | "### 1. Surface From the Source"
- `update-pr/post-review-comment.md` | protocol | clean | "### 2. Resolve the Review Verdict" (four words)
- `verify-contract-tests-fail.md` | protocol | clean | "### 1. Run Against Base"
- `write-contract-tests.md` | protocol | clean | "### 1. Read the Contract Only"
- `plan-prepare/TECHNIQUE.md`, `review-assumptions/TECHNIQUE.md`, `update-pr/TECHNIQUE.md` | protocol | clean | field absent

#### AP-16. technique-inputs-declared — **Fires on:** `technique.capability`, `technique.inputs`, `technique.protocol`

Workflow-root `TECHNIQUE.md` already declares `planning_folder_path`, `requirements`, `target_path`, `branch_name`, `pr_number`. Those uses are declared. `{target_path}` and `{branch_name}` are also the entry's ambient examples.

- `update-pr/post-review-comment.md` | protocol | finding | "`{live_review_body}`" in the phase 3 note and in phase 4; no `### live_review_body`
- `plan-prepare/plan.md` | protocol | clean | `{design_philosophy_doc}`, `{analysis_document}`, `{research_document}` are on `plan-prepare/TECHNIQUE.md`; `{requirements}` and `{planning_folder_path}` are on the workflow-root contract
- `surface-assumptions.md` | inputs | clean | `assumption_categories` and `assumption_source` are declared; the unsourced fallback is `reference-without-provenance`
- every other technique file | inputs or protocol | clean | each `{id}` the protocol reads is declared on that file, its in-slice group `TECHNIQUE.md`, or the workflow-root contract

#### AP-19. no-rule-protocol-restatement — **Fires on:** `technique.rules`, `technique.protocol`

- `review-assumptions/TECHNIQUE.md` | rules `assembled-entries-carry-their-evidence` | finding | "its reversibility is read from that symbol's connectivity through [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[context](/gitnexus/techniques/context.md)(*name*: the symbol the assumption names)"
- `review-existing-feedback.md` | rules `confirmed-blocker-sets-the-cap` | clean | adds "a triage that surfaced few concerns does not soften it", which phase 3 does not say
- `review-existing-feedback.md` | rules `every-prior-finding-dispositioned` | clean | "none is silently dropped"
- `review-assumptions/reconcile.md` | rules `classification-transparency` | clean | "include the classification rationale for each remaining open assumption" — invariant on the result
- `plan-prepare/TECHNIQUE.md` | rules | clean | "A plan task names a code or artifact change"
- `resolve-artifact-publish.md` | rules | clean | "The emitted ref is the branch, never a commit SHA."
- `update-pr/TECHNIQUE.md` | rules | clean | cites the PR-description guide as the home of the criteria
- technique files with no `## Rules` | rules | clean | field absent

#### AP-26. no-rationale-in-description — **Fires on:** `technique.protocol`, `technique.rules`

- `review-assumptions/TECHNIQUE.md` | rules `assumptions-log-is-the-record` | finding | "so a later reader settles an outcome from the log rather than from the transcript that produced it"
- `resolve-artifact-publish.md` | rules `publish-ref-is-a-branch` | finding | "so a reader following a branch link sees the current tree while a reader following a sha link sees the tree as it stood before those files existed"
- `review-existing-feedback.md` | protocol phase 1 | finding | "so the existing signal frames the review rather than being reconciled after a verdict is formed"
- `review-existing-feedback.md` | rules `confirmed-blocker-sets-the-cap` | finding | "which this pass has not seen the findings to decide"
- `review-existing-feedback.md` | rules `single-ingest-of-reported-failures` | finding | "so downstream triage consumes it once rather than re-reading the thread"
- `plan-prepare/TECHNIQUE.md` | rules | clean | the plan-guide cite is the home of the forbidden shapes
- `review-assumptions/reconcile.md` | rules | clean | the autonomy sentence is the constraint
- `update-pr/TECHNIQUE.md` | rules `review-comment-verbatim` | clean | "This is distinct from `render`" compares two ops; deleting it loses which op owns the body. Kept.
- `update-pr/post-review-comment.md` | protocol | clean | the permissiveness sentence is the constraint
- other technique files | protocol or rules | clean | no why/consumer clause whose deletion leaves the constraint standing

#### AP-42. io-agnostic-contract — **Fires on:** `technique.inputs`, `technique.outputs`

- `review-assumptions/assemble-open-set.md` | inputs `open_assumptions` | finding | "Empty where analyse-challenge resolved every assumption."
- `review-existing-feedback.md` | inputs `review_pr_url` | finding | "captured during PR-reference detection"
- `review-existing-feedback.md` | outputs `prior_feedback_triage` | finding | "so downstream reported-failure triage consumes it rather than re-reading the thread"
- `update-pr/post-review-comment.md` | outputs `posted_review_id` | finding | "which a later run supplies to replace the body in place"
- `plan-prepare/TECHNIQUE.md` | inputs | clean | resource links are template shape (`design-framework.md#design-philosophy-artifact-template`)
- `review-assumptions/TECHNIQUE.md` | inputs `assumptions_log` | clean | "[log](../../resources/assumptions-review.md#assumptions-log-template)"
- `resolve-artifact-publish.md` | inputs `modified_paths` | clean | "The tracked paths carrying modifications in the engineering checkout" — provenance clause is `no-bind-mechanics-as-prose`
- other technique I/O | inputs or outputs | clean | descriptions name the value; resource links are templates

#### AP-44. artifact-name-in-io — **Fires on:** `technique.protocol`, `technique.inputs`, `technique.outputs`

- `strategic-review/verify-fragment.md` | outputs `fragment_references_issue` and protocol phase 1 | finding | "no `changes/` directory exists at the `{target_path}` root"
- `plan-prepare/plan.md` | outputs | clean | filename sits on `#### artifact` as `work-package-plan.md`
- `resolve-artifact-publish.md` | outputs `publishable_files` | clean | filenames are in the output description, backticked, as the set the value holds; protocol cites `{modified_paths}` and `{planning_folder_path}`
- other technique files | protocol | clean | no literal artifact path in protocol

#### AP-59. constraint-as-blockquote — **Fires on:** `technique.protocol`

- `review-assumptions/collect.md` | protocol phase 3 | finding | "If no significant assumptions are identified, record a single null row in `{assumptions_log}`"
- `update-pr/post-review-comment.md` | protocol phase 4 | finding | "If the PR cannot be found because `{pr_number}` does not exist, verify the PR number and check `gh` auth before retrying."
- `plan-prepare/plan.md` | protocol | clean | strategic-fix caveat is a `>` note
- `review-assumptions/record.md` | protocol | clean | empty-outcome and per-item cases are `>` notes
- `surface-assumptions.md` | protocol | clean | absent-source and empty-list cases are `>` notes
- `strategic-review/verify-fragment.md` | protocol | clean | missing-`changes/` bullet plus the locate bullet is one If/Else ladder
- other technique protocols | protocol | clean | no inline caveat

#### AP-62. bind-protocol-locals — **Fires on:** `technique.protocol`, `technique.inputs`, `technique.outputs`

- `update-pr/post-review-comment.md` | protocol | finding | "`{live_review_body}`" has no `{$live_review_body}` and is not a declared id. Base bound `{$live_review_body}` from the post op.
- `resolve-artifact-publish.md` | protocol | clean | "`{$eng_git_dir}`" then "`{eng_git_dir}`"; "`{$eng_branch}`" then "`{eng_branch}`"
- `update-pr/post-review-comment.md` | protocol `review_event` | clean | "`{review_event}`" is a declared output
- other technique protocols | protocol | clean | every brace is a declared id, an inherited id, or `{target_path}` / `{branch_name}`

#### AP-68. technique-stage-agnostic — **Fires on:** `technique.capability`, `technique.protocol`, `technique.rules`

- `resolve-artifact-publish.md` | rules | finding | "Re-resolving on a later activity refreshes the branch tip without changing any link already posted."
- `review-assumptions/collect.md` | protocol | finding | "Use the categories supplied for the current phase."
- `review-existing-feedback.md` | protocol | finding | "Do this before any independent code, structural, or test analysis"
- `update-pr/post-review-comment.md` | protocol | finding | "the rating already honours the Prior Feedback Triage rating cap"
- `update-pr/post-review-comment.md` | protocol | finding | "The posting step sends a pull-request review."
- `review-assumptions/reconcile.md` | rules | clean | "without user interaction" does not name a checkpoint or a stage
- other technique capability, protocol, and rules | those fields | clean | no activity, checkpoint, loop, or flow position

#### AP-74. no-duplicated-guidance — **Fires on:** `technique`

- `review-assumptions/assemble-one.md` | protocol | finding | "differentiating its decision space on the [Trade-off Dimensions](../../resources/assumptions-review.md#trade-off-dimensions) that meaningfully separate its alternatives"
- `review-assumptions/assemble-open-set.md` | protocol | finding | the same sentence, with "one entry per member of `{open_assumptions}`"
- other technique files | body | clean | no second copy of the same instruction in this slice

#### AP-111. contract-not-procedure — **Fires on:** `technique.protocol`, `technique.outputs`

- `review-existing-feedback.md` | outputs `rating_cap` and protocol phase 3 | finding | output: "When any prior comment is a blocker-class concern left unaddressed by the PR, the cap is the request-changes tier"; phase 3 restates that tree as "Set `{rating_cap}` to the request-changes tier when any blocker-class concern is dispositioned Confirmed"
- `update-pr/post-review-comment.md` | outputs `review_event` | clean | the output names the three events; the protocol holds the `review_type` map, which the output does not
- `run-contract-tests.md` | outputs | clean | "True when every merged contract suite passes" is recognition; protocol emits the id
- other technique outputs | outputs | clean | protocol emits `{id}` without restating a decision tree the output already holds

#### AP-113. session-interaction-in-technique — **Fires on:** `technique.capability`, `technique.protocol`, `technique.rules`

- `update-pr/post-review-comment.md` | protocol | finding | "report the discrepancy rather than posting the more permissive one"
- `review-assumptions/assemble-one.md` | protocol | clean | "Emit `{assumption_review_presentation}`"
- `review-assumptions/assemble-open-set.md` | protocol | clean | "Emit `{assumption_review_presentation}`" — stakeholder clause is capability, recorded under `instruction-narrates-an-actor`
- other technique files | capability, protocol, rules | clean | no present, surface, or show-to-user imperative

#### AP-115. platform-semantics-in-capability — **Fires on:** `technique.capability`, `readme`

- `plan-prepare/README.md` | body | finding | "The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md)"
- `plan-prepare/TECHNIQUE.md` | capability | clean | "Implementation planning — design approach, work-package plan with a contract per task, and actionable TODO tasks."
- `review-assumptions/TECHNIQUE.md` | capability | clean | "The assumption lifecycle a work package runs on"
- `update-pr/TECHNIQUE.md` | capability | clean | "PR finalization for review — body update and ready mark, or consolidated review-mode commentary."
- other technique capabilities | capability | clean | no inherit or merge lecture

#### AP-117. no-engine-mechanics-as-rules — **Fires on:** `technique.rules`, `technique.protocol`

- `review-assumptions/reconcile.md` | rules `no-user-interaction` | finding | "Converged results bind as outputs."
- other rules and protocols | those fields | clean | no `variables_changed`, bag, or dispatch restatement

#### AP-118. no-bind-mechanics-as-prose — **Fires on:** `technique.inputs`, `technique.outputs`, `technique.capability`, `technique.protocol`, `technique.rules`

- `surface-assumptions.md` | protocol | finding | "Where `{assumption_source}` is absent, take the findings and working context already in hand."
- `resolve-artifact-publish.md` | inputs `modified_paths` | finding | "already read by the run"
- other technique I/O and protocol | those fields | clean | protocol consumes an already-bound `{id}`

#### AP-119. procedure-in-io-contract — **Fires on:** `technique.inputs`, `technique.outputs`

- `update-pr/TECHNIQUE.md` | inputs `host_repo_path` | finding | "used with `.engineering/` (in-tree or linked worktree) to resolve the engineering link URL"
- `update-pr/TECHNIQUE.md` | inputs `target_path` | finding | "from which the target repo URL is resolved"
- `review-existing-feedback.md` | outputs `rating_cap` | clean | recognition of the cap; the restated tree is `contract-not-procedure`
- `strategic-review/verify-fragment.md` | outputs | clean | "`true` when the located fragment body contains `{issue_url}` verbatim; `false` when it does not; `null` when no `changes/` directory exists" — recognition, plus the path finding under `artifact-name-in-io`
- other technique I/O | inputs or outputs | clean | meaning, shape, or allowed values

#### AP-121. rule-as-protocol-step — **Fires on:** `technique.protocol`

- `review-assumptions/reconcile.md` | protocol phase 4 | finding | "A question the analysis leaves open stays in the assumptions log as an open assumption; the corpus artifact takes settled outcomes only."
- `write-contract-tests.md` | protocol phase 1 | finding | "Goal, deliverables, and any plan section outside that Contract are out of scope" and "Implementation source is out of scope"
- `plan-prepare/plan.md` | protocol phase 1 | clean | "Verify `{design_philosophy_doc}` and `{requirements}` are available" is the phase's check, then later phases write
- other technique protocols | protocol | clean | each phase produces, transforms, or persists

#### AP-146. branch-on-undeclared-threshold — **Fires on:** `technique.protocol`, `technique.rules`

- `review-assumptions/assemble-open-set.md` | protocol | finding | "At five or more entries, group them by theme and order the themes by impact."
- other technique protocols and rules | those fields | clean | no magnitude with no declared input

#### AP-148. reference-without-provenance — **Fires on:** `technique`

- `surface-assumptions.md` | protocol | finding | "take the findings and working context already in hand"
- `resolve-artifact-publish.md` | inputs | clean | `modified_paths` is the declared supplier; the "already read" clause is `no-bind-mechanics-as-prose`
- `strategic-review/verify-fragment.md` | protocol | clean | "Locate the fragment for this issue, pull request, or work package." The note names `{changes_fragment}` when that input is present. The locate is this phase's work.
- `update-pr/post-review-comment.md` | protocol | clean | `{live_review_body}` is undeclared (`technique-inputs-declared`), not an unanchored noun
- other technique files | body | clean | each value names an input, an output, an earlier phase, or a link

#### AP-150. instruction-narrates-an-actor — **Fires on:** `technique.rules`, `technique.protocol`, `technique.inputs`, `technique.outputs`, `technique.capability`, `readme`

- `review-assumptions/assemble-open-set.md` | capability | finding | "ordered so a stakeholder settles the highest-impact decision first"
- `update-pr/post-review-comment.md` | protocol | finding | "The posting step sends a pull-request review."
- `plan-prepare/README.md` | body | clean | "what each one contributes is below"
- `review-assumptions/TECHNIQUE.md` | rules | clean | "reconcile and challenge produced" names the evidence's authors inside the invariant recorded under `no-rule-protocol-restatement`; striking it leaves "carries the partial evidence … in its technical context"
- other technique files | those fields | clean | the reader is told the reader's own work

#### AP-156. one-invariant-per-rule — **Fires on:** `technique.rules`

- `review-assumptions/TECHNIQUE.md` | rules `assembled-entries-carry-their-evidence` | finding | the entry both requires carried partial evidence and requires a connectivity reading through gitnexus context
- `resolve-artifact-publish.md` | rules `publish-ref-is-a-branch` | clean | one constraint (the ref is the branch); the rest is the failure mode, recorded under `no-rationale-in-description`
- `review-existing-feedback.md` | rules | clean | each slug is one invariant
- `plan-prepare/TECHNIQUE.md` | rules | clean | "A plan task names a code or artifact change"
- `review-assumptions/reconcile.md` | rules | clean | autonomy, then rationale-on-emit, as two entries
- `update-pr/TECHNIQUE.md` | rules | clean | conformance, verbatim posting, and host shell are separate entries
- technique files with no `## Rules` | rules | clean | field absent

#### AP-161. unreachable-operation-reference — **Fires on:** `technique.capability`, `technique.protocol`, `technique.rules`

- `update-pr/TECHNIQUE.md` | rules `review-comment-verbatim` | finding | "via [post-pr-review](/github/techniques/post-pr-review.md)" — the rule names the op; `post-review-comment` protocol does not Apply it
- `review-assumptions/TECHNIQUE.md` | rules | clean | the gitnexus `::[context]` invocation does work (`pass-orchestration-in-technique` Do not flag on an invoking reference; the work-in-a-rule hit is `no-rule-protocol-restatement`)
- other technique files | capability, protocol, rules | clean | resource links travel with the citer; no non-invoking technique link

### Units walked clean

Quotes are the construct the detect keys on. Where the field is absent, the line says so.

#### P1. Workflows Ossify Patterns — **Fires on:** `workflow`, `activity`, `technique`, `routine`

Each technique file | capability | clean | the capability names a portable product (plan, assumption entry, contract-test result, review post), not a graph circumstance. `plan-prepare/README.md` does not meet this fires-on.

#### P2. Internalize Before Producing — **Fires on:** `*`

Each of the 21 files | body | clean | the file is a definition, not a session that produces before reading the construct model.

#### P3. Define Complete Scope Before Execution — **Fires on:** `*`

Each of the 21 files | body | clean | no done-claim over an unlisted scope.

#### P4. Clarify Before Assuming — **Fires on:** `*`

Each of the 21 files | body | clean | no choice among user intents executed in the definition.

#### P5. Maximize Schema Expressiveness — **Fires on:** `workflow`, `activity`, `technique`, `routine`

Each technique file | capability | clean | capability states the product; sequence sits under `## Protocol` where that section exists. README does not meet this fires-on.

#### P7. Convention Over Invention — **Fires on:** `*`

Each of the 21 files | body | clean | kebab filenames, `## Capability` / `## Inputs` / `## Outputs` / `## Protocol` / `## Rules`, semantic versions. See Reference Conventions.

#### P8. Confirm Before Irreversible Changes — **Fires on:** `*`

Each of the 21 files | body | clean | no irreversible user-environment change. `resolve-artifact-publish.md` reads `git … branch --show-current`. `post-review-comment.md` says "check `gh` auth", not a config write.

#### P9. Encode Constraints as Structure — **Fires on:** `activity.steps`, `activity.exits`, `workflow.rules`, `activity.rules`, `technique.rules`

- files with `## Rules` (`plan-prepare/TECHNIQUE.md`, `resolve-artifact-publish.md`, `review-assumptions/TECHNIQUE.md`, `review-assumptions/reconcile.md`, `review-existing-feedback.md`, `update-pr/TECHNIQUE.md`) | rules | clean | domain invariants; structural backing lives on the activity, which is outside this slice
- other technique files | rules | clean | field absent

#### P10. Non-Destructive Updates — **Fires on:** `*`

Each of the 21 files | body | clean | no instruction to discard existing content without naming it. `review-assumptions/record.md`: "Preserve all assumption rows and their resolution status".

#### P11. Complete Documentation Structure — **Fires on:** `readme`

- `plan-prepare/README.md` | body | clean | purpose plus a contribution table and a link to `TECHNIQUE.md`
- group folders in this slice (`plan-prepare`, `raise-deferred-items`, `review-assumptions`, `strategic-review`, `update-pr`) have a `README.md` beside them; standalone techniques sit under `techniques/`, which has a `README.md`. Presence only; those other READMEs were not read.

#### P12. Output Economy — **Fires on:** `technique.outputs`, `activity.steps`, `resource`

Each technique file that declares `## Outputs` | outputs | clean | one product per entry, with `#### audience` where `#### artifact` is present (`human` or `agent`). `create-todos.md` | outputs | clean | field absent; the TODO list is a harness side-effect with no captured path.

#### P13. Separate Contract from Procedure — **Fires on:** `technique.inputs`, `technique.outputs`, `technique.protocol`, `technique.rules`

Hits are the finding rows for `procedure-in-io-contract`, `contract-not-procedure`, `rule-as-protocol-step`, and `no-bind-mechanics-as-prose`. Every other technique file | those fields | clean | I/O states what the value is; protocol states the work.

#### P14. Single Source of Truth — **Fires on:** `workflow.variables`, `activity.steps`, `technique.inputs`

Each technique file with inputs | inputs | clean | one id per fact. `assumptions_log` on `review-assumptions/TECHNIQUE.md` is input and output of the same log. `collect.md` has no `## Inputs`; it reads the container's ids.

#### P15. Phase by Sequenced Outcome — **Fires on:** `technique.protocol`

Each technique protocol | protocol | clean | phases are `### N. Title` with the work in bullets. Heading length hits are under P39. `plan-prepare/TECHNIQUE.md`, `review-assumptions/TECHNIQUE.md`, `update-pr/TECHNIQUE.md` | protocol | clean | field absent.

#### P16. Distinguish Designators from Parameters — **Fires on:** `technique.protocol`

- `review-assumptions/TECHNIQUE.md` | rules | clean | fires-on is protocol; the `::[context](…)(*name*: …)` italic argument is in Rules
- every technique protocol | protocol | clean | declared values are `{id}`; no brace argument list

#### P17. Document in Positive Present — **Fires on:** `workflow.description`, `activity.description`, `activity.outcome`, `activity.steps[].options`, `readme`

- `plan-prepare/README.md` | body | clean | "Implementation planning — design approach, work-package plan with a contract per task, and actionable TODO tasks."
- technique files do not meet this fires-on

#### P18. Prefer Shared Capability — **Fires on:** `activity.steps`, `activity.techniques`, `workflow.techniques`, `technique`

Each technique file | protocol | clean | no local re-teach of a shared harness recipe. `plan.md` no longer applies `gitnexus::impact`; the ordering sentence reads symbols already named in `{analysis_document}` and `{requirements}`.

#### P19. Name Symbols Affirmatively — **Fires on:** `technique.inputs`, `technique.outputs`, `technique.rules`

Each technique file | inputs, outputs, rules | clean | snake_case ids; booleans `contract_tests_passed`, `contract_tests_fail_on_base`, `fragment_references_issue`, `body_conforms`, `review_posted`, `has_deferred_assumptions`. Rule slugs are positive invariants. `no-user-interaction` matches the Do not flag for a clear intentional negation.

#### P21. Match the Harness Surface — **Fires on:** `technique`, `resource`, `readme`

Each of the 21 files | body | clean | no claim about a tool return shape. These files are not bootstrap or engine surfaces.

#### P22. Modular Over Inline — **Fires on:** `workflow`, `activity`, `technique`, `resource`, `routine`

Each technique file | body | clean | one technique per file. README does not meet this fires-on.

#### P23. Close the Loop — **Fires on:** `*`

Each of the 21 files | body | clean | no recommendation left as the deliverable.

#### P24. Keep Session Interaction in Activities — **Fires on:** `technique`, `activity.steps`

The `report the discrepancy` hit is `session-interaction-in-technique`. Every other technique file | capability, protocol, rules | clean | emit and persist, no session channel.

#### P25. Bind Sibling Techniques as Steps — **Fires on:** `activity.steps`, `technique.protocol`

Each technique protocol | protocol | clean | no `Apply` and no `::` work invoke. The gitnexus `::` sits in `review-assumptions/TECHNIQUE.md` Rules, outside this fires-on.

#### P26. A Technique Is a Reading — **Fires on:** `technique.capability`, `technique.protocol`, `technique.inputs`, `activity.steps`

- `run-contract-tests.md` | outputs | clean | "Failing assertions and the Contract fields they name" is the reading
- `verify-contract-tests-fail.md` | outputs | clean | "false when it passes or cannot run" is the reading
- `strategic-review/verify-fragment.md` | protocol | clean | phase 2 checks the issue reference forms
- other technique files | protocol | clean | a judgement or a write, not a bare tool leaflet

#### P27. State Contract Contribution — **Fires on:** `technique.capability`, `technique.protocol`, `technique.inputs`, `technique.outputs`, `technique.rules`

- `plan-prepare/TECHNIQUE.md` | capability | clean | domain statement; shared inputs and `tasks-are-code-changes-only` are the contract
- `review-assumptions/TECHNIQUE.md` | capability | clean | "what an assumption is, the categories it is classified into, and the log that holds its outcome"
- `update-pr/TECHNIQUE.md` | capability | clean | "body update and ready mark, or consolidated review-mode commentary"
- leaves | capability | clean | each names its product

#### P28. Creation Guide for Generated Documents — **Fires on:** `resource`, `technique.protocol`

Technique protocols that persist a planning artifact cite a guide anchor: `plan.md` plan-guide `#rules`, `collect.md` and `record.md` assumptions-review `#assumptions-log-template`, `review-existing-feedback.md` prior-feedback-triage-guide `#template`, `raise-deferred-items/record.md` deferred-items-guide `#template`. | protocol | clean | cite, not an embedded section recipe. Other protocols do not persist a planning artifact by bare filename.

#### P29. Cite Resource Policy; Do Not Restate It — **Fires on:** `resource`, `technique.protocol`

Each citing protocol | protocol | clean | link text is the section and the URL has a `#` anchor (`#rules`, `#template`, `#classification-vocabulary`, `#probe-vocabulary`, `#resolvability-classification`, `#promotion`, `#review-type-selection`).

#### P30. Resources Stay Abstract — **Fires on:** `resource`, `technique`, `activity`

Each technique file | body | clean | concrete filenames that are artifact declarations sit on `#### artifact`. No resource body is in this slice.

#### P32. Cite Resources at Section Grain — **Fires on:** `technique`, `activity`, `resource`, `readme`

Each of the 21 files | body | clean | resource cites in this slice carry a `#` anchor. `plan-prepare/README.md` links `TECHNIQUE.md` and sibling technique files, which are the whole file.

#### P34. Edit the Owner — **Fires on:** `*`

The duplicate build sentence is `no-duplicated-guidance`. The duplicate reconcile is P6. Other files | body | clean | a fact is cited rather than copied.

#### P35. Prefer Removing the Thing That Needs a Prohibition — **Fires on:** `*`

- `update-pr/post-review-comment.md` | protocol | clean | "Never substitute a description update for the review comment." The prohibition names the surviving post.
- `plan-prepare/create-todos.md` | protocol | clean | "a TODO adds tracking, not a second breakdown" and points at the plan guide
- other files | body | clean | no second path policed only by a warning

#### P36. A Technique Names Only What Its Reader Holds — **Fires on:** `technique`

The `post-pr-review` link is `unreachable-operation-reference`. Other technique files | body | clean | dotted addresses (`manage-git.directory-scope`, `manage-artifacts.markdown-line-breaks`, `manage-artifacts.state-once-per-artifact`, `review-summary.rating-cap-carve-in`) are full dotted names inside this library; a static walk does not disprove delivery.

#### P37. An I/O Contract Names the Value — **Fires on:** `technique.inputs`, `technique.outputs`

The producer and consumer hits are `io-agnostic-contract`. Other I/O | inputs or outputs | clean | the description says what the value is.

#### P38. A Relocation Records the Outcome It Keeps — **Fires on:** `activity.steps`, `activity.exits`, `technique`, `workflow.rules`, `activity.rules`, `technique.rules`

- `review-assumptions/reconcile.md` | protocol | clean | base phase "Check Convergence" and `{has_resolvable_assumptions}` / `{has_open_assumptions}` are absent here. `converge-assumptions.yaml` declares both and loops on `has_resolvable_assumptions`. Not a finding.
- `update-pr/TECHNIQUE.md` | rules | clean | base rule `draft-first` is absent and no equivalent remains in the corpus. A deletion, not a relocation.
- `plan-prepare/plan.md` | protocol | clean | base `gitnexus::impact` call is absent; this phase still states "Order tasks by dependency depth, leaves before callers". Receiving site not in this slice; the ordering outcome is in this sentence.
- `update-pr/post-review-comment.md` | protocol | clean | base Apply of `post-pr-review` is gone; the note states "Never substitute a description update for the review comment."

#### P40. Fan-Out Lives at the Layer That Runs the Work — **Fires on:** `workflow.graph`, `activity.steps`, `technique`

Each technique file | body | clean | no worker fan-out recipe.

#### P41. A Phase States Answers the Tool Has Returned — **Fires on:** `technique.protocol`

Each technique protocol | protocol | clean | no claim about a tool field the protocol has not read. `run-contract-tests.md` and `verify-contract-tests-fail.md` emit pass/fail from the test command.

#### P42. A Routine Holds the Codified Path — **Fires on:** `routine`, `technique`, `activity`

Each technique file | body | clean | these files are the reading; the convergence loop is the routine `converge-assumptions`, outside this slice.

#### P45. A Rule States One Invariant — **Fires on:** `technique.rules`

The split hit is `one-invariant-per-rule`. Other rules | rules | clean | one constraint per entry.

#### P46. A Consumer Binds the Contract — **Fires on:** `technique`, `activity`, `workflow`

Each technique file | inputs and outputs | clean | the contract is the declared ids. Call-site binds are activities, outside this slice.

#### P47. A Calibrated Surface Extends by Wrapping — **Fires on:** `technique`, `resource`

Each technique file | body | clean | none of these files is a schema or a measured prompt being edited in place for a new consumer.

#### AP-01. no-inline-content — **Fires on:** `activity`, `technique`, `resource`

Each technique file | body | clean | the body is the technique file, not an inline copy in a parent.

#### AP-02. schema-is-constraint — **Fires on:** `workflow`, `activity`, `technique`

Each technique file | body | clean | no invented field. Sections are Capability, Inputs, Outputs, Protocol, Rules.

#### AP-03. no-partial-implementation — **Fires on:** `*`

Each of the 21 files | body | clean | no done claim.

#### AP-04. no-invented-naming — **Fires on:** `*`

Each of the 21 files | body | clean | ids and filenames follow the slice's snake_case and kebab-case. New files `record-change-scope.md`, `run-contract-tests.md`, `surface-assumptions.md`, `verify-contract-tests-fail.md`, `write-contract-tests.md` use those patterns.

#### AP-06. no-assumption-execution — **Fires on:** `*`

Each of the 21 files | body | clean | the definition does not pick an unstated user intent.

#### AP-07. scope-reverify-completion — **Fires on:** `*`

Each of the 21 files | body | clean | no close-out claim.

#### AP-08. one-question-per-message — **Fires on:** `*`

Each of the 21 files | body | clean | no user-facing question stack.

#### AP-09. checkpoint-not-prose — **Fires on:** `activity.description`, `activity.steps`, `technique.protocol`

Each technique protocol | protocol | clean | no ask/confirm/choose. `reconcile.md` forbids user interaction rather than asking.

#### AP-10. loop-not-prose — **Fires on:** `activity.description`, `activity.steps`, `technique.protocol`

Each technique protocol | protocol | clean | "for each" in `collect.md`, `reconcile.md`, `assemble-open-set.md`, and `review-existing-feedback.md` is the body of one technique over a declared collection, not an activity loop the prose invents.

#### AP-12. artifact-not-buried — **Fires on:** `activity.description`, `technique.capability`, `technique.protocol`, `technique.outputs`

Each file-producing output carries `#### artifact`: `plan.md` `work-package-plan.md`, `raise-deferred-items/record.md` `deferred-items.json`, `collect.md` / `reconcile.md` / `record.md` `assumptions-log.md`, `review-existing-feedback.md` `prior-feedback-triage.json`. Other outputs are values, not files. | outputs | clean

#### AP-14. mode-as-state — **Fires on:** `activity.rules`, `workflow.rules`, `technique.rules`, `activity.variables`, `workflow.variables`, `activity.steps`, `activity.exits`

Technique rules in this slice | rules | clean | no mode skip stored only as prose. `pr_template_variant` and `review_type` are enum inputs.

#### AP-20. rule-group-disambiguation — **Fires on:** `technique.rules`

Files with rules | rules | clean | no pair that conflicts when co-listed.

#### AP-21. grouped-rule-keys — **Fires on:** `technique.rules`

- `update-pr/TECHNIQUE.md` | rules | clean | `posting` already groups `review-comment-verbatim`
- other rule blocks | rules | clean | slugs do not share a prefix family

#### AP-22. single-rule-authority — **Fires on:** `workflow.rules`, `activity.rules`, `technique.rules`

Files with rules | rules | clean | no "(same stance as …)" bridge. The rating-cap restatement is `contract-not-procedure`.

#### AP-23. worker-rule-reach — **Fires on:** `workflow.rules.workflow`, `activity.rules`, `technique.rules`

Technique rules | rules | clean | they sit on the technique the worker reads, not only on `rules.workflow`.

#### AP-24. no-contradictory-rules — **Fires on:** `technique.rules`

Files with rules | rules | clean | no mutually exclusive pair.

#### AP-25. no-one-step-rules — **Fires on:** `technique.rules`, `technique.protocol`

Files with rules | rules | clean | each rule covers the technique's result, not one phase only. The open-question bullet in `reconcile.md` is `rule-as-protocol-step`.

#### AP-28. no-sequence-in-description — **Fires on:** `workflow.description`, `activity.description`, `technique.capability`, `workflow.activities`, `workflow.graph`, `activity.steps`, `technique.protocol`

Each technique capability | capability | clean | names the product, not a numbered phase list.

#### AP-29. no-user-env-mutation — **Fires on:** `workflow.description`, `activity.description`, `technique.capability`, `activity.steps[].actions[].message`, `technique.protocol`, `activity.steps[].options`

Each technique capability and protocol | those fields | clean | git commands are reads or worktree test runs. "check `gh` auth" does not write user config.

#### AP-30. role-rules-not-description — **Fires on:** `workflow.description`, `activity.description`, `workflow.variables`, `activity.variables`, `workflow.rules`, `activity.rules`, `technique.rules`

Technique rules | rules | clean | constraints on the result, not "orchestrator MUST".

#### AP-31. no-hand-authored-artifacts — **Fires on:** `activity`, `technique.outputs`

Technique outputs | outputs | clean | no `artifacts[]` key. Filenames are `#### artifact`.

#### AP-33. no-set-of-technique-output — **Fires on:** `activity.steps[].technique`, `activity.steps[].actions`, `technique.outputs`

Technique outputs | outputs | clean | no activity `set` in these files.

#### AP-40. readme-orients-not-transcribes — **Fires on:** `readme`

- `plan-prepare/README.md` | body | clean | contribution table of the two techniques, not activity steps, exits, variables, or a loader path

#### AP-41. avoidance-voice-in-definitions — **Fires on:** `workflow.description`, `activity.description`, `activity.outcome`, `technique.capability`, `activity.steps[].options[].description`, `activity.steps[].actions[].description`, `readme`, `resource`

- `plan-prepare/README.md` | body | clean | present-tense contribution
- `plan-prepare/TECHNIQUE.md` | capability | clean | no prior-design contrast
- other technique capabilities | capability | clean | no avoidance frame

#### AP-43. canonical-artifact-ids — **Fires on:** `technique.protocol`, `technique.inputs`, `technique.outputs`

The `changes/` literal is `artifact-name-in-io`. Other ids | inputs and outputs | clean | no `*-path` proxy standing in for an artifact id. `planning_folder_path` and `target_path` are the workflow-root slots.

#### AP-45. no-opaque-artifact-path-array — **Fires on:** `technique.inputs`, `technique.protocol`

- `resolve-artifact-publish.md` | inputs `modified_paths` | clean | protocol filters the set by `{planning_folder_path}` and does not name the files
- `run-contract-tests.md` | inputs `contract_tests_merged_paths` | clean | one test-path collection, scoped to the project's test command
- other inputs | inputs | clean | no opaque multi-artifact array

#### AP-47. no-redundant-link-label — **Fires on:** `*`

Each of the 21 files | body | clean | no `word ([word](url))`.

#### AP-48. brace-output-references — **Fires on:** `technique.protocol`

Each technique protocol | protocol | clean | products are `{plan_document}`, `{assumptions_log}`, `{assumption_review_presentation}`, `{prior_feedback_triage}`, `{task_implementation}`, `{contract_tests_passed}`, `{fragment_references_issue}`, `{surfaced_assumptions}`, `{review_event}`, `{contract_tests_fail_on_base}`, `{contract_tests_changed_paths}`, `{publishable_files}`.

#### AP-49. no-delivery-mechanism-narration — **Fires on:** `technique.protocol`

Each technique protocol | protocol | clean | no "loaded via `get_technique`" or `_resources` narration.

#### AP-50. no-tool-usage-prescription — **Fires on:** `technique.capability`, `technique.protocol`, `technique.rules`

Each technique file | those fields | clean | no `get_resource` / `get_technique` / `get_activity` / `get_workflow` / `start_session` / `next_activity` / `list_workflows` recipe. `git` and `gh` mentions are not that session-tool list.

#### AP-51. canonical-technique-reference — **Fires on:** `technique.protocol`

Each technique protocol | protocol | clean | no raw harness tool named for a wrapped capability.

#### AP-52. brace-declared-ids — **Fires on:** `technique.protocol`, `technique.capability`

Each technique capability and protocol | those fields | clean | declared ids appear as `{id}`. No capability brace. No orphan index.

#### AP-53. dotted-rule-address — **Fires on:** `technique.protocol`

- `review-assumptions/collect.md` | protocol | clean | "`manage-artifacts.markdown-line-breaks`"
- `review-assumptions/reconcile.md` | protocol | clean | the same dotted address
- `review-assumptions/record.md` | protocol | clean | "`manage-artifacts.state-once-per-artifact`"
- `resolve-artifact-publish.md` | protocol | clean | "`manage-git.directory-scope`"
- other protocols | protocol | clean | no prose "per the X rule" and no hyperlink to a rule heading

#### AP-54. anchored-protocol-references — **Fires on:** `technique.protocol`

Each technique protocol | protocol | clean | I/O is `{id}`, rules are dotted, resources are anchored links. Sibling hits are recorded on their own entries.

#### AP-55. hoist-shared-inputs — **Fires on:** `technique.inputs`, `technique.inherited_inputs`

`assumption_categories` and `assumption_source` are on `review-assumptions/TECHNIQUE.md` and again on `surface-assumptions.md`. Two leaves whose common ancestor is the workflow root, which does not declare them. Do not flag (two or three). `contract_tests_path` is on `verify-contract-tests-fail.md` and `write-contract-tests.md` only. Do not flag. No leaf in this slice re-declares `planning_folder_path` or `target_path`. | inputs | clean

#### AP-56. paren-invocation-args — **Fires on:** `technique.protocol`

Each technique protocol | protocol | clean | no `::op {arg: value}`. The italic `*name*` invocation is in Rules, outside this fires-on.

#### AP-57. escape-literal-dollar — **Fires on:** `*`

Each of the 21 files | body | clean | no unescaped `$` outside a code span.

#### AP-58. snake-case-symbols — **Fires on:** `technique.inputs`, `technique.outputs`, `technique.protocol`, `technique.rules`

Each technique file | those fields | clean | ids are snake_case. Rule slugs and `::` targets stay kebab. Locals `eng_git_dir` and `eng_branch` are snake_case.

#### AP-60. local-rule-as-note — **Fires on:** `technique.rules`, `technique.protocol`

Files with rules | rules | clean | each rule spans the technique. Step caveats already under instructions are `>` notes.

#### AP-61. factor-repeated-paths — **Fires on:** `technique`

Each technique file | body | clean | no path literal repeated in one file. `{planning_folder_path}` and `{target_path}` are the declared slots.

#### AP-63. backtick-code-tokens — **Fires on:** `*`

Each of the 21 files | body | clean | `{id}`, `{$name}`, dotted rules, `git` commands, and filenames sit in code spans. `changes/`, `README.md`, `review-summary.md`, `session.json`, `.session-token`, `deferred-items.json`, `assumptions-log.md`, `work-package-plan.md` are backticked where they appear as literals.

#### AP-64. boolean-id-shape — **Fires on:** `technique.inputs`, `technique.outputs`

Boolean outputs | outputs | clean | affirmative stems, no `_flag` / `_status` / `_check`.

#### AP-65. collection-id-shape — **Fires on:** `technique.inputs`, `technique.outputs`

Collection ids | inputs and outputs | clean | `open_assumptions`, `surfaced_assumptions`, `publishable_files`, `contract_test_failures`, `body_findings`, `modified_paths`. No `_list` / `_array` / `_collection` / `_set`.

#### AP-66. io-id-shape — **Fires on:** `technique.inputs`, `technique.outputs`

Each technique I/O id | inputs and outputs | clean | no bare `summary` / `artifact` / `result`. `planning_folder_path` and `target_path` are the workflow-root ids. `host_repo_path`, `contract_tests_path`, `modified_paths`, `contract_tests_merged_paths`, and `contract_tests_changed_paths` name a path the way that root contract names a path.

#### AP-67. rule-slug-shape — **Fires on:** `technique.rules`

Files with rules | rules | clean | `tasks-are-code-changes-only`, `publish-ref-is-a-branch`, `elevate-implicit`, `assembled-entries-carry-their-evidence`, `assumptions-log-is-the-record`, `classification-transparency`, `every-prior-finding-dispositioned`, `confirmed-blocker-sets-the-cap`, `single-ingest-of-reported-failures`, `pr-body-conformance`, `review-comment-verbatim`, `remote-git-runs-on-the-host-shell`. `no-user-interaction` is an intentional negation.

#### AP-70. capability-group-placement — **Fires on:** `technique`, `workflow.techniques`

Each technique file | path | clean | groups `plan-prepare`, `review-assumptions`, `update-pr`, `raise-deferred-items`, `strategic-review` are work-package capability groups, not the workflow's entire technique set.

#### AP-71. no-false-resource-delivery — **Fires on:** `technique`, `resource`, `readme`

Each of the 21 files | body | clean | no false tool-payload claim.

#### AP-72. complete-bootstrap-path — **Fires on:** `technique`, `resource`

Each technique file | body | clean | none is a bootstrap sequence.

#### AP-73. consistent-tool-names — **Fires on:** `technique`, `resource`, `readme`

Each of the 21 files | body | clean | no renamed harness tool. Canonical `get_technique` is not misnamed because it is not prescribed.

#### AP-75. describe-tool-value — **Fires on:** `technique`, `resource`

Each technique file | body | clean | not an engine or bootstrap tool doc.

#### AP-76. no-redundant-tools — **Fires on:** `technique`, `resource`

Each technique file | body | clean | no subset tool recommended beside a required one.

#### AP-77. impl-before-confirmed-approach — **Fires on:** `*`

Each of the 21 files | body | clean | definitions, not an unconfirmed edit session.

#### AP-78. follow-through-on-recommend — **Fires on:** `*`

Each of the 21 files | body | clean | no stopped recommendation.

#### AP-79. structure-backed-constraints — **Fires on:** `workflow.rules`, `activity.rules`, `technique.rules`, `activity.steps`, `activity.exits`

Technique rules | rules | clean | prose invariants the activity can gate; this slice has no `steps[]` to back them. Not raised as a defect of the technique text alone.

#### AP-80. preserve-readme-content — **Fires on:** `readme`

- `plan-prepare/README.md` | body | clean | the diff adds "with a contract per task" / "a contract per task"; it does not shrink the README

#### AP-81. verify-format-literacy — **Fires on:** `workflow`, `technique`, `resource`

Each technique file | body | clean | sections match the technique form. This walk did not run the guard suite.

#### AP-83. accept-correction — **Fires on:** `*`

Each of the 21 files | body | clean | no dispute of a correction.

#### AP-84. single-closeout-artifact — **Fires on:** `resource`, `readme`

- `plan-prepare/README.md` | body | clean | no close-out footer

#### AP-95. enforce-output-discipline — **Fires on:** `workflow.rules`, `technique.rules`, `resource`

Technique rules | rules | clean | no output-discipline ruleset standing in for a missing verify technique.

#### AP-96. artifact-audience-declared — **Fires on:** `technique.outputs`

Each `#### artifact` | outputs | clean | `plan.md` `human`; `raise-deferred-items/record.md` `agent`; `collect.md`, `reconcile.md`, `review-assumptions/record.md` `human`; `review-existing-feedback.md` `agent`.

#### AP-100. runtime-rules-only — **Fires on:** `workflow.rules`, `activity.rules`, `technique.rules`

Technique rules | rules | clean | session conduct for the technique's own result, not authoring standards.

#### AP-102. no-technique-resource-dual-home — **Fires on:** `technique`, `resource`

Each technique file | body | clean | operative criteria are cited (`#rules`, `#classification-vocabulary`, `#template`), not copied as a second detect list.

#### AP-103. cited-home-owns-claim — **Fires on:** `technique`, `resource`, `readme`

Each cite | body | clean | this walk did not reopen the resource homes. No cite in this slice asserts a fact the link text itself contradicts. Not raised.

#### AP-104. operative-criteria-need-a-home — **Fires on:** `technique.protocol`, `resource`

Each technique protocol | protocol | clean | no reusable Detect/Fix catalogue embedded in a protocol.

#### AP-105. no-shadow-audit-pass — **Fires on:** `technique.protocol`

Each technique protocol | protocol | clean | no compressed copy of a catalog another technique walks.

#### AP-107. bind-site-is-orchestration-truth — **Fires on:** `readme`, `resource`, `technique`, `workflow.description`, `activity.steps`, `workflow.graph`, `workflow.initialActivity`

- `plan-prepare/README.md` | body | clean | the table names the group's techniques and what each contributes; it is not an activity or step list
- other files | body | clean | no ordered activity or step list outside YAML

#### AP-108. numbered-protocol-phases — **Fires on:** `technique.protocol`

Each technique protocol | protocol | clean | multi-bullet phases elaborate one outcome (one write, one triage, one analysis loop). No heading collapses two outcomes that must be separate phases.

#### AP-109. technique-outputs-declared — **Fires on:** `technique.capability`, `technique.protocol`, `technique.outputs`

Each technique that returns a value declares it. `create-todos.md` | outputs | clean | field absent; registering harness TODOs captures no path or count (`technique-outputs-declared` Do not flag for a pure side-effect).

#### AP-110. duplicate-shared-capability — **Fires on:** `technique.protocol`

Each technique protocol | protocol | clean | no re-taught `gh pr create` / fan-out. `post-review-comment.md` no longer Applies `post-pr-review`.

#### AP-114. pass-orchestration-in-technique — **Fires on:** `technique.capability`, `technique.protocol`

Each technique capability and protocol | those fields | clean | no Apply and no `::` in Capability or Protocol.

#### AP-116. no-template-creation-guide — **Fires on:** `technique.protocol`, `resource`

Same cites as P28 | protocol | clean | persisting protocols cite a template or rules anchor rather than embedding the layout.

#### AP-120. procedure-in-capability — **Fires on:** `technique.capability`

Each technique capability | capability | clean | a product statement with no link and no `{id}`. Verb-led lines (`Run the merged contract tests`, `Write integration tests`, `Confirm the contract tests`, `Add the symbols`, `Resolve the engineering checkout`) name the product and carry no link, brace, or mode branch.

#### AP-122. prompt-restates-owned-mechanics — **Fires on:** `resource`, `technique`

Each technique file | body | clean | not a spawn stub. No `step_techniques` or yield/replay lecture.

#### AP-123. capability-as-op-inventory — **Fires on:** `technique.capability`

- `plan-prepare/TECHNIQUE.md` | capability | clean | domain statement, no hyperlinked child list
- `review-assumptions/TECHNIQUE.md` | capability | clean | lifecycle statement
- `update-pr/TECHNIQUE.md` | capability | clean | two products, not a folder index
- leaves | capability | clean | one product

#### AP-124. alternate-ops-as-protocol-sequence — **Fires on:** `technique.protocol`

Each technique protocol | protocol | clean | phases are ordered. `update-pr/TECHNIQUE.md` has no protocol; its `initial` / `final` enum is an input.

#### AP-125. technique-ref-in-io-contract — **Fires on:** `technique.inputs`, `technique.outputs`

Each technique I/O | inputs and outputs | clean | links go to `resources/`, not `techniques/`. "analyse-challenge" is the producer hit under `io-agnostic-contract`; there is no technique hyperlink.

#### AP-126. cut-comment-jsdoc-verbosity — **Fires on:** `*`

Each of the 21 files | body | clean | no code comments.

#### AP-127. no-dense-prose-after-config-examples — **Fires on:** `resource`, `technique`, `readme`

Each of the 21 files | body | clean | no example fence followed by a restatement.

#### AP-128. worktree-root-placeholders — **Fires on:** `*`

Each of the 21 files | body | clean | no machine path. Placeholders are `{target_path}`, `{planning_folder_path}`, `{host_repo_path}`, `{contract_tests_path}`.

#### AP-129. no-parallel-runbook-when-setup-covers-it — **Fires on:** `technique.protocol`, `readme`, `resource`

Each technique protocol and the README | those fields | clean | no clone/install/build/start runbook.

#### AP-131. bag-value-as-literal — **Fires on:** `workflow`, `activity`, `technique`, `resource`

Each technique file | body | clean | operative paths are `{id}`. `changes/` has no declared slot whose description names that directory, so both conditions of the detect do not hold. Recorded under `artifact-name-in-io`.

#### AP-133. stale-restatement-after-change — **Fires on:** `readme`, `activity.description`, `technique.capability`, `activity.outcome`, `resource`

- `plan-prepare/README.md` | body | clean | capability line matches `plan-prepare/TECHNIQUE.md` ("with a contract per task")
- `plan-prepare/plan.md` | capability | clean | "a contract per task" matches the output
- other capabilities and the README | those fields | clean | no pre-change phrase left asserting a gate this diff removed

#### AP-134. artifact-name-is-filename — **Fires on:** `technique.outputs`

Each `#### artifact` body | outputs | clean | one filename: `work-package-plan.md`, `deferred-items.json`, `assumptions-log.md`, `prior-feedback-triage.json`.

#### AP-136. deployment-path-in-capability — **Fires on:** `technique.capability`

Each technique capability | capability | clean | no repo-relative or absolute path.

#### AP-137. overlapping-rule-scopes — **Fires on:** `technique.rules`, `workflow.rules`, `activity.rules`, `resource`

Files with rules | rules | clean | no two triggers on one input with different handling and no order.

#### AP-138. whole-resource-for-one-section — **Fires on:** `technique`, `resource`

Each technique file | body | clean | resource links in this slice include a `#` anchor. No bare cite beside an anchored cite of the same resource.

#### AP-139. tool-contract-restated-in-protocol — **Fires on:** `technique.protocol`, `technique.rules`

Each technique protocol and rules | those fields | clean | no harness-tool argument schema copied out. The `git branch --show-current` line is the command, not a tool schema.

#### AP-140. phase-cited-by-ordinal — **Fires on:** `technique.rules`, `technique.inputs`, `technique.outputs`, `technique.capability`, `technique.protocol`, `resource`, `readme`

Each of the 21 files | those fields | clean | no "step N" / "phase N" / "the Nth step".

#### AP-141. unowned-harness-capability — **Fires on:** `technique`

Each technique file | body | clean | no one tool named for the same capability in two of these files without an output.

#### AP-142. output-without-destination — **Fires on:** `technique.outputs`, `activity.steps`

Outputs with `#### artifact` land on that filename. `has_deferred_assumptions` is an output of `settle-assumptions.yaml`, read for the relocation test. Other value outputs (`contract_tests_passed`, `task_implementation`, `surfaced_assumptions`, `body_conforms`, `review_event`) have no landing inside this slice. | outputs | clean | not raised; binding activities were not opened

#### AP-144. declared-input-never-read — **Fires on:** `technique.inputs`, `technique.protocol`, `technique.rules`

- container inputs on `plan-prepare/TECHNIQUE.md` are read by `plan.md` (`design_philosophy_doc`, `analysis_document`, `research_document`)
- container inputs on `review-assumptions/TECHNIQUE.md` are read by `collect.md` and `reconcile.md`
- `update-pr/TECHNIQUE.md` inputs are the group contract; `post-review-comment.md` reads `pr_number` in its output text. Sibling ops under `update-pr/` were not opened. Container inputs a descendant reads are Do not flag.
- leaf inputs in this slice appear in that leaf's protocol | inputs | clean

#### AP-145. apply-omits-declared-input — **Fires on:** `technique.protocol`, `technique.inputs`

Each technique protocol | protocol | clean | no Apply or `::` in Protocol. The Rules `::context` passes `*name*`.

#### AP-147. inherited-rules-re-enumerated — **Fires on:** `technique.rules`

Files with rules | rules | clean | no entry that is only a list of rules the reader already receives. Cites name a home (`plan-guide`, `pr-description`) rather than re-listing that home's roster.

#### AP-151. rule-binds-beyond-its-operation — **Fires on:** `technique.rules`

Files with rules | rules | clean | each subject is a product of that technique or its group (plan task, publish ref, assumption log, reconciliation, prior-feedback triage, PR body, review comment).

#### AP-152. inherited-input-re-declared — **Fires on:** `technique.inputs`, `technique.inherited_inputs`

Each leaf `## Inputs` | inputs | clean | no id the workflow-root or the in-slice group `TECHNIQUE.md` already declares. Group `TECHNIQUE.md` files are containers; their declarations are Do not flag.

#### AP-153. schema-semantics-restated — **Fires on:** `technique.rules`, `technique.capability`, `resource`

Technique rules and capabilities | those fields | clean | no operator roster, default, or co-declaration copied from the schema.

#### AP-154. engine-internals-narrated — **Fires on:** `technique`

Each technique file | body | clean | not an engine technique. `session.json` and `.session-token` in `resolve-artifact-publish.md` are members of the publishable set the reader filters, not a server storage lecture.

#### AP-155. value-set-in-prose — **Fires on:** `workflow.variables`, `technique.inputs`, `technique.outputs`, `resource`

- `update-pr/TECHNIQUE.md` | inputs `pr_template_variant` | clean | parenthetical enum; technique inputs in this slice carry no `values` field, and the set is the author's enum rather than a schema roster
- `update-pr/post-review-comment.md` | inputs `review_type` and outputs `review_event` | clean | the event names are what the value is; the map is the protocol's work
- other I/O | inputs and outputs | clean | no pipe-roster of a variable that has a `values` field elsewhere

#### AP-157. call-omits-conditionally-required-argument — **Fires on:** `technique.protocol`, `technique.rules`

Each technique protocol and rules | those fields | clean | no whole signature of a harness tool.

#### AP-158. call-omits-required-argument — **Fires on:** `technique.protocol`, `technique.rules`

Each technique protocol and rules | those fields | clean | no whole harness-tool signature.

#### AP-159. call-names-an-undeclared-argument — **Fires on:** `technique.protocol`, `technique.rules`

Each technique protocol and rules | those fields | clean | no harness-tool signature. `git -C {eng_git_dir} branch --show-current` is a shell command.

#### AP-160. protocol-phase-as-list-item — **Fires on:** `technique.protocol`

Each technique protocol | protocol | clean | phases are `### N. Title`, not `N.` list entries or bold leads.

#### AP-162. produce-path-without-a-reading — **Fires on:** `technique.protocol`

- `run-contract-tests.md` | outputs | clean | pass means every suite passes; failures name the Contract fields
- `verify-contract-tests-fail.md` | outputs | clean | false covers pass and cannot-run
- `raise-deferred-items/record.md` | protocol | clean | sets `issue` in the register shape the template gives
- other protocols | protocol | clean | a reading, a classification, or a write

#### AP-163. construct-folder-without-a-readme — **Fires on:** `activity`, `technique`, `resource`, `routine`

Folders measured by listing, not by reading the other READMEs: `plan-prepare/`, `raise-deferred-items/`, `review-assumptions/`, `strategic-review/`, `update-pr/` each have `README.md`. Standalone files sit in `techniques/`, which has `README.md`. | folder | clean

#### AP-164. relocation-without-a-preserved-outcome — **Fires on:** `activity.steps`, `activity.exits`, `technique`, `workflow.rules`, `activity.rules`, `technique.rules`

Same three sites as P38 | technique | clean | receivers declare the convergence flags; `draft-first` has no receiver; plan ordering remains in the phase sentence.

#### AP-165. unproducible-declared-value — **Fires on:** `technique.outputs`, `technique.protocol`

Each declared output | outputs | clean | a phase emits or writes it, and no later phase reassigns it over the same subjects. `fragment_references_issue` is set true, false, or null by the two phases. `contract_tests_fail_on_base` is emitted by the only phase.

#### Reference Conventions — **Fires on:** `workflow`, `activity`, `technique`, `routine`, `resource`

Each technique file | body | clean | kebab `.md`, semantic version, Capability / Inputs / Outputs / Protocol / Rules omitted only where the technique has none (`create-todos.md` has no Outputs). README does not meet this fires-on.

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| D1 | Live | High | `bind-protocol-locals` | `update-pr/post-review-comment.md` protocol phase 3 note and phase 4 | "`{live_review_body}`" is compared with `{review_summary}` and is not a declared id. The base bound `{$live_review_body}` from the post op; that bind is gone. | diff | Bind `{$live_review_body}` before the reads, or declare the input. |
| D2 | Live | High | `technique-inputs-declared` | `update-pr/post-review-comment.md` protocol | Protocol names `{live_review_body}` and `## Inputs` has no `### live_review_body`. | diff | Declare the input and reference `{live_review_body}`. |
| D3 | Live | High | `reference-without-provenance` | `surface-assumptions.md` protocol phase 1 note | "take the findings and working context already in hand" — no input, output, phase, or link supplies those findings. | diff | Name the supplier or delete the fallback. |
| D4 | Contract | Medium | `no-bind-mechanics-as-prose` | `surface-assumptions.md` protocol phase 1 note | "Where `{assumption_source}` is absent, take the findings and working context already in hand." | diff | Delete the fallback. Close it with a declared default or a call-site binding. |
| D5 | Contract | Medium | `io-agnostic-contract` | `review-assumptions/assemble-open-set.md` inputs `open_assumptions` | "Empty where analyse-challenge resolved every assumption." | pre-existing | Describe the empty value. Drop the activity name. |
| D6 | Contract | Medium | `io-agnostic-contract` | `review-existing-feedback.md` inputs `review_pr_url` | "captured during PR-reference detection" | pre-existing | Say what the URL is. Drop the detection step. |
| D7 | Contract | Medium | `io-agnostic-contract` | `review-existing-feedback.md` outputs `prior_feedback_triage` | "so downstream reported-failure triage consumes it rather than re-reading the thread" | pre-existing | Describe the row. Drop the downstream consumer. |
| D8 | Contract | Medium | `io-agnostic-contract` | `update-pr/post-review-comment.md` outputs `posted_review_id` | "which a later run supplies to replace the body in place" | pre-existing | Say what the id is. Drop the later run. |
| D9 | Contract | Medium | `contract-not-procedure` | `review-existing-feedback.md` outputs `rating_cap` and protocol phase 3 | Phase 3 restates the output's Confirmed → request-changes tree. | pre-existing | Keep the tree on the output. Protocol emits `{rating_cap}`. |
| D10 | Contract | Medium | `technique-stage-agnostic` | `update-pr/post-review-comment.md` protocol phase 2 | "the rating already honours the Prior Feedback Triage rating cap" | pre-existing | State the permissiveness constraint without naming that stage. |
| D11 | Contract | Medium | `branch-on-undeclared-threshold` | `review-assumptions/assemble-open-set.md` protocol phase 2 | "At five or more entries, group them by theme" | pre-existing | Declare the count, or delete the branch. |
| D12 | Contract | Medium | `no-rule-protocol-restatement` | `review-assumptions/TECHNIQUE.md` rules `assembled-entries-carry-their-evidence` | "its reversibility is read from that symbol's connectivity through [gitnexus]…::[context]…" | pre-existing | Move the connectivity reading into Protocol. Keep the evidence invariant in Rules. |
| D13 | Contract | Medium | `unreachable-operation-reference` | `update-pr/TECHNIQUE.md` rules `review-comment-verbatim` | "via [post-pr-review](/github/techniques/post-pr-review.md)" and the child protocol does not invoke it | pre-existing | State the verbatim-post fact without the technique link. The run that posts owns the op. |
| D14 | Contract | Medium | One Authoritative Home | `update-pr/post-review-comment.md` protocol phase 3 note and phase 4 | Both say compare `{live_review_body}` with `{review_summary}` and adopt an out-of-band edit before replace. | diff | Keep the comparison in phase 4 only. |
| D15 | Hygiene | Low | `no-rationale-in-description` | `review-assumptions/TECHNIQUE.md` rules `assumptions-log-is-the-record` | "so a later reader settles an outcome from the log rather than from the transcript that produced it" | pre-existing | Delete the so-clause. |
| D16 | Hygiene | Low | `no-rationale-in-description` | `resolve-artifact-publish.md` rules `publish-ref-is-a-branch` | "so a reader following a branch link sees the current tree while a reader following a sha link sees the tree as it stood before those files existed" | pre-existing | Keep "The emitted ref is the branch, never a commit SHA." |
| D17 | Hygiene | Low | `technique-stage-agnostic` | `resolve-artifact-publish.md` rules `publish-ref-is-a-branch` | "Re-resolving on a later activity refreshes the branch tip" | pre-existing | Delete the later-activity sentence. |
| D18 | Hygiene | Low | `technique-stage-agnostic` | `review-assumptions/collect.md` protocol phase 2 | "Use the categories supplied for the current phase." | pre-existing | Drop "for the current phase." |
| D19 | Hygiene | Low | `technique-stage-agnostic` | `review-existing-feedback.md` protocol phase 1 | "Do this before any independent code, structural, or test analysis" | pre-existing | Delete the before-clause. |
| D20 | Hygiene | Low | `no-rationale-in-description` | `review-existing-feedback.md` protocol phase 1 | "so the existing signal frames the review rather than being reconciled after a verdict is formed" | pre-existing | Delete the so-clause. |
| D21 | Hygiene | Low | `no-rationale-in-description` | `review-existing-feedback.md` rules `confirmed-blocker-sets-the-cap` | "which this pass has not seen the findings to decide" | pre-existing | Delete that clause. |
| D22 | Hygiene | Low | `no-rationale-in-description` | `review-existing-feedback.md` rules `single-ingest-of-reported-failures` | "so downstream triage consumes it once rather than re-reading the thread" | pre-existing | Delete the so-clause. |
| D23 | Hygiene | Low | `platform-semantics-in-capability` | `plan-prepare/README.md` | "The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md)" | pre-existing | Delete the inherit sentence. Leave the contribution table. |
| D24 | Hygiene | Low | `constraint-as-blockquote` | `review-assumptions/collect.md` protocol phase 3 | "If no significant assumptions are identified, record a single null row" | pre-existing | Make the record the bullet and the condition a `>` note. |
| D25 | Hygiene | Low | `constraint-as-blockquote` | `update-pr/post-review-comment.md` protocol phase 4 | "If the PR cannot be found because `{pr_number}` does not exist, verify the PR number and check `gh` auth before retrying." | pre-existing | Move the missing-PR path to a `>` note. |
| D26 | Hygiene | Low | `no-duplicated-guidance` | `review-assumptions/assemble-one.md` and `assemble-open-set.md` protocol | Both: "differentiating its decision space on the Trade-off Dimensions that meaningfully separate its alternatives" | pre-existing | Keep one copy on the group contract and point both leaves at it. |
| D27 | Hygiene | Low | `rule-as-protocol-step` | `review-assumptions/reconcile.md` protocol phase 4 | "A question the analysis leaves open stays in the assumptions log as an open assumption" | pre-existing | Move the sentence to Rules. |
| D28 | Hygiene | Low | `rule-as-protocol-step` | `write-contract-tests.md` protocol phase 1 | "Goal, deliverables, and any plan section outside that Contract are out of scope" and "Implementation source is out of scope" | diff | Move both prohibitions to Rules. |
| D29 | Hygiene | Low | `no-engine-mechanics-as-rules` | `review-assumptions/reconcile.md` rules `no-user-interaction` | "Converged results bind as outputs." | pre-existing | Delete that sentence. |
| D30 | Hygiene | Low | `no-bind-mechanics-as-prose` | `resolve-artifact-publish.md` inputs `modified_paths` | "already read by the run" | diff | Delete the clause. Leave the tracked-paths description. |
| D31 | Hygiene | Low | `procedure-in-io-contract` | `update-pr/TECHNIQUE.md` inputs `host_repo_path` and `target_path` | "used with `.engineering/` … to resolve the engineering link URL"; "from which the target repo URL is resolved" | pre-existing | Say what each path is. Move the resolve into Protocol. |
| D32 | Hygiene | Low | `one-invariant-per-rule` | `review-assumptions/TECHNIQUE.md` rules `assembled-entries-carry-their-evidence` | Evidence carriage and the gitnexus connectivity reading are separate constraints. | pre-existing | One entry per constraint. |
| D33 | Hygiene | Low | `instruction-narrates-an-actor` | `review-assumptions/assemble-open-set.md` capability | "ordered so a stakeholder settles the highest-impact decision first" | pre-existing | Delete the stakeholder clause. |
| D34 | Hygiene | Low | `instruction-narrates-an-actor` | `update-pr/post-review-comment.md` protocol phase 3 | "The posting step sends a pull-request review." | diff | Keep "Hold `{review_event}`" and the description-update prohibition. |
| D35 | Hygiene | Low | `technique-stage-agnostic` | `update-pr/post-review-comment.md` protocol phase 3 | "The posting step sends a pull-request review." | diff | Drop the posting-step sentence. |
| D36 | Hygiene | Low | `session-interaction-in-technique` | `update-pr/post-review-comment.md` protocol phase 2 | "report the discrepancy rather than posting the more permissive one" | pre-existing | Emit the held verdict. Delete "report". |
| D37 | Hygiene | Low | `artifact-name-in-io` | `strategic-review/verify-fragment.md` outputs and protocol phase 1 | "no `changes/` directory exists" | pre-existing | Name the directory by an input id. |
| D38 | Hygiene | Low | A Phase Heading Names the Outcome | `review-assumptions/collect.md` protocol | "### 4. Append Them to the Log" | pre-existing | Shorten to the outcome, four words or fewer. |
| D39 | Hygiene | Low | A Phase Heading Names the Outcome | `review-assumptions/record.md` protocol | "### 2. Write the Outcomes Into the Log" | pre-existing | Shorten to the outcome, four words or fewer. |
| D40 | Hygiene | Low | A Phase Heading Names the Outcome | `resolve-artifact-publish.md` protocol | "### 1. Resolve the Checkout and Branch" | pre-existing | Shorten to the outcome, four words or fewer. |

Bands: Live 3 · Contract 11 · Hygiene 26. Findings 40.
