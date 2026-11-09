# W14 Validation

## Candidate

- Unit: I17:E02:W14, AC21.
- Task base: `a5435a843` (origin/i17/e02/workspace after W13 #1666).
- Task head: `42c7be3a39f15d9003a48991a2edf2e9ca930e50`, branch `i17/e02/w14-kind-registration-names-interface`.
- Component: `skills/work-planner/SKILL.md`, the opening list and the interface list after it.

## Registration

The opening list names each kind of work, the artifacts holding it and the interface operations each artifact supplies. The interface list names each operation once with the general contract it fills:

| Operation | General contract |
| --- | --- |
| Release Hold | Deliver Mode, Requested Hold Release |
| Record Dispatch Status | Board Delivery, Record Dispatch Status |
| Record Delivery | Issue Delivery |
| Record Merge | Task Merge |
| Settle Board Status | Board Delivery, Status Changes |
| Populate Body | Issue Body, Body |
| Review Before Merge | Agent Review, Produce Agent Review |

A kind's operation takes the interface name with the kind's name after its verb, the form the existing Settle Hot-fix Board Status and Populate Standalone Body headings already take.

## Reader Observation

[registration-reader.py](registration-reader.py) reads the registration from SKILL.md, resolves every artifact and contract link against the checkout, and checks each kind's operation is a registered one. Six kinds, seven operations, every link resolves, no failures ([registration.log](registration.log)).

It also derives each kind operation's heading by the naming rule. Present today: Populate Initiative Issue Body, Populate Epic Issue Body, Populate Standalone Body, Settle Hot-fix Board Status. Not yet in their artifact: the five remaining hot-fix operations and Populate Hot-fix Body, which W20 and W21 add under these names. Both rows depend on W14.

## Document Readers

- Focused: `test_documents` (13), `test_checkouts` (10) and `test_modes` (4) pass ([focused.log](focused.log)). `test_every_operation_and_protocol_is_reached` reads SKILL.md's links.
- Planner: 1039 tests, one opt-in live-link skip ([planner.log](planner.log)), including the installed document and model checks.
- Shared: 280 pass ([shared.log](shared.log)).
- Skill checker: 59 files, zero findings ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test -p test_documents.py -v      # skills/work-planner
python3 -m unittest discover -s test -p test_checkouts.py -v      # skills/work-planner
python3 -m unittest discover -s test -p test_modes.py -v          # skills/work-planner
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
python3 registration-reader.py skills/work-planner                # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```

## Current Base

The epic base moved to `a5951a316` (W17 #1667, W19 #1670, W15+W16 #1671), merged into the branch at `cc138db0d1bf745632beaebddc1206f8d491b42d`, the head #1668 merged at (`01f84933a`). The same checks at that head:

- Planner: 1059 tests, one opt-in live-link skip ([planner-merged.log](planner-merged.log)).
- Shared: 280 pass ([shared-merged.log](shared-merged.log)).
- Skill checker: 59 files, zero findings ([skill-check-merged.log](skill-check-merged.log)).
- Registration reader: six kinds, seven operations, no failures ([registration-merged.log](registration-merged.log)).
- Whitespace: zero findings.

## Limits

General callers still link to the hot-fix artifact directly; W22–W45 move each to the registration. The reader checks names and links, not that a kind operation's contract matches the general one; AC27 and AC28 observe that.
