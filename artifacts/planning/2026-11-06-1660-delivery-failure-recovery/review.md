# Delivery Failure Recovery Integration Review

## Review Result

No blocking or nonblocking defect found in the reviewed integration diff.

- Pull request: [#1660](https://github.com/m2ux/workflow-server/pull/1660).
- Head: `ff94f4a28ee0134a10f46ba571a9795f5e6841f1`.
- Target: `workspace` at `9a924cfdda903ca64257449d8b5bf2ff762725ce`.
- Review checkout: detached and clean at the supplied head.

## Complete Diff Scope

Reviewed all seven changed files: `modes/deliver-mode.md`, `artifacts/pull-request.md`, `protocols/epic-integration.md`, both new route-test modules, `test/test_readme.py` and `test/README.md`, under `skills/work-planner/`. Read the complete target-to-head change, surrounding selected procedures and affected call sites. Reviewed Agent Review's current-evidence contract/validator and Review Pull Request's publication/handoff sequence. Catalogue reconciliation preserves both test modules and declares their actual document/script subjects.

## Draft Recovery

The initial invalid-review and post-ready failure branches converge on restoration. Restoration refreshes current metadata, writes draft only for an open ready pull request and reads back even after a failed write. An unreadable/closed state or a refused/disagreeing restoration supplies a terminal discrepancy; repair receives confirmed draft evidence. The successful path independently rechecks current review eligibility and ready state before selecting the normal merge procedure. A partially applied ready write is handled by the restoration route's fresh read rather than assumed to have left draft state.

The twelve route fixtures record operation order, use the installed review validator and include changed heads, new findings, refused draft writes, unreadable/disagreeing readbacks and both passing initial states. Their missing-restoration source mutation changes the observed failure result. These observations establish the AC1-AC3 conditions within their captured-input scope.

## Merge Owner and Callers

The task and epic mutations both submit the literal verified SHA. Raw endpoint response, readback state and classified operation result have separate documented shapes. A successful endpoint response alone establishes no confirmed merge: the owner compares merged state, head, target and merge commit before returning `confirmed-merge`.

Human handoff and harness denial terminate without an unchecked mutation/retry or success assertion. Harness denial retains the actual permission-layer refusal and supplies no invented GitHub response or user approval request. GitHub refusal includes a moved-head rejection and reaches the caller's single fresh-verification retry. Unreadable response or unknown transport outcome remains unclassified failure and cannot reach confirmation.

Epic Integration consumes these results explicitly. Each GitHub refusal withdraws readiness; fresh branch, criterion, head, target, review and check evidence precedes its sole retry. A failed refresh or second refusal terminates. Retry outcomes follow their own terminal route. Only `confirmed-merge` selects protocol-level merged-state/head/target/commit confirmation. Merge Task Pull Requests likewise obtains readiness before its first mutation and bounds its GitHub-refusal refresh.

The nineteen merge fixtures execute the documented task/epic command templates against a local `gh` double, capture the submitted SHA and exercise moving-head refusal, terminal outcomes, fresh-head retry and readback disagreements. Mutation controls cover omitted SHA and removed terminal/success guards. Their scope is bounded offline execution, with source review supplying the full contract and caller assessment.

## Permission Boundary

Reviewed the supplied active-rule snapshots. `workspace` requires one approving human review; the E04 task base has no active rules. The owning source preserves the default-branch human boundary and the required-person boundary on other targets. User authorization and actual harness capability remain separate prerequisites. Epic-base permission grants no long-lived-target capability, and the source authorizes no account substitution, administrative bypass or protection change. This integration remains a human-review handoff under the current target rules.

## Evidence and Exact Revision

- Exact integration-revision instruments: `/tmp/deliver17-20261106/e04-merged-hotfix.log` records 12 passing tests; `e04-merged-outcomes.log` records 19 passing tests. Both identify the reviewed head explicitly.
- The combined planner run records 990 tests: 989 pass, one opt-in live Development-link test skips. Its task head `bfbd05f62dff19b4af8242933e8ffcec133132e4` and this integration head both resolve to tree `453f641faccc109bcc70874f2f2d919ff24ccd24`; a direct diff is empty.
- Shared skill-checker suite: 280 passing tests. Installed skill checker: 59 files, zero findings. Integration diff whitespace check passes.
- Read both published task validation records and the two fresh-reader receipts. The readers independently derive the seven captured scenario continuations and terminal-claim boundaries at pinned committed sources. Their source definitions match those integrated here.

Offline fixtures, independent source-reading behavior and live tracker execution are distinguished throughout this review. The reader reports record recovered truncation and broad-context overhead. That existing disclosure work remains with E02; this review asserts neither a present prerequisite cycle nor context-saving or complete disclosure conformance. No tracker command, merge mutation, source edit or shared-engineering write was performed for this review.
