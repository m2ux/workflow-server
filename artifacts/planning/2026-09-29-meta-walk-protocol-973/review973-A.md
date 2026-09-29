# Review 973 — Canon slice A: anti-patterns overview, entry identity, AP-01 to AP-70

Home: `corpus/canon/resources/anti-patterns.md` on the corpus worktree `meta-walk-protocol` (head `f093a318`, base `03dfd4e2`). The file is untouched by #991 and sits on the surface as a closure file. It was read whole (lines 1-2084).

Method:
- The overview was applied as written: each entry is one smell, tested by its own Detect, Do not flag and Fix.
- Each unit was applied entry-major across all 84 paths in `s973-surface.txt`.
- The touched files were attributed from `git log -p 03dfd4e2..HEAD`, which is one commit and read whole. Base text was checked with `git show 03dfd4e2:<path>`.
- Engine claims were settled on the engine worktree `fan-barrier-destination`:
  - `workflow-tools.ts:1542`: the only write of `status = 'completed'`. Nothing sets it back.
  - `:1636-1646`: the #978 barrier `destination` on the call that opens a fan.
  - `state.schema.ts:6`: the history event type `activity_entered`.

The file groups AP-01 to AP-70 under six family headings (Structural, Interaction, Schema Expressiveness, Rule Hygiene, Description Hygiene, Coupling). The prompt's "families 1 through 7" is taken to mean that range.

## Units

- `# Overview`: walked. No surface file cites an entry against the overview's split: stance lives in principles, smells in the catalogue.
- `### Entry identity`: walked.
  - All 165 headings match `### AP-NN. kebab-name`, in file order, with no gap or repeat.
  - No surface file cites an entry by number (`AP-[0-9]` appears only in the headings).
  - No surface file cites the entry count.
- `## Structural`: walked (family intro)
  - `### AP-01. no-inline-content`: walked. The new specimen is split into `workflow.yaml` plus one file per activity. No body is inlined.
  - `### AP-02. schema-is-constraint`: walked. #991 and #978 change no schema file.
  - `### AP-03. no-partial-implementation`: walked. The PR says `Refs #973`, not a done claim. The #974 deferral is a decision already taken.
  - `### AP-04. no-invented-naming`: walked
- `## Interaction`: walked (family intro)
  - `### AP-05. atomic-checkpoints`: walked. The options of `design-intent-batch` are alternative answers to one classification.
  - `### AP-06. no-assumption-execution`: not-applicable. The entry covers "The agent chooses among materially different interpretations of user intent without asking", and no session is on the surface.
  - `### AP-07. scope-reverify-completion`: walked. There is no done or complete claim (`Refs #973`). A related note is under Findings.
  - `### AP-08. one-question-per-message`: walked. No user-facing message on the surface asks two questions.
- `## Schema Expressiveness`: walked (family intro)
  - `### AP-09. checkpoint-not-prose`: walked
  - `### AP-10. loop-not-prose`: walked. take-activity `no-session-left-running` ("Take its activities until…") is the `while` of `activity-loop`, and the earlier walks disposed of it the same way.
  - `### AP-11. decision-not-prose`: walked
  - `### AP-12. artifact-not-buried`: walked
  - `### AP-13. variable-for-approval`: walked
  - `### AP-14. mode-as-state`: walked
  - `### AP-15. procedure-in-protocol`: walked. The new steps `spend-entered-activity` and `end-walk` carry no `description`.
  - `### AP-16. technique-inputs-declared`: walked. Every designator the new Protocol text reads is declared:
    - `{activity_entered}` on dispatch-activity and take-activity;
    - `{variables_changed}` inherited from `workflow-engine/TECHNIQUE.md`, and declared on enter-fan.
  - `### AP-17. bound-step-no-description`: walked
  - `### AP-18. no-monolith-masking-steps`: walked
- `## Rule Hygiene`: walked (family intro)
  - `### AP-19. no-rule-protocol-restatement`: walked. The edited `no-session-left-running` is a positively framed invariant on an outcome (Do not flag).
  - `### AP-20. rule-group-disambiguation`: walked
  - `### AP-21. grouped-rule-keys`: walked
  - `### AP-22. single-rule-authority`: walked
  - `### AP-23. worker-rule-reach`: walked
  - `### AP-24. no-contradictory-rules`: walked
  - `### AP-25. no-one-step-rules`: walked
- `## Description Hygiene`: walked (family intro)
  - `### AP-26. no-rationale-in-description`: walked
  - `### AP-27. validate-message-economy`: walked
  - `### AP-28. no-sequence-in-description`: walked.
    - The `activity-loop` description enumerates its steps. So does its sibling routine, `dispatch-round`, so that is convention.
    - The new specimen's descriptions state purpose only.
  - `### AP-29. no-user-env-mutation`: walked
  - `### AP-30. role-rules-not-description`: walked
  - `### AP-31. no-hand-authored-artifacts`: walked
  - `### AP-32. outcome-names-value`: walked. The new outcomes state value: "The client session is completed", and "the advance after it completes the session".
  - `### AP-33. no-set-of-technique-output`: walked
  - `### AP-34. no-valueless-control-set`: walked. The new `set` actions all carry a `value`.
  - `### AP-35. no-intra-step-input-set`: walked
  - `### AP-36. techniques-list-disjoint`: walked
  - `### AP-37. rule-audience-bucket`: walked
  - `### AP-38. no-duplicate-technique-steps`: walked
  - `### AP-39. hoist-universal-techniques`: walked
  - `### AP-40. readme-orients-not-transcribes`: walked.
    - The workflow-design README line "a rejected review target set runs it again" is a connection, which the Do not flag list allows.
    - The count "two activities and no steps" in the exitless-end README matches the mvw sibling ("one of each").
  - `### AP-41. avoidance-voice-in-definitions`: walked. The new negations ("no worker is spawned", "no activity was carried", "which no worker returned") state current behaviour, not a contrast with a prior design.
- `## Coupling`: walked (family intro)
  - `### AP-42. io-agnostic-contract`: walked. The new I/O entries name envelope fields and server fields, which are intrinsic origin, and no workflow-internal caller.
  - `### AP-43. canonical-artifact-ids`: walked
  - `### AP-44. artifact-name-in-io`: walked
  - `### AP-45. no-opaque-artifact-path-array`: walked
  - `### AP-46. no-resource-caller-backlink`: walked
  - `### AP-47. no-redundant-link-label`: walked
  - `### AP-48. brace-output-references`: walked
  - `### AP-49. no-delivery-mechanism-narration`: walked. The carve-out covers workflow-engine and fan techniques.
  - `### AP-50. no-tool-usage-prescription`: walked. The `next_activity {…}` signatures sit on engine and fan techniques, which the Do not flag list covers.
  - `### AP-51. canonical-technique-reference`: walked
  - `### AP-52. brace-declared-ids`: walked
  - `### AP-53. dotted-rule-address`: walked. #991 adds no rule citation, and the existing ones sit at the citer's length.
  - `### AP-54. anchored-protocol-references`: walked
  - `### AP-55. hoist-shared-inputs`: walked.
    - `activity_entered` sits on two leaves, and their common container declares none. That falls in the carve-out.
    - `variables_changed` is hoisted onto `workflow-engine/TECHNIQUE.md`.
  - `### AP-56. paren-invocation-args`: walked
  - `### AP-57. escape-literal-dollar`: walked. The only `$` is `$schema:` in YAML.
  - `### AP-58. snake-case-symbols`: walked
  - `### AP-59. constraint-as-blockquote`: walked
  - `### AP-60. local-rule-as-note`: walked
  - `### AP-61. factor-repeated-paths`: walked
  - `### AP-62. bind-protocol-locals`: walked. The routine declares `activity_entered` as an internal, and every technique that reads it declares it as an input.
  - `### AP-63. backtick-code-tokens`: walked. A script checked every added prose line, and each designator and engine token sits in a code span.
  - `### AP-64. boolean-id-shape`: walked
  - `### AP-65. collection-id-shape`: walked
  - `### AP-66. io-id-shape`: walked
  - `### AP-67. rule-slug-shape`: walked. #991 adds no rule slug.
  - `### AP-68. technique-stage-agnostic`: walked. The engine carve-out applies: the subject of the workflow-engine and fan techniques is the walk itself, as in the earlier walks.
  - `### AP-69. no-activity-prose-rules`: walked. No activity YAML on the surface carries `rules:`.
  - `### AP-70. capability-group-placement`: walked. The new specimen holds no techniques.

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| A1 | Live | Medium | AP-11 `decision-not-prose` | `meta/activities/03-dispatch-client-workflow.yaml:41-43` (`exits`), `:49` (`outcome`); `meta/workflow.yaml:140-141` (graph); consumer `meta/activities/04-end-workflow.yaml:75`; mechanism `meta/techniques/workflow-engine/evaluate-transition.md:112-114` | The outcome promises "close-out can tell a completed run from one that stopped at the iteration bound". 04 gates `revise-session-metrics` on `client_workflow_completed == true`, so it expects to be entered with the flag false. But 03 declares one exit, `"null"` with `when: current_activity == null`, and no default. A loop stopped at `maxIterations: 200` therefore selects no exit, and no exit reaches `end-workflow`. #991's phase 5 now turns that no-exit path into `__terminal__`. So the meta session completes and skips close-out, while the client session stays `active`. The path the outcome describes exists only in prose. | pre-existing (the exit and outcome are unchanged from `03dfd4e2`; #991 changed the path's effect from the walk stopping to the meta session completing) | Declare the bound-stopped outcome as an exit: make the exit to `end-workflow` the `isDefault`, or add a default exit bound to `end-workflow`. Bind it in the meta `graph`. |
| A2 | Hygiene | Low | AP-26 `no-rationale-in-description` | `meta/techniques/workflow-engine/dispatch-activity.md:56`; `meta/techniques/workflow-engine/take-activity.md:37` (phase 2 and phase 1 notes) | "When `{activity_entered}` is true, skip this phase: the advance that entered `{activity_id}` carried the exit, step manifest and bag writes of what it retired, so this dispatch passes none." With the clause after the colon deleted, the instruction ("skip this phase") still says what is constrained. | diff | Delete the clause after "skip this phase" in both techniques. |
| A3 | Hygiene | Low | AP-26 `no-rationale-in-description` | `meta/techniques/fan/enter-fan.md:60` (phase 2 note) | "> The fan reads its collection from the bag this call's `variables_changed` lands in, so a collection the retiring activity wrote reaches the fan on this same call." The note explains why the call carries `variables_changed`, which the signature on line 59 already names. Deleting it loses no instruction. | diff | Delete the note, or keep one clause that states the reader's obligation, if one is wanted. |
| A4 | Hygiene | Low | AP-26 `no-rationale-in-description` | `meta/routines/activity-loop.yaml:41` (internal `activity_entered`, `description`) | "True from the last branch retirement of a fan, which entered the convergence activity, until that activity's entry." This restates the two `set` actions: `advance-past-fan` sets true (`:171-173`), and `spend-entered-activity` sets false (`:94-101`). The YAML comments at `:98` and `:170` say the same. | diff | Keep the first sentence, which says what the value is. Delete the lifecycle sentence. |
| A5 | Hygiene | Low | AP-26 `no-rationale-in-description` | `workflow-design/activities/01-intake-and-context.yaml:119` (option `wrong-review-target`, `description`) | "Rejects the review target set, and intake runs again to establish it from the request." The second clause restates `effect.exit: retarget` (`:124`) and the graph binding `retarget: intake-and-context` (`workflow.yaml:47`). | diff | Keep "Rejects the review target set" and drop the routing clause. `no-next-step-narration` is the sibling entry for the same clause. |
| A6 | Hygiene | Low | AP-59 `constraint-as-blockquote` | `meta/techniques/fan/retire-branch.md:32` (phase 1 bullet) | "…taking from that entry `exit` as its `activity_exit`, omitted where unset, `step_manifest` as its `steps_completed`…". The fallback "omitted where unset" is a caveat on one field, written as a *where* clause inside the step sentence. | diff | Move it to a `>` note under the bullet, for example "> Omit `exit` where the entry's `activity_exit` is unset." |
| A7 | Hygiene | Low | AP-04 `no-invented-naming` | `meta/routines/activity-loop.yaml:40`; `meta/techniques/workflow-engine/dispatch-activity.md:16`; `meta/techniques/workflow-engine/take-activity.md:16` (`activity_entered`) | The new boolean takes the name of an engine history event type, `activity_entered` (`state.schema.ts:6`, pushed at `workflow-tools.ts:1506/1521/1534`). A surface file already cites that event: "Wall-clock from durable `activity_dispatched`/`activity_entered` to `activity_exited`" (`revise-session-metrics.md:142`). So one token now names two things, an event and a flag. | diff | Rename the flag to a predicate that no engine event carries, for example `destination_already_entered`. Rename it in the routine internal, both inputs, and the bind at `activity-loop.yaml:92`. |

No High was raised, so none was withdrawn or downgraded. A1 was re-derived from the file and the entry alone:
- 03 has one exit, which carries a `when` and is not the default.
- The outcome at `:49` names a close-out on the bound-stopped path, and no exit declares that path.
- The same text is present at `03dfd4e2`.

It stays Medium: it fires only at the iteration bound, and it stays within the meta pair.

Noted outside slice A, for the owning slices (not findings here):
- **04 `return` option.** It re-walks a client session the engine already reads `completed`: `status` is written only at `workflow-tools.ts:1542` and never reset. The option also sets `client_workflow_completed: false`, against the variable's new description ("ended on the advance onto `__terminal__`").
- **evaluate-transition, phase 5.** The phase and the `next_activity_id` output cover "declares none", but not an activity that declares exits and selects none. That gap is A1's mechanism.
- **prism-audit and prism-evaluate 02.** These run `activity-loop` once per scope inside a `forEach`. `from_activity` and `worker_result` persist from the previous child into the next child's first entry, which contradicts the take-activity note "A first entry has no prior activity to retire, so … all unset together" (pre-existing).
- **exitless-end specimen.** It omits `techniques.activity: [variable-binding]`, which every sibling specimen carries (convention slice).
- **enter-fan `from_activity`.** Its text still reads "the one its exit and step manifest belong to", while dispatch-activity, continue-batch and take-activity now add `{variables_changed}`.
- **schema-construct-inventory, "After X, go to Y, or this activity can end the run".** It names only the `__terminal__` binding, while `exitless-end` now presents the exitless form as a shape to copy.
- **01 `wrong-review-target` writes.** Its `setVariable` writes are overwritten on re-entry, because `intake-classification` recomputes `intent_needs_confirmation` (`intake-classification.md:76`).
- **PR live-walk table.** It has no row for the two workflow-design options, and it evidences the barrier `destination` only through #978's e2e test. The issue's last "Done when" item is therefore partly evidenced. This is Hygiene while the PR says `Refs` rather than closing the issue.

Scope note: the closure `workflow.yaml` files were walked for the #991 contract, meaning terminal and exitless routing. Unrelated pre-existing hygiene in them was not itemised. Examples are the `rules.workflow` buckets of `substrate-node-security-audit` and `midnight-system-review`, and the sequence in the `midnight-system-review` description.

## Files

Touched (27):
- read — corpus/meta/README.md
- read — corpus/meta/activities/03-dispatch-client-workflow.yaml
- read — corpus/meta/activities/04-end-workflow.yaml
- read — corpus/meta/activities/README.md
- read — corpus/meta/routines/activity-loop.yaml
- read — corpus/meta/techniques/fan/enter-fan.md
- read — corpus/meta/techniques/fan/retire-branch.md
- read — corpus/meta/techniques/fan/spawn-branches.md
- read — corpus/meta/techniques/workflow-engine/TECHNIQUE.md
- read — corpus/meta/techniques/workflow-engine/continue-batch.md
- read — corpus/meta/techniques/workflow-engine/dispatch-activity.md
- read — corpus/meta/techniques/workflow-engine/evaluate-transition.md
- read — corpus/meta/techniques/workflow-engine/take-activity.md
- read — corpus/prism-audit/activities/02-execute-analysis.yaml
- read — corpus/prism-evaluate/activities/02-execute-analysis.yaml
- read — corpus/specimens/README.md
- read — corpus/specimens/exitless-end/README.md
- read — corpus/specimens/exitless-end/activities/01-open.yaml
- read — corpus/specimens/exitless-end/activities/02-close.yaml
- read — corpus/specimens/exitless-end/workflow.yaml
- read — corpus/work-package/activities/10-post-impl-review.yaml
- read — corpus/workflow-design/activities/01-intake-and-context.yaml
- read — corpus/workflow-design/activities/06-scope-and-draft.yaml
- read — corpus/workflow-design/activities/README.md
- read — corpus/workflow-design/workflow.yaml
- read — walks/roster.json
- read (diff hunks only; generated walk baseline of 3945 lines, which no unit in this slice reaches) — walks/snapshot.test.ts.snap

Closure (57):
- read — corpus/canon/resources/anti-patterns.md
- read — corpus/canon/resources/schema-construct-inventory.md
- read — corpus/meta/techniques/workflow-engine/finalize-activity.md
- read — corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md
- read — corpus/meta/techniques/workflow-engine/revise-session-metrics.md
- read — corpus/meta/techniques/workflow-engine/yield-checkpoint.md
- read — corpus/meta/workflow.yaml
- read — corpus/midnight-system-review/workflow.yaml
- read — corpus/plain-language/workflow.yaml
- read — corpus/ponytail/workflow.yaml
- read — corpus/prism-evaluate/activities/README.md
- read — corpus/prism-evaluate/workflow.yaml
- read — corpus/prism-update/workflow.yaml
- read — corpus/remediate-vuln/workflow.yaml
- read — corpus/requirements-refinement/workflow.yaml
- read — corpus/specimens/contract-composition/workflow.yaml
- read — corpus/specimens/fan-conformance/README.md
- read — corpus/specimens/fan-conformance/workflow.yaml
- read — corpus/specimens/git-pin-conformance/workflow.yaml
- read — corpus/specimens/github-library-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-api-change-gate-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-api-surface-review-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-area-comprehension-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-change-risk-assessment-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-diff-coverage-map-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-diff-taint-pass-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-doc-heading-lookup-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-doc-reference-surface-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-graph-for-tree-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-group-concept-search-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-group-refresh-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-guarded-rename-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-index-refresh-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-layer-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-narrow-to-changed-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-orphan-scan-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-package-diagram-source-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-pre-edit-impact-gate-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-public-api-enum-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-radius-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-restructure-surface-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-scope-discipline-check-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-sequence-diagram-source-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-symptom-trace-conformance/workflow.yaml
- read — corpus/specimens/gitnexus-tool-surface-conformance/workflow.yaml
- read — corpus/specimens/mvw/workflow.yaml
- read — corpus/specimens/namespace-conformance/workflow.yaml
- read — corpus/specimens/readme-links-conformance/workflow.yaml
- read — corpus/specimens/routine-conformance/workflow.yaml
- read — corpus/substrate-node-security-audit/workflow.yaml
- read — corpus/work-package/resources/workflow-retrospective.md
- read — corpus/work-package/workflow.yaml
- read — corpus/workflow-authoring/activities/01-intake-and-context.yaml
- read — corpus/workflow-authoring/techniques/impact-analysis.md
- read — corpus/workflow-authoring/workflow.yaml
- read — corpus/workflow-design/resources/format-conventions.md
- read — corpus/workflow-design/techniques/impact-analysis.md

Reference siblings also read: `specimens/mvw/README.md`, `meta/routines/dispatch-round.yaml` (head), `meta/techniques/fan/TECHNIQUE.md`, `workflow-design/techniques/intake-classification.md` (grep).
