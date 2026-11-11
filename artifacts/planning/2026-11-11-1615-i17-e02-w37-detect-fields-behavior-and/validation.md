# W37 Validation

## Candidate

- Unit: I17:E02:W37, AC9, AC11, AC13.
- Task base: `23ef4cf2b` (origin/i17/e02/workspace after W36 #1689), brought current with `1ec2a4745` (after W40 #1690 and W41 #1691).
- Task head: `6fce88bdc`, branch `i17/e02/w37-detect-fields-behavior-and`.
- Component: the four files [w37.md](w37.md) declares. The shared checker gains the diagnostics, its test module the observing classes, a fixture the pinned prerequisite graph, and Work Planner's rules.json names the new kinds for Callable Transformations, Boundary Review and Before-use Ordering.

## Diagnostics

| Diagnostic | Selection | Result |
| --- | --- | --- |
| `executable step in Fields` | A file whose declared model names a `contracts` section | Finding: a numbered step, a numbered heading, or Apply/Follow/Run on an operation or command link. Fenced and invocation text is left to `fenced invocation in HTML model` and `invocation outside command specification`. |
| `Fields behavior candidate` | Same | Non-failing review candidate: a field whose prose has an actor (run, caller, check, delivery, dispatch, jurisdiction and other processes) or an instruction perform a behavior, and spans two kinds of behavior (acquire, write, route, transition). Each candidate names its heading line, each clause's line and kinds, and its file's operations as possible owner. Tables, fences, invocations and code spans are not read. |
| `before-use cycle` | Every checked file | Finding: a cycle in the explicit requirement graph, from `Read ... first.`/`Read ... before ...` sentences, Prerequisites links and declared cross-file preamble links. A whole-file read takes all of its requirements; a heading read takes its section's and the file introduction's. One closed witness per strongly connected set, naming each node and the line of the requirement leaving it. |

## Observing Tests

[test_check_skill_files](https://github.com/m2ux/workflow-server/blob/i17/e02/w37-detect-fields-behavior-and/skills/test/test_check_skill_files.py), 25 new tests in three classes ([focused.log](focused.log)):

- **AC9.** FieldsBoundary: the pinned Status Changes field (fbce2c7535b1) is one candidate at its heading, with the lines of its removal, Backlog transition, delivery write limit and both jurisdiction refusals as evidence and Operations as possible owner; the same prose under another heading is still the candidate; a paraphrase and a release-readiness derivation of another subject are candidates; the W02 mixed Branches and Required Criteria fields are candidates. Controls take none: an enum, a type, conditional invariants including an In Review/In Progress state constraint, a result shape, a retained value, a schema table, and the Status Changes text as fenced and code-span specimens. Behavior outside Fields and a model declaring no `contracts` take none. A candidate prints and exits 0. Numbered steps and headings and an Apply call under Fields are findings at their lines; a definition link to an operation and specimen steps are not; invocations under Fields keep their existing kinds.
- **AC11.** InstalledWorkPlannerModel: the installed graph has no cycle; SKILL.md and every mode and protocol entry reach rules.md and conventions.md; the graph's requirements are exactly the 38 audited edges: SKILL.md's two before mode selection, Revise's two whole guideline reads before the first edit, and the preamble pair of each of the ten modes and seven protocols. The installed Fields hold no executable step.
- **AC13.** BeforeUseOrdering: a self requirement, a three-document cycle and a cross-file section cycle are each reported with the exact closed witness and source line; a mode's declared preamble and a Prerequisites section close a cycle; the measured 756aaf9 inventory ([fixture](https://github.com/m2ux/workflow-server/blob/i17/e02/w37-detect-fields-behavior-and/skills/test/fixtures/prerequisites-756aaf9.json), 243 Prerequisites links of 43 documents, 242 inside the skill) yields one witness whose component is the 13 surveyed artifacts. Controls report none: an acyclic diamond, a conditional requirement with its condition retained, a bounded section read whose sibling cites back, field-reference cycles, an execution retry and mutual calls, and fenced, invocation and code-span requirements. A cycle exits 1.

## Base Control

The three classes over a `git archive 1ec2a4745 skills` export with the new test module and fixture copied in: 4 failures and 27 errors, subtests counted ([base-control.log](base-control.log)). The two that pass at the base are controls: invocations under Fields keep their existing kinds, and specimen steps are not execution.

## Calibration

[calibrate.py](calibrate.py) applies the checker's clause reader to every field body of the W02 [fields ledger](../2026-11-06-1615-i17-e02-w02-audit-ownership-fields-and/fields-ledger.json) (86df5e4c2ccc) and to the pinned [Status Changes body](status-changes-fbce2c75.txt) ([calibration.log](calibration.log)):

| W02 classification | Fields | Candidates |
| --- | --- | --- |
| shape | 489 | 0 |
| invariant | 23 | 0 |
| mixed | 6 | 2 (Branches, Required Criteria) |
| Status Changes | 1 | 1 |

The signal is conservative: no accepted field is a candidate, and four mixed fields with one behavior kind or no actor (Epic Bases, Execution Instructions, Edges, Joins) are left to the complete semantic audit. Candidate reporting makes no claim of complete semantic classification. The installed tree reports no candidate ([skill-check.log](skill-check.log)).

## Full Checks

- Planner: 1179 tests, one opt-in live-link skip ([planner.log](planner.log)), including the installed document and model checks.
- Shared: 305 pass ([shared.log](shared.log)).
- Skill checker: 60 files, zero findings, no review candidate ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).
- Other skills: workflow-canon, gitnexus and server-in-the-loop report the same 68 findings at the base and the head, none of the new kinds; they are outside this acceptance scope.

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest -v test_check_skill_files.FieldsBoundary test_check_skill_files.BeforeUseOrdering test_check_skill_files.InstalledWorkPlannerModel   # skills/test
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace                         # checkout root
python3 calibrate.py skills/scripts ../2026-11-06-1615-i17-e02-w02-audit-ownership-fields-and/fields-ledger.json status-changes-fbce2c75.txt   # this folder, skills/scripts at the head
```
