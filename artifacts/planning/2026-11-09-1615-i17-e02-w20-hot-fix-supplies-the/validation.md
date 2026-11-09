# W20 Validation

## Candidate

- Unit: I17:E02:W20, AC27.
- Task base: `1bb44b2bf` (origin/i17/e02/workspace after W18 #1669).
- Task head: `4c74c0131a586cc63947462f8780241f5561ba10`, branch `i17/e02/w20-hot-fix-supplies-the`.
- Component: `skills/work-planner/artifacts/hotfix.md`.

## Operations

Each name the [kind registration](https://github.com/m2ux/workflow-server/blob/i17/e02/workspace/skills/work-planner/SKILL.md) lists for Hot-fix is a `###` operation in hotfix.md, named by the registration's rule (kind name after the verb).

| Interface | Hot-fix operation | Moved from | Result |
| --- | --- | --- | --- |
| Release Hold | Release Hot-fix Hold | Deliver Mode, Hot-Fix Hold | Board Result, or refusal naming the live pull request |
| Record Dispatch Status | Record Hot-fix Dispatch Status | Unit Dispatch, New Hot-Fix Unit | Board Result from the general Confirmed Statuses |
| Record Delivery | Record Hot-fix Delivery | Issue Delivery, step 1 | Saved identity and Delivery Findings |
| Record Merge | Record Hot-fix Merge | Task Merge, step 1 (its Issue Delivery call) | Saved identity and Delivery Findings; nothing on an epic or initiative |
| Settle Board Status | Settle Hot-fix Board Status | (existing, unchanged) | Board Result |
| Review Before Merge | Review Hot-fix Before Merge | Deliver Mode, step 9 (review, readiness, restore, repair) | Review State, or Failure / held draft with open findings |

## Scope Beyond the Component

Adding the operations alone leaves each with no caller and its steps in two homes, which `test_documents` refuses (every artifact operation reached, by at least two linked uses). The steps therefore moved: each general caller now holds a single Apply of the hot-fix operation, still naming the kind. W32, W34, W35 and W36 replace those calls with registration-selected ones. SKILL.md's Hot-fix line links each operation, the second linked use. Issue Closure and board settlement stay in Task Merge, since AC46 has Task Merge reach merge record and board settlement as separate operations and an artifact cannot follow a protocol.

## Observing Tests

- `test_kind_operations` (new, 11 tests): registration names map to supplied operations with matching anchors; each operation ends by providing its result; general callers select each by its registered name and supply the contract inputs; Record Dispatch Status and Review Before Merge substitute the general operations; no moved step remains inline in the four callers. Against the base hotfix.md it fails 5 tests and errors on 19 ([focused.log](focused.log) shows the passing run).
- `test_hotfix_readiness` (12 tests) walks the readiness route in hotfix.md and confirms Deliver Mode continues to Merge only on Review State; every outcome is unchanged.
- `test_command_contracts` keeps the Sync Hot-fix Issue contract outcome.

## Full Checks

- Planner: 1078 tests, one opt-in live-link skip, [planner.log](planner.log).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings, [whitespace.log](whitespace.log).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest -v test_kind_operations test_hotfix_readiness test_command_contracts   # skills/work-planner/test
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```

## Limits

The checks pin link structure and phrases, not an agent's reading of the operations.
