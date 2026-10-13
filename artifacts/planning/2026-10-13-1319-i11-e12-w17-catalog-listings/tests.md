# Tests — I11:E12:W17

The catalog's listings are prose, so the criterion is read rather than executed. Two of the three checks are executions that guard the read: the rule that finds a specification must still find every one of them, and the skill's own suites must stay green.

## T1 — The listings name what runs their operations

A read of the catalog's second-level headings at `dbbbb249`:

```text
## GitHub Issues
## GitHub Pull Requests
## GitHub Project Boards
## Git
## Planning records
## Graph
## Scripts
```

Three listings name GitHub and hold the fifteen operations whose command is `gh`, together with `Development Access`, which reaches the same field through whatever tool is available, and `Fetch Pull Request Issue Links`, which reads what that access returns. `Git` holds `List Epic Bases` and `Update Task Branch`, the two operations whose command is `git`, which stood under Pull Requests while that listing was named for its subject.

**Pass.** AC20 holds.

## T2 — Every specification is still visible to the placement rule

`specifications()` yields a third-level heading only. A listing nested over its operations would push them to the fourth level, where the rule would count the group headings as the specifications and lose the operations beneath them:

```text
nested under GitHub    3 specifications seen: Issues, Pull Requests, Check Format
flat under GitHub      4 specifications seen: Fetch Issue, Patch Body, Fetch Pull Request, Check Format
```

That is why the tool is named in each listing's own heading rather than in a layer above it. Measured over the catalog before and after the change:

```text
before: 29 specifications
after:  29 specifications
lost:   []
gained: []
```

**Pass.** The same twenty-nine specifications are read, and no heading changed level.

## T3 — The check and the suites are green

```text
57 files checked, 0 findings
366 passed, 1 warning, 24 subtests passed in 7.09s
```

`check_skill_files.py` over `skills/work-planner` and `skills/workflow-canon`, then `pytest` over `skills/work-planner/test` and `skills/test`.

**Pass.** No link is left unresolved by the renamed headings, which is the fault a heading change would most likely cause.

## What the diff carries

One file, 22 insertions and 20 deletions. Three heading renames and one listing added; every specification body is byte-identical, each having moved whole or not at all.
