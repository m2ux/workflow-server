# Work Breakdown guide

How the Work Breakdown tables are written, read and kept current. Issue bodies carry the tables and
nothing about them: the conventions live here.

## Tables

| Level | Columns |
| --- | --- |
| Initiative | `Epic \| Outcomes \| Depends on` |
| Epic | `Task \| Outcomes \| Depends on \| Join` |

- **Row id.** An initiative's row id is the epic, linked to its issue: `[E01](…/issues/937)`. An
  epic's row id is the task, `W01`; `W00` holds preparatory work that must land before the first
  real task. A task is a row, and gets its own `[Ixx:Eyy:Wzz]` issue only when it needs discussion
  or evidence of its own.
- **Outcomes.** What the row does, ending with what it delivers. An epic's rows cite the epic's
  acceptance criteria (`… → AC2, AC5`), so an agent working a task knows which criteria it must
  meet. An initiative's rows cite the initiative's goals (`… → G1, G3`), so each goal traces to the
  epics that serve it. Every criterion and goal is delivered by at least one row.
- **Depends on.** References only, with no prose, and only what no other entry in the cell already
  implies.
  - In an epic: what must be true before the task starts. An earlier task in the epic (`W03`,
    `W04–W09`), a task or the whole of an earlier epic (`[E01:W02](…)`, `[E01](…)`), or something
    outside the initiative (`#750`, `[I05:E00:W02](…)`).
  - In an initiative: epics only, never tasks. The other epics this epic's tasks depend on, less
    those another named epic already depends on (`[E02](…), [E04](…)`). `deps.py` derives it from
    the epic tables.
- **Join.** The tasks that can land in the same pull request as this one. Each lists the other, and
  neither depends on the other through a task outside the pair.

## Numbering

Epics are numbered in the order they run, and tasks in the order they can start, so every
dependency points to an earlier epic or an earlier task. `deps.py` reports numbering that does not
follow start order as advisory, because older initiatives predate the rule.

A task or epic keeps its number once a pull request names it, since the title is how its delivery
is found. Renumbering touches only work no pull request names yet.

## References

Tables write references with colons (`E01:W03`, `I05:E00:W02`), the form the scripts read, and link
every epic reference to its epic's issue: `[E01:W03](…/issues/937)`. Prose uses a space
(`E01 W03`).

## Delivery

- **One pull request per task,** or per set of tasks that Join each other. A task too large for one
  pull request is split into tasks.
- **Pull request titles** start with the tasks they deliver: `[I07:E00:W01] Subject`, or
  `[I07:E00:(W01,W02)] Subject`. Update mode finds delivered work by these titles.
- **A delivered task's id** links its pull request: `[W01](…/pull/950)`. An undelivered task's id is
  plain.
- **A task with its own issue** keeps its id linked to that issue. The issue records the pull
  request that delivers it, and the task is delivered when the issue is closed as completed.
- **Moved work:** when another issue takes a task, its Outcomes cell ends
  `— **moved to [#nnn](…) Wzz**` in place of its criteria. The criteria move with the task, or go
  to another row that delivers them.

## What bodies leave out

An initiative or epic body does not narrate the order work runs in, why it runs in that order, or
how the tables work. The tables state order through Depends on, and this guide states the rest.
Longest chains, ordering reviews and the reasons behind them go in the planning record.
