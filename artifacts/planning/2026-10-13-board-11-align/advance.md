# Advance

The Mechanical board's queue after the alignment, with the sync that preceded it.

## Sync

Four of the five open initiatives were already current. Instrument Debt was not, in two ways.

| Finding | Measurement | Resolution |
| --- | --- | --- |
| Four open I14 issues sat off the board | `[I14:E09]` #1417, `[I14:E07:W04]` #1415, `[I14:E07:W05]` #1414 and `[I14:E04:W09]` #1405 appear in the repository's open issues and in no board item | All four are on the board, E09 and its siblings at the Status their epic gives them |
| Six task rows of Ready and In Progress epics sat in Backlog with no assignee | `board.py` reported `Backlog → Ready` for #1333, #1345, #1364, #1367, #1368 and #1369 | Set Ready and assigned; each write confirmed by reading its item back |

`board.py` reports the board current for I00, I12, I13, I14 and I15.

## Queue

`advance.py` printed no `order` line and no `ask` line: every open initiative already carried a priority. Corpus Debt carried the number below the two initiatives that wait on it, and the user raised it to join them.

| Initiative | Priority | Status | Why |
| --- | --- | --- | --- |
| [I13] Corpus Debt | 2 | In Progress | The highest set |
| [I14] Instrument Debt | 2 | In Progress | The highest set |
| [I15] Server Debt | 2 | In Progress | The highest set |
| [I00] Workflow Runner | 1 | Ready | The next set |
| [I12] Multi-Root Corpus | none | Backlog | No priority label |

- **The raise.**
  At priority 1, I13 would drop to Ready the moment #1387, #1388, #1389 and #1390 merged, stopping the corpus work that I14 and I15 wait on. At 2 it runs alongside them, and E04 Described Inputs moved to Ready with it.
- **Next.**
  I13's Ready epics are E03 Unproduced Reads and E04 Described Inputs. I14's are E05 Merge Gate, E08 Measured Reasons and E09 Green Integration. I15 has none: all three of its epics are partly delivered.
- **E05 Library Inputs stays in Backlog.**
  Its prerequisites do not hold. W01 to W03 depend on `[E01:W01]` and W04 on `[I14:E04:W02]`, neither delivered, so the epic is not next.

## Labels

Two label readings stand outside the Priorities rule and change nothing the queue does:

- #527 carries `priority: 1` and `priority: highest`. Only the integer is read. I13's raise replaced its label rather than adding a second, so the initiative carries one.
- #707, #708 and #710 are epics carrying `priority: high` and `priority: medium`. A priority label belongs to an initiative.
