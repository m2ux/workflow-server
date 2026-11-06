# Merge Outcome Verification

## Source Snapshot

Task head: `011ef0e7c3e95aed5624aaa90b3b9436520466a3`.

- Task branch: `i17/e04/w02-explicit-merge-outcomes-and`; base: `i17/e04/workspace` at `9a924cfdda903ca64257449d8b5bf2ff762725ce`.
- Published candidate head: `011ef0e7c3e95aed5624aaa90b3b9436520466a3`; component commits: `f46261ee9` and `011ef0e7c`.
- Pull Request source blob: `0c755a1748ebc005740af7ea8e6cc8d1b68210a1`.
- Epic Integration source blob: `6713835b090f9d9d4917e9b4fed96b2591d1ea9e`.
- Merge fixture source blob: `302f3e19f8940430740cbd525014d4e318a3f06d`.

## Ordered Merge Fixtures

The focused `test_merge_outcomes.py` run passes 19 tests. These bounded offline fixtures read the installed instruction branches, record selected capabilities and terminal results, and execute both documented merge mutations against a local `gh` double. They make no tracker write or real merge and establish no live-agent behavior.

| Observed invariant | Criteria | Evidence |
| --- | --- | --- |
| Task merge starts with base update and readiness verification, then selects its mutation. | AC8 | The source-sequence fixture records `Update Epic Base`, `Fetch Merge Readiness`, `Merge Delivery Pull Request` in order. |
| Both mutation templates submit the literal verified head; a changed head yields a refusal without confirmation. | AC8 | Captured `gh` arguments contain `sha=<verified head>`; the fake endpoint rejects a different actual head. Removing the SHA binding makes the positive capture fixture fail. |
| Person review and the default-branch boundary hand off before any mutation. | AC4, AC5 | Separate fixtures record no mutation for each boundary. |
| Harness denial has no GitHub response and terminates without retry or success readback. | AC4, AC5, AC6 | Owner/caller fixtures record the refusal and a single merge-operation selection without mutation or confirmation. |
| GitHub refusal withdraws readiness; fresh branch, criteria, head, target, reviews and checks precede one retry. | AC4, AC7 | Ordered events record withdrawal, refresh, verification of the new literal head, then the second attempt. |
| Repeated refusal and failed refresh terminate; a retry's human handoff, harness denial or unknown outcome also terminates. | AC6, AC7 | Negative routes contain at most two attempts and no success readback. |
| A confirmed merge reads current metadata and compares head, target and merge commit. | AC4, AC7 | Success order includes mutation then readback; disagreements in merged state, head, target or commit produce failure. Removing terminal/success guards is rejected by negative controls. |

Exact focused output: `Ran 19 tests in 0.188s — OK`.

## Full Validation

- Work Planner: `Ran 978 tests in 44.449s — OK (skipped=1)`; the skipped test is the opt-in live Development-link test.
- Shared checker tests: `Ran 280 tests in 0.602s — OK`.
- Installed document model: `Ran 13 tests — OK`.
- Command contracts: `Ran 14 tests — OK`.
- Checkout contracts: `Ran 10 tests — OK`.
- Test catalogue: `Ran 13 tests — OK`.
- Shared skill-file check: `59 files checked, 0 findings`.
- `git diff --check` passes; a source search finds none of the retired generic refusal continuation, naked early task mutation or unbound merge command.

## Permission Review

The owning contract requires user authorization and an actual harness capability for the selected target. Epic-base authorization grants no long-lived-target permission. The default branch stays with a person, as does another target requiring a person's approving review. An agent cannot approve a pull request it opened. The contract grants no administrative bypass, protection change or alternative-account approval.

The coordinator refreshed the repository's requirements: `workspace` requires one person's approval; the task epic bases have no active rules. These facts support task delivery into the epic bases and human handoff for integration into `workspace`; they grant no wider harness capability.

## Consumer Reading Trace

- Deliver reaches the task merge owner through Merge Task Pull Requests, with current board, repository prerequisite, base and verified-head evidence. The selected mutation's linked input supplies the exact SHA; its raw response and readback have separate shapes. The caller returns terminal results and retries only a classified GitHub refusal after fresh evidence.
- Sync/Task Merge reaches Epic Integration as a whole protocol. The merge step selects the owning operation and its result contract; terminal result branches return before the success-only readback. A GitHub refusal selects withdrawal and Refresh and Validate before its sole retry.
- The same Rules, Conventions and common contracts are reused at the same source revision. The changed command and outcome branches link the selected capabilities and result shapes at use. Existing prerequisite-cycle work remains in E02.
- Readers A and B independently interpret seven captured scenarios at the pinned task heads; their [first](recovery-reader-a.md) and [second](recovery-reader-b.md) receipts confirm selected operation order and terminal-claim boundaries. The bounded fixture run remains offline execution evidence. The readers recover truncated reads and report pre-existing broad-context overhead; that disclosure limitation remains in [Skill Separation](https://github.com/m2ux/workflow-server/issues/1615), with no context-saving or complete disclosure-conformance claim.

## Plan Changes

No plan change is applied or held by this unit.
