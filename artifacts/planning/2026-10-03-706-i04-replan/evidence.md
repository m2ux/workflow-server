# Evidence

Measured at `origin/main` `ab680d9d` (2026-10-02) and `origin/workflows` `6355c392` (2026-10-03). Counts come from `git grep` and the scripts named below.

## Wrong records

- The artifact contract is the union of technique `#### artifact` names, deduped by filename (`src/tools/workflow-tools.ts`).
- `08-quality-review.yaml` still persists findings with `write-artifact`. `audit-principles.md` declares the artifact and assembles the variable. It does not call `write-artifact`.
- `residual-assumption-interview.yaml` gates `record-batch` with `is_review_mode != true`.
- `tests/e2e/snapshot.test.ts` review-mode case asserts that create-mode checkpoints stay unpresented. It does not assert the absence of an assumption outcome.

## Missing checks

- No guard in `guards/guards.ts` flags an instruction a role cannot act on, or a fallback stated only in a description.
- `corpus/canon/resources/anti-patterns.md` has `AP-156. one-invariant-per-rule` at the heading on line 2289.
- `audit-rule-hygiene.md` scopes the pass to `no-rule-protocol-restatement` through `no-one-step-rules` and does not name AP-156.

## Step grammar, left out

- `StepSchema` is `z.discriminatedUnion('kind', ...)`. `populateStepIds` fills a missing technique id while `kind` is present.
- On `origin/workflows`, technique steps in activities and routines: 831, every one with an explicit id, 216 of them equal to the last segment of the technique reference.
- Every corpus YAML file has a top-level `version:` key: 380 files.

## Worker continuation

- `next_activity` documents a batch reading that counts the lazy fetches of the activity being retired (`workflow-tools.ts`).
- `resolveRetiringActivity` throws `Cannot advance: '${only}' is in flight` at lines 1033–1035. That throw is from commit `0250c95e`, an ancestor of `origin/main`.
- `finalize-activity.md` copies `may_continue` from the `get_activity` batch block onto `batch_may_continue`.
- `continue-batch.md` step 5 mints a worker when the envelope is missing. Its rule `one-advance-per-activity` says a second advance would record a false completion.

## Coverage walk

- `.github/workflows/coverage.yml` on `origin/workflows` triggers on `pull_request` and `workflow_dispatch`.
- The walk step is skipped when the scope output is `none`.
- Commit `41419aa7` is the change that introduced `nothing that moves coverage`, and it is an ancestor of `origin/workflows`.
- The file has no `push` trigger and no `schedule`.

## Inline gates

- `when` does not make a checkpoint dismissible. `condition` does. A routine step has no `condition` field (`activity.schema.ts`).
- `respond_checkpoint` still accepts `condition_not_met` and records `__condition_not_met__`.
- Activities and routines: 118 checkpoint steps, 64 with a step-level `condition`. 86 lines match a step-level `condition:` key.

## Declared shapes

- `git grep -l '^#### entry' origin/workflows -- corpus/support/gitnexus/techniques` lists 7 files.
- `guards/check-operation-contract.ts` says `declared-type-mismatch` holds at 12. The file is not an entry in `guards/guards.ts`.
- `binding-fidelity` measures an entry-field read only where the component declares entry fields.

## Red guards

- `ledgers/unproduced-read-triage.json` is on `origin/workflows`. `git grep -c` of `"verdict": "fix-later"` is 111. `"verdict": "live-bug"` does not match.
- `test_status` is not a name in that ledger.
- `ACCEPTED_HEADLESS_AUTO_ADVANCE` names three checkpoints, including `work-package::plan-prepare::context-scope-declaration`.

## Safe ground

- `createSessionFile` throws `FOLDER_OCCUPIED` when the session file is present.
- `get_activity` logs `Activity delivery cost` on one line.
