# W22 Validation

## Candidate

- Unit: I17:E02:W22, AC29.
- Task base: `01f84933a` (origin/i17/e02/workspace after W14 #1668).
- Task head: `f021b41256a4c1d13fa47b50dddafb3ea3a0ea27`, branch `i17/e02/w22-align-mode-names-no`.
- Component: `skills/work-planner/modes/align-mode.md`. The document test `test_artifact_operations_have_multiple_linked_references` counts the registration as a selection site, so an operation reached only through it stays reached.

## Plan

Each kind mention at the base, from the audit's kind search refreshed at the epic base, and what replaces it:

| Base line | Mention | Replacement |
| --- | --- | --- |
| 3 | Subjects listed as proposal, initiative, epic, task and standalone issues | Issues of any registered kind, linking the registration in SKILL.md |
| 16 | A cited open standalone issue joins the alignment | A cited open issue outside any initiative joins it |
| 28 | Validate Proposal, Initiative or Epic Body by kind | The validate operation the kind's registered body artifact supplies |
| 29 | Validate Issue Body with task or standalone field conditions | Validate Issue Body with the kind conditions the body artifact's Fields state, for a kind whose artifact supplies no validate operation |
| 59 | Check Round of Edits for proposal, task or standalone scope | Check Round of Edits for any scope other than initiative or epic |
| 70–76 | Standalone Boundary: Populate Standalone Body folds Non-Goals into Proposal | Boundary Outside an Initiative: the Populate Body operation the kind registers, for a body outside any initiative whose template has no Non-Goals |

Initiative, epic and task rows remain: they are the plan hierarchy Align's scope names, not a kind-specific branch. A capitalised Proposal names the body section, a literal.

## Kind Search and Route Checks

[align-routes.py](align-routes.py) searches Align Mode for kind names and kind-specific operations, then reads the registration in SKILL.md and resolves, for each registered kind, the validation and boundary route Align Mode selects through it, comparing each with the route the base named directly ([align-routes.log](align-routes.log)):

- Kind search: 0 matches at the head; 9 at the base.
- Validation routes match the base for all five kinds it listed; Hot-fix, now a subject, routes to Validate Issue Body with its Fields.
- Boundary route: Standalone issue selects Populate Standalone Body, as at the base. Hot-fix selects Populate Hot-fix Body, which W21 adds.
- The script registry selects the hot-fix kind from a captured `[F00]` title and no kind from epic and plain titles.

## Suites

- Document tests: 13 pass ([documents.log](documents.log)).
- Planner: 1059 tests, one opt-in live-link skip, including the hot-fix fixtures and the installed document and model checks ([planner.log](planner.log)).
- Shared: 280 pass ([shared.log](shared.log)).
- Skill checker: 59 files, zero findings ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s skills/work-planner/test -p test_documents.py -v   # checkout root
python3 -m unittest discover -s test                                               # skills/work-planner
python3 -m unittest discover -s skills/test                                        # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner                    # checkout root
python3 align-routes.py skills/work-planner <base align-mode.md>                   # checkout root
git diff --check origin/i17/e02/workspace                                          # checkout root
```

## Current Base

The epic base moved to `85e6250c5` (W30 #1672, W18 #1669, W26 #1674, W28 #1678, W20 #1680, W31 #1675), merged into the branch at `c3cd68c8f6ba319340f715e7bd29d031dde94275`. The same checks at that head:

- Planner: 1089 tests, one opt-in live-link skip ([planner-merged.log](planner-merged.log)).
- Shared: 280 pass ([shared-merged.log](shared-merged.log)).
- Skill checker: 59 files, zero findings ([skill-check-merged.log](skill-check-merged.log)).
- Kind search and route checks: zero matches, no failures ([align-routes-merged.log](align-routes-merged.log)).
- Whitespace: zero findings; the log is empty ([whitespace-merged.log](whitespace-merged.log)).
