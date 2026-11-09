# W29 Validation

## Candidate

- Unit: I17:E02:W29, AC39.
- Task base: `01f84933a` (origin/i17/e02/workspace after W14 #1668).
- Task head: `8689b8c6ee7e86573a02c429ddd8e0fca22e8725`, branch `i17/e02/w29-agent-review-py-reaches`, current with `36c18a359` (origin/i17/e02/workspace after W30 #1672).
- Component: `skills/work-planner/scripts/agent_review.py`.

## Plan

| Branch in `check` | Registry operation |
| --- | --- |
| Record currency by `base_ref` against base SHA | `kind_of(pr)`: a pull request whose title opens with a registered kind's tag |
| Every finding fixed | `kind_of(pr)`; the finding names the selected kind |

`kinds.py` imports only `importlib` and `typing`, so `agent_review` importing it forms no cycle. API direction, git object type and finding categories are no kind cases and stay.

## Kind Search

AC39. [test_agent_review](https://github.com/m2ux/workflow-server/blob/i17/e02/w29-agent-review-py-reaches/skills/work-planner/test/test_agent_review.py) `RegisteredKind.test_it_imports_no_kind_module_and_names_no_kind` passes ([focused.log](focused.log)): the script imports `kinds`, imports no module `KINDS` maps, and names no registered kind, hot-fix or `[F00]` tag.

## Registry Tests

AC39. `RegisteredKind.test_a_registered_kind_is_selected_through_the_registry` passes ([focused.log](focused.log)): a stand-in kind registered beside the hot-fix module receives the kind finding rule (`unfixed finding on a stand-in's delivering pull request`) and branch currency (a moved target passes, a changed `base_ref` is stale); once unregistered, the same pull request is held to base SHA currency.

Both registry tests fail against the epic base script and pass at the task head.

## Unchanged Outcomes

The existing [test_agent_review](https://github.com/m2ux/workflow-server/blob/i17/e02/w29-agent-review-py-reaches/skills/work-planner/test/test_agent_review.py) (16, including every `HotFixReview` fixture), [test_hotfix_readiness](https://github.com/m2ux/workflow-server/blob/i17/e02/w29-agent-review-py-reaches/skills/work-planner/test/test_hotfix_readiness.py) (12) and [test_review_scope](https://github.com/m2ux/workflow-server/blob/i17/e02/w29-agent-review-py-reaches/skills/work-planner/test/test_review_scope.py) (14) tests keep their outcomes ([focused.log](focused.log)). The hot-fix finding message is identical. No function moved, so no duplicate-function search applies.

## Full Checks

- Planner: 1064 tests, one opt-in live-link skip, [planner.log](planner.log) (includes installed document/model and catalogue checks).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings, [whitespace.log](whitespace.log).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test -p test_agent_review.py -v       # skills/work-planner
python3 -m unittest discover -s test -p test_hotfix_readiness.py -v   # skills/work-planner
python3 -m unittest discover -s test -p test_review_scope.py -v       # skills/work-planner
python3 -m unittest discover -s test                                  # skills/work-planner
python3 -m unittest discover -s skills/test                           # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner       # checkout root
git diff --check origin/i17/e02/workspace HEAD                        # checkout root
```

## Limits

The script interface carries no review operation, so the kind finding rule and branch currency apply to every registered kind; the registration in SKILL.md names Review Before Merge as an operation hot-fix supplies.
