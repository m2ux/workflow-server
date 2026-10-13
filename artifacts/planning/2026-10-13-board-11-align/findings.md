# Findings

Every departure the alignment of I13, I14 and I15 found, by area, with the measurement behind it. A finding carrying a resolution names where it was taken.

## Issue bodies

| Finding | Measurement | Resolution |
| --- | --- | --- |
| I14's table ticked E03 Done while #707 is open | `sync.py` initiative sync reports `cleared: E03` | Patched #1380 |
| I14 AC7 and AC8 are ticked while E03 is undelivered | `sync.py` reports both `ticked early` | Unticked |
| I13 criteria restate single epic criteria | Seven of ten were near-verbatim: AC1 and AC2 from #948 AC4 and AC6, AC4 and AC5 from #1138 AC8 and AC10, AC6 and AC7 from #1116 AC1 and AC2, AC9 from #948 AC9. I14 AC7, AC8 and AC13 each stand above several epic criteria and are not duplicates | Raised to seven criteria stating what the epics achieve together, with Coverage remapped |
| References link issues on the same board | #1380 cited #637, #638, #652, #678, #947; #707 cited #637, #638; #708 cited #652, #678, #947 | Removed; #708 and #1380 cite the replan record in their place |
| No reference carries the Source marker | None of the three initiatives marks a reference `**Source.**`, so no criterion answers to a document | Open |

## Work breakdowns

| Finding | Measurement | Resolution |
| --- | --- | --- |
| Three rows cover no criterion | `format.py` reported `Coverage does not name the criteria it delivers` for #1138 W09, #707 W05, #708 W08 | Each epic gained a criterion for the test the row adds, cited from that row |
| Two of those Descriptions overran eight words | #1138 W09 ran to 9, #707 W05 to 11 | Shortened |
| Twelve rows are unmet | `sync.py` reports `unmet` for #1138 W02–W04, #708 W01–W02, #710 W02–W03, #750 W04, #1242 W01 | Verified against each epic base; #710's three ticked, the other nine left unticked with the measurement recorded |
| Eight test-plan disagreements | `sync.py` reports `covered and no test observes it` for #1146, #1208, #1209, #723 | Open for #1146, #1208 and #1209; #723's six are the two rows below |
| Two rows link another epic's pull request | #707 W01 and W02 both link #723, titled `[I05:E02]` | Open |

## Dependencies

| Finding | Measurement | Resolution |
| --- | --- | --- |
| One backward reference | `deps.py` reports `E04:W01: depends on later epic E07:W01` in I14 | Open; the edge is sound and the renumber is refused, see Numbering |
| Sixteen redundant edges | `deps.py` reported `already implied` eight times in I13 E01 W08, once in I13 E03 W11, twice in I14 E03 W04, five times across I15 E01 W06, E02 W06 and E03 W04 | Corrected; `deps.py` now reports none |
| Joins unfinished | `deps.py` reports 74 eligible unjoined pairs in I13, 38 in I14 and 19 in I15 | Named in [Separate deliveries](joins.md) |
| Six advisory numbering gaps | `deps.py` advisory section, two in I13 and four in I14 | Open |

## Numbering

I14 E04 W01 depends on I14 E07 W01, the guard-imports task, and the dependency is real: `check-role-barred-calls.ts` does not load on the E04 base. Moving Red Trunk below Missing Checks is refused, because a pull request names each of E03, E04 and E06 and work a pull request names keeps its number. The edge stays and the numbering disagrees with it.

## Delivery

| Finding | Measurement | Resolution |
| --- | --- | --- |
| Ten review pull requests were ready, not draft | Each heads an epic base whose epic has undelivered rows | Converted to draft |
| Every epic base commit names I04 | `[I04:E09] Unspent Inputs on workflows`, `[I04:E00] Wrong Records on main`, `[I04:E03] Worker Continuation on main`, and so on across ten bases | Open |
| Review bodies carried a Test Plan | #1381, #1382, #1383, #1387–#1390, #1397–#1399 each held T1 and T2 rows, which the review pull request rule excludes | Removed from all ten |
| Review References did not cite their task merges | #1390 named #1203, #1207, #1210, #1212 and #1213 in prose; its References cited the branch-separation record alone | Each now cites the record, its task merges, and the sibling base its epic's other half sits on |
| One task pull request bypasses its epic base | #1300 targets `workspace`; no `i14/e06/workspace` base exists | Open |
| One empty base | `i14/e07/main` is zero commits ahead of `main` | Open |
| Thirty-one merged pull requests link no issue | Development is empty on #701–#703, #1144–#1146, #1155, #1183–#1213 as listed by the link fetch | Open |
