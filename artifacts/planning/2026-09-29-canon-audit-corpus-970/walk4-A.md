# Walk 4 A — Design Principles 1–24 (+ overview), round-3 fix surface

Home: `corpus/canon/resources/design-principles.md` on the residuals worktree (head after `c1ae16f8`, base `bcf31337`). The overview was applied as written: each heading is one invariant, and specific instances belong to the anti-pattern catalog. The round does not touch the principles file.

Surface: all 80 paths in `r4-surface.txt` read whole. Touched files were diffed against `bcf31337` (`git diff bcf31337..HEAD`, 1503 lines, read whole). Engine claims were settled on the schema-description-hygiene worktree:
- `src/tools/workflow-tools.ts`: `respond_checkpoint` params `:2763-2772` (only `option_id`, `auto_advance`, `condition_not_met`); `resume_checkpoint` return `:2636`; `exitReport` / `immediate` → `ends_activity` `:766-779`; `next_activity` `exit` and `step_manifest` handling `:1226-1349`.
- `src/loaders/schema-loader.ts:16`: `SCHEMA_IDS = ['workflow', 'activity', 'condition', 'technique', 'session-file']`.
- `src/loaders/technique-loader.ts:115-126`: a bare ref resolves in the referring workflow, then `meta`.
- `schemas/activity.schema.json:579`: a non-immediate exit is recorded when chosen and taken when the steps finish.

Status of third-pass slice-A findings:
- **Resolved:** W3-A1 (reply cleared after `resume-yielded-worker`, declared on the three continuation techniques only), W3-A2, W3-A3, W3-A5, W3-A6, W3-A7, W3-A8, W3-A9, W3-A10, W3-A11, W3-A13, W3-A14, W3-A20, W3-A21, W3-A23.
- **Resolved in part:** W3-A4 (seven techniques moved; `audit-principles` and `audit-anti-patterns` still double-write), W3-A12 (`checkpoint_reply` part fixed; `activity_id` still optional for the single-id leaves), W3-A15 (the correction now has a variable, but no channel fills it — see A1).
- **Still firing:** W3-A17, W3-A18, W3-A19, W3-A22.
- **Not on this surface:** W3-A16 (its sibling instance on `assemble-file-approach` is A7).

## Units

- `Overview` — walked
- `## 1. Workflows Ossify Patterns` — walked (no new graph or procedure on the surface)
- `## 2. Internalize Before Producing` — walked (session conduct; nothing on the surface prescribes or breaks it)
- `## 3. Define Complete Scope Before Execution` — walked (applied to the round's stated scope in the commit bodies; the residual is recorded under W3-A4)
- `## 4. Clarify Before Assuming` — walked (session conduct; nothing on the surface bears on it)
- `## 5. Maximize Schema Expressiveness` — walked. The `when: checkpoint_reply` gate uses the bare-IDENT form the routine schema defines (`routine.schema.json:606`), as `when: fan_convergence_activity` already does.
- `## 6. One Authoritative Home` — walked. `checkpoint_reply` on three leaves is within the sibling carve-out for two or three leaves with no common declaration. The yaml-authoring rules copied into both twins match the "delivery would not carry it" case.
- `## 7. Convention Over Invention` — walked. These match their siblings: the new save steps and `written_artifact:` binds, `refresh-enforcement-findings` against `persist-enforcement-findings`, `record-impact-correction` against 03's `record-design-context`, and `clear-checkpoint-reply` against `retire-fan-envelope`.
- `## 8. Confirm Before Irreversible Changes` — walked (session conduct; nothing on the surface bears on it)
- `## 9. Encode Constraints as Structure` — walked. The applicable-constructs "skip in review mode" rule left the resource, and the step's `when` now holds it. That is structure.
- `## 10. Non-Destructive Updates` — walked. The commit bodies name the removed `*_path` outputs and the persist phases; the moved rules (`side-effect-detection`, `binding-carries-only-deviations`) land at named receiving sites.
- `## 11. Complete Documentation Structure` — walked
- `## 12. Output Economy` — walked
- `## 13. Separate Contract from Procedure` — walked
- `## 14. Single Source of Truth` — walked
- `## 15. Phase by Sequenced Outcome` — walked
- `## 16. Distinguish Designators from Parameters` — walked
- `## 17. Document in Positive Present` — walked
- `## 18. Prefer Shared Capability` — walked (every new save step binds the shared `write-artifact`)
- `## 19. Name Symbols Affirmatively` — walked. These pass: `exit_id`, `step_manifest`, `impact_correction`, `impact_revision_requested`, `format_conventions`, `applicable_constructs`, `design_specification` and `scope_manifest_report`.
- `## 20. Keep Orchestration in Structure` — walked
- `## 21. Match the Harness Surface` — walked. These match the handlers:
  - finalize-activity's destination values against evaluate-transition
  - commit-and-persist's "before the next `next_activity` call"
  - the qualification rule's bare-`meta` resolution against `technique-loader.ts:115-126`
  - yaml-authoring's schema read from `workflow-server://schemas`
- `## 22. Modular Over Inline` — walked
- `## 23. Close the Loop` — walked (session conduct; nothing on the surface bears on it)
- `## 24. Keep Session Interaction in Activities` — walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| W4-A1 | Live | High | 21. Match the Harness Surface | `workflow-design/activities/05-impact-analysis.yaml:260-266` (option `revise-impact`), `:273-282` (step `record-impact-correction`); `workflow-design/techniques/impact-analysis.md:20-22`, `:51`. Root: `meta/techniques/workflow-engine/present-checkpoint-to-user.md:66-68` (`a-correction-lands-in-the-bag`) | The option says "the reply carries the correction". The worker's step then `set`s `impact_correction` to "The correction the reader's reply to the impact review carries". On the harness surface, a reply carries no text: <br>• `respond_checkpoint` takes only `option_id`, `auto_advance` or `condition_not_met` (`workflow-tools.ts:2766-2771`). <br>• `resume_checkpoint` returns the option, `variables_changed` and `exit` (`:2636`). <br>• present-checkpoint-to-user phase 5 captures only `option_id`. <br>• compose-prompt's `context-travels-as-state` bars the decision from the resume stub. <br>• `variable-mutation-source` (TECHNIQUE.md) names no other channel. <br>So the worker has nothing to set `impact_correction` from. The re-run reads an empty or invented correction and recomputes the same report. Pre-existing sites of the same shape: `03-requirements-refinement.yaml:77-83` (`record-design-context`) and `work-package/activities/10-post-impl-review.yaml:122-131`, `:147-153` ("The reply names the block numbers", "The reply carries the corrections"). | diff (0e764ad3); pre-existing class | Give the correction a channel the harness carries, and bind `impact_correction` from it. Until one exists, put the correction on a gate the worker can read, for example a declared follow-up checkpoint or an option set. Fix `a-correction-lands-in-the-bag` to name the channel. |
| W4-A2 | Live | Medium | 14. Single Source of Truth | `workflow-design/techniques/persist-design-specification.md:38-40` (phase `2. Mirror Decisions To README`); `workflow-design/activities/03-requirements-refinement.yaml:114-126` | Phase 2 links the planning README's Design Decisions "to this artifact". The artifact is now written after the technique returns, by `persist-design-specification-artifact`, and `write-artifact` mints its `NN-` name on the first write (`write-artifact.md:50`). Its location has one variable, `specification_path`, which that later step produces. So on a first pass the technique links a file that does not yet exist, under a name it cannot read. At base the technique persisted first and then mirrored. | diff (0e764ad3) | Move the README mirror after the save step: give it a step of its own that reads `specification_path`, or fold it into a technique bound after the write. |
| W4-A3 | Hygiene | Low | 16. Distinguish Designators from Parameters | `workflow-design/techniques/scope-definition.md:71` | "Render the file table from `{scope_manifest}` with `{$structural_design}` and `{$drafting_order}`". Both locals are bound with `$` at `:63` and `:67`, and a read carries no `$`. At base this line read `{structural_design}` and `{drafting_order}`. | diff (0e764ad3) | Read them as `{structural_design}` and `{drafting_order}`. |
| W4-A4 | Hygiene | Low | 13. Separate Contract from Procedure | `workflow-design/techniques/intake-classification.md:14` (Output `operation_type`: "The classified technique — sole mode state"), `:66` (phase "Classify Technique"); `assemble-file-approach.md:18`; `review-draft-yaml.md:18`; `review-drafted-file.md:18`; `create-completion-doc.md:14`; `workflow-authoring/techniques/workflow-definition/readme-authoring.md:14`, `create-completion-doc.md:14` | Each contract calls `operation_type` "the classified technique". The value is the classified operation (`create`, `update`, `review`), as `01-intake-and-context.yaml:35` and `context-loading.md:14` state. | pre-existing | State the meaning: "The classified operation — `create`, `update` or `review`", and rename the phase "Classify Operation". |
| W4-A5 | Hygiene | Low | 21. Match the Harness Surface | `workflow-design/techniques/context-loading.md:46` | "Load all five JSON schema definitions from `workflow-server://schemas` (workflow, activity, technique, condition, state)". The URI serves `workflow`, `activity`, `condition`, `technique` and `session-file` (`schema-loader.ts:16`); no schema is named `state`. The inventory touched this round (`schema-construct-inventory.md:15`) names four definition schemas at that URI. | pre-existing | Name the schemas the URI serves, or cite the inventory's line. |
| W4-A6 | Hygiene | Low | 15. Phase by Sequenced Outcome | `workflow-design/techniques/review-draft-yaml.md:41-44` (phase `2. Record Draft Attestation`) | Bullet 1 closes `{reviewed_blocks}` with the attestation line. Bullet 2 is the binding-fidelity pass, which ends "Flag gaps for revision before attestation closes". So one phase holds two outcomes in the reverse of their required order. The round renumbered the phase and rewrote bullet 1. | pre-existing | Make the binding-fidelity pass its own phase ahead of the attestation. |
| W4-A7 | Hygiene | Low | 20. Keep Orchestration in Structure | `workflow-design/techniques/assemble-file-approach.md:26` (Input `pattern_adoption`) | "`none` where no pattern analysis ran, which is the update path — there the approach is framed against the file's existing content alone". The technique names the route that skips pattern analysis. This is the W3-A16 class, on a file the round touched. | pre-existing | "`none` where no pattern analysis ran; the approach is then framed against the file's existing content." |
| W4-A8 | Contract | Medium | 6. One Authoritative Home | `workflow-design/activities/08-quality-review.yaml:113-134` (`persist-principle-findings`, `persist-anti-pattern-findings`) with `techniques/audit-principles.md:24-26`, `:40-42` and `audit-anti-patterns.md:24-26`, `:44-46`; `11-retrospective.yaml:288-300` with `techniques/create-completion-doc.md:45-47` | Commit 0e764ad3 is titled "Write every workflow-design report through its save step". Three reports still have two writers each: <br>• `audit-principles` persists its report and outputs `*_path` while 08 also writes it. <br>• `audit-anti-patterns` does the same. <br>• `create-completion-doc` phase 4 records the document while 11's `persist-completion-doc` writes it again. | known — W3-A4, not fixed (create-completion-doc newly noted, pre-existing) | Finish the move: each technique outputs content only, and the step owns the write and the path. |
| W4-A9 | Hygiene | Low | 13. Separate Contract from Procedure | `meta/techniques/workflow-engine/TECHNIQUE.md:18` (`activity_id`) | `activity_id` is still optional for every leaf. dispatch-activity, continue-batch and take-activity each need exactly one id. | known — W3-A12, not fixed (the `checkpoint_reply` part is resolved) | Keep the single-id, required form on the leaves that need it. |
| W4-A10 | Hygiene | Low | 20. Keep Orchestration in Structure | `workflow-design/techniques/reconcile-design-assumptions.md:60`, `:74` | "durable evidence for Gate 2 batch disposition"; "Quality-review audit steps remain activity-bound elsewhere". | known — W3-A17, not fixed | State what the value is, and drop the consumer. |
| W4-A11 | Hygiene | Low | 24. Keep Session Interaction in Activities | `workflow-design/resources/impact-analysis.md:76-78` | The template's "Decision ask" section restates the checkpoint's options inside the artifact. | known — W3-A18, not fixed | Drop the section; the checkpoint owns the ask. |
| W4-A12 | Hygiene | Low | 17. Document in Positive Present | `workflow-design/README.md:8-10`; `substrate-node-security-audit/README.md:28`, `:228` | "The defects the replacement exists to fix are still present in this tree and are not being repaired". This round repairs more of them: the report saves, the impact correction and the fix-cycle save. Also "(now) the `gitnexus` capability" and "can no longer be skimmed past". | known — W3-A19, not fixed | State what the workflow is, without the repair status or the history. |
| W4-A13 | Hygiene | Low | 6. One Authoritative Home | `canon/resources/schema-construct-inventory.md:215`, `:221`, `:227`, `:233`, `:239` | Five "Fields: `schemas/routine.schema.json`." lines sit under a section whose heading and intro (`:203`) already name that schema. | known — W3-A22, not fixed | Drop the five lines. |

**Verification of Highs:**
- W4-A1, confirmed. Re-derived from the files alone:
  - The option text (`05:262`) and the step message (`05:279`) presume a reply that carries text.
  - `respond_checkpoint`'s zod schema (`workflow-tools.ts:2766-2771`) admits no text field.
  - `resume_checkpoint` (`:2636`) returns option, `variables_changed` and exit only.
  - compose-prompt (`:60`) bars a decision from the stub.
  - `variable-mutation-source` lists three sources, none of which carries free text.
  - Nothing else writes `impact_correction` (grep: `05:18`, `:91` and the technique input only).
  - I kept it High although the house pattern appears pre-existing at three other sites. The round shipped this construct as the fix for W3-A15, and its output feeds the re-run.

**Spot-confirmed Mediums:**
- W4-A2: at base, `persist-design-specification.md` had "2. Persist Specification Artifact" before "3. Mirror Decisions To README". The step order in 03 is `persist-specification` then `persist-design-specification-artifact`.
- W4-A8: the persist phases in `audit-principles.md:40-42`, `audit-anti-patterns.md:44-46` and `create-completion-doc.md:45-47` were read.

**Considered and not recorded:**
- `enter-fan` now declares `step_manifest` (`enter-fan.md:28-30`). The routine's `enter-fan` step binds `exit_id` from `worker_result` and not `step_manifest`, so the fanning activity's manifest is absent (`workflow-tools.ts:1348-1349` warns). Likewise `exit_id` and `step_manifest` on the container are never bound at `enter-activity`. Both fall under #973's step-manifest item.
- `workflow-authoring/activities/09-validate-and-commit.yaml:304-310, 417-419`: exit `remediation-selected` is `immediate: true`, so `bump-remediation-round` never runs after "Remediate". `remediation_round` stays 0, and 08's `when: remediation_round > 0` fix steps never run. This file is closure and pre-existing. It is the immediate-exit-before-producer class, and outside principles 1–24.
- In take-activity mode (the prism child walks in `prism-audit`, `prism-evaluate` and `work-package` 10), a `checkpoint_pending` envelope routes to `resume-worker` with no `worker_agent_id`. That falls through to spawning a replacement. This is pre-existing routine structure; the round's reply clearing does not change it.
- Ledger sites shifted by this round: `unserved-operation-ref-triage.json` has `context-loading.md:40` (now `:46`) and `assemble-file-approach.md:52` (now `:48`). They were exact at `bcf31337`. The round re-pointed only the `variable-binding.md` site. The guard passes, so this is left to the ledger or guard slice.
- `persist-design-specification` and 03's step `persist-specification` keep a "persist" name for a technique that now only assembles. These are names, not symbol ids, so principle 19 does not reach them.
- `variable-binding.md:45` cites "Phase 2's disambiguation rule" from a Rule. This is the phase-by-ordinal entry, in another slice.
- The fix-cycle `refresh-enforcement-findings` is gated `enforcement_finding_count > 0`, so a round that clears every finding leaves the prior set in the file. The sibling satellites behave the same, and nothing reads the path after the cycle.

## Files

- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/canon/resources/anti-patterns.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/canon/resources/schema-construct-inventory.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/activities/03-dispatch-client-workflow.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/activities/04-end-workflow.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/routines/activity-loop.yaml
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
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/resume-worker.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/take-activity.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/yield-checkpoint.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-audit/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-audit/techniques/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-update/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/substrate-node-security-audit/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-package/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-package/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-packages/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/activities/06-scope-and-draft.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/scope-definition.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/yaml-authoring.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/01-intake-and-context.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/03-requirements-refinement.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/05-impact-analysis.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/06-scope-and-draft.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/08-quality-review.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/resources/applicable-constructs.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/resources/draft-attestation.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/resources/impact-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/TECHNIQUE.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/assemble-file-approach.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/audit-rule-enforcement.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/context-loading.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/impact-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/intake-classification.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/persist-design-specification.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/reconcile-design-assumptions.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/review-draft-yaml.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/review-drafted-file.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/scope-definition.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/verify-high-findings.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/yaml-authoring.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/ledgers/binding-fidelity-triage.json (all 59 entries listed; surface sites checked by script)
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/ledgers/unserved-operation-ref-triage.json (the 56 entries on surface files checked against their sites by script; diff read whole)
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/fan/retire-branch.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/meta/techniques/workflow-engine/respond-checkpoint.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-audit/activities/02-execute-analysis.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/prism-evaluate/activities/02-execute-analysis.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-package/activities/10-post-impl-review.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/work-package/resources/workflow-retrospective.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/activities/08-quality-review.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/activities/09-validate-and-commit.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/compile-report.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/compose-publication.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/create-completion-doc.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/readme-authoring.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/scope-verification.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/techniques/workflow-definition/verify-high-findings.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-authoring/workflow.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/09-validate-and-commit.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/10-post-update-review.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/activities/11-retrospective.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/apply-audit-fixes.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/create-completion-doc.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/publish-workflow-pr.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/scope-audit.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/techniques/scope-verification.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/canon-audit-residuals/corpus/workflow-design/workflow.yaml
