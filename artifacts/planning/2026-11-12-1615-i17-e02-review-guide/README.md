# I17 E02 Review Guide

A review of E02 (#1615, merged to `workspace` by PR #1659, merge `5e62cd146`) against the workspace design principles, with a verdict on each task pull request and the remediation for each item that is not kept.

## Criteria

Each change is judged by four tests.

1. **Speculative abstraction.** A generic interface, registry, field, indirection or configuration with one implementer or one user.
2. **Lost linkage.** A step that replaced a direct link to the specific content it applies with general wording that links it no longer, or only through a registry list. Prosiform bundles a procedure with the local closure of the links in its selected content. Content reached only through a registry either drops out of the bundle or drags every listed file in with it.
3. **Prohibition instead of removal.** A check, test guard or prose warning that polices an overlap or forbids naming something, where removing the second path removes the need for it. This includes tests that copy skill sentences or interpret steps, which make each prose edit a test edit.
4. **Earned.** The change removed duplication, gave a rule one home, or fixed a defect, and has several real users.

## Settled: Work Kind

E02 made Work Kind (`artifacts/work-kind.md`) an interface of eight operations and five shared definitions. Six of the operations and all five definitions have one implementer, Hot-fix. Only Populate Body and Validate Body are supplied by several kinds. A step reached the hot-fix version only through Registration. A test bundle of `work-kind.md#settle-board-status` came to 221 KB against pf's 256 KB default output budget, because Registration links every kind's files.

**Decision: partial revert, delivered as hot-fix F14.**

- **Hot-fix-only operations and definitions.** General callers link them directly where they apply.
- **Work Kind.** It keeps Registration plus Populate Body and Validate Body. Each step links each supplying kind's operation by name.
- **The "kind named in a general file" rule.** It is retired from `check_skill_files.py`, along with its test-guard copies (`kind_mentions` in test_board_queue, test_progress, test_statuses, test_board_status, and `Mentions` in test_kinds).
- **W01's kind bullets in `guidelines.md`.** These are Kind extension, Interface operations, General dependencies and Kind registration. They are rewritten to match.
- **The deliver error message.** c4468680e made it vaguer to satisfy the rule; its specific message is restored.
- **Body-operation steps that link nothing.** At align-mode.md:28, Validate Body is linked. At align-mode.md:74, deliver-mode.md:260 and hoist-mode.md:101, Populate Standalone Body is linked directly. At hoist-mode.md:115, Populate Body is linked.
- **`scripts/kinds.py` and its Kind interface stay.** At `5e62cd146` it declares 11 operations, all implemented only by `hotfix.py`. Routing every script call through `interface(kind)` while the registry exists keeps one path per job.

## Verdicts

Line numbers are as of `5e62cd146`.

| PR | Row | Change | Verdict | Criteria |
|---|---|---|---|---|
| #1656 | W01 | SOLID section in guidelines.md and 19 rules.json ids | Partial revert | 4, 1, 3 |
| #1663 | W11 | Advance step 6 saves, reads back and recomputes before writing | Keep prose, simplify test | 4, 3 |
| #1664 | W12 | Diagram readability target | Keep prose, simplify test | 3 |
| #1666 | W13 | Review Scope: unrelated problems become arising issues | Keep prose, simplify test | 4, 3 |
| #1667 | W17 | `board.py` owns `tags`, `is_initiative` and reuses sync helpers | Keep | 4 |
| #1668 | W14 | Kind registration names the interface | Covered by F14 | 1 |
| #1669 | W18 | Dependency-graph behaviour leaves Fields; Unresolvable Entries | Keep prose, simplify test | 4, 3 |
| #1670 | W19 | Required Criteria evaluation moves to step 4 | Keep prose, simplify test | 4, 3 |
| #1671 | W15 | Script registry `kinds.py` | Keep (decision) | 1 |
| #1672 | W30 | dispatch.py names no kind | Keep | — |
| #1673 | W29 | agent_review.py reaches kinds | Keep (superseded by W40) | — |
| #1674 | W26 | sync.py reaches kinds | Keep | — |
| #1675 | W31 | orphans.py reaches kinds | Keep | — |
| #1677 | W23 | Standalone placement to standalone-body.md; board Membership | Keep; Membership covered by F14 | 4, 2 |
| #1678 | W28 | format.py reaches kinds | Keep | 4 |
| #1679 | W22 | Align mode names no kind | Covered by F14 | 2, 1 |
| #1680 | W20 | Hot-fix supplies its operations, linked directly | Keep | 4 |
| #1682 | W21 | Hot-fix body owns Populate | Keep | 4 |
| #1683 | W24 | deliver.py reaches kinds | Keep | 4 |
| #1684 | W32 | Component lists `branch:path` files | Keep, simplify parser | 4, 1 |
| #1685 | W35 | General artifacts name no kind | Covered by F14 | 2 |
| #1686 | W34 | Modes and protocols reach kinds | Covered by F14 | 2, 1 |
| #1687 | W33 | Remaining scripts reach kinds | Partial revert | 4, 1, 3 |
| #1689 | W36 | Board Status artifact split out | Keep; its test guard covered by F14 | 4, 3 |
| #1690 | W40 | Kinds supply their review | Keep | 1 |
| #1691 | W41 | `PREFIX` and `PULL_REF` defined once | Keep, optional simplify | 4, 3 |
| #1692 | W37 | Three new checks in `check_skill_files.py` | Partial revert | 1, 3 |
| #1693 | W42 | Shared check rejects kind | Name rule covered by F14; import rule optional | 3 |
| #1694 | W38 | Relative worktree path resolved against the project | Keep fix, simplify test | 4, 3 |
| #1695 | W39 | `test_reading_routes.py` and its captures | Revert | 3 |

These epic-base commits are not task-PR merges:

- **Keep:** the Advance prose edits (aedd4515f, 64162e3dc, 2088c7a36).
- **Follow #1692:** the checker patches 9e979601d, 7f808022b, 42b934c1d and 903a1e651. ba2e19376 stays with the kept check.
- **Follow #1684:** the parser commits a1857d4ec, fdd105f7a and 0601d75af.
- **Covered by F14:** c4468680e.
- **Keep:** 3be03d551, 4a6539a0a, d84cdf05c, e2387cbdb and 843d452f1.
- **c55646f44 (`kinds.Tips`):** keep under the `kinds.py` decision. Its base-branch validation fix is earned.

## Remediation

Ranked most harmful first. Items covered by F14 are listed under [Settled: Work Kind](#settled-work-kind).

1. **#1692 before-use and Fields-candidate checks** (criteria 1, 3).
   - **Problem.** About 1,000 lines of checker, test and fixture find nothing on the corpus.
     - The before-use check runs a cycle detector over about seven sentences, finds no cycle, and was patched four times.
     - The Fields-candidate check is a 100-verb heuristic that fails nothing and contradicts W01's own Evidence controls.
   - **Fix.**
     - In `check_skill_files.py`, remove `requirements`, `read_span`, `before_use_*`, `behavior_clauses`, `fields_candidates` and `CANDIDATES`, with their docstring paragraphs.
     - Trim `test_check_skill_files.py`.
     - Delete `test/fixtures/prerequisites-756aaf9.json`.
     - Drop the two finding kinds from rules.json.
     - Keep "executable step in Fields".
2. **#1695 `test_reading_routes.py`** (criterion 3).
   - **Problem.** Its `CONTRACTS` table copies about 20 step-to-section links from the standup, revise and understand modes into a second home.
   - **Fix.** Delete it, `reading-captures.json` and their README rows.
3. **Tests that execute or quote prose** (criterion 3).
   - **Problem.** Each prose edit forces a test edit. The three later Advance commits show it.
   - **Fix.**
     - **#1663:** keep the `board-queue.py` capture cases; drop `walk()` and the source-mutation tests.
     - **#1694:** drop the route-execution and before-use tests from `test_unit_dispatch.py`, keeping at most the rendered-command test.
     - **#1664:** delete `test_architecture_diagrams.py` and `architecture-captures.json`.
     - **#1666:** keep the `agent_review.check` cases; drop `membership` and `observe`.
     - **#1669:** drop the sentence asserts and the Fields word ban.
     - **#1670:** drop `test_the_field_states_the_declaration_and_validation_owns_its_outcomes`.
4. **#1656 Policy Review and Boundary review** (criterion 1).
   - **Problem.** No skill file links them. They describe how to run an audit, not a rule any file follows.
   - **Fix.**
     - Delete `### Policy Review` and the Boundary review bullet from `guidelines.md`.
     - Delete `solid/matched-contexts`, `solid/evidence-controls` and `solid/boundary-review` from rules.json.
     - Cut the Before-use ordering bullet back to its principle.
5. **#1684 Component parser heuristics** (criterion 1).
   - **Problem.** The follow-up commits guess at loose prose.
   - **Fix.**
     - Make `entries()` accept only a comma-separated `branch:path` list and report anything else.
     - Drop `names_path`, `ABBREVIATION` and the bare-path branch.
   - **Nit.** The field is still named Component though it lists files.
6. **#1687 `letter()` operation** (criterion 1).
   - **Problem.** It is a Kind operation whose only use is the "F=Hot-fix" key in progress.py.
   - **Fix.** Drop it from `kinds.py` and `hotfix.py`, and write the key into progress.py. This depends on F14 removing `kind_mentions`.
7. **#1693 import rule** (criterion 3). Optional.
   - **Problem.** About 40 lines of AST checking police the use of one module.
   - **Fix.** Retire the rule, its tests and its rules.json mapping.
8. **#1691 guard tests** (criterion 3). Optional.
   - **Fix.** Drop the two AST scan tests that block a second copy of the shared patterns.

## Delivery

- **F14.** The [settled Work Kind revert](#settled-work-kind), against `workspace`.
- **F15.** Remediation items 1–8, as one hot-fix against `workspace`. It is raised once F14 merges, because item 6 depends on it.

## Coupling

- **Items 1, 2, 3 (#1694) and 4 land together.** `test_reading_routes.py` and `test_unit_dispatch.py:365` call the before-use check, and rules.json and `guidelines.md` name it. The Fields-candidate removal goes with `solid/boundary-review`.
- **Item 6 follows F14.** F14 removes the `kind_mentions` guards that keep the hot-fix key out of progress.py.
- **README rows go with their tests.** Each test removal trims its `skills/work-planner/test/README.md` rows, which `test_readme` checks.
- **Generic names stay while hot-fix is the only kind.** Some script names assume the only kind: `single` in sync.py, "unlaned" in deliver.py, and the standalone template in format.py. Accept them; adding Kind operations to generalise them would be the same speculative abstraction.
