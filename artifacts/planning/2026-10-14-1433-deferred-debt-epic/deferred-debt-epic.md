# Deferred Debt — A Final Epic of the Initiative That Deferred It

## Overview

Work Planner held the debt a theme's delivery deferred in a standing technical-debt initiative of that theme's board, with one epic per source initiative. The source initiative could then close with its own deferred work outstanding under another number, and nothing reported that the clear-up should be raised. This change holds that debt in a final epic of the initiative that deferred it, covered by a criterion of that initiative.

## Problem

- **An initiative closes with its own unfinished work held elsewhere.**
  Nothing in the source initiative's criteria named what its delivery deferred, so every epic could close, every criterion tick, and the debt its own units raised stay outstanding under another number.
- **A standing initiative is scheduled against nothing.**
  Its priority held it in Backlog until the user raised it. No criterion was unmet while it waited, so nothing reported that it should be raised.
- **The clear-up's grain was right and its home was wrong.**
  A row per deferred item, carrying the criterion that says what fixing it makes true, is the part worth keeping. What cost was that the rows hung off an initiative whose completion no other work depended on.
- **The debt epic escaped the corpus audit rule.**
  [Corpus Audit](https://github.com/m2ux/workflow-server/blob/3c0f1ff5/skills/work-planner/references/work-breakdown.md#L129) binds an epic whose tasks change workflow definitions, and a debt epic's rows routinely do. `format.py` raises the omission once an epic's pull requests reach the corpus branch, and an initiative held in Backlog never delivers, so the check never fired.

## Proposal

- **A deferred item is a row of a final epic of the initiative that deferred it.**
  The epic is that initiative's last, titled `Deferred Debt`, raised when the initiative defers its first item. Each item is a task row covering the criterion that states what fixing it makes true.
- **The initiative carries a criterion for the clear-up, and that epic's row covers it.**
  An initiative with an outstanding deferred item is not closable: its row is undelivered and its criterion unticked until the epic closes.
- **Being last is what keeps it out of the way.**
  Its number follows every other epic of the initiative, so the epics in flight are planned and delivered ahead of it, and no separate priority holds it back.
- **It delivers like any other epic.**
  It takes its bases from the long-lived branches its rows change, carries the corpus audit criterion where those rows change workflow definitions, and closes through Issue Closure.

## Work Breakdown

| Part | Description |
| --- | --- |
| Guide | State the arrangement once, in the Work Breakdown Guide, as `#### Deferred Debt`. |
| Citers | Point Plan Mode, Deliver Mode and SKILL.md at that one home, and drop the board-level debt bullet and the new-theme prerequisite. |
| Tests | A `sync.py` case for an initiative whose final epic is open, and a `format.py` case for a deferred-debt epic reaching the corpus. |
| Checks | The skill's script tests and the shared skill-file check over the changed files. |

## Changed files

- [`work-breakdown.md`](https://github.com/m2ux/workflow-server/blob/cd46693b/skills/work-planner/references/work-breakdown.md#L145-L165) — `#### Deferred Debt`, the rule's one home.
- [`plan-mode.md`](https://github.com/m2ux/workflow-server/blob/cd46693b/skills/work-planner/references/plan-mode.md#L80-L81) — the epic is raised when the initiative defers its first item.
- [`deliver-mode.md`](https://github.com/m2ux/workflow-server/blob/cd46693b/skills/work-planner/references/deliver-mode.md#L96-L98) — a non-trivial item is deferred to the initiative in hand.
- [`SKILL.md`](https://github.com/m2ux/workflow-server/blob/cd46693b/skills/work-planner/SKILL.md#L155-L157) — a new theme needs its label and its board.

## Tests

Revisions: this repository at `cd46693b`, the head of `skill/deferred-debt-epic`, cut from `workspace` at `3c0f1ff5`. Every run is `scripts/sbx` under bubblewrap, with no network.

### T1 — The skill's script tests

`python3 -m unittest discover -s test`, from `skills/work-planner`.

```text
Ran 318 tests in 6.980s

OK
```

Every script test of the skill passes on the branch head, the two cases below among them.

### T2 — The shared skill-file check

`python3 skills/scripts/check_skill_files.py skills/work-planner`

```text
28 files checked, 0 findings
```

Every link and anchor of the skill resolves, the renamed `#deferred-debt` anchor and its three citers included, and no changed file departs from the layout, placement or ordering rules.

### T3 — An open deferred-debt epic leaves its initiative unclosable

`python3 -m unittest -v test_sync.InitiativeClose`, over an initiative whose rows are a closed `[I01:E00]` and an open `[I01:E01] Deferred Debt`.

```text
test_an_open_deferred_debt_epic_leaves_the_initiative_unclosable ... ok
```

The run asserts `closable: no (undelivered E01)`, so an initiative carrying an outstanding deferred item is reported not closable, which is **AC2**.

### T4 — A deferred-debt epic reaching the corpus states the audit

`python3 -m unittest -v test_format.CorpusAudit`, over `[I01:E09] Deferred Debt` whose one pull request targets `i01/e09/workflows` and whose criteria name no canon audit.

```text
test_a_deferred_debt_epic_reaching_the_corpus_states_the_audit ... ok
```

The run asserts the review reports `no criterion is the corpus audit`, so a final epic whose rows change workflow definitions is reported for omitting it, which is **AC3**. [Decisions](decisions.md) holds why the reach check is the instrument.

### T5 — No section specifies a standing technical-debt initiative

`grep -rn "standing technical-debt|technical-debt initiative|Technical Debt initiative" skills/work-planner`

```text
exit:1
```

No match in any file of the skill, which is **AC4**. The surviving uses of the words are the delivery classification in Deliver Mode and the criterion text in the guide, both of which state the new arrangement.

### AC1 — A read

AC1 is verified by reading rather than by a run: Deliver Mode's technical-debt rule places a non-trivial item in this initiative's deferred-debt epic, and the Work Breakdown Guide's `#### Deferred Debt` states that epic is the initiative's last. It carries no test-plan row with a Test id.
