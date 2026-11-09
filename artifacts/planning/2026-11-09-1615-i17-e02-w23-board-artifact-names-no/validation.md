# W23 Validation

## Candidate

- Unit: I17:E02:W23, AC30.
- Task base: `01f84933a` (origin/i17/e02/workspace after W14 #1668).
- Task head: `791f7fd00c8e040ead86008764a7ec34c984572f`, branch `i17/e02/w23-board-artifact-names-no`.
- Component: `skills/work-planner/artifacts/board.md`, its Guidance. Callers of the retired Standalone Issues anchor follow it: `artifacts/standalone-body.md` (the kind's own rule), `artifacts/agent-review.md` and `modes/deliver-mode.md` (one link each).

## Analysis and Plan

The audit's kind ledger, refreshed at the task base, holds two board.md lines, both the Standalone Issues section. Its callers: Standalone Body's Populate step, Agent Review's excluded-observation step and Deliver Mode's Arising Issues step.

| Mention | Replacement |
| --- | --- |
| `### Standalone Issues` | `### Membership`: each registered kind reaches a board through its interface operations; Settle Board Status where a kind supplies it, Status Changes for every other item, no item for a kind its own artifact keeps off every board. |
| `A standalone issue sits on no board.` | Standalone Body's `### Placement`, the kind's own artifact; its three callers link it. |

The theme and proposals board definitions (Themes, Theme Board Title, Proposals) describe the board family itself and branch on no departing kind; they stay.

## Kind Search and Route

[membership-route.py](membership-route.py) searches board.md for the departing kinds' names and title tag (`hot-?fix`, `standalone`, `[Fxx]`), resolves the Membership links, and walks every kind in the SKILL.md registration to its membership route:

- Head ([membership-route.log](membership-route.log)): zero hits; Membership links the registration and Status Changes; Hot-fix routes through Settle Hot-fix Board Status, which reaches Read Board State, Place Issue on Board and Remove Board Item; Standalone issue routes to its own Placement; Proposal, Initiative, Epic and Task take Status Changes. No failures.
- Control at the base ([membership-route-base.log](membership-route-base.log)): two hits at lines 375 and 377, no Membership section, and the standalone kind falls through to Status Changes. Five failures, exit 1.

Hot-fix fixtures keep their outcomes: `test_kinds`, `test_hotfix`, `test_hotfix_readiness`, with `test_documents`, `test_modes` and `test_board`, 118 tests pass ([focused.log](focused.log)). `test_kinds` drives the hot-fix module's `board_status` with captured issue fixtures.

## Full Checks

- Planner: 1059 tests, one opt-in live-link skip ([planner.log](planner.log)), including the installed document and model checks.
- Shared: 280 pass ([shared.log](shared.log)).
- Skill checker: 59 files, zero findings ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest test_kinds test_hotfix test_hotfix_readiness test_documents test_modes test_board -v   # skills/work-planner/test
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
python3 membership-route.py skills/work-planner                   # checkout root
git diff --check origin/i17/e02/workspace                         # checkout root
```

## Limits

The search covers the kinds that depart from the planning hierarchy. Status Changes in board-delivery.md still names kinds; W48 owns that file.

## Current Base

The epic base moved to `b49480b09` (W30, W18, W26, W28, W20, W31, W22 and W24), merged into the branch at `f48826cb26b2e2bc8339382b9341bfa1ce1e6025`. The same checks at that head:

- Planner: 1095 tests, one opt-in live-link skip ([planner-merged.log](planner-merged.log)).
- Shared: 280 pass ([shared-merged.log](shared-merged.log)).
- Skill checker: 59 files, zero findings ([skill-check-merged.log](skill-check-merged.log)).
- Kind search and route: zero hits, no failures ([membership-route-merged.log](membership-route-merged.log)).
- Whitespace: zero findings.
