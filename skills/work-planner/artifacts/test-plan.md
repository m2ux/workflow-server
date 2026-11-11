# Test Plan

The checks a task pull request's body records against the criteria they observe, the evidence of each result, and when the plan has passed. [testplan](../scripts/testplan.py) implements reading the plan into rows, whether it has passed and the criteria it claims.

## Commands

### Check Test Plan

Check one pull request's Test Plan section against [Plan Table](#plan-table) and provide [Plan Finding](#plan-finding "●") to the requester.

Exit 1 means the section is absent or unreadable.

<big><pre>
[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx python3 [**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/testplan.py '[**&lt;pull-request-json-file&gt;**](#pull-request-record "○")'
</pre></big>

## Fields

### Plan Table

A task pull request carries a Test Plan section, which contains only one table, with columns Test, Description, Coverage and Pass, in that order.

- The table holds one row per check, in execution order, followed by any unobserved criteria.
- A body with no such section, or with a section that departs from this table, has an unreadable plan.

### Plan Columns

- Test names the id.
- Description briefly names the check.
- Coverage names the criteria the check observes, `AC1, AC3`, and is empty when the check observes none.
- A row whose Test cell is empty names a criterion no check observes, and its Pass cell is empty.
- Pass is empty while a check awaits a result. A recorded result uses ✓ when the check ran and held, or an accurate label such as Partial, Fail or Not run.

### Result Evidence

- Test procedures, tested revisions, observations, limitations and supporting evidence belong in the work's published planning document.
- Each recorded result in Pass links to its relevant section in that document, using the result as link text: `[✓](URL#check)` or `[Partial](URL#check)`.
- Each evidence link is accessible to the pull request's readers and resolves to the intended section.

### Unresolved Evidence

The result evidence links that do not resolve as [Result Evidence](#result-evidence) requires, each with the Test id of the result it supports.

### Passed Plan

The test plan has passed when every row with a Test id carries ✓ as its result, linked to its evidence as [Result Evidence](#result-evidence) states. A ✓ with no evidence link, and a partial, failed or unexecuted check, remain incomplete.

### Pull Request Record

One pull request's supplied current REST JSON record, alone in its file. eg `pr-950.json`

### Plan Finding

The pull request's URL and `unreadable test plan` when its Test Plan section is absent or unreadable; nothing when it is readable. eg `https://github.com/o/r/pull/950: unreadable test plan`

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.
