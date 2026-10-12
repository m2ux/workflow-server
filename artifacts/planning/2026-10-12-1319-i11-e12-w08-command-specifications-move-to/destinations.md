# Destinations

Each command specification the shared skill-file check reports over `skills/work-planner`, with the catalog section it stood in and the file it moves to. The destination is the file the check names, read from its report rather than chosen by hand.

The move runs in two passes, against two revisions of the check. The first is the thirty-six the check reports at `b2fb799b`. The second is the ten the symmetric caller test uncovers at `fb53546f`, each masked until then by a citation that names a command without running it.

| # | Specification | Catalog section | Destination |
| --- | --- | --- | --- |
| 1 | Fetch All Issues | Issues | `references/hoist-mode.md` |
| 2 | List Initiative Titles | Issues | stays in `references/commands.md` |
| 3 | Find Initiative Issue | Issues | `references/standup-mode.md` |
| 4 | Create Label | Issues | `references/propose-mode.md` |
| 5 | Remove Label | Issues | `references/align-mode.md` |
| 6 | Development Access | Issues | stays in `references/commands.md` |
| 7 | Capture Issue Development | Issues | `references/work-breakdown.md` |
| 8 | Check Issue Closure | Issues | `references/work-breakdown.md` |
| 9 | Close as Not Planned | Issues | `references/hoist-mode.md` |
| 10 | Fetch Source | Sources | `references/review-passes.md` |
| 11 | Fetch All Initiative Pull Requests | Pull Requests | `references/board.md` |
| 12 | Retitle Pull Request | Pull Requests | `references/sync-mode.md` |
| 13 | Fetch Pull Request Files | Pull Requests | `references/understand-mode.md` |
| 14 | Merge Pull Request | Pull Requests | `references/work-breakdown.md` |
| 15 | Create Epic Base | Pull Requests | `references/work-breakdown.md` |
| 16 | List Long-Lived Branches | Pull Requests | `references/align-mode.md` |
| 17 | Update Epic Base | Pull Requests | `references/work-breakdown.md` |
| 18 | Open Task Pull Request | Pull Requests | `references/deliver-mode.md` |
| 19 | Open Epic Pull Request | Pull Requests | `references/work-breakdown.md` |
| 20 | Fetch Merge Readiness | Pull Requests | `references/work-breakdown.md` |
| 21 | Merge Epic Pull Request | Pull Requests | `references/work-breakdown.md` |
| 22 | Find Proposals Board | Project Boards | `references/propose-mode.md` |
| 23 | Fetch Board Item | Project Boards | `references/sync-mode.md` |
| 24 | Add Issue to Board | Project Boards | `references/propose-mode.md` |
| 25 | Index Status | Graph | `references/understand-mode.md` |
| 26 | Change Surface | Graph | `references/understand-mode.md` |
| 27 | Symbol Context | Graph | `references/understand-mode.md` |
| 28 | Flow Trace | Graph | `references/understand-mode.md` |
| 29 | Renumber Epics | Scripts | `references/review-passes.md` |
| 30 | List Orphans | Scripts | `references/hoist-mode.md` |
| 31 | Match Pull Requests | Scripts | `references/sync-mode.md` |
| 32 | Tick Criteria | Scripts | `references/sync-mode.md` |
| 33 | Plan Queue | Scripts | `references/advance-mode.md` |
| 34 | Reserve Row | Scripts | `references/deliver-mode.md` |
| 35 | Release Row | Scripts | `references/deliver-mode.md` |
| 36 | Run Tests | Scripts | `references/revise-mode.md` |

## The second pass

The symmetric caller test asks of every citing file, the holding file included, whether a procedure of it carries the citation, and reads a procedure as a top-level section carrying a numbered step rather than a heading spelled `Procedure`. Ten specifications that had appeared to have several callers prove to have one. Each was masked by a citation that names a command without running it: an entry-point prose list, a Rules bullet, or a sibling specification.

| # | Specification | Catalog section | Destination |
| --- | --- | --- | --- |
| 1 | List Labels | Issues | `references/propose-mode.md` |
| 2 | Patch Pull Request Body | Pull Requests | `references/understand-mode.md` |
| 3 | Find Theme Board | Project Boards | `references/sync-mode.md` |
| 4 | Create Board | Project Boards | `references/sync-mode.md` |
| 5 | Create Proposals Board | Project Boards | `references/propose-mode.md` |
| 6 | Find Status Field | Project Boards | `references/sync-mode.md` |
| 7 | Fetch Board Items with Status | Project Boards | `references/sync-mode.md` |
| 8 | Create Task Worktree | Sessions | `references/deliver-mode.md` |
| 9 | Create Pull Request Worktree | Sessions | `references/understand-mode.md` |
| 10 | Index Repository | Graph | `references/understand-mode.md` |

## What each file receives

Both passes together, forty-four specifications across twelve files.

| Destination | Count |
| --- | --- |
| `references/work-breakdown.md` | 8 |
| `references/understand-mode.md` | 8 |
| `references/sync-mode.md` | 8 |
| `references/propose-mode.md` | 5 |
| `references/deliver-mode.md` | 4 |
| `references/hoist-mode.md` | 3 |
| `references/align-mode.md` | 2 |
| `references/review-passes.md` | 2 |
| `references/advance-mode.md` | 1 |
| `references/board.md` | 1 |
| `references/revise-mode.md` | 1 |
| `references/standup-mode.md` | 1 |

## The two named against the entry point

List Initiative Titles and Development Access were reported against `SKILL.md`, which the shared guidelines bar from holding a command of its own. Both stood in the catalog rather than moving there. Under the symmetric test neither is reported: `SKILL.md`'s Themes and Boards and Dependencies sections name the commands without running them, so List Initiative Titles has no caller and stands where it is, and Development Access is run by two procedures.

## The sections the move empties

`Sources` and `Sessions` hold nothing once their specifications leave, so neither heading remains. A heading that promises content and carries none is not a section.

## Comparison against the originals

Every specification is matched by name across the base and the head and its body compared line for line, with link targets normalised to the anchor they name so a retarget reads as a retarget and anything else reads as a difference.

| Measure | Result |
| --- | --- |
| Third-level sections at the base | 100 |
| Third-level sections at the head | 99 |
| Specifications moved | 44 |
| Specifications in place | 55 |
| Bodies differing beyond a link target | 0 |
| Bodies identical but for a retargeted link | 21 |
| Present at the base and absent at the head | 1 |
| Absent at the base and present at the head | 0 |

The base is `fb53546f`, the revision this branch merges and the one carrying the symmetric caller test. The one section absent at the head is `Execution`, which the conventions carry into `references/command-conventions.md` as a second-level heading of that file. The twenty-one retargeted bodies are the specifications whose cross-references name an anchor that has changed file.

Against `b2fb799b`, the revision this branch was cut from, the same comparison reports one further difference: the `Task Delivery` section of `references/work-breakdown.md`, which W09 rewrote for a unit that changes two long-lived branches. It arrives here by merge and is not part of this move.
