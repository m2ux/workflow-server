# Hoist

Every orphan issue the tracker held, with the placement it took and the reason.

## Placed

| Orphan | Placement | Kept or subsumed |
| --- | --- | --- |
| 1274 gitnexus::context declares an input the tool rejects | I13:E00:W04 | kept |
| 1275 Two GitNexus group readings have no tool behind them | I13:E00:W05 | kept |
| 1344 Unbound Input Description | I13:E04:W01 | kept |
| 1370 Optional Inputs | I13:E04:W02 | kept |
| 1345 Restated Statement Home | I14:E04:W05 | kept |
| 1367 Clause Caveats | I14:E04:W06 | kept |
| 1368 Unmeasured Detects | I14:E04:W07 | kept |
| 1283 Role-Barred Guard Imports | I14:E07:W01 | kept |
| 1276 walk-protocol test reads a retired corpus workflow | I14:E07:W02 | kept |
| 1277 Both CI workflows are red on every branch | I14:E07:W03 | kept |
| 1369 Absent Join | I14:E08:W01 | kept |
| 1365 Unmeasured Reason | I14:E08:W02 | kept |
| 1333 Routine Signatures | I14:E08:W03 | kept |
| 1364 Corpus Delta | I14:E08:W04 | kept |
| 1284 Walk Record Pin | I14:E02 AC3 | subsumed |

Two epics were raised for the instrument orphans that fit none: I14:E07 Red Trunk, for a check that is red whatever the change carries, and I14:E08 Measured Reasons, for a guard whose report is not a statement about its subject. One was raised for the corpus pair: I13:E04 Described Inputs, for a description at odds with whatever reads it.

I14:E02 was reopened. Its AC1 and AC3 stand unticked and its two rows are undelivered, so the walk-record pin its AC3 already states is tracked there rather than as a row of its own.

## Left

| Orphan | Reason |
| --- | --- |
| 1257 GitHub CLI Version | A change to this host, whose source is the user's decision |

## Out of scope

Work-planner skill debt, which belongs to the work planner initiative and not to any of the three areas: 1251 review body, 1255 and 1259 development links, 1292 epic dependencies, 1347 the epic base conflict, and the cited standalone 924.

## Criteria the placements added

| Initiative | Criterion | Epic |
| --- | --- | --- |
| I13 | AC9 every declared input the operation accepts | E00 |
| I13 | AC10 a description every reader accepts | E04 |
| I14 | AC14 every required check green on its branch | E07 |
| I14 | AC15 a guard that cannot measure says so | E08 |
| I14 | AC16 a recurring class measured or recorded | E04 |

## Rows eligible to share a pull request and not joined

- **I14:E04 W05, W06 and W07.**
  Each delivers a different check over a different catalogue entry, so each lands on its own.
- **I14:E08 W01, W02, W03 and W04.**
  The sweep's unmeasured exit, one guard's reason, the routine read derivation and the audit delta command are four separate instruments.
- **I13:E04 W01 and W02.**
  The catalogue entry lives on the corpus branch and the schema prose on the engine branch, so the pair cannot share a pull request.
