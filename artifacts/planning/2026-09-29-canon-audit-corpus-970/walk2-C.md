# Walk 2 C — anti-patterns.md: Overview, Entry identity, Structural, Interaction, Schema Expressiveness, Rule Hygiene (fix surface)

Home: `corpus/canon/resources/anti-patterns.md` on the #970 worktree (HEAD 1df70bd2, lines 1–373). Surface: the 37 files in fix-surface.txt, read whole. Commits: `1df70bd2` (parent `0d56c951`) and `4ef2c6d6` (parent `8a7dc934`). Scope manifest for AP-03 and AP-07: each commit body's item list. Neither commit edits a ledger file.

## Units

- Overview — walked (each entry applied as its Detect / Do not flag / Fix test)
- Smell not stance — not-applicable — "An add or an edit lands only after Succinctness": the Creation Rules govern adds and edits to the catalogue, and neither fix commit edits anti-patterns.md
- Entry identity — walked ("Cite the kebab name in backticks. Do not cite the number": every citation on the surface is a backticked kebab name, e.g. audit-rule-enforcement.md:14 and :36, patterns/README.md:49–51, workflow-design/README.md:128. workflow-design/README.md:154 and :238 "(AP-XX + name)" describe the catalogue's format and cite no entry)
- Audit technique boundary — not-applicable — same Creation Rules scope. Note: first-pass C2's site, audit-rule-enforcement.md:14, now cites `structure-backed-constraints` and restates nothing
- Entry intro — not-applicable — same reason
- Detect triad — not-applicable — same reason
- Keep audit signals — not-applicable — same reason
- Resist over-fit — not-applicable — same reason
- Succinctness — not-applicable — same reason
- AP-01. no-inline-content — walked
- AP-02. schema-is-constraint — walked (no schema change and no ledger edit in either commit)
- AP-03. no-partial-implementation — walked (C1). 1df70bd2's claim "Activity READMEs name exits where they listed transitions as a construct" holds: no activity README keeps "transitions" as a construct. First-pass C3's four survivors are all renamed
- AP-04. no-invented-naming — walked (exit id `done` is used by 61 activities; `selected_exit` is established in finalize-activity and evaluate-transition; step id `record` matches its technique's phase; `## Copying from it` is the heading mvw and namespace-conformance use)
- AP-05. atomic-checkpoints — walked (the specimen keeps one checkpoint, `stop-here`, for one decision)
- AP-06. no-assumption-execution — walked
- AP-07. scope-reverify-completion — walked (fires on C1's evidence; recorded once there)
- AP-08. one-question-per-message — walked (`stop-here.message` is a statement)
- AP-09. checkpoint-not-prose — walked
- AP-10. loop-not-prose — walked (the patterns README's `forEach`, `while` and follow-up rounds are all loops declared in the pattern files: "A loop already declared")
- AP-11. decision-not-prose — walked (each pattern file declares `done`; the specimen's `halt` and `go-on` select the bound `halted` and `finished` exits; the README routing checked is declared: codebase-wiki `needs-reingest`, midnight-system-review `revise-investigation`, workflow-design 08 `fix-issues`)
- AP-12. artifact-not-buried — walked
- AP-13. variable-for-approval — walked
- AP-14. mode-as-state — walked
- AP-15. procedure-in-protocol — walked (no step `description` on any surface YAML)
- AP-16. technique-inputs-declared — walked (C2, C3)
- AP-17. bound-step-no-description — walked
- AP-18. no-monolith-masking-steps — walked (specimen `numeric-flag` / `numeric-count` differ by `when`; lead-researcher's `synthesise` / `synthesise-followup` and plan-and-execute's two execute steps sit at distinct pipeline points: Do not flag)
- AP-19. no-rule-protocol-restatement — walked (first-pass C9's rule is deleted. Its residual about a flattened flag is canon's `no-derived-state-shadow`. The remaining restatement in yield-checkpoint's rule is folded into C5)
- AP-20. rule-group-disambiguation — walked
- AP-21. grouped-rule-keys — walked
- AP-22. single-rule-authority — walked (C4)
- AP-23. worker-rule-reach — walked
- AP-24. no-contradictory-rules — walked
- AP-25. no-one-step-rules — walked (C5, C6)

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| C1 | Contract | Medium | AP-03 no-partial-implementation | 1df70bd2 body, item 1; meta/techniques/workflow-engine/activity-worker.md:26, resume-from-checkpoint.md:18, resume-worker.md:26, compose-prompt.md:22 (`### effects` Inputs) | The commit claims "The effects readers (activity-worker, resume-from-checkpoint, resume-worker, compose-prompt) cite respond-checkpoint's declaration of the reply". None of the four links respond-checkpoint. Each restates its field list instead: "the option taken, its effect, and the exit it selected, or its dismissal", against the owner at respond-checkpoint.md:24. The item stays unaddressed while the commit claims it is done. | diff (1df70bd2); construct known — first-pass B1, D1 (also A1, E1, F1) | Complete the item: make each description cite respond-checkpoint's `effects` Output, or narrow the claim. |
| C2 | Contract | Medium | AP-16 technique-inputs-declared | meta/techniques/workflow-engine/finalize-activity.md:78 (Protocol 1) against `## Inputs` :10–26 | "Include `{selected_exit}` if a checkpoint effect named an exit" reads a value that no Input declares. The Inputs are `steps_completed`, `checkpoints_responded`, `artifacts_produced` and `batch_may_continue`. The fix's producers hand the value over by id: resume-from-checkpoint.md:41 and yield-checkpoint.md:38 say "finalize the activity with the steps you ran and `{selected_exit}`". The `#### selected_exit` output field is filled from this value and does not produce it, so "pure outputs" does not reach it. | pre-existing (Protocol 1 is unchanged from 0d56c951; first-pass F6 cited this site as the consumer, and its producer side is now fixed) | Declare an optional `### selected_exit` on finalize-activity `## Inputs` and reference `{selected_exit}` in Protocol. |
| C3 | Contract | Medium | AP-16 technique-inputs-declared | workflow-design/techniques/scope-definition.md:36, 41, 45 (Protocol 1–3) | `{target_path}`, `{workflow_branch}` and `{workflow_id}` are still read without being declared, either here or on techniques/TECHNIQUE.md (`user_description`, `target_workflow_id`, `target_workflow_ids`). The fix rewrote phase 2 from `{id}/` to `{workflow_id}/`, which is another undeclared read. | known — first-pass C4 (pre-existing; phase 2 edited by 1df70bd2) | Declare each on `## Inputs` (or the root contract) and reference them as `{id}`. |
| C4 | Contract | Medium | AP-22 single-rule-authority | meta/techniques/variable-binding.md:61–63 `outputs-mutate-state-only-via-sanctioned-path` vs workflow-engine/TECHNIQUE.md:38 `variable-mutation-source` | One invariant still has two homes, bridged by "This honours the engine's `variable-mutation-source` rule". The fix made the same edit to both ("`variables-changed`" became "`variables_changed`"). That is the lockstep edit a second home forces. | known — first-pass C10 (pre-existing) | Keep `variable-mutation-source` as the home. Delete the copy and fold its unique content into Phase 4. |
| C5 | Hygiene | Low | AP-25 no-one-step-rules | meta/techniques/workflow-engine/yield-checkpoint.md:42–44, rule `replay-is-continue-not-error` | The rule still constrains only Phase 2's `replayed` branch (:38). After the fix dropped the ends-activity clause, its "means continue" and "not a reason to yield again" repeat the branch's "CONTINUE with the next step" and "do not re-yield the same id". Only "not a fault, not a missing active checkpoint" is its own. | known — first-pass C7 (pre-existing; rule edited by 1df70bd2) | Move "not a fault, not a missing active checkpoint" into the `replayed` bullet as a `>` caveat and delete the rule. |
| C6 | Hygiene | Low | AP-25 no-one-step-rules | meta/techniques/workflow-engine/respond-checkpoint.md:38–40, rule `no-option-hallucination` | This is recovery for one failure of the Phase 2 `respond_checkpoint` call. The phase's other failure is already a `>` note at :35. | known — first-pass C8 (pre-existing) | Move it into Phase 2 as a `>` caveat beside the existing one and delete the rule. |

C1 was weighed as High, because it fires on descriptions the fix shipped and the field list now has four copies. It is downgraded to Medium. The copies agree with the owner today. The cost of the propagation (four edits on a later change to the reply) is the Edit-the-Owner consequence that B1 and D1 track. AP-03's own consequence is the unmet claim.

First-pass C-slice residuals: C2, C3, C6 and C9 are resolved on the fix surface. C4, C7, C8 and C10 still fire (C3, C5, C6 and C4 above). C1, C5, C11 and C12 sit in files outside the fix surface and were not re-walked.

Considered and not recorded:
- **hygiene-probe `local-marker` against AP-25.** The rule reads "`{probe_recorded}` is set by the Record step alone", on a one-phase technique. The sibling specimen contract-composition carries the same form (pair/alpha.md `alpha-own`), so it is convention.
- **codebase-wiki `## Graph` heading.** No entry in this slice keys on a README heading.
- **workflow-design/README.md:93, "the fix loop's exits".** 08-quality-review declares `fix-issues`, which is bound to intake-and-context. AP-11 does not fire.

## Files

- corpus/canon/resources/design-principles.md — read
- corpus/codebase-wiki/activities/README.md — read
- corpus/meta/activities/patterns/02-supervisor.yaml — read
- corpus/meta/activities/patterns/03-plan-and-execute.yaml — read
- corpus/meta/activities/patterns/05-lead-researcher.yaml — read
- corpus/meta/activities/patterns/README.md — read
- corpus/meta/techniques/variable-binding.md — read
- corpus/meta/techniques/workflow-engine/README.md — read
- corpus/meta/techniques/workflow-engine/TECHNIQUE.md — read
- corpus/meta/techniques/workflow-engine/activity-worker.md — read
- corpus/meta/techniques/workflow-engine/compose-prompt.md — read
- corpus/meta/techniques/workflow-engine/finalize-activity.md — read
- corpus/meta/techniques/workflow-engine/respond-checkpoint.md — read
- corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md — read
- corpus/meta/techniques/workflow-engine/resume-worker.md — read
- corpus/meta/techniques/workflow-engine/yield-checkpoint.md — read
- corpus/midnight-system-review/activities/README.md — read
- corpus/prism-evaluate/activities/README.md — read
- corpus/prism-update/activities/README.md — read
- corpus/specimens/fan-conformance/activities/README.md — read
- corpus/specimens/git-pin-conformance/activities/README.md — read
- corpus/specimens/gitnexus-radius-conformance/activities/README.md — read
- corpus/specimens/routine-conformance/activities/README.md — read
- corpus/substrate-node-security-audit/activities/README.md — read
- corpus/work-package/README.md — read
- corpus/work-packages/activities/README.md — read
- corpus/workflow-authoring/resources/impact-analysis.md — read
- corpus/workflow-design/README.md — read
- corpus/workflow-design/techniques/audit-rule-enforcement.md — read
- corpus/workflow-design/techniques/scope-definition.md — read
- corpus/meta/techniques/workflow-engine/evaluate-transition.md — read
- (971) corpus/specimens/schema-hygiene-conformance/README.md — read
- (971) corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml — read
- (971) corpus/specimens/schema-hygiene-conformance/activities/02-gate-exit.yaml — read
- (971) corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md — read
- (971) corpus/specimens/schema-hygiene-conformance/workflow.yaml — read
- (971) walks/roster.json — read
