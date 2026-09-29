# Walk 3 C — anti-patterns.md: Overview, Creation Rules, Structural, Interaction, Schema Expressiveness, Rule Hygiene (residuals branch)

Home: `corpus/canon/resources/anti-patterns.md` on the residuals worktree (lines 1–373). Branch `workflow/canon-audit-residuals`, base `166718d6`, seven commits. Creation Rules applied to the branch's canon edits (design-principles.md principle 9; schema-construct-inventory.md, commits 837aebd7 and bcf31337) and, for Entry identity and Audit technique boundary, to every surface citation and audit technique. Scope manifest for AP-03 and AP-07: each commit body's item list. AP-01..AP-25 applied entry-major across the 88 surface files.

## Units

- Overview — walked (each entry applied as its Detect / Do not flag / Fix test)
- Smell not stance — walked (principle 9 stays a stance; the branch edits no catalogue entry)
- Entry identity — walked (C15). The inventory now cites entries as backticked kebab names with no number; `workflow-design/README.md:154` "(AP-XX + name)" describes the catalogue's format and cites no entry
- Audit technique boundary — walked (C14)
- Entry intro — not-applicable — "Two lines, then a blank line: a quoted exemplar, then one sentence naming the failure": the branch adds or edits no catalogue entry, and principle 9 and the inventory carry no exemplar
- Detect triad — not-applicable — "**Detect**, **Do not flag**, and **Fix**, each its own block": same reason
- Keep audit signals — walked (every entry name the inventory cited before 837aebd7/bcf31337 is still cited; principle 9's edit adds a mechanism and drops none)
- Resist over-fit — walked
- Succinctness — walked (C16)
- AP-01. no-inline-content — walked
- AP-02. schema-is-constraint — walked (no schema edit; the triage-ledger deletions close sites whose references the branch removed)
- AP-03. no-partial-implementation — walked (C1, C2). 26430409's items hold: no `{state}`, `branch_list`, `{effects}`, `state: variables` or `effects: effects` survives in corpus, src, schemas or docs; activity-worker Phase 5 passes finalize-activity's required inputs; yield-checkpoint chooses `{$checkpoint_id}`. 33134bdd and eca54b7f hold (C1 of the first pass is fixed: `revise-impact` selects the bound `revise` exit)
- AP-04. no-invented-naming — walked (`variable_bag` reuses the library's "variable bag" vocabulary; `branch_activities` is a collection plural; the three new yaml-authoring slugs follow the `a-…-is-…` form of `a-branch-lands-under-its-own-derived-key`, `a-correction-lands-in-the-bag`)
- AP-05. atomic-checkpoints — walked (`impact-and-preservation-confirmed` asks one question, whether the impact report stands; its three options are mutually exclusive answers)
- AP-06. no-assumption-execution — walked
- AP-07. scope-reverify-completion — walked (fires on C1 and C2's evidence; recorded once there)
- AP-08. one-question-per-message — walked (every surface checkpoint `message` is a statement)
- AP-09. checkpoint-not-prose — walked
- AP-10. loop-not-prose — walked (take-activity `no-session-left-running` "take its activities until…" is activity-loop's `while`; spawn-branches "for each entry" is per-item work inside one application: Do not flag)
- AP-11. decision-not-prose — walked (C3, C4). Checked and declared: 05 `revise-impact` → `revise` → impact-analysis; 03 `refine`; 06 `redraft`; 08 `fix-issues`; 09 `return-to-draft`, `correct-assumptions`; README routing in midnight-system-review (`revise-investigation`, `publish-requested`), prism-update (`has-issues`), ponytail (`repo-wide`), codebase-wiki, work-packages
- AP-12. artifact-not-buried — walked (each report-producing surface technique carries `#### artifact`)
- AP-13. variable-for-approval — walked
- AP-14. mode-as-state — walked (`operation_type` is the one mode variable; synthesize-update-specification `update-mode-only` is backed by the step's `when`)
- AP-15. procedure-in-protocol — walked (no bound step carries `description`)
- AP-16. technique-inputs-declared — walked (C5, C6, C7, C8). First-pass C4/C5 and second-pass C2/C3 are fixed: workflow-design scope-definition declares `target_path`, `workflow_branch`, `workflow_id`; workflow-design impact-analysis declares `accumulated_design`, `structural_inventory`; finalize-activity declares `selected_exit`. The engine leaves read `session_index`, `activity_id`, `variable_bag`, `checkpoint_reply` from the container. compose-prompt's `{workflow_id}` is a key of the declared `{substitutions}`, not recorded
- AP-17. bound-step-no-description — walked
- AP-18. no-monolith-masking-steps — walked (06's three `yaml-authoring` steps, activity-loop's two `commit-and-persist` steps and 08's initial and re-audit passes differ by `when` or sit at distinct pipeline points: Do not flag)
- AP-19. no-rule-protocol-restatement — walked (C10, C11). First-pass C11/C12 are fixed: workflow-design impact-analysis carries no rules
- AP-20. rule-group-disambiguation — walked
- AP-21. grouped-rule-keys — walked (agent-conduct's `group-<specifier>` headings are the markdown grouped form)
- AP-22. single-rule-authority — walked (first-pass C10 / second-pass C4 are fixed: `outputs-mutate-state-only-via-sanctioned-path` is gone. workflow-orchestrator `orchestrator-worker-boundaries` and `resolve-trace-at-close-out` cite their homes and stop. The residual overlap between variable-binding and yaml-authoring is folded into C10)
- AP-23. worker-rule-reach — walked (C9)
- AP-24. no-contradictory-rules — walked
- AP-25. no-one-step-rules — walked (C12, C13). Second-pass C5/C6 are fixed: replay and invalid-option guidance are `>` notes. `auto-advance-spends-the-declared-interval` and `dispatch-mark-reaches-the-remote` each have a second consumer (present-checkpoint-to-user:60, fan/TECHNIQUE.md:18), so they are not one-step

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| C1 | Live | Medium | AP-03 no-partial-implementation | b89a58f2 body ("Techniques … output the report content; the activity's write-artifact step saves it and binds the written path"); workflow-design/activities/03-requirements-refinement.yaml:117–124; 01-intake-and-context.yaml:190–207; 06-scope-and-draft.yaml:177–184, 221–228, 308–315 | Unconverted in workflow-design. `persist-design-specification-artifact` writes `design_specification`, which nothing produces: persist-design-specification.md:38–41 still persists itself and outputs only `specification_path`. `persist-format-conventions` and `persist-applicable-constructs` write `format_conventions` and `applicable_constructs`, which nothing produces: context-loading.md:58–66 persists both itself, for create only, while the branch's new `when: operation_type != 'review'` (01:198) also runs the write on update. assemble-file-approach, review-drafted-file and review-draft-yaml still self-persist, and 06's write steps for them bind no written path. | diff (claim); constructs pre-existing | Complete the item: each technique outputs content only and its write-artifact step binds `written_artifact` to the `*_path` its gate links. Otherwise narrow the claim to what was converted. |
| C2 | Hygiene | Low | AP-03 no-partial-implementation | bcf31337 body ("Activity READMEs … leave steps, checkpoints and loops to the YAML (work-package, …, prism-update, …)"; "READMEs … state what holds"); prism-update/activities/README.md:12; work-package/activities/README.md:85, :117; work-package/README.md:33 | "Present the change set at a user checkpoint"; "applied in a bounded cycle that re-validates the safety floor each pass"; "Gates submission on a human DCO sign-off". The parent README still says activities/README.md carries "a flow diagram" for each activity, and the commit removed all of those diagrams. | diff | Remove the listed survivors and the stale pointer, or narrow the claim. |
| C3 | Live | Medium | AP-11 decision-not-prose | workflow-design/activities/06-scope-and-draft.yaml:148–150, checkpoint `scope-and-structure-confirmed`, option `revise` | "Needs revision — File manifest or implementation order requires adjustment" carries no `effect`. `scope_manifest_confirmed` stays false, so drafting and every quality-review audit (gated `scope_manifest_confirmed == true`) are skipped, and the default `done` exit carries an undrafted change toward commit. The `redraft` exit, bound back to scope-and-draft, exists, but no option of this checkpoint selects it. The workflow-authoring twin's `revise` selects its own exit. The branch fixed the same shape in 05. | pre-existing | Give `revise` `effect.exit: redraft`, or a `revise` exit bound in the `graph` to scope-and-draft. |
| C4 | Live | Medium | AP-11 decision-not-prose | workflow-design/activities/01-intake-and-context.yaml:121–127, checkpoint `design-intent-batch`, option `wrong-review-target` | "Rejects the review target set; supply a corrected `target_workflow_ids` list" names a re-collection path that no exit declares. Its effects set `review_scope_confirmed: false`. In review mode `auto-confirm-literacy` is skipped, so neither exit's `when` holds, and the `isDefault` `context-established` routes the review run to requirements-refinement. | pre-existing | Declare an exit for the re-collection, select it from the option, and bind it in the `graph` back to intake-and-context. |
| C5 | Live | Medium | AP-16 technique-inputs-declared | meta/techniques/workflow-engine/dispatch-activity.md:52–53 (Protocol 2); meta/techniques/fan/enter-fan.md:51 (Protocol 2) | Both call `next_activity { …, step_manifest }`, and dispatch-activity's note says the server "reports a gap when it is absent". Neither technique, nor the workflow-engine container, nor the meta root declares `step_manifest`. The siblings continue-batch and take-activity do declare it. activity-loop.yaml:77–97 binds none to `enter-activity` or `enter-fan`, so the manifest of the activity being retired never reaches either call. | pre-existing (both files touched) | Declare `step_manifest` on both, and bind `"{worker_result.steps_completed}"` at their activity-loop steps. |
| C6 | Contract | Medium | AP-16 technique-inputs-declared | workflow-design/techniques/context-loading.md:60–66 (Protocol 6, 7) | `{operation_type}` and `{planning_folder_path}` gate and target both persist phases. Neither is declared here or on workflow-design/techniques/TECHNIQUE.md, which declares `user_description`, `target_workflow_id` and `target_workflow_ids`. | pre-existing (file touched) | Declare both on `## Inputs` (or on the root contract). |
| C7 | Contract | Medium | AP-16 technique-inputs-declared | workflow-authoring/techniques/workflow-definition/scope-definition.md:50 (Protocol 2); intake-classification.md:77 (Protocol 3) | `{target_path}/{workflow_id}/` and `{target_path}` are read. Neither the technique nor the workflow-definition or root contracts declare them. This is the twin of first-pass C4, which the branch fixed in workflow-design by declaring the same three inputs. | pre-existing (scope-definition touched) | Declare `target_path` and `workflow_id` as the workflow-design twin does. |
| C8 | Hygiene | Low | AP-16 technique-inputs-declared | meta/techniques/workflow-engine/workflow-orchestrator.md:35 (Protocol 3 note) | "require `{readme_conformance}.conforms`" reads a value no Input declares. | pre-existing (file touched) | Declare `readme_conformance` as an optional input. |
| C9 | Contract | Medium | AP-23 worker-rule-reach | meta/techniques/variable-binding.md (`generic-not-overfit` deleted; `activity-group-shorthand`'s foreign-qualification sentence cut) → workflow-authoring/techniques/workflow-definition/yaml-authoring.md:75–81 only | Every worker applies variable-binding. The name-mismatch rule and the foreign-technique-is-qualified rule now live only on workflow-authoring's yaml-authoring. workflow-design's drafting worker binds workflow-design/techniques/yaml-authoring.md (06:212–217, 258–264, 298–304; 08:304–306), whose Rules carry neither, so that worker no longer receives them. | diff | Carry the rules on workflow-design's yaml-authoring too. A copy on each technique that must reach the worker is that reach. |
| C10 | Hygiene | Low | AP-19 no-rule-protocol-restatement | meta/techniques/variable-binding.md:41–43, rule `binding-carries-only-deviations` (rewritten by 26430409) | "An input absent from `inputs` binds by same name or by its declared `default`" restates Phase 2 precedence 3–4 (:21–22). "an output absent from `outputs` lands under its own id" restates Phase 4 (:32). The deviation forms repeat Phase 2's disambiguation bullet (:24). Its first clause, "the bare-string form … carries no deviation", is still a second home for yaml-authoring `a-step-binds-only-its-deviations`. | diff | Delete the rule and keep the three deviation-form examples in Phase 2's disambiguation bullet. Repoint `an-argument-position-sets-its-own-default` (:49) at that bullet. |
| C11 | Hygiene | Low | AP-19 no-rule-protocol-restatement | workflow-design/techniques/reconcile-design-assumptions.md:72–74, rule `no-sibling-audit-invoke` | "Do not Apply / `::`-invoke `audit-*` techniques" restates Phase 1's bullet (:39): "Do not Apply sibling `audit-*` techniques from this Protocol". It cites no home, only "elsewhere". | pre-existing (file touched) | Delete the rule; the phase carries it. |
| C12 | Hygiene | Low | AP-25 no-one-step-rules | meta/techniques/workflow-engine/respond-checkpoint.md:36–38, rule `verify-auto-advance-on-resolve` | Phase 1 (:26) exists only to apply this rule, and nothing else cites it. The branch moved this file's other one-step rule (`no-option-hallucination`) into a note and left this one. | pre-existing | Fold the check into Phase 1 and delete the rule. |
| C13 | Hygiene | Low | AP-25 no-one-step-rules | meta/techniques/workflow-engine/commit-and-persist.md:64–66, rule `session-files-ride-along` | The rule constrains Phase 4 alone, which (:35) already commits "`README.md`, `session.json` and `.session-token`". | pre-existing (file touched) | Move "same engineering commit, no separate `state` commit" into Phase 4 as a `>` caveat and delete the rule. |
| C14 | Contract | Medium | Audit technique boundary (Creation Rules) | workflow-design/techniques/audit-rule-enforcement.md:37–38 (Protocol 2) | "Walk every `rules[]` entry in `workflow.yaml` and activity files" with "> Walk technique `## Rules` too when the entry's scope implies it" restates Detect's site list, and narrows it. `structure-backed-constraints` Detect names "technique `## Rules`" unconditionally, so the audit may skip sites its criterion covers. | pre-existing (b89a58f2 reshaped the line into a note) | Delete the scope restatement and walk what Detect names. |
| C15 | Hygiene | Low | Entry identity (Creation Rules) | workflow-design/techniques/reconcile-design-assumptions.md:39 | `[pass-orchestration-in-technique](/canon/resources/anti-patterns.md#ap-114-pass-orchestration-in-technique)` cites the entry by its numbered anchor, with the name outside backticks. It is the only numbered-anchor citation left in the corpus, and b89a58f2 edited this line. | pre-existing | Cite `` `pass-orchestration-in-technique` `` in backticks, linking the catalogue or its `#technique-protocol` family. |
| C16 | Hygiene | Low | Succinctness (Creation Rules) | canon/resources/schema-construct-inventory.md:203, 215, 221, 227, 233, 239 | "The file shape is `schemas/routine.schema.json`" and five "Fields: `schemas/routine.schema.json`" lines repeat the section heading "(routine.schema.json)" and the :21 list. 837aebd7 made that heading-and-list the pointer for every section and removed the per-entry pointers elsewhere. | pre-existing | Delete the six sentences. |

No High was raised. C1 was weighed as High, because it fires on a claim the branch ships and its unmet items propagate as writes of unproduced values. It stays Medium: those write steps predate the branch, and the branch's share of the defect is the claim.

Considered and not recorded. These fall outside this slice's entries, and the caller may route them.
- **scope-definition.md:67 (workflow-design, diff).** It folds `{structural_design}` and `{drafting_order}`, but Protocol 4–5 bind `{$structural_design}` and `{$drafting_order}`. This is a local read under the wrong form (`bind-protocol-locals`).
- **activity-loop.yaml:77–86 (pre-existing, Live).** `enter-activity` binds no `exit_id` for dispatch-activity or take-activity. After a released batch, and at every advance of a take-activity walk (prism-audit 02, prism-evaluate 02, work-package 10), `next_activity` names `from_activity` with no `exit`, although the retired activity declares one. See `apply-omits-declared-input` / `call-omits-conditionally-required-argument`.
- **prism-audit/techniques/README.md:69 (diff-induced).** It cites "the meta `activity-group-shorthand` rule" for the qualified-reference form, which the branch cut from that rule (`cited-home-owns-claim`).
- **06 `over: scope_manifest`.** scope-definition now folds the manifest into the templated document it iterates over. workflow-authoring had this form before the branch, so it is the twin's form and not recorded here.
- **05 `revise` exit.** It re-enters impact-analysis with no new input for the revision to act on.
- **design-assumptions.md:19.** "structural (checkpoint / condition / validate)" omits the exit `when` that principle 9 now lists.

## Files

- corpus/canon/resources/design-principles.md — read
- corpus/canon/resources/schema-construct-inventory.md — read
- corpus/codebase-wiki/README.md — read
- corpus/codebase-wiki/activities/README.md — read
- corpus/meta/activities/03-dispatch-client-workflow.yaml — read
- corpus/meta/activities/04-end-workflow.yaml — read
- corpus/meta/activities/patterns/02-supervisor.yaml — read
- corpus/meta/activities/patterns/03-plan-and-execute.yaml — read
- corpus/meta/activities/patterns/05-lead-researcher.yaml — read
- corpus/meta/activities/patterns/README.md — read
- corpus/meta/resources/README.md — read
- corpus/meta/resources/workflow-canonical.md — read
- corpus/meta/routines/activity-loop.yaml — read
- corpus/meta/techniques/agent-conduct.md — read
- corpus/meta/techniques/fan/enter-fan.md — read
- corpus/meta/techniques/fan/spawn-branches.md — read
- corpus/meta/techniques/variable-binding.md — read
- corpus/meta/techniques/workflow-engine/TECHNIQUE.md — read
- corpus/meta/techniques/workflow-engine/activity-worker.md — read
- corpus/meta/techniques/workflow-engine/commit-and-persist.md — read
- corpus/meta/techniques/workflow-engine/compose-prompt.md — read
- corpus/meta/techniques/workflow-engine/continue-batch.md — read
- corpus/meta/techniques/workflow-engine/dispatch-activity.md — read
- corpus/meta/techniques/workflow-engine/evaluate-transition.md — read
- corpus/meta/techniques/workflow-engine/finalize-activity.md — read
- corpus/meta/techniques/workflow-engine/present-checkpoint-to-user.md — read
- corpus/meta/techniques/workflow-engine/respond-checkpoint.md — read
- corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md — read
- corpus/meta/techniques/workflow-engine/resume-worker.md — read
- corpus/meta/techniques/workflow-engine/sync-progress-status.md — read
- corpus/meta/techniques/workflow-engine/take-activity.md — read
- corpus/meta/techniques/workflow-engine/workflow-orchestrator.md — read
- corpus/meta/techniques/workflow-engine/yield-checkpoint.md — read
- corpus/midnight-system-review/activities/README.md — read
- corpus/ponytail/activities/README.md — read
- corpus/prism-audit/README.md — read
- corpus/prism-update/activities/README.md — read
- corpus/specimens/fan-conformance/activities/README.md — read
- corpus/specimens/git-pin-conformance/activities/README.md — read
- corpus/specimens/routine-conformance/activities/README.md — read
- corpus/substrate-node-security-audit/README.md — read
- corpus/substrate-node-security-audit/activities/README.md — read
- corpus/work-package/README.md — read
- corpus/work-package/activities/README.md — read
- corpus/work-packages/README.md — read
- corpus/workflow-authoring/resources/impact-analysis.md — read
- corpus/workflow-authoring/resources/scope-manifest.md — read
- corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md — read
- corpus/workflow-authoring/techniques/workflow-definition/scope-definition.md — read
- corpus/workflow-authoring/techniques/workflow-definition/yaml-authoring.md — read
- corpus/workflow-design/README.md — read
- corpus/workflow-design/activities/01-intake-and-context.yaml — read
- corpus/workflow-design/activities/03-requirements-refinement.yaml — read
- corpus/workflow-design/activities/04-pattern-analysis.yaml — read
- corpus/workflow-design/activities/05-impact-analysis.yaml — read
- corpus/workflow-design/activities/06-scope-and-draft.yaml — read
- corpus/workflow-design/activities/08-quality-review.yaml — read
- corpus/workflow-design/activities/README.md — read
- corpus/workflow-design/resources/design-assumptions.md — read
- corpus/workflow-design/resources/format-conventions.md — read
- corpus/workflow-design/resources/impact-analysis.md — read
- corpus/workflow-design/resources/scope-manifest.md — read
- corpus/workflow-design/techniques/TECHNIQUE.md — read
- corpus/workflow-design/techniques/audit-rule-enforcement.md — read
- corpus/workflow-design/techniques/context-loading.md — read
- corpus/workflow-design/techniques/impact-analysis.md — read
- corpus/workflow-design/techniques/pattern-analysis.md — read
- corpus/workflow-design/techniques/reconcile-design-assumptions.md — read
- corpus/workflow-design/techniques/scope-definition.md — read
- corpus/workflow-design/techniques/yaml-authoring.md — read
- corpus/workflow-design/workflow.yaml — read
- ledgers/unserved-operation-ref-triage.json — read (the diff, and every entry whose site is a surface file; the remaining entries of the 355 share one shape, scanned rather than read one by one)
- corpus/meta/techniques/README.md — read
- corpus/meta/workflow.yaml — read
- corpus/prism-audit/activities/02-execute-analysis.yaml — read
- corpus/prism-audit/techniques/README.md — read
- corpus/prism-evaluate/activities/02-execute-analysis.yaml — read
- corpus/prism-evaluate/techniques/README.md — read
- corpus/work-package/activities/10-post-impl-review.yaml — read
- corpus/workflow-authoring/activities/06-scope-and-draft.yaml — read
- corpus/workflow-authoring/activities/09-validate-and-commit.yaml — read
- corpus/workflow-authoring/techniques/workflow-definition/intake-classification.md — read
- corpus/workflow-authoring/techniques/workflow-definition/synthesize-change-brief.md — read
- corpus/workflow-design/activities/09-validate-and-commit.yaml — read
- corpus/workflow-design/techniques/capture-dimension.md — read
- corpus/workflow-design/techniques/intake-classification.md — read
- corpus/workflow-design/techniques/persist-design-specification.md — read
- corpus/workflow-design/techniques/synthesize-update-specification.md — read
