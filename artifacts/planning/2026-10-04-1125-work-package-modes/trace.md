# Trace — proposal 1125 onto I10 E06

The proposal's clauses are the scope. Initiative criteria AC16–AC22 are the ones this epic adds. AC15 stays the tip-validation ledger of the criteria E05 records. E06 does not cite AC15, and E06's walks are the instruments of AC16–AC20.

| Clause | Initiative | Epic |
| --- | --- | --- |
| An operator can start implement, review, and remediate | AC16 | AC2 |
| A worker on one run is sent no step of another mode | AC17 | AC3, AC4 |
| A remediate push reaches only a private remote | AC19 | AC5 |
| That push waits for a confirmation that names the remote | AC20 | AC10 |
| The combined workflow remains startable | AC18 | AC1, AC13 |
| Shared routines, techniques, and templates have one home | AC21 | AC6 |
| Each mode declares only the variables it reads or writes | AC22 | AC11 |
| A verifiable sequence is a routine | Left to the epic | Proposal: library routines |
| A phase of one judgment is a technique step | Left to the epic | Proposal: one technique step |

The two rows left to the epic are the method of this one epic. An initiative criterion that restated them would duplicate the epic.

## Chains

The longest chain is five steps, and it starts at E05 W01:

- E05 W01, E06 W01, E06 W02, E06 W03, E06 W05

## Decisions

| Decision | Where it is resolved |
| --- | --- |
| E06 starts after E05, so the mode rewrite follows the tip validation of the streamline epics | Initiative row Depends on E05; W01 depends on E05 |
| AC15's ledger is the criteria E05 records | This table |
| The mode-variable guard is work inside W02 | Epic AC11 |
| Implement, review, and remediate declare neither `is_review_mode` nor `stealth_mode`. Review is the review workflow. Remediate is the remediate workflow. Legacy declares both | Plan variables section; epic AC12 |
| A walk that can send the workflow back is part of the task that writes it | Epic rows W01, W03, W04, W05 |
| W03 joins W04. W04 and W05 do not share a pull request: W05 depends on W03, and W03 joins W04 | Epic Joins cells; work.md |
