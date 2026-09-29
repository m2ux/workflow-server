# Walk 2 A — Design Principles 1–24 (+ overview), fix surface

Home: `corpus/canon/resources/design-principles.md` at 1df70bd2 (#970 worktree). I applied the overview as written: each heading is one invariant, and specific instances belong to the anti-pattern catalog. The fix edited only principle 43 in this home, which is outside the slice. Under the overview it now holds one invariant plus a citation, and the citation `schema-construct-inventory.md#compose-or-reuse-activities` resolves to a section that states the reference form (`:45-47`).

Surface: 37 fix-surface files, all read whole. Diffs were read with `git show 1df70bd2` and `git show 4ef2c6d6`. Engine claims were settled at `src/tools/workflow-tools.ts` on the schema-description-hygiene worktree: yield_checkpoint `:2413-2578`, resume_checkpoint `:2636-2687`, get_workflow_status `:3005`. I also read three files off the surface as consumers and twins: `corpus/meta/routines/activity-loop.yaml`, `corpus/workflow-design/activities/08-quality-review.yaml` and `corpus/substrate-node-security-audit/README.md`. Neither commit edits a guard ledger. The only non-corpus edit is `walks/roster.json`, and it changes only a reason string.

Status of first-pass A findings on the fix surface:
- Resolved: A2, A3, A4, A7, A8, A9, A10, A12.
- Resolved under its own principle, but fires under another: A1. It no longer fires under principle 13. It now fires under principle 6 (W2-A1).
- Still fires: A6 (W2-A6).
- Not on the fix surface: A5 and A11.

## Units

- `Overview` — walked
- `## 1. Workflows Ossify Patterns` — walked
- `## 2. Internalize Before Producing` — walked (session conduct; nothing on the surface prescribes it or breaks it)
- `## 3. Define Complete Scope Before Execution` — walked (session conduct; the commit bodies list the changes. The one survivor outside the list is W2-A5)
- `## 4. Clarify Before Assuming` — walked (session conduct; nothing on the surface bears on it)
- `## 5. Maximize Schema Expressiveness` — walked (the specimen descriptions now state what each construct is. I did not record sequence-shaped pattern descriptions: sibling definitions carry the same form, so it is convention)
- `## 6. One Authoritative Home` — walked
- `## 7. Convention Over Invention` — walked (the specimen `## Copying from it` matches mvw and namespace-conformance; `activities:` after `graph` matches remediate-vuln; the new step `id` and the statement-form message follow the corpus; the `### 3. Continue Or Finalize` casing matches yield-checkpoint's `### 2. Pause Or Continue`)
- `## 8. Confirm Before Irreversible Changes` — walked (session conduct; nothing on the surface bears on it)
- `## 9. Encode Constraints as Structure` — walked (a declared yield carrying message or options is refused by the server, `workflow-tools.ts:2460-2463`)
- `## 10. Non-Destructive Updates` — walked (both commit bodies name each removal: the `outputs-by-name-and-path` rule, the copy recipe, the restated yield mechanics, the `confirm` checkpoint. The routine clause dropped from principle 43 is not named, but principle 42 still holds that fact)
- `## 11. Complete Documentation Structure` — walked
- `## 12. Output Economy` — walked (`stop-here` message: one fact)
- `## 13. Separate Contract from Procedure` — walked (`selected_exit` Outputs state how the value is recognised; the `checkpoint_id` Input lists the undeclared-decision id)
- `## 14. Single Source of Truth` — walked
- `## 15. Phase by Sequenced Outcome` — walked (resume-from-checkpoint now splits Apply Effects from Continue Or Finalize)
- `## 16. Distinguish Designators from Parameters` — walked (`{workflow_id}/` in scope-definition; `{selected_exit}` is declared where it is derived)
- `## 17. Document in Positive Present` — walked
- `## 18. Prefer Shared Capability` — walked (each pattern declares exit `done`, so a borrower binds it and no local copy is needed)
- `## 19. Name Symbols Affirmatively` — walked
- `## 20. Keep Orchestration in Structure` — walked
- `## 21. Match the Harness Surface` — walked. Checked against the handlers:
  - a declared yield takes the id alone, and an undeclared one needs both `message` and `options` (`:2459-2470`)
  - a yield replay returns `resolved_option`, `effect` and `exit` with `ends_activity` (`:2514-2525`)
  - resume returns `option_id`, `variables_changed` and `exit` (`:2670-2677`)
  - a yield replies with an empty block (`:2568`)
  - resume refuses while the checkpoint is still active (`:2646`)
  - status covers active, blocked and completed, and the last answer names the checkpoint and option (`:3005`)
- `## 22. Modular Over Inline` — walked
- `## 23. Close the Loop` — walked (session conduct; nothing on the surface bears on it)
- `## 24. Keep Session Interaction in Activities` — walked (the question and answers for an undeclared decision in yield-checkpoint are a case the server admits at run time, which no definition exists to own, so I did not record it)

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| W2-A1 | Contract | Medium | 6. One Authoritative Home | `meta/techniques/workflow-engine/activity-worker.md:26`, `compose-prompt.md:22`, `resume-from-checkpoint.md:18`, `resume-worker.md:26` — Inputs `### effects` | Each input paraphrases the owner's field list at `respond-checkpoint.md:24`: "the option taken, its effect, and the exit it selected, or its dismissal" stands for `resolved_option`, `effect`, `exit`, `dismissed`. The exception for copies does not apply here. The orchestrator's delivery binds respond-checkpoint and resume-worker together (`activity-loop.yaml:169,177`), and resume-worker applies compose-prompt. The worker holds activity-worker and the resume-from-checkpoint it applies. So each copy sits beside a statement its reader already has. The commit body says these readers "cite respond-checkpoint's declaration"; none of them does. | diff; known — A1 (B1, D1, E1, F1) | State the reply once per delivery: hoist it to the workflow-engine contract, as D1 prescribes, and drop the leaf restatements. |
| W2-A2 | Contract | Medium | 14. Single Source of Truth | `meta/techniques/workflow-engine/resume-from-checkpoint.md:35` (`### 2. Apply Effects`) and `:39` (`### 3. Continue Or Finalize`) | "Apply `{effects}`, and the `variables_changed` the `resume_checkpoint` response returns, to local state". The exit is then read from the response, although `{effects}` also carries "the exit it selected" (`:18`). So the checkpoint's variable writes and its exit reach the worker by two carriers, and both are applied. resume_checkpoint already returns the option, `variables_changed` and `exit` (`workflow-tools.ts:2670-2677`). | pre-existing (dual carrier present at 0d56c951; the fix named the response; F11 had named the two carriers) | Read the answer from the resume_checkpoint response alone. Keep `effects` as the continuation signal the stub keys on (`compose-prompt.md:44`). |
| W2-A3 | Contract | Medium | 6. One Authoritative Home | `meta/techniques/variable-binding.md:63` rule `outputs-mutate-state-only-via-sanctioned-path` | "one of the sanctioned variable-mutation sources — never through ad-hoc reasoning. This honours the engine's `variable-mutation-source` rule." This restates `workflow-engine/TECHNIQUE.md:38` ("Never mutate state through ad-hoc reasoning") and then cites it. Both reach the worker. The fix edited this line (the spelling) and left the copy. | pre-existing; known — C10 | Delete the copy. `variable-mutation-source` is the home. |
| W2-A4 | Hygiene | Low | 6. One Authoritative Home (21: guidance about a tool's behaviour has one home) | `meta/techniques/workflow-engine/activity-worker.md:61` (`### 5.`), `resume-from-checkpoint.md:41` (`>` note), `yield-checkpoint.md:38` (`replayed` branch) | The host says "When the last step completes, or a checkpoint's exit ends the activity, apply finalize-activity". Both leaves also say "run none of the remaining steps, and finalize the activity with the steps you ran and `{selected_exit}`". The finalize cadence therefore has three statements in one worker delivery. | diff (the phase-5 clause is from the fix); related — F7, whose restatement moved from phase 3 to phase 5 | Leaves state what the reply means: the activity ended at this gate, no remaining step runs, hold `{selected_exit}`. Leave the finalize to activity-worker phase 5. |
| W2-A5 | Hygiene | Low | 6. One Authoritative Home | `substrate-node-security-audit/README.md:220` (twin of the surface file `substrate-node-security-audit/activities/README.md:5`) | Both READMEs state that the sub-agent activities "do not appear in the … graph". The fix rewrote the activities copy to "workflow graph", and the root copy still reads "transition graph". | diff (the fix edited one of two copies); related — F5/C3 | State the fact in one README and link it from the other. |
| W2-A6 | Hygiene | Low | 19. Name Symbols Affirmatively | `meta/techniques/workflow-engine/respond-checkpoint.md:22` Output `### effects` (and the four same-named Inputs) | The id names the option's effect. The value is the whole resolution reply, which the four readers now call "the reply", and that reply carries a field named `effect`. | known — A6 | Rename the value for what it is (the checkpoint's resolution reply) at its declaration and at its bind sites. |
| W2-A7 | Hygiene | Low | 20. Keep Orchestration in Structure | `workflow-design/README.md:93` (Review Mode) | "the fix loop's exits live in `08-quality-review.yaml`". Exits belong to the activity (`08-quality-review.yaml:332-337`), and the `audit-fix-cycle` loop (`:291`) declares none. Review-mode fix routing is the `review-disposition` checkpoint selecting the `fix-issues` exit (`:176-194`). | diff | Name the `review-disposition` checkpoint and the exits it selects. |
| W2-A8 | Hygiene | Low | 20. Keep Orchestration in Structure | #971 `specimens/schema-hygiene-conformance/techniques/hygiene-probe.md:26` rule `local-marker` | "`{probe_recorded}` is set by the Record step alone." The technique rule names a step. The activities bind hygiene-probe at three steps: `record` (added in the same commit), `numeric-flag` and `numeric-count` (`02-gate-exit.yaml:15-22`), and each sets `probe_recorded`. Read as the activity step, the claim is false; read as the Protocol phase `### 1. Record`, it holds. | diff (#971 fix) | State the invariant in the technique's own terms, for example "`{probe_recorded}` becomes true only in Record", with no reference to a step. |
| W2-A9 | Hygiene | Low | 5. Maximize Schema Expressiveness | `meta/activities/patterns/03-plan-and-execute.yaml:4` `description` | "Plan once, gate optionally, …". The `plan-confirmed` checkpoint (`:32-47`) carries no condition, `defaultOption` or auto-advance, and the patterns README (`:63`) calls it a "Hard `plan-confirmed` gate". The prose field states structure that the definition contradicts. | pre-existing (file touched by the fix: version and `exits`) | State what the pattern is and drop "gate optionally". |
| W2-A10 | Hygiene | Low | 17. Document in Positive Present | `work-package/README.md:9` | "Activities may be … or overridden (adapted for review mode)". The schema has no override construct, and the same README (`:96`) says review mode is conditions on `is_review_mode`. The sentence the fix edited still describes a mechanism the system does not have. | pre-existing | Say review mode conditions steps, checkpoints and exits, and drop "overridden". |
| W2-A11 | Hygiene | Low | 17. Document in Positive Present | `workflow-design/README.md:87`, `:93` | "Do not restate engine dispatch/checkpoint HOW here." and "— do not restate that inventory here". These are directives to README authors inside the orientation, not statements of what the workflow is. The fix edited the sentence at `:93`. | pre-existing | State where each fact lives and drop the directives. |

No High was raised, so none was withdrawn or downgraded. I spot-confirmed the three Mediums:
- W2-A1: `activity-loop.yaml:169,177` binds both techniques in the orchestrator's delivery, and all four paraphrases were read.
- W2-A2: checked against `workflow-tools.ts:2662-2677`.
- W2-A3: re-read against `TECHNIQUE.md:38`.

Considered and not recorded:
- `patterns/README.md:39` repeats each pattern's single exit `done`. This is consumer orientation for the bind.
- `fan-conformance/activities/README.md:5` says "not duplicated here" beside per-activity step diagrams. That is the orientation-transcription entry's domain (D slice) and is not part of this fix.
- The resume stub calls `resume_checkpoint` before `get_activity`, and resume-from-checkpoint calls it again. The handler returns the same reply both times, so nothing misbehaves.
- finalize-activity reads `{selected_exit}` without declaring an Input for it. This is the declared-inputs entry's domain and is pre-existing.
- Version bumps: every technique the fix touched without bumping is already one bump above base ba2ee7b6.

## Files

- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/canon/resources/design-principles.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/codebase-wiki/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/activities/patterns/02-supervisor.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/activities/patterns/03-plan-and-execute.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/activities/patterns/05-lead-researcher.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/activities/patterns/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/variable-binding.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/TECHNIQUE.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/activity-worker.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/compose-prompt.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/finalize-activity.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/respond-checkpoint.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-worker.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/yield-checkpoint.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/midnight-system-review/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/prism-evaluate/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/prism-update/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/specimens/fan-conformance/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/specimens/git-pin-conformance/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/specimens/gitnexus-radius-conformance/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/specimens/routine-conformance/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/substrate-node-security-audit/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/work-package/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/work-packages/activities/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-authoring/resources/impact-analysis.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/audit-rule-enforcement.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/scope-definition.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/evaluate-transition.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/README.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/02-gate-exit.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md
- read — /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/workflow.yaml
- read — /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/walks/roster.json
