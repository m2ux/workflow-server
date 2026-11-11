# W40 Validation

## Candidate

- Unit: I17:E02:W40, AC67 and AC68.
- Task base: `23ef4cf2b` (origin/i17/e02/workspace after W36 #1689).
- Task head: `d483a2c932582a00ea5cfc8abd214c4b68d6bbdb`, branch `i17/e02/w40-kinds-supply-their-review`, current with `ac804d44a` (origin/i17/e02/workspace after W41 #1691); the change commits are `3724fabbd` and `463c1a398`, and the merge resolves the test catalogue against W41.
- Component: `skills/work-planner/scripts/kinds.py`, `scripts/hotfix.py`, `scripts/agent_review.py`, `test/test_agent_review.py`, `test/test_kinds.py`, `test/test_hotfix.py`, `test/README.md`.

## Plan

| Rule in `agent_review.check` | Owner at the task head |
| --- | --- |
| Record currency by head SHA and `base_ref` | `hotfix.review(pull).current`, reached through `interface(kind_of(pr)).review` |
| Every finding fixed | `hotfix.review(pull).finding_fault` |
| Currency by head and base SHAs, no added finding fault | `agent_review.review`, for a pull request of no registered kind |

`kinds.Review` is the operation's result: `current` maps each record field to the value it holds while the record is current, and `finding_fault` returns the fault a kind finds in a finding the general rule passes. `check` calls the fault at the position the kind rule held, so every message and its order is kept.

## Kind Interface Through the Validator

AC67. [test_agent_review](https://github.com/m2ux/workflow-server/blob/i17/e02/w40-kinds-supply-their-review/skills/work-planner/test/test_agent_review.py) `RegisteredKind.test_each_kind_supplies_its_own_currency_and_finding_rule` passes ([focused.log](focused.log)). A stand-in kind registered beside hot-fix supplies a different rule (current by head SHA alone; refuses a deferred finding with its own message): a moved base SHA and a changed `base_ref` stay current, a changed head is stale, a deferred finding returns `a stand-in defers nothing` and a fixed one passes. A hot-fix-tagged pull request in the same registry still receives the hot-fix rule, and the unregistered pull request returns to base SHA currency with no added finding fault. `test_it_imports_no_kind_module_and_names_no_kind` passes: the script names no kind.

The test fails against the epic base scripts ([base.log](base.log)): the base script returns the hot-fix message for the stand-in.

## Hot-fix Supplies the Operation

AC68. [test_kinds](https://github.com/m2ux/workflow-server/blob/i17/e02/w40-kinds-supply-their-review/skills/work-planner/test/test_kinds.py) `Substitution.test_every_registered_module_supplies_each_operation_with_its_contract` passes with `review(pull: dict) -> Review` in the interface, and `test_the_hot_fix_kind_answers_an_item_of_any_kind_with_the_contracts_result_types` checks its result types for every fixture item. [test_hotfix](https://github.com/m2ux/workflow-server/blob/i17/e02/w40-kinds-supply-their-review/skills/work-planner/test/test_hotfix.py) `Review` checks the hot-fix rule directly and `Exports` confirms the module still exports only interface names ([focused.log](focused.log)). These fail at the base scripts: `hotfix` has no `review` or `Review` ([base.log](base.log)).

Every hot-fix review fixture keeps its outcome: `HotFixReview` (3), [test_hotfix_readiness](https://github.com/m2ux/workflow-server/blob/i17/e02/w40-kinds-supply-their-review/skills/work-planner/test/test_hotfix_readiness.py) (12) and [test_review_scope](https://github.com/m2ux/workflow-server/blob/i17/e02/w40-kinds-supply-their-review/skills/work-planner/test/test_review_scope.py) (14) pass unchanged at the task head and at the base ([focused.log](focused.log), [base.log](base.log)). The hot-fix finding message is identical.

## Full Checks

- Planner: 1179 tests, one opt-in live-link skip, [planner.log](planner.log) (includes document/model and catalogue checks).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 60 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings, [whitespace.log](whitespace.log).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest test_agent_review test_kinds test_hotfix test_hotfix_readiness test_review_scope -v   # skills/work-planner/test
python3 -m unittest discover -s test                                  # skills/work-planner
python3 -m unittest discover -s skills/test                           # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner       # checkout root
git diff --check origin/i17/e02/workspace                             # checkout root
```

## Limits

[agent-review.md](https://github.com/m2ux/workflow-server/blob/i17/e02/w40-kinds-supply-their-review/skills/work-planner/artifacts/agent-review.md) still states the hot-fix rule (`base_ref` currency, every finding fixed) for any kind-tagged pull request. Hot-fix is the only registered kind, so the statement holds; a second kind with its own rule would revise it.

## Merge

[#1690](https://github.com/m2ux/workflow-server/pull/1690) merged into `i17/e02/workspace` at `1ec2a4745a6e685d906dfd488775ffd939028b0b` from head `d483a2c932582a00ea5cfc8abd214c4b68d6bbdb`, current with W41's merge `ac804d44a`. Epic #1615 links W40 to #1690 and ticks AC67 and AC68 ([sync.log](sync.log)); review #1659 carries Review Kinds, T29 and R27.

## Change List

- Applied: the W40 work item declares one further file, test/README.md (catalogue description and counts). No row, criterion or dependency changed.
- Held: none. Arising issues: none.
