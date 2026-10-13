# Findings

Every departure the alignment of I13, I14 and I15 found, by area, with the measurement behind it. A finding carrying a resolution names where it was taken. At the close of the pass `format.py` reports nothing on any of the eighteen issues, and `deps.py` reports no problem on any of the three initiatives.

## Issue bodies

| Finding | Measurement | Resolution |
| --- | --- | --- |
| I14's table ticked E03 Done while #707 is open | `sync.py` initiative sync reports `cleared: E03` | Patched #1380 |
| I14 AC7 and AC8 were ticked while E03 is undelivered | `sync.py` reported both `ticked early` | Unticked |
| I13 criteria restated single epic criteria | Seven of ten were near-verbatim: AC1 and AC2 from #948 AC4 and AC6, AC4 and AC5 from #1138 AC8 and AC10, AC6 and AC7 from #1116 AC1 and AC2, AC9 from #948 AC9. I14 AC7, AC8 and AC13 each stand above several epic criteria and are not duplicates | Raised to seven criteria stating what the epics achieve together, with Coverage remapped |
| References linked issues on the same board | #1380 cited #637, #638, #652, #678, #947; #707 cited #637, #638; #708 cited #652, #678, #947 | Removed; #708 and #1380 cite the replan record in their place |
| No reference carries the Source marker | None of the three initiatives marks a reference `**Source.**` | Left unmarked: every reference is background, and each criterion stands on the instrument it names |

## Work breakdowns

| Finding | Measurement | Resolution |
| --- | --- | --- |
| Three rows covered no criterion | `format.py` reported `Coverage does not name the criteria it delivers` for #1138 W09, #707 W05, #708 W08 | Each epic gained a criterion for the test the row adds, cited from that row |
| Two of those Descriptions overran eight words | #1138 W09 ran to 9, #707 W05 to 11 | Shortened |
| Twelve rows were unmet | `sync.py` reported `unmet` for #1138 W02–W04, #708 W01–W02, #710 W02–W03, #750 W04, #1242 W01 | Verified against each epic base. #710's three ticked on the walks; #1138's three ticked once narrowed to the inputs each workflow declares; the rest left unticked with the measurement recorded |
| I15 E02 ticked AC2 and AC3 that do not hold | `converted-gates` against the paired E02 bases reports 29 steps still carrying a structured `condition`: 21 in `work-package`, 6 in `workflow-authoring`, 1 in `workflow-design`, plus a missing `midnight-system-review/activities/07-verdict-and-report.yaml` | Both unticked, AC12 restated as the outcome, AC15 added for the harness, W05 added to convert the 29 |
| Two rows linked another epic's pull request | #707 W01 and W02 both linked #723, titled `[I05:E02]`, which the closed #737 W02 also claims | Both rows cite commit `dbb69ddc`; sync reports no conflict |
| Two rows omitted their task issues | #948 W04 and W05 carried bare ids while #1274 and #1275 exist | Both rows now link their issue |
| Test-plan disagreements | `sync.py` reports `covered and no test observes it` for #1146 W01 on AC6 and AC7 | Open; #1138 W09 is the row that adds those tests |

## Dependencies

| Finding | Measurement | Resolution |
| --- | --- | --- |
| One backward reference | `deps.py` reported `E04:W01: depends on later epic E07:W01` in I14 | Resolved by moving the guard-imports work into E04, which owns its inputs. E07 keeps the pinned-paths and verify-gate rows |
| Sixteen redundant edges | `deps.py` reported `already implied` eight times in I13 E01 W08, once in I13 E03 W11, twice in I14 E03 W04, five times across I15 E01 W06, E02 W06 and E03 W04 | Corrected; `deps.py` reports none |
| Joins unfinished | `deps.py` reported 74 eligible unjoined pairs in I13, 38 in I14 and 19 in I15 | Named in [Separate deliveries](joins.md) |
| Six advisory numbering gaps | `deps.py` advisory section, two in I13 and four in I14 | Open; advisory, and the pinning rule blocks the renumber that would close them |

## Numbering

I14 E04 W01 depended on I14 E07 W01, the guard-imports task, and the dependency was real: `check-role-barred-calls.ts` does not load on the E04 base. Moving Red Trunk below Missing Checks is refused, because a pull request names each of E03, E04 and E06 and work a pull request names keeps its number. The guard-imports row and its criterion sit in E04 instead.

Renumbering a criterion relabels the test plans of the pull requests that cite it. #1144 and #1145 were relabelled when I13 E01 lost its corpus-wide criterion, and #1404 when I14 E07's three were renumbered.

## Delivery

| Finding | Measurement | Resolution |
| --- | --- | --- |
| Ten review pull requests were ready, not draft | Each heads an epic base whose epic has undelivered rows | Converted to draft |
| Every epic base commit names I04 | `[I04:E09] Unspent Inputs on workflows`, `[I04:E00] Wrong Records on main`, and so on across ten bases | Left as they are; each base squash-merges, so the pull request title is what reaches the long-lived branch |
| Review bodies carried a Test Plan | All ten held T1 and T2 rows, which the review pull request rule excludes | Removed |
| Review References did not cite their task merges | #1390 named its five merges in prose only | Each now cites the record, its task merges, and the sibling base its epic's other half sits on |
| Sync reports `merged none` on every review pull request | The bases were rebuilt as one squashed commit each, so git records no task merge into them | Expected until each base merges, not a defect |
| One task pull request bypassed its epic base | #1300 targeted `workspace`; no `i14/e06/workspace` base existed | Base cut from `workspace`, #1300 retargeted, mergeable clean |
| `i14/e07/main` was empty | Zero commits ahead of `main` when the pass began | #1404 has since merged into it and draft review #1411 is open |
| Thirty-six merged pull requests link no issue | Development is empty on #701–#703, #1144–#1146, #1155, #1179–#1213 and #1281 | None owed a link: every one delivers a row that has no task issue of its own |

## Beyond the three initiatives

| Finding | Measurement | Resolution |
| --- | --- | --- |
| A closed epic showed two rows undelivered | #737 `[I05:E02]` is closed as completed with all four criteria ticked, while W01 and W03 carried no Done tick and linked nothing | Both delivered by planning records rather than pull requests: W01 by the [stage 2 dispositions](../2026-09-11-routines-remediation/stage-2-dispositions.md), twelve rows measured with the live behaviour changes named; W03 by the [structured-condition survey](../2026-10-07-750-i04-e05-w01-survey-every-structured-condition/survey.md), which dispositions `07-assumptions-review` `post-summary-review` as convert. Both rows now link their record and tick Done |
| #737 cited its own initiative | `format.py` reported R3 naming #735 on the same board | Removed; #737 reports nothing |

Row 11 of the disposition record, the per-item gate's dismissibility, was left to the owner when that record was written. The survey settled it in the convert direction, which is what makes #737 AC4 true.

## Still open

- Six advisory numbering gaps, which the pinning rule blocks.
- #1146's two test-plan disagreements, which #1138 W09 is the row to close.
- #708 AC1, AC2 and AC4, which wait on the guard-imports row now in E04.
- #1242 AC1, which needs the live two-instance walk W02 carries.
- `sync.py` reports #1287 unmatched on #1242: it merged E02's work onto `main` without an epic base.
