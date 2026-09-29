# Walk 3 A — Design Principles 1–24 (+ overview), residuals branch

Home: `corpus/canon/resources/design-principles.md` on the residuals worktree (head bcf31337, base 166718d6). The overview was applied as written: each heading is one invariant, and specific instances belong to the anti-pattern catalog. The branch edits principle 9 only ("… or an exit `when`"); it still states one invariant.

Surface: all 88 paths in `res-surface.txt` read whole. Every touched file was diffed against 166718d6 (`git diff 166718d6..HEAD`). Engine claims were settled on the schema-description-hygiene worktree:
- `src/loaders/technique-loader.ts:529-603`: container Inputs compose into every leaf as `inherited_inputs`.
- `src/tools/workflow-tools.ts`: resume_checkpoint `:2636-2687`, present_checkpoint `:2689-2760`, respond_checkpoint `:2763+`, get_workflow_status `:3004`, and next_activity's `exit` param `:1232`.

Off-surface files read as consumers or twins:
- `work-package/techniques/manage-artifacts/write-artifact.md`
- `workflow-authoring/activities/01-intake-and-context.yaml`
- the workflow-design techniques that still persist their own reports: audit-principles, audit-anti-patterns, verify-high-findings, assemble-file-approach, review-drafted-file, review-draft-yaml (Outputs and persist phases)

Status of earlier slice-A findings:
- **Resolved:** A1–A12 and W2-A1, W2-A2, W2-A3, W2-A6, W2-A7, W2-A9, W2-A10, W2-A11.
- **Still firing:** W2-A4 (W3-A20) and W2-A5 (W3-A21).
- **Not on this surface:** W2-A8.

## Units

- `Overview` — walked
- `## 1. Workflows Ossify Patterns` — walked
- `## 2. Internalize Before Producing` — walked (session conduct; nothing on the surface prescribes it or breaks it)
- `## 3. Define Complete Scope Before Execution` — walked (applied to the branch's stated scope in its commit bodies)
- `## 4. Clarify Before Assuming` — walked (session conduct; nothing on the surface bears on it)
- `## 5. Maximize Schema Expressiveness` — walked (I did not record sequence-shaped activity descriptions. Walk 2 treated that form as sibling convention)
- `## 6. One Authoritative Home` — walked
- `## 7. Convention Over Invention` — walked. These match their siblings: the container `## Inputs` heading, the new rule slugs, the `written_artifact:` output binds, and the `revise` immediate exit, which matches `refine` and `redraft`.
- `## 8. Confirm Before Irreversible Changes` — walked (session conduct; nothing on the surface bears on it)
- `## 9. Encode Constraints as Structure` — walked. The format-conventions mode gate moved from a resource rule to the step's `when`, which is structure. Its conflict with the technique is recorded as W3-A2.
- `## 10. Non-Destructive Updates` — walked. The commit bodies name the removed rules, diagrams, tables and `*_path` outputs.
- `## 11. Complete Documentation Structure` — walked
- `## 12. Output Economy` — walked
- `## 13. Separate Contract from Procedure` — walked
- `## 14. Single Source of Truth` — walked
- `## 15. Phase by Sequenced Outcome` — walked
- `## 16. Distinguish Designators from Parameters` — walked
- `## 17. Document in Positive Present` — walked. AP-41 decided the spellings. Contrastive value phrasing ("rather than a guess", "instead of a one-size-fits-all prompt") was not recorded.
- `## 18. Prefer Shared Capability` — walked
- `## 19. Name Symbols Affirmatively` — walked. `checkpoint_reply`, `variable_bag` and `branch_activities` pass.
- `## 20. Keep Orchestration in Structure` — walked
- `## 21. Match the Harness Surface` — walked. These match the handlers:
  - the present_checkpoint `consequence` fields (`exit`, `next_activity`, `ends_activity`)
  - resume_checkpoint returning `option_id`, `variables_changed` and `exit`
  - respond_checkpoint returning `resolved_option`, `effect` and `dismissed`
  - get_workflow_status `completed`
  - next_activity `exit` as optional
- `## 22. Modular Over Inline` — walked
- `## 23. Close the Loop` — walked (session conduct; nothing on the surface bears on it)
- `## 24. Keep Session Interaction in Activities` — walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| W3-A1 | Live | High | 14. Single Source of Truth | `meta/techniques/workflow-engine/TECHNIQUE.md:24-26` Input `checkpoint_reply`; `meta/routines/activity-loop.yaml:165-172` (`respond-yielded-checkpoint`, no `outputs`); `compose-prompt.md:39`; `activity-worker.md:36` | The container makes `checkpoint_reply` an inherited input of every workflow-engine technique, including the step-bound `dispatch-activity`, `continue-batch` and `take-activity`. Its presence "is what distinguishes [a continuation] from a first dispatch". respond-checkpoint's output lands in the routine bag under that id, and nothing in the routine clears it. `variable-binding.md:14,21` binds a composed (ancestor-merged) input by same name from the bag. So once one gate has been answered, every later `enter-activity` or `continue-batched-worker` step binds a stale reply. compose-prompt:39 then instructs `resume_checkpoint` first and carries the reply, and activity-worker:36 takes resume-from-checkpoint "in place of opening at the first step" on an activity that yielded nothing. At base, the reply (`effects`) was declared only on the continuation techniques and passed explicitly by resume-worker. | diff (26430409) | Keep the reply off the container: declare it on resume-worker, compose-prompt and activity-worker only, or clear `checkpoint_reply` in the routine after `resume-yielded-worker`. |
| W3-A2 | Live | High | 6. One Authoritative Home | `workflow-design/activities/01-intake-and-context.yaml:190-198` `persist-format-conventions` (`artifact_content: format_conventions`, new `when: operation_type != 'review'`) and `:199-207` `persist-applicable-constructs`; `workflow-design/techniques/context-loading.md:12-34`, `:58-66` | No definition produces `format_conventions` or `applicable_constructs` (grep: the write steps are the only hits). context-loading outputs only the `*_path` values and persists both files itself, create mode only ("Skip when `{operation_type}` is `update` or `review`"). So the persist duty and its mode gate have two homes that disagree. The added `when` runs the format-conventions write on update runs, where nothing produces the content. On create runs, write-artifact's find-or-update rewrites the file the technique just wrote with an unproduced value. This is the defect class eca54b7f fixed for `impact_analysis`. | diff (the `when`); pre-existing (the missing producer) | context-loading outputs the `format_conventions` and `applicable_constructs` content and drops its persist phases and `*_path` outputs. Each step binds `written_artifact` to the path variable, under one mode gate. |
| W3-A3 | Live | Medium | 6. One Authoritative Home | `workflow-design/activities/03-requirements-refinement.yaml:117-124` `persist-design-specification-artifact`; `workflow-design/techniques/persist-design-specification.md:18-20`, `:38-41` | The step writes `artifact_content: design_specification`, which nothing produces. The bound technique outputs only `specification_path` and persists the file itself ("Persist it … Capture the written location as `{specification_path}`"). Same class as W3-A2. | pre-existing | Output the specification content, drop the technique's persist phase, and bind `written_artifact: specification_path` on the step. |
| W3-A4 | Contract | Medium | 6. One Authoritative Home | `workflow-design/techniques/intake-classification.md:83-90` with `01-intake-and-context.yaml:136-144`. Off surface: `audit-principles.md:40-42`, `audit-anti-patterns.md:44-46`, `verify-high-findings.md:43-45`, `assemble-file-approach.md:54-56`, `review-drafted-file.md:49-51`, `review-draft-yaml.md:49-51`, against `08-quality-review.yaml:121-152, 274-282` and `06-scope-and-draft.yaml:177-184, 221-228, 308-315` | Commit b89a58f2 states that "the activity's write-artifact step saves [each report] and binds the written path". Each of these techniques still persists its report and outputs a `*_path`, and its activity also writes the same content through write-artifact. So each report has two writers. The branch moved four techniques only: impact-analysis, pattern-analysis, scope-definition and audit-rule-enforcement. | pre-existing | Finish the move: each technique outputs its content only, and the step owns the write and the path. |
| W3-A5 | Contract | Low | 3. Define Complete Scope Before Execution | `workflow-design/activities/08-quality-review.yaml:322-324` (`re-audit-rule-enforcement` in `audit-fix-cycle`) | audit-rule-enforcement no longer persists its findings. The only write step (`persist-enforcement-findings`, `:247-257`) sits before the fix cycle. After a fix round, `enforcement-findings.md` holds the pre-fix set, while the three sibling re-audits still rewrite their own satellites. | diff (b89a58f2) | Add the write step after the re-audit inside the loop, or record that the satellite reflects the first pass. |
| W3-A6 | Contract | Medium | 13. Separate Contract from Procedure | `workflow-design/techniques/scope-definition.md:26-28`, `:65-67`; `06-scope-and-draft.yaml:88-90`, `:161-166`; `workflow.yaml:36-38` | The Output `scope_manifest` now "Carries the structural design and drafting order sections alongside the table". Phase 6 folds them in "at the shape [scope-manifest] declares", which is a Markdown document. The bag types the same variable `array` ("List of files…"), and `file-drafting-loop` iterates `over: scope_manifest` reading `current_file.type`. The stated shape contradicts the loop that consumes it. The workflow-authoring twin carries the same overload (`scope-definition.md:28`, `06:43-45, 131`). | diff (b89a58f2); twin pre-existing | Keep `scope_manifest` as the file array and emit the rendered report as a value of its own for write-artifact, in both twins. |
| W3-A7 | Contract | Medium | 6. One Authoritative Home | `meta/techniques/variable-binding.md:41-43` `binding-carries-only-deviations`; `workflow-authoring/techniques/workflow-definition/yaml-authoring.md:71-81` (three new rules); `workflow-authoring/workflow.yaml:15-17` | variable-binding still says "the structured `step.technique` object carries what differs from the defaults; the bare-string form … carries no deviation". yaml-authoring now states the same standard, and workflow-authoring delivers both to the drafting worker (`techniques.activity: variable-binding`). Meanwhile `generic-not-overfit` and the qualification clause left variable-binding. The workflow-design drafting worker receives variable-binding and its own `yaml-authoring.md`, and neither carries them now. | diff (26430409, b89a58f2) | variable-binding states only how a binding is read. The authoring standard has one statement per drafting delivery, including the workflow-design twin if it keeps drafting. |
| W3-A8 | Contract | Low | 6. One Authoritative Home | `prism-audit/techniques/README.md:69-72` (closure) | "those steps reference techniques two ways (see the meta `activity-group-shorthand` rule)". The second way, "Qualified `group::op` where a step reaches a technique whose group is not the activity's own", has left that rule (`variable-binding.md:61-63`). It now lives in workflow-authoring's `a-foreign-technique-is-qualified`. | diff (26430409) | Cite the rule that holds the qualification, or state it without the citation. |
| W3-A9 | Contract | Low | 6. One Authoritative Home | `work-package/README.md:33`; `workflow-design/README.md:110`, `:117` | Descriptions that no longer hold after the branch's changes: <br>• "per-activity orientation (purpose, role, and a flow diagram)", although bcf31337 removed every diagram from `activities/README.md`. <br>• pattern-analysis "…and persist the comparison", although the technique no longer persists. <br>• context-loading "persist … in create mode", although 01's step now writes on create and update. | diff | Rewrite each description to match what the construct now does. |
| W3-A10 | Hygiene | Low | 6. One Authoritative Home | `meta/techniques/workflow-engine/commit-and-persist.md:50` rule `commit-after-activity` | The rule now says changes are "pushed before the exit to the next activity is evaluated". The worker evaluates the exit in finalize-activity (evaluate-transition) before the envelope returns, and `commit-activity-artifacts` runs after it (`activity-loop.yaml:184-190`). The invariant that holds is `continue-batch.md:43`: "This call [`next_activity`] is the transition a commit has to precede". So the two statements disagree. | diff (bcf31337 rewording) | State it as "before the next `next_activity` advance", or cite continue-batch's note. |
| W3-A11 | Contract | Low | 13. Separate Contract from Procedure | `meta/techniques/workflow-engine/finalize-activity.md:64` (`#### next_activity_id`), `:72`, `:86` | The Output says `next_activity_id` is "null when the workflow is complete". evaluate-transition (`:28`) copies `__terminal__` unread for an ending exit and gives null only for an exitless activity, and `:86` now passes it "on unread". `:86` also says "Do not omit these fields: every successful envelope carries them", while `:72` makes `activity_exit` "unset where it declares none". | diff (`:72`, `:86`); pre-existing (the null clause) | State the destination values evaluate-transition gives, and exempt an unset `activity_exit` from the carry-all clause. |
| W3-A12 | Hygiene | Low | 13. Separate Contract from Procedure | `meta/techniques/workflow-engine/TECHNIQUE.md:18` (`activity_id`), `:26` (`checkpoint_reply`) | `activity_id` is now optional for every leaf and admits commit-and-persist's list case ("the branches it retired"). dispatch-activity, continue-batch and take-activity each need one id, and at base they declared it as required. `checkpoint_reply` is "the reply … on clearing a checkpoint this context yielded", which is untrue for its orchestrator-side readers (resume-worker, compose-prompt). respond-checkpoint inherits it as an input while producing the same id as its output. | diff (26430409) | State each hoisted Input so it holds for every inheritor, or keep the single-id, required form on the leaves that need it. |
| W3-A13 | Hygiene | Low | 21. Match the Harness Surface | `workflow-design/techniques/yaml-authoring.md:34` (and `:14`, `:38`) | "Read `schemas/{schema_type}.schema.json`" names a repository path. Agents reach the schemas at `workflow-server://schemas`, as `context-loading.md:40`, `schema-construct-inventory.md:15` and the twin `workflow-authoring/…/yaml-authoring.md:42` say. | diff (`:34`); pre-existing (`:14`, `:38`) | Read the kind's schema from `workflow-server://schemas`. |
| W3-A14 | Hygiene | Low | 16. Distinguish Designators from Parameters | `meta/techniques/workflow-engine/yield-checkpoint.md:25` | "Call `yield_checkpoint { session_index, checkpoint_id }` with `{$checkpoint_id}`". The local is declared at `:24`, and a read carries no `$`. | diff (26430409) | Read it as `{checkpoint_id}`. |
| W3-A15 | Contract | Medium | 14. Single Source of Truth | `workflow-design/activities/05-impact-analysis.yaml:66-70`, `:80-81`; `workflow.yaml:55`; `techniques/impact-analysis.md:10-18` | The `revise-impact` option now re-enters impact-analysis, but it sets nothing. The technique reads only `accumulated_design` and `structural_inventory`, so the reviewer's correction has no variable and the re-run recomputes the same report. The sibling loops `refine` and `redraft` share the route form, but this one is new. | diff (eca54b7f) | Land the correction in a variable the technique reads, as `present-checkpoint-to-user.a-correction-lands-in-the-bag` requires, or route `revise` to where the change specification is edited. |
| W3-A16 | Hygiene | Low | 5. Maximize Schema Expressiveness | `workflow-design/activities/04-pattern-analysis.yaml:14` `pattern_adoption.description` | "`none` while no pattern analysis has run, which is the whole of the update path — that route reaches drafting through impact analysis and never visits this activity" restates graph routing. The branch removed the same clause from 05's `preservation_required`. | pre-existing | "How far drafting adopts the extracted patterns; `none` where no pattern analysis ran." |
| W3-A17 | Hygiene | Low | 20. Keep Orchestration in Structure | `workflow-design/techniques/reconcile-design-assumptions.md:60`, `:74`; `synthesize-update-specification.md:32` (closure) | "durable evidence for Gate 2 batch disposition"; "Quality-review audit steps remain activity-bound elsewhere"; "ready for persist and batch confirmation". Each technique names the gate or stage that consumes its output. | pre-existing | State what the value is, and drop the consumer. |
| W3-A18 | Hygiene | Low | 24. Keep Session Interaction in Activities | `workflow-design/resources/impact-analysis.md:76-78`; `workflow-authoring/resources/impact-analysis.md:78-80` | The template's "Decision ask" section ("Confirm impact scope and intentional removals — or revise / preserve") restates the checkpoint's options inside the artifact. | pre-existing | Drop the section; the checkpoint owns the ask. |
| W3-A19 | Hygiene | Low | 17. Document in Positive Present | `workflow-design/README.md:8-10`; `substrate-node-security-audit/README.md:28`, `:228` | "The defects the replacement exists to fix are still present in this tree and are not being repaired", although this branch repairs several (the revise exit, the report saves). Also "(now) the `gitnexus` capability" and "so benign-looking helpers can no longer be skimmed past" in a touched file. | pre-existing (the claim is falsified by this branch) | State what the workflow is, without the repair status or the history. |
| W3-A20 | Hygiene | Low | 6. One Authoritative Home | `resume-from-checkpoint.md:31`, `yield-checkpoint.md:32`, `activity-worker.md:49` | Both leaves still say "run none of the remaining steps, and finalize the activity with the steps you ran and `{selected_exit}`". activity-worker phase 5 owns the finalize, so the finalize cadence has three statements in one worker delivery. | known — W2-A4, not fixed | Leaves state that the activity ended at this gate and hold `{selected_exit}`; the finalize stays in activity-worker. |
| W3-A21 | Hygiene | Low | 6. One Authoritative Home | `substrate-node-security-audit/README.md:220`; `substrate-node-security-audit/activities/README.md:5` | Both READMEs still state that the sub-agent activities "do not appear in the [workflow] graph". The branch aligned the wording and left two copies. | known — W2-A5, not fixed | State it in one README and link it from the other. |
| W3-A22 | Hygiene | Low | 6. One Authoritative Home | `canon/resources/schema-construct-inventory.md:215, 221, 227, 233, 239` | Five "Fields: `schemas/routine.schema.json`." lines sit under a section whose intro (`:203`) and heading already name that schema. 837aebd7 dropped every other Fields pointer on that ground. | pre-existing (left by 837aebd7) | Drop the five lines. |
| W3-A23 | Hygiene | Low | 6. One Authoritative Home | `work-packages/README.md:55-180` | The per-activity mermaid diagrams restate each activity's steps and checkpoints (`s1`, `cp1`, …). bcf31337 removed this form from the work-package and fan-conformance activity READMEs, and touched this file only for backticks. | pre-existing | Keep each activity's role and definition link, and leave steps to the YAML. |

**Verification of Highs:**
- W3-A1, confirmed. I re-derived it from the files alone:
  - The container declares `checkpoint_reply` (TECHNIQUE.md:24-26).
  - The engine merges container Inputs into every leaf (technique-loader.ts:570-600).
  - respond-checkpoint's output lands unmapped (activity-loop.yaml:165-172), and no step clears it.
  - variable-binding binds same-name from the bag (:21).
  - compose-prompt:39 and activity-worker:36 key the continuation on the value being bound.
  - The chain holds for continue-batch, which applies compose-prompt with the substitutions that carry the reply.
- W3-A2, confirmed:
  - grep finds no producer of `format_conventions` or `applicable_constructs` in the corpus.
  - context-loading.md:60-61 gates its own write to create.
  - The diff adds `when: operation_type != 'review'` to the write step.
- W3-A6, downgraded from High to Medium. The contradiction is in the definitions, but whether the loop breaks depends on how a worker shapes the value, and the authoring twin carries the same shape.

**Spot-confirmed Mediums:**
- W3-A3: grep for `design_specification` gives the single hit.
- W3-A4: the persist phases were read in each technique listed.
- W3-A7: `workflow.yaml:15-17` delivers variable-binding.
- W3-A15: the technique Inputs were read.

**Considered and not recorded:**
- The routine binds same-name values (`checkpoint_reply: checkpoint_reply`, `branch_activities: branch_activities`). This belongs to the binding-deviations entry, not this slice.
- `prism-audit/README.md:112` "manages transitions" is F5 (AP-129), still firing, and belongs to slice F.
- `enter-fan.md:46` links `./sync-progress-status.md`, which does not exist in `fan/`. This is pre-existing and belongs to the link entries.
- Ledger `unserved-operation-ref-triage.json`: many sites in the touched engine techniques no longer hold their op on the cited line. Most offsets predate this branch, and the guard passes, so it is left to the guard's stale report.
- `structural_inventory` is read by `05-impact-analysis` through the technique without a `variables.reads` entry. This is the variable-contract entry's domain, and the same pre-existing gap exists in 03.
- A terminal exit yields `next_activity_id: "__terminal__"`, which `activity-loop`'s `current_activity != null` test never ends on. This is pre-existing and outside principles 1–24, apart from W3-A11.

## Files

- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/canon/resources/design-principles.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/canon/resources/schema-construct-inventory.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/codebase-wiki/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/codebase-wiki/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/activities/03-dispatch-client-workflow.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/activities/04-end-workflow.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/activities/patterns/02-supervisor.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/activities/patterns/03-plan-and-execute.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/activities/patterns/05-lead-researcher.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/activities/patterns/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/resources/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/resources/workflow-canonical.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/routines/activity-loop.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/agent-conduct.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/fan/enter-fan.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/fan/spawn-branches.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/variable-binding.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/TECHNIQUE.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/activity-worker.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/commit-and-persist.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/compose-prompt.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/continue-batch.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/dispatch-activity.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/evaluate-transition.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/finalize-activity.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/present-checkpoint-to-user.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/respond-checkpoint.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/resume-worker.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/sync-progress-status.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/take-activity.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/workflow-orchestrator.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/yield-checkpoint.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/midnight-system-review/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/ponytail/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-audit/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-update/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/specimens/fan-conformance/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/specimens/git-pin-conformance/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/specimens/routine-conformance/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/substrate-node-security-audit/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/substrate-node-security-audit/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-package/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-package/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-packages/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/resources/impact-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/resources/scope-manifest.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/scope-definition.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/yaml-authoring.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/01-intake-and-context.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/03-requirements-refinement.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/04-pattern-analysis.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/05-impact-analysis.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/06-scope-and-draft.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/08-quality-review.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/resources/design-assumptions.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/resources/format-conventions.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/resources/impact-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/resources/scope-manifest.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/TECHNIQUE.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/audit-rule-enforcement.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/context-loading.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/impact-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/pattern-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/reconcile-design-assumptions.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/scope-definition.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/yaml-authoring.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/workflow.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/ledgers/unserved-operation-ref-triage.json (all 355 entries checked against their sites by script)
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/workflow.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-audit/activities/02-execute-analysis.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-audit/techniques/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-evaluate/activities/02-execute-analysis.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-evaluate/techniques/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-package/activities/10-post-impl-review.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/activities/06-scope-and-draft.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/activities/09-validate-and-commit.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/intake-classification.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/synthesize-change-brief.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/09-validate-and-commit.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/capture-dimension.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/intake-classification.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/persist-design-specification.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/synthesize-update-specification.md
