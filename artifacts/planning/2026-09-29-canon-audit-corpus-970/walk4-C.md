# Walk 4 C — anti-patterns.md: Overview, Creation Rules, Structural, Interaction, Schema Expressiveness, Rule Hygiene (round-3 fix surface)

Home: `corpus/canon/resources/anti-patterns.md` on the residuals worktree (lines 1–373). Base `bcf31337`; commits walked `83d6f046`, `0e764ad3`, `c1ae16f8`. Creation Rules applied to round 3's two Do-not-flag edits (AP-63 :835, AP-100 :1290), and Entry identity / Audit technique boundary to every surface citation and audit technique. Scope manifest for AP-03 and AP-07: each round-3 commit body's items, plus the bcf31337 / b89a58f2 claims round 3 set out to complete (fix-brief3 decision 10). AP-01..AP-25 applied entry-major across the 80 surface files. Out-of-scope items (#973) not recorded: walk3 C3 and C4 (the two workflow-design options with no exit), the loop's termination, `enter-fan` reading `_meta.fan`, dispatch passing `step_manifest` / `variables_changed`.

## Units

- Overview — walked (each entry applied as its Detect / Do not flag / Fix test)
- Smell not stance — walked (both carve-outs name an observable construct)
- Entry identity — walked (round 3 fixed walk3 C15: reconcile-design-assumptions.md:39 now cites `` `pass-orchestration-in-technique` `` by name; the AP-63 / AP-100 edits cite siblings as backticked names; no number citation on the surface)
- Audit technique boundary — walked (C9)
- Entry intro — walked (both edits touch only Do not flag; each intro keeps its exemplar and one failure sentence)
- Detect triad — walked (Detect / Do not flag / Fix stay separate blocks in AP-63 and AP-100)
- Keep audit signals — walked (both edits add a carve-out and cut no signal, carve-out or Fix branch)
- Resist over-fit — walked (C11). The AP-100 carve-out is generic. The AP-63 carve-out's general clause fires on a foreign workflow; its guard exists (`check-inventory-schema-agreement.ts:37` parses `## … (name.schema.json)`)
- Succinctness — walked (C10)
- AP-01. no-inline-content — walked
- AP-02. schema-is-constraint — walked (no schema edit; the ledger edits re-site one entry and drop one whose reference the round removed)
- AP-03. no-partial-implementation — walked (C1, C2). 83d6f046 holds: `checkpoint_reply` declared only on activity-worker, compose-prompt, resume-worker; activity-loop clears it after `resume-yielded-worker`; `exit_id` / `step_manifest` on the container only (no bag variable of either name exists); from_activity on the leaves; finalize-activity and evaluate-transition give the same destination values. 0e764ad3's seven listed techniques output content and each save step binds the path its gate links; `scope_manifest` / `scope_manifest_report` split holds in both twins and every consumer reads the manifest as the file list; the fix cycle re-saves enforcement findings; `revise-impact` reaches `record-impact-correction` because the `revise` exit lost `immediate` (the engine sets `ends_activity` only for an immediate exit, workflow-tools.ts:778). c1ae16f8: inventory, client_workflow_completed, both carve-outs hold
- AP-04. no-invented-naming — walked (`impact_correction`, `impact_revision_requested`, `scope_manifest_report`, `refresh-enforcement-findings`, `record-impact-correction`, `clear-checkpoint-reply` follow existing snake/kebab forms)
- AP-05. atomic-checkpoints — walked
- AP-06. no-assumption-execution — walked
- AP-07. scope-reverify-completion — walked (fires on C1 and C2's evidence; recorded once there)
- AP-08. one-question-per-message — walked (every surface checkpoint `message` is a statement)
- AP-09. checkpoint-not-prose — walked ("the reply carries the correction" is the library's free-text reply form: residual-assumption-interview, work-package 03/10/13 carry it)
- AP-10. loop-not-prose — walked (impact-analysis Phase 2 per-file classification is per-item work in one application: Do not flag)
- AP-11. decision-not-prose — walked. 05 `revise` bound to impact-analysis; work-package activities README "Its exit leads to codebase-comprehension" matches `design-philosophy.done`; prism-update "route back to apply-updates" matches `has-issues`
- AP-12. artifact-not-buried — walked (every content-producing surface technique carries `#### artifact`, including both `scope_manifest_report` outputs)
- AP-13. variable-for-approval — walked (`impact_revision_requested` is typed, set from the option's effect, gates the record step)
- AP-14. mode-as-state — walked (01's save steps and context-loading both key on `operation_type`)
- AP-15. procedure-in-protocol — walked (no bound step carries `description`)
- AP-16. technique-inputs-declared — walked (C3, C4, C5). Walk3 C5 and C6 fixed: `step_manifest` on the container and on enter-fan; context-loading declares `operation_type` and no longer reads `planning_folder_path`. Round-3 leaves read `checkpoint_reply`, `exit_id`, `step_manifest`, `impact_correction` from declared inputs
- AP-17. bound-step-no-description — walked
- AP-18. no-monolith-masking-steps — walked (08 `persist-enforcement-findings` and `refresh-enforcement-findings` sit at distinct pipeline points: Do not flag)
- AP-19. no-rule-protocol-restatement — walked (C6). Walk3 C10 fixed (`binding-carries-only-deviations` gone; `an-argument-position-sets-its-own-default` repointed). workflow-authoring impact-analysis `side-effect-detection` moved into Phase 2
- AP-20. rule-group-disambiguation — walked
- AP-21. grouped-rule-keys — walked
- AP-22. single-rule-authority — walked (the three drafting rules on both yaml-authoring twins, and `content-preservation` on both impact-analysis twins, are worker reach: `worker-rule-reach` Do not flag)
- AP-23. worker-rule-reach — walked (walk3 C9 fixed: workflow-design yaml-authoring carries the three rules)
- AP-24. no-contradictory-rules — walked (`a-foreign-technique-is-qualified` and `activity-group-shorthand` agree; the resolver falls back to `meta` for a bare name, technique-loader.ts:125)
- AP-25. no-one-step-rules — walked (C7, C8)

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| C1 | Contract | Medium | AP-03 no-partial-implementation | 0e764ad3 subject ("Write every workflow-design report through its save step"), b89a58f2 body ("write each report through its save step"); workflow-design/techniques/audit-principles.md:40–42, audit-anti-patterns.md:44–46, audit-expressiveness.md:44–48, audit-conformance.md:49–53, audit-rule-hygiene.md:46–50, create-completion-doc.md:45–47; activities/08-quality-review.yaml:116–134; 11-retrospective.yaml:26–34 | Five audit techniques keep a "Persist Findings" phase and output `*_findings_path`. In review mode 08's `persist-principle-findings` and `persist-anti-pattern-findings` save the same content a second time and bind no path, while compile-report links the technique's own path. create-completion-doc Phase 4 records `{completion_document}` in the planning folder, and 11's `persist-completion-doc` writes it again. The body lists seven converted techniques; the subject claims every report. | diff (claim); constructs pre-existing | Convert the five audits and create-completion-doc to output content only, each saved by one step binding the path its readers link. Otherwise narrow the subject to the seven techniques converted. |
| C2 | Hygiene | Low | AP-03 no-partial-implementation | bcf31337 body ("keep each activity's role … leave steps, checkpoints and loops to the YAML"), c1ae16f8 body ("keep each activity's role"); work-package/activities/README.md:69, :77, :93, :101, :109 | "Reviews each open assumption with the user and posts deferred assumptions to the issue tracker"; "each task following an implement-test-commit-log-self-review cycle"; "closes by settling whether the environment can run the validation suite"; "Progress for this activity is marked cancelled/N/A and the suite is skipped"; "offers a re-sign pass … its findings gate decides which of them the posted review carries". Round 3 removed the survivors walk3 listed and left these. | known — not fixed (walk3 C2) | Reduce each entry to the activity's role, or narrow the claim. |
| C3 | Contract | Medium | AP-16 technique-inputs-declared | workflow-design/techniques/scope-verification.md:14, :28; scope-audit.md:20, :24; publish-workflow-pr.md:18, :24; create-completion-doc.md:43, :47 | All four read `{scope_manifest}`. publish-workflow-pr also reads `{planning_folder_path}` and `{pushed_branch}`, scope-audit `{target_path}` and `{workflow_branch}`, create-completion-doc `{planning_folder_path}`. None declares them, and workflow-design/techniques/TECHNIQUE.md declares only `user_description`, `target_workflow_id`, `target_workflow_ids`. The workflow-authoring twins (scope-verification, compose-publication, create-completion-doc, readme-authoring) declare `scope_manifest`. | pre-existing | Declare each read value on the technique's `## Inputs`, or on the root contract. |
| C4 | Contract | Medium | AP-16 technique-inputs-declared | workflow-design/techniques/verify-high-findings.md:28 (Protocol 1), :37 (Protocol 3) | "For each High-tier finding, re-derive it…" and "surviving Medium findings": the finding set it verifies is named by no input. The technique declares Outputs only. The workflow-authoring twin declares `audit_findings`. | pre-existing (file touched) | Declare the finding set as an input and reference it in Protocol. |
| C5 | Contract | Medium | AP-16 technique-inputs-declared | workflow-authoring/techniques/workflow-definition/scope-verification.md:39 (Protocol 2); intake-classification.md:77 (Protocol 3) | Both read `{target_path}`. It is declared neither on either technique nor on workflow-definition/TECHNIQUE.md nor on the root contract. Round 3 declared it locally on scope-definition only. | known — not fixed (walk3 C7, intake-classification); pre-existing (scope-verification) | Declare `target_path` on both, as scope-definition now does. |
| C6 | Hygiene | Low | AP-19 no-rule-protocol-restatement | workflow-design/techniques/reconcile-design-assumptions.md:72–74, rule `no-sibling-audit-invoke` | "Do not Apply / `::`-invoke `audit-*` techniques" restates Phase 1 (:39), which round 3 edited: "Do not Apply sibling `audit-*` techniques from this Protocol". | known — not fixed (walk3 C11) | Delete the rule; the phase carries it. |
| C7 | Hygiene | Low | AP-25 no-one-step-rules | meta/techniques/workflow-engine/respond-checkpoint.md:36–38, rule `verify-auto-advance-on-resolve` | Phase 1 (:26) exists only to apply it, and nothing else cites it. | known — not fixed (walk3 C12) | Fold the check into Phase 1 and delete the rule. |
| C8 | Hygiene | Low | AP-25 no-one-step-rules | meta/techniques/workflow-engine/commit-and-persist.md:64–66, rule `session-files-ride-along` | It constrains Phase 4 alone, which (:35) already commits "`README.md`, `session.json` and `.session-token`". | known — not fixed (walk3 C13) | Move "same engineering commit, no separate `state` commit" into Phase 4 as a `>` caveat and delete the rule. |
| C9 | Contract | Medium | Audit technique boundary (Creation Rules) | workflow-design/techniques/audit-rule-enforcement.md:37–38 (Protocol 2) | "Walk every `rules[]` entry in `workflow.yaml` and activity files" with "> Walk technique `## Rules` too when the entry's scope implies it" restates and narrows the site list in `structure-backed-constraints` Detect, which names technique `## Rules` unconditionally. Round 3 edited this file (:45). | known — not fixed (walk3 C14) | Delete the scope restatement and walk what Detect names. |
| C10 | Hygiene | Low | Succinctness (Creation Rules) | canon/resources/schema-construct-inventory.md:203, 215, 221, 227, 233, 239 | "The file shape is `schemas/routine.schema.json`" and five "Fields: `schemas/routine.schema.json`" repeat the section heading and the :21 list. c1ae16f8 edited :19, which now also says where the routine schema is read. | known — not fixed (walk3 C16) | Delete the six sentences. |
| C11 | Hygiene | Low | Resist over-fit (Creation Rules) | canon/resources/anti-patterns.md:835, AP-63 `backtick-code-tokens` Do not flag | "…such as a schema filename in a construct-inventory section heading" puts this repo's resource into the carve-out. Resist over-fit allows a concrete name on the exemplar and at most once inside Detect. The general clause "A heading token a guard parses by pattern" carries the test on its own. | diff | Drop the "such as" clause. |

No High was raised. C1 was weighed as High, because it fires on a claim the round ships and the duplicate writes propagate into two homes per report. It stays Medium: every self-persisting construct predates the round, and the fix brief kept the sibling audits self-refreshing (decision 6).

These were considered and not recorded, because they fall outside this slice's entries. The caller may route them.
- **yield-checkpoint.md:25 (diff, 83d6f046).** The call now passes `{checkpoint_id}`, but :24 chooses the local `{$checkpoint_id}`. That is a read of an undeclared id (`bind-protocol-locals`).
- **activity-loop.yaml:87–97 (pre-existing).** `enter-fan` now declares `step_manifest`, but its step binds none, so the retired activity's manifest never reaches `next_activity` (`apply-omits-declared-input`). This may fall under #973's dispatch item.
- **context-loading.md:46 (pre-existing, file touched).** It says to "Load all five JSON schema definitions from `workflow-server://schemas` (workflow, activity, technique, condition, state)". The URI serves workflow, activity, condition, technique and session-file (schema-loader.ts:16), and inventory :19 now names four (`stale-restatement-after-change` / `cited-home-owns-claim`).
- **persist-design-specification.md:40 (diff-induced).** Phase 2 mirrors README links "to this artifact" before 03's save step produces `specification_path` (`unproduced-value-read`). The technique name still says "persist" for a technique that now assembles the specification.
- **workflow-design/techniques/TECHNIQUE.md:70, :91 (diff).** The `verify-artifact-conforms` link became "the planning-artifact conformance check", which names no home. The matching ledger entry was dropped (`reference-without-provenance`).
- **11-retrospective.yaml:31, :43 (pre-existing, Live).** Both save steps write `completion.md`, so the retrospective overwrites the completion document. create-completion-doc declares the artifact `COMPLETE.md` (`artifact-name-is-filename`).

## Files

- corpus/canon/resources/anti-patterns.md — read (slice whole; AP-63 and AP-100 whole)
- corpus/canon/resources/schema-construct-inventory.md — read
- corpus/meta/activities/03-dispatch-client-workflow.yaml — read
- corpus/meta/activities/04-end-workflow.yaml — read
- corpus/meta/routines/activity-loop.yaml — read
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
- corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md — read
- corpus/meta/techniques/workflow-engine/resume-worker.md — read
- corpus/meta/techniques/workflow-engine/take-activity.md — read
- corpus/meta/techniques/workflow-engine/yield-checkpoint.md — read
- corpus/prism-audit/README.md — read
- corpus/prism-audit/techniques/README.md — read
- corpus/prism-update/activities/README.md — read
- corpus/substrate-node-security-audit/README.md — read
- corpus/work-package/README.md — read
- corpus/work-package/activities/README.md — read
- corpus/work-packages/README.md — read
- corpus/workflow-authoring/activities/06-scope-and-draft.yaml — read
- corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md — read
- corpus/workflow-authoring/techniques/workflow-definition/scope-definition.md — read
- corpus/workflow-authoring/techniques/workflow-definition/yaml-authoring.md — read
- corpus/workflow-design/README.md — read
- corpus/workflow-design/activities/01-intake-and-context.yaml — read
- corpus/workflow-design/activities/03-requirements-refinement.yaml — read
- corpus/workflow-design/activities/05-impact-analysis.yaml — read
- corpus/workflow-design/activities/06-scope-and-draft.yaml — read
- corpus/workflow-design/activities/08-quality-review.yaml — read
- corpus/workflow-design/resources/applicable-constructs.md — read
- corpus/workflow-design/resources/draft-attestation.md — read
- corpus/workflow-design/resources/impact-analysis.md — read
- corpus/workflow-design/techniques/TECHNIQUE.md — read
- corpus/workflow-design/techniques/assemble-file-approach.md — read
- corpus/workflow-design/techniques/audit-rule-enforcement.md — read
- corpus/workflow-design/techniques/context-loading.md — read
- corpus/workflow-design/techniques/impact-analysis.md — read
- corpus/workflow-design/techniques/intake-classification.md — read
- corpus/workflow-design/techniques/persist-design-specification.md — read
- corpus/workflow-design/techniques/reconcile-design-assumptions.md — read
- corpus/workflow-design/techniques/review-draft-yaml.md — read
- corpus/workflow-design/techniques/review-drafted-file.md — read
- corpus/workflow-design/techniques/scope-definition.md — read
- corpus/workflow-design/techniques/verify-high-findings.md — read
- corpus/workflow-design/techniques/yaml-authoring.md — read
- ledgers/binding-fidelity-triage.json — read (the diff, and every entry whose site is a surface file)
- ledgers/unserved-operation-ref-triage.json — read (the diff, and every entry whose site is a surface file)
- corpus/meta/techniques/fan/retire-branch.md — read
- corpus/meta/techniques/workflow-engine/respond-checkpoint.md — read
- corpus/prism-audit/activities/02-execute-analysis.yaml — read
- corpus/prism-evaluate/activities/02-execute-analysis.yaml — read
- corpus/work-package/activities/10-post-impl-review.yaml — read
- corpus/work-package/resources/workflow-retrospective.md — read
- corpus/workflow-authoring/activities/08-quality-review.yaml — read
- corpus/workflow-authoring/activities/09-validate-and-commit.yaml — read
- corpus/workflow-authoring/techniques/workflow-definition/compile-report.md — read
- corpus/workflow-authoring/techniques/workflow-definition/compose-publication.md — read
- corpus/workflow-authoring/techniques/workflow-definition/create-completion-doc.md — read
- corpus/workflow-authoring/techniques/workflow-definition/readme-authoring.md — read
- corpus/workflow-authoring/techniques/workflow-definition/scope-verification.md — read
- corpus/workflow-authoring/techniques/workflow-definition/verify-high-findings.md — read
- corpus/workflow-authoring/workflow.yaml — read
- corpus/workflow-design/activities/09-validate-and-commit.yaml — read
- corpus/workflow-design/activities/10-post-update-review.yaml — read
- corpus/workflow-design/activities/11-retrospective.yaml — read
- corpus/workflow-design/techniques/apply-audit-fixes.md — read
- corpus/workflow-design/techniques/create-completion-doc.md — read
- corpus/workflow-design/techniques/publish-workflow-pr.md — read
- corpus/workflow-design/techniques/scope-audit.md — read
- corpus/workflow-design/techniques/scope-verification.md — read
- corpus/workflow-design/workflow.yaml — read
