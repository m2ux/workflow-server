# W34 Validation

## Candidate

- Unit: I17:E02:W34, AC64.
- Task base: `f0139228e` (origin/i17/e02/workspace after W32 #1684), brought current with `3aed043cb` (W35 #1685).
- Task head: `fe6f67b4118278e0b7ac462bc19148818a0028e2`, branch `i17/e02/w34-modes-and-protocols-reach`.
- Component: the six general callers, Hot-fix Body (which takes the target-confirmation rule Hoist Mode stated inline), and the tests and catalogue the checks need, as [w34.md](w34.md) declares.

## Plan

Each kind mention at the base and what replaces it. Initiative, epic and task remain: they are the plan hierarchy the general route delivers. A capitalised Proposal names the body section, a literal.

| File | Base mention | Replacement |
| --- | --- | --- |
| deliver-mode.md | Hot-Fix Hold: Release Hot-fix Hold | Kind Unit Hold: the Release Hold operation the registered kind supplies |
| deliver-mode.md | Confirm the Reservation: a hot-fix's Delivery Unit hold | The hold the artifact of a kind unit's registered kind defines |
| deliver-mode.md | A hot-fix unit's pull request opens as a draft | Removed: the create command Publish Pull Request runs opens a draft for a kind supplying Review Before Merge (W35) |
| deliver-mode.md | Fix the Debt: "including a hot-fix"; review step for a hot-fix unit | A unit of any kind; the review step for a kind supplying Review Before Merge |
| deliver-mode.md | 9. Review a Hot-Fix: Review Hot-fix Before Merge | 9. Review Before Merge: the operation the unit's registered kind supplies |
| deliver-mode.md | Arising issues saved as standalone, following standalone Placement | The Populate Body operation of the registered kind for work outside any initiative, then Save Tracker Issue |
| hoist-mode.md | Summary, outcomes: standalone issues, made a hot-fix | Orphan issues; made an issue of another registered kind |
| hoist-mode.md | Placement Options: hot-fix Definition and target rule inline | A registered kind the Placement Record lists, meeting its artifacts' definition and placement fields; the default-branch rule moves to Hot-fix Body's Target |
| hoist-mode.md | Hot-Fix Destination: hot-fix prefix, Titles, number, disposition Kept | Registered Kind Destination: a numbered prefix and labels its body artifact's Titles give, the disposition Disposition Conditions give |
| hoist-mode.md | Initiative, Hot-Fix and Standalone Body branches | One selection of the Populate Body operation the destination's registered kind supplies |
| hoist-mode.md | Save labels, Settle Hot-fix Status, saved board item | The kind's Titles labels; Settle Board Status the kind supplies; any settled board item |
| unit-dispatch.md | Hot-fix declared-file context; Hot-Fix Unit, New, Retained, Confirmed | Kind Unit branches; the Record Dispatch Status operation the kind supplies |
| issue-delivery.md | 1. Hot-Fix: Record Hot-fix Delivery | 1. Kind Delivery: the Record Delivery operation the kind supplies |
| task-merge.md | 1. Record a Hot-Fix: Record Hot-fix Merge, Settle Hot-fix Board Status | 1. Kind Merge: the Record Merge and Settle Board Status operations the kind supplies |
| issue-closure.md | For a task or a hot-fix | For a task, or an issue whose kind supplies Record Merge |

Kind-unit wording links the [Kind Units](https://github.com/m2ux/workflow-server/blob/i17/e02/workspace/skills/work-planner/artifacts/delivery-plan.md#kind-units) definition W35 published.

## Kind Search and Route Checks

[w34-routes.py](w34-routes.py) searches the six files for kind names and links to a kind artifact outside the plan hierarchy, then reads the registration in SKILL.md and resolves each interface operation the files select, with the inputs the selecting line supplies, to the operation each registering kind's artifact supplies ([w34-routes.log](w34-routes.log)):

- Kind search: 0 matches at the head; 70 at the base (46 kind names, 24 kind-artifact links).
- Release Hold, Record Dispatch Status, Record Delivery, Record Merge, Settle Board Status and Review Before Merge resolve to the Hot-fix operations with the inputs the base passed; Populate Body resolves for Initiative, Epic, Standalone issue and Hot-fix.
- The script registry selects the hot-fix kind from a captured `[F00]` title and no kind from epic and plain titles.

[test_kind_operations](https://github.com/m2ux/workflow-server/blob/i17/e02/w34-modes-and-protocols-reach/skills/work-planner/test/test_kind_operations.py) holds the same checks as tests: the kind search and its recognition controls, each selection naming a registered interface, each selected operation resolving for every registering kind, the general contracts resolving, and each caller's contract inputs ([kind-operations.log](kind-operations.log), 20 pass). The document tests count a registration selection as a linked use and as reach ([documents.log](documents.log), 13 pass). The hot-fix readiness fixtures walk Review Hot-fix Before Merge to the caller's merge step through the registration and keep their outcomes.

## Suites

At the head current with the epic base:

- Planner: 1115 tests, one opt-in live-link skip, including the hot-fix fixtures and the installed document and model checks ([planner.log](planner.log)).
- Shared: 280 pass ([shared.log](shared.log)).
- Skill checker: 59 files, zero findings ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test                                                 # skills/work-planner
python3 -m unittest discover -s test -p test_documents.py -v                         # skills/work-planner
python3 -m unittest discover -s test -p test_kind_operations.py -v                   # skills/work-planner
python3 -m unittest discover -s skills/test                                          # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner                      # checkout root
python3 w34-routes.py skills/work-planner <directory of the six base files>          # checkout root
git diff --check origin/i17/e02/workspace                                            # checkout root
```
