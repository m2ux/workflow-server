# F14 Test Results

Branch `skill/work-kind-step-links` at 57f9e4e04, cut from `workspace` at 9d020bc9b. Commits: eb09a749e links each hot-fix operation from the step applying it and reduces Work Kind to Populate Body and Validate Body; 9c7ae2f6f links each hot-fix definition where its subject is used; 93a2ce585 writes each hot-fix step with one caller in that caller; 647cc1181 restores Deliver's named Target line; d1d5367e4 retires the kind-name check and rewrites the SOLID rules; review fix fa2f6c23f links the hot-fix Review Rule from Agent Review; 2f40605c4 drops Align's Registration links and dcad8df4f keeps only structural link checks in the Work Kind tests, and 57f9e4e04 says only a hot-fix's review record carries `base_ref`, as the user's review of #1708 asked.

## T1. Planner Suite

`cd skills/work-planner && scripts/sbx python3 -m unittest discover -s test` at 57f9e4e04: 1253 tests, OK, 1 skipped. `test_kind_operations.py` (6 tests) checks links alone: each Work Kind step links every operation the Registration lists for it and no Registration, each registered operation names its kind, each hot-fix operation has a step applying it through a link, no step applies an unlinked kind operation, and each application of Work Kind names an operation it holds. Covers AC1, AC2, AC3.

## T2. Unlinked Dispatch and Kind-Unit Grep

A grep of `artifacts`, `modes`, `protocols`, `SKILL.md` and `guidelines.md` for `Apply that operation`, `operation the|that … supplies`, `kind unit`, `#kind-units`, `Work Kind Result` and `unsupplied`: 0 lines. Each removed E02 link is back where its subject is used: `hotfix.md#branch` (delivery-branches, delivery-plan), `hotfix.md#delivery-unit` (delivery-plan, deliver-mode, unit-dispatch, dispatch-batch), `hotfix.md#board-status` (board-queue, board-status, sync-mode), `hotfix-body.md#definition` and `#titles` (placement, plan-change, pull-request), `hotfix.md#delivering-pull-request` (standup-report, pull-request-body, deliver-mode, delivery-plan) and Settle Hot-fix Board Status (hoist-mode, task-merge, board). `test_kind_operations.GeneralCallers` holds the unlinked-dispatch search as a test. No step of a mode, protocol or artifact other than Work Kind links `work-kind.md#registration`. Covers AC1, AC2.

## T3. Shared Suite and Skill-File Check

`cd skills && scripts/sbx python3 -m unittest discover -s test` at 57f9e4e04: 329 tests, OK. `KindImports` (9 tests) shows a general script importing a kind module is reported and a general file naming a kind is not; no `kind named in a general file` kind remains in `check_skill_files.py` or `rules.json`, and `structure.json` names no `registration`. `scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 65 files checked, 0 findings. Covers AC4.

## T4. Bundle Proof

Each tree was copied from git, `---\nprosiform: {}\n---\n` prepended to every `.md` lacking frontmatter, and `pf -o <dir> <ref>` run from inside the copy's `skills/work-planner`. Before is `workspace` at 9d020bc9b; after is dcad8df4f, whose bundled files 57f9e4e04 changes by one Agent Review sentence. "Settle text" means the bundle carries Settle Hot-fix Board Status's opening, "One hot-fix's board item set where".

| Reference | Before | After |
| --- | --- | --- |
| `artifacts/work-kind.md#settle-board-status` | 221276 B, every kind's artifacts through the Registration | Section removed |
| `artifacts/work-kind.md#validate-body` | 221276 B | 52580 B, no hot-fix artifact |
| `modes/align-mode.md#3-validate-the-bodies` | 227501 B | 149284 B |
| `artifacts/work-kind.md#populate-body` | 221276 B | 144404 B |
| `protocols/task-merge.md#1-kind-merge` / `#1-record-a-hot-fix` | E_RESOURCE_LIMIT at 264077 B | 252194 B, Settle text present through the step link |
| `modes/hoist-mode.md#3-settle-board-status` / `#3-settle-hot-fix-status` | 221487 B, Settle text through the Registration | 74606 B, Settle text through the step link |
| `protocols/task-merge.md` whole | E_RESOURCE_LIMIT at 263826 B; 319211 B with a raised budget | E_RESOURCE_LIMIT at fa2f6c23f, 262796 B; 311761 B with a raised budget, Settle text present |

The whole Task Merge protocol stays over pf's 256 KB default on both revisions, as it reaches Issue Delivery, Issue Closure and Review Pull Request; its hot-fix step compiles within budget. Covers AC5.

## T5. Whitespace

`git diff --check 9d020bc9b 57f9e4e04`: clean.
