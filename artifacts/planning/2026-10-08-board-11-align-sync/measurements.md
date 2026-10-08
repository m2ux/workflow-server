# Measurements

Every instrument run in the verification pass, the tips it ran against, and what it reported. The I04 tips are `i04/main` at `c2bfb89e` and `i04/workflows` at `47732727`. The long-lived tips are `main` at `9fc2a1d5` and `workflows` at `70c25ee0`.

## Standard sweep

`guards/check-all.ts --root <i04/workflows>` from `i04/main`: 62 guards, 57 pass, 5 fail, 0 unmeasured.

| Guard | Verdict |
| --- | --- |
| activity-variables | 34 findings |
| repeated-runs | 1 stale baseline entry |
| routines | 2 unread routine inputs |
| role-barred-calls | crashes at module load |
| declared-fallbacks | 4 stated fallbacks with no default |

`check-activity-variables.ts` against the long-lived tips reports 5, so 29 of the 34 are the I04 corpus.

`role-barred-calls` imports `CORE_ORCHESTRATOR_TECHNIQUES` from `src/loaders/core-ops.js`. That module exports `CORE_WORKER_TECHNIQUES`, `WORKER_CHECKPOINT_TECHNIQUES`, `FAN_ONLY_RULES` and `LOOP_ONLY_RULES`, on `i04/main` and on `main`. The guard dies before it measures anything, and `tests/role-barred-calls-guard.test.ts` collects zero tests.

`check-inherited-input-never-spent.ts` is on disk and absent from `guards/guards.ts`, so it is not in the sweep. Run directly against the I04 corpus it reports, by workflow: substrate-node-security-audit 9, work-package 5, remediate-vuln 5, prism-evaluate 5, workflow-authoring 4, meta 4, cicd-pipeline-security-audit 3, readme-links-conformance 2, prism-audit 1, plain-language 1. It reports nothing in the github, atlassian or git libraries.

## Server suite

`vitest run` from `i04/main` with `WORKFLOWS_DIR` at `i04/workflows`: 151 files, 11 failed; 2490 tests, 16 failed, 6 skipped, 344s.

| File | Failing |
| --- | --- |
| tests/batch-loop-gates.test.ts | 3 of 11 |
| tests/e2e/snapshot.test.ts | 3 of 24 |
| tests/condition-survey.test.ts | 2 of 14 |
| tests/declared-fallbacks-guard.test.ts | 2 of 13 |
| tests/gate-differential.test.ts | 1 of 4 |
| tests/converted-gates.test.ts | 1 of 3 |
| tests/e2e/walk-protocol.test.ts | 1 of 10 |
| tests/docs-drift.test.ts | 1 of 5 |
| tests/guard-corpus-required.test.ts | 1 of 58 |
| tests/e2e/all-workflows-walk.test.ts | 1 of 64 |
| tests/role-barred-calls-guard.test.ts | collects none |

`tests/batch-loop-gates.test.ts` passes 10 of 10 against the long-lived tips, where its three new assertions do not exist.

## Targeted runs

| Instrument | Tips | Result |
| --- | --- | --- |
| walks/check-walk-protocol.py | workflows | definitions hold; self-test holds |
| tests/fan-unbound-refusal.test.ts | main × workflows | 7 of 7 pass |
| tests/e2e/records.test.ts | I04 | 3 of 3 pass |
| tests/e2e/snapshot.test.ts -t review-mode | I04 | 4 of 4 pass |
| tests/batch-loop-walk.test.ts | I04 | 14 of 14 pass |
| tests/e2e/fan-walk.test.ts, tests/session-concurrency.test.ts | I04 | 21 of 21 pass |
| tests/session-index.test.ts, tests/server-owned-session-setup.test.ts, tests/session-store.test.ts | I04 | 73 of 73 pass |

## Source reads

| Claim | Where it was read |
| --- | --- |
| `operation-contract` is in the sweep and carries no exemption | `guards/guards.ts`; the registry has no exemption field |
| No dismissal language in the server | `grep -i dismiss src/` returns nothing |
| `respond_checkpoint` takes exactly one of `option_id` or `auto_advance` | `src/tools/workflow-tools.ts:2782`, `:2804`, `:2875` |
| An unnamed session takes a date and a random token | `mintUnnamedPlanningSlug`, `src/utils/session/derivation.ts:68` |
| The bootstrap composes the slug before the session opens | `corpus/meta/resources/bootstrap-protocol.md:12`, `:27` |
| `dispatch_child` declares no promotion slug | no `promot*` match in `src/` |
| AP-156 names three signals and two carve-outs, and the audit walks it | `corpus/canon/resources/anti-patterns.md:2289`; `corpus/workflow-design/techniques/audit-rule-hygiene.md:33-34` |
| The full walk runs on push and dispatch, not on a schedule | `.github/workflows/coverage-walk.yml` on `i04/main` |
